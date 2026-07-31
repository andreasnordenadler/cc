import assert from "node:assert/strict";
import test from "node:test";

import {
  DELETE,
  withCustomQuestRouteTestDependencies,
} from "../src/app/api/mobile/custom-quests/route";
import {
  handleCustomQuestDeleteRequest,
  type CustomQuestDeleteDependencies,
} from "../src/lib/custom-quest-delete-route";
import type { CustomSideQuest } from "../src/lib/custom-side-quests";

const quest = (id: string): CustomSideQuest => ({
  id,
  title: id,
  summary: "Owner quest",
  config: JSON.stringify({ version: 2, logic: "all", blocks: [{ type: "gameResult", result: "win" }] }),
  visibility: "private",
  lifecycle: "published",
  createdAt: "2026-07-01T00:00:00.000Z",
  updatedAt: "2026-07-01T00:00:00.000Z",
  badgeImageUrl: "/badges/custom/community/community-coat-08.png",
});

test("custom quest delete removes the exact quest from the authenticated owner's library", async () => {
  const target = quest("custom-target");
  const untouched = quest("custom-untouched");
  const writes: unknown[] = [];
  const dependencies: CustomQuestDeleteDependencies = {
    getAuthenticatedUserId: async () => "owner-1",
    getMetadata: async () => ({
      publicMetadata: { activeChallenge: { id: "official-other" } },
      privateMetadata: { customSideQuests: [target, untouched], preserved: true },
    }),
    persistDeletion: async (userId, input) => {
      writes.push({ userId, input });
      return input.customSideQuests;
    },
  };

  const response = await handleCustomQuestDeleteRequest(
    new Request("https://sqc.test/api/mobile/custom-quests?id=custom-target&userId=attacker", { method: "DELETE" }),
    dependencies,
  );

  assert.equal(response.status, 200);
  assert.deepEqual(writes, [{
    userId: "owner-1",
    input: {
      customSideQuests: [untouched],
      privateMetadata: { customSideQuests: [target, untouched], preserved: true },
      publicMetadata: { activeChallenge: { id: "official-other" } },
      clearActiveChallenge: false,
    },
  }]);
  assert.deepEqual(await response.json(), {
    apiVersion: 1,
    authenticated: true,
    ok: true,
    action: "delete",
    customSideQuests: [untouched],
    message: "Custom Side Quest deleted.",
  });
});

test("custom quest delete rejects an ID outside the authenticated owner's library without writing", async () => {
  let writes = 0;
  const response = await handleCustomQuestDeleteRequest(
    new Request("https://sqc.test/api/mobile/custom-quests?id=custom-not-owned", { method: "DELETE" }),
    {
      getAuthenticatedUserId: async () => "owner-1",
      getMetadata: async () => ({
        publicMetadata: {},
        privateMetadata: { customSideQuests: [quest("custom-owned")] },
      }),
      persistDeletion: async () => {
        writes += 1;
        return [];
      },
    },
  );

  assert.equal(response.status, 404);
  assert.equal(writes, 0);
  assert.deepEqual(await response.json(), {
    apiVersion: 1,
    authenticated: true,
    ok: false,
    message: "That Custom Side Quest was not found in your library.",
  });
});

test("exported custom quest DELETE route clears the authenticated owner's matching active quest", async (t) => {
  const previousNodeEnv = process.env.NODE_ENV;
  Object.defineProperty(process.env, "NODE_ENV", { value: "test", configurable: true, writable: true, enumerable: true });
  t.after(() => Object.defineProperty(process.env, "NODE_ENV", { value: previousNodeEnv, configurable: true, writable: true, enumerable: true }));
  const target = quest("custom-active");
  const writes: unknown[] = [];
  const response = await withCustomQuestRouteTestDependencies({
    authenticate: async () => "owner-1",
    getClient: async () => ({ users: {
      getUser: async () => ({
        publicMetadata: { activeChallenge: { id: target.id, status: "accepted" } },
        privateMetadata: { customSideQuests: [target] },
      }),
      updateUserMetadata: async (userId: string, patch: unknown) => {
        writes.push({ userId, patch });
      },
    } }) as never,
  }, () => DELETE(new Request(`https://sqc.test/api/mobile/custom-quests?id=${target.id}`, { method: "DELETE" })));

  assert.equal(response.status, 200);
  assert.deepEqual(writes, [{
    userId: "owner-1",
    patch: {
      publicMetadata: { activeChallenge: null },
      privateMetadata: { customSideQuests: [] },
    },
  }]);
});

test("exported custom quest DELETE route rejects signed-out requests before loading provider data", async (t) => {
  const previousNodeEnv = process.env.NODE_ENV;
  Object.defineProperty(process.env, "NODE_ENV", { value: "test", configurable: true, writable: true, enumerable: true });
  t.after(() => Object.defineProperty(process.env, "NODE_ENV", { value: previousNodeEnv, configurable: true, writable: true, enumerable: true }));
  let clientLoads = 0;
  const response = await withCustomQuestRouteTestDependencies({
    authenticate: async () => null,
    getClient: async () => {
      clientLoads += 1;
      throw new Error("provider must not load");
    },
  }, () => DELETE(new Request("https://sqc.test/api/mobile/custom-quests?id=custom-target", { method: "DELETE" })));

  assert.equal(response.status, 401);
  assert.equal(clientLoads, 0);
});
