import type { Challenge } from "@/lib/challenges";

export type VerifierState = "live" | "next" | "spec";

export type VerifierStatus = {
  state: VerifierState;
  summary: string;
  evidence: string;
};

export const verifierStatusByChallenge: Record<string, VerifierStatus> = {
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
    state: "spec",
    summary: "Rule spec ready; material-loss detector queued",
    evidence:
      "Will need early material swing evidence before move 10 plus final result checks, without engine scoring.",
  },
  "pawn-storm-maniac": {
    state: "spec",
    summary: "Rule spec ready; pawn-move counter queued",
    evidence:
      "Will count distinct pawn moves before move 15 and combine that with a normal-game win receipt.",
  },
  "knightmare-mode": {
    state: "spec",
    summary: "Rule spec ready; mate-piece detector queued",
    evidence:
      "Will identify the final checking move and prove the knight delivered mate rather than merely appearing nearby.",
  },
  "rookless-rampage": {
    state: "spec",
    summary: "Rule spec ready; rook-loss timeline queued",
    evidence:
      "Will prove both rooks disappeared before move 20 while the final receipt still records a player win.",
  },
  "one-bishop-to-rule-them-all": {
    state: "spec",
    summary: "Rule spec ready; bishop-survival detector queued",
    evidence:
      "Will prove only one bishop remained after move 12 and that the surviving bishop stayed on board through victory.",
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
  return verifierStatusByChallenge[challenge.id] ?? verifierStatusByChallenge["the-blunder-gambit"];
}

export function getVerifierStateLabel(status: VerifierStatus) {
  return verifierStateLabels[status.state];
}
