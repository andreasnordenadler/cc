import assert from "node:assert/strict";
import test from "node:test";
import { POST, DELETE, withCustomQuestRouteTestDependencies } from "../src/app/api/mobile/custom-quests/route";
import type { CustomSideQuest } from "../src/lib/custom-side-quests";
import type { UserMetadataRecord } from "../src/lib/user-metadata";

const quest = (index: number): CustomSideQuest => ({
  id: `custom-${index}`, title: `Quest ${index}`, summary: "Preserved quest",
  config: JSON.stringify({ version: 2, logic: "all", blocks: [{ type: "gameResult", result: "win" }] }),
  lifecycle: "published", visibility: "private", createdAt: "2026-07-01T00:00:00.000Z",
  updatedAt: "2026-07-01T00:00:00.000Z", badgeImageUrl: "/badges/custom/community/community-coat-08.png",
});
type Patch = { privateMetadata?: UserMetadataRecord; publicMetadata?: UserMetadataRecord };
const operations = ["create", "edit", "delete", "delete-active"] as const;
const faults = ["none", "transient", "capacity", "cleanup-only"] as const;

for (const operation of operations) {
  for (const fault of faults) {
    test(`exported route ${operation}: ${fault} never evicts quests or clears unrelated metadata`, async (t) => {
      const previous = process.env.NODE_ENV;
      Object.defineProperty(process.env, "NODE_ENV", { value: "test", configurable: true, writable: true, enumerable: true });
      t.after(() => {
        if (previous === undefined) delete (process.env as Record<string, string | undefined>).NODE_ENV;
        else Object.defineProperty(process.env, "NODE_ENV", { value: previous, configurable: true, writable: true, enumerable: true });
      });
      // Beyond both historical caps (8 in writes and 20 in the shared reader).
      const library = Array.from({ length: 24 }, (_, index) => quest(index));
      const original = {
        privateMetadata: { customSideQuests: library, sqcAdmin: false, rewards: { xp: 120 }, receipts: ["receipt-1"], settings: { sound: false }, futureKey: "keep" } as UserMetadataRecord,
        publicMetadata: { activeChallenge: { id: operation === "delete-active" ? "custom-0" : "official-1" }, username: "owner" } as UserMetadataRecord,
      };
      const state = structuredClone(original);
      const writes: Patch[] = [];
      const deleting = operation.startsWith("delete");
      const response = await withCustomQuestRouteTestDependencies({
        authenticate: async () => "fake-owner",
        getClient: async () => ({ users: {
          getUser: async (id: string) => { assert.equal(id, "fake-owner"); return structuredClone(state); },
          updateUserMetadata: async (id: string, patch: Patch) => {
            assert.equal(id, "fake-owner");
            writes.push(structuredClone(patch));
            // Model Clerk's merge/delete-null semantics; rejected writes do not mutate storage.
            if (fault === "capacity" || (fault === "transient" && writes.length === 1)
              || (fault === "cleanup-only" && !Object.entries(patch.privateMetadata ?? {}).some(([key, value]) => key !== "customSideQuests" && value === null))) {
              throw new Error(fault === "transient" ? "upstream unavailable" : "metadata exceeds the maximum allowed size");
            }
            for (const kind of ["privateMetadata", "publicMetadata"] as const) {
              for (const [key, value] of Object.entries(patch[kind] ?? {})) {
                if (value === null) delete state[kind][key];
                else state[kind][key] = structuredClone(value);
              }
            }
            return structuredClone(state);
          },
        } }) as never,
      }, () => deleting
        ? DELETE(new Request("https://sqc.test/api/mobile/custom-quests?id=custom-0", { method: "DELETE" }))
        : POST(new Request("https://sqc.test/api/mobile/custom-quests", { method: "POST", body: JSON.stringify({
          ...(operation === "edit" ? { id: "custom-0" } : {}), title: "Saved quest", config: quest(0).config,
        }) })));
      const body = await response.json();
      const intendedCount = operation === "create" ? 25 : deleting ? 23 : 24;
      // Inspect every attempted patch, not merely the eventual response.
      for (const patch of writes) {
        assert.deepEqual(Object.keys(patch.privateMetadata ?? {}), ["customSideQuests"]);
        const attempted = patch.privateMetadata?.customSideQuests as CustomSideQuest[];
        assert.equal(attempted.length, intendedCount);
        assert.deepEqual(attempted.filter(item => item.id !== "custom-0" && library.some(old => old.id === item.id)), library.slice(1));
      }
      assert.equal(writes.length, 1, "no destructive fallback attempts");
      if (fault !== "none") {
        assert.notEqual(response.status, 200);
        assert.equal(body.ok, false);
        assert.equal(body.customQuest, undefined);
        assert.equal(body.customSideQuests, undefined);
        assert.doesNotMatch(body.message, /cleaned up|Custom Side Quest saved\./i);
        assert.deepEqual(state, original);
      } else {
        assert.equal(response.status, 200);
        assert.equal(body.ok, true);
        assert.deepEqual(body.customSideQuests, state.privateMetadata.customSideQuests);
        assert.equal(body.customSideQuests.length, intendedCount);
        for (const [key, value] of Object.entries(original.privateMetadata)) {
          if (key !== "customSideQuests") assert.deepEqual(state.privateMetadata[key], value);
        }
        assert.deepEqual(state.publicMetadata, operation === "delete-active" ? { username: "owner" } : original.publicMetadata);
      }
    });
  }
}

for (const handler of [POST, DELETE]) {
  test(`${handler.name} ignores stale async-local test dependencies in production`, async () => {
    const previous = process.env.NODE_ENV;
    const setEnv = (value: string | undefined) => {
      if (value === undefined) delete (process.env as Record<string, string | undefined>).NODE_ENV;
      else Object.defineProperty(process.env, "NODE_ENV", { value, configurable: true, writable: true, enumerable: true });
    };
    let calls = 0;
    try {
      setEnv("test");
      await withCustomQuestRouteTestDependencies({
        authenticate: async () => { calls++; return "fake-owner"; },
        getClient: async () => { calls++; throw new Error("test provider must not load"); },
      }, async () => {
        setEnv("production");
        const response = await handler(new Request("https://sqc.test/api/mobile/custom-quests?id=custom-0", { method: handler.name }));
        assert.equal(response.status, 401);
      });
      assert.equal(calls, 0);
      assert.throws(() => withCustomQuestRouteTestDependencies({ authenticate: async () => null, getClient: async () => { throw new Error("unused"); } }, () => undefined), /test-only/);
    } finally { setEnv(previous); }
  });
}
