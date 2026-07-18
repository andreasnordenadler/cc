import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import CustomSideQuestProofControls from "../src/components/custom-side-quest-proof-controls";
import { verifySubmittedChallengeAttempt } from "../src/app/api/mobile/quest/route";
import { checkSubmittedCustomSideQuestForProvider, type CustomSideQuest } from "../src/lib/custom-side-quests";

const winQuest: CustomSideQuest = {
  id: "custom-win",
  title: "Win exactly this game",
  summary: "Win a public game.",
  config: JSON.stringify({ version: 2, logic: "all", blocks: [{ type: "gameResult", result: "win" }] }),
  visibility: "private",
  lifecycle: "published",
  createdAt: "2026-07-18T00:00:00.000Z",
  updatedAt: "2026-07-18T00:00:00.000Z",
};

test("submitted Lichess custom proof evaluates the exact owned public game", async (t) => {
  const originalFetch = globalThis.fetch;
  const requested: string[] = [];
  globalThis.fetch = async (input) => {
    requested.push(String(input));
    return new Response(JSON.stringify({
      id: "Exact123",
      status: "mate",
      winner: "white",
      createdAt: Date.parse("2026-07-18T10:00:00.000Z"),
      lastMoveAt: Date.parse("2026-07-18T10:10:00.000Z"),
      moves: "e2e4 e7e5 d1h5 b8c6 f1c4 g8f6 h5f7",
      players: { white: { user: { name: "Alice" } }, black: { user: { name: "Bob" } } },
    }), { status: 200, headers: { "content-type": "application/json" } });
  };
  t.after(() => { globalThis.fetch = originalFetch; });

  const result = await checkSubmittedCustomSideQuestForProvider({
    quest: winQuest,
    provider: "lichess",
    username: "alice",
    gameId: "Exact123",
  });

  assert.equal(result.status, "passed");
  assert.equal(result.gameId, "Exact123");
  assert.deepEqual(requested, ["https://lichess.org/game/export/Exact123"]);
});

test("submitted Chess.com custom proof finds and evaluates the exact owned archive game", async (t) => {
  const originalFetch = globalThis.fetch;
  const requested: string[] = [];
  globalThis.fetch = async (input) => {
    const url = String(input);
    requested.push(url);
    if (url.endsWith("/games/archives")) {
      return Response.json({ archives: [
        "https://api.chess.com/pub/player/alice/games/2026/04",
        "https://api.chess.com/pub/player/alice/games/2026/05",
        "https://api.chess.com/pub/player/alice/games/2026/06",
        "https://api.chess.com/pub/player/alice/games/2026/07",
      ] });
    }
    if (!url.endsWith("/2026/04")) return Response.json({ games: [] });
    return Response.json({ games: [{
      url: "https://www.chess.com/game/live/123456",
      pgn: "[UTCDate \"2026.07.18\"]\n[UTCTime \"10:00:00\"]\n\n1. e4 e5 2. Qh5 Nc6 3. Bc4 Nf6 4. Qxf7# 1-0",
      end_time: 1784369400,
      white: { username: "Alice", result: "win" },
      black: { username: "Bob", result: "checkmated" },
    }] });
  };
  t.after(() => { globalThis.fetch = originalFetch; });

  const result = await checkSubmittedCustomSideQuestForProvider({
    quest: winQuest,
    provider: "chesscom",
    username: "alice",
    gameId: "https://www.chess.com/game/live/123456",
  });

  assert.equal(result.status, "passed");
  assert.equal(result.gameId, "https://www.chess.com/game/live/123456");
  assert.deepEqual(requested, [
    "https://api.chess.com/pub/player/alice/games/archives",
    "https://api.chess.com/pub/player/alice/games/2026/07",
    "https://api.chess.com/pub/player/alice/games/2026/06",
    "https://api.chess.com/pub/player/alice/games/2026/05",
    "https://api.chess.com/pub/player/alice/games/2026/04",
  ]);
});

test("active custom proof controls expose Android exact-game submission", () => {
  const html = renderToStaticMarkup(React.createElement(CustomSideQuestProofControls, {
    questId: "custom-win",
    active: true,
    playable: true,
  }));

  assert.match(html, /aria-label="Specific proof game"/);
  assert.match(html, /Lichess game ID or Chess\.com URL/);
  assert.match(html, />Submit game\/link</);
});

test("production submit verifier routes a custom quest through its exact-game rules", async (t) => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => Response.json({
    id: "Exact123",
    status: "mate",
    winner: "white",
    createdAt: Date.parse("2026-07-18T10:00:00.000Z"),
    lastMoveAt: Date.parse("2026-07-18T10:10:00.000Z"),
    moves: "e2e4 e7e5 d1h5 b8c6 f1c4 g8f6 h5f7",
    players: { white: { user: { name: "Alice" } }, black: { user: { name: "Bob" } } },
  });
  t.after(() => { globalThis.fetch = originalFetch; });

  const result = await verifySubmittedChallengeAttempt(
    "custom-win",
    { provider: "lichess", gameId: "Exact123" },
    { lichessUsername: "alice", customSideQuests: [winQuest] },
  );

  assert.equal(result.status, "passed");
  assert.equal(result.gameId, "Exact123");
});

test("production submit verifier rejects draft custom quests before provider lookup", async (t) => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => { calls += 1; return Response.json({}); };
  t.after(() => { globalThis.fetch = originalFetch; });

  const result = await verifySubmittedChallengeAttempt(
    "custom-win",
    { provider: "lichess", gameId: "Exact123" },
    { lichessUsername: "alice", customSideQuests: [{ ...winQuest, lifecycle: "draft" }] },
  );

  assert.equal(result.status, "pending");
  assert.match(result.summary, /publish/i);
  assert.equal(calls, 0);
});

test("production custom submit requires the active target and uses the custom title", async () => {
  const source = await readFile(new URL("../src/app/api/mobile/quest/route.ts", import.meta.url), "utf8");
  const body = source.slice(source.indexOf("async function submitMobileChallengeAttempt"), source.indexOf("function normalizeSubmittedGameReference"));
  const guard = body.indexOf("assertActiveSoloSubmissionTarget");
  const verification = body.indexOf("verifySubmittedChallengeAttempt");

  assert.ok(guard > 0 && guard < verification);
  assert.match(body, /challenge\?\.title\s*\?\?\s*customQuest!\.title/);
  assert.doesNotMatch(body, /challenge!\.title/);
});
