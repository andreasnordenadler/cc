import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { startMobilePasswordSignIn } from "../apps/mobile/src/auth/mobilePasswordSignIn";

// A fixture, not the operator's iosreview credential.
const fixturePassword = "synthetic-test-password-not-a-credential";

// Clerk JS 5.125.12 BaseResource._baseFetch can return null after a native
// network failure. SignIn.create then returns its still-empty resource.
// With no resource id, attemptFirstFactor routes to /client/sign_ins and
// the provider rejects {strategy:'password',password} without identifier.
test("an empty identification result never submits a password to a new sign-in", async () => {
  let passwordAttempts = 0;
  let activations = 0;
  await assert.rejects(startMobilePasswordSignIn({
    identifier: "iosreview",
    password: fixturePassword,
    createSignIn: async () => ({ status: null, createdSessionId: null }),
    attemptFirstFactor: async () => {
      passwordAttempts += 1;
      throw new Error("`identifier` is required when `strategy` is `password`.");
    },
    setActive: async () => { activations += 1; },
  }), /Could not start password sign-in/);
  assert.equal(passwordAttempts, 0);
  assert.equal(activations, 0);
});

test("a needs-identifier result never advances to password verification", async () => {
  let passwordAttempts = 0;
  await assert.rejects(startMobilePasswordSignIn({
    identifier: "iosreview",
    password: fixturePassword,
    createSignIn: async () => ({ status: "needs_identifier", createdSessionId: null }),
    attemptFirstFactor: async () => {
      passwordAttempts += 1;
      throw new Error("Password must not be sent before identification.");
    },
    setActive: async () => undefined,
  }), /Could not start password sign-in/);
  assert.equal(passwordAttempts, 0);
});

test("native Clerk requests rethrow network failures instead of returning empty resources", () => {
  const app = readFileSync(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  assert.ok(/<ClerkProvider[^>]*experimental=\{\{\s*rethrowOfflineNetworkErrors:\s*true\s*\}\}/.test(app), "ClerkProvider must preserve native network failures");
});
