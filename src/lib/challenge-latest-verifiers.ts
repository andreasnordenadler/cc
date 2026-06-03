import { CHALLENGES } from "@/lib/challenges";
import {
  checkLatestChessComBackRankGoblin,
  checkLatestLichessBackRankGoblin,
} from "@/lib/back-rank-goblin";
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

export type LatestChallengeFailureDiagnostic = {
  label?: string;
  explanation?: string;
  moveNumber?: number;
  ply?: number;
  san?: string;
  uci?: string;
  fenAtBreak?: string;
  playerColor?: "white" | "black";
};

export type LatestChallengeVerdict = {
  status: "passed" | "failed" | "pending";
  gameId: string;
  summary: string;
  evidence?: string[];
  completedGameAt?: string;
  startedGameAt?: string;
  finalPositionFen?: string;
  lastMoveUci?: string;
  lastMoveSan?: string;
  failureDiagnostic?: LatestChallengeFailureDiagnostic;
};

type LatestChallengeVerifier = (username: string) => Promise<LatestChallengeVerdict>;

const latestChallengeVerifiers: Record<string, Record<SupportedLatestChallengeProvider, LatestChallengeVerifier>> = {
  "back-rank-goblin": {
    lichess: checkLatestLichessBackRankGoblin,
    chesscom: checkLatestChessComBackRankGoblin,
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

const latestFinishedBoardCache = new Map<string, Promise<LatestChallengeVerdict>>();

function getLatestFinishedBoardVerdict(provider: SupportedLatestChallengeProvider, username: string) {
  const cacheKey = `${provider}:${username.trim().toLowerCase()}`;
  const cached = latestFinishedBoardCache.get(cacheKey);
  if (cached) return cached;

  const lookup = provider === "lichess" ? checkLatestLichessFinishedGame(username) : checkLatestChessComFinishedGame(username);
  latestFinishedBoardCache.set(cacheKey, lookup);
  return lookup;
}

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

async function enrichVerdictWithLatestBoard(input: {
  provider: SupportedLatestChallengeProvider;
  username: string;
  verdict: LatestChallengeVerdict;
}): Promise<LatestChallengeVerdict> {
  const { provider, username, verdict } = input;

  if (verdict.status === "pending" || (verdict.finalPositionFen && (verdict.status === "passed" || verdict.failureDiagnostic?.fenAtBreak))) {
    return verdict;
  }

  const latestFinished = await getLatestFinishedBoardVerdict(provider, username);

  if (latestFinished.status !== "passed" || latestFinished.gameId !== verdict.gameId || !latestFinished.finalPositionFen) {
    return verdict;
  }

  const latestFinishedLastMoveSan = "lastMoveSan" in latestFinished ? latestFinished.lastMoveSan : undefined;
  const sharedBoardFields = {
    startedGameAt: verdict.startedGameAt ?? latestFinished.startedGameAt,
    completedGameAt: verdict.completedGameAt ?? latestFinished.completedGameAt,
    finalPositionFen: verdict.finalPositionFen ?? latestFinished.finalPositionFen,
    lastMoveUci: verdict.lastMoveUci ?? latestFinished.lastMoveUci,
    lastMoveSan: verdict.lastMoveSan ?? latestFinishedLastMoveSan,
  };

  if (verdict.status === "failed") {
    return {
      ...verdict,
      ...sharedBoardFields,
      failureDiagnostic: verdict.failureDiagnostic ?? {
        label: "Latest checked position",
        explanation: verdict.summary,
        fenAtBreak: latestFinished.finalPositionFen,
      },
    };
  }

  return {
    ...verdict,
    ...sharedBoardFields,
  };
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
  const verdict = await verifier(input.username);
  return enrichVerdictWithLatestBoard({ provider: input.provider, username: input.username, verdict });
}
