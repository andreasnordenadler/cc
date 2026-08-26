import assert from "node:assert/strict";
import test from "node:test";

import { OFFLINE_MOBILE_BOOTSTRAP } from "../apps/mobile/src/data/offlineBootstrap";

function collectStrings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(collectStrings);
  if (value && typeof value === "object") {
    return Object.values(value).flatMap(collectStrings);
  }
  return [];
}

test("bundled offline challenges contain product copy rather than QA terminology", () => {
  const publicChallengeCopy = collectStrings(OFFLINE_MOBILE_BOOTSTRAP.challenges);
  const internalTerminology = publicChallengeCopy.filter((value) => /\b(?:test|testing|qa)\b/i.test(value));

  assert.deepEqual(internalTerminology, []);
});

test("bundled first-game fallback preserves the canonical starter-quest copy", () => {
  const firstGame = OFFLINE_MOBILE_BOOTSTRAP.challenges.find((challenge) => challenge.id === "finish-any-game");

  assert.ok(firstGame);
  assert.equal(firstGame.category, "Starter Quest");
  assert.equal(
    firstGame.rules[1],
    "Win, loss, draw, timeout, resignation, rated, casual, bullet, blitz, rapid, classical, daily — all are acceptable for this starter quest.",
  );
  assert.equal(firstGame.rules[3], "This quest exists so every new player can unlock a first Coat of Arms with one normal finished game.");
  assert.equal(firstGame.badgeIdentity?.rarity, "Starter token");
  assert.equal(firstGame.badgeIdentity?.unlockCopy, "Complete any public game and unlock your first Side Quest Chess Coat of Arms.");
  assert.equal(firstGame.badgeIdentity?.heraldry.crest, "Tiny first-quest banner");
});
