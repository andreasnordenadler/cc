import assert from "node:assert/strict";
import test from "node:test";

import { checkLatestGroupQuestChallenge } from "../src/lib/groupquest-proof";

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" } });
}

test("Lichess matching selected rules preserves successful proof semantics", async (t) => {
  t.mock.method(globalThis, "fetch", async () => new Response(`${JSON.stringify({
    id: "li-match",
    status: "mate",
    winner: "white",
    speed: "blitz",
    rated: true,
    variant: "standard",
    clock: { initial: 180, increment: 2 },
    createdAt: Date.parse("2026-07-02T09:55:00.000Z"),
    lastMoveAt: Date.parse("2026-07-02T10:00:00.000Z"),
    players: { white: { user: { name: "RuleAlice" } }, black: { user: { name: "Bob" } } },
    moves: "e2e4 e7e5",
  })}\n`, { status: 200 }));

  const result = await checkLatestGroupQuestChallenge({
    challengeId: "finish-any-game",
    provider: "lichess",
    username: "RuleAlice",
    startAt: "2026-07-02T09:00:00.000Z",
    endAt: "2026-07-02T11:00:00.000Z",
    rules: { result: "Win required", timeControl: "Blitz", rated: "Rated only", color: "White only" },
  });
  assert.equal(result.status, "passed");
  assert.deepEqual(result.mismatchReasons, []);
  assert.equal(result.gameUrl, "https://lichess.org/li-match");
});

test("Chess.com mismatching selected rules returns machine-readable reasons", async (t) => {
  t.mock.method(globalThis, "fetch", async (url: string | URL | Request) => String(url).endsWith("/archives")
    ? jsonResponse({ archives: ["https://api.chess.com/pub/player/rulecarol/games/2026/07"] })
    : jsonResponse({ games: [{
      url: "https://www.chess.com/game/live/99",
      end_time: Date.parse("2026-07-02T10:00:00.000Z") / 1000,
      rules: "chess",
      time_class: "rapid",
      time_control: "600+5",
      rated: false,
      white: { username: "RuleCarol", result: "agreed" },
      black: { username: "Dan", result: "agreed" },
      pgn: "[UTCDate \"2026.07.02\"]\n[UTCTime \"09:50:00\"]\n\n1. e4 e5 1/2-1/2",
    }] }));

  const result = await checkLatestGroupQuestChallenge({
    challengeId: "finish-any-game",
    provider: "chesscom",
    username: "RuleCarol",
    startAt: "2026-07-02T09:00:00.000Z",
    endAt: "2026-07-02T11:00:00.000Z",
    rules: { result: "Win required", timeControl: "Blitz", rated: "Rated only", color: "Black only" },
  });
  assert.equal(result.status, "failed");
  assert.deepEqual(result.mismatchReasons, ["time_control_mismatch", "rated_state_mismatch", "player_color_mismatch", "result_mismatch"]);
  assert.match(result.summary, /Proof was not awarded/);
});

test("Chess.com Multiplayer proof cannot borrow rule metadata from a different replay at the same URL", async (t) => {
  const archive = "https://api.chess.com/pub/player/rulecarol/games/2026/07";
  const original = {
    url: "https://www.chess.com/game/live/100001",
    end_time: Date.parse("2026-07-02T10:00:00.000Z") / 1000,
    rules: "chess",
    time_class: "blitz",
    time_control: "180",
    rated: false,
    white: { username: "RuleCarol", result: "win" },
    black: { username: "Dan", result: "checkmated" },
    pgn: "[Result \"1-0\"]\n\n1. e4 e5 2. Qh5 Nc6 3. Bc4 Nf6 4. Qxf7# 1-0",
  };
  const conflicting = {
    ...original,
    rated: true,
    black: { username: "Dan", result: "resigned" },
    pgn: "[Result \"1-0\"]\n\n1. d4 d5 2. Bf4 Nf6 3. e3 e6 4. Bd3 c5 1-0",
  };
  let archiveReads = 0;
  t.mock.method(globalThis, "fetch", async (url: string | URL | Request) => String(url).endsWith("/archives")
    ? jsonResponse({ archives: [archive] })
    : jsonResponse({ games: [++archiveReads === 1 ? original : conflicting] }));

  const result = await checkLatestGroupQuestChallenge({
    challengeId: "custom-rule-binding",
    customQuest: {
      id: "custom-rule-binding",
      title: "Rule binding",
      summary: "Win without borrowing provider facts.",
      config: JSON.stringify({ version: 1, logic: "all", blocks: [{ type: "gameResult", result: "win" }] }),
    },
    provider: "chesscom",
    username: "RuleCarol",
    startAt: "2026-07-02T09:00:00.000Z",
    endAt: "2026-07-02T11:00:00.000Z",
    rules: { rated: "Rated only" },
  });

  assert.equal(archiveReads, 2);
  assert.equal(result.status, "pending");
  assert.match(result.summary, /metadata/i);
});

test("failed custom Multiplayer attempts stay definitive across providers", async (t) => {
  const chessComArchive = "https://api.chess.com/pub/player/rulealice/games/2026/07";
  const chessComGame = {
    url: "https://www.chess.com/game/live/100004",
    end_time: Date.parse("2026-07-02T10:00:00.000Z") / 1000,
    rules: "chess",
    time_class: "blitz",
    time_control: "180",
    rated: true,
    white: { username: "RuleAlice", result: "win" },
    black: { username: "Bob", result: "checkmated" },
    pgn: "[Result \"1-0\"]\n\n1. e4 e5 2. Bc4 Nc6 3. Qh5 Nf6 4. Qxf7# 1-0",
  };
  const lichessGame = {
    id: "liFail01",
    status: "mate",
    winner: "white",
    speed: "blitz",
    rated: true,
    variant: "standard",
    clock: { initial: 180, increment: 0 },
    createdAt: Date.parse("2026-07-02T09:55:00.000Z"),
    lastMoveAt: Date.parse("2026-07-02T10:00:00.000Z"),
    players: { white: { user: { name: "RuleAlice" } }, black: { user: { name: "Bob" } } },
    moves: "e2e4 e7e5 f1c4 b8c6 d1h5 g8f6 h5f7",
  };
  t.mock.method(globalThis, "fetch", async (url: string | URL | Request) => {
    const target = String(url);
    if (target.includes("lichess.org")) return new Response(`${JSON.stringify(lichessGame)}\n`, { status: 200 });
    if (target.endsWith("/archives")) return jsonResponse({ archives: [chessComArchive] });
    assert.equal(target, chessComArchive);
    return jsonResponse({ games: [chessComGame] });
  });

  for (const provider of ["lichess", "chesscom"] as const) {
    const result = await checkLatestGroupQuestChallenge({
      challengeId: `custom-${provider}-failure`,
      customQuest: {
        id: `custom-${provider}-failure`,
        title: "Lose this game",
        summary: "Lose one public game.",
        config: JSON.stringify({ version: 1, logic: "all", blocks: [{ type: "gameResult", result: "lose" }] }),
      },
      provider,
      username: "RuleAlice",
      startAt: "2026-07-02T09:00:00.000Z",
      endAt: "2026-07-02T11:00:00.000Z",
      rules: { result: "Any result", timeControl: "Blitz", rated: "Rated only", color: "White only" },
    });

    assert.equal(result.status, "failed", `${provider}: ${result.summary}`);
    assert.match(result.summary, /not completed/i, provider);
    assert.equal(result.gameUrl, provider === "lichess" ? "https://lichess.org/liFail01" : chessComGame.url);
  }
});

test("Back Rank Goblin preserves Win-required Chess.com Multiplayer proof", async (t) => {
  const archive = "https://api.chess.com/pub/player/rulealice/games/2026/07";
  const game = {
    url: "https://www.chess.com/game/live/100002",
    end_time: Date.parse("2026-07-02T10:00:00.000Z") / 1000,
    rules: "chess",
    time_class: "blitz",
    time_control: "180",
    rated: true,
    white: { username: "RuleAlice", result: "win" },
    black: { username: "Bob", result: "checkmated" },
    pgn: "[Result \"1-0\"]\n\n1. e4 d5 2. exd5 Qxd5 3. Nc3 Qa5 4. Nf3 e5 5. Nxe5 Nf6 6. Bc4 Be7 7. O-O O-O 8. Re1 a6 9. Bb3 Qc5 10. Nc4 Bd6 11. Nxd6 cxd6 12. d3 Nh5 13. h3 Re8 14. Rxe8# 1-0",
  };
  let archiveReads = 0;
  t.mock.method(globalThis, "fetch", async (url: string | URL | Request) => String(url).endsWith("/archives")
    ? jsonResponse({ archives: [archive] })
    : (archiveReads += 1, jsonResponse({ games: [game] })));

  const result = await checkLatestGroupQuestChallenge({
    challengeId: "back-rank-goblin",
    provider: "chesscom",
    username: "RuleAlice",
    startAt: "2026-07-02T09:00:00.000Z",
    endAt: "2026-07-02T11:00:00.000Z",
    rules: { result: "Win required", timeControl: "Blitz", rated: "Rated only", color: "White only" },
  });

  assert.equal(archiveReads, 2);
  assert.equal(result.status, "passed");
  assert.equal(result.outcome, "win");
  assert.deepEqual(result.mismatchReasons, []);
});

test("failed quest attempts still report mismatched Multiplayer table rules", async (t) => {
  t.mock.method(globalThis, "fetch", async () => new Response(`${JSON.stringify({
    id: "li-quest-fail-table-mismatch",
    status: "mate",
    winner: "white",
    speed: "rapid",
    rated: false,
    variant: "standard",
    clock: { initial: 600, increment: 5 },
    createdAt: Date.parse("2026-07-02T09:55:00.000Z"),
    lastMoveAt: Date.parse("2026-07-02T10:00:00.000Z"),
    players: { white: { user: { name: "RuleAlice" } }, black: { user: { name: "Bob" } } },
    moves: "e2e4 e7e5 g1f3 b8c6 f1c4 g8f6 d2d3 f8c5 c2c3 d7d6 b2b4 c5b6 a2a4 a7a6",
  })}\n`, { status: 200 }));

  const result = await checkLatestGroupQuestChallenge({
    challengeId: "queen-never-heard-of-her",
    provider: "lichess",
    username: "RuleAlice",
    startAt: "2026-07-02T09:00:00.000Z",
    endAt: "2026-07-02T11:00:00.000Z",
    rules: { timeControl: "Blitz", rated: "Rated only", color: "Black only" },
  });

  assert.equal(result.status, "failed");
  assert.deepEqual(result.mismatchReasons, ["time_control_mismatch", "rated_state_mismatch", "player_color_mismatch"]);
  assert.match(result.summary, /Proof was not awarded/);
  assert.equal(result.failureDiagnostic?.label, "Latest checked position");
});

test("first-break quest diagnostics do not bypass Multiplayer table rule checks", async (t) => {
  let requests = 0;
  t.mock.method(globalThis, "fetch", async () => {
    requests += 1;
    return new Response(`${JSON.stringify({
      id: "li-first-break-table-mismatch",
      status: "mate",
      winner: "white",
      speed: "rapid",
      rated: false,
      variant: "standard",
      clock: { initial: 600, increment: 5 },
      createdAt: Date.parse("2026-07-02T09:55:00.000Z"),
      lastMoveAt: Date.parse("2026-07-02T10:00:00.000Z"),
      players: { white: { user: { name: "RuleAlice" } }, black: { user: { name: "Bob" } } },
      moves: "e2e4 e7e5 g1f3 b8c6 f1c4 g8f6 e1g1 f8c5 d2d3 e8g8 c2c3 d7d6 b1d2 c8g4 h2h3 g4h5 b2b4 c5b6 a2a4",
    })}\n`, { status: 200 });
  });

  const result = await checkLatestGroupQuestChallenge({
    challengeId: "no-castle-club",
    provider: "lichess",
    username: "RuleAlice",
    startAt: "2026-07-02T09:00:00.000Z",
    endAt: "2026-07-02T11:00:00.000Z",
    rules: { timeControl: "Blitz", rated: "Rated only", color: "Black only" },
  });

  assert.equal(requests, 2, "the first-break verdict must still load provider rule metadata");
  assert.equal(result.status, "failed");
  assert.deepEqual(result.mismatchReasons, ["time_control_mismatch", "rated_state_mismatch", "player_color_mismatch"]);
  assert.equal(result.failureDiagnostic?.label, "Castling broke the condition");
  assert.equal(result.failureDiagnostic?.ply, 7);
});
