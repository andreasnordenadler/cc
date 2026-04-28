"use server";

import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getChallengeById } from "@/lib/challenges";
import {
  verifyChessComDrawAnyGameAttempt,
  verifyChessComDrawAsBlackAttempt,
  verifyChessComDrawAsWhiteAttempt,
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

async function buildLatestGameCheck(challengeId: string, attemptCount: number, lichessUsername: string) {
  if (challengeId === "knights-before-coffee") {
    if (lichessUsername) {
      const verdict = await checkLatestLichessKnightsBeforeCoffee(lichessUsername);

      return {
        status: verdict.status,
        gameId: verdict.gameId,
        summary: `${verdict.summary} ${verdict.evidence.join(" ")}`,
      };
    }

    const fixture = knightsBeforeCoffeeFixtures[attemptCount % knightsBeforeCoffeeFixtures.length];
    const verdict = evaluateKnightsBeforeCoffee(fixture);

    return {
      status: verdict.status,
      gameId: verdict.gameId,
      summary: `${verdict.summary} ${verdict.evidence.join(" ")}`,
    };
  }

  if (challengeId === "queen-never-heard-of-her") {
    if (lichessUsername) {
      const verdict = await checkLatestLichessQueenNeverHeardOfHer(lichessUsername);

      return {
        status: verdict.status,
        gameId: verdict.gameId,
        summary: `${verdict.summary} ${verdict.evidence.join(" ")}`,
      };
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

      return {
        status: verdict.status,
        gameId: verdict.gameId,
        summary: `${verdict.summary} ${verdict.evidence.join(" ")}`,
      };
    }

    const fixture = noCastleClubFixtures[attemptCount % noCastleClubFixtures.length];
    const verdict = evaluateNoCastleClub(fixture);

    return {
      status: verdict.status,
      gameId: verdict.gameId,
      summary: `${verdict.summary} ${verdict.evidence.join(" ")}`,
    };
  }

  if (challengeId === "pawn-storm-maniac") {
    if (lichessUsername) {
      const verdict = await checkLatestLichessPawnStormManiac(lichessUsername);

      return {
        status: verdict.status,
        gameId: verdict.gameId,
        summary: `${verdict.summary} ${verdict.evidence.join(" ")}`,
      };
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

      return {
        status: verdict.status,
        gameId: verdict.gameId,
        summary: `${verdict.summary} ${verdict.evidence.join(" ")}`,
      };
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

      return {
        status: verdict.status,
        gameId: verdict.gameId,
        summary: `${verdict.summary} ${verdict.evidence.join(" ")}`,
      };
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

      return {
        status: verdict.status,
        gameId: verdict.gameId,
        summary: `${verdict.summary} ${verdict.evidence.join(" ")}`,
      };
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

      return {
        status: verdict.status,
        gameId: verdict.gameId,
        summary: `${verdict.summary} ${verdict.evidence.join(" ")}`,
      };
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
      summary: `Queued latest-game verification for ${challenge?.title ?? challengeId}. This challenge needs its exact rule detector before auto-awarding points.`,
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
    throw new Error("Unknown challenge.");
  }

  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      ...metadata,
      activeChallenge: {
        id: challenge.id,
        status: "accepted",
        startedAt: new Date().toISOString(),
      },
    },
  });

  revalidatePath("/");
  revalidatePath("/challenges");
  revalidatePath(`/challenges/${challenge.id}`);
}

export async function submitChallengeAttempt(formData: FormData) {
  const { userId, metadata } = await getUserContext();
  const challengeId = String(formData.get("challengeId") ?? "");
  const rawGameId = String(formData.get("gameId") ?? "").trim();
  const challenge = getChallengeById(challengeId);

  if (!challenge) {
    throw new Error("Unknown challenge.");
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
                                ? `Submitted ${gameId} for ${lichessUsername || chessComUsername}. Automated verification is not active for this challenge yet.`
                                : `Submitted ${gameId}. Add your chess username in account settings for cleaner review context.`,
                            };
  const completedChallengeIds =
    verification.status === "passed" && !progress.completedChallengeIds.includes(challenge.id)
      ? [...progress.completedChallengeIds, challenge.id]
      : progress.completedChallengeIds;

  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      ...metadata,
      activeChallenge: {
        id: challenge.id,
        status: verification.status === "passed" ? "verified" : verification.status,
        startedAt: existingActiveChallenge?.startedAt ?? now,
        verifiedAt: verification.status === "passed" ? now : undefined,
      },
      challengeAttempts: [
        ...existingAttempts,
        {
          id: `${challenge.id}:${now}`,
          challengeId: challenge.id,
          gameId,
          status: verification.status,
          summary: verification.summary,
          checkedAt: now,
        },
      ],
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
}

export async function checkActiveChallenge() {
  const { userId, metadata } = await getUserContext();
  const activeChallenge =
    metadata.activeChallenge && typeof metadata.activeChallenge === "object"
      ? (metadata.activeChallenge as { id?: string; startedAt?: string })
      : null;

  if (!activeChallenge?.id) {
    throw new Error("Start a challenge before checking latest games.");
  }

  const challenge = getChallengeById(activeChallenge.id);

  if (!challenge) {
    throw new Error("Unknown active challenge.");
  }

  const existingAttempts = Array.isArray(metadata.challengeAttempts)
    ? (metadata.challengeAttempts as ChallengeAttempt[])
    : [];
  const now = new Date().toISOString();
  const lichessUsername = getLichessUsername(metadata);
  const check = await buildLatestGameCheck(challenge.id, existingAttempts.length, lichessUsername);
  const progress = getChallengeProgress(metadata);
  const completedChallengeIds =
    check.status === "passed" && !progress.completedChallengeIds.includes(challenge.id)
      ? [...progress.completedChallengeIds, challenge.id]
      : progress.completedChallengeIds;

  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      ...metadata,
      activeChallenge: {
        id: challenge.id,
        status: check.status === "passed" ? "verified" : check.status,
        startedAt: activeChallenge.startedAt ?? now,
        verifiedAt: check.status === "passed" ? now : undefined,
      },
      challengeAttempts: [
        ...existingAttempts,
        {
          id: `${challenge.id}:${now}`,
          challengeId: challenge.id,
          gameId: check.gameId,
          status: check.status,
          summary: check.summary,
          checkedAt: now,
        },
      ],
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
