import assert from "node:assert/strict";
import test from "node:test";
import { deleteAuthenticatedAccount, DELETE_ACCOUNT_CONFIRMATION } from "../src/lib/account-deletion";

test("rejects deletion when there is no authenticated user", async () => {
  let deletedUserId: string | null = null;

  const result = await deleteAuthenticatedAccount(
    { authenticatedUserId: null, confirmation: DELETE_ACCOUNT_CONFIRMATION },
    { purgeReplicatedUserData: async () => {}, deleteUser: async (userId) => { deletedUserId = userId; } },
  );

  assert.deepEqual(result, { ok: false, status: 401, code: "unauthenticated", message: "Sign in to delete your account." });
  assert.equal(deletedUserId, null);
});

test("requires the exact destructive confirmation phrase", async () => {
  let calls = 0;

  const result = await deleteAuthenticatedAccount(
    { authenticatedUserId: "user_current", confirmation: "delete my account" },
    { purgeReplicatedUserData: async () => {}, deleteUser: async () => { calls += 1; } },
  );

  assert.equal(result.ok, false);
  assert.equal(result.status, 400);
  assert.equal(result.code, "confirmation_required");
  assert.equal(calls, 0);
});

test("deletes only the authenticated account without accepting a target user id", async () => {
  const deleted: string[] = [];

  const result = await deleteAuthenticatedAccount(
    { authenticatedUserId: "user_current", confirmation: DELETE_ACCOUNT_CONFIRMATION },
    { purgeReplicatedUserData: async () => {}, deleteUser: async (userId) => { deleted.push(userId); } },
  );

  assert.deepEqual(deleted, ["user_current"]);
  assert.deepEqual(result, {
    ok: true,
    status: 200,
    code: "account_deleted",
    message: "Your Side Quest Chess account and its Clerk data were deleted.",
  });
});

test("stops before identity deletion when replicated data cleanup fails", async () => {
  let deleteCalls = 0;
  const result = await deleteAuthenticatedAccount(
    { authenticatedUserId: "user_current", confirmation: DELETE_ACCOUNT_CONFIRMATION },
    {
      purgeReplicatedUserData: async () => { throw new Error("cleanup failed"); },
      deleteUser: async () => { deleteCalls += 1; },
    },
  );

  assert.equal(result.ok, false);
  assert.equal(result.status, 503);
  assert.equal(result.code, "cleanup_temporarily_unavailable");
  assert.equal(deleteCalls, 0);
});

test("returns a retryable safe error when Clerk deletion fails", async () => {
  const result = await deleteAuthenticatedAccount(
    { authenticatedUserId: "user_current", confirmation: DELETE_ACCOUNT_CONFIRMATION },
    { purgeReplicatedUserData: async () => {}, deleteUser: async () => { throw new Error("secret upstream response"); } },
  );

  assert.deepEqual(result, {
    ok: false,
    status: 503,
    code: "deletion_temporarily_unavailable",
    message: "We could not delete your account right now. No deletion was reported as complete; please try again.",
  });
});
