import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { deleteMobileAccountAndEndSession } from "../apps/mobile/src/account/deleteMobileAccount";
import { DELETE_ACCOUNT_CONFIRMATION } from "../src/lib/account-deletion";

test("mobile account deletion ends the local session after server deletion", async () => {
  const calls: string[] = [];
  const result = await deleteMobileAccountAndEndSession({
    confirmation: DELETE_ACCOUNT_CONFIRMATION,
    getSessionToken: async () => "session-token",
    deleteAccount: async ({ sessionToken, confirmation }) => {
      calls.push(`delete:${sessionToken}:${confirmation}`);
      return { ok: true, code: "account_deleted", message: "deleted" };
    },
    signOut: async () => {
      calls.push("sign-out");
    },
  });

  assert.deepEqual(calls, [`delete:session-token:${DELETE_ACCOUNT_CONFIRMATION}`, "sign-out"]);
  assert.deepEqual(result, { sessionEnded: true });
});

test("a post-deletion sign-out failure does not turn a completed deletion into an error", async () => {
  let deleted = false;
  const result = await deleteMobileAccountAndEndSession({
    confirmation: DELETE_ACCOUNT_CONFIRMATION,
    getSessionToken: async () => "session-token",
    deleteAccount: async () => {
      deleted = true;
      return { ok: true, code: "account_deleted", message: "deleted" };
    },
    signOut: async () => {
      throw new Error("local sign-out failed");
    },
  });

  assert.equal(deleted, true);
  assert.deepEqual(result, { sessionEnded: false });
});

test("successful deletion copy does not claim retained safety records were deleted", async () => {
  const appSource = await readFile(path.resolve("apps/mobile/App.tsx"), "utf8");
  const successCopy = appSource.slice(appSource.indexOf('"Account deleted"'), appSource.indexOf("onSelectTab", appSource.indexOf('"Account deleted"')));

  assert.match(successCopy, /Your Side Quest Chess account was permanently deleted/);
  assert.doesNotMatch(successCopy, /saved data were permanently deleted/);
});

test("a server deletion failure remains an error and does not sign out", async () => {
  let signedOut = false;
  await assert.rejects(
    deleteMobileAccountAndEndSession({
      confirmation: DELETE_ACCOUNT_CONFIRMATION,
      getSessionToken: async () => "session-token",
      deleteAccount: async () => {
        throw new Error("deletion failed");
      },
      signOut: async () => {
        signedOut = true;
      },
    }),
    /deletion failed/,
  );

  assert.equal(signedOut, false);
});

test("a resolved non-success deletion response remains an error and does not sign out", async () => {
  let signedOut = false;
  await assert.rejects(
    deleteMobileAccountAndEndSession({
      confirmation: DELETE_ACCOUNT_CONFIRMATION,
      getSessionToken: async () => "session-token",
      deleteAccount: async () => ({
        ok: false,
        code: "deletion_temporarily_unavailable",
        message: "Please try again.",
      }),
      signOut: async () => {
        signedOut = true;
      },
    }),
    /Please try again/,
  );

  assert.equal(signedOut, false);
});