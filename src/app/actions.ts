"use server";

import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getChallengeById } from "@/lib/challenges";
import {
  verifyDrawAnyGameAttempt,
  verifyFinishAnyGameAttempt,
  verifyFinishAsBlackAttempt,
  verifyFinishAsWhiteAttempt,
  verifyWinAsBlackAttempt,
  verifyWinAsWhiteAttempt,
} from "@/lib/lichess";
import {
  getChallengeProgress,
  getLichessUsername,
  type ChallengeAttempt,
  type UserMetadataRecord,
} from "@/lib/user-metadata";

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

export async function saveLichessUsername(formData: FormData) {
  const { userId, metadata } = await getUserContext();
  const username = String(formData.get("lichessUsername") ?? "").trim();

  if (!username) {
    throw new Error("Enter a Lichess username.");
  }

  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      ...metadata,
      lichessUsername: username,
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
    throw new Error("Enter a finished Lichess game ID.");
  }

  const lichessUsername = getLichessUsername(metadata);
  const existingAttempts = Array.isArray(metadata.challengeAttempts)
    ? (metadata.challengeAttempts as ChallengeAttempt[])
    : [];
  const gameId = rawGameId.replace(/^https?:\/\/lichess\.org\//, "").replace(/\/.*/, "");
  const now = new Date().toISOString();

  const progress = getChallengeProgress(metadata);
  const existingActiveChallenge =
    metadata.activeChallenge && typeof metadata.activeChallenge === "object"
      ? (metadata.activeChallenge as { startedAt?: string })
      : null;
  const verification =
    challenge.id === "finish-any-game"
      ? await verifyFinishAnyGameAttempt({ gameId, lichessUsername })
      : challenge.id === "finish-as-white"
        ? await verifyFinishAsWhiteAttempt({ gameId, lichessUsername })
        : challenge.id === "finish-as-black"
          ? await verifyFinishAsBlackAttempt({ gameId, lichessUsername })
          : challenge.id === "win-as-white"
            ? await verifyWinAsWhiteAttempt({ gameId, lichessUsername })
            : challenge.id === "win-as-black"
              ? await verifyWinAsBlackAttempt({ gameId, lichessUsername })
              : challenge.id === "draw-any-game"
                ? await verifyDrawAnyGameAttempt({ gameId, lichessUsername })
                : {
                  status: "pending" as const,
                  summary: lichessUsername
                    ? `Submitted ${gameId} for ${lichessUsername}. Automated verification is not active for this challenge yet.`
                    : `Submitted ${gameId}. Add your Lichess username in account settings for cleaner review context.`,
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
