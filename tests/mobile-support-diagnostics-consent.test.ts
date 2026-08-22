import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { buildMobileSupportMessage, canComposeMobileSupportMessage } from "../apps/mobile/src/support/buildMobileSupportMessage";

const appSource = readFileSync(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");

test("support messages exclude diagnostics unless the user opts in", () => {
  assert.equal(
    buildMobileSupportMessage({
      message: "  The proof check stopped.  ",
      diagnostics: "Account: signed in as Sam\nActive solo quest: Castle Run",
      includeDiagnostics: false,
    }),
    "The proof check stopped.",
  );
});

test("support messages append diagnostics after explicit opt-in", () => {
  assert.equal(
    buildMobileSupportMessage({
      message: "  The proof check stopped.  ",
      diagnostics: "Account: signed in as Sam\nActive solo quest: Castle Run",
      includeDiagnostics: true,
    }),
    "The proof check stopped.\n\n---\nAccount: signed in as Sam\nActive solo quest: Castle Run",
  );
});

test("signed-out users are directed to public support instead of a message composer", () => {
  assert.equal(canComposeMobileSupportMessage({ isSignedIn: false, hasSessionTokenGetter: false }), false);
  assert.equal(canComposeMobileSupportMessage({ isSignedIn: false, hasSessionTokenGetter: true }), false);
  assert.equal(canComposeMobileSupportMessage({ isSignedIn: true, hasSessionTokenGetter: false }), false);
  assert.equal(canComposeMobileSupportMessage({ isSignedIn: true, hasSessionTokenGetter: true }), true);
  assert.match(appSource, /canComposeSupportMessage \? \(<>[\s\S]*Conversation[\s\S]*Send support message[\s\S]*<\/>\) : \(<>[\s\S]*Open public support[\s\S]*<\/>\)}/);
});
