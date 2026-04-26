"use server";

import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
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
};

async function buildLatestGameCheck(challengeId: string, attemptCount: number, lichessUsername: string) {
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
