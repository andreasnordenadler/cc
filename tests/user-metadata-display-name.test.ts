import assert from "node:assert/strict";
import test from "node:test";

import { getRunnerDisplayName } from "../src/lib/user-metadata";

test("legacy fallback display names never expose the retired public acronym", () => {
  assert.equal(getRunnerDisplayName({ runnerDisplayName: "SQC player" }), "Quest runner");
  assert.equal(getRunnerDisplayName({ runnerDisplayName: "SQC host" }), "Quest host");
  assert.equal(getRunnerDisplayName({ runnerDisplayName: "SQC" }), "Side Quest Chess");
  assert.equal(getRunnerDisplayName({ runnerDisplayName: "Ada" }), "Ada");
});
