import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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

test("a signed-in account load failure preserves the authenticated recovery state", async () => {
  let recoveryState: "signed-out" | "signed-in-unavailable" | null = null;

  await loadMobileAccount({
    isLoaded: true,
    isSignedIn: true,
    getSessionToken: async () => "session-token",
    fetchAccount: async () => {
      throw new Error("Account service unavailable");
    },
    applyAccount: () => assert.fail("A failed request must not apply an account."),
    applyFallback: () => {
      recoveryState = "signed-out";
    },
    applySignedInFallback: () => {
      recoveryState = "signed-in-unavailable";
    },
    fallbackAccount: { authenticated: false },
  });

  assert.equal(recoveryState, "signed-in-unavailable");
});

test("a signed-in user keeps retry, deletion, and logout controls when account details are unavailable", () => {
  const appSource = readFileSync(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const accountDashboard = appSource.slice(
    appSource.indexOf("function AccountTrackerDashboard"),
    appSource.indexOf("function AccountSoloSideQuestSection"),
  );

  assert.match(accountDashboard, /if \(!signedIn && authBridge\.isSignedIn\)/);
  assert.match(accountDashboard, /Retry account details/);
  assert.match(accountDashboard, /Delete account/);
  assert.match(accountDashboard, /Log out/);
  assert.match(accountDashboard, /onPress=\{\(\) => void onAccountUpdated\(\)\}/);
});

test("mobile account shells are owned by the loaded Clerk session, not just the user", () => {
  const appSource = readFileSync(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");

  assert.match(appSource, /const sessionKey = isLoaded && isSignedIn && sessionId \? sessionId : "signed-out"/);
  assert.match(appSource, /<SessionMobileShell key=\{sessionKey\} authBridge=\{authBridge\} \/>/);
  assert.match(appSource, /<MobileShell key=\{locallySignedOut \? "signed-out" : "session"\} authBridge=\{scopedBridge\} \/>/);
  assert.match(appSource, /isCurrent: authBridge\.isSessionCurrent/);
  assert.match(appSource, /applyFallback: \(\) => setShell\(\(current\) => \(\{ \.\.\.current, account: MOBILE_ACCOUNT_FALLBACK \}\)\)/);
});
