import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { completeAppleSignIn } from "../apps/mobile/src/auth/completeAppleSignIn";
import { shouldExposeAppleSignIn } from "../apps/mobile/src/auth/appleSignInReadiness";

const readRepoFile = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("iOS hides Apple sign-in when native authentication is unavailable", () => {
  assert.equal(shouldExposeAppleSignIn({
    platform: "ios",
    nativeAvailable: false,
    signInLoaded: true,
    signUpLoaded: true,
  }), false);
});

test("iOS waits for both Clerk resources before exposing Apple sign-in", () => {
  assert.equal(shouldExposeAppleSignIn({
    platform: "ios",
    nativeAvailable: true,
    signInLoaded: false,
    signUpLoaded: true,
  }), false);
  assert.equal(shouldExposeAppleSignIn({
    platform: "ios",
    nativeAvailable: true,
    signInLoaded: true,
    signUpLoaded: false,
  }), false);
  assert.equal(shouldExposeAppleSignIn({
    platform: "ios",
    nativeAvailable: true,
    signInLoaded: true,
    signUpLoaded: true,
  }), true);
});

test("non-iOS platforms never expose native Apple sign-in", () => {
  assert.equal(shouldExposeAppleSignIn({
    platform: "android",
    nativeAvailable: true,
    signInLoaded: true,
    signUpLoaded: true,
  }), false);
});

test("iOS wires native Sign in with Apple through capability and Clerk readiness", () => {
  const appSource = readRepoFile("apps/mobile/App.tsx");
  const config = JSON.parse(readRepoFile("apps/mobile/app.json")).expo;
  const mobilePackage = JSON.parse(readRepoFile("apps/mobile/package.json"));

  assert.equal(config.ios.usesAppleSignIn, true);
  assert.ok(config.plugins.includes("expo-apple-authentication"));
  assert.equal(mobilePackage.dependencies["expo-apple-authentication"], "~8.0.8");
  assert.match(appSource, /useSignInWithApple/);
  assert.match(appSource, /startAppleAuthenticationFlow\(\)/);
  assert.match(appSource, /isAppleSignInCancellation/);
  assert.match(appSource, /AppleAuthentication\.isAvailableAsync\(\)/);
  assert.match(appSource, /shouldExposeAppleSignIn\(\{/);
  assert.match(appSource, /startAppleSignIn:\s*appleSignInReady\s*\?\s*startAppleSignIn\s*:\s*undefined/);
  assert.match(appSource, /AppleAuthenticationButtonType\.SIGN_IN/);
  assert.match(appSource, /AppleAuthenticationButtonStyle\.WHITE_OUTLINE/);

  const appleButtons = appSource.match(/<NativeAppleSignInButton onPress=\{authBridge\.startAppleSignIn\}/g) ?? [];
  assert.equal(appleButtons.length, 2, "both signed-out account surfaces must expose the ready native Apple button on iOS");
});

test("Apple sign-in treats Clerk's canceled return shape as a non-error", async () => {
  assert.equal(
    await completeAppleSignIn({ createdSessionId: null, setActive: async () => undefined }),
    "canceled",
  );
});

test("Apple sign-in reports an activatable session that cannot be activated", async () => {
  await assert.rejects(
    completeAppleSignIn({ createdSessionId: "session_123", setActive: undefined }),
    /could not finish setting up your account/i,
  );

  const appSource = readRepoFile("apps/mobile/App.tsx");
  assert.match(appSource, /if \(!signInLoaded \|\| !signUpLoaded\)/);
  assert.match(appSource, /await runAppleSignInWithOAuthFallback\(\{/);
  assert.match(appSource, /completeNative:\s*completeAppleSignIn/);
  assert.match(appSource, /strategy:\s*"oauth_apple"/);
  assert.match(appSource, /if \(isAppleSignInCancellation\(caught\)\) return;/);
  assert.match(appSource, /Alert\.alert\("Sign-in error", socialSignInErrorMessage\(caught\)\)/);
});
