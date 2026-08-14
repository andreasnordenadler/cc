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
  const appleFlowStart = appSource.indexOf("const startAppleSignIn = useCallback");
  const appleFlowEnd = appSource.indexOf("const startPasswordSignIn", appleFlowStart);
  assert.ok(appleFlowStart >= 0 && appleFlowEnd > appleFlowStart, "Apple sign-in callback must be discoverable");
  const appleFlowSource = appSource.slice(appleFlowStart, appleFlowEnd);
  assert.match(appleFlowSource, /if \(!signInLoaded \|\| !signUpLoaded\)/);
  assert.match(appleFlowSource, /Apple sign-in is still getting ready/);
  assert.match(appleFlowSource, /if \(appleSignInInFlightRef\.current\) return/);
  assert.match(appleFlowSource, /appleSignInInFlightRef\.current = true/);
  assert.doesNotMatch(appleFlowSource, /Sign-in did not finish/, "Clerk represents Apple-sheet cancellation as a loaded no-session result");
  assert.match(appleFlowSource, /code === ["']ERR_REQUEST_CANCELED["']/);
  assert.match(appleFlowSource, /finally[\s\S]*appleSignInInFlightRef\.current = false/);
  assert.match(appSource, /startAppleSignIn:\s*Platform\.OS\s*===\s*["']ios["']\s*\?\s*startAppleSignIn\s*:\s*undefined/);
  assert.match(appSource, /AppleAuthenticationButtonType\.SIGN_IN/);
  assert.match(appSource, /AppleAuthenticationButtonStyle\.WHITE_OUTLINE/);

  assert.match(appSource, /startGoogleSignIn,\s*\n\s*startFacebookSignIn,/);
  assert.doesNotMatch(appSource, /startGoogleSignIn:\s*Platform\.OS/);
  assert.doesNotMatch(appSource, /startFacebookSignIn:\s*Platform\.OS/);

  const liveAccountStart = appSource.indexOf("function AccountTrackerDashboard(");
  const liveAccountEnd = appSource.indexOf("function CompactStatusRow(", liveAccountStart);
  assert.ok(liveAccountStart >= 0 && liveAccountEnd > liveAccountStart, "live account surface must be discoverable");
  const liveAccountSource = appSource.slice(liveAccountStart, liveAccountEnd);
  assert.match(liveAccountSource, /<NativeAppleSignInButton onPress=\{authBridge\.startAppleSignIn\}/);
  assert.match(liveAccountSource, /Continue with Google/);
  assert.match(liveAccountSource, /Continue with Facebook/);
  assert.match(liveAccountSource, /<PasswordAuthPanel/);
});
