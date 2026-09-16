import assert from "node:assert/strict";
import test from "node:test";
import { Chess } from "chess.js";
import { evaluateBackRankGoblin } from "../src/lib/back-rank-goblin";
import type { ChessComCanonicalMove } from "../src/lib/custom-side-quests";

const pieceNames = {
  p: "pawn",
  n: "knight",
  b: "bishop",
  r: "rook",
  q: "queen",
  k: "king",
} as const;

function canonicalReplay(tokens: string[]) {
  const chess = new Chess();
  const moves: ChessComCanonicalMove[] = tokens.map((uci, index) => {
    const fenBefore = chess.fen();
    const move = chess.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci.slice(4, 5) || undefined });
    return {
      ply: index + 1,
      color: move.color === "w" ? "white" : "black",
      piece: pieceNames[move.piece],
      origin: move.from,
      from: move.from,
      to: move.to,
      san: move.san,
      uci: move.lan,
      fenBefore,
      fenAfter: chess.fen(),
    };
  });

  return { moves, finalPositionFen: chess.fen() };
}

test("Back Rank Goblin failure identifies the checked final position", () => {
  const verdict = evaluateBackRankGoblin({
    id: "draw-without-mate",
    playerColor: "white",
    winner: "draw",
    moves: ["e2e4", "e7e5", "g1f3", "b8c6"],
    source: "lichess",
  });

  assert.equal(verdict.status, "failed");
  assert.deepEqual(verdict.failureDiagnostic, {
    label: "Latest checked position",
    explanation: verdict.summary,
    moveNumber: 2,
    ply: 4,
    san: "Nc6",
    uci: "b8c6",
    fenAtBreak: verdict.finalPositionFen,
    playerColor: "white",
  });
});

test("Back Rank Goblin reports the terminal canonical replay ply", () => {
  const replay = canonicalReplay(["e2e4", "e7e5", "g1f3", "b8c6"]);
  const verdict = evaluateBackRankGoblin({
    id: "chesscom-draw-without-mate",
    playerColor: "white",
    winner: "draw",
    moves: [],
    source: "chess.com",
    canonicalReplay: replay,
  });

  assert.equal(verdict.status, "failed");
  assert.equal(verdict.failureDiagnostic?.moveNumber, 2);
  assert.equal(verdict.failureDiagnostic?.ply, 4);
  assert.equal(verdict.failureDiagnostic?.san, "Nc6");
  assert.equal(verdict.failureDiagnostic?.uci, "b8c6");
  assert.equal(verdict.failureDiagnostic?.fenAtBreak, replay.finalPositionFen);
});

test("Back Rank Goblin keeps empty canonical replay diagnostics at ply zero", () => {
  const replay = canonicalReplay([]);
  const verdict = evaluateBackRankGoblin({
    id: "empty-chesscom-replay",
    playerColor: "black",
    winner: "draw",
    moves: ["e2e4"],
    source: "chess.com",
    canonicalReplay: replay,
  });

  assert.equal(verdict.status, "failed");
  assert.equal(verdict.failureDiagnostic?.moveNumber, 0);
  assert.equal(verdict.failureDiagnostic?.ply, 0);
  assert.equal(verdict.failureDiagnostic?.san, undefined);
  assert.equal(verdict.failureDiagnostic?.uci, undefined);
  assert.equal(verdict.failureDiagnostic?.fenAtBreak, replay.finalPositionFen);
  assert.equal(verdict.failureDiagnostic?.playerColor, "black");
});
