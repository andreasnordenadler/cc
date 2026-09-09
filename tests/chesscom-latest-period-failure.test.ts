import assert from "node:assert/strict";
import test from "node:test";
import { Chess } from "chess.js";

import { checkLatestChessComBackRankGoblin } from "../src/lib/back-rank-goblin";
import { checkLatestCustomSideQuestForProvider, checkSubmittedCustomSideQuestForProvider, classifyChessComArchiveGameEvidence, normalizeChessComArchiveUrls } from "../src/lib/custom-side-quests";
import { normalizeLichessPawnStormManiacGame } from "../src/lib/pawn-storm-maniac";
import {
  checkLatestChessComBishopFieldTrip,
  checkLatestChessComBlunderGambit,
  checkLatestChessComEarlyKingWalk,
  checkLatestChessComFinishedGame,
  checkLatestChessComKnightmareMode,
  checkLatestChessComKnightsBeforeCoffee,
  checkLatestChessComNoCastleClub,
  checkLatestChessComOneBishopToRuleThemAll,
  checkLatestChessComPawnOnlyPicnic,
  checkLatestChessComPawnStormManiac,
  checkLatestChessComQueenNeverHeardOfHer,
  checkLatestChessComRooklessRampage,
  normalizeChessComBishopFieldTripGame,
  normalizeChessComKnightmareModeGame,
  normalizeChessComOneBishopToRuleThemAllGame,
  normalizeChessComPawnStormManiacGame,
  normalizeChessComRooklessRampageGame,
  verifyChessComDrawAnyGameAttempt,
  verifyChessComDrawAsBlackAttempt,
  verifyChessComDrawAsWhiteAttempt,
  verifyChessComFinishAnyGameAttempt,
  verifyChessComFinishAsBlackAttempt,
  verifyChessComFinishAsWhiteAttempt,
  verifyChessComLoseAnyGameAttempt,
  verifyChessComLoseAsBlackAttempt,
  verifyChessComLoseAsWhiteAttempt,
  verifyChessComWinAsBlackAttempt,
  verifyChessComWinAsWhiteAttempt,
} from "../src/lib/chesscom";

const archiveIndexUrl = "https://api.chess.com/pub/player/alice/games/archives";
const olderArchiveUrl = "https://api.chess.com/pub/player/alice/games/2026/08";
const latestArchiveUrl = "https://api.chess.com/pub/player/alice/games/2026/09";

test("Chess.com archive ordering rejects noncanonical URL whitespace", () => {
  assert.equal(normalizeChessComArchiveUrls([
    olderArchiveUrl,
    `${latestArchiveUrl} `,
  ], "alice"), null);
});

test("Chess.com archive ordering rejects embedded URL controls", () => {
  assert.equal(normalizeChessComArchiveUrls([
    olderArchiveUrl,
    "https://api.chess.com/pub/player/alice/games/2026/\t09",
  ], "alice"), null);
});

test("Chess.com archive ordering rejects dot-segment path spellings", () => {
  assert.equal(normalizeChessComArchiveUrls([
    olderArchiveUrl,
    "https://api.chess.com/pub/player/alice/games/2026/08/../09",
  ], "alice"), null);
});

test("Chess.com archive ordering rejects explicit default ports", () => {
  assert.equal(normalizeChessComArchiveUrls([
    olderArchiveUrl,
    "https://api.chess.com:443/pub/player/alice/games/2026/09",
  ], "alice"), null);
});

test("Chess.com archive ordering rejects userinfo", () => {
  assert.equal(normalizeChessComArchiveUrls([
    olderArchiveUrl,
    "https://alice@api.chess.com/pub/player/alice/games/2026/09",
  ], "alice"), null);
});

test("Chess.com evidence binds validated PGN time to provider completion chronology", () => {
  const game = {
    url: "https://www.chess.com/game/live/123456",
    pgn: "[White \"alice\"]\n[Black \"bob\"]\n[UTCDate \"2026.09.01\"]\n[UTCTime \"09:55:00\"]\n[Result \"1-0\"]\n[Termination \"alice won by resignation\"]\n\n1. e4 e5 1-0",
    end_time: 1788256800,
    rules: "chess",
    white: { username: "alice", result: "win" },
    black: { username: "bob", result: "resigned" },
  };

  const accepted = classifyChessComArchiveGameEvidence(game, "alice");
  assert.equal(accepted.kind, "known-standard");
  if (accepted.kind !== "known-standard") return;
  assert.equal(accepted.startedGameAt, "2026-09-01T09:55:00.000Z");
  assert.equal(accepted.completedGameAt, "2026-09-01T10:00:00.000Z");

  const contradictory = classifyChessComArchiveGameEvidence({
    ...game,
    pgn: game.pgn.replace("2026.09.01", "2027.01.01"),
  }, "alice");
  assert.equal(contradictory.kind, "unknown");
});

test("Chess.com timestamp declarations must all agree with provider chronology", () => {
  const classify = (headers: string) => classifyChessComArchiveGameEvidence({
    url: "https://www.chess.com/game/live/123456",
    pgn: `${headers}\n\n1. e4 e5 1-0`,
    end_time: Date.parse("2026-09-02T00:05:00Z") / 1000,
    rules: "chess",
    white: { username: "alice", result: "win" },
    black: { username: "bob", result: "resigned" },
  }, "alice");
  const start = '[UTCDate "2026.09.01"]\n[UTCTime "23:55:00"]';
  const consistent = `${start}\n[Date "2026.09.01"]\n[StartTime "23:55:00"]\n[EndDate "2026.09.02"]\n[EndTime "00:05:00"]`;
  assert.equal(classify(consistent).kind, "known-standard", "cross-midnight completion is valid");
  assert.equal(classify(`${start}\n[EndTime "00:05:00"]`).kind, "known-standard", "EndTime uses the provider completion date, not the start date");
  assert.equal(classify('[EndDate "2026.09.02"]\n[EndTime "00:05:00"]').kind, "known-standard", "completion does not require start tags");
  for (const declaration of [
    '[Date "2027.01.01"]', '[StartTime "23:54:00"]',
    '[Date "2026.02.30"]', '[StartTime "24:00:00"]',
    '[EndDate "2026.09.01"]', '[EndTime "00:04:59"]',
    '[EndDate "2026.02.30"]', '[EndTime "24:00:00"]',
  ]) {
    assert.equal(classify(`${start}\n${declaration}`).kind, "unknown", declaration);
  }
  assert.equal(classify('[EndTime "00:06:00"]').kind, "unknown", "completion-only contradictions fail closed");
});

test("shared PGN parsing accepts multiline clock comments but not unseparated headers", () => {
  const classify = (pgn: string) => classifyChessComArchiveGameEvidence({
    url: "https://www.chess.com/game/live/123484",
    pgn,
    end_time: 1788256800,
    rules: "chess",
    white: { username: "alice", result: "win" },
    black: { username: "bob", result: "resigned" },
  }, "alice");
  assert.equal(classify("1. e4 e5 {\n[%clk 0:05:00]\n} 1-0").kind, "known-standard");
  assert.equal(classify('[White "alice"]\n1. e4 e5 1-0').kind, "unknown");
  assert.equal(classify('1. e4 e5\n[White "alice"]\n1-0').kind, "unknown");
  assert.equal(classify('[White "alice"]\n\n1. e4 e5 {\n[%clk 0:05:00]\n} 1-0').kind, "known-standard");
});

test("latest Chess.com proof ignores timestamp-like text inside PGN comments", async (t) => {
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const url = String(input);
    if (url === archiveIndexUrl) return Response.json({ archives: [latestArchiveUrl] });
    assert.equal(url, latestArchiveUrl);
    return Response.json({ games: [{
      url: "https://www.chess.com/game/live/123457",
      pgn: "1. e4 e5 { [UTCDate \"2027.01.01\"] } 1-0",
      end_time: 1788256800,
      rules: "chess",
      white: { username: "alice", result: "win" },
      black: { username: "bob", result: "resigned" },
    }] });
  });

  const result = await checkLatestChessComFinishedGame("alice");

  assert.equal(result.status, "passed");
  assert.equal(result.startedGameAt, undefined);
  assert.equal(result.completedGameAt, "2026-09-01T10:00:00.000Z");
});

test("Back Rank Goblin ignores timestamp-like text inside PGN comments", async (t) => {
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const url = String(input);
    if (url === archiveIndexUrl) return Response.json({ archives: [latestArchiveUrl] });
    assert.equal(url, latestArchiveUrl);
    return Response.json({ games: [{
      url: "https://www.chess.com/game/live/123458",
      pgn: "1. e4 d5 2. exd5 Qxd5 3. Nc3 Qa5 4. Nf3 e5 5. Nxe5 Nf6 6. Bc4 Be7 7. O-O O-O 8. Re1 a6 9. Bb3 Qc5 10. Nc4 Bd6 11. Nxd6 cxd6 12. d3 Nh5 13. h3 { [UTCDate \"2027-01-01\"] [UTCTime \"00:00:00\"] } Re8 14. Rxe8# 1-0",
      end_time: 1788256800,
      rules: "chess",
      white: { username: "alice", result: "win" },
      black: { username: "bob", result: "checkmated" },
    }] });
  });

  const result = await checkLatestChessComBackRankGoblin("alice");

  assert.equal(result.status, "passed");
  assert.equal(result.startedGameAt, undefined);
  assert.equal(result.completedGameAt, "2026-09-01T10:00:00.000Z");
});

test("latest Chess.com proof rejects an oversized authoritative archive response", async (t) => {
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const url = String(input);
    if (url === archiveIndexUrl) return Response.json({ archives: [latestArchiveUrl] });
    assert.equal(url, latestArchiveUrl);
    return new Response(JSON.stringify({ games: [{
      url: "https://www.chess.com/game/live/123459",
      pgn: "1. e4 e5 1-0",
      end_time: 1788256800,
      rules: "chess",
      white: { username: "alice", result: "win" },
      black: { username: "bob", result: "resigned" },
    }] }), {
      headers: { "content-length": "2000001", "content-type": "application/json" },
    });
  });

  const result = await checkLatestChessComFinishedGame("alice");

  assert.equal(result.status, "pending");
  assert.equal(result.gameId, "chesscom-latest-error");
});

test("Back Rank Goblin rejects an oversized authoritative Chess.com archive response", async (t) => {
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const url = String(input);
    if (url === archiveIndexUrl) return Response.json({ archives: [latestArchiveUrl] });
    assert.equal(url, latestArchiveUrl);
    return new Response(JSON.stringify({ games: [{
      url: "https://www.chess.com/game/live/123460",
      pgn: "1. e4 d5 2. exd5 Qxd5 3. Nc3 Qa5 4. Nf3 e5 5. Nxe5 Nf6 6. Bc4 Be7 7. O-O O-O 8. Re1 a6 9. Bb3 Qc5 10. Nc4 Bd6 11. Nxd6 cxd6 12. d3 Nh5 13. h3 Re8 14. Rxe8# 1-0",
      end_time: 1788256800,
      rules: "chess",
      white: { username: "alice", result: "win" },
      black: { username: "bob", result: "checkmated" },
    }] }), {
      headers: { "content-length": "2000001", "content-type": "application/json" },
    });
  });

  const result = await checkLatestChessComBackRankGoblin("alice");

  assert.equal(result.status, "pending");
  assert.equal(result.gameId, "chesscom-latest-error");
});

const latestChecks = [
  ["Back Rank Goblin", checkLatestChessComBackRankGoblin],
  ["Blunder Gambit", checkLatestChessComBlunderGambit],
  ["No Castle Club", checkLatestChessComNoCastleClub],
  ["Queen Never Heard of Her", checkLatestChessComQueenNeverHeardOfHer],
  ["Knights Before Coffee", checkLatestChessComKnightsBeforeCoffee],
  ["Pawn-Only Picnic", checkLatestChessComPawnOnlyPicnic],
  ["Early King Walk", checkLatestChessComEarlyKingWalk],
  ["One Bishop to Rule Them All", checkLatestChessComOneBishopToRuleThemAll],
  ["Rookless Rampage", checkLatestChessComRooklessRampage],
  ["Knightmare Mode", checkLatestChessComKnightmareMode],
  ["Pawn Storm Maniac", checkLatestChessComPawnStormManiac],
  ["Bishop Field Trip", checkLatestChessComBishopFieldTrip],
  ["finished-game verifier", checkLatestChessComFinishedGame],
] as const;

for (const [label, checkLatest] of latestChecks) {
  test(`${label} treats an empty newest Chess.com archive as authoritative`, async (t) => {
    const requested: string[] = [];
    t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
      const url = String(input);
      requested.push(url);
      if (url === archiveIndexUrl) return Response.json({ archives: [olderArchiveUrl, latestArchiveUrl] });
      if (url === latestArchiveUrl) return Response.json({ games: [] });
      if (url === olderArchiveUrl) return Response.json({ games: [{
        url: "https://www.chess.com/game/live/111111",
        pgn: "[Result \"1-0\"]\n\n1. e4 e5 1-0",
        end_time: 1788170400,
        rules: "chess",
        white: { username: "alice", result: "win" },
        black: { username: "bob", result: "resigned" },
      }] });
      throw new Error(`Unexpected request: ${url}`);
    });

    const result = await checkLatest("alice");

    assert.equal(result.status, "pending");
    assert.notEqual(result.gameId, "chesscom-latest-error");
    assert.deepEqual(requested, [archiveIndexUrl, latestArchiveUrl]);
  });
}

test("custom latest verifier treats an empty newest Chess.com archive as authoritative", async (t) => {
  const requested: string[] = [];
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const url = String(input);
    requested.push(url);
    if (url === archiveIndexUrl) return Response.json({ archives: [olderArchiveUrl, latestArchiveUrl] });
    if (url === latestArchiveUrl) return Response.json({ games: [] });
    if (url === olderArchiveUrl) return Response.json({ games: [{
      url: "https://www.chess.com/game/live/111111",
      pgn: "[Result \"1-0\"]\n\n1. e4 e5 1-0",
      end_time: 1788170400,
      rules: "chess",
      white: { username: "alice", result: "win" },
      black: { username: "bob", result: "resigned" },
    }] });
    throw new Error(`Unexpected request: ${url}`);
  });

  const result = await checkLatestCustomSideQuestForProvider({
    provider: "chesscom",
    username: "alice",
    quest: {
      id: "win-one",
      title: "Win one",
      config: JSON.stringify({ version: 1, logic: "all", blocks: [{ type: "gameResult", result: "win" }] }),
    },
  });

  assert.equal(result.status, "pending");
  assert.equal(result.gameId, "chesscom-custom-latest-empty");
  assert.match(result.summary, /latest public Chess\.com archive is empty/);
  assert.deepEqual(requested, [archiveIndexUrl, latestArchiveUrl]);
});

test("custom latest verifier does not call a missing Chess.com archive an empty month", async (t) => {
  const requested: string[] = [];
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const url = String(input);
    requested.push(url);
    assert.equal(url, archiveIndexUrl);
    return Response.json({ archives: [] });
  });

  const result = await checkLatestCustomSideQuestForProvider({
    provider: "chesscom",
    username: "alice",
    quest: {
      id: "win-one",
      title: "Win one",
      config: JSON.stringify({ version: 1, logic: "all", blocks: [{ type: "gameResult", result: "win" }] }),
    },
  });

  assert.equal(result.status, "pending");
  assert.equal(result.gameId, "chesscom-custom-latest-unavailable");
  assert.deepEqual(requested, [archiveIndexUrl]);
});

for (const [label, checkLatest] of latestChecks) {
  test(`${label} keeps latest Chess.com history unknown when the newest archive is unavailable`, async (t) => {
    const requested: string[] = [];
    t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
      const url = String(input);
      requested.push(url);
      if (url === archiveIndexUrl) {
        return Response.json({ archives: [olderArchiveUrl, latestArchiveUrl] });
      }
      if (url === latestArchiveUrl) {
        return new Response("upstream unavailable", { status: 503 });
      }
      if (url === olderArchiveUrl) {
        return Response.json({ games: [{
          url: "https://www.chess.com/game/live/111111",
          pgn: "[UTCDate \"2026.08.31\"]\n[UTCTime \"10:00:00\"]\n\n1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 1-0",
          end_time: 1788170400,
          rules: "chess",
          time_class: "blitz",
          time_control: "300",
          rated: true,
          white: { username: "alice", result: "win" },
          black: { username: "bob", result: "checkmated" },
        }] });
      }
      throw new Error(`Unexpected request: ${url}`);
    });

    const result = await checkLatest("alice");

    assert.equal(result.status, "pending");
    assert.equal(result.gameId, "chesscom-latest-error");
    assert.deepEqual(requested, [archiveIndexUrl, latestArchiveUrl]);
  });
}

for (const [label, checkLatest] of latestChecks) {
  test(`${label} does not search older history after a known nonempty Chess.com archive`, async (t) => {
    const requested: string[] = [];
    t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
      const url = String(input);
      requested.push(url);
      if (url === archiveIndexUrl) return Response.json({ archives: [olderArchiveUrl, latestArchiveUrl] });
      if (url === latestArchiveUrl) return Response.json({ games: [{
        url: "https://www.chess.com/game/live/123456",
        pgn: "[Variant \"Bughouse\"]\n[Result \"1-0\"]\n\n1. e4 e5 1-0",
        end_time: 1788256800,
        rules: "bughouse",
        time_class: "blitz",
        white: { username: "alice", result: "win" },
        black: { username: "bob", result: "resigned" },
      }] });
      if (url === olderArchiveUrl) return Response.json({ games: [] });
      throw new Error(`Unexpected request: ${url}`);
    });

    const result = await checkLatest("alice");

    assert.deepEqual(requested, [archiveIndexUrl, latestArchiveUrl]);
    assert.equal(result.status, label === "finished-game verifier" ? "passed" : "pending");
  });
}

test("a malformed newest Chess.com archive cannot authorize an older game", async (t) => {
  const requested: string[] = [];
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const url = String(input);
    requested.push(url);
    if (url === archiveIndexUrl) return Response.json({ archives: [olderArchiveUrl, latestArchiveUrl] });
    if (url === latestArchiveUrl) return Response.json({ games: ["invalid"] });
    if (url === olderArchiveUrl) return Response.json({ games: [{
      url: "https://www.chess.com/game/live/111111",
      pgn: "[UTCDate \"2026.08.31\"]\n[UTCTime \"10:00:00\"]\n\n1. e4 e5 1-0",
      end_time: 1788170400,
      white: { username: "alice", result: "win" },
      black: { username: "bob", result: "resigned" },
    }] });
    throw new Error(`Unexpected request: ${url}`);
  });

  const result = await checkLatestChessComFinishedGame("alice");

  assert.equal(result.status, "pending");
  assert.equal(result.gameId, "chesscom-latest-error");
  assert.deepEqual(requested, [archiveIndexUrl, latestArchiveUrl]);
});

test("a malformed sibling in the authoritative Chess.com month keeps a custom check unknown", async (t) => {
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const url = String(input);
    if (url === archiveIndexUrl) return Response.json({ archives: [latestArchiveUrl] });
    assert.equal(url, latestArchiveUrl);
    return Response.json({ games: [
      { url: "https://www.chess.com/game/live/broken", pgn: "garbage 1-0", end_time: 1788256799, rules: "chess", white: { username: "alice", result: "win" }, black: { username: "bob", result: "resigned" } },
      { url: "https://www.chess.com/game/live/123456", pgn: "1. e4 e5 1-0", end_time: 1788256800, rules: "chess", white: { username: "alice", result: "win" }, black: { username: "bob", result: "resigned" } },
    ] });
  });

  const result = await checkLatestCustomSideQuestForProvider({
    provider: "chesscom",
    username: "alice",
    quest: {
      id: "win-one",
      title: "Win one",
      config: JSON.stringify({ version: 1, logic: "all", blocks: [{ type: "gameResult", result: "win" }] }),
    },
  });

  assert.equal(result.status, "pending");
  assert.equal(result.gameId, "https://www.chess.com/game/live/123456");
  assert.deepEqual(result.evidence, ["Provider replay evidence was incomplete or inconsistent."]);
});

test("custom latest Chess.com proof chooses the newest completed game even when the archive is unsorted", async (t) => {
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const url = String(input);
    if (url === archiveIndexUrl) return Response.json({ archives: [latestArchiveUrl] });
    assert.equal(url, latestArchiveUrl);
    return Response.json({ games: [
      {
        url: "https://www.chess.com/game/live/222222",
        pgn: "[Result \"0-1\"]\n\n1. f3 e5 2. g4 Qh4# 0-1",
        end_time: 1788256800,
        rules: "chess",
        white: { username: "alice", result: "checkmated" },
        black: { username: "bob", result: "win" },
      },
      {
        url: "https://www.chess.com/game/live/111111",
        pgn: "[Result \"1-0\"]\n\n1. e4 e5 2. Qh5 Nc6 3. Bc4 Nf6 4. Qxf7# 1-0",
        end_time: 1788170400,
        rules: "chess",
        white: { username: "alice", result: "win" },
        black: { username: "bob", result: "checkmated" },
      },
    ] });
  });

  const result = await checkLatestCustomSideQuestForProvider({
    provider: "chesscom",
    username: "alice",
    quest: {
      id: "win-one",
      title: "Win one",
      config: JSON.stringify({ version: 1, logic: "all", blocks: [{ type: "gameResult", result: "win" }] }),
    },
  });

  assert.equal(result.status, "failed");
  assert.equal(result.gameId, "https://www.chess.com/game/live/222222");
});

test("conflicting duplicate Chess.com game identities keep latest proof unknown", async (t) => {
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const url = String(input);
    if (url === archiveIndexUrl) return Response.json({ archives: [latestArchiveUrl] });
    assert.equal(url, latestArchiveUrl);
    return Response.json({ games: [
      {
        url: "https://www.chess.com/game/live/222222",
        pgn: "[Result \"0-1\"]\n\n1. f3 e5 2. g4 Qh4# 0-1",
        end_time: 1788256800,
        rules: "chess",
        white: { username: "alice", result: "checkmated" },
        black: { username: "bob", result: "win" },
      },
      {
        url: "https://www.chess.com/game/live/222222",
        pgn: "[Result \"1-0\"]\n\n1. e4 e5 2. Qh5 Nc6 3. Bc4 Nf6 4. Qxf7# 1-0",
        end_time: 1788170400,
        rules: "chess",
        white: { username: "alice", result: "win" },
        black: { username: "bob", result: "checkmated" },
      },
    ] });
  });

  const result = await checkLatestCustomSideQuestForProvider({
    provider: "chesscom",
    username: "alice",
    quest: {
      id: "win-one",
      title: "Win one",
      config: JSON.stringify({ version: 1, logic: "all", blocks: [{ type: "gameResult", result: "win" }] }),
    },
  });

  assert.equal(result.status, "pending");
});

test("latest finished-game proof chooses the newest completed game when the archive is unsorted", async (t) => {
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const url = String(input);
    if (url === archiveIndexUrl) return Response.json({ archives: [latestArchiveUrl] });
    assert.equal(url, latestArchiveUrl);
    return Response.json({ games: [
      {
        url: "https://www.chess.com/game/live/222222",
        pgn: "[Result \"0-1\"]\n\n1. f3 e5 2. g4 Qh4# 0-1",
        end_time: 1788256800,
        rules: "chess",
        white: { username: "alice", result: "checkmated" },
        black: { username: "bob", result: "win" },
      },
      {
        url: "https://www.chess.com/game/live/111111",
        pgn: "[Result \"1-0\"]\n\n1. e4 e5 2. Qh5 Nc6 3. Bc4 Nf6 4. Qxf7# 1-0",
        end_time: 1788170400,
        rules: "chess",
        white: { username: "alice", result: "win" },
        black: { username: "bob", result: "checkmated" },
      },
    ] });
  });

  const result = await checkLatestChessComFinishedGame("alice");

  assert.equal(result.status, "passed");
  assert.equal(result.gameId, "https://www.chess.com/game/live/222222");
  assert.equal(result.outcome, "lose");
  assert.equal(result.completedGameAt, "2026-09-01T10:00:00.000Z");
});

test("equal newest Chess.com completion times keep every latest proof unknown", async (t) => {
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const url = String(input);
    if (url === archiveIndexUrl) return Response.json({ archives: [latestArchiveUrl] });
    assert.equal(url, latestArchiveUrl);
    return Response.json({ games: [
      {
        url: "https://www.chess.com/game/live/222222",
        pgn: "[Result \"0-1\"]\n\n1. f3 e5 2. g4 Qh4# 0-1",
        end_time: 1788256800,
        rules: "chess",
        white: { username: "alice", result: "checkmated" },
        black: { username: "bob", result: "win" },
      },
      {
        url: "https://www.chess.com/game/live/111111",
        pgn: "[Result \"1-0\"]\n\n1. e4 e5 2. Qh5 Nc6 3. Bc4 Nf6 4. Qxf7# 1-0",
        end_time: 1788256800,
        rules: "chess",
        white: { username: "alice", result: "win" },
        black: { username: "bob", result: "checkmated" },
      },
    ] });
  });

  const finished = await checkLatestChessComFinishedGame("alice");
  const backRank = await checkLatestChessComBackRankGoblin("alice");
  const custom = await checkLatestCustomSideQuestForProvider({
    provider: "chesscom",
    username: "alice",
    quest: {
      id: "win-one",
      title: "Win one",
      config: JSON.stringify({ version: 1, logic: "all", blocks: [{ type: "gameResult", result: "win" }] }),
    },
  });

  assert.equal(finished.status, "pending");
  assert.equal(finished.gameId, "chesscom-latest-error");
  assert.equal(backRank.status, "pending");
  assert.equal(backRank.gameId, "chesscom-latest-error");
  assert.equal(custom.status, "pending");
});

test("latest Chess.com proof sorts authenticated archive months before choosing authority", async (t) => {
  const requested: string[] = [];
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const url = String(input);
    requested.push(url);
    if (url === archiveIndexUrl) return Response.json({ archives: [latestArchiveUrl, olderArchiveUrl] });
    if (url === latestArchiveUrl) return Response.json({ games: [{
      url: "https://www.chess.com/game/live/333333",
      pgn: "[Result \"1-0\"]\n\n1. e4 e5 2. Qh5 Nc6 3. Bc4 Nf6 4. Qxf7# 1-0",
      end_time: 1788256800,
      rules: "chess",
      white: { username: "alice", result: "win" },
      black: { username: "bob", result: "checkmated" },
    }] });
    if (url === olderArchiveUrl) return Response.json({ games: [{
      url: "https://www.chess.com/game/live/222222",
      pgn: "[Result \"0-1\"]\n\n1. f3 e5 2. g4 Qh4# 0-1",
      end_time: 1788170400,
      rules: "chess",
      white: { username: "alice", result: "checkmated" },
      black: { username: "bob", result: "win" },
    }] });
    throw new Error(`Unexpected request: ${url}`);
  });

  const finished = await checkLatestChessComFinishedGame("alice");
  const backRank = await checkLatestChessComBackRankGoblin("alice");
  const custom = await checkLatestCustomSideQuestForProvider({
    provider: "chesscom",
    username: "alice",
    quest: {
      id: "win-one",
      title: "Win one",
      config: JSON.stringify({ version: 1, logic: "all", blocks: [{ type: "gameResult", result: "win" }] }),
    },
  });

  assert.equal(finished.gameId, "https://www.chess.com/game/live/333333");
  assert.equal(backRank.gameId, "https://www.chess.com/game/live/333333");
  assert.equal(custom.gameId, "https://www.chess.com/game/live/333333");
  assert.deepEqual(requested, [archiveIndexUrl, latestArchiveUrl, archiveIndexUrl, latestArchiveUrl, archiveIndexUrl, latestArchiveUrl]);
});

test("Chess.com archive evidence rejects identical player identities", () => {
  const evidence = classifyChessComArchiveGameEvidence({
    url: "https://www.chess.com/game/live/123483",
    pgn: "[White \"alice\"]\n[Black \"alice\"]\n[Result \"1-0\"]\n\n1. e4 e5 1-0",
    end_time: 1788256800,
    rules: "chess",
    white: { username: "alice", result: "win" },
    black: { username: "alice", result: "resigned" },
  }, "alice");

  assert.deepEqual(evidence, { kind: "unknown" });
});

test("archive evidence classification returns unknown for non-string usernames", () => {
  const evidence = classifyChessComArchiveGameEvidence({
    url: "https://www.chess.com/game/live/123456",
    pgn: "[Result \"1-0\"]\n\n1. e4 e5 1-0",
    end_time: 1788256800,
    rules: "chess",
    white: { username: 42, result: "win" },
    black: { username: "bob", result: "resigned" },
  } as never, "alice");

  assert.equal(evidence.kind, "unknown");
});

test("a malformed newest Back Rank Goblin game cannot authorize an older game", async (t) => {
  const requested: string[] = [];
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const url = String(input);
    requested.push(url);
    if (url === archiveIndexUrl) return Response.json({ archives: [olderArchiveUrl, latestArchiveUrl] });
    if (url === latestArchiveUrl) return Response.json({ games: [{
      url: "https://www.chess.com/game/live/malformed-proof",
      end_time: 1788256800,
      rules: "chess",
      white: { username: "alice", result: "win" },
      black: { username: "bob", result: "resigned" },
    }] });
    if (url === olderArchiveUrl) return Response.json({ games: [{
      url: "https://www.chess.com/game/live/111111",
      pgn: "[UTCDate \"2026.08.31\"]\n[UTCTime \"10:00:00\"]\n\n1. f3 e5 2. g4 Qh4# 0-1",
      end_time: 1788170400,
      rules: "chess",
      white: { username: "alice", result: "checkmated" },
      black: { username: "bob", result: "win" },
    }] });
    throw new Error(`Unexpected request: ${url}`);
  });

  const result = await checkLatestChessComBackRankGoblin("alice");

  assert.equal(result.status, "pending");
  assert.equal(result.gameId, "chesscom-latest-error");
  assert.deepEqual(requested, [archiveIndexUrl, latestArchiveUrl]);
});

test("a malformed sibling in the authoritative Back Rank Goblin month keeps proof unknown", async (t) => {
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const url = String(input);
    if (url === archiveIndexUrl) return Response.json({ archives: [latestArchiveUrl] });
    assert.equal(url, latestArchiveUrl);
    return Response.json({ games: [
      {
        url: "https://www.chess.com/game/live/broken",
        pgn: "garbage 1-0",
        end_time: 1788256799,
        rules: "chess",
        white: { username: "alice", result: "win" },
        black: { username: "bob", result: "resigned" },
      },
      {
        url: "https://www.chess.com/game/live/222222",
        pgn: "1. e4 e5 1-0",
        end_time: 1788256800,
        rules: "chess",
        white: { username: "alice", result: "win" },
        black: { username: "bob", result: "resigned" },
      },
    ] });
  });

  const result = await checkLatestChessComBackRankGoblin("alice");

  assert.equal(result.status, "pending");
  assert.equal(result.gameId, "chesscom-latest-error");
});

test("a newest Chess.com game without PGN proof keeps latest history unknown", async (t) => {
  const requested: string[] = [];
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const url = String(input);
    requested.push(url);
    if (url === archiveIndexUrl) return Response.json({ archives: [olderArchiveUrl, latestArchiveUrl] });
    if (url === latestArchiveUrl) return Response.json({ games: [{
      url: "https://www.chess.com/game/live/123450",
      end_time: 1788256800,
      white: { username: "alice", result: "win" },
      black: { username: "bob", result: "resigned" },
    }] });
    throw new Error(`Older history must not be requested after malformed latest proof: ${url}`);
  });

  const result = await checkLatestChessComFinishedGame("alice");

  assert.equal(result.status, "pending");
  assert.equal(result.gameId, "chesscom-latest-error");
  assert.deepEqual(requested, [archiveIndexUrl, latestArchiveUrl]);
});

test("a newest Chess.com game without a usable player identity keeps latest history unknown", async (t) => {
  const requested: string[] = [];
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const url = String(input);
    requested.push(url);
    if (url === archiveIndexUrl) return Response.json({ archives: [olderArchiveUrl, latestArchiveUrl] });
    if (url === latestArchiveUrl) return Response.json({ games: [{
      url: "https://www.chess.com/game/live/123451",
      pgn: "[UTCDate \"2026.09.01\"]\n[UTCTime \"10:00:00\"]\n\n1. e4 e5 1-0",
      end_time: 1788256800,
      white: { username: "   ", result: "win" },
      black: { username: "bob", result: "resigned" },
    }] });
    throw new Error(`Older history must not be requested after unusable latest identity: ${url}`);
  });

  const result = await checkLatestChessComFinishedGame("alice");

  assert.equal(result.status, "pending");
  assert.equal(result.gameId, "chesscom-latest-error");
  assert.deepEqual(requested, [archiveIndexUrl, latestArchiveUrl]);
});

test("a newest Chess.com game that omits the queried player keeps latest history unknown", async (t) => {
  const requested: string[] = [];
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const url = String(input);
    requested.push(url);
    if (url === archiveIndexUrl) return Response.json({ archives: [olderArchiveUrl, latestArchiveUrl] });
    if (url === latestArchiveUrl) return Response.json({ games: [{
      url: "https://www.chess.com/game/live/123452",
      pgn: "[UTCDate \"2026.09.01\"]\n[UTCTime \"10:00:00\"]\n\n1. e4 e5 1-0",
      end_time: 1788256800,
      white: { username: "carol", result: "win" },
      black: { username: "bob", result: "resigned" },
    }] });
    throw new Error(`Older history must not be requested after a mismatched latest player: ${url}`);
  });

  const result = await checkLatestChessComFinishedGame("alice");

  assert.equal(result.status, "pending");
  assert.equal(result.gameId, "chesscom-latest-error");
  assert.deepEqual(requested, [archiveIndexUrl, latestArchiveUrl]);
});

test("a newest Chess.com game without a usable completion time keeps latest history unknown", async (t) => {
  const requested: string[] = [];
  const acceptedControl = {
    url: "https://www.chess.com/game/live/123453",
    pgn: "[UTCDate \"2026.09.01\"]\n[UTCTime \"09:55:00\"]\n\n1. e4 e5 1-0",
    end_time: 1788256800,
    rules: "chess",
    white: { username: "alice", result: "win" },
    black: { username: "bob", result: "resigned" },
  };
  assert.equal(classifyChessComArchiveGameEvidence(acceptedControl, "alice").kind, "known-standard");
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const url = String(input);
    requested.push(url);
    if (url === archiveIndexUrl) return Response.json({ archives: [olderArchiveUrl, latestArchiveUrl] });
    if (url === latestArchiveUrl) return Response.json({ games: [{ ...acceptedControl, end_time: 0 }] });
    throw new Error(`Older history must not be requested after unusable latest completion time: ${url}`);
  });

  const result = await checkLatestChessComFinishedGame("alice");

  assert.equal(result.status, "pending");
  assert.equal(result.gameId, "chesscom-latest-error");
  assert.deepEqual(requested, [archiveIndexUrl, latestArchiveUrl]);
});

test("a newest Chess.com game without replayable moves keeps latest history unknown", async (t) => {
  const requested: string[] = [];
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const url = String(input);
    requested.push(url);
    if (url === archiveIndexUrl) return Response.json({ archives: [olderArchiveUrl, latestArchiveUrl] });
    if (url === latestArchiveUrl) return Response.json({ games: [{
      url: "https://www.chess.com/game/live/123454",
      pgn: "[UTCDate \"2026.09.01\"]\n[UTCTime \"10:00:00\"]\n\n{Game abandoned before a move.} *",
      end_time: 1788256800,
      white: { username: "alice", result: "win" },
      black: { username: "bob", result: "abandoned" },
    }] });
    throw new Error(`Older history must not be requested after an unusable latest replay: ${url}`);
  });

  const result = await checkLatestChessComRooklessRampage("alice");

  assert.equal(result.status, "pending");
  assert.equal(result.gameId, "chesscom-latest-error");
  assert.deepEqual(requested, [archiveIndexUrl, latestArchiveUrl]);
});

test("a newest Chess.com game with invalid move text keeps latest history unknown", async (t) => {
  const requested: string[] = [];
  const acceptedControl = {
    url: "https://www.chess.com/game/live/123458",
    pgn: "[UTCDate \"2026.09.01\"]\n[UTCTime \"09:55:00\"]\n\n1. e4 e5 1-0",
    end_time: 1788256800,
    rules: "chess",
    white: { username: "alice", result: "win" },
    black: { username: "bob", result: "resigned" },
  };
  assert.equal(classifyChessComArchiveGameEvidence(acceptedControl, "alice").kind, "known-standard");
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const url = String(input);
    requested.push(url);
    if (url === archiveIndexUrl) return Response.json({ archives: [olderArchiveUrl, latestArchiveUrl] });
    if (url === latestArchiveUrl) return Response.json({ games: [{ ...acceptedControl, pgn: acceptedControl.pgn.replace("1. e4 e5", "garbage") }] });
    throw new Error(`Older history must not be requested after invalid latest move text: ${url}`);
  });

  const result = await checkLatestChessComFinishedGame("alice");

  assert.equal(result.status, "pending");
  assert.equal(result.gameId, "chesscom-latest-error");
  assert.deepEqual(requested, [archiveIndexUrl, latestArchiveUrl]);
});

test("a newest Chess.com game with a legal but truncated replay keeps latest history unknown", async (t) => {
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const url = String(input);
    if (url === archiveIndexUrl) return Response.json({ archives: [latestArchiveUrl] });
    assert.equal(url, latestArchiveUrl);
    return Response.json({ games: [{
      url: "https://www.chess.com/game/live/123459",
      pgn: "[Result \"1-0\"]\n\n1. e4 e5",
      end_time: 1788256800,
      rules: "chess",
      white: { username: "alice", result: "win" },
      black: { username: "bob", result: "resigned" },
    }] });
  });

  const result = await checkLatestChessComFinishedGame("alice");

  assert.equal(result.status, "pending");
  assert.equal(result.gameId, "chesscom-latest-error");
});

test("a non-provider standard rules label cannot bypass Chess.com replay validation", async (t) => {
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const url = String(input);
    if (url === archiveIndexUrl) return Response.json({ archives: [latestArchiveUrl] });
    assert.equal(url, latestArchiveUrl);
    return Response.json({ games: [{
      url: "https://www.chess.com/game/live/123456",
      pgn: "[Result \"1-0\"]\n\n1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. d3 d6 5. Nc3 Nf6 6. Be3 Be6 7. Qd2 Qd7 8. h3 h6 9. a3 a6 10. b3 b6 1-0",
      end_time: 1788256800,
      rules: "standard",
      time_class: "blitz",
      white: { username: "alice", result: "win" },
      black: { username: "bob", result: "resigned" },
    }] });
  });

  const result = await checkLatestChessComNoCastleClub("alice");

  assert.equal(result.status, "pending");
  assert.equal(result.gameId, "chesscom-latest-error");
});

test("an unknown Chess.com rules label cannot authorize latest finished-game proof", async (t) => {
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const url = String(input);
    if (url === archiveIndexUrl) return Response.json({ archives: [latestArchiveUrl] });
    assert.equal(url, latestArchiveUrl);
    return Response.json({ games: [{
      url: "https://www.chess.com/game/live/123456",
      pgn: "[Result \"1-0\"]\n\n1. e4 e5 1-0",
      end_time: 1788256800,
      rules: "mystery-chess",
      time_class: "blitz",
      white: { username: "alice", result: "win" },
      black: { username: "bob", result: "resigned" },
    }] });
  });

  const result = await checkLatestChessComFinishedGame("alice");

  assert.equal(result.status, "pending");
  assert.equal(result.gameId, "chesscom-latest-error");
});

test("a known Chess.com variant without move evidence cannot authorize latest finished-game proof", async (t) => {
  for (const pgn of [
    "[Variant \"Bughouse\"]\n[Result \"1-0\"]\n\n1-0 1-0",
    "[Variant \"Bughouse\"]\n[Result \"1-0\"]\n\n$1 1-0",
    "[Variant \"Bughouse\"]\n[Result \"1-0\"]\n\n$1$2 1-0",
    "[Variant \"Bughouse\"]\n[Result \"1-0\"]\n\n1.$1 1-0",
    "[Variant \"Bughouse\"]\n[Result \"1-0\"]\n\n1-0$1 1-0",
    "[Variant \"Bughouse\"]\n[Result \"1-0\"]\n\n1.1-0 1-0",
  ]) {
    t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
      const url = String(input);
      if (url === archiveIndexUrl) return Response.json({ archives: [latestArchiveUrl] });
      assert.equal(url, latestArchiveUrl);
      return Response.json({ games: [{
        url: "https://www.chess.com/game/live/123456",
        pgn,
        end_time: 1788256800,
        rules: "bughouse",
        time_class: "blitz",
        white: { username: "alice", result: "win" },
        black: { username: "bob", result: "resigned" },
      }] });
    });

    const result = await checkLatestChessComFinishedGame("alice");

    assert.equal(result.status, "pending");
    assert.equal(result.gameId, "chesscom-latest-error");
    t.mock.restoreAll();
  }
});

test("a newest Chess.com game with a malformed provider URL keeps latest history unknown", async (t) => {
  const requested: string[] = [];
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const url = String(input);
    requested.push(url);
    if (url === archiveIndexUrl) return Response.json({ archives: [latestArchiveUrl] });
    assert.equal(url, latestArchiveUrl);
    return Response.json({ games: [{
      url: "not-a-url/game/live/123456",
      pgn: "[Result \"1-0\"]\n\n1. e4 e5 1-0",
      end_time: 1788256800,
      rules: "chess",
      white: { username: "alice", result: "win" },
      black: { username: "bob", result: "resigned" },
    }] });
  });

  const result = await checkLatestChessComFinishedGame("alice");

  assert.equal(result.status, "pending");
  assert.equal(result.gameId, "chesscom-latest-error");
  assert.deepEqual(requested, [archiveIndexUrl, latestArchiveUrl]);
});

test("a nonempty authoritative Chess.com archive cannot fall through to an older game", async (t) => {
  const requested: string[] = [];
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const url = String(input);
    requested.push(url);
    if (url === archiveIndexUrl) return Response.json({ archives: [olderArchiveUrl, latestArchiveUrl] });
    if (url === latestArchiveUrl) return Response.json({ games: [{
      url: "https://www.chess.com/game/live/123456",
      pgn: "[Variant \"Bughouse\"]\n[Result \"1-0\"]\n\n1-0",
      end_time: 1788256800,
      rules: "bughouse",
      time_class: "blitz",
      white: { username: "alice", result: "win" },
      black: { username: "bob", result: "resigned" },
    }] });
    if (url === olderArchiveUrl) return Response.json({ games: [{
      url: "https://www.chess.com/game/live/111111",
      pgn: "[Result \"1-0\"]\n\n1. e4 e5 1-0",
      end_time: 1788170400,
      rules: "chess",
      time_class: "blitz",
      white: { username: "alice", result: "win" },
      black: { username: "bob", result: "resigned" },
    }] });
    throw new Error(`Unexpected request: ${url}`);
  });

  const result = await checkLatestChessComRooklessRampage("alice");

  assert.deepEqual(requested, [archiveIndexUrl, latestArchiveUrl]);
  assert.equal(result.status, "pending");
  assert.equal(result.gameId, "chesscom-latest-error");
});

test("a known-empty newest Chess.com archive prevents an older known game from becoming latest", async (t) => {
  const requested: string[] = [];
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const url = String(input);
    requested.push(url);
    if (url === archiveIndexUrl) return Response.json({ archives: [olderArchiveUrl, latestArchiveUrl] });
    if (url === latestArchiveUrl) return Response.json({ games: [] });
    if (url === olderArchiveUrl) return Response.json({ games: [{
      url: "https://www.chess.com/game/live/111111",
      pgn: "[UTCDate \"2026.08.31\"]\n[UTCTime \"10:00:00\"]\n\n1. e4 e5 1-0",
      end_time: 1788170400,
      rules: "chess",
      time_class: "blitz",
      white: { username: "alice", result: "win" },
      black: { username: "bob", result: "resigned" },
    }] });
    throw new Error(`Unexpected request: ${url}`);
  });

  const result = await checkLatestChessComFinishedGame("alice");

  assert.equal(result.status, "pending");
  assert.equal(result.gameId, "chesscom-no-recent-games");
  assert.deepEqual(requested, [archiveIndexUrl, latestArchiveUrl]);
});

test("Back Rank Goblin stops after evaluating a valid newest archive", async (t) => {
  const requested: string[] = [];
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const url = String(input);
    requested.push(url);
    if (url === archiveIndexUrl) return Response.json({ archives: [olderArchiveUrl, latestArchiveUrl] });
    if (url === latestArchiveUrl) return Response.json({ games: [{
      url: "https://www.chess.com/game/live/222222",
      pgn: "[UTCDate \"2026.09.01\"]\n[UTCTime \"10:00:00\"]\n\n1. e4 e5 2. Nf3 Nc6 1-0",
      end_time: 1788256800,
      rules: "chess",
      white: { username: "alice", result: "win" },
      black: { username: "bob", result: "resigned" },
    }] });
    if (url === olderArchiveUrl) return new Response("upstream unavailable", { status: 503 });
    throw new Error(`Unexpected request: ${url}`);
  });

  const result = await checkLatestChessComBackRankGoblin("alice");

  assert.equal(result.status, "failed");
  assert.equal(result.gameId, "https://www.chess.com/game/live/222222");
  assert.deepEqual(requested, [archiveIndexUrl, latestArchiveUrl]);
});

test("Back Rank Goblin treats the first nonempty known archive as authoritative when its game type is unsupported", async (t) => {
  const requested: string[] = [];
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const url = String(input);
    requested.push(url);
    if (url === archiveIndexUrl) return Response.json({ archives: [olderArchiveUrl, latestArchiveUrl] });
    if (url === latestArchiveUrl) return Response.json({ games: [{
      url: "https://www.chess.com/game/live/333333",
      pgn: "[UTCDate \"2026.09.01\"]\n[UTCTime \"10:00:00\"]\n\n1. e4 e5 1-0",
      end_time: 1788256800,
      rules: "bughouse",
      white: { username: "alice", result: "win" },
      black: { username: "bob", result: "resigned" },
    }] });
    throw new Error(`Older history must not be requested after a known nonempty latest archive: ${url}`);
  });

  const result = await checkLatestChessComBackRankGoblin("alice");

  assert.equal(result.status, "pending");
  assert.equal(result.gameId, "chesscom-no-standard-games");
  assert.deepEqual(requested, [archiveIndexUrl, latestArchiveUrl]);
});

test("Back Rank Goblin recognizes a structurally complete unsupported variant without parsing standard moves", async (t) => {
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const url = String(input);
    if (url === archiveIndexUrl) return Response.json({ archives: [latestArchiveUrl] });
    assert.equal(url, latestArchiveUrl);
    return Response.json({ games: [{
      url: "https://www.chess.com/game/live/333333",
      pgn: "[Variant \"Bughouse\"]\n[Result \"1-0\"]\n\n1. e4 e5 1-0",
      end_time: 1788256800,
      rules: "bughouse",
      white: { username: "alice", result: "win" },
      black: { username: "bob", result: "resigned" },
    }] });
  });

  const result = await checkLatestChessComBackRankGoblin("alice");

  assert.equal(result.status, "pending");
  assert.equal(result.gameId, "chesscom-no-standard-games");
});

test("Any Game Counts accepts structurally complete known Chess.com variant evidence", async (t) => {
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const url = String(input);
    if (url === archiveIndexUrl) return Response.json({ archives: [latestArchiveUrl] });
    assert.equal(url, latestArchiveUrl);
    return Response.json({ games: [{
      url: "https://www.chess.com/game/live/333333",
      pgn: "[Variant \"Bughouse\"]\n[Result \"1-0\"]\n\n1. e4 e5 1-0",
      end_time: 1788256800,
      rules: "bughouse",
      white: { username: "alice", result: "win" },
      black: { username: "bob", result: "resigned" },
    }] });
  });

  const result = await checkLatestChessComFinishedGame("alice");

  assert.equal(result.status, "passed");
  assert.equal(result.gameId, "https://www.chess.com/game/live/333333");
  assert.equal(result.outcome, "win");
});

test("malformed Chess.com variant movetext stays unknown", () => {
  const evidence = classifyChessComArchiveGameEvidence({
    url: "https://www.chess.com/game/live/333334",
    pgn: "[Variant \"Bughouse\"]\n[Result \"1-0\"]\n\ngarbage 1-0",
    end_time: 1788256800,
    rules: "bughouse",
    white: { username: "alice", result: "win" },
    black: { username: "bob", result: "resigned" },
  }, "alice");

  assert.deepEqual(evidence, { kind: "unknown" });
});

test("a newer unsupported Chess.com game prevents older Back Rank Goblin proof", async (t) => {
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const url = String(input);
    if (url === archiveIndexUrl) return Response.json({ archives: [latestArchiveUrl] });
    assert.equal(url, latestArchiveUrl);
    return Response.json({ games: [
      {
        url: "https://www.chess.com/game/live/222222",
        pgn: "[Result \"1-0\"]\n\n1. e4 e5 2. Nf3 Nc6 1-0",
        end_time: 1788256800,
        rules: "chess",
        white: { username: "alice", result: "win" },
        black: { username: "bob", result: "resigned" },
      },
      {
        url: "https://www.chess.com/game/live/333333",
        pgn: "[Variant \"Bughouse\"]\n[Result \"1-0\"]\n\n1. e4 e5 1-0",
        end_time: 1788256900,
        rules: "bughouse",
        white: { username: "alice", result: "win" },
        black: { username: "bob", result: "resigned" },
      },
    ] });
  });

  const result = await checkLatestChessComBackRankGoblin("alice");

  assert.equal(result.status, "pending");
  assert.equal(result.gameId, "chesscom-no-standard-games");
});

test("submitted Chess.com proof rejects conflicting duplicate game identities", async (t) => {
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const url = String(input);
    if (url === archiveIndexUrl) return Response.json({ archives: [latestArchiveUrl] });
    assert.equal(url, latestArchiveUrl);
    return Response.json({ games: [
      {
        url: "https://www.chess.com/game/live/123499",
        pgn: "[Result \"1-0\"]\n\n1. e4 e5 1-0",
        end_time: 1788256800,
        rules: "chess",
        white: { username: "alice", result: "win" },
        black: { username: "bob", result: "resigned" },
      },
      {
        url: "https://www.chess.com/game/live/123499",
        pgn: "[Result \"0-1\"]\n\n1. f3 e5 2. g4 Qh4# 0-1",
        end_time: 1788256900,
        rules: "chess",
        white: { username: "alice", result: "checkmated" },
        black: { username: "bob", result: "win" },
      },
    ] });
  });

  const result = await verifyChessComFinishAnyGameAttempt({
    gameUrl: "https://www.chess.com/game/live/123499",
    chessComUsername: "alice",
  });

  assert.equal(result.status, "pending");
});

test("submitted Chess.com proof rejects duplicate identity across archive months", async (t) => {
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const url = String(input);
    if (url === archiveIndexUrl) return Response.json({ archives: [olderArchiveUrl, latestArchiveUrl] });
    if (url === latestArchiveUrl) return Response.json({ games: [{
      url: "https://www.chess.com/game/live/123499",
      pgn: "[Result \"1-0\"]\n\n1. e4 e5 1-0",
      end_time: 1788256800,
      rules: "chess",
      white: { username: "alice", result: "win" },
      black: { username: "bob", result: "resigned" },
    }] });
    if (url === olderArchiveUrl) return Response.json({ games: [{
      url: "http://chess.com/game/live/123499/",
      pgn: "[Result \"0-1\"]\n\n1. f3 e5 2. g4 Qh4# 0-1",
      end_time: 1788170400,
      rules: "chess",
      white: { username: "alice", result: "checkmated" },
      black: { username: "bob", result: "win" },
    }] });
    throw new Error(`Unexpected request: ${url}`);
  });

  const result = await verifyChessComFinishAnyGameAttempt({
    gameUrl: "https://www.chess.com/game/live/123499",
    chessComUsername: "alice",
  });

  assert.equal(result.status, "pending");
});

test("submitted Chess.com proof can still find its exact game after malformed entries in a newer archive", async (t) => {
  const requested: string[] = [];
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const url = String(input);
    requested.push(url);
    if (url === archiveIndexUrl) return Response.json({ archives: [olderArchiveUrl, latestArchiveUrl] });
    if (url === latestArchiveUrl) return Response.json({ games: [null, { url: 123 }] });
    if (url === olderArchiveUrl) return Response.json({ games: [{
      url: "https://www.chess.com/game/live/123499",
      pgn: "[Result \"1-0\"]\n\n1. e4 e5 1-0",
      end_time: 1788170400,
      rules: "chess",
      white: { username: "alice", result: "win" },
      black: { username: "bob", result: "resigned" },
    }] });
    throw new Error(`Unexpected request: ${url}`);
  });

  const result = await verifyChessComFinishAnyGameAttempt({
    gameUrl: "https://www.chess.com/game/live/123499",
    chessComUsername: "alice",
  });

  assert.equal(result.status, "passed");
  assert.deepEqual(requested, [archiveIndexUrl, latestArchiveUrl, olderArchiveUrl]);
});

test("submitted custom Chess.com proof rejects conflicting duplicate game identities", async (t) => {
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const url = String(input);
    if (url === archiveIndexUrl) return Response.json({ archives: [latestArchiveUrl] });
    assert.equal(url, latestArchiveUrl);
    return Response.json({ games: [
      {
        url: "https://www.chess.com/game/live/123456",
        pgn: "[Result \"1-0\"]\n\n1. e4 e5 2. Qh5 Nc6 3. Bc4 Nf6 4. Qxf7# 1-0",
        end_time: 1788256800,
        rules: "chess",
        white: { username: "alice", result: "win" },
        black: { username: "bob", result: "checkmated" },
      },
      {
        url: "https://www.chess.com/game/live/123456",
        pgn: "[Result \"0-1\"]\n\n1. f3 e5 2. g4 Qh4# 0-1",
        end_time: 1788256900,
        rules: "chess",
        white: { username: "alice", result: "checkmated" },
        black: { username: "bob", result: "win" },
      },
    ] });
  });

  const result = await checkSubmittedCustomSideQuestForProvider({
    provider: "chesscom",
    username: "alice",
    gameId: "https://www.chess.com/game/live/123456",
    quest: {
      id: "win-one",
      title: "Win one",
      config: JSON.stringify({ version: 1, logic: "all", blocks: [{ type: "gameResult", result: "win" }] }),
    },
  });

  assert.equal(result.status, "pending");
});

test("submitted custom Chess.com proof rejects duplicate identity across archive months", async (t) => {
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const url = String(input);
    if (url === archiveIndexUrl) return Response.json({ archives: [olderArchiveUrl, latestArchiveUrl] });
    if (url === latestArchiveUrl) return Response.json({ games: [{
      url: "https://www.chess.com/game/live/123456",
      pgn: "[Result \"1-0\"]\n\n1. e4 e5 1-0",
      end_time: 1788256800,
      rules: "chess",
      white: { username: "alice", result: "win" },
      black: { username: "bob", result: "resigned" },
    }] });
    if (url === olderArchiveUrl) return Response.json({ games: [{
      url: "http://chess.com/game/live/123456/",
      pgn: "[Result \"0-1\"]\n\n1. f3 e5 2. g4 Qh4# 0-1",
      end_time: 1788170400,
      rules: "chess",
      white: { username: "alice", result: "checkmated" },
      black: { username: "bob", result: "win" },
    }] });
    throw new Error(`Unexpected request: ${url}`);
  });

  const result = await checkSubmittedCustomSideQuestForProvider({
    provider: "chesscom",
    username: "alice",
    gameId: "https://www.chess.com/game/live/123456",
    quest: {
      id: "win-one",
      title: "Win one",
      config: JSON.stringify({ version: 1, logic: "all", blocks: [{ type: "gameResult", result: "win" }] }),
    },
  });

  assert.equal(result.status, "pending");
});

test("submitted custom Chess.com proof keeps searching after invalid JSON in a newer archive", async (t) => {
  const requested: string[] = [];
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const url = String(input);
    requested.push(url);
    if (url === archiveIndexUrl) return Response.json({ archives: [olderArchiveUrl, latestArchiveUrl] });
    if (url === latestArchiveUrl) return new Response("not-json", { status: 200, headers: { "content-type": "application/json" } });
    if (url === olderArchiveUrl) return Response.json({ games: [{
      url: "https://www.chess.com/game/live/123456",
      pgn: "[UTCDate \"2026.08.31\"]\n[UTCTime \"10:00:00\"]\n[Result \"1-0\"]\n\n1. e4 e5 2. Qh5 Nc6 3. Bc4 Nf6 4. Qxf7# 1-0",
      end_time: 1788170400,
      rules: "chess",
      white: { username: "alice", result: "win" },
      black: { username: "bob", result: "checkmated" },
    }] });
    throw new Error(`Unexpected request: ${url}`);
  });

  const result = await checkSubmittedCustomSideQuestForProvider({
    provider: "chesscom",
    username: "alice",
    gameId: "https://www.chess.com/game/live/123456",
    quest: {
      id: "win-one",
      title: "Win one",
      config: JSON.stringify({ version: 1, logic: "all", blocks: [{ type: "gameResult", result: "win" }] }),
    },
  });

  assert.equal(result.status, "passed");
  assert.deepEqual(requested, [archiveIndexUrl, latestArchiveUrl, olderArchiveUrl]);
});

test("submitted custom Chess.com proof keeps searching after malformed entries in a newer archive", async (t) => {
  const requested: string[] = [];
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const url = String(input);
    requested.push(url);
    if (url === archiveIndexUrl) return Response.json({ archives: [olderArchiveUrl, latestArchiveUrl] });
    if (url === latestArchiveUrl) return Response.json({ games: [null, { url: 123 }] });
    if (url === olderArchiveUrl) return Response.json({ games: [{
      url: "https://www.chess.com/game/live/123456",
      pgn: "[Result \"1-0\"]\n\n1. e4 e5 2. Qh5 Nc6 3. Bc4 Nf6 4. Qxf7# 1-0",
      end_time: 1788170400,
      rules: "chess",
      white: { username: "alice", result: "win" },
      black: { username: "bob", result: "checkmated" },
    }] });
    throw new Error(`Unexpected request: ${url}`);
  });

  const result = await checkSubmittedCustomSideQuestForProvider({
    provider: "chesscom",
    username: "alice",
    gameId: "https://www.chess.com/game/live/123456",
    quest: {
      id: "win-one",
      title: "Win one",
      config: JSON.stringify({ version: 1, logic: "all", blocks: [{ type: "gameResult", result: "win" }] }),
    },
  });

  assert.equal(result.status, "passed");
  assert.deepEqual(requested, [archiveIndexUrl, latestArchiveUrl, olderArchiveUrl]);
});

test("submitted Chess.com proof can still find its exact game after a newer archive request rejects", async (t) => {
  const requested: string[] = [];
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const url = String(input);
    requested.push(url);
    if (url === archiveIndexUrl) return Response.json({ archives: [olderArchiveUrl, latestArchiveUrl] });
    if (url === latestArchiveUrl) throw new Error("network reset");
    if (url === olderArchiveUrl) return Response.json({ games: [{
      url: "https://www.chess.com/game/live/123499",
      pgn: "[UTCDate \"2026.08.31\"]\n[UTCTime \"10:00:00\"]\n\n1. e4 e5 1-0",
      end_time: 1788170400,
      rules: "chess",
      white: { username: "alice", result: "win" },
      black: { username: "bob", result: "resigned" },
    }] });
    throw new Error(`Unexpected request: ${url}`);
  });

  const result = await verifyChessComFinishAnyGameAttempt({
    gameUrl: "https://www.chess.com/game/live/123499",
    chessComUsername: "alice",
  });

  assert.equal(result.status, "passed");
  assert.deepEqual(requested, [archiveIndexUrl, latestArchiveUrl, olderArchiveUrl]);
});

test("submitted Chess.com proof can still find its exact game after a newer archive failure", async (t) => {
  const requested: string[] = [];
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const url = String(input);
    requested.push(url);
    if (url === archiveIndexUrl) return Response.json({ archives: [olderArchiveUrl, latestArchiveUrl] });
    if (url === latestArchiveUrl) return new Response("upstream unavailable", { status: 503 });
    if (url === olderArchiveUrl) return Response.json({ games: [{
      url: "https://www.chess.com/game/live/123499",
      pgn: "[UTCDate \"2026.08.31\"]\n[UTCTime \"10:00:00\"]\n\n1. e4 e5 1-0",
      end_time: 1788170400,
      rules: "chess",
      white: { username: "alice", result: "win" },
      black: { username: "bob", result: "resigned" },
    }] });
    throw new Error(`Unexpected request: ${url}`);
  });

  const result = await verifyChessComFinishAnyGameAttempt({
    gameUrl: "https://www.chess.com/game/live/123499",
    chessComUsername: "alice",
  });

  assert.equal(result.status, "passed");
  assert.deepEqual(requested, [archiveIndexUrl, latestArchiveUrl, olderArchiveUrl]);
});

test("a result-only Chess.com PGN cannot complete the latest finished-game quest", async (t) => {
  const requested: string[] = [];
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const url = String(input);
    requested.push(url);
    if (url === archiveIndexUrl) return Response.json({ archives: [olderArchiveUrl, latestArchiveUrl] });
    if (url === latestArchiveUrl) return Response.json({ games: [{
      url: "https://www.chess.com/game/live/123456",
      pgn: "1-0",
      end_time: 1788256800,
      rules: "chess",
      white: { username: "alice", result: "win" },
      black: { username: "bob", result: "resigned" },
    }] });
    throw new Error(`Older history must not be requested after result-only latest evidence: ${url}`);
  });

  const result = await checkLatestChessComFinishedGame("alice");

  assert.equal(result.status, "pending");
  assert.equal(result.gameId, "chesscom-latest-error");
  assert.deepEqual(requested, [archiveIndexUrl, latestArchiveUrl]);
});

test("contradictory Chess.com setup tags keep latest standard-game evidence unknown", async (t) => {
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const url = String(input);
    if (url === archiveIndexUrl) return Response.json({ archives: [latestArchiveUrl] });
    assert.equal(url, latestArchiveUrl);
    return Response.json({ games: [{
      url: "https://www.chess.com/game/live/123456",
      pgn: "[SetUp \"1\"]\n[FEN \"8/8/8/8/8/8/4k3/4K3 w - - 0 1\"]\n[Result \"1-0\"]\n\n1. e4 e5 1-0",
      end_time: 1788256800,
      rules: "chess",
      white: { username: "alice", result: "win" },
      black: { username: "bob", result: "resigned" },
    }] });
  });

  const result = await checkLatestChessComFinishedGame("alice");

  assert.equal(result.status, "pending");
  assert.equal(result.gameId, "chesscom-latest-error");
});

test("latest Chess.com evaluators consume valid CRLF replay evidence", async (t) => {
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const url = String(input);
    if (url === archiveIndexUrl) return Response.json({ archives: [latestArchiveUrl] });
    assert.equal(url, latestArchiveUrl);
    return Response.json({ games: [{
      url: "https://www.chess.com/game/live/123456",
      pgn: "[Result \"1-0\"]\r\n[White \"alice\"]\r\n[Black \"bob\"]\r\n\r\n1. Nf3 e5 2. Nc3 Nc6 3. Nb1 Nf6 4. Ng1 d5 1-0",
      end_time: 1788256800,
      rules: "chess",
      white: { username: "alice", result: "win" },
      black: { username: "bob", result: "resigned" },
    }] });
  });

  const result = await checkLatestChessComKnightsBeforeCoffee("alice");

  assert.equal(result.status, "passed");
  assert.equal(result.gameId, "https://www.chess.com/game/live/123456");
});

test("an unsupported Chess.com sibling never enters a standard-board evaluator", async (t) => {
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const url = String(input);
    if (url === archiveIndexUrl) return Response.json({ archives: [latestArchiveUrl] });
    assert.equal(url, latestArchiveUrl);
    return Response.json({ games: [
      {
        url: "https://www.chess.com/game/live/123456",
        pgn: "[Result \"1-0\"]\n\n1. Nf3 e5 2. Nc3 Nc6 3. Nb1 Nf6 4. Ng1 d5 1-0",
        end_time: 1788256800,
        rules: "chess",
        white: { username: "alice", result: "win" },
        black: { username: "bob", result: "resigned" },
      },
      {
        url: "https://www.chess.com/game/live/123455",
        pgn: "[Variant \"Bughouse\"]\n[Result \"0-1\"]\n\n1. e4 e5 0-1",
        end_time: 1788256700,
        rules: "bughouse",
        white: { username: "bob", result: "resigned" },
        black: { username: "alice", result: "win" },
      },
    ] });
  });

  const result = await checkLatestChessComKnightsBeforeCoffee("alice");

  assert.equal(result.status, "passed");
  assert.equal(result.gameId, "https://www.chess.com/game/live/123456");
});

test("a newer unsupported Chess.com game prevents an older standard game from becoming latest proof", async (t) => {
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const url = String(input);
    if (url === archiveIndexUrl) return Response.json({ archives: [latestArchiveUrl] });
    assert.equal(url, latestArchiveUrl);
    return Response.json({ games: [
      {
        url: "https://www.chess.com/game/live/123456",
        pgn: "[Result \"1-0\"]\n\n1. Nf3 e5 2. Nc3 Nc6 3. Nb1 Nf6 4. Ng1 d5 1-0",
        end_time: 1788256800,
        rules: "chess",
        white: { username: "alice", result: "win" },
        black: { username: "bob", result: "resigned" },
      },
      {
        url: "https://www.chess.com/game/live/123457",
        pgn: "[Variant \"Bughouse\"]\n[Result \"1-0\"]\n\n1. e4 e5 1-0",
        end_time: 1788256900,
        rules: "bughouse",
        white: { username: "alice", result: "win" },
        black: { username: "bob", result: "resigned" },
      },
    ] });
  });

  const result = await checkLatestChessComKnightsBeforeCoffee("alice");

  assert.equal(result.status, "pending");
  assert.equal(result.gameId, "chesscom-no-normalized-games");
});

test("validated coordinate replay evidence exposes canonical SAN to quest evaluators", () => {
  const evidence = classifyChessComArchiveGameEvidence({
    url: "https://www.chess.com/game/live/123460",
    pgn: "[Result \"1-0\"]\n\n1. e2e4 e7e5 2. g1f3 b8c6 3. f1c4 g8f6 4. e1g1 f8c5 1-0",
    end_time: 1788256800,
    rules: "chess",
    white: { username: "alice", result: "win" },
    black: { username: "bob", result: "resigned" },
  }, "alice");

  assert.equal(evidence.kind, "known-standard");
  if (evidence.kind !== "known-standard") return;
  assert.deepEqual(evidence.sanMoves, ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6", "O-O", "Bc5"]);
});

test("Pawn Storm consumes the validated source square for canonical SAN", () => {
  const game = {
    url: "https://www.chess.com/game/live/123477",
    pgn: "[Result \"1-0\"]\n\n1. e3 e5 1-0",
    end_time: 1788256800,
    rules: "chess",
    time_class: "blitz",
    white: { username: "alice", result: "win" },
    black: { username: "bob", result: "resigned" },
  };
  const archiveEvidence = classifyChessComArchiveGameEvidence(game, "alice");
  assert.equal(archiveEvidence.kind, "known-standard");

  const normalized = normalizeChessComPawnStormManiacGame({ ...game, archiveEvidence }, "alice");

  assert.equal(normalized?.pawnMoves[0]?.from, "e2");
  assert.equal(normalized?.pawnMoves[0]?.to, "e3");
  assert.equal(normalized?.pawnMoves[0]?.pawnFile, "e");
});

test("Pawn Storm ignores caller-supplied replay evidence", () => {
  const validGame = {
    url: "https://www.chess.com/game/live/123477",
    pgn: "[Result \"1-0\"]\n\n1. e3 e5 1-0",
    end_time: 1788256800,
    rules: "chess",
    time_class: "blitz",
    white: { username: "alice", result: "win" },
    black: { username: "bob", result: "resigned" },
  };
  const archiveEvidence = classifyChessComArchiveGameEvidence(validGame, "alice");
  assert.equal(archiveEvidence.kind, "known-standard");

  const normalized = normalizeChessComPawnStormManiacGame({
    ...validGame,
    pgn: "garbage",
    rules: "chess960",
    archiveEvidence,
  }, "alice");

  assert.equal(normalized, null);
});

test("Pawn Storm keeps an original pawn identity after a capture", () => {
  const game = {
    url: "https://www.chess.com/game/live/123478",
    pgn: "[Result \"1-0\"]\n\n1. e4 d5 2. exd5 Nf6 3. d6 cxd6 1-0",
    end_time: 1788256800,
    rules: "chess",
    time_class: "blitz",
    white: { username: "alice", result: "win" },
    black: { username: "bob", result: "resigned" },
  };
  const archiveEvidence = classifyChessComArchiveGameEvidence(game, "alice");
  assert.equal(archiveEvidence.kind, "known-standard");

  const normalized = normalizeChessComPawnStormManiacGame({ ...game, archiveEvidence }, "alice");
  const whitePawnMoves = normalized?.pawnMoves.filter((move) => move.color === "white");

  assert.deepEqual(whitePawnMoves?.map((move) => [move.from, move.to, move.pawnFile]), [
    ["e2", "e4", "e"],
    ["e4", "d5", "e"],
    ["d5", "d6", "e"],
  ]);
});

test("Rookless consumes validated coordinate replay and original rook identity", () => {
  const normalized = normalizeChessComRooklessRampageGame({
    url: "https://www.chess.com/game/live/123479",
    pgn: "[Result \"0-1\"]\n\n1. a2a4 e7e5 2. a1a3 f8b4 3. h2h3 b4a3 0-1",
    end_time: 1788256800,
    rules: "chess",
    time_class: "blitz",
    white: { username: "alice", result: "resigned" },
    black: { username: "bob", result: "win" },
  }, "alice");

  assert.deepEqual(normalized?.rookLosses, [{
    ply: 6,
    color: "white",
    origin: "a1",
    square: "a3",
    capturedBy: "black",
  }]);
});

test("symbolic annotations alone keep Chess.com variant evidence unknown", () => {
  const evidence = classifyChessComArchiveGameEvidence({
    url: "https://www.chess.com/game/live/123475",
    pgn: "[Variant \"Bughouse\"]\n[Result \"1-0\"]\n\n! 1-0",
    end_time: 1788256800,
    rules: "bughouse",
    white: { username: "alice", result: "win" },
    black: { username: "bob", result: "resigned" },
  }, "alice");

  assert.deepEqual(evidence, { kind: "unknown" });
});

test("standalone annotation variants keep Chess.com variant evidence unknown", () => {
  for (const annotation of ["?", "!!", "??", "!?", "?!"]) {
    const evidence = classifyChessComArchiveGameEvidence({
      url: "https://www.chess.com/game/live/123476",
      pgn: `[Variant "Bughouse"]\n[Result "1-0"]\n\n${annotation} 1-0`,
      end_time: 1788256800,
      rules: "bughouse",
      white: { username: "alice", result: "win" },
      black: { username: "bob", result: "resigned" },
    }, "alice");

    assert.deepEqual(evidence, { kind: "unknown" });
  }
});

test("contradictory variant termination keeps Chess.com archive evidence unknown", () => {
  const evidence = classifyChessComArchiveGameEvidence({
    url: "https://www.chess.com/game/live/123461",
    pgn: "[Variant \"Bughouse\"]\n[Result \"1-0\"]\n[Termination \"Game drawn by agreement\"]\n\n1. e4 e5 1-0",
    end_time: 1788256800,
    rules: "bughouse",
    white: { username: "alice", result: "win" },
    black: { username: "bob", result: "resigned" },
  }, "alice");

  assert.deepEqual(evidence, { kind: "unknown" });
});

test("contradictory variant ply count keeps Chess.com archive evidence unknown", () => {
  const evidence = classifyChessComArchiveGameEvidence({
    url: "https://www.chess.com/game/live/123462",
    pgn: "[Variant \"Bughouse\"]\n[Result \"1-0\"]\n[PlyCount \"3\"]\n\n1. e4 e5 1-0",
    end_time: 1788256800,
    rules: "bughouse",
    white: { username: "alice", result: "win" },
    black: { username: "bob", result: "resigned" },
  }, "alice");

  assert.deepEqual(evidence, { kind: "unknown" });
});

test("comment-prefixed malformed variant headers keep Chess.com archive evidence unknown", () => {
  const evidence = classifyChessComArchiveGameEvidence({
    url: "https://www.chess.com/game/live/123463",
    pgn: ";comment\n[Variant \"Bughouse\"]\n[Result \"1-0\"]\n[Termination \"Game drawn by agreement\"]\n[PlyCount \"999\"]\n\n1. e4 e5 1-0",
    end_time: 1788256800,
    rules: "bughouse",
    white: { username: "alice", result: "win" },
    black: { username: "bob", result: "resigned" },
  }, "alice");

  assert.deepEqual(evidence, { kind: "unknown" });
});

test("matching variant checkmate termination remains known Chess.com evidence", () => {
  const game = {
    url: "https://www.chess.com/game/live/123464",
    pgn: "[Variant \"Bughouse\"]\n[Result \"1-0\"]\n[Termination \"alice won by checkmate\"]\n\n1. e4 e5 1-0",
    end_time: 1788256800,
    rules: "bughouse",
    white: { username: "alice", result: "win" },
    black: { username: "bob", result: "checkmated" },
  };

  assert.deepEqual(classifyChessComArchiveGameEvidence(game, "alice"), {
    kind: "known-unsupported",
    game,
    completedGameAt: "2026-09-01T10:00:00.000Z",
  });
});

test("Chess.com abandonment termination uses the provider's public spelling", () => {
  const game = {
    url: "https://www.chess.com/game/live/172400487688",
    pgn: "[Result \"1-0\"]\n[Termination \"alice won - game abandoned\"]\n\n1. e4 e5 2. Nf3 Nc6 1-0",
    end_time: 1788256800,
    rules: "chess",
    white: { username: "alice", result: "win" },
    black: { username: "bob", result: "abandoned" },
  };

  assert.equal(classifyChessComArchiveGameEvidence(game, "alice").kind, "known-standard");
});

test("unseparated variant tag lines keep Chess.com archive evidence unknown", () => {
  const evidence = classifyChessComArchiveGameEvidence({
    url: "https://www.chess.com/game/live/123465",
    pgn: ";comment\n[Variant \"Bughouse\"]\n[Result \"1-0\"]\n1. e4 e5 1-0",
    end_time: 1788256800,
    rules: "bughouse",
    white: { username: "alice", result: "win" },
    black: { username: "bob", result: "resigned" },
  }, "alice");

  assert.deepEqual(evidence, { kind: "unknown" });
});

test("headerless Chess.com replay remains valid across blank lines", () => {
  const evidence = classifyChessComArchiveGameEvidence({
    url: "https://www.chess.com/game/live/123466",
    pgn: "1. e4 e5\n\n2. Nf3 Nc6 1-0",
    end_time: 1788256800,
    rules: "chess",
    white: { username: "alice", result: "win" },
    black: { username: "bob", result: "resigned" },
  }, "alice");

  assert.equal(evidence.kind, "known-standard");
});

test("unsupported Chess.com rules reject a contradictory PGN variant declaration", () => {
  const evidence = classifyChessComArchiveGameEvidence({
    url: "https://www.chess.com/game/live/123467",
    pgn: "[Variant \"Standard\"]\n[Result \"1-0\"]\n\n1. e4 e5 1-0",
    end_time: 1788256800,
    rules: "bughouse",
    white: { username: "alice", result: "win" },
    black: { username: "bob", result: "resigned" },
  }, "alice");

  assert.deepEqual(evidence, { kind: "unknown" });
});

test("known Chess.com variants reject PGN tags placed in movetext", () => {
  const evidence = classifyChessComArchiveGameEvidence({
    url: "https://www.chess.com/game/live/123468",
    pgn: "[Variant \"Bughouse\"]\n[Result \"1-0\"]\n\n[Termination \"Game drawn by agreement\"]\n1. e4 e5 1-0",
    end_time: 1788256800,
    rules: "bughouse",
    white: { username: "alice", result: "win" },
    black: { username: "bob", result: "resigned" },
  }, "alice");

  assert.deepEqual(evidence, { kind: "unknown" });
});

test("known Chess.com variants reject inline PGN tags in movetext", () => {
  for (const inlineTag of [
    "[Termination \"Game drawn by agreement\"]",
    "[Result \"0-1\"]",
    "[Variant \"Standard\"]",
  ]) {
    const evidence = classifyChessComArchiveGameEvidence({
      url: "https://www.chess.com/game/live/123471",
      pgn: `[Variant "Bughouse"]\n[Result "1-0"]\n\n1. e4 ${inlineTag} 1-0`,
      end_time: 1788256800,
      rules: "bughouse",
      white: { username: "alice", result: "win" },
      black: { username: "bob", result: "resigned" },
    }, "alice");

    assert.deepEqual(evidence, { kind: "unknown" });
  }
});

test("submitted standard Chess.com win and loss requirements are mutually exclusive", async (t) => {
  const game = {
    url: "https://www.chess.com/game/live/123485",
    pgn: "1. e4 e5 1-0",
    end_time: 1788256800,
    rules: "chess",
    white: { username: "alice", result: "win" },
    black: { username: "bob", result: "resigned" },
  };
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const url = String(input);
    if (/\/player\/(alice|bob)\/games\/archives$/.test(url)) return Response.json({ archives: [url.replace("archives", "2026/09")] });
    assert.match(url, /\/player\/(alice|bob)\/games\/2026\/09$/);
    return Response.json({ games: [game] });
  });
  for (const winner of ["white", "black"] as const) {
    game.pgn = winner === "white" ? "1. e4 e5 1-0" : "1. e4 e5 0-1";
    game.white.result = winner === "white" ? "win" : "resigned";
    game.black.result = winner === "black" ? "win" : "resigned";
    assert.equal(classifyChessComArchiveGameEvidence(game, "alice").kind, "known-standard");
    for (const [side, username, win, lose] of [
      ["white", "alice", verifyChessComWinAsWhiteAttempt, verifyChessComLoseAsWhiteAttempt],
      ["black", "bob", verifyChessComWinAsBlackAttempt, verifyChessComLoseAsBlackAttempt],
    ] as const) {
      const input = { gameUrl: game.url, chessComUsername: username };
      assert.equal((await win(input)).status, side === winner ? "passed" : "failed", `${side} win when ${winner} won`);
      assert.equal((await lose(input)).status, side === winner ? "failed" : "passed", `${side} loss when ${winner} won`);
      assert.equal((await verifyChessComLoseAnyGameAttempt(input)).status, side === winner ? "failed" : "passed", `${side} lose-any when ${winner} won`);
    }
  }
});

test("only finish-any accepts submitted unsupported Chess.com variants", async (t) => {
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const url = String(input);
    if (url === archiveIndexUrl) return Response.json({ archives: [latestArchiveUrl] });
    assert.equal(url, latestArchiveUrl);
    return Response.json({ games: [{
      url: "https://www.chess.com/game/live/123469",
      pgn: "[Variant \"Bughouse\"]\n[Result \"1-0\"]\n\n1. e4 e5 1-0",
      end_time: 1788256800,
      rules: "bughouse",
      white: { username: "alice", result: "win" },
      black: { username: "bob", result: "resigned" },
    }] });
  });

  const input = { gameUrl: "https://www.chess.com/game/live/123469", chessComUsername: "alice" };
  assert.equal((await verifyChessComFinishAnyGameAttempt(input)).status, "passed");

  const specialized = [
    verifyChessComFinishAsWhiteAttempt,
    verifyChessComFinishAsBlackAttempt,
    verifyChessComWinAsWhiteAttempt,
    verifyChessComWinAsBlackAttempt,
    verifyChessComDrawAnyGameAttempt,
    verifyChessComDrawAsWhiteAttempt,
    verifyChessComDrawAsBlackAttempt,
    verifyChessComLoseAnyGameAttempt,
    verifyChessComLoseAsWhiteAttempt,
    verifyChessComLoseAsBlackAttempt,
  ];
  for (const verify of specialized) {
    assert.equal((await verify(input)).status, "pending", verify.name);
  }
});

test("submitted Chess.com variants never produce a standard-board proof position", async (t) => {
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const url = String(input);
    if (url === archiveIndexUrl) return Response.json({ archives: [latestArchiveUrl] });
    assert.equal(url, latestArchiveUrl);
    return Response.json({ games: [{
      url: "https://www.chess.com/game/live/123469",
      pgn: "[Variant \"Chess960\"]\n[Result \"1-0\"]\n\n1. e4 e5 1-0",
      end_time: 1788256800,
      rules: "chess960",
      white: { username: "alice", result: "win" },
      black: { username: "bob", result: "resigned" },
    }] });
  });

  const result = await verifyChessComFinishAnyGameAttempt({
    gameUrl: "https://www.chess.com/game/live/123469",
    chessComUsername: "alice",
  });

  assert.equal(result.status, "passed");
  assert.equal(result.finalPositionFen, undefined);
  assert.equal(result.lastMoveUci, undefined);
});

test("submitted Chess.com proof ignores provider-supplied derived archive evidence", async (t) => {
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const url = String(input);
    if (url === archiveIndexUrl) return Response.json({ archives: [latestArchiveUrl] });
    assert.equal(url, latestArchiveUrl);
    return Response.json({ games: [{
      url: "https://www.chess.com/game/live/123470",
      pgn: "garbage",
      end_time: 1788256800,
      rules: "chess960",
      archiveEvidence: {
        kind: "known-standard",
        sanMoves: ["e4", "e5"],
        canonicalUci: ["e2e4", "e7e5"],
      },
      white: { username: "alice", result: "win" },
      black: { username: "bob", result: "resigned" },
    }] });
  });

  const result = await verifyChessComFinishAnyGameAttempt({
    gameUrl: "https://www.chess.com/game/live/123470",
    chessComUsername: "alice",
  });

  assert.equal(result.status, "pending");
  assert.equal(result.finalPositionFen, undefined);
  assert.equal(result.lastMoveUci, undefined);
});

test("Chess.com archive evidence requires an explicit provider rules value", () => {
  const evidence = classifyChessComArchiveGameEvidence({
    url: "https://www.chess.com/game/live/123472",
    pgn: "[Result \"1-0\"]\n\n1. e4 e5 1-0",
    end_time: 1788256800,
    white: { username: "alice", result: "win" },
    black: { username: "bob", result: "resigned" },
  }, "alice");

  assert.deepEqual(evidence, { kind: "unknown" });
});

test("submitted Chess.com proof derives its board from the validated replay", async (t) => {
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const url = String(input);
    if (url === archiveIndexUrl) return Response.json({ archives: [latestArchiveUrl] });
    assert.equal(url, latestArchiveUrl);
    return Response.json({ games: [{
      url: "https://www.chess.com/game/live/123472",
      pgn: "[Result \"1-0\"]\n\n1. e3 e5 1-0",
      end_time: 1788256800,
      rules: "chess",
      white: { username: "alice", result: "win" },
      black: { username: "bob", result: "resigned" },
    }] });
  });

  const result = await verifyChessComFinishAnyGameAttempt({
    gameUrl: "https://www.chess.com/game/live/123472",
    chessComUsername: "alice",
  });

  assert.equal(result.status, "passed");
  assert.equal(result.lastMoveUci, "e7e5");
  assert.equal(result.finalPositionFen, "rnbqkbnr/pppp1ppp/8/4p3/8/4P3/PPPP1PPP/RNBQKBNR w KQkq - 0 2");
});

test("invalid PGN tag escapes keep Chess.com archive evidence unknown", () => {
  const evidence = classifyChessComArchiveGameEvidence({
    url: "https://www.chess.com/game/live/123473",
    pgn: "[Event \"bad\\q\"]\n[Result \"1-0\"]\n\n1. e4 e5 1-0",
    end_time: 1788256800,
    rules: "chess",
    white: { username: "alice", result: "win" },
    black: { username: "bob", result: "resigned" },
  }, "alice");

  assert.deepEqual(evidence, { kind: "unknown" });
});

test("custom latest Chess.com checks reuse the validated canonical replay", async (t) => {
  const originalMove = Chess.prototype.move;
  let moveCalls = 0;
  t.mock.method(Chess.prototype, "move", function (this: Chess, ...args: unknown[]) {
    moveCalls += 1;
    return Reflect.apply(originalMove, this, args);
  });
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const url = String(input);
    if (url === archiveIndexUrl) return Response.json({ archives: [latestArchiveUrl] });
    assert.equal(url, latestArchiveUrl);
    return Response.json({ games: [{
      url: "https://www.chess.com/game/live/123456",
      pgn: "[Result \"1-0\"]\n\n1. e4 e5 2. Qh5 Nc6 3. Bc4 Nf6 4. Qxf7# 1-0",
      end_time: 1788256800,
      rules: "chess",
      white: { username: "alice", result: "win" },
      black: { username: "bob", result: "checkmated" },
    }] });
  });

  const result = await checkLatestCustomSideQuestForProvider({
    provider: "chesscom",
    username: "alice",
    quest: {
      id: "win-one",
      title: "Win one",
      config: JSON.stringify({ version: 1, logic: "all", blocks: [{ type: "gameResult", result: "win" }] }),
    },
  });

  assert.equal(result.status, "passed");
  assert.equal(moveCalls, 7);
});

test("latest Chess.com evaluators reuse the validated canonical replay", async (t) => {
  const originalMove = Chess.prototype.move;
  let moveCalls = 0;
  t.mock.method(Chess.prototype, "move", function (this: Chess, ...args: unknown[]) {
    moveCalls += 1;
    return Reflect.apply(originalMove, this, args);
  });
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const url = String(input);
    if (url === archiveIndexUrl) return Response.json({ archives: [latestArchiveUrl] });
    assert.equal(url, latestArchiveUrl);
    return Response.json({ games: [{
      url: "https://www.chess.com/game/live/123456",
      pgn: "[Result \"1-0\"]\n\n1. Nf3 e5 2. Nc3 Nc6 3. Nb1 Nf6 4. Ng1 d5 1-0",
      end_time: 1788256800,
      rules: "chess",
      white: { username: "alice", result: "win" },
      black: { username: "bob", result: "resigned" },
    }] });
  });

  const result = await checkLatestChessComKnightsBeforeCoffee("alice");

  assert.equal(result.status, "passed");
  assert.equal(moveCalls, 8);
});

test("Back Rank Goblin reuses the validated canonical replay", async (t) => {
  const originalMove = Chess.prototype.move;
  let moveCalls = 0;
  t.mock.method(Chess.prototype, "move", function (this: Chess, ...args: unknown[]) {
    moveCalls += 1;
    return Reflect.apply(originalMove, this, args);
  });
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const url = String(input);
    if (url === archiveIndexUrl) return Response.json({ archives: [latestArchiveUrl] });
    assert.equal(url, latestArchiveUrl);
    return Response.json({ games: [{
      url: "https://www.chess.com/game/live/123456",
      pgn: "[Result \"0-1\"]\n\n1. f3 e5 2. g4 Qh4# 0-1",
      end_time: 1788256800,
      rules: "chess",
      white: { username: "alice", result: "checkmated" },
      black: { username: "bob", result: "win" },
    }] });
  });

  const result = await checkLatestChessComBackRankGoblin("alice");

  assert.equal(result.status, "failed");
  assert.equal(moveCalls, 4);
});

test("Chess.com evidence validates each move exactly once", (t) => {
  const originalMove = Chess.prototype.move;
  let moveCalls = 0;
  t.mock.method(Chess.prototype, "move", function (this: Chess, ...args: unknown[]) {
    moveCalls += 1;
    return Reflect.apply(originalMove, this, args);
  });

  const evidence = classifyChessComArchiveGameEvidence({
    url: "https://www.chess.com/game/live/123474",
    pgn: "[Result \"1-0\"]\n\n1. e3 e5 1-0",
    end_time: 1788256800,
    rules: "chess",
    white: { username: "alice", result: "win" },
    black: { username: "bob", result: "resigned" },
  }, "alice");

  assert.equal(evidence.kind, "known-standard");
  assert.equal(moveCalls, 2);
});

test("validated Chess.com evidence carries canonical move facts", () => {
  const evidence = classifyChessComArchiveGameEvidence({
    url: "https://www.chess.com/game/live/123474",
    pgn: "[Result \"1-0\"]\n\n1. e3 e5 1-0",
    end_time: 1788256800,
    rules: "chess",
    white: { username: "alice", result: "win" },
    black: { username: "bob", result: "resigned" },
  }, "alice");

  assert.equal(evidence.kind, "known-standard");
  if (evidence.kind !== "known-standard") return;
  const replay = (evidence as unknown as { replay?: {
    moves: Array<{ ply: number; color: string; piece: string; from: string; to: string; san: string; uci: string; fenAfter: string }>;
    finalPositionFen: string;
  } }).replay;
  assert.deepEqual(replay?.moves.map(({ ply, color, piece, from, to, san, uci, fenAfter }) => ({ ply, color, piece, from, to, san, uci, fenAfter })), [
    {
      ply: 1,
      color: "white",
      piece: "pawn",
      from: "e2",
      to: "e3",
      san: "e3",
      uci: "e2e3",
      fenAfter: "rnbqkbnr/pppppppp/8/8/8/4P3/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
    },
    {
      ply: 2,
      color: "black",
      piece: "pawn",
      from: "e7",
      to: "e5",
      san: "e5",
      uci: "e7e5",
      fenAfter: "rnbqkbnr/pppp1ppp/8/4p3/8/4P3/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
    },
  ]);
  assert.equal(replay?.finalPositionFen, "rnbqkbnr/pppp1ppp/8/4p3/8/4P3/PPPP1PPP/RNBQKBNR w KQkq - 0 2");
});

test("Knightmare uses the validated source square for a quiet pawn move", () => {
  const normalized = normalizeChessComKnightmareModeGame({
    url: "https://www.chess.com/game/live/123480",
    pgn: "[Result \"1-0\"]\n\n1. e3 1-0",
    end_time: 1788256800,
    rules: "chess",
    white: { username: "alice", result: "win" },
    black: { username: "bob", result: "resigned" },
  }, "alice");

  assert.deepEqual(normalized?.finalMove, {
    ply: 1,
    color: "white",
    from: "e2",
    to: "e3",
    piece: "pawn",
  });
});

test("One Bishop reads final minor pieces from the validated board", () => {
  const normalized = normalizeChessComOneBishopToRuleThemAllGame({
    url: "https://www.chess.com/game/live/123481",
    pgn: "[Result \"1-0\"]\n\n1. Na3 d6 2. b4 b6 3. h3 Bf5 4. e3 Bxh3 5. c3 a6 6. f3 Qc8 7. Bxa6 c6 8. Qa4 f5 9. Bxc8 Rxa4 10. d4 Ra6 11. Rb1 Ra5 12. Nb5 cxb5 1-0",
    end_time: 1788256800,
    rules: "chess",
    white: { username: "alice", result: "win" },
    black: { username: "bob", result: "resigned" },
  }, "alice");

  assert.deepEqual(normalized?.finalMinorPieces, [
    { kind: "bishop", square: "c1" },
    { kind: "bishop", square: "c8" },
    { kind: "knight", square: "g1" },
  ]);
});

test("Bishop Field Trip does not credit a promoted bishop as an original bishop", () => {
  const normalized = normalizeChessComBishopFieldTripGame({
    url: "https://www.chess.com/game/live/123482",
    pgn: "[Result \"1-0\"]\n\n1. a4 h5 2. a5 h4 3. a6 h3 4. axb7 hxg2 5. bxa8=B Nf6 6. Baxg2 e6 7. d3 d6 8. Bg5 1-0",
    end_time: 1788256800,
    rules: "chess",
    white: { username: "alice", result: "win" },
    black: { username: "bob", result: "resigned" },
  }, "alice");

  assert.equal(normalized?.bothBishopsMovedBeforeQueen, false);
  assert.deepEqual(normalized?.movedBishopHomeSquaresBeforeQueen, ["c1"]);
});

test("Queen Never Heard of Her requires loss of the original queen", async (t) => {
  const game = {
    url: "https://www.chess.com/game/live/123483",
    pgn: "1. a4 h5 2. a5 h4 3. a6 h3 4. axb7 Nc6 5. b8=Q Rxb8 6. d4 d5 7. Nf3 Nf6 8. e3 e6 9. Bd3 Bd6 10. O-O O-O 1-0",
    end_time: 1788256800,
    rules: "chess",
    white: { username: "alice", result: "win" },
    black: { username: "bob", result: "resigned" },
  };
  const evidence = classifyChessComArchiveGameEvidence(game, "alice");
  assert.equal(evidence.kind, "known-standard");
  if (evidence.kind !== "known-standard") return;
  assert.equal(evidence.replay.moves.find((move) => move.capturedPiece === "queen")?.capturedOrigin, "a2");
  assert.deepEqual(new Chess(evidence.replay.finalPositionFen).get("d1"), { type: "q", color: "w" });
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    if (String(input) === archiveIndexUrl) return Response.json({ archives: [latestArchiveUrl] });
    assert.equal(String(input), latestArchiveUrl);
    return Response.json({ games: [game] });
  });
  const result = await checkLatestChessComQueenNeverHeardOfHer("alice");
  assert.equal(result.status, "failed");
  assert.match(result.summary, /No player queen loss/);
});

test("Lichess Pawn Storm preserves a pawn's original file after a capture", () => {
  const normalized = normalizeLichessPawnStormManiacGame({
    id: "lichess-pawn-origin",
    moves: "e2e4 d7d5 e4d5 g8f6 d5d6 e7e6",
    winner: "white",
    variant: "standard",
    speed: "blitz",
    players: {
      white: { user: { name: "alice" } },
      black: { user: { name: "bob" } },
    },
  }, "alice");

  assert.deepEqual(
    normalized?.pawnMoves.filter((move) => move.color === "white").map((move) => [move.from, move.to, move.pawnFile]),
    [
      ["e2", "e4", "e"],
      ["e4", "d5", "e"],
      ["d5", "d6", "e"],
    ],
  );
});
