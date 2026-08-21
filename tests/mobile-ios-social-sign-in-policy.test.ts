import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

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
  assert.match(appSource, /const signInStatus = result\.signIn\?\.status \?\? "unknown";/);
  assert.match(appSource, /const signUpStatus = result\.signUp\?\.status \?\? "unknown";/);
  assert.match(appSource, /Apple returned to Side Quest Chess, but Clerk did not create a mobile session yet\./);
  assert.match(appSource, /startAppleSignIn:\s*Platform\.OS\s*===\s*"ios"\s*\?\s*startAppleSignIn\s*:\s*undefined/);
  assert.match(appSource, /AppleAuthenticationButtonType\.SIGN_IN/);
  assert.match(appSource, /AppleAuthenticationButtonStyle\.WHITE_OUTLINE/);
  assert.match(appSource, /startGoogleSignIn,\s*\n\s*startFacebookSignIn,/);

  const appleButtons = appSource.match(/<NativeAppleSignInButton onPress=\{authBridge\.startAppleSignIn\}/g) ?? [];
  assert.equal(appleButtons.length, 2, "both signed-out account surfaces must expose the native Apple button on iOS");
});
