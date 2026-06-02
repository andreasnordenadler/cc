import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getChallengeById } from "@/lib/challenges";
import { checkLatestChallengeForProvider, type LatestChallengeVerdict } from "@/lib/challenge-latest-verifiers";
import { getMobileRequestUserId } from "@/lib/mobile-auth";
import { checkLatestCustomSideQuestForProvider, getCustomSideQuestById, getCustomSideQuests } from "@/lib/custom-side-quests";
import {
  buildChallengeProgressRecord,
  compactChallengeAttempts,
  getChallengeProgress,
  getChessComUsername,
  getLichessUsername,
  type ChallengeAttempt,
  type UserMetadataRecord,
} from "@/lib/user-metadata";

export async function POST(request: Request) {
  const userId = await getMobileRequestUserId(request);

  if (!userId) {
    return NextResponse.json(
      {
        apiVersion: 1,
        authenticated: false,
        ok: false,
        message: "Sign in to manage Solo Side Quests.",
      },
      { status: 401 },
    );
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      {
        apiVersion: 1,
        authenticated: true,
        ok: false,
        message: "Send JSON with action=start, check, deactivate, or reset.",
      },
      { status: 400 },
    );
  }

  const record = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
  const action = typeof record.action === "string" ? record.action : "";
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const metadata = user.publicMetadata ? (user.publicMetadata as UserMetadataRecord) : {};
  const privateMetadata = user.privateMetadata && typeof user.privateMetadata === "object" ? (user.privateMetadata as UserMetadataRecord) : {};
  const privateCustomSideQuests = getCustomSideQuests(privateMetadata);
  const readMetadata = {
    ...metadata,
    customSideQuests: privateCustomSideQuests.length ? privateCustomSideQuests : getCustomSideQuests(metadata),
  };

  try {
    if (action === "start") {
      const challengeId = typeof record.challengeId === "string" ? record.challengeId : "";
      const result = await startMobileChallenge(userId, metadata, readMetadata, challengeId);

      return NextResponse.json({
        apiVersion: 1,
        authenticated: true,
        ok: true,
        action,
        challengeId: result.challengeId,
        message: result.completed ? "Quest completed from latest game." : "Quest started.",
      });
    }

    if (action === "check") {
      const result = await checkMobileActiveChallenge(userId, metadata, readMetadata);

      return NextResponse.json({
        apiVersion: 1,
        authenticated: true,
        ok: true,
        action,
        challengeId: result.challengeId,
        message: result.completed ? "Quest completed." : "Latest-game check done.",
      });
    }

    if (action === "deactivate") {
      const challengeId = typeof record.challengeId === "string" ? record.challengeId : "";
      await deactivateMobileActiveChallenge(userId, metadata, challengeId);

      return NextResponse.json({
        apiVersion: 1,
        authenticated: true,
        ok: true,
        action,
        challengeId,
        message: "Quest deactivated. Pick a fresh quest when ready.",
      });
    }

    if (action === "reset") {
      const challengeId = typeof record.challengeId === "string" ? record.challengeId : "";
      await resetMobileCompletedChallenge(userId, metadata, readMetadata, challengeId);

      return NextResponse.json({
        apiVersion: 1,
        authenticated: true,
        ok: true,
        action,
        challengeId,
        message: "Completed quest reset. You can run it again.",
      });
    }

    if (action === "submit") {
      return NextResponse.json(
        {
          apiVersion: 1,
          authenticated: true,
          ok: false,
          action,
          message: "Manual proof submission is web-only for this beta. Use latest-game checks in the mobile app.",
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        apiVersion: 1,
        authenticated: true,
        ok: false,
        message: "Unsupported mobile quest action.",
      },
      { status: 400 },
    );
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : "Mobile quest action failed.";

    return NextResponse.json(
      {
        apiVersion: 1,
        authenticated: true,
        ok: false,
        action,
        message,
      },
      { status: 400 },
    );
  }
}

type MobileProviderCheck = {
  provider: "lichess" | "chess.com" | "fixture";
  status: "passed" | "failed" | "pending";
  gameId: string;
  summary: string;
  startedGameAt?: string;
  completedGameAt?: string;
  finalPositionFen?: string;
  lastMoveUci?: string;
  lastMoveSan?: string;
  failureDiagnostic?: LatestChallengeVerdict["failureDiagnostic"];
};

function getProviderCheckTimeMs(check: Pick<MobileProviderCheck, "startedGameAt" | "completedGameAt">): number {
  const raw = check.completedGameAt ?? check.startedGameAt;
  if (!raw) return 0;
  const parsed = Date.parse(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

function orderProviderChecksForReceipt(checks: MobileProviderCheck[]): MobileProviderCheck[] {
  return [...checks].sort((a, b) => {
    const statusRank = (check: MobileProviderCheck) => check.status === "passed" ? 2 : check.status === "failed" ? 1 : 0;
    const rankDelta = statusRank(a) - statusRank(b);
    if (rankDelta !== 0) return rankDelta;
    return getProviderCheckTimeMs(a) - getProviderCheckTimeMs(b);
  });
}

function getPassedProviderCheck(checks: MobileProviderCheck[]): MobileProviderCheck | undefined {
  return checks
    .filter((check) => check.status === "passed")
    .sort((a, b) => getProviderCheckTimeMs(b) - getProviderCheckTimeMs(a))[0];
}

async function startMobileChallenge(userId: string, metadata: UserMetadataRecord, readMetadata: UserMetadataRecord, challengeId: string) {
  const challenge = getChallengeById(challengeId);
  const customQuest = challenge ? null : getCustomSideQuestById(readMetadata, challengeId);

  if (!challenge && !customQuest) {
    throw new Error("Unknown quest.");
  }
  if (customQuest && (customQuest.lifecycle ?? "published") !== "published") {
    throw new Error("Publish this custom Side Quest before starting it.");
  }

  const existingAttempts = getExistingAttempts(metadata);
  const now = new Date().toISOString();
  const questId = challenge?.id ?? customQuest!.id;
  const providerChecks = orderProviderChecksForReceipt(await safeBuildLatestGameChecks(questId, readMetadata, now));
  const progress = getChallengeProgress(metadata);
  const passedCheck = getPassedProviderCheck(providerChecks);
  const latestCheck = providerChecks.at(-1);
  const completedChallengeIds = passedCheck && !progress.completedChallengeIds.includes(questId)
    ? [...progress.completedChallengeIds, questId]
    : progress.completedChallengeIds;

  await updateUserPublicMetadata(userId, metadata, {
    activeChallenge: {
      id: questId,
      status: passedCheck ? "verified" : (latestCheck?.status ?? "accepted"),
      startedAt: now,
      verifiedAt: passedCheck ? now : undefined,
    },
    challengeAttempts: compactChallengeAttempts([
      ...existingAttempts,
      ...providerChecks.map((check, index) => buildAttempt(questId, check, `${questId}:${check.provider}:activation:${now}:${index}`, now)),
    ]),
    challengeProgress: buildChallengeProgressRecord(completedChallengeIds),
  });

  return { challengeId: questId, completed: Boolean(passedCheck) };
}

async function checkMobileActiveChallenge(userId: string, metadata: UserMetadataRecord, readMetadata: UserMetadataRecord) {
  const activeChallenge = metadata.activeChallenge && typeof metadata.activeChallenge === "object"
    ? (metadata.activeChallenge as { id?: string; startedAt?: string })
    : null;

  if (!activeChallenge?.id) {
    throw new Error("Start a quest before checking latest games.");
  }

  const challenge = getChallengeById(activeChallenge.id);
  const customQuest = challenge ? null : getCustomSideQuestById(readMetadata, activeChallenge.id);

  if (!challenge && !customQuest) {
    throw new Error("Unknown active quest.");
  }
  if (customQuest && (customQuest.lifecycle ?? "published") !== "published") {
    throw new Error("Publish this custom Side Quest before checking it.");
  }
  const questId = challenge?.id ?? customQuest!.id;

  const existingAttempts = getExistingAttempts(metadata);
  const now = new Date().toISOString();
  const providerChecks = orderProviderChecksForReceipt(await safeBuildLatestGameChecks(questId, readMetadata, activeChallenge.startedAt ?? now));
  const passedCheck = getPassedProviderCheck(providerChecks);
  const latestCheck = providerChecks.at(-1);
  const progress = getChallengeProgress(metadata);
  const completedChallengeIds = passedCheck && !progress.completedChallengeIds.includes(questId)
    ? [...progress.completedChallengeIds, questId]
    : progress.completedChallengeIds;

  await updateUserPublicMetadata(userId, metadata, {
    activeChallenge: {
      id: questId,
      status: passedCheck ? "verified" : (latestCheck?.status ?? "pending"),
      startedAt: activeChallenge.startedAt ?? now,
      verifiedAt: passedCheck ? now : undefined,
    },
    challengeAttempts: compactChallengeAttempts([
      ...existingAttempts,
      ...providerChecks.map((check, index) => buildAttempt(questId, check, `${questId}:${check.provider}:${now}:${index}`, now)),
    ]),
    challengeProgress: buildChallengeProgressRecord(completedChallengeIds),
  });

  return { challengeId: questId, completed: Boolean(passedCheck) };
}

async function deactivateMobileActiveChallenge(userId: string, metadata: UserMetadataRecord, challengeId: string) {
  const activeChallenge = metadata.activeChallenge && typeof metadata.activeChallenge === "object"
    ? (metadata.activeChallenge as { id?: string })
    : null;

  if (!activeChallenge?.id || activeChallenge.id !== challengeId) {
    throw new Error("That quest is not currently active.");
  }

  await updateUserPublicMetadata(userId, metadata, { activeChallenge: null });
}

async function resetMobileCompletedChallenge(userId: string, metadata: UserMetadataRecord, readMetadata: UserMetadataRecord, challengeId: string) {
  const challenge = getChallengeById(challengeId);
  const customQuest = challenge ? null : getCustomSideQuestById(readMetadata, challengeId);

  if (!challenge && !customQuest) {
    throw new Error("Unknown quest.");
  }

  const questId = challenge?.id ?? customQuest!.id;
  const progress = getChallengeProgress(metadata);
  const existingAttempts = getExistingAttempts(metadata);
  const remainingAttempts = existingAttempts.filter((attempt) => getAttemptChallengeId(attempt) !== questId);
  const completedChallengeIds = progress.completedChallengeIds.filter((id) => id !== questId);
  const activeChallenge = metadata.activeChallenge && typeof metadata.activeChallenge === "object"
    ? (metadata.activeChallenge as { id?: string })
    : null;

  await updateUserPublicMetadata(userId, metadata, {
    activeChallenge: activeChallenge?.id === questId ? null : metadata.activeChallenge,
    challengeAttempts: compactChallengeAttempts(remainingAttempts),
    challengeProgress: buildChallengeProgressRecord(completedChallengeIds),
  });
}

async function safeBuildLatestGameChecks(challengeId: string, metadata: UserMetadataRecord, activatedAfter: string): Promise<MobileProviderCheck[]> {
  const lichessUsername = getLichessUsername(metadata);
  const chessComUsername = getChessComUsername(metadata);
  const checks: MobileProviderCheck[] = [];

  if (lichessUsername) {
    checks.push({ ...(await buildLatestGameCheck(challengeId, "lichess", lichessUsername, activatedAfter, metadata)), provider: "lichess" });
  }

  if (chessComUsername) {
    checks.push({ ...(await buildLatestGameCheck(challengeId, "chesscom", chessComUsername, activatedAfter, metadata)), provider: "chess.com" });
  }

  if (checks.length) return checks;

  return [
    {
      provider: "fixture",
      status: "pending",
      gameId: `${challengeId}-awaiting-username`,
      summary: "Add a Lichess or Chess.com username, then play a fresh public game after starting this Side Quest.",
    },
  ];
}

async function buildLatestGameCheck(challengeId: string, provider: "lichess" | "chesscom", username: string, activatedAfter: string, metadata?: UserMetadataRecord): Promise<Omit<MobileProviderCheck, "provider">> {
  try {
    const customQuest = metadata ? getCustomSideQuestById(metadata, challengeId) : null;
    const verdict = customQuest
      ? await checkLatestCustomSideQuestForProvider({ quest: customQuest, provider, username })
      : await checkLatestChallengeForProvider({ challengeId, provider, username });
    return buildLatestGameCheckPayload(verdict, getChallengeById(challengeId)?.title ?? challengeId, activatedAfter);
  } catch {
    return {
      status: "pending",
      gameId: `${provider}-latest-unavailable`,
      summary: "Quest is active, but the immediate latest-game check could not reach this chess provider. Play normally, then refresh after your next public game.",
    };
  }
}

function buildLatestGameCheckPayload(verdict: LatestChallengeVerdict, challengeTitle: string, activatedAfter: string): Omit<MobileProviderCheck, "provider"> {
  const gameTime = verdict.startedGameAt ?? verdict.completedGameAt;

  if (verdict.status !== "pending" && !isAfterActivation(gameTime, activatedAfter)) {
    return {
      status: "pending",
      gameId: `${challengeTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-new-game-required`,
      summary: `No new eligible games were found since this ${challengeTitle} run was started. Play a fresh public game after starting the quest, then check again.`,
      startedGameAt: verdict.startedGameAt,
      completedGameAt: verdict.completedGameAt,
    };
  }

  return {
    status: verdict.status,
    gameId: verdict.gameId,
    summary: `${verdict.summary} ${verdict.evidence?.join(" ") ?? ""}`.trim(),
    startedGameAt: verdict.startedGameAt,
    completedGameAt: verdict.completedGameAt,
    finalPositionFen: verdict.finalPositionFen,
    lastMoveUci: verdict.lastMoveUci,
    lastMoveSan: verdict.lastMoveSan,
    failureDiagnostic: verdict.failureDiagnostic,
  };
}

function buildAttempt(challengeId: string, check: MobileProviderCheck, id: string, checkedAt: string): ChallengeAttempt {
  return {
    id,
    challengeId,
    gameId: check.gameId,
    provider: check.provider,
    status: check.status,
    summary: check.summary,
    checkedAt,
    startedGameAt: check.startedGameAt,
    completedGameAt: check.completedGameAt,
    finalPositionFen: check.finalPositionFen,
    lastMoveUci: check.lastMoveUci,
    lastMoveSan: check.lastMoveSan,
    failureDiagnostic: check.failureDiagnostic,
  };
}

async function updateUserPublicMetadata(userId: string, metadata: UserMetadataRecord, patch: UserMetadataRecord) {
  const client = await clerkClient();
  const safeMetadata = { ...metadata };
  delete safeMetadata.customSideQuests;
  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      ...safeMetadata,
      customSideQuests: null,
      ...patch,
    },
  });
}

function getExistingAttempts(metadata: UserMetadataRecord): ChallengeAttempt[] {
  return Array.isArray(metadata.challengeAttempts) ? (metadata.challengeAttempts as ChallengeAttempt[]) : [];
}

function getAttemptChallengeId(attempt: ChallengeAttempt) {
  return typeof attempt.challengeId === "string"
    ? attempt.challengeId
    : typeof attempt.id === "string"
      ? attempt.id.split(":")[0]
      : undefined;
}

function isAfterActivation(gameTime?: string, activatedAfter?: string) {
  if (!gameTime || !activatedAfter) return false;

  const gameTimestamp = Date.parse(gameTime);
  const activatedAt = Date.parse(activatedAfter);

  return Number.isFinite(gameTimestamp) && Number.isFinite(activatedAt) && gameTimestamp > activatedAt;
}
