import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  evaluateMultiplayerProofRules,
  validateMultiplayerProofConfiguration,
  validateMultiplayerProofUpdate,
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

test("exact clock labels compare class, initial seconds, and increment seconds", () => {
  assert.equal(evaluateMultiplayerProofRules({
    expectedProvider: "lichess",
    rules: { timeControl: "Blitz 3+2" },
    game: baseGame,
  }).ok, true);
  assert.deepEqual(evaluateMultiplayerProofRules({
    expectedProvider: "lichess",
    rules: { timeControl: "Blitz 5+2" },
    game: baseGame,
  }).reasons, ["time_control_mismatch"]);
  assert.equal(evaluateMultiplayerProofRules({
    expectedProvider: "chesscom",
    rules: { timeControl: "Rapid 10+5" },
    game: { ...baseGame, provider: "chesscom", timeControl: "rapid", initialSeconds: 600, incrementSeconds: 5 },
  }).ok, true);
});

test("legacy class-only clock labels remain accepted", () => {
  assert.equal(evaluateMultiplayerProofRules({
    expectedProvider: "lichess",
    rules: { timeControl: "Blitz" },
    game: { ...baseGame, initialSeconds: undefined, incrementSeconds: undefined },
  }).ok, true);
});

test("present invalid rules fail closed with stable invalid_rule diagnostics", () => {
  for (const rules of [
    { timeControl: "Blitz someday" },
    { rated: "Sometimes rated" },
    { color: "Green only" },
    { result: "Maybe win" },
  ] as Array<Record<string, string>>) {
    assert.deepEqual(evaluateMultiplayerProofRules({ expectedProvider: "lichess", rules, game: baseGame }).reasons, ["invalid_rule"]);
  }
  assert.equal(evaluateMultiplayerProofRules({ expectedProvider: "lichess", game: baseGame }).ok, true);
});

test("present invalid quest dates fail closed while missing legacy dates remain accepted", () => {
  assert.deepEqual(evaluateMultiplayerProofRules({ expectedProvider: "lichess", startAt: "not-a-date", game: baseGame }).reasons, ["invalid_date"]);
  assert.deepEqual(evaluateMultiplayerProofRules({ expectedProvider: "lichess", endAt: "2026-99-99", game: baseGame }).reasons, ["invalid_date"]);
  assert.equal(evaluateMultiplayerProofRules({ expectedProvider: "lichess", game: baseGame }).ok, true);
});

test("create and update boundary validation normalizes supported values and rejects present invalid values", () => {
  assert.deepEqual(validateMultiplayerProofConfiguration({
    providerMode: "CHESSCOM",
    startAt: "2026-07-02 10:00:00Z",
    rules: { result: "win REQUIRED", timeControl: "rapid 10+5", rated: "CASUAL only", color: "black ONLY" },
  }), {
    ok: true,
    providerMode: "chesscom",
    startAt: "2026-07-02T10:00:00.000Z",
    rules: { result: "Win required", timeControl: "Rapid 10+5", rated: "Casual only", color: "Black only" },
  });
  assert.deepEqual(validateMultiplayerProofConfiguration({ providerMode: "other" }), { ok: false, code: "invalid_rule" });
  assert.deepEqual(validateMultiplayerProofConfiguration({ rules: { color: "green" } }), { ok: false, code: "invalid_rule" });
  assert.deepEqual(validateMultiplayerProofConfiguration({ endAt: "tomorrow-ish" }), { ok: false, code: "invalid_date" });
  assert.equal(validateMultiplayerProofConfiguration({}).ok, true);
});

test("rejects calendar-rollover and non-increasing proof windows at normalization boundaries", () => {
  assert.deepEqual(validateMultiplayerProofConfiguration({ startAt: "2026-02-30T10:00:00.000Z" }), { ok: false, code: "invalid_date" });
  assert.deepEqual(validateMultiplayerProofConfiguration({ startAt: "2026-07-02T11:00:00.000Z", endAt: "2026-07-02T11:00:00.000Z" }), { ok: false, code: "invalid_date" });
  assert.deepEqual(validateMultiplayerProofConfiguration({ startAt: "2026-07-02T12:00:00.000Z", endAt: "2026-07-02T11:00:00.000Z" }), { ok: false, code: "invalid_date" });
});

test("partial update validation combines a requested start with the existing end", () => {
  assert.deepEqual(validateMultiplayerProofUpdate(
    { startAt: "2026-07-03T00:00:00.000Z" },
    { startAt: "2026-07-01T00:00:00.000Z", endAt: "2026-07-02T00:00:00.000Z" },
  ), { ok: false, code: "invalid_date" });
});

test("partial update validation combines a requested end with the existing start", () => {
  assert.deepEqual(validateMultiplayerProofUpdate(
    { endAt: "2026-06-30T00:00:00.000Z" },
    { startAt: "2026-07-01T00:00:00.000Z", endAt: "2026-07-02T00:00:00.000Z" },
  ), { ok: false, code: "invalid_date" });
});

test("web and mobile update routes validate the combined window after quest lookup", async () => {
  const [web, mobile] = await Promise.all([
    readFile(new URL("../src/app/api/groupquests/[id]/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/app/api/mobile/groupquests/[id]/route.ts", import.meta.url), "utf8"),
  ]);
  assert.ok(web.indexOf("validateMultiplayerProofUpdate(payload") > web.indexOf("findGroupQuestById(client, id)"));
  assert.ok(mobile.indexOf("validateMultiplayerProofUpdate(payload") > mobile.indexOf("const found ="));
});

test("evaluator reports stable invalid_date for rollover and non-increasing windows", () => {
  assert.deepEqual(evaluateMultiplayerProofRules({ expectedProvider: "lichess", startAt: "2026-02-30T10:00:00.000Z", game: baseGame }).reasons, ["invalid_date"]);
  assert.deepEqual(evaluateMultiplayerProofRules({ expectedProvider: "lichess", startAt: "2026-07-02T11:00:00.000Z", endAt: "2026-07-02T11:00:00.000Z", game: baseGame }).reasons, ["invalid_date"]);
  assert.deepEqual(evaluateMultiplayerProofRules({ expectedProvider: "lichess", startAt: "2026-07-02T12:00:00.000Z", endAt: "2026-07-02T11:00:00.000Z", game: baseGame }).reasons, ["invalid_date"]);
});

test("normalizes valid no-increment clocks to an explicit zero", () => {
  const lichess = normalizeLatestLichessGameMetadata({
    id: "no-inc", speed: "blitz", rated: true, variant: "standard", clock: { initial: 180 },
    lastMoveAt: Date.parse("2026-07-02T10:00:00.000Z"), status: "mate", winner: "white",
    players: { white: { user: { name: "Alice" } }, black: { user: { name: "Bob" } } },
  }, "alice");
  const chesscom = normalizeLatestChessComGameMetadata({
    url: "https://www.chess.com/game/live/43", end_time: Date.parse("2026-07-02T10:00:00.000Z") / 1000,
    rules: "chess", time_class: "blitz", time_control: "180", rated: true,
    white: { username: "Alice", result: "win" }, black: { username: "Bob", result: "resigned" },
  }, "alice");
  assert.equal(lichess?.incrementSeconds, 0);
  assert.equal(chesscom?.incrementSeconds, 0);
});

test("Chess.com accepts explicit live clock formats and rejects malformed or correspondence clocks for exact matching", () => {
  const fixture = (time_control: string) => normalizeLatestChessComGameMetadata({
    url: "https://www.chess.com/game/live/44", end_time: Date.parse("2026-07-02T10:00:00.000Z") / 1000,
    rules: "chess", time_class: "rapid", time_control, rated: true,
    white: { username: "Alice", result: "win" }, black: { username: "Bob", result: "resigned" },
  }, "alice");
  assert.deepEqual([fixture("600+5")?.initialSeconds, fixture("600+5")?.incrementSeconds], [600, 5]);
  for (const malformed of ["600+", "10 min", "1/259200"]) {
    const game = fixture(malformed);
    assert.deepEqual(evaluateMultiplayerProofRules({ expectedProvider: "chesscom", rules: { timeControl: "Rapid 10+5" }, game }).reasons, ["metadata_missing"]);
    assert.equal(evaluateMultiplayerProofRules({ expectedProvider: "chesscom", rules: { timeControl: "Rapid" }, game }).ok, true);
  }
});

test("realistic Chess.com daily and Lichess correspondence fixtures support any/class rules but reject exact clocks", () => {
  const chessComDaily = normalizeLatestChessComGameMetadata({
    url: "https://www.chess.com/game/daily/123456789", uuid: "daily-123456789",
    end_time: Date.parse("2026-07-02T10:00:00.000Z") / 1000, rules: "chess", time_class: "daily", time_control: "1/259200", rated: true,
    white: { username: "Alice", result: "win" }, black: { username: "Bob", result: "resigned" },
  }, "alice");
  const lichessCorrespondence = normalizeLatestLichessGameMetadata({
    id: "corr1234", speed: "correspondence", rated: true, variant: "standard", daysPerTurn: 3,
    lastMoveAt: Date.parse("2026-07-02T10:00:00.000Z"), status: "mate", winner: "white",
    players: { white: { user: { name: "Alice" } }, black: { user: { name: "Bob" } } },
  }, "alice");

  for (const [provider, game] of [["chesscom", chessComDaily], ["lichess", lichessCorrespondence]] as const) {
    assert.equal(game?.timeControl, "daily");
    assert.equal(evaluateMultiplayerProofRules({ expectedProvider: provider, rules: { timeControl: "Any time control" }, game }).ok, true);
    assert.equal(evaluateMultiplayerProofRules({ expectedProvider: provider, rules: { timeControl: "Daily" }, game }).ok, true);
    assert.deepEqual(
      evaluateMultiplayerProofRules({ expectedProvider: provider, rules: { timeControl: "Daily 4320+0" }, game }).reasons,
      ["metadata_missing"],
      "correspondence APIs do not expose a live initial+increment clock, so exact-clock proof must fail closed",
    );
  }
});

test("provider fixtures fail closed for variant and malformed timestamp and preserve draw/loss results", () => {
  const fixture = (overrides: Record<string, unknown>) => normalizeLatestChessComGameMetadata({
    url: "https://www.chess.com/game/live/45", end_time: Date.parse("2026-07-02T10:00:00.000Z") / 1000,
    rules: "chess", time_class: "rapid", time_control: "600+5", rated: true,
    white: { username: "Alice", result: "agreed" }, black: { username: "Bob", result: "agreed" },
    ...overrides,
  }, "alice");
  assert.equal(fixture({})?.result, "draw");
  assert.equal(fixture({ white: { username: "Alice", result: "resigned" }, black: { username: "Bob", result: "win" } })?.result, "lose");
  assert.deepEqual(evaluateMultiplayerProofRules({ expectedProvider: "chesscom", game: fixture({ rules: "chess960" }) }).reasons, ["variant_mismatch"]);
  assert.deepEqual(evaluateMultiplayerProofRules({ expectedProvider: "chesscom", game: fixture({ end_time: Number.NaN }) }).reasons, ["metadata_missing"]);
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
