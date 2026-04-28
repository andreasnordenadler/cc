import type { Challenge } from "@/lib/challenges";

export type VerifierState = "live" | "next" | "spec";

export type VerifierStatus = {
  state: VerifierState;
  summary: string;
  evidence: string;
};

export const verifierStatusByChallenge: Record<string, VerifierStatus> = {
  "knights-before-coffee": {
    state: "live",
    summary: "Live-backed Lichess latest-game verifier",
    evidence:
      "Checks player win, first four player moves all being knight moves, legal time class, and standard chess from normalized Lichess moves.",
  },
  "bishop-field-trip": {
    state: "live",
    summary: "Live-backed Lichess latest-game verifier",
    evidence:
      "Checks player win, both original bishops moving before the player queen, legal time class, and standard chess from normalized Lichess moves.",
  },
  "early-king-walk": {
    state: "spec",
    summary: "Beginner quest specified; verifier next",
    evidence:
      "Will check a non-castling king move before the player’s move 12, then that the player won a standard chess game.",
  },
  "queen-never-heard-of-her": {
    state: "live",
    summary: "Live-backed Lichess latest-game verifier",
    evidence:
      "Checks queen loss before move 15, opponent queen still present, legal time class, standard chess, minimum game length, and player win.",
  },
  "no-castle-club": {
    state: "live",
    summary: "Live-backed Lichess latest-game verifier",
    evidence:
      "Checks player win, zero player castling, legal time class, standard chess, and minimum game length from normalized Lichess moves.",
  },
  "the-blunder-gambit": {
    state: "live",
    summary: "Live-backed Lichess latest-game verifier",
    evidence:
      "Checks player win, early unbalanced knight/bishop/rook loss by move 10, no equal immediate reply, legal time class, standard chess, and minimum game length from normalized Lichess moves.",
  },
  "pawn-storm-maniac": {
    state: "live",
    summary: "Live-backed Lichess latest-game verifier",
    evidence:
      "Checks player win, six different player pawns moved before move 15, legal time class, standard chess, and minimum game length from normalized Lichess moves.",
  },
  "knightmare-mode": {
    state: "live",
    summary: "Live-backed Lichess latest-game verifier",
    evidence:
      "Checks player win by checkmate, final move made by the player, final move piece was a knight, legal time class, standard chess, and minimum game length from normalized Lichess moves.",
  },
  "rookless-rampage": {
    state: "live",
    summary: "Live-backed Lichess latest-game verifier",
    evidence:
      "Checks player win, both original player rooks captured before move 20, legal time class, standard chess, and minimum game length from normalized Lichess moves.",
  },
  "one-bishop-to-rule-them-all": {
    state: "live",
    summary: "Live-backed Lichess latest-game verifier",
    evidence:
      "Checks player win, exactly one final player bishop, zero final player knights, legal time class, standard chess, and minimum game length from normalized Lichess moves.",
  },
};

export const verifierStateLabels: Record<VerifierState, { label: string; className: string; promise: string }> = {
  live: {
    label: "Live-backed",
    className: "badge success",
    promise: "Can create an honest pass/fail/pending receipt from a connected Lichess username today.",
  },
  next: {
    label: "Next adapter",
    className: "badge gold",
    promise: "Rules are product-ready; the next implementation step is provider move-data normalization.",
  },
  spec: {
    label: "Specified",
    className: "badge",
    promise: "Shown as a clear product contract now, not as a fake automated success claim.",
  },
};

export function getVerifierStatus(challenge: Pick<Challenge, "id">) {
  return verifierStatusByChallenge[challenge.id] ?? {
    state: "spec",
    summary: "Verifier not specified yet",
    evidence: "This challenge needs an explicit verifier contract before it can create automated receipts.",
  };
}

export function getVerifierStateLabel(status: VerifierStatus) {
  return verifierStateLabels[status.state];
}
