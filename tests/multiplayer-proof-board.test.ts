import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { MultiplayerProofBoard } from "../src/components/group-quest-proof-controls";

test("failed Multiplayer proof board shows the first rule break rather than the final move", () => {
  const html = renderToStaticMarkup(createElement(MultiplayerProofBoard, {
    check: {
      questId: "no-knight-moves",
      status: "failed",
      finalPositionFen: "8/8/8/8/8/8/8/8 w - - 0 1",
      lastMoveUci: "a2a4",
      lastMoveSan: "a4",
      failureDiagnostic: {
        label: "First rule break",
        explanation: "Move 12 let the knight move.",
        moveNumber: 12,
        ply: 23,
        san: "Ne4",
        uci: "f6e4",
        fenAtBreak: "8/8/8/8/4n3/8/8/8 w - - 0 12",
      },
    },
  }));

  assert.match(html, /Chess position with first failing move highlighted/);
  assert.match(html, /First break: First rule break/);
  assert.match(html, /Move 12 let the knight move\./);
  assert.match(html, /Breaking move: Ne4/);
  assert.match(html, /e4 n/);
  assert.doesNotMatch(html, /Last move: a4/);
});

test("first-break board never borrows the final move when only diagnostic UCI exists", () => {
  const html = renderToStaticMarkup(createElement(MultiplayerProofBoard, {
    check: {
      questId: "no-knight-moves",
      status: "failed",
      finalPositionFen: "8/8/8/8/8/8/8/8 w - - 0 1",
      lastMoveUci: "a2a4",
      lastMoveSan: "a4",
      failureDiagnostic: {
        label: "First rule break",
        uci: "f6e4",
        fenAtBreak: "8/8/8/8/4n3/8/8/8 w - - 0 12",
      },
    },
  }));

  assert.match(html, /Breaking move: f6e4/);
  assert.doesNotMatch(html, /Breaking move: a4/);
  assert.match(html, /class="proof-board-square highlight" aria-label="f6 empty"/);
  assert.match(html, /class="proof-board-square highlight" aria-label="e4 n"/);
});

test("first-break board does not highlight the final move when diagnostic UCI is absent", () => {
  const html = renderToStaticMarkup(createElement(MultiplayerProofBoard, {
    check: {
      questId: "no-knight-moves",
      status: "failed",
      finalPositionFen: "8/8/8/8/8/8/8/8 w - - 0 1",
      lastMoveUci: "a2a4",
      lastMoveSan: "a4",
      failureDiagnostic: {
        label: "First rule break",
        san: "Ne4",
        fenAtBreak: "8/8/8/8/4n3/8/8/8 w - - 0 12",
      },
    },
  }));

  assert.match(html, /Breaking move: Ne4/);
  assert.doesNotMatch(html, /class="proof-board-square highlight" aria-label="a2 empty"/);
  assert.doesNotMatch(html, /class="proof-board-square highlight" aria-label="a4 empty"/);
});

test("unlocated diagnostics keep the final board and last-move semantics", () => {
  const html = renderToStaticMarkup(createElement(MultiplayerProofBoard, {
    check: {
      questId: "no-knight-moves",
      status: "failed",
      finalPositionFen: "8/8/8/8/8/8/8/8 w - - 0 1",
      lastMoveUci: "a2a4",
      lastMoveSan: "a4",
      failureDiagnostic: {
        label: "Final state note",
        moveNumber: null,
        ply: null,
        fenAtBreak: "8/8/8/8/4n3/8/8/8 w - - 0 12",
      },
    },
  }));

  assert.match(html, /Chess position with last move highlighted/);
  assert.match(html, /Checked position: Final state note/);
  assert.match(html, /Last move: a4/);
  assert.match(html, /class="proof-board-square highlight" aria-label="a2 empty"/);
  assert.doesNotMatch(html, /e4 n/);
});
