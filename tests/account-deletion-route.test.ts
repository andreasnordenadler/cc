import assert from "node:assert/strict";
import test from "node:test";
import { handleAccountDeletionRequest } from "../src/lib/account-deletion-route";
import { DELETE_ACCOUNT_CONFIRMATION } from "../src/lib/account-deletion";

test("account deletion request rejects malformed JSON without invoking Clerk", async () => {
  let calls = 0;
  const response = await handleAccountDeletionRequest(
    new Request("https://sqc.test/api/account", { method: "DELETE", body: "not json" }),
    { getAuthenticatedUserId: async () => "user_current", purgeReplicatedUserData: async () => {}, deleteUser: async () => { calls += 1; } },
  );

  assert.equal(response.status, 400);
  assert.equal(calls, 0);
  assert.equal((await response.json()).code, "invalid_request");
});

test("account deletion request derives identity from auth and ignores supplied userId", async () => {
  const deleted: string[] = [];
  const response = await handleAccountDeletionRequest(
    new Request("https://sqc.test/api/account", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ confirmation: DELETE_ACCOUNT_CONFIRMATION, userId: "user_victim" }),
    }),
    { getAuthenticatedUserId: async () => "user_current", purgeReplicatedUserData: async () => {}, deleteUser: async (userId) => { deleted.push(userId); } },
  );

  assert.equal(response.status, 200);
  assert.deepEqual(deleted, ["user_current"]);
  assert.equal((await response.json()).code, "account_deleted");
});
