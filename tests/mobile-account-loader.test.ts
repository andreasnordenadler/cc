import assert from "node:assert/strict";
import test from "node:test";

import { loadMobileAccount } from "../apps/mobile/src/account/loadMobileAccount";

test("loading an account performs one request even when applying a new account object", async () => {
  let requests = 0;
  let appliedAccount: { authenticated: boolean } | null = null;
  const account = { authenticated: true };

  const result = await loadMobileAccount({
    isLoaded: true,
    isSignedIn: true,
    getSessionToken: async () => "session-token",
    fetchAccount: async (token) => {
      requests += 1;
      assert.equal(token, "session-token");
      return account;
    },
    applyAccount: (nextAccount) => {
      appliedAccount = { ...nextAccount };
    },
    fallbackAccount: { authenticated: false },
  });

  assert.equal(requests, 1);
  assert.deepEqual(appliedAccount, account);
  assert.equal(result, account);
});
