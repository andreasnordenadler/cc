import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const readRepoFile = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("iOS provides native Sign in with Apple alongside existing account methods", () => {
  const appSource = readRepoFile("apps/mobile/App.tsx");
  const config = JSON.parse(readRepoFile("apps/mobile/app.json")).expo;
  const mobilePackage = JSON.parse(readRepoFile("apps/mobile/package.json"));

  assert.equal(config.ios.usesAppleSignIn, true);
  assert.ok(config.plugins.includes("expo-apple-authentication"));
  assert.equal(mobilePackage.dependencies["expo-apple-authentication"], "~8.0.8");

  assert.match(appSource, /useSignInWithApple/);
  assert.match(appSource, /startAppleAuthenticationFlow\(\)/);
  assert.match(appSource, /startAppleSignIn:\s*Platform\.OS\s*===\s*["']ios["']\s*\?\s*startAppleSignIn\s*:\s*undefined/);
  assert.match(appSource, /AppleAuthenticationButtonType\.SIGN_IN/);
  assert.match(appSource, /AppleAuthenticationButtonStyle\.WHITE_OUTLINE/);

  assert.match(appSource, /startGoogleSignIn,\s*\n\s*startFacebookSignIn,/);
  assert.doesNotMatch(appSource, /startGoogleSignIn:\s*Platform\.OS/);
  assert.doesNotMatch(appSource, /startFacebookSignIn:\s*Platform\.OS/);

  const appleButtonUses = appSource.match(/<NativeAppleSignInButton onPress=\{authBridge\.startAppleSignIn\}/g) ?? [];
  assert.equal(appleButtonUses.length, 2, "both signed-out account surfaces must expose the native Apple button on iOS");
});
