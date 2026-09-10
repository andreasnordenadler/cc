export type MobileBoardAccessibilitySquare = {
  square: string;
  piece?: string;
  highlight?: boolean;
};

type MobileBoardAccessibilityInput = {
  purpose: string;
  orientation: "white" | "black";
  highlightedMove?: string | null;
  squares: readonly MobileBoardAccessibilitySquare[];
};

const PIECE_NAMES: Record<string, string> = {
  K: "White king",
  Q: "White queen",
  R: "White rook",
  B: "White bishop",
  N: "White knight",
  P: "White pawn",
  k: "Black king",
  q: "Black queen",
  r: "Black rook",
  b: "Black bishop",
  n: "Black knight",
  p: "Black pawn",
};

export function describeMobileBoardSquare(square: MobileBoardAccessibilitySquare) {
  const occupant = square.piece ? PIECE_NAMES[square.piece] ?? "unknown piece" : "empty";
  return `${square.square}: ${occupant}${square.highlight ? "; highlighted move square" : ""}`;
}

export function describeMobileBoard({ purpose, orientation, highlightedMove, squares }: MobileBoardAccessibilityInput) {
  const pieceCount = squares.filter(({ piece }) => Boolean(piece)).length;
  const highlights = squares.filter(({ highlight }) => highlight).map(({ square }) => square);
  const moveMatch = highlightedMove?.match(/^([a-h][1-8])([a-h][1-8])/i);
  const highlightDescription = moveMatch
    ? `Highlighted move: ${moveMatch[1].toLowerCase()} to ${moveMatch[2].toLowerCase()}.`
    : highlights.length > 0
      ? `Highlighted move squares: ${highlights.join(", ")}.`
      : "No move squares highlighted.";

  return `${purpose} chess board, shown from ${orientation === "black" ? "Black" : "White"}'s side. ${pieceCount} ${pieceCount === 1 ? "piece" : "pieces"}. ${highlightDescription}`;
}
