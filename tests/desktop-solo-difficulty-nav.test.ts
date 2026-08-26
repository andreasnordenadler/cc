import assert from "node:assert/strict";
import test from "node:test";
import { getDifficultyItemsSignature } from "../src/components/desktop-solo-difficulty-nav";

test("desktop Solo difficulty tracking ignores equivalent item-array identities", () => {
  const first = [
    { difficulty: "Easy", count: 3 },
    { difficulty: "Hard", count: 2 },
  ];
  const equivalent = first.map((item) => ({ ...item }));

  assert.equal(getDifficultyItemsSignature(first), getDifficultyItemsSignature(equivalent));
  assert.notEqual(
    getDifficultyItemsSignature(first),
    getDifficultyItemsSignature([{ difficulty: "Easy", count: 3 }, { difficulty: "Hard", count: 3 }]),
  );
});
