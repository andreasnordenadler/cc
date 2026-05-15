import { Chess } from "chess.js";

const UCI_MOVE_PATTERN = /^[a-h][1-8][a-h][1-8][qrbn]?$/i;

export function normalizeLichessMoveTokens(moveText: string): string[] {
  const tokens = moveText.trim().split(/\s+/).filter(Boolean);

  if (!tokens.length) {
    return [];
  }

  if (tokens.every((token) => UCI_MOVE_PATTERN.test(token))) {
    return tokens;
  }

  const chess = new Chess();
  const normalizedMoves: string[] = [];

  for (const token of tokens) {
    try {
      const move = chess.move(token);
      normalizedMoves.push(move.lan);
    } catch {
      return tokens;
    }
  }

  return normalizedMoves;
}
