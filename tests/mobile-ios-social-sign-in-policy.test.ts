import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { allowsThirdPartySocialSignIn } from "../apps/mobile/src/auth/socialSignIn";

test("iOS omits third-party social login until Sign in with Apple is implemented", () => {
  assert.equal(allowsThirdPartySocialSignIn("ios"), false);
  assert.equal(allowsThirdPartySocialSignIn("android"), true);
  assert.equal(allowsThirdPartySocialSignIn("web"), true);

  const appSource = readFileSync(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  assert.match(appSource, /startGoogleSignIn:\s*socialSignInAllowed\s*\?\s*startGoogleSignIn\s*:\s*undefined/);
  assert.match(appSource, /startFacebookSignIn:\s*socialSignInAllowed\s*\?\s*startFacebookSignIn\s*:\s*undefined/);
});