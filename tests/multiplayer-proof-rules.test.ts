import assert from "node:assert/strict";
import test from "node:test";

import {
  evaluateMultiplayerProofRules,
  type MultiplayerGameMetadata,
} from "../src/lib/multiplayer-proof-rules";
import { normalizeLatestLichessGameMetadata } from "../src/lib/lichess";
import { normalizeLatestChessComGameMetadata } from "../src/lib/chesscom";

const baseGame: MultiplayerGameMetadata = {
  provider: "lichess",
  gameId: "game-1",
  gameUrl: "https://lichess.org/game-1",
  timeControl: "blitz",
  initialSeconds: 180,
  incrementSeconds: 2,
  rated: true,
  playerColor: "white",
  playedAt: "2026-07-02T10:00:00.000Z",
  variant: "standard",
  result: "win",
};

test("normalizes complete Lichess latest-game metadata", () => {
  assert.deepEqual(
    normalizeLatestLichessGameMetadata({
      id: "abc123",
      speed: "blitz",
      rated: true,
      variant: "standard",
      clock: { initial: 180, increment: 2 },
      createdAt: Date.parse("2026-07-02T09:55:00.000Z"),
      lastMoveAt: Date.parse("2026-07-02T10:00:00.000Z"),
      status: "mate",
      winner: "white",
      players: { white: { user: { name: "Alice" } }, black: { user: { name: "Bob" } } },
    }, "alice"),
    { ...baseGame, gameId: "abc123", gameUrl: "https://lichess.org/abc123" },
  );
});

test("normalizes complete Chess.com latest-game metadata", () => {
  assert.deepEqual(
    normalizeLatestChessComGameMetadata({
      url: "https://www.chess.com/game/live/42/",
      uuid: "uuid-42",
      end_time: Date.parse("2026-07-02T10:00:00.000Z") / 1000,
      rules: "chess",
      time_class: "rapid",
      time_control: "600+5",
      rated: false,
      white: { username: "Bob", result: "resigned" },
      black: { username: "Alice", result: "win" },
    }, "alice"),
    {
      provider: "chesscom",
      gameId: "https://www.chess.com/game/live/42",
      gameUrl: "https://www.chess.com/game/live/42",
      timeControl: "rapid",
      initialSeconds: 600,
      incrementSeconds: 5,
      rated: false,
      playerColor: "black",
      playedAt: "2026-07-02T10:00:00.000Z",
      variant: "standard",
      result: "win",
    },
  );
});

test("accepts metadata matching every selected multiplayer rule", () => {
  assert.deepEqual(evaluateMultiplayerProofRules({
    expectedProvider: "lichess",
    rules: { result: "Win required", timeControl: "Blitz", rated: "Rated only", color: "White only" },
    startAt: "2026-07-02T09:00:00.000Z",
    endAt: "2026-07-02T11:00:00.000Z",
    game: baseGame,
  }), { ok: true, reasons: [], summary: "Latest game matches all selected Multiplayer proof rules." });
});

test("returns stable reasons for every selected-rule mismatch", () => {
  const decision = evaluateMultiplayerProofRules({
    expectedProvider: "chesscom",
    rules: { result: "Win required", timeControl: "Rapid", rated: "Casual only", color: "Black only" },
    startAt: "2026-07-02T10:30:00.000Z",
    endAt: "2026-07-02T11:00:00.000Z",
    game: { ...baseGame, variant: "chess960", result: "draw" },
  });
  assert.equal(decision.ok, false);
  assert.deepEqual(decision.reasons, [
    "provider_mismatch",
    "time_control_mismatch",
    "rated_state_mismatch",
    "player_color_mismatch",
    "variant_mismatch",
    "outside_time_window",
    "result_mismatch",
  ]);
  assert.match(decision.summary, /Play a new public game matching every selected rule/);
});

test("fails closed when latest-game metadata is unknown or malformed", () => {
  const decision = evaluateMultiplayerProofRules({
    expectedProvider: "lichess",
    rules: { result: "Any result", timeControl: "Any time control", rated: "Any rated state", color: "Any color" },
    game: {
      ...baseGame,
      gameUrl: "",
      timeControl: "unknown",
      rated: null,
      playerColor: null,
      playedAt: "not-a-date",
      variant: null,
      result: "unknown",
    },
  });
  assert.deepEqual(decision.reasons, ["metadata_missing"]);
});

test("fails closed when there is no eligible latest game", () => {
  assert.deepEqual(evaluateMultiplayerProofRules({ expectedProvider: "chesscom", game: null }), {
    ok: false,
    reasons: ["metadata_missing"],
    summary: "Latest game metadata is unavailable, so proof cannot be awarded. Play a new public standard game and refresh.",
  });
});
