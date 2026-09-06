import assert from "node:assert/strict";
import test from "node:test";
import { checkLatestCustomSideQuestForProvider, checkSubmittedCustomSideQuestForProvider, type CustomSideQuestRuleBlock } from "../src/lib/custom-side-quests";

const goneQueen: CustomSideQuestRuleBlock = { type: "pieceState", piece: "queen", owner: "my", condition: "gone" };

for (const provider of ["lichess", "chesscom"] as const) {
  for (const entry of ["latest", "submitted"] as const) {
    for (const sample of [
      { name: "empty", moves: "", expected: "pending" },
      { name: "illegal intermediate SAN", moves: "e4 e5 NotAMove Nf3", expected: "pending" },
      { name: "illegal terminal SAN", moves: "e4 e5 Nf3 NotAMove", expected: "pending" },
      { name: "valid legal SAN", moves: "e4 e5 Nf3", expected: "passed" },
      ...(provider === "lichess" ? [
        { name: "illegal UCI", moves: "e2e4 e7e5 e4e6", expected: "pending" },
        { name: "valid legal UCI", moves: "e2e4 e7e5 g1f3", expected: "passed" },
      ] : []),
    ]) {
      test(`${provider} ${entry}: ${sample.name} cannot bypass the replay gate through negation or any logic`, async (t) => {
        const gameId = provider === "lichess" ? "Replay01" : "https://www.chess.com/game/live/123456";
        const archive = "https://api.chess.com/pub/player/alice/games/2026/09";
        t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
          if (provider === "lichess") return Response.json({
            id: gameId, status: "resign", winner: "white", moves: sample.moves,
            players: { white: { user: { name: "alice" } }, black: { user: { name: "bob" } } },
          });
          if (String(input).endsWith("/archives")) return Response.json({ archives: [archive] });
          assert.equal(String(input), archive);
          return Response.json({ games: [{
            url: gameId, pgn: `[Event "Replay"]\n\n${sample.moves} 1-0`, end_time: 1788650000,
            white: { username: "alice", result: "win" }, black: { username: "bob", result: "resigned" },
          }] });
        });
        const quest = { id: "custom-replay", title: "Replay", config: JSON.stringify({ version: 2, logic: "any", blocks: [
          { type: "pieceState", piece: "queen", owner: "my", condition: "moved", negate: true },
          { type: "gameResult", result: "win" },
        ] }) };
        const input = { quest, provider, username: "alice", gameId };
        const verdict = entry === "latest" ? await checkLatestCustomSideQuestForProvider(input) : await checkSubmittedCustomSideQuestForProvider(input);
        assert.equal(verdict.status, sample.expected);
        assert.equal(verdict.gameId, gameId);
        if (sample.expected === "pending") {
          assert.equal(verdict.finalPositionFen, undefined);
          assert.equal(verdict.failureDiagnostic, undefined);
          assert.equal(verdict.completedGameAt, undefined);
        } else {
          assert.ok(verdict.finalPositionFen);
        }
      });
    }
  }
}

test("illegal intermediate replay cannot prove a winning result", async (t) => {
  t.mock.method(globalThis, "fetch", async () => Response.json({
    id: "Replay01", status: "resign", winner: "white", moves: "e4 e5 NotAMove Nf3",
    players: { white: { user: { name: "alice" } }, black: { user: { name: "bob" } } },
  }));
  const result = await checkSubmittedCustomSideQuestForProvider({
    quest: { id: "custom-replay", title: "Replay", config: JSON.stringify({ version: 2, logic: "all", blocks: [{ type: "gameResult", result: "win" }] }) },
    provider: "lichess", username: "alice", gameId: "Replay01",
  });
  assert.equal(result.status, "pending");
  assert.equal(result.finalPositionFen, undefined);
});

test("empty finished replay cannot prove an absent queen", async (t) => {
  t.mock.method(globalThis, "fetch", async () => Response.json({
    id: "Replay01", status: "resign", winner: "white", moves: "",
    players: { white: { user: { name: "alice" } }, black: { user: { name: "bob" } } },
  }));
  const result = await checkSubmittedCustomSideQuestForProvider({
    quest: { id: "custom-replay", title: "Replay", config: JSON.stringify({ version: 2, logic: "all", blocks: [goneQueen] }) },
    provider: "lichess", username: "alice", gameId: "Replay01",
  });
  assert.equal(result.status, "pending");
  assert.equal(result.finalPositionFen, undefined);
});
