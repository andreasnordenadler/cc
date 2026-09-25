import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { continueMobilePasswordSignInSecondFactor, startMobilePasswordSignIn } from "../apps/mobile/src/auth/mobilePasswordSignIn";

const mobileAppConfig = JSON.parse(readFileSync(new URL("../apps/mobile/app.json", import.meta.url), "utf8"));
const mobilePackage = JSON.parse(readFileSync(new URL("../apps/mobile/package.json", import.meta.url), "utf8"));

test("mobile release declares Babel runtime required by the production auth bundle", () => {
  assert.match(mobilePackage.dependencies?.["@babel/runtime"] ?? "", /^\^?7\./);
});

test("App Review repair uses a new iOS build number instead of resubmitting rejected build 3", () => {
  assert.equal(mobileAppConfig.expo.version, "0.1.349");
  assert.equal(mobileAppConfig.expo.ios.buildNumber, "4");
  const easConfig = JSON.parse(readFileSync(new URL("../apps/mobile/eas.json", import.meta.url), "utf8"));
  assert.equal(easConfig.build["ios-app-review"].autoIncrement, false);
});

test("mobile password sign-in identifies the account before attempting the password factor", async () => {
  const calls: unknown[] = [];

  await startMobilePasswordSignIn({
    identifier: "  player@example.com  ",
    password: "secret-password",
    createSignIn: async (params) => {
      calls.push(params);
      return { status: "needs_first_factor", createdSessionId: null };
    },
    attemptFirstFactor: async (params) => {
      calls.push(params);
      return { status: "complete", createdSessionId: "sess_password" };
    },
    setActive: async (params) => {
      calls.push(params);
    },
  });

  assert.deepEqual(calls, [
    { identifier: "player@example.com" },
    { strategy: "password", password: "secret-password" },
    { session: "sess_password" },
  ]);
});

test("mobile password sign-in sends the second-factor email before asking for its code", async () => {
  const calls: unknown[] = [];
  const result = await startMobilePasswordSignIn({
    identifier: "player@example.com",
    password: "secret-password",
    createSignIn: async () => ({ status: "needs_first_factor", createdSessionId: null }),
    attemptFirstFactor: async () => ({ status: "needs_second_factor", createdSessionId: null }),
    prepareSecondFactor: async (params) => {
      calls.push(params);
      return { status: "needs_second_factor", createdSessionId: null };
    },
    setActive: async (params) => { calls.push(params); },
  });

  assert.deepEqual(result, { status: "needs_second_factor" });
  assert.deepEqual(calls, [{ strategy: "email_code" }]);
});

test("mobile password sign-in verifies the already-delivered email code before activating the session", async () => {
  const calls: unknown[] = [];

  await continueMobilePasswordSignInSecondFactor({
    code: " 123456 ",
    attemptSecondFactor: async (params) => {
      calls.push(params);
      return { status: "complete", createdSessionId: "sess_second_factor" };
    },
    setActive: async (params) => {
      calls.push(params);
    },
  });

  assert.deepEqual(calls, [
    { strategy: "email_code", code: "123456" },
    { session: "sess_second_factor" },
  ]);
});
