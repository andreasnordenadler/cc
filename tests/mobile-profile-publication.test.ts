import assert from "node:assert/strict";
import test from "node:test";

import { validatePublicProfileText } from "../src/lib/mobile-profile-publication";

test("public mobile profiles reject objectionable display names or bios", () => {
  assert.equal(validatePublicProfileText("Friendly Knight", "Enjoying endgames"), null);
  assert.equal(validatePublicProfileText("f.u.c.k", "Enjoying endgames"), "Remove objectionable language before publishing your profile.");
  assert.equal(validatePublicProfileText("Friendly Knight", "s h i t"), "Remove objectionable language before publishing your profile.");
});
