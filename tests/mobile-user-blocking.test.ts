import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { POST, withUserBlockRouteTestDependencies } from "../src/app/api/blocks/users/route";
import { filterBlockedCommunityGroupQuests } from "../src/lib/user-blocking";
import { blockMobileCommunityCreator } from "../apps/mobile/src/api/sqc";

function setNodeEnv(value: string | undefined) {
  Object.defineProperty(process.env, "NODE_ENV", { value, configurable: true, enumerable: true, writable: true });
}

test("authenticated Android user blocks the canonical creator behind a public Community Multiplayer quest", async (t) => {
  const previousNodeEnv = process.env.NODE_ENV;
  setNodeEnv("test");
  t.after(() => setNodeEnv(previousNodeEnv));
  const writes: Array<{ userId: string; privateMetadata: Record<string, unknown> }> = [];

  const response = await withUserBlockRouteTestDependencies({
    authenticate: async () => "viewer-user",
    getClient: async () => ({ users: {
      getUser: async () => ({ privateMetadata: { unrelated: "preserved" } }),
      updateUserMetadata: async (userId: string, update: { privateMetadata: Record<string, unknown> }) => {
        writes.push({ userId, privateMetadata: update.privateMetadata });
      },
    } }) as never,
    findTarget: async () => ({
      userId: "creator-user",
      groupQuest: { id: "community/table", hostUserId: "creator-user", inviteMode: "public", official: false },
    }) as never,
    now: () => new Date("2026-08-03T03:00:00.000Z"),
  }, () => POST(new Request("https://sidequestchess.com/api/blocks/users", {
    method: "POST",
    headers: { "content-type": "application/json", "x-side-quest-chess-client": "android" },
    body: JSON.stringify({ targetType: "community-multiplayer", targetId: "community/table", action: "block" }),
  })));

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    ok: true,
    action: "blocked",
    message: "Creator blocked. Their Community content will no longer appear in discovery.",
  });
  assert.equal(writes.length, 1);
  assert.equal(writes[0]?.userId, "viewer-user");
  assert.equal(writes[0]?.privateMetadata.unrelated, "preserved");
  assert.deepEqual(writes[0]?.privateMetadata.sqcBlockedUsers, [{
    userId: "creator-user",
    blockedAt: "2026-08-03T03:00:00.000Z",
    source: "mobile",
  }]);
});

test("blocked creators are removed from Community Multiplayer discovery without hiding official quests", () => {
  const quests = [
    { id: "blocked", hostUserId: "blocked-user", official: false },
    { id: "visible", hostUserId: "visible-user", official: false },
    { id: "official", hostUserId: "blocked-user", official: true },
  ];

  assert.deepEqual(
    filterBlockedCommunityGroupQuests(quests, new Set(["blocked-user"])).map((quest) => quest.id),
    ["visible", "official"],
  );
});

test("Android block action sends only the exact Community Multiplayer target", async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  let captured: { url: string; authorization: string | null; client: string | null; body: unknown } | null = null;
  globalThis.fetch = async (input, init) => {
    const request = new Request(input, init);
    captured = {
      url: request.url,
      authorization: request.headers.get("authorization"),
      client: request.headers.get("x-side-quest-chess-client"),
      body: await request.json(),
    };
    return Response.json({ ok: true, action: "blocked", message: "Creator blocked. Their Community content will no longer appear in discovery." });
  };

  const result = await blockMobileCommunityCreator({ sessionToken: "session-token", targetId: "community/table" });
  assert.deepEqual(captured, {
    url: "https://sidequestchess.com/api/blocks/users",
    authorization: "Bearer session-token",
    client: "android",
    body: { targetType: "community-multiplayer", targetId: "community/table", action: "block" },
  });
  assert.equal(result.action, "blocked");
});

test("Android Community Multiplayer safety sheet exposes a distinct creator-blocking control", () => {
  const source = readFileSync(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  assert.match(source, /accessibilityLabel="Block Community creator"/);
  assert.match(source, /blockMobileCommunityCreator\(/);
});

test("Clerk proxy covers the authenticated user-blocking endpoint", () => {
  const source = readFileSync(new URL("../src/proxy.ts", import.meta.url), "utf8");
  assert.match(source, /"\/api\/blocks\/\(\.\*\)"/);
});
