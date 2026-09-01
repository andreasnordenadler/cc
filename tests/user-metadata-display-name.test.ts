import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { compactChallengeAttempts, getRunnerDisplayName } from "../src/lib/user-metadata";

test("legacy fallback display names never expose the retired public acronym", () => {
  assert.equal(getRunnerDisplayName({ runnerDisplayName: "SQC player" }), "Quest runner");
  assert.equal(getRunnerDisplayName({ runnerDisplayName: "SQC host" }), "Quest host");
  assert.equal(getRunnerDisplayName({ runnerDisplayName: "SQC" }), "Side Quest Chess");
  assert.equal(getRunnerDisplayName({ runnerDisplayName: "Ada" }), "Ada");
});

test("attempt compaction preserves Solo and Multiplayer passed provenance for a shared objective", () => {
  const soloPassed = {
    id: "knights-before-coffee:lichess:solo-game:2026-07-12T13:00:00.000Z",
    challengeId: "knights-before-coffee",
    status: "passed",
    summary: "Solo proof verified.",
    checkedAt: "2026-07-12T13:00:00.000Z",
  };
  const multiplayerPassed = {
    ...soloPassed,
    id: "knights-before-coffee:multiplayer:lichess:group-game:2026-07-14T13:00:00.000Z",
    summary: "Multiplayer proof verified: objective complete.",
    checkedAt: "2026-07-14T13:00:00.000Z",
  };

  const compacted = compactChallengeAttempts([soloPassed, multiplayerPassed], 1);

  assert.deepEqual(compacted.map((attempt) => attempt.id), [soloPassed.id, multiplayerPassed.id]);
});

test("web Solo mutations use the shared source-preserving attempt compactor", () => {
  const source = readFileSync("src/app/actions.ts", "utf8");

  assert.match(source, /import \{[\s\S]*?compactChallengeAttempts[\s\S]*?\} from "@\/lib\/user-metadata";/);
  assert.doesNotMatch(source, /function compactChallengeAttempts\(/);
});
