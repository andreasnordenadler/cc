import assert from "node:assert/strict";
import test from "node:test";

const accessModule = import("../src/lib/groupquest-edit-access").catch(() => null);

test("Multiplayer owner edit access is session-derived and exact-resource scoped", async () => {
  const accessContract = await accessModule;
  assert.ok(accessContract, "owner edit access contract is missing");
  const decide = accessContract.getGroupQuestEditAccess;
  const endpoint = accessContract.getGroupQuestEditEndpoint;
  const detailHref = accessContract.getGroupQuestDetailHref;
  const canonicalOwner = accessContract.isCanonicalGroupQuestOwner;
  const quest = { id: "community/table", hostUserId: "host-1", storageUserId: "host-1", finished: false };

  assert.equal(endpoint(quest.id), "/api/groupquests/community%2Ftable");
  assert.equal(detailHref(quest.id, true), "/groupquests/community%2Ftable?accepted=1");
  assert.equal(canonicalOwner("host-1", quest), true);
  assert.equal(canonicalOwner("host-1", { ...quest, storageUserId: "participant-1" }), false);

  assert.deepEqual(decide({ userId: null, quest }), {
    kind: "redirect",
    href: "/sign-in?redirect_url=%2Fgroupquests%2Fcommunity%252Ftable%2Fedit",
  });
  assert.deepEqual(decide({ userId: "intruder", quest }), {
    kind: "redirect",
    href: "/groupquests/community%2Ftable",
  });
  assert.deepEqual(decide({ userId: "host-1", quest }), { kind: "render" });
  assert.deepEqual(decide({ userId: "host-1", quest: { ...quest, storageUserId: "participant-1" } }), {
    kind: "redirect",
    href: "/groupquests/community%2Ftable",
  });
  assert.deepEqual(decide({ userId: "host-1", quest: { ...quest, finished: true } }), {
    kind: "redirect",
    href: "/groupquests/community%2Ftable",
  });
  assert.deepEqual(decide({ userId: "host-1", quest: null }), { kind: "not-found" });
});
