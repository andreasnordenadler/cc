import assert from "node:assert/strict";
import test from "node:test";
import { loadMobileAccount } from "../apps/mobile/src/account/loadMobileAccount";
import * as accountModule from "../apps/mobile/src/account/loadMobileAccount";
import { finalizeMobileAccountDeletion } from "../apps/mobile/src/account/finalizeMobileAccountDeletion";
import { readFileSync } from "node:fs";

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
}

test("a revoked session cannot apply its delayed account response", async () => {
  const response = deferred<{ authenticated: boolean }>();
  let current = true;
  const applied: unknown[] = [];
  const guest = { authenticated: false };
  const options = {
    isLoaded: true, isSignedIn: true,
    isCurrent: () => current,
    getSessionToken: async () => "account-A",
    fetchAccount: () => response.promise,
    applyAccount: (account: unknown) => applied.push(account),
    applySignedInFallback: () => applied.push("fallback"),
    fallbackAccount: guest,
  };
  const pending = loadMobileAccount(options);
  current = false;
  response.resolve({ authenticated: true });
  assert.equal(await pending, guest);
  assert.deepEqual(applied, []);
});

test("logout invalidates local access before an offline provider sign-out fails", async () => {
  assert.equal(typeof accountModule.createMobileSessionGuard, "function");
  const events: string[] = [];
  const guard = accountModule.createMobileSessionGuard({
    getSessionToken: async () => "account-A",
    signOut: async () => {
      events.push("provider");
      throw new Error("offline");
    },
    onInvalidate: () => events.push("clear"),
  });
  const logout = guard.signOut();
  assert.equal(guard.isCurrent(), false);
  assert.deepEqual(events, ["clear", "provider"]);
  await assert.rejects(logout, /offline/);
  await assert.rejects(guard.getSessionToken(), /session_changed/);
});

test("logout discards a token already being fetched", async () => {
  const token = deferred<string>();
  const guard = accountModule.createMobileSessionGuard({
    getSessionToken: () => token.promise,
    signOut: async () => {}, onInvalidate: () => {},
  });
  const pending = guard.getSessionToken();
  await guard.signOut();
  token.resolve("account-A");
  await assert.rejects(pending, /session_changed/);
});

test("a revoked account request cannot restore signed-in fallback state", async () => {
  let current = true;
  const token = deferred<string>();
  const applied: unknown[] = [];
  const pending = loadMobileAccount({
    isLoaded: true, isSignedIn: true, isCurrent: () => current,
    getSessionToken: async () => { await token.promise; throw new Error("offline"); },
    fetchAccount: async () => ({ authenticated: true }),
    applyAccount: (value) => applied.push(value),
    applySignedInFallback: () => applied.push("old-account"),
    fallbackAccount: { authenticated: false },
  });
  current = false;
  token.resolve("ignored");
  await pending;
  assert.deepEqual(applied, []);
});

test("deletion clears local access even if the provider cannot sign out", async () => {
  const events: string[] = [];
  const guard = accountModule.createMobileSessionGuard({
    getSessionToken: async () => "account-A",
    signOut: async () => { throw new Error("offline"); },
    onInvalidate: () => events.push("clear"),
  });
  const result = await finalizeMobileAccountDeletion({
    deleteAccount: async () => { events.push("deleted"); }, signOut: guard.signOut,
  });
  assert.deepEqual(events, ["deleted", "clear"]);
  assert.equal(result.signedOut, false);
  assert.equal(guard.isCurrent(), false);
});

test("revoking A does not revoke a newly mounted B session", async () => {
  const a = accountModule.createMobileSessionGuard({
    getSessionToken: async () => "A", signOut: async () => {}, onInvalidate: () => {},
  });
  const b = accountModule.createMobileSessionGuard({
    getSessionToken: async () => "B", signOut: async () => {}, onInvalidate: () => {},
  });
  await a.signOut();
  assert.equal(await b.getSessionToken(), "B");
  let applied = "";
  const value = await loadMobileAccount({
    isLoaded: true, isSignedIn: true, isCurrent: b.isCurrent,
    getSessionToken: b.getSessionToken,
    fetchAccount: async (token) => token!, applyAccount: (account) => { applied = account; },
    fallbackAccount: "guest",
  });
  assert.equal(value, "B");
  assert.equal(applied, "B");
});

test("the logout UI handles provider rejection after local clearing", () => {
  const app = readFileSync(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const handler = app.slice(app.indexOf("  async function handleLogOut()"), app.indexOf("  async function handleDeleteAccount()"));
  assert.match(handler, /try \{\s*await authBridge.signOut\(\)/);
  assert.match(handler, /catch \(caught\)/);
  assert.match(handler, /Alert.alert\("Log out",/);
});
