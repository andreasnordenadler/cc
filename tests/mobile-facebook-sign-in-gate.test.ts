import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { isFacebookSignInEnabled } from "../apps/mobile/src/auth/isFacebookSignInEnabled";

test("Facebook sign-in stays disabled unless the public release flag is explicitly true", () => {
  assert.equal(isFacebookSignInEnabled(undefined), false);
  assert.equal(isFacebookSignInEnabled("false"), false);
  assert.equal(isFacebookSignInEnabled("TRUE"), false);
  assert.equal(isFacebookSignInEnabled("true"), true);
});

test("the mobile auth bridge hides Facebook unless the release flag enables it", () => {
  const appSource = readFileSync(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");

  assert.match(appSource, /isFacebookSignInEnabled\(process\.env\.EXPO_PUBLIC_ENABLE_FACEBOOK_SIGN_IN\)/);
  assert.match(appSource, /startFacebookSignIn:\s*facebookSignInEnabled\s*\?\s*startFacebookSignIn\s*:\s*undefined/);
});

test("mobile release documentation requires provider verification before enabling Facebook", () => {
  const readme = readFileSync(new URL("../apps/mobile/README.md", import.meta.url), "utf8");

  assert.match(readme, /EXPO_PUBLIC_ENABLE_FACEBOOK_SIGN_IN=true/);
  assert.match(readme, /production Clerk\/Facebook connection and reviewer-access path have been verified/i);
});
