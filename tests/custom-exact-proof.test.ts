import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import CustomSideQuestProofControls from "../src/components/custom-side-quest-proof-controls";
import { POST, submitMobileChallengeAttempt, verifySubmittedChallengeAttempt, withMobileQuestRouteTestDependencies } from "../src/app/api/mobile/quest/route";
import { checkLatestCustomSideQuestForProvider, checkSubmittedCustomSideQuestForProvider, fetchBoundedProviderJson, type CustomSideQuest } from "../src/lib/custom-side-quests";
import { buildCompletedCustomPublicProofPath, buildCustomPublicProofPath, decodePublicProof } from "../src/lib/proof-share";
import { getLatestPassedChallengeAttempt } from "../src/lib/user-metadata";

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

function validConfigWithUtf8Bytes(byteLength: number) {
  const base = JSON.stringify({ version: 2, logic: "all", blocks: [{ type: "gameResult", result: "win" }], padding: "" });
  const paddingBytes = byteLength - Buffer.byteLength(base);
  assert.ok(paddingBytes >= 0);
  const config = JSON.stringify({ version: 2, logic: "all", blocks: [{ type: "gameResult", result: "win" }], padding: "é".repeat(Math.floor(paddingBytes / 2)) + "a".repeat(paddingBytes % 2) });
  assert.equal(Buffer.byteLength(config), byteLength);
  return config;
}

test("provider JSON reads reject a response beyond the byte limit", async () => {
  const response = new Response(JSON.stringify({ payload: "x".repeat(64) }), {
    headers: { "content-type": "application/json" },
  });

  await assert.rejects(
    () => fetchBoundedProviderJson("https://provider.example/game", {}, { maxBytes: 32, timeoutMs: 100, fetcher: async () => response }),
    /response is too large/i,
  );
});

test("provider JSON reads abort after the timeout", async () => {
  await assert.rejects(
    () => fetchBoundedProviderJson("https://provider.example/game", {}, {
      maxBytes: 32,
      timeoutMs: 5,
      fetcher: async (_input, init) => new Promise<Response>((_resolve, reject) => {
        const signal = init?.signal;
        if (!signal) return reject(new Error("request signal missing"));
        signal.addEventListener("abort", () => reject(new Error("provider request aborted")), { once: true });
      }),
    }),
    /abort|timed out/i,
  );
});

test("provider JSON reads enforce the timeout and cancel an uncooperative streaming body", async () => {
  let cancelled = false;
  const body = new ReadableStream<Uint8Array>({
    start(controller) { controller.enqueue(new TextEncoder().encode("{")); },
    cancel() { cancelled = true; return new Promise<void>(() => undefined); },
  });

  await assert.rejects(
    () => Promise.race([
      fetchBoundedProviderJson("https://provider.example/game", {}, {
        maxBytes: 32,
        timeoutMs: 5,
        fetcher: async () => new Response(body, { headers: { "content-type": "application/json" } }),
      }),
      new Promise<never>((_resolve, reject) => setTimeout(() => reject(new Error("body timeout missing")), 50)),
    ]),
    /timed out/i,
  );
  assert.equal(cancelled, true);
});

test("provider JSON reads do not fall back to an unbounded bodyless text read", async () => {
  const bodylessResponse = {
    ok: true,
    body: null,
    headers: new Headers(),
    text: () => new Promise<string>(() => undefined),
  } as Response;

  await assert.rejects(
    () => Promise.race([
      fetchBoundedProviderJson("https://provider.example/game", {}, { maxBytes: 32, timeoutMs: 5, fetcher: async () => bodylessResponse }),
      new Promise<never>((_resolve, reject) => setTimeout(() => reject(new Error("bodyless text fallback hung")), 50)),
    ]),
    (error: unknown) => error instanceof SyntaxError,
  );
});

test("latest Lichess proof rejects an oversized provider payload", async (t) => {
  const originalFetch = globalThis.fetch;
  const validGame = JSON.stringify({
    id: "Latest123",
    status: "mate",
    winner: "white",
    createdAt: Date.parse("2026-07-18T10:00:00.000Z"),
    lastMoveAt: Date.parse("2026-07-18T10:10:00.000Z"),
    moves: "e2e4 e7e5 d1h5 b8c6 f1c4 g8f6 h5f7",
    players: { white: { user: { name: "Alice" } }, black: { user: { name: "Bob" } } },
  });
  globalThis.fetch = async () => new Response(`${validGame}\n${"x".repeat(2_000_001)}`);
  t.after(() => { globalThis.fetch = originalFetch; });

  const result = await checkLatestCustomSideQuestForProvider({ quest: winQuest, provider: "lichess", username: "alice" });
  assert.equal(result.status, "pending");
});

test("submitted Lichess proof rejects an oversized provider payload", async (t) => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => Response.json({
    id: "Exact123",
    status: "mate",
    winner: "white",
    createdAt: Date.parse("2026-07-18T10:00:00.000Z"),
    lastMoveAt: Date.parse("2026-07-18T10:10:00.000Z"),
    moves: "e2e4 e7e5 d1h5 b8c6 f1c4 g8f6 h5f7",
    players: { white: { user: { name: "Alice" } }, black: { user: { name: "Bob" } } },
    padding: "x".repeat(2_000_001),
  });
  t.after(() => { globalThis.fetch = originalFetch; });

  const result = await checkSubmittedCustomSideQuestForProvider({ quest: winQuest, provider: "lichess", username: "alice", gameId: "Exact123" });
  assert.equal(result.status, "pending");
});

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

test("submitted Chess.com custom proof skips pre-activation archives and finds the target in the current archive", async (t) => {
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
    if (!url.endsWith("/2026/07")) return Response.json({ games: [] });
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
    activatedAfter: "2026-06-15T12:00:00.000Z",
  });

  assert.equal(result.status, "passed");
  assert.equal(result.gameId, "https://www.chess.com/game/live/123456");
  assert.deepEqual(requested, [
    "https://api.chess.com/pub/player/alice/games/archives",
    "https://api.chess.com/pub/player/alice/games/2026/07",
  ]);
});

test("submitted Chess.com custom proof never fetches an archive month older than activation", async (t) => {
  const originalFetch = globalThis.fetch;
  const requested: string[] = [];
  globalThis.fetch = async (input) => {
    const url = String(input);
    requested.push(url);
    if (url.endsWith("/games/archives")) return Response.json({ archives: [
      "https://api.chess.com/pub/player/alice/games/2026/04",
      "https://api.chess.com/pub/player/alice/games/2026/05",
      "https://api.chess.com/pub/player/alice/games/2026/06",
      "https://api.chess.com/pub/player/alice/games/2026/07",
    ] });
    return Response.json({ games: url.endsWith("/2026/05") ? [{
      url: "https://www.chess.com/game/live/555123",
      pgn: "[UTCDate \"2026.05.20\"]\n[UTCTime \"10:00:00\"]\n\n1. e4 e5 1-0",
      end_time: 1779271800,
      white: { username: "Alice", result: "win" },
      black: { username: "Bob", result: "checkmated" },
    }] : [] });
  };
  t.after(() => { globalThis.fetch = originalFetch; });

  const result = await checkSubmittedCustomSideQuestForProvider({
    quest: winQuest,
    provider: "chesscom",
    username: "alice",
    gameId: "https://www.chess.com/game/live/555123",
    activatedAfter: "2026-06-15T12:00:00.000Z",
  });

  assert.equal(result.status, "pending");
  assert.deepEqual(requested, [
    "https://api.chess.com/pub/player/alice/games/archives",
    "https://api.chess.com/pub/player/alice/games/2026/07",
    "https://api.chess.com/pub/player/alice/games/2026/06",
  ]);
});

test("submitted Chess.com custom proof ignores malicious and malformed archive URLs", async (t) => {
  const originalFetch = globalThis.fetch;
  const requested: string[] = [];
  globalThis.fetch = async (input) => {
    const url = String(input);
    requested.push(url);
    if (url.endsWith("/games/archives")) return Response.json({ archives: [
      "https://evil.example/pub/player/alice/games/2026/07",
      "http://api.chess.com/pub/player/alice/games/2026/07",
      "https://api.chess.com/pub/player/bob/games/2026/07",
      "https://api.chess.com/pub/player/alice/games/2026/07/extra",
      "https://api.chess.com/pub/player/alice/games/2026/07",
    ] });
    return Response.json({ games: [] });
  };
  t.after(() => { globalThis.fetch = originalFetch; });

  await checkSubmittedCustomSideQuestForProvider({
    quest: winQuest,
    provider: "chesscom",
    username: "Alice",
    gameId: "https://www.chess.com/game/live/123456",
  });

  assert.deepEqual(requested, [
    "https://api.chess.com/pub/player/Alice/games/archives",
    "https://api.chess.com/pub/player/alice/games/2026/07",
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

test("completed custom proof controls expose the Android result action instead of restart", () => {
  const html = renderToStaticMarkup(React.createElement(CustomSideQuestProofControls, {
    questId: "custom-win",
    active: false,
    playable: true,
    completed: true,
    completedAt: "2026-07-18T10:10:00.000Z",
    resultHref: "/proof/signed-custom-result",
  }));

  assert.match(html, />Completed Side Quest\.</);
  assert.match(html, /Completed Jul 18, 2026/);
  assert.match(html, /href="\/proof\/signed-custom-result"/);
  assert.match(html, />View result</);
  assert.doesNotMatch(html, />Start this Side Quest</);
});

test("completed custom proof controls keep the Android result action when a legacy receipt has no game details", () => {
  const html = renderToStaticMarkup(React.createElement(CustomSideQuestProofControls, {
    questId: "custom-win",
    active: false,
    playable: true,
    completed: true,
    resultHref: "/proof/signed-legacy-result",
  }));

  assert.match(html, />Completed Side Quest\.</);
  assert.match(html, /Your completion is saved/);
  assert.match(html, /href="\/proof\/signed-legacy-result"/);
  assert.match(html, />View result</);
  assert.doesNotMatch(html, />Start this Side Quest</);
});

test("completed legacy custom progress builds a truthful result path without a retained attempt", async () => {
  const path = await buildCompletedCustomPublicProofPath({
    completed: true,
    attempt: null,
    quest: winQuest,
  });
  const decoded = await decodePublicProof(path?.slice("/proof/".length));

  assert.ok(path);
  assert.ok(decoded);
  assert.equal(decoded.payload.challengeId, winQuest.id);
  assert.equal(decoded.payload.summary, "Completion saved by Side Quest Chess.");
  assert.equal(decoded.payload.gameId, undefined);
});

test("custom public proof paths never disclose a supplied account email", async () => {
  const legacyOptions = {
    attempt: null,
    quest: winQuest,
    runnerName: "private@example.com",
  };
  const path = await buildCustomPublicProofPath(legacyOptions);
  const decoded = await decodePublicProof(path.slice("/proof/".length));

  assert.ok(decoded);
  assert.equal(decoded.payload.runnerName, undefined);
  assert.doesNotMatch(path, /private|example/);
});

test("completed custom result selects the latest passed receipt even after a later failed check", () => {
  const latestPassed = getLatestPassedChallengeAttempt({
    challengeAttempts: [
      { id: "custom-win:1", challengeId: "custom-win", status: "passed", summary: "Passed first", checkedAt: "2026-07-17T10:00:00.000Z" },
      { id: "custom-win:2", challengeId: "custom-win", status: "passed", summary: "Passed latest", checkedAt: "2026-07-18T10:00:00.000Z", completedGameAt: "2026-07-18T09:58:00.000Z" },
      { id: "custom-win:3", challengeId: "custom-win", status: "failed", summary: "Failed later", checkedAt: "2026-07-19T10:00:00.000Z" },
      { id: "other:1", challengeId: "other", status: "passed", summary: "Other", checkedAt: "2026-07-20T10:00:00.000Z" },
    ],
  }, "custom-win");

  assert.equal(latestPassed?.id, "custom-win:2");
  assert.equal(latestPassed?.completedGameAt, "2026-07-18T09:58:00.000Z");
});

test("production submit verifier evaluates the immutable active custom quest snapshot", async (t) => {
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
    {
      lichessUsername: "alice",
      activeChallenge: {
        id: "custom-win",
        startedAt: "2026-07-18T09:00:00.000Z",
        customQuestSnapshot: winQuest,
      },
      customSideQuests: [{ ...winQuest, title: "Mutated title", config: JSON.stringify({ version: 2, logic: "all", blocks: [{ type: "gameResult", result: "lose" }] }) }],
    },
  );

  assert.equal(result.status, "passed");
  assert.equal(result.gameId, "Exact123");
});

test("latest custom checks keep active snapshot rules after mutable edit, delete, or ID collision", async (t) => {
  const previousNodeEnv = process.env.NODE_ENV;
  Object.defineProperty(process.env, "NODE_ENV", { value: "test", configurable: true, writable: true, enumerable: true });
  t.after(() => Object.defineProperty(process.env, "NODE_ENV", { value: previousNodeEnv, configurable: true, writable: true, enumerable: true }));
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(`${JSON.stringify({
    id: "Latest123",
    status: "mate",
    winner: "white",
    createdAt: Date.parse("2026-07-18T10:00:00.000Z"),
    lastMoveAt: Date.parse("2026-07-18T10:10:00.000Z"),
    moves: "e2e4 e7e5 d1h5 b8c6 f1c4 g8f6 h5f7",
    players: { white: { user: { name: "Alice" } }, black: { user: { name: "Bob" } } },
  })}\n`, { status: 200 });
  t.after(() => { globalThis.fetch = originalFetch; });

  const loseQuest = { ...winQuest, config: JSON.stringify({ version: 2, logic: "all", blocks: [{ type: "gameResult", result: "lose" }] }) };
  for (const customSideQuests of [[loseQuest], [], [{ ...loseQuest, id: "custom-win", lifecycle: "draft" as const }]]) {
    let written: unknown;
    const metadata = {
      lichessUsername: "alice",
      activeChallenge: { id: "custom-win", status: "accepted", startedAt: "2026-07-18T09:00:00.000Z", customQuestSnapshot: winQuest },
      customSideQuests,
    };
    const response = await withMobileQuestRouteTestDependencies({
      authenticate: async () => "server-user",
      getClient: async () => ({ users: {
        getUser: async () => ({ publicMetadata: metadata, privateMetadata: { customSideQuests } }),
        updateUserMetadata: async (_userId: string, value: unknown) => { written = value; },
      } }) as never,
    }, () => POST(new Request("https://sidequestchess.com/api/mobile/quest", { method: "POST", body: JSON.stringify({ action: "check" }) })));
    assert.equal(response.status, 200);
    assert.equal((written as { publicMetadata: { activeChallenge: { status: string } } }).publicMetadata.activeChallenge.status, "verified");
  }
});

test("latest custom checks persist only the canonical bounded active snapshot", async (t) => {
  const previousNodeEnv = process.env.NODE_ENV;
  Object.defineProperty(process.env, "NODE_ENV", { value: "test", configurable: true, writable: true, enumerable: true });
  t.after(() => Object.defineProperty(process.env, "NODE_ENV", { value: previousNodeEnv, configurable: true, writable: true, enumerable: true }));
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(`${JSON.stringify({
    id: "Latest123",
    status: "mate",
    winner: "white",
    createdAt: Date.parse("2026-07-18T10:00:00.000Z"),
    lastMoveAt: Date.parse("2026-07-18T10:10:00.000Z"),
    moves: "e2e4 e7e5 d1h5 b8c6 f1c4 g8f6 h5f7",
    players: { white: { user: { name: "Alice" } }, black: { user: { name: "Bob" } } },
  })}\n`, { status: 200 });
  t.after(() => { globalThis.fetch = originalFetch; });

  let written: unknown;
  const snapshotWithLegacyFields = { ...winQuest, summary: "legacy extra data", padding: "x".repeat(5_000) };
  const metadata = {
    lichessUsername: "alice",
    activeChallenge: { id: "custom-win", status: "accepted", startedAt: "2026-07-18T09:00:00.000Z", customQuestSnapshot: snapshotWithLegacyFields },
  };
  const response = await withMobileQuestRouteTestDependencies({
    authenticate: async () => "server-user",
    getClient: async () => ({ users: {
      getUser: async () => ({ publicMetadata: metadata, privateMetadata: {} }),
      updateUserMetadata: async (_userId: string, value: unknown) => { written = value; },
    } }) as never,
  }, () => POST(new Request("https://sidequestchess.com/api/mobile/quest", { method: "POST", body: JSON.stringify({ action: "check" }) })));

  assert.equal(response.status, 200);
  assert.deepEqual((written as { publicMetadata: { activeChallenge: { customQuestSnapshot: unknown } } }).publicMetadata.activeChallenge.customQuestSnapshot, {
    id: winQuest.id,
    title: winQuest.title,
    config: winQuest.config,
    lifecycle: "published",
  });
});

test("legacy active custom submission without a snapshot fails safely before provider lookup", async (t) => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => { calls += 1; return Response.json({}); };
  t.after(() => { globalThis.fetch = originalFetch; });

  const result = await verifySubmittedChallengeAttempt(
    "custom-win",
    { provider: "lichess", gameId: "Exact123" },
    {
      lichessUsername: "alice",
      activeChallenge: { id: "custom-win", startedAt: "2026-07-18T09:00:00.000Z" },
      customSideQuests: [winQuest],
    },
  );

  assert.equal(result.status, "pending");
  assert.match(result.summary, /restart/i);
  assert.equal(calls, 0);
});

test("production submit verifier never falls back to a mutable draft custom quest", async (t) => {
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
  assert.match(result.summary, /restart/i);
  assert.equal(calls, 0);
});

test("immutable custom snapshot accepts exact title/config limits without truncation", async () => {
  const snapshot = { ...winQuest, title: "T".repeat(80), config: validConfigWithUtf8Bytes(1200) };
  let persisted: unknown;
  const result = await submitMobileChallengeAttempt(
    "user-1",
    { lichessUsername: "alice", activeChallenge: { id: snapshot.id, startedAt: "2026-07-18T09:00:00.000Z", customQuestSnapshot: snapshot } },
    {},
    snapshot.id,
    "Exact123",
    {
      now: () => "2026-07-18T11:00:00.000Z",
      verifySubmitted: async () => ({ status: "failed", gameId: "Exact123", summary: "completed evaluation", startedGameAt: "2026-07-18T10:00:00.000Z" }),
      persistPublicMetadata: async (_userId, _metadata, patch) => { persisted = patch; },
    },
  );

  assert.deepEqual(result, { challengeId: snapshot.id, completed: false });
  assert.deepEqual((persisted as { activeChallenge: { customQuestSnapshot: unknown } }).activeChallenge.customQuestSnapshot, {
    id: snapshot.id,
    title: snapshot.title,
    config: snapshot.config,
    lifecycle: "published",
  });
});

test("immutable custom snapshot rejects title/config limit plus one before provider or persistence", async () => {
  for (const snapshot of [
    { ...winQuest, title: "T".repeat(81) },
    { ...winQuest, config: validConfigWithUtf8Bytes(1201) },
  ]) {
    let providerCalls = 0;
    let persistenceCalls = 0;
    await assert.rejects(() => submitMobileChallengeAttempt(
      "user-1",
      { lichessUsername: "alice", activeChallenge: { id: snapshot.id, startedAt: "2026-07-18T09:00:00.000Z", customQuestSnapshot: snapshot } },
      {},
      snapshot.id,
      "Exact123",
      {
        now: () => "2026-07-18T11:00:00.000Z",
        verifySubmitted: async () => { providerCalls += 1; return { status: "failed", gameId: "Exact123", summary: "completed evaluation" }; },
        persistPublicMetadata: async () => { persistenceCalls += 1; },
      },
    ), /restart/i);
    assert.equal(providerCalls, 0);
    assert.equal(persistenceCalls, 0);
  }
});

test("production custom submit rejects the wrong active target without provider or persistence calls", async () => {
  let providerCalls = 0;
  let persistenceCalls = 0;
  await assert.rejects(() => submitMobileChallengeAttempt(
    "user-1",
    { lichessUsername: "alice", activeChallenge: { id: "different", startedAt: "2026-07-18T09:00:00.000Z" } },
    {},
    "custom-win",
    "Exact123",
    {
      now: () => "2026-07-18T11:00:00.000Z",
      verifySubmitted: async () => { providerCalls += 1; return { status: "passed", gameId: "Exact123", summary: "passed", startedGameAt: "2026-07-18T10:00:00.000Z" }; },
      persistPublicMetadata: async () => { persistenceCalls += 1; },
    },
  ), /Start this Side Quest/);
  assert.equal(providerCalls, 0);
  assert.equal(persistenceCalls, 0);
});

test("production custom submit rejects proof started before server activation without persistence", async () => {
  let persistenceCalls = 0;
  const activeChallenge = { id: "custom-win", status: "accepted", startedAt: "2026-07-18T09:00:00.000Z", customQuestSnapshot: winQuest };
  await assert.rejects(() => submitMobileChallengeAttempt(
    "user-1",
    { lichessUsername: "alice", activeChallenge },
    {},
    "custom-win",
    "Exact123",
    {
      now: () => "2026-07-18T11:00:00.000Z",
      verifySubmitted: async () => ({ status: "passed", gameId: "Exact123", summary: "passed", startedGameAt: "2026-07-18T08:59:59.000Z" }),
      persistPublicMetadata: async () => { persistenceCalls += 1; },
    },
  ), /fresh public game after starting/i);
  assert.equal(persistenceCalls, 0);
});

test("production submit treats every pending exact-game result as rejection with zero persistence", async () => {
  const activeChallenge = { id: "custom-win", status: "accepted", startedAt: "2026-07-18T09:00:00.000Z", customQuestSnapshot: winQuest };
  for (const summary of [
    "Add your Lichess username before submitting proof.",
    "Could not load public Lichess game for this user.",
    "Restart this custom Side Quest because its rules are invalid.",
  ]) {
    let persistenceCalls = 0;
    await assert.rejects(() => submitMobileChallengeAttempt(
      "user-1",
      { lichessUsername: "alice", activeChallenge },
      {},
      "custom-win",
      "Exact123",
      {
        now: () => "2026-07-18T11:00:00.000Z",
        verifySubmitted: async () => ({ status: "pending", gameId: "Exact123", summary }),
        persistPublicMetadata: async () => { persistenceCalls += 1; },
      },
    ), new RegExp(summary.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
    assert.equal(persistenceCalls, 0);
  }
});

test("production custom submit persists the exact successful patch", async () => {
  const activeChallenge = { id: "custom-win", status: "accepted", startedAt: "2026-07-18T09:00:00.000Z", customQuestSnapshot: winQuest };
  const metadata = { lichessUsername: "alice", activeChallenge, challengeAttempts: [], challengeProgress: { completedChallengeIds: [], totalCompletedChallenges: 0, totalRewardPoints: 0 } };
  let persisted: unknown;
  const result = await submitMobileChallengeAttempt("user-1", metadata, {}, "custom-win", "Exact123", {
    now: () => "2026-07-18T11:00:00.000Z",
    verifySubmitted: async () => ({ status: "passed", gameId: "Exact123", summary: "Exact pass", startedGameAt: "2026-07-18T10:00:00.000Z", completedGameAt: "2026-07-18T10:10:00.000Z", playerColor: "white" }),
    persistPublicMetadata: async (_userId, _metadata, patch) => { persisted = patch; },
  });

  assert.deepEqual(result, { challengeId: "custom-win", completed: true });
  assert.deepEqual(persisted, {
    activeChallenge: { id: "custom-win", status: "verified", startedAt: "2026-07-18T09:00:00.000Z", verifiedAt: "2026-07-18T11:00:00.000Z", customQuestSnapshot: { id: "custom-win", title: "Win exactly this game", config: winQuest.config, lifecycle: "published" } },
    challengeAttempts: [{ id: "custom-win:lichess:submitted:2026-07-18T11:00:00.000Z", challengeId: "custom-win", gameId: "Exact123", provider: "lichess", status: "passed", summary: "Exact pass", checkedAt: "2026-07-18T11:00:00.000Z", startedGameAt: "2026-07-18T10:00:00.000Z", completedGameAt: "2026-07-18T10:10:00.000Z", finalPositionFen: undefined, lastMoveUci: undefined, lastMoveSan: undefined, playerColor: "white", failureDiagnostic: undefined }],
    challengeProgress: { completedChallengeIds: ["custom-win"], totalCompletedChallenges: 1, totalRewardPoints: 100 },
  });
});

test("exported mobile quest POST derives the user server-side and writes the exact submit patch", async (t) => {
  const previousNodeEnv = process.env.NODE_ENV;
  Object.defineProperty(process.env, "NODE_ENV", { value: "test", configurable: true, writable: true, enumerable: true });
  t.after(() => Object.defineProperty(process.env, "NODE_ENV", { value: previousNodeEnv, configurable: true, writable: true, enumerable: true }));
  const activeChallenge = { id: "custom-win", status: "accepted", startedAt: "2026-07-18T09:00:00.000Z", customQuestSnapshot: winQuest };
  const metadata = { lichessUsername: "alice", activeChallenge, challengeAttempts: [], challengeProgress: { completedChallengeIds: [], totalCompletedChallenges: 0, totalRewardPoints: 0 } };
  const writes: Array<{ userId: string; patch: unknown }> = [];
  const dependencies = {
    authenticate: async () => "server-user",
    getClient: async () => ({ users: { getUser: async () => ({ publicMetadata: metadata, privateMetadata: {} }) } }) as never,
    submitAttemptDependencies: {
      now: () => "2026-07-18T11:00:00.000Z",
      verifySubmitted: async () => ({ status: "failed" as const, gameId: "Exact123", summary: "Exact fail", startedGameAt: "2026-07-18T10:00:00.000Z" }),
      persistPublicMetadata: async (userId: string, _metadata: unknown, patch: unknown) => { writes.push({ userId, patch }); },
    },
  };
  const response = await withMobileQuestRouteTestDependencies(dependencies, () => POST(new Request("https://sidequestchess.com/api/mobile/quest", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action: "submit", challengeId: "custom-win", gameId: "Exact123", userId: "attacker" }),
  })));
  assert.equal(response.status, 200);
  assert.equal(writes[0]?.userId, "server-user");
  assert.deepEqual(writes[0]?.patch, {
    activeChallenge: { id: "custom-win", status: "failed", startedAt: "2026-07-18T09:00:00.000Z", verifiedAt: undefined, customQuestSnapshot: { id: "custom-win", title: winQuest.title, config: winQuest.config, lifecycle: "published" } },
    challengeAttempts: [{ id: "custom-win:lichess:submitted:2026-07-18T11:00:00.000Z", challengeId: "custom-win", gameId: "Exact123", provider: "lichess", status: "failed", summary: "Exact fail", checkedAt: "2026-07-18T11:00:00.000Z", startedGameAt: "2026-07-18T10:00:00.000Z", completedGameAt: undefined, finalPositionFen: undefined, lastMoveUci: undefined, lastMoveSan: undefined, playerColor: undefined, failureDiagnostic: undefined }],
    challengeProgress: { completedChallengeIds: [], totalCompletedChallenges: 0, totalRewardPoints: 0 },
  });

  for (const [authenticate, body, expectedStatus] of [[async () => null, "{}", 401], [async () => "server-user", "{", 400]] as const) {
    const before = writes.length;
    const rejected = await withMobileQuestRouteTestDependencies({ ...dependencies, authenticate }, () => POST(new Request("https://sidequestchess.com/api/mobile/quest", { method: "POST", body })));
    assert.equal(rejected.status, expectedStatus);
    assert.equal(writes.length, before);
  }
});
