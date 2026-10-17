import assert from "node:assert/strict";
import test from "node:test";
import { evaluateKnightsBeforeCoffee } from "../src/lib/knights-before-coffee";

test("Knights Before Coffee reports the checked final position when eligibility fails", () => {
  const verdict = evaluateKnightsBeforeCoffee({
    id: "variant-chaos",
    playerColor: "black",
    winner: "black",
    moveCount: 4,
    variant: "crazyhouse",
    timeClass: "blitz",
    firstFourPlayerMovePieces: ["knight", "knight", "knight", "knight"],
    finalPositionFen: "rnbqkb1r/pppppppp/5n2/8/8/5N2/PPPPPPPP/RNBQKB1R w KQkq - 2 2",
    lastMoveSan: "Nf6",
    lastMoveUci: "g8f6",
  });

  assert.equal(verdict.status, "failed");
  assert.deepEqual(verdict.failureDiagnostic, {
    label: "Latest checked position",
    explanation: verdict.summary,
    fenAtBreak: "rnbqkb1r/pppppppp/5n2/8/8/5N2/PPPPPPPP/RNBQKB1R w KQkq - 2 2",
    san: "Nf6",
    uci: "g8f6",
    playerColor: "black",
  });
});

test("Knights Before Coffee keeps terminal diagnostics for time, result, and short-game failures", () => {
  const baseGame = {
    id: "terminal-failure",
    playerColor: "white" as const,
    winner: "white" as const,
    moveCount: 4,
    variant: "standard",
    timeClass: "blitz" as const,
    firstFourPlayerMovePieces: ["knight", "knight", "knight", "knight"] as Array<"knight">,
    finalPositionFen: "rnbqkb1r/pppppppp/5n2/8/8/5N2/PPPPPPPP/RNBQKB1R w KQkq - 2 2",
    lastMoveSan: "Nf6",
    lastMoveUci: "g8f6",
  };

  const verdicts = [
    evaluateKnightsBeforeCoffee({ ...baseGame, id: "too-slow", timeClass: "classical" }),
    evaluateKnightsBeforeCoffee({ ...baseGame, id: "lost", winner: "black" }),
    evaluateKnightsBeforeCoffee({ ...baseGame, id: "too-short", firstFourPlayerMovePieces: ["knight", "knight"] as Array<"knight"> }),
  ];

  for (const verdict of verdicts) {
    assert.equal(verdict.status, "failed");
    assert.deepEqual(verdict.failureDiagnostic, {
      label: "Latest checked position",
      explanation: verdict.summary,
      fenAtBreak: baseGame.finalPositionFen,
      san: baseGame.lastMoveSan,
      uci: baseGame.lastMoveUci,
      playerColor: "white",
    });
  }
});
