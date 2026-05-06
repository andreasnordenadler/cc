type Board = Record<string, string>;

const INITIAL_BOARD: Board = {
  a1: "R", b1: "N", c1: "B", d1: "Q", e1: "K", f1: "B", g1: "N", h1: "R",
  a2: "P", b2: "P", c2: "P", d2: "P", e2: "P", f2: "P", g2: "P", h2: "P",
  a7: "p", b7: "p", c7: "p", d7: "p", e7: "p", f7: "p", g7: "p", h7: "p",
  a8: "r", b8: "n", c8: "b", d8: "q", e8: "k", f8: "b", g8: "n", h8: "r",
};

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const PROMOTION_PIECES: Record<string, string> = { q: "q", r: "r", b: "b", n: "n" };

export type ProofPosition = {
  finalPositionFen: string;
  lastMoveUci?: string;
};

export function buildProofPositionFromUciMoves(movesText?: string): ProofPosition | null {
  const moves = movesText?.trim().split(/\s+/).filter(Boolean) ?? [];

  if (!moves.length || moves.some((move) => !/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(move))) {
    return null;
  }

  const board: Board = { ...INITIAL_BOARD };
  let activeColor: "w" | "b" = "w";
  let enPassantTarget = "-";
  let halfmoveClock = 0;
  let fullmoveNumber = 1;
  const castlingRights = new Set(["K", "Q", "k", "q"]);

  for (const move of moves) {
    const from = move.slice(0, 2);
    const to = move.slice(2, 4);
    const promotion = move[4];
    const piece = board[from];

    if (!piece) {
      return null;
    }

    const isWhitePiece = piece === piece.toUpperCase();
    if ((activeColor === "w") !== isWhitePiece) {
      return null;
    }

    const capturedPiece = board[to];
    const isPawn = piece.toLowerCase() === "p";
    const wasEnPassantCapture = isPawn && !capturedPiece && from[0] !== to[0] && to === enPassantTarget;

    delete board[from];

    if (wasEnPassantCapture) {
      const capturedPawnSquare = `${to[0]}${from[1]}`;
      delete board[capturedPawnSquare];
    }

    if (piece === "K" && from === "e1") {
      castlingRights.delete("K");
      castlingRights.delete("Q");
      if (to === "g1" && board.h1 === "R") {
        delete board.h1;
        board.f1 = "R";
      }
      if (to === "c1" && board.a1 === "R") {
        delete board.a1;
        board.d1 = "R";
      }
    }

    if (piece === "k" && from === "e8") {
      castlingRights.delete("k");
      castlingRights.delete("q");
      if (to === "g8" && board.h8 === "r") {
        delete board.h8;
        board.f8 = "r";
      }
      if (to === "c8" && board.a8 === "r") {
        delete board.a8;
        board.d8 = "r";
      }
    }

    updateCastlingRightsForMove(castlingRights, from, to);

    const promotedPiece = promotion ? PROMOTION_PIECES[promotion] : null;
    board[to] = promotedPiece ? (isWhitePiece ? promotedPiece.toUpperCase() : promotedPiece) : piece;

    if (isPawn || capturedPiece || wasEnPassantCapture) {
      halfmoveClock = 0;
    } else {
      halfmoveClock += 1;
    }

    enPassantTarget = "-";
    if (isPawn && Math.abs(Number(from[1]) - Number(to[1])) === 2) {
      enPassantTarget = `${from[0]}${(Number(from[1]) + Number(to[1])) / 2}`;
    }

    if (activeColor === "b") {
      fullmoveNumber += 1;
    }
    activeColor = activeColor === "w" ? "b" : "w";
  }

  return {
    finalPositionFen: `${toFenPlacement(board)} ${activeColor} ${formatCastlingRights(castlingRights)} ${enPassantTarget} ${halfmoveClock} ${fullmoveNumber}`,
    lastMoveUci: moves.at(-1),
  };
}

function updateCastlingRightsForMove(castlingRights: Set<string>, from: string, to: string) {
  if (from === "h1" || to === "h1") castlingRights.delete("K");
  if (from === "a1" || to === "a1") castlingRights.delete("Q");
  if (from === "h8" || to === "h8") castlingRights.delete("k");
  if (from === "a8" || to === "a8") castlingRights.delete("q");
}

function formatCastlingRights(castlingRights: Set<string>) {
  const rights = ["K", "Q", "k", "q"].filter((right) => castlingRights.has(right)).join("");
  return rights || "-";
}

function toFenPlacement(board: Board) {
  const ranks: string[] = [];

  for (let rank = 8; rank >= 1; rank -= 1) {
    let fenRank = "";
    let empty = 0;

    for (const file of FILES) {
      const piece = board[`${file}${rank}`];

      if (!piece) {
        empty += 1;
        continue;
      }

      if (empty) {
        fenRank += String(empty);
        empty = 0;
      }
      fenRank += piece;
    }

    if (empty) {
      fenRank += String(empty);
    }
    ranks.push(fenRank);
  }

  return ranks.join("/");
}
