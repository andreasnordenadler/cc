import assert from "node:assert/strict";
import test from "node:test";
import { purgeUserFromGroupQuestMetadata } from "../src/lib/account-deletion-cleanup";

test("removes quests hosted by the deleted user and participant records from other quests", () => {
  const metadata = {
    untouched: true,
    sqcGroupQuests: [
      { id: "hosted", hostUserId: "user_deleted", participants: [{ userId: "someone" }] },
      { id: "joined", hostUserId: "host", participants: [{ userId: "user_deleted", username: "personal" }, { userId: "someone" }] },
      { id: "other", hostUserId: "host", participants: [{ userId: "someone" }] },
    ],
  };

  const result = purgeUserFromGroupQuestMetadata(metadata, "user_deleted");

  assert.equal(result.changed, true);
  assert.deepEqual(result.metadata, {
    untouched: true,
    sqcGroupQuests: [
      { id: "joined", hostUserId: "host", participants: [{ userId: "someone" }] },
      { id: "other", hostUserId: "host", participants: [{ userId: "someone" }] },
    ],
  });
});

test("does not write metadata when no replicated account data exists", () => {
  const metadata = { sqcGroupQuests: [{ id: "other", hostUserId: "host", participants: [] }] };
  const result = purgeUserFromGroupQuestMetadata(metadata, "user_deleted");
  assert.equal(result.changed, false);
  assert.equal(result.metadata, metadata);
});
