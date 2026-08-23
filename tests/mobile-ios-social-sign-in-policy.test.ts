import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import * as mobileSocialAuth from "../apps/mobile/src/auth/completeAppleSignIn";
import { completeAppleSignIn } from "../apps/mobile/src/auth/completeAppleSignIn";

const readRepoFile = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("iOS prepares native Sign in with Apple alongside existing account methods", () => {
  const appSource = readRepoFile("apps/mobile/App.tsx");
  const config = JSON.parse(readRepoFile("apps/mobile/app.json")).expo;
  const mobilePackage = JSON.parse(readRepoFile("apps/mobile/package.json"));

  assert.equal(config.ios.usesAppleSignIn, true);
  assert.ok(config.plugins.includes("expo-apple-authentication"));
  assert.equal(mobilePackage.dependencies["expo-apple-authentication"], "~8.0.8");
  assert.match(appSource, /useSignInWithApple/);
  assert.match(appSource, /startAppleAuthenticationFlow\(\)/);
  assert.match(appSource, /code === "ERR_REQUEST_CANCELED"/);
  assert.match(appSource, /AppleAuthentication\.isAvailableAsync\(\)/);
  assert.match(appSource, /startAppleSignIn:\s*appleSignInAvailable\s*\?\s*startAppleSignIn\s*:\s*undefined/);
  assert.match(appSource, /AppleAuthenticationButtonType\.SIGN_IN/);
  assert.match(appSource, /AppleAuthenticationButtonStyle\.WHITE_OUTLINE/);

  const appleButtons = appSource.match(/<NativeAppleSignInButton onPress=\{authBridge\.startAppleSignIn\}/g) ?? [];
  assert.equal(appleButtons.length, 2, "both signed-out account surfaces must expose the native Apple button on iOS");
});

test("Apple sign-in treats Clerk's canceled return shape as a non-error", async () => {
  assert.equal(
    await completeAppleSignIn({ createdSessionId: null, setActive: async () => undefined }),
    "canceled",
  );
});

test("Google and Facebook sign-in treat canceled browser sessions as non-errors", async () => {
  const completeSocialSignIn = (mobileSocialAuth as typeof mobileSocialAuth & {
    completeSocialSignIn?: (result: {
      createdSessionId: null;
      authSessionResult: { type: string };
    }, provider: "Google" | "Facebook") => Promise<string>;
  }).completeSocialSignIn;

  assert.equal(typeof completeSocialSignIn, "function", "social sign-in completion must be shared and directly testable");
  assert.equal(
    await completeSocialSignIn!({ createdSessionId: null, authSessionResult: { type: "cancel" } }, "Google"),
    "canceled",
  );
  assert.equal(
    await completeSocialSignIn!({ createdSessionId: null, authSessionResult: { type: "dismiss" } }, "Facebook"),
    "canceled",
  );
});

test("Google and Facebook sign-in errors do not expose provider SDK details", () => {
  const socialSignInErrorMessage = (mobileSocialAuth as typeof mobileSocialAuth & {
    socialSignInErrorMessage?: (provider: "Google" | "Facebook") => string;
  }).socialSignInErrorMessage;

  assert.equal(typeof socialSignInErrorMessage, "function");
  assert.equal(
    socialSignInErrorMessage!("Google"),
    "Google sign-in could not finish. Try again or use another sign-in method.",
  );

  const appSource = readRepoFile("apps/mobile/App.tsx");
  assert.match(appSource, /socialSignInErrorMessage\(providerLabel\)/);
  assert.doesNotMatch(appSource, /caught instanceof Error \? caught\.message : "Unknown mobile sign-in error\."/);
});

test("Apple sign-in reports an activatable session that cannot be activated", async () => {
  await assert.rejects(
    completeAppleSignIn({ createdSessionId: "session_123", setActive: undefined }),
    /could not finish setting up your account/i,
  );

  const appSource = readRepoFile("apps/mobile/App.tsx");
  assert.match(appSource, /if \(!signInLoaded \|\| !signUpLoaded\)/);
  assert.match(appSource, /await completeAppleSignIn\(result\)/);
});
