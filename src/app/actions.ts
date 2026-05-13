"use server";

import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getChallengeById } from "@/lib/challenges";
import {
  appendAnalyticsEvent,
  getAnalyticsStore,
  type SQCAnalyticsEvent,
} from "@/lib/analytics";
import {
  verifyChessComDrawAnyGameAttempt,
  verifyChessComDrawAsBlackAttempt,
  verifyChessComDrawAsWhiteAttempt,
  checkLatestChessComBishopFieldTrip,
  checkLatestChessComBlunderGambit,
  checkLatestChessComEarlyKingWalk,
  checkLatestChessComFinishedGame,
  checkLatestChessComKnightsBeforeCoffee,
  checkLatestChessComKnightmareMode,
  checkLatestChessComNoCastleClub,
  checkLatestChessComOneBishopToRuleThemAll,
  checkLatestChessComPawnOnlyPicnic,
  checkLatestChessComPawnStormManiac,
  checkLatestChessComQueenNeverHeardOfHer,
  checkLatestChessComRooklessRampage,
  verifyChessComFinishAnyGameAttempt,
  verifyChessComFinishAsBlackAttempt,
  verifyChessComFinishAsWhiteAttempt,
  verifyChessComLoseAnyGameAttempt,
  verifyChessComLoseAsBlackAttempt,
  verifyChessComLoseAsWhiteAttempt,
  verifyChessComWinAsBlackAttempt,
  verifyChessComWinAsWhiteAttempt,
} from "@/lib/chesscom";
import {
  verifyDrawAnyGameAttempt,
  verifyDrawAsBlackAttempt,
  verifyDrawAsWhiteAttempt,
  checkLatestLichessFinishedGame,
  verifyFinishAnyGameAttempt,
  verifyFinishAsBlackAttempt,
  verifyFinishAsWhiteAttempt,
  verifyLoseAnyGameAttempt,
  verifyLoseAsBlackAttempt,
  verifyLoseAsWhiteAttempt,
  verifyWinAsBlackAttempt,
  verifyWinAsWhiteAttempt,
} from "@/lib/lichess";
import {
  checkLatestLichessQueenNeverHeardOfHer,
  evaluateQueenNeverHeardOfHer,
  queenNeverHeardOfHerFixtures,
} from "@/lib/queen-never-heard-of-her";
import {
  checkLatestLichessNoCastleClub,
  evaluateNoCastleClub,
  noCastleClubFixtures,
} from "@/lib/no-castle-club";
import {
  checkLatestLichessPawnOnlyPicnic,
  evaluatePawnOnlyPicnic,
  pawnOnlyPicnicFixtures,
} from "@/lib/pawn-only-picnic";
import {
  checkLatestLichessPawnStormManiac,
  evaluatePawnStormManiac,
  pawnStormManiacFixtures,
} from "@/lib/pawn-storm-maniac";
import {
  checkLatestLichessKnightmareMode,
  evaluateKnightmareMode,
  knightmareModeFixtures,
} from "@/lib/knightmare-mode";
import {
  checkLatestLichessRooklessRampage,
  evaluateRooklessRampage,
  rooklessRampageFixtures,
} from "@/lib/rookless-rampage";
import {
  checkLatestLichessOneBishopToRuleThemAll,
  evaluateOneBishopToRuleThemAll,
  oneBishopToRuleThemAllFixtures,
} from "@/lib/one-bishop-to-rule-them-all";
import {
  blunderGambitFixtures,
  checkLatestLichessBlunderGambit,
  evaluateBlunderGambit,
} from "@/lib/the-blunder-gambit";
import {
  checkLatestLichessKnightsBeforeCoffee,
  evaluateKnightsBeforeCoffee,
  knightsBeforeCoffeeFixtures,
} from "@/lib/knights-before-coffee";
import {
  bishopFieldTripFixtures,
  checkLatestLichessBishopFieldTrip,
  evaluateBishopFieldTrip,
} from "@/lib/bishop-field-trip";
import {
  checkLatestLichessEarlyKingWalk,
  earlyKingWalkFixtures,
  evaluateEarlyKingWalk,
} from "@/lib/early-king-walk";
import {
  getChallengeProgress,
  getChessComUsername,
  getLichessUsername,
  type ChallengeAttempt,
  type UserMetadataRecord,
} from "@/lib/user-metadata";


const simulatedChallengeChecks: Record<string, Array<{ status: "passed" | "failed" | "pending"; summary: string; gameId: string }>> = {
  "queen-never-heard-of-her": [
    {
      status: "failed",
      gameId: "latest-game-queen-on-board",
      summary: "Checked the latest eligible game: queen stayed alive past move 15, which is annoyingly responsible chess.",
    },
    {
      status: "pending",
      gameId: "latest-game-needs-final-position",
      summary: "Found a queen sacrifice candidate, but the final proof still needs the verifier rule to confirm opponent queen status.",
    },
  ],
  "no-castle-club": [
    {
      status: "passed",
      gameId: "latest-game-king-cardio",
      summary: "Latest eligible win had zero castling. The king walked around uninsured and Side Quest Chess approves.",
    },
  ],
  "the-blunder-gambit": [
    {
      status: "failed",
      gameId: "latest-game-actually-fine",
      summary: "No early piece hang found in the latest game. Suspiciously competent chess does not count.",
    },
  ],
  "pawn-storm-maniac": [
    {
      status: "pending",
      gameId: "latest-game-pawn-weather",
      summary: "Detected multiple early pawn moves; verifier still needs the full six-pawn threshold check before awarding chaos points.",
    },
  ],
  "knightmare-mode": [
    {
      status: "failed",
      gameId: "latest-game-not-horse-paperwork",
      summary: "The latest game did not end with a knight checkmate. The horse remains dramatic, but uncredited.",
    },
  ],
  "rookless-rampage": [
    {
      status: "failed",
      gameId: "latest-game-tower-still-standing",
      summary: "The latest game still had at least one original rook standing before move 20. Demolition permit denied.",
    },
  ],
  "one-bishop-to-rule-them-all": [
    {
      status: "failed",
      gameId: "latest-game-too-much-middle-management",
      summary: "The latest game did not end with exactly one bishop as your only minor piece. The department is not lonely enough yet.",
    },
  ],
};


function compactChallengeAttempts(attempts: ChallengeAttempt[], maxRecentAttempts = 8): ChallengeAttempt[] {
  const compacted = attempts.map((attempt) => ({
    ...attempt,
    summary: attempt.summary ? attempt.summary.slice(0, 220) : attempt.summary,
  }));
  const latestPassedByChallenge = new Map<string, ChallengeAttempt>();

  for (const attempt of compacted) {
    const challengeId = attempt.challengeId ?? attempt.id?.split(":")[0];

    if (attempt.status === "passed" && challengeId) {
      latestPassedByChallenge.set(challengeId, attempt);
    }
  }

  const keepKeys = new Set(
    [
      ...compacted.slice(-maxRecentAttempts),
      ...latestPassedByChallenge.values(),
    ].map((attempt) => attempt.id ?? `${attempt.challengeId}:${attempt.provider}:${attempt.checkedAt}:${attempt.gameId}`),
  );

  return compacted.filter((attempt) =>
    keepKeys.has(attempt.id ?? `${attempt.challengeId}:${attempt.provider}:${attempt.checkedAt}:${attempt.gameId}`),
  );
}

function getAttemptChallengeId(attempt: ChallengeAttempt): string | undefined {
  return typeof attempt.challengeId === "string"
    ? attempt.challengeId
    : typeof attempt.id === "string"
      ? attempt.id.split(":")[0]
      : undefined;
}

function buildProgressRecord(completedChallengeIds: string[]) {
  return {
    completedChallengeIds,
    totalCompletedChallenges: completedChallengeIds.length,
    totalRewardPoints: completedChallengeIds.reduce((sum, id) => {
      const completedChallenge = getChallengeById(id);
      return sum + (completedChallenge?.reward ?? 0);
    }, 0),
  };
}

function pickProofReceiptFields(attempt: Partial<ChallengeAttempt>): Partial<ChallengeAttempt> {
  return {
    completedGameAt: attempt.completedGameAt,
    finalPositionFen: attempt.finalPositionFen,
    lastMoveUci: attempt.lastMoveUci,
    lastMoveSan: attempt.lastMoveSan,
  };
}

function buildLatestGameCheckPayload(
  verdict: ChallengeAttempt & { evidence?: string[] },
  challengeTitle: string,
  activatedAfter?: string,
) {
  if (verdict.status === "passed" && activatedAfter && !isAfterActivation(verdict.completedGameAt, activatedAfter)) {
    return {
      status: "pending" as const,
      gameId: verdict.gameId,
      summary: `Found ${verdict.gameId ?? "the latest game"}, but it was completed before this ${challengeTitle} run was activated. Play a new public game after starting the quest, then check again.`,
      evidence: ["Only games finished after the current quest activation can complete a reset/restarted quest."],
    };
  }

  return {
    status: verdict.status,
    gameId: verdict.gameId,
    summary: `${verdict.summary} ${verdict.evidence?.join(" ") ?? ""}`.trim(),
    ...pickProofReceiptFields(verdict),
  };
}

function isAfterActivation(completedGameAt?: string, activatedAfter?: string) {
  if (!completedGameAt || !activatedAfter) return false;

  const completedAt = Date.parse(completedGameAt);
  const activatedAt = Date.parse(activatedAfter);

  return Number.isFinite(completedAt) && Number.isFinite(activatedAt) && completedAt > activatedAt;
}

async function buildLatestGameChecks(challengeId: string, attemptCount: number, lichessUsername: string, chessComUsername: string, activatedAfter?: string) {
  const checks = [];

  if (lichessUsername) {
    checks.push({
      ...(await buildLatestGameCheck(challengeId, attemptCount, lichessUsername, "", activatedAfter)),
      provider: "lichess" as const,
    });
  }

  if (chessComUsername) {
    checks.push({
      ...(await buildLatestGameCheck(challengeId, attemptCount + checks.length, "", chessComUsername, activatedAfter)),
      provider: "chess.com" as const,
    });
  }

  if (checks.length > 0) {
    return checks;
  }

  return [
    {
      ...(await buildLatestGameCheck(challengeId, attemptCount, "", "", activatedAfter)),
      provider: "fixture" as const,
    },
  ];
}

async function buildLatestGameCheck(challengeId: string, attemptCount: number, lichessUsername: string, chessComUsername: string, activatedAfter?: string) {
  if (challengeId === "finish-any-game") {
    if (lichessUsername) {
      const verdict = await checkLatestLichessFinishedGame(lichessUsername);

      return buildLatestGameCheckPayload(verdict, getChallengeById(challengeId)?.title ?? challengeId, activatedAfter);
    }

    if (chessComUsername) {
      const verdict = await checkLatestChessComFinishedGame(chessComUsername);

      return buildLatestGameCheckPayload(verdict, getChallengeById(challengeId)?.title ?? challengeId, activatedAfter);
    }

    return {
      status: "pending" as const,
      gameId: "proof-loop-test-awaiting-username",
      summary: "Add a Lichess or Chess.com username, play any public finished game, then run the latest-game check to complete the Any Game Counts.",
    };
  }

  if (challengeId === "knights-before-coffee") {
    if (lichessUsername) {
      const verdict = await checkLatestLichessKnightsBeforeCoffee(lichessUsername);

      return buildLatestGameCheckPayload(verdict, getChallengeById(challengeId)?.title ?? challengeId, activatedAfter);
    }

    if (chessComUsername) {
      const verdict = await checkLatestChessComKnightsBeforeCoffee(chessComUsername);

      return buildLatestGameCheckPayload(verdict, getChallengeById(challengeId)?.title ?? challengeId, activatedAfter);
    }

    const fixture = knightsBeforeCoffeeFixtures[attemptCount % knightsBeforeCoffeeFixtures.length];
    const verdict = evaluateKnightsBeforeCoffee(fixture);

    return {
      status: verdict.status,
      gameId: verdict.gameId,
      summary: `${verdict.summary} ${verdict.evidence.join(" ")}`,
    };
  }

  if (challengeId === "bishop-field-trip") {
    if (lichessUsername) {
      const verdict = await checkLatestLichessBishopFieldTrip(lichessUsername);

      return buildLatestGameCheckPayload(verdict, getChallengeById(challengeId)?.title ?? challengeId, activatedAfter);
    }

    if (chessComUsername) {
      const verdict = await checkLatestChessComBishopFieldTrip(chessComUsername);

      return buildLatestGameCheckPayload(verdict, getChallengeById(challengeId)?.title ?? challengeId, activatedAfter);
    }

    const fixture = bishopFieldTripFixtures[attemptCount % bishopFieldTripFixtures.length];
    const verdict = evaluateBishopFieldTrip(fixture);

    return {
      status: verdict.status,
      gameId: verdict.gameId,
      summary: `${verdict.summary} ${verdict.evidence.join(" ")}`,
    };
  }

  if (challengeId === "early-king-walk") {
    if (lichessUsername) {
      const verdict = await checkLatestLichessEarlyKingWalk(lichessUsername);

      return buildLatestGameCheckPayload(verdict, getChallengeById(challengeId)?.title ?? challengeId, activatedAfter);
    }

    if (chessComUsername) {
      const verdict = await checkLatestChessComEarlyKingWalk(chessComUsername);

      return buildLatestGameCheckPayload(verdict, getChallengeById(challengeId)?.title ?? challengeId, activatedAfter);
    }

    const fixture = earlyKingWalkFixtures[attemptCount % earlyKingWalkFixtures.length];
    const verdict = evaluateEarlyKingWalk(fixture);

    return {
      status: verdict.status,
      gameId: verdict.gameId,
      summary: `${verdict.summary} ${verdict.evidence.join(" ")}`,
    };
  }

  if (challengeId === "queen-never-heard-of-her") {
    if (lichessUsername) {
      const verdict = await checkLatestLichessQueenNeverHeardOfHer(lichessUsername);

      return buildLatestGameCheckPayload(verdict, getChallengeById(challengeId)?.title ?? challengeId, activatedAfter);
    }

    if (chessComUsername) {
      const verdict = await checkLatestChessComQueenNeverHeardOfHer(chessComUsername);

      return buildLatestGameCheckPayload(verdict, getChallengeById(challengeId)?.title ?? challengeId, activatedAfter);
    }

    const fixture = queenNeverHeardOfHerFixtures[attemptCount % queenNeverHeardOfHerFixtures.length];
    const verdict = evaluateQueenNeverHeardOfHer(fixture);

    return {
      status: verdict.status,
      gameId: verdict.gameId,
      summary: `${verdict.summary} ${verdict.evidence.join(" ")}`,
    };
  }

  if (challengeId === "no-castle-club") {
    if (lichessUsername) {
      const verdict = await checkLatestLichessNoCastleClub(lichessUsername);

      return buildLatestGameCheckPayload(verdict, getChallengeById(challengeId)?.title ?? challengeId, activatedAfter);
    }

    if (chessComUsername) {
      const verdict = await checkLatestChessComNoCastleClub(chessComUsername);

      return buildLatestGameCheckPayload(verdict, getChallengeById(challengeId)?.title ?? challengeId, activatedAfter);
    }

    const fixture = noCastleClubFixtures[attemptCount % noCastleClubFixtures.length];
    const verdict = evaluateNoCastleClub(fixture);

    return {
      status: verdict.status,
      gameId: verdict.gameId,
      summary: `${verdict.summary} ${verdict.evidence.join(" ")}`,
    };
  }

  if (challengeId === "pawn-only-picnic") {
    if (lichessUsername) {
      const verdict = await checkLatestLichessPawnOnlyPicnic(lichessUsername);

      return buildLatestGameCheckPayload(verdict, getChallengeById(challengeId)?.title ?? challengeId, activatedAfter);
    }

    if (chessComUsername) {
      const verdict = await checkLatestChessComPawnOnlyPicnic(chessComUsername);

      return buildLatestGameCheckPayload(verdict, getChallengeById(challengeId)?.title ?? challengeId, activatedAfter);
    }

    const fixture = pawnOnlyPicnicFixtures[attemptCount % pawnOnlyPicnicFixtures.length];
    const verdict = evaluatePawnOnlyPicnic(fixture);

    return {
      status: verdict.status,
      gameId: verdict.gameId,
      summary: `${verdict.summary} ${verdict.evidence.join(" ")}`,
    };
  }

  if (challengeId === "pawn-storm-maniac") {
    if (lichessUsername) {
      const verdict = await checkLatestLichessPawnStormManiac(lichessUsername);

      return buildLatestGameCheckPayload(verdict, getChallengeById(challengeId)?.title ?? challengeId, activatedAfter);
    }

    if (chessComUsername) {
      const verdict = await checkLatestChessComPawnStormManiac(chessComUsername);

      return buildLatestGameCheckPayload(verdict, getChallengeById(challengeId)?.title ?? challengeId, activatedAfter);
    }

    const fixture = pawnStormManiacFixtures[attemptCount % pawnStormManiacFixtures.length];
    const verdict = evaluatePawnStormManiac(fixture);

    return {
      status: verdict.status,
      gameId: verdict.gameId,
      summary: `${verdict.summary} ${verdict.evidence.join(" ")}`,
    };
  }

  if (challengeId === "knightmare-mode") {
    if (lichessUsername) {
      const verdict = await checkLatestLichessKnightmareMode(lichessUsername);

      return buildLatestGameCheckPayload(verdict, getChallengeById(challengeId)?.title ?? challengeId, activatedAfter);
    }

    if (chessComUsername) {
      const verdict = await checkLatestChessComKnightmareMode(chessComUsername);

      return buildLatestGameCheckPayload(verdict, getChallengeById(challengeId)?.title ?? challengeId, activatedAfter);
    }

    const fixture = knightmareModeFixtures[attemptCount % knightmareModeFixtures.length];
    const verdict = evaluateKnightmareMode(fixture);

    return {
      status: verdict.status,
      gameId: verdict.gameId,
      summary: `${verdict.summary} ${verdict.evidence.join(" ")}`,
    };
  }

  if (challengeId === "rookless-rampage") {
    if (lichessUsername) {
      const verdict = await checkLatestLichessRooklessRampage(lichessUsername);

      return buildLatestGameCheckPayload(verdict, getChallengeById(challengeId)?.title ?? challengeId, activatedAfter);
    }

    if (chessComUsername) {
      const verdict = await checkLatestChessComRooklessRampage(chessComUsername);

      return buildLatestGameCheckPayload(verdict, getChallengeById(challengeId)?.title ?? challengeId, activatedAfter);
    }

    const fixture = rooklessRampageFixtures[attemptCount % rooklessRampageFixtures.length];
    const verdict = evaluateRooklessRampage(fixture);

    return {
      status: verdict.status,
      gameId: verdict.gameId,
      summary: `${verdict.summary} ${verdict.evidence.join(" ")}`,
    };
  }

  if (challengeId === "one-bishop-to-rule-them-all") {
    if (lichessUsername) {
      const verdict = await checkLatestLichessOneBishopToRuleThemAll(lichessUsername);

      return buildLatestGameCheckPayload(verdict, getChallengeById(challengeId)?.title ?? challengeId, activatedAfter);
    }

    if (chessComUsername) {
      const verdict = await checkLatestChessComOneBishopToRuleThemAll(chessComUsername);

      return buildLatestGameCheckPayload(verdict, getChallengeById(challengeId)?.title ?? challengeId, activatedAfter);
    }

    const fixture = oneBishopToRuleThemAllFixtures[attemptCount % oneBishopToRuleThemAllFixtures.length];
    const verdict = evaluateOneBishopToRuleThemAll(fixture);

    return {
      status: verdict.status,
      gameId: verdict.gameId,
      summary: `${verdict.summary} ${verdict.evidence.join(" ")}`,
    };
  }

  if (challengeId === "the-blunder-gambit") {
    if (lichessUsername) {
      const verdict = await checkLatestLichessBlunderGambit(lichessUsername);

      return buildLatestGameCheckPayload(verdict, getChallengeById(challengeId)?.title ?? challengeId, activatedAfter);
    }

    if (chessComUsername) {
      const verdict = await checkLatestChessComBlunderGambit(chessComUsername);

      return buildLatestGameCheckPayload(verdict, getChallengeById(challengeId)?.title ?? challengeId, activatedAfter);
    }

    const fixture = blunderGambitFixtures[attemptCount % blunderGambitFixtures.length];
    const verdict = evaluateBlunderGambit(fixture);

    return {
      status: verdict.status,
      gameId: verdict.gameId,
      summary: `${verdict.summary} ${verdict.evidence.join(" ")}`,
    };
  }

  const challenge = getChallengeById(challengeId);
  const examples = simulatedChallengeChecks[challengeId] ?? [
    {
      status: "pending" as const,
      gameId: `latest-game-${challengeId}`,
      summary: `Queued latest-game verification for ${challenge?.title ?? challengeId}. This quest needs its exact rule detector before auto-awarding points.`,
    },
  ];

  return examples[attemptCount % examples.length];
}

function assertUserId(userId: string | null): string {
  if (!userId) {
    throw new Error("You must be signed in.");
  }

  return userId;
}

async function getUserContext() {
  const { userId } = await auth();
  const ensuredUserId = assertUserId(userId);
  const user = await currentUser();
  const metadata = user?.publicMetadata
    ? (user.publicMetadata as UserMetadataRecord)
    : {};

  return { userId: ensuredUserId, metadata };
}

async function recordSignedInAnalyticsEvent(userId: string, event: Omit<SQCAnalyticsEvent, "at"> & { at?: string }) {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const existing = getAnalyticsStore(user.privateMetadata);
  const nextStore = appendAnalyticsEvent(existing, {
    ...event,
    at: event.at ?? new Date().toISOString(),
  });

  await client.users.updateUserMetadata(userId, {
    privateMetadata: {
      ...(user.privateMetadata ?? {}),
      sqcAnalytics: nextStore,
    },
  });
}

export async function saveChessUsernames(formData: FormData) {
  const { userId, metadata } = await getUserContext();
  const lichessUsername = String(formData.get("lichessUsername") ?? "").trim();
  const chessComUsername = String(formData.get("chessComUsername") ?? "").trim();

  if (!lichessUsername && !chessComUsername) {
    throw new Error("Enter at least one chess username.");
  }

  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      ...metadata,
      lichessUsername,
      chessComUsername,
    },
  });

  await recordSignedInAnalyticsEvent(userId, {
    type: "profile_saved",
    path: "/account",
    source: "server_action",
  });

  revalidatePath("/");
  revalidatePath("/account");
  revalidatePath("/challenges");
}

export async function saveRunnerProfile(formData: FormData) {
  const { userId, metadata } = await getUserContext();
  const runnerDisplayName = String(formData.get("runnerDisplayName") ?? "").trim().slice(0, 60);
  const runnerBio = String(formData.get("runnerBio") ?? "").trim().slice(0, 180);
  const lichessUsername = String(formData.get("lichessUsername") ?? "").trim();
  const chessComUsername = String(formData.get("chessComUsername") ?? "").trim();

  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      ...metadata,
      runnerDisplayName,
      runnerBio,
      lichessUsername,
      chessComUsername,
    },
  });

  await recordSignedInAnalyticsEvent(userId, {
    type: "profile_saved",
    path: "/profile",
    source: "server_action",
  });

  revalidatePath("/");
  revalidatePath("/account");
  revalidatePath("/profile");
  revalidatePath("/connect");
  redirect("/account?profile=saved");
}

export async function startChallenge(formData: FormData) {
  const { userId, metadata } = await getUserContext();
  const challengeId = String(formData.get("challengeId") ?? "");
  const challenge = getChallengeById(challengeId);

  if (!challenge) {
    throw new Error("Unknown quest.");
  }

  const existingAttempts = Array.isArray(metadata.challengeAttempts)
    ? (metadata.challengeAttempts as ChallengeAttempt[])
    : [];
  const now = new Date().toISOString();
  const lichessUsername = getLichessUsername(metadata);
  const chessComUsername = getChessComUsername(metadata);
  let providerChecks: Awaited<ReturnType<typeof buildLatestGameChecks>> = [];

  if (lichessUsername || chessComUsername) {
    try {
      providerChecks = await buildLatestGameChecks(challenge.id, existingAttempts.length, lichessUsername, chessComUsername, now);
    } catch {
      providerChecks = [
        {
          status: "pending",
          gameId: `activation-check-${challenge.id}`,
          provider: "fixture",
          summary: "Quest activated, but the immediate latest-game check could not reach a chess provider. Play normally, then refresh the quest status after your next public game.",
        },
      ];
    }
  }

  const progress = getChallengeProgress(metadata);
  const passedCheck = providerChecks.find((check) => check.status === "passed");
  const latestCheck = providerChecks.at(-1);
  const completedChallengeIds =
    passedCheck && !progress.completedChallengeIds.includes(challenge.id)
      ? [...progress.completedChallengeIds, challenge.id]
      : progress.completedChallengeIds;

  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      ...metadata,
      activeChallenge: {
        id: challenge.id,
        status: passedCheck ? "verified" : (latestCheck?.status ?? "accepted"),
        startedAt: now,
        verifiedAt: passedCheck ? now : undefined,
      },
      challengeAttempts: compactChallengeAttempts([
        ...existingAttempts,
        ...providerChecks.map((check, index) => ({
          id: `${challenge.id}:${check.provider}:activation:${now}:${index}`,
          challengeId: challenge.id,
          gameId: check.gameId,
          provider: check.provider,
          status: check.status,
          summary: check.summary,
          checkedAt: now,
          ...pickProofReceiptFields(check),
        })),
      ]),
      challengeProgress: {
        completedChallengeIds,
        totalCompletedChallenges: completedChallengeIds.length,
        totalRewardPoints: completedChallengeIds.reduce((sum, id) => {
          const completedChallenge = getChallengeById(id);
          return sum + (completedChallenge?.reward ?? 0);
        }, 0),
      },
    },
  });

  await recordSignedInAnalyticsEvent(userId, {
    type: "quest_started",
    questId: challenge.id,
    path: `/challenges/${challenge.id}`,
    status: passedCheck ? "completed_on_activation" : (latestCheck?.status ?? "accepted"),
    source: "server_action",
  });

  for (const check of providerChecks) {
    await recordSignedInAnalyticsEvent(userId, {
      type: check.status === "passed" ? "quest_completed" : check.status === "failed" ? "quest_failed" : "quest_pending",
      questId: challenge.id,
      provider: check.provider,
      status: check.status,
      gameId: check.gameId,
      source: "latest_game_check",
    });
  }

  revalidatePath("/");
  revalidatePath("/account");
  revalidatePath("/challenges");
  revalidatePath(`/challenges/${challenge.id}`);
  revalidatePath("/result");
}

export async function deactivateActiveChallenge(formData: FormData) {
  const { userId, metadata } = await getUserContext();
  const challengeId = String(formData.get("challengeId") ?? "");
  const activeChallenge =
    metadata.activeChallenge && typeof metadata.activeChallenge === "object"
      ? (metadata.activeChallenge as { id?: string })
      : null;

  if (!activeChallenge?.id || activeChallenge.id !== challengeId) {
    throw new Error("That quest is not currently active.");
  }

  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      ...metadata,
      activeChallenge: null,
    },
  });

  revalidatePath("/");
  revalidatePath("/account");
  revalidatePath("/challenges");
  revalidatePath(`/challenges/${challengeId}`);
}

export async function resetCompletedChallenge(formData: FormData) {
  const { userId, metadata } = await getUserContext();
  const challengeId = String(formData.get("challengeId") ?? "");
  const challenge = getChallengeById(challengeId);

  if (!challenge) {
    throw new Error("Unknown quest.");
  }

  const progress = getChallengeProgress(metadata);

  if (!progress.completedChallengeIds.includes(challenge.id)) {
    throw new Error("That quest is not completed.");
  }

  const existingAttempts = Array.isArray(metadata.challengeAttempts)
    ? (metadata.challengeAttempts as ChallengeAttempt[])
    : [];
  const remainingAttempts = existingAttempts.filter((attempt) => getAttemptChallengeId(attempt) !== challenge.id);
  const completedChallengeIds = progress.completedChallengeIds.filter((id) => id !== challenge.id);
  const activeChallenge =
    metadata.activeChallenge && typeof metadata.activeChallenge === "object"
      ? (metadata.activeChallenge as { id?: string })
      : null;

  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      ...metadata,
      activeChallenge: activeChallenge?.id === challenge.id ? null : metadata.activeChallenge,
      challengeAttempts: compactChallengeAttempts(remainingAttempts),
      challengeProgress: buildProgressRecord(completedChallengeIds),
    },
  });

  revalidatePath("/");
  revalidatePath("/account");
  revalidatePath("/badges");
  revalidatePath("/challenges");
  revalidatePath(`/challenges/${challenge.id}`);
  revalidatePath("/result");
}

export async function submitChallengeAttempt(formData: FormData) {
  const { userId, metadata } = await getUserContext();
  const challengeId = String(formData.get("challengeId") ?? "");
  const rawGameId = String(formData.get("gameId") ?? "").trim();
  const challenge = getChallengeById(challengeId);

  if (!challenge) {
    throw new Error("Unknown quest.");
  }

  if (!rawGameId) {
    throw new Error("Enter a finished Lichess or Chess.com game link/ID.");
  }

  const lichessUsername = getLichessUsername(metadata);
  const chessComUsername = getChessComUsername(metadata);
  const existingAttempts = Array.isArray(metadata.challengeAttempts)
    ? (metadata.challengeAttempts as ChallengeAttempt[])
    : [];
  const isChessComSubmission = /^https?:\/\/(www\.)?chess\.com\/game\//i.test(rawGameId);
  const gameId = isChessComSubmission
    ? rawGameId.trim()
    : rawGameId.replace(/^https?:\/\/lichess\.org\//, "").replace(/\/.*/, "");
  const now = new Date().toISOString();

  const progress = getChallengeProgress(metadata);
  const existingActiveChallenge =
    metadata.activeChallenge && typeof metadata.activeChallenge === "object"
      ? (metadata.activeChallenge as { startedAt?: string })
      : null;
  const verification =
    challenge.id === "finish-any-game" && isChessComSubmission
      ? await verifyChessComFinishAnyGameAttempt({ gameUrl: gameId, chessComUsername })
      : challenge.id === "finish-any-game"
        ? await verifyFinishAnyGameAttempt({ gameId, lichessUsername })
      : challenge.id === "finish-as-white" && isChessComSubmission
        ? await verifyChessComFinishAsWhiteAttempt({ gameUrl: gameId, chessComUsername })
      : challenge.id === "finish-as-white"
        ? await verifyFinishAsWhiteAttempt({ gameId, lichessUsername })
        : challenge.id === "finish-as-black" && isChessComSubmission
          ? await verifyChessComFinishAsBlackAttempt({ gameUrl: gameId, chessComUsername })
        : challenge.id === "finish-as-black"
          ? await verifyFinishAsBlackAttempt({ gameId, lichessUsername })
          : challenge.id === "win-as-white" && isChessComSubmission
            ? await verifyChessComWinAsWhiteAttempt({ gameUrl: gameId, chessComUsername })
          : challenge.id === "win-as-white"
            ? await verifyWinAsWhiteAttempt({ gameId, lichessUsername })
            : challenge.id === "win-as-black" && isChessComSubmission
              ? await verifyChessComWinAsBlackAttempt({ gameUrl: gameId, chessComUsername })
            : challenge.id === "win-as-black"
              ? await verifyWinAsBlackAttempt({ gameId, lichessUsername })
              : challenge.id === "draw-any-game" && isChessComSubmission
                ? await verifyChessComDrawAnyGameAttempt({ gameUrl: gameId, chessComUsername })
              : challenge.id === "draw-any-game"
                ? await verifyDrawAnyGameAttempt({ gameId, lichessUsername })
                : challenge.id === "draw-as-white" && isChessComSubmission
                  ? await verifyChessComDrawAsWhiteAttempt({ gameUrl: gameId, chessComUsername })
                : challenge.id === "draw-as-white"
                  ? await verifyDrawAsWhiteAttempt({ gameId, lichessUsername })
                  : challenge.id === "draw-as-black" && isChessComSubmission
                    ? await verifyChessComDrawAsBlackAttempt({ gameUrl: gameId, chessComUsername })
                  : challenge.id === "draw-as-black"
                    ? await verifyDrawAsBlackAttempt({ gameId, lichessUsername })
                    : challenge.id === "lose-any-game" && isChessComSubmission
                      ? await verifyChessComLoseAnyGameAttempt({ gameUrl: gameId, chessComUsername })
                    : challenge.id === "lose-any-game"
                      ? await verifyLoseAnyGameAttempt({ gameId, lichessUsername })
                      : challenge.id === "lose-as-white" && isChessComSubmission
                        ? await verifyChessComLoseAsWhiteAttempt({ gameUrl: gameId, chessComUsername })
                      : challenge.id === "lose-as-white"
                        ? await verifyLoseAsWhiteAttempt({ gameId, lichessUsername })
                        : challenge.id === "lose-as-black" && isChessComSubmission
                          ? await verifyChessComLoseAsBlackAttempt({ gameUrl: gameId, chessComUsername })
                        : challenge.id === "lose-as-black"
                          ? await verifyLoseAsBlackAttempt({ gameId, lichessUsername })
                          : {
                              status: "pending" as const,
                              summary: lichessUsername || chessComUsername
                                ? `Submitted ${gameId} for ${lichessUsername || chessComUsername}. Automated verification is not active for this quest yet.`
                                : `Submitted ${gameId}. Add your chess username in account settings for cleaner review context.`,
                            };
  const activatedAfter = existingActiveChallenge?.startedAt ?? now;
  const checkedVerification = verification.status === "passed" && !isAfterActivation(verification.completedGameAt, activatedAfter)
    ? {
        ...verification,
        status: "pending" as const,
        summary: `Submitted ${gameId}, but that game finished before this ${challenge.title} run was activated. Play a new public game after starting the quest, then check again.`,
      }
    : verification;
  const completedChallengeIds =
    checkedVerification.status === "passed" && !progress.completedChallengeIds.includes(challenge.id)
      ? [...progress.completedChallengeIds, challenge.id]
      : progress.completedChallengeIds;

  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      ...metadata,
      activeChallenge: {
        id: challenge.id,
        status: checkedVerification.status === "passed" ? "verified" : checkedVerification.status,
        startedAt: activatedAfter,
        verifiedAt: checkedVerification.status === "passed" ? now : undefined,
      },
      challengeAttempts: compactChallengeAttempts([
        ...existingAttempts,
        {
          id: `${challenge.id}:${now}`,
          challengeId: challenge.id,
          gameId,
          provider: isChessComSubmission ? "chess.com" : "lichess",
          status: checkedVerification.status,
          summary: checkedVerification.summary,
          checkedAt: now,
          ...pickProofReceiptFields(checkedVerification),
        },
      ]),
      challengeProgress: buildProgressRecord(completedChallengeIds),
    },
  });

  revalidatePath("/");
  revalidatePath("/account");
  revalidatePath("/challenges");
  revalidatePath(`/challenges/${challenge.id}`);
}

export async function checkActiveChallenge() {
  const { userId, metadata } = await getUserContext();
  const activeChallenge =
    metadata.activeChallenge && typeof metadata.activeChallenge === "object"
      ? (metadata.activeChallenge as { id?: string; startedAt?: string })
      : null;

  if (!activeChallenge?.id) {
    throw new Error("Start a quest before checking latest games.");
  }

  const challenge = getChallengeById(activeChallenge.id);

  if (!challenge) {
    throw new Error("Unknown active quest.");
  }

  const existingAttempts = Array.isArray(metadata.challengeAttempts)
    ? (metadata.challengeAttempts as ChallengeAttempt[])
    : [];
  const now = new Date().toISOString();
  const lichessUsername = getLichessUsername(metadata);
  const chessComUsername = getChessComUsername(metadata);
  let providerChecks: Awaited<ReturnType<typeof buildLatestGameChecks>> = [];

  if (lichessUsername || chessComUsername) {
    try {
      providerChecks = await buildLatestGameChecks(challenge.id, existingAttempts.length, lichessUsername, chessComUsername, activeChallenge.startedAt ?? now);
    } catch {
      providerChecks = [
        {
          status: "pending",
          gameId: `activation-check-${challenge.id}`,
          provider: "fixture",
          summary: "Quest activated, but the immediate latest-game check could not reach a chess provider. Play normally, then refresh the quest status after your next public game.",
        },
      ];
    }
  }

  const progress = getChallengeProgress(metadata);
  const passedCheck = providerChecks.find((check) => check.status === "passed");
  const latestCheck = providerChecks.at(-1);
  const completedChallengeIds =
    passedCheck && !progress.completedChallengeIds.includes(challenge.id)
      ? [...progress.completedChallengeIds, challenge.id]
      : progress.completedChallengeIds;

  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      ...metadata,
      activeChallenge: {
        id: challenge.id,
        status: passedCheck ? "verified" : (latestCheck?.status ?? "pending"),
        startedAt: activeChallenge.startedAt ?? now,
        verifiedAt: passedCheck ? now : undefined,
      },
      challengeAttempts: compactChallengeAttempts([
        ...existingAttempts,
        ...providerChecks.map((check, index) => ({
          id: `${challenge.id}:${check.provider}:${now}:${index}`,
          challengeId: challenge.id,
          gameId: check.gameId,
          provider: check.provider,
          status: check.status,
          summary: check.summary,
          checkedAt: now,
          ...pickProofReceiptFields(check),
        })),
      ]),
      challengeProgress: {
        completedChallengeIds,
        totalCompletedChallenges: completedChallengeIds.length,
        totalRewardPoints: completedChallengeIds.reduce((sum, id) => {
          const completedChallenge = getChallengeById(id);
          return sum + (completedChallenge?.reward ?? 0);
        }, 0),
      },
    },
  });

  revalidatePath("/");
  revalidatePath("/account");
  revalidatePath("/challenges");
  revalidatePath(`/challenges/${challenge.id}`);
  revalidatePath("/result");
}
