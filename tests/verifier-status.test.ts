import assert from "node:assert/strict";
import test from "node:test";

import { CHALLENGES } from "../src/lib/challenges";
import { getVerifierStatus } from "../src/lib/verifier-status";

test("every shipped Solo Side Quest presents its live latest-game proof status", () => {
  const nonLive = CHALLENGES
    .map((challenge) => ({ id: challenge.id, state: getVerifierStatus(challenge).state }))
    .filter((status) => status.state !== "live");

  assert.deepEqual(nonLive, []);
});

test("Pawn-Only Picnic proof status claims only the checks its verifier establishes", () => {
  const evidence = getVerifierStatus({ id: "pawn-only-picnic" }).evidence;

  assert.equal(evidence.includes("legal time class"), false);
  assert.equal(evidence.includes("standard chess"), false);
});
