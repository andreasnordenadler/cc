import { CHALLENGES } from "@/lib/challenges";
import { checkLatestLichessBishopFieldTrip } from "@/lib/bishop-field-trip";
import {
  checkLatestChessComBishopFieldTrip,
  checkLatestChessComBlunderGambit,
  checkLatestChessComEarlyKingWalk,
  checkLatestChessComFinishedGame,
  checkLatestChessComKnightmareMode,
  checkLatestChessComKnightsBeforeCoffee,
  checkLatestChessComNoCastleClub,
  checkLatestChessComOneBishopToRuleThemAll,
  checkLatestChessComPawnOnlyPicnic,
  checkLatestChessComPawnStormManiac,
  checkLatestChessComQueenNeverHeardOfHer,
  checkLatestChessComRooklessRampage,
} from "@/lib/chesscom";
import { checkLatestLichessEarlyKingWalk } from "@/lib/early-king-walk";
import { checkLatestLichessKnightsBeforeCoffee } from "@/lib/knights-before-coffee";
import { checkLatestLichessFinishedGame } from "@/lib/lichess";
import { checkLatestLichessKnightmareMode } from "@/lib/knightmare-mode";
import { checkLatestLichessNoCastleClub } from "@/lib/no-castle-club";
import { checkLatestLichessOneBishopToRuleThemAll } from "@/lib/one-bishop-to-rule-them-all";
import { checkLatestLichessPawnOnlyPicnic } from "@/lib/pawn-only-picnic";
import { checkLatestLichessPawnStormManiac } from "@/lib/pawn-storm-maniac";
import { checkLatestLichessQueenNeverHeardOfHer } from "@/lib/queen-never-heard-of-her";
import { checkLatestLichessRooklessRampage } from "@/lib/rookless-rampage";
import { checkLatestLichessBlunderGambit } from "@/lib/the-blunder-gambit";

export type SupportedLatestChallengeProvider = "lichess" | "chesscom";

export type LatestChallengeVerdict = {
  status: "passed" | "failed" | "pending";
  gameId: string;
  summary: string;
  evidence?: string[];
  completedGameAt?: string;
  startedGameAt?: string;
};

type LatestChallengeVerifier = (username: string) => Promise<LatestChallengeVerdict>;

async function checkLatestBackRankGoblinActivation(username: string): Promise<LatestChallengeVerdict> {
  return {
    status: "pending",
    gameId: "back-rank-goblin-verifier-pending",
    summary: username.trim()
      ? "Back Rank Goblin is active. Full automatic back-rank mate verification is being prepared; play a fresh public win after picking it."
      : "Add a chess username before Side Quest Chess can inspect Back Rank Goblin attempts.",
    evidence: [
      "Quest can be picked and tracked now.",
      "Automatic back-rank mate detection is intentionally not stamped complete until the dedicated verifier ships.",
    ],
  };
}

const latestChallengeVerifiers: Record<string, Record<SupportedLatestChallengeProvider, LatestChallengeVerifier>> = {
  "back-rank-goblin": {
    lichess: checkLatestBackRankGoblinActivation,
    chesscom: checkLatestBackRankGoblinActivation,
  },
  "finish-any-game": {
    lichess: checkLatestLichessFinishedGame,
    chesscom: checkLatestChessComFinishedGame,
  },
  "knights-before-coffee": {
    lichess: checkLatestLichessKnightsBeforeCoffee,
    chesscom: checkLatestChessComKnightsBeforeCoffee,
  },
  "bishop-field-trip": {
    lichess: checkLatestLichessBishopFieldTrip,
    chesscom: checkLatestChessComBishopFieldTrip,
  },
  "early-king-walk": {
    lichess: checkLatestLichessEarlyKingWalk,
    chesscom: checkLatestChessComEarlyKingWalk,
  },
  "pawn-only-picnic": {
    lichess: checkLatestLichessPawnOnlyPicnic,
    chesscom: checkLatestChessComPawnOnlyPicnic,
  },
  "queen-never-heard-of-her": {
    lichess: checkLatestLichessQueenNeverHeardOfHer,
    chesscom: checkLatestChessComQueenNeverHeardOfHer,
  },
  "no-castle-club": {
    lichess: checkLatestLichessNoCastleClub,
    chesscom: checkLatestChessComNoCastleClub,
  },
  "the-blunder-gambit": {
    lichess: checkLatestLichessBlunderGambit,
    chesscom: checkLatestChessComBlunderGambit,
  },
  "pawn-storm-maniac": {
    lichess: checkLatestLichessPawnStormManiac,
    chesscom: checkLatestChessComPawnStormManiac,
  },
  "knightmare-mode": {
    lichess: checkLatestLichessKnightmareMode,
    chesscom: checkLatestChessComKnightmareMode,
  },
  "rookless-rampage": {
    lichess: checkLatestLichessRooklessRampage,
    chesscom: checkLatestChessComRooklessRampage,
  },
  "one-bishop-to-rule-them-all": {
    lichess: checkLatestLichessOneBishopToRuleThemAll,
    chesscom: checkLatestChessComOneBishopToRuleThemAll,
  },
};

const missingLatestVerifiers = CHALLENGES.filter((challenge) => {
  const entry = latestChallengeVerifiers[challenge.id];
  return !entry?.lichess || !entry?.chesscom;
}).map((challenge) => challenge.id);

if (missingLatestVerifiers.length > 0) {
  throw new Error(
    `Missing latest-game multiplayer verifier coverage for: ${missingLatestVerifiers.join(", ")}. Every Side Quest must register both lichess and chesscom latest-game verifiers.`,
  );
}

export function hasLatestChallengeVerifier(challengeId: string, provider: SupportedLatestChallengeProvider) {
  return Boolean(latestChallengeVerifiers[challengeId]?.[provider]);
}

export async function checkLatestChallengeForProvider(input: {
  challengeId: string;
  provider: SupportedLatestChallengeProvider;
  username: string;
}): Promise<LatestChallengeVerdict> {
  const verifier = latestChallengeVerifiers[input.challengeId]?.[input.provider];
  if (!verifier) {
    throw new Error(`No latest-game verifier registered for ${input.challengeId} on ${input.provider}.`);
  }
  return verifier(input.username);
}
