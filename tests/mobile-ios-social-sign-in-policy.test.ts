import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
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

test("Apple sign-in reports incomplete account resolution instead of silently staying signed out", async () => {
  await assert.rejects(
    completeAppleSignIn({ createdSessionId: null, setActive: undefined }),
    /could not finish setting up your account/i,
  );

  const appSource = readRepoFile("apps/mobile/App.tsx");
  assert.match(appSource, /await completeAppleSignIn\(result\)/);
});
