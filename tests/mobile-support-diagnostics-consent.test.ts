import assert from "node:assert/strict";
import test from "node:test";
import { buildMobileSupportMessage } from "../apps/mobile/src/support/buildMobileSupportMessage";

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
