import assert from "node:assert/strict";
import test from "node:test";
import { pickRandomQuestId } from "../src/components/desktop-random-quest-button";

test("desktop random quest picker maps the full random interval to a valid quest", () => {
  const ids = ["one", "two", "three"];

  assert.equal(pickRandomQuestId(ids, () => 0), "one");
  assert.equal(pickRandomQuestId(ids, () => 0.5), "two");
  assert.equal(pickRandomQuestId(ids, () => 0.999999), "three");
});

test("desktop random quest picker safely handles an empty catalog", () => {
  assert.equal(pickRandomQuestId([], () => 0.5), null);
});
