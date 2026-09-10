import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  describeMobileBoard,
  describeMobileBoardSquare,
} from "../apps/mobile/src/proof/mobileBoardAccessibility";

test("native proof squares announce coordinate, color, piece, and move highlight", () => {
  assert.equal(
    describeMobileBoardSquare({ square: "e1", piece: "K", highlight: false }),
    "e1: White king",
  );
  assert.equal(
    describeMobileBoardSquare({ square: "f6", piece: "n", highlight: true }),
    "f6: Black knight; highlighted move square",
  );
  assert.equal(
    describeMobileBoardSquare({ square: "e4", highlight: true }),
    "e4: empty; highlighted move square",
  );
});

test("native proof board summary announces orientation, material, and move direction independently of display order", () => {
  assert.equal(
    describeMobileBoard({
      purpose: "Final position",
      orientation: "black",
      highlightedMove: "e7e5",
      squares: [
        { square: "e8", piece: "k", highlight: false },
        { square: "e5", piece: "p", highlight: true },
        { square: "e7", piece: "p", highlight: true },
      ],
    }),
    "Final position chess board, shown from Black's side. 3 pieces. Highlighted move: e7 to e5.",
  );
});

test("native proof boards expose the shared summary and labeled square semantics", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const failureBoardStart = source.indexOf("function FailureDiagnosticBoard");
  const victoryBoardEnd = source.indexOf("function getMultiplayerInviteUrl", failureBoardStart);
  assert.notEqual(failureBoardStart, -1);
  assert.notEqual(victoryBoardEnd, -1);
  const proofBoards = source.slice(failureBoardStart, victoryBoardEnd);

  assert.match(proofBoards, /describeMobileBoard\(\{/);
  assert.match(proofBoards, /highlightedMove: uci/);
  assert.match(proofBoards, /highlightedMove: proof\?\.lastMoveUci/);
  assert.match(proofBoards, /accessibilityLabel=\{boardAccessibilityLabel\}/);
  assert.match(proofBoards, /accessibilityLabel=\{describeMobileBoardSquare\(square\)\}/);
  assert.match(proofBoards, /accessibilityRole="text"/);
  assert.match(proofBoards, /accessible=\{false\}/);
});
