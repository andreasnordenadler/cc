import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { validatePublicProfileText } from "../src/lib/mobile-profile-publication";

test("public mobile profiles reject objectionable display names or bios", () => {
  assert.equal(validatePublicProfileText("Friendly Knight", "Enjoying endgames"), null);
  assert.equal(validatePublicProfileText("f.u.c.k", "Enjoying endgames"), "Remove objectionable language before publishing your profile.");
  assert.equal(validatePublicProfileText("Friendly Knight", "s h i t"), "Remove objectionable language before publishing your profile.");
});

test("web profile saves enforce the same public-profile text policy", () => {
  const actionsSource = readFileSync(new URL("../src/app/actions.ts", import.meta.url), "utf8");
  const saveProfileSource = actionsSource.slice(
    actionsSource.indexOf("export async function saveRunnerProfile"),
    actionsSource.indexOf("export async function startChallenge"),
  );

  assert.match(saveProfileSource, /validatePublicProfileText\(runnerDisplayName, runnerBio\)/);
  assert.match(saveProfileSource, /throw new Error\(profileTextError\)/);
});
