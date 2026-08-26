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

test("signed-out users are directed to direct email instead of a message composer", () => {
  assert.equal(canComposeMobileSupportMessage({ isSignedIn: false, hasSessionTokenGetter: false }), false);
  assert.equal(canComposeMobileSupportMessage({ isSignedIn: false, hasSessionTokenGetter: true }), false);
  assert.equal(canComposeMobileSupportMessage({ isSignedIn: true, hasSessionTokenGetter: false }), false);
  assert.equal(canComposeMobileSupportMessage({ isSignedIn: true, hasSessionTokenGetter: true }), true);
  assert.match(appSource, /canComposeSupportMessage \? \(<>[\s\S]*Conversation[\s\S]*Send support message[\s\S]*<\/>\) : \(<>[\s\S]*Email support[\s\S]*<\/>\)}/);
});

test("signed-out users can copy native support diagnostics", () => {
  const emailSupportAction = appSource.indexOf('accessibilityLabel="Email Side Quest Chess support"');
  const diagnosticCopyAction = appSource.indexOf('accessibilityLabel="Copy support details"', emailSupportAction);

  assert.notEqual(emailSupportAction, -1);
  assert.ok(diagnosticCopyAction > emailSupportAction);
});
