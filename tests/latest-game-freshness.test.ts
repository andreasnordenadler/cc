import assert from "node:assert/strict";
import test, { type TestContext } from "node:test";
import { classifyChessComArchiveGameEvidence } from "../src/lib/custom-side-quests";
import { checkLatestChallengeForProvider, getLatestFinishedGameVerdict, type SupportedLatestChallengeProvider } from "../src/lib/challenge-latest-verifiers";

// Only the provider transport is replaced: all parsing, verdicts, metadata and
// enrichment run through the production implementations. No real accounts/API.
function providerFixture(t: TestContext, provider: SupportedLatestChallengeProvider, username: string) {
  const state = { id: "100001", failure: "none" as "none" | "http" | "network", requests: 0 };
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async (input, options) => {
    state.requests += 1;
    assert.equal(options?.cache, "no-store");
    if (state.failure === "network") throw new Error("fixture offline");
    if (state.failure === "http") return new Response("unavailable", { status: 503 });
    const url = String(input);
    if (provider === "lichess") {
      assert.ok(url.startsWith(`https://lichess.org/api/games/user/${username}?`));
      return new Response(JSON.stringify({
        id: state.id, status: "mate", winner: "white", rated: true, speed: "blitz", variant: "standard",
        createdAt: Date.parse("2026-09-05T10:00:00Z"), lastMoveAt: Date.parse("2026-09-05T10:05:00Z"),
        moves: "e2e4 e7e5 d1h5 b8c6 f1c4 g8f6 h5f7",
        players: { white: { user: { name: username } }, black: { user: { name: "opponent" } } },
      }));
    }
    const archive = `https://api.chess.com/pub/player/${username}/games/2026/09`;
    if (url.endsWith("/games/archives")) {
      assert.equal(url, `https://api.chess.com/pub/player/${username}/games/archives`);
      return Response.json({ archives: [archive] });
    }
    assert.equal(url, archive);
    return Response.json({ games: [{
      url: `https://www.chess.com/game/live/${state.id}`,
      pgn: '[UTCDate "2026.09.05"]\n[UTCTime "10:00:00"]\n\n1. e4 e5 2. Qh5 Nc6 3. Bc4 Nf6 4. Qxf7# 1-0',
      end_time: Date.parse("2026-09-05T10:05:00Z") / 1000,
      rated: true, time_class: "blitz", time_control: "180", rules: "chess",
      white: { username, result: "win" }, black: { username: "opponent", result: "checkmated" },
    }] });
  };
  return {
    state,
    expectedId: () => provider === "lichess" ? state.id : `https://www.chess.com/game/live/${state.id}`,
  };
}

test("chesscom enrichment binds the exact validated replay, not just the game ID", async (t) => {
  const game = {
    url: "https://www.chess.com/game/live/100003",
    pgn: "1. d4 d5 2. Bf4 Nf6 3. e3 e6 4. Bd3 c5 1-0",
    end_time: Date.parse("2026-09-05T10:05:00Z") / 1000,
    rated: true, time_class: "blitz", time_control: "180", rules: "chess",
    white: { username: "enrich-player", result: "win" },
    black: { username: "opponent", result: "resigned" },
  };
  const differentReplay = { ...game, pgn: "1. e4 e5 2. Nf3 Nc6 1-0" };
  assert.equal(classifyChessComArchiveGameEvidence(game, "enrich-player").kind, "known-standard");
  assert.equal(classifyChessComArchiveGameEvidence(differentReplay, "enrich-player").kind, "known-standard");
  let archiveReads = 0;
  let replacement = differentReplay;
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const archive = "https://api.chess.com/pub/player/enrich-player/games/2026/09";
    if (String(input).endsWith("/games/archives")) return Response.json({ archives: [archive] });
    assert.equal(String(input), archive);
    return Response.json({ games: [++archiveReads % 2 === 1 ? game : replacement] });
  });
  const check = () => checkLatestChallengeForProvider({ provider: "chesscom", username: "enrich-player", challengeId: "bishop-field-trip" });
  const mismatched = await check();
  assert.equal(mismatched.status, "passed", "the original bishop replay passes");
  assert.equal(mismatched.finalPositionFen, undefined, "a second valid replay cannot supply the board");
  assert.equal(mismatched.lastMoveUci, undefined);
  assert.equal(mismatched.metadata, undefined, "same ID cannot authorize enrichment metadata");
  replacement = { ...game, pgn: game.pgn.replace("d4", "d4 {same validated replay}") };
  const matched = await check();
  assert.equal(matched.status, "passed");
  assert.ok(matched.finalPositionFen, "equivalent validated replay still enriches");
  assert.equal(matched.lastMoveUci, "c7c5");
  assert.equal(matched.metadata?.gameId, game.url);
  assert.equal(archiveReads, 4);
});

for (const provider of ["lichess", "chesscom"] as const) {
  test(`${provider} latest-game metadata advances from A to B in the same worker`, async (t) => {
    const { state, expectedId } = providerFixture(t, provider, "fresh-player");
    const first = await getLatestFinishedGameVerdict(provider, "fresh-player");
    assert.equal(first.status, "passed");
    assert.equal(first.gameId, expectedId());
    state.id = "100002";
    const second = await getLatestFinishedGameVerdict(provider, "fresh-player");
    assert.equal(second.status, "passed");
    assert.equal(second.gameId, expectedId());
    assert.equal(second.metadata?.gameId, expectedId());
    assert.equal(state.requests, provider === "lichess" ? 2 : 4);
  });

  for (const failure of ["http", "network"] as const) {
    test(`${provider} recovers from ${failure} failure without replacing the worker`, async (t) => {
      const username = `recover-${failure}`;
      const { state, expectedId } = providerFixture(t, provider, username);
      state.failure = failure;
      assert.equal((await getLatestFinishedGameVerdict(provider, username)).status, "pending");
      state.failure = "none";
      const recovered = await getLatestFinishedGameVerdict(provider, username);
      assert.equal(recovered.status, "passed");
      assert.equal(recovered.metadata?.gameId, expectedId());
    });
  }

  test(`${provider} does not reuse game A metadata when enriching a later challenge check`, async (t) => {
    const { state, expectedId } = providerFixture(t, provider, "enrich-player");
    await getLatestFinishedGameVerdict(provider, "enrich-player");
    state.id = "100002";
    const result = await checkLatestChallengeForProvider({ provider, username: "enrich-player", challengeId: "finish-any-game" });
    assert.equal(result.status, "passed");
    assert.equal(result.gameId, expectedId());
    assert.equal(result.metadata?.gameId, expectedId());
    // One original lookup, the challenge verifier, and its fresh enrichment.
    assert.equal(state.requests, provider === "lichess" ? 3 : 6);
  });
}
