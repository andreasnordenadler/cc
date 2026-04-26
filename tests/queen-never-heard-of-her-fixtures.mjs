import assert from "node:assert/strict";
import { test } from "node:test";
import {
  evaluateQueenNeverHeardOfHer,
  queenNeverHeardOfHerFixtures,
} from "../src/lib/queen-never-heard-of-her.ts";

test("Queen? Never Heard of Her normalized fixtures cover pass and key failures", () => {
  const verdicts = Object.fromEntries(
    queenNeverHeardOfHerFixtures.map((fixture) => [fixture.id, evaluateQueenNeverHeardOfHer(fixture)]),
  );

  assert.equal(verdicts["fixture-queenless-win"].status, "passed");
  assert.match(verdicts["fixture-queenless-win"].summary, /Queen lost before move 15/);
  assert.equal(verdicts["fixture-queen-stayed-home"].status, "failed");
  assert.match(verdicts["fixture-queen-stayed-home"].summary, /No player queen loss/);
  assert.equal(verdicts["fixture-traded-queens-first"].status, "failed");
  assert.match(verdicts["fixture-traded-queens-first"].summary, /opponent did not still have theirs/);
});
