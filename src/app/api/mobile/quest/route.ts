import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getChallengeById } from "@/lib/challenges";
import { checkLatestChallengeForProvider, type LatestChallengeVerdict } from "@/lib/challenge-latest-verifiers";
import { getMobileRequestUserId } from "@/lib/mobile-auth";
import { assertActiveSoloSubmissionTarget } from "@/lib/official-solo-exact-game";
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
import { checkLatestCustomSideQuestForProvider, checkSubmittedCustomSideQuestForProvider, getCustomSideQuestById, getCustomSideQuests } from "@/lib/custom-side-quests";
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
  let readMetadata: UserMetadataRecord = {
    ...metadata,
    customSideQuests: privateCustomSideQuests.length ? privateCustomSideQuests : getCustomSideQuests(metadata),
  };

  try {
    if (action === "start") {
      const challengeId = typeof record.challengeId === "string" ? record.challengeId : "";
      readMetadata = await withPublicCustomSideQuest(client, readMetadata, challengeId);
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
      const activeChallenge = metadata.activeChallenge && typeof metadata.activeChallenge === "object" ? (metadata.activeChallenge as { id?: string }) : null;
      readMetadata = await withPublicCustomSideQuest(client, readMetadata, activeChallenge?.id ?? "");
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
      readMetadata = await withPublicCustomSideQuest(client, readMetadata, challengeId);
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
      const challengeId = typeof record.challengeId === "string" ? record.challengeId : "";
      const gameId = typeof record.gameId === "string" ? record.gameId : "";
      readMetadata = await withPublicCustomSideQuest(client, readMetadata, challengeId);
      const result = await submitMobileChallengeAttempt(userId, metadata, readMetadata, challengeId, gameId);

      return NextResponse.json({
        apiVersion: 1,
        authenticated: true,
        ok: true,
        action,
        challengeId: result.challengeId,
        message: result.completed ? "Quest completed from submitted game." : "Submitted game checked.",
      });
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
  playerColor?: "white" | "black";
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

async function withPublicCustomSideQuest(
  client: Awaited<ReturnType<typeof clerkClient>>,
  readMetadata: UserMetadataRecord,
  challengeId: string,
): Promise<UserMetadataRecord> {
  if (!challengeId || getChallengeById(challengeId) || getCustomSideQuestById(readMetadata, challengeId)) return readMetadata;

  try {
    const users = await client.users.getUserList({ limit: 100, orderBy: "-created_at" });
    for (const user of users.data) {
      const privateMetadata = user.privateMetadata && typeof user.privateMetadata === "object" ? (user.privateMetadata as UserMetadataRecord) : {};
      const publicMetadata = user.publicMetadata && typeof user.publicMetadata === "object" ? (user.publicMetadata as UserMetadataRecord) : {};
      const customQuest = [...getCustomSideQuests(privateMetadata), ...getCustomSideQuests(publicMetadata)]
        .find((quest) => quest.id === challengeId && quest.visibility === "public" && quest.lifecycle === "published");
      if (customQuest) {
        return {
          ...readMetadata,
          customSideQuests: [customQuest, ...getCustomSideQuests(readMetadata)].filter((quest, index, all) => all.findIndex((entry) => entry.id === quest.id) === index),
        };
      }
    }
  } catch (error) {
    console.warn("mobile public custom Side Quest lookup unavailable", { reason: error instanceof Error ? error.message : "unknown" });
  }

  return readMetadata;
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

async function submitMobileChallengeAttempt(userId: string, metadata: UserMetadataRecord, readMetadata: UserMetadataRecord, challengeId: string, rawGameId: string) {
  const challenge = getChallengeById(challengeId);
  const customQuest = challenge ? null : getCustomSideQuestById(readMetadata, challengeId);

  if (!challenge && !customQuest) {
    throw new Error("Unknown quest.");
  }
  if (customQuest && (customQuest.lifecycle ?? "published") !== "published") {
    throw new Error("Publish this custom Side Quest before submitting proof.");
  }
  if (!rawGameId.trim()) {
    throw new Error("Paste a Lichess game ID or Chess.com game URL first.");
  }
  const questId = challenge?.id ?? customQuest!.id;
  const now = new Date().toISOString();
  const existingAttempts = getExistingAttempts(metadata);
  const activeChallenge = metadata.activeChallenge && typeof metadata.activeChallenge === "object"
    ? (metadata.activeChallenge as { id?: string; startedAt?: string })
    : null;
  assertActiveSoloSubmissionTarget(activeChallenge, questId);
  const activatedAfter = activeChallenge?.id === questId ? activeChallenge.startedAt ?? now : now;
  const submittedGame = normalizeSubmittedGameReference(rawGameId);
  const verdict = await verifySubmittedChallengeAttempt(questId, submittedGame, readMetadata);
  const checkedVerification = buildLatestGameCheckPayload(verdict, challenge?.title ?? customQuest!.title, activatedAfter);
  const progress = getChallengeProgress(metadata);
  const completed = checkedVerification.status === "passed";
  const completedChallengeIds = completed && !progress.completedChallengeIds.includes(questId)
    ? [...progress.completedChallengeIds, questId]
    : progress.completedChallengeIds;

  await updateUserPublicMetadata(userId, metadata, {
    activeChallenge: {
      id: questId,
      status: completed ? "verified" : checkedVerification.status,
      startedAt: activatedAfter,
      verifiedAt: completed ? now : undefined,
    },
    challengeAttempts: compactChallengeAttempts([
      ...existingAttempts,
      buildAttempt(questId, { ...checkedVerification, provider: submittedGame.provider }, `${questId}:${submittedGame.provider}:submitted:${now}`, now),
    ]),
    challengeProgress: buildChallengeProgressRecord(completedChallengeIds),
  });

  return { challengeId: questId, completed };
}

function normalizeSubmittedGameReference(rawGameId: string): { provider: "lichess" | "chess.com"; gameId: string } {
  const trimmed = rawGameId.trim();
  const chessComMatch = trimmed.match(/^https?:\/\/(www\.)?chess\.com\/game\//i);

  if (chessComMatch) {
    return { provider: "chess.com", gameId: trimmed };
  }

  const lichessGameId = trimmed
    .replace(/^https?:\/\/lichess\.org\//i, "")
    .replace(/[#?].*$/, "")
    .replace(/\/.*$/, "")
    .trim();

  return { provider: "lichess", gameId: lichessGameId };
}

export async function verifySubmittedChallengeAttempt(challengeId: string, submittedGame: { provider: "lichess" | "chess.com"; gameId: string }, metadata: UserMetadataRecord): Promise<LatestChallengeVerdict> {
  const customQuest = getCustomSideQuestById(metadata, challengeId);
  if (customQuest) {
    if ((customQuest.lifecycle ?? "published") !== "published") {
      return { status: "pending", gameId: submittedGame.gameId, summary: "Publish this custom Side Quest before submitting proof." };
    }
    const username = submittedGame.provider === "lichess" ? getLichessUsername(metadata) : getChessComUsername(metadata);
    if (!username) {
      return {
        status: "pending",
        gameId: submittedGame.gameId,
        summary: `Add your ${submittedGame.provider === "lichess" ? "Lichess" : "Chess.com"} username before submitting proof.`,
      };
    }
    return checkSubmittedCustomSideQuestForProvider({
      quest: customQuest,
      provider: submittedGame.provider === "lichess" ? "lichess" : "chesscom",
      username,
      gameId: submittedGame.gameId,
    });
  }

  if (submittedGame.provider === "chess.com") {
    const chessComUsername = getChessComUsername(metadata);
    if (!chessComUsername) {
      return {
        status: "pending",
        gameId: submittedGame.gameId,
        summary: "Add your Chess.com username before submitting Chess.com proof.",
      };
    }

    return verifySubmittedChessComAttempt(challengeId, submittedGame.gameId, chessComUsername);
  }

  const lichessUsername = getLichessUsername(metadata);
  if (!lichessUsername) {
    return {
      status: "pending",
      gameId: submittedGame.gameId,
      summary: "Add your Lichess username before submitting Lichess proof.",
    };
  }

  return verifySubmittedLichessAttempt(challengeId, submittedGame.gameId, lichessUsername);
}

type SubmittedVerificationVerdict = Omit<LatestChallengeVerdict, "gameId"> & { gameId?: string };

function withSubmittedGameId(verdict: SubmittedVerificationVerdict, gameId: string): LatestChallengeVerdict {
  return { ...verdict, gameId: verdict.gameId ?? gameId };
}

async function verifySubmittedLichessAttempt(challengeId: string, gameId: string, lichessUsername: string): Promise<LatestChallengeVerdict> {
  switch (challengeId) {
    case "finish-any-game": return withSubmittedGameId(await verifyFinishAnyGameAttempt({ gameId, lichessUsername }), gameId);
    case "finish-as-white": return withSubmittedGameId(await verifyFinishAsWhiteAttempt({ gameId, lichessUsername }), gameId);
    case "finish-as-black": return withSubmittedGameId(await verifyFinishAsBlackAttempt({ gameId, lichessUsername }), gameId);
    case "win-as-white": return withSubmittedGameId(await verifyWinAsWhiteAttempt({ gameId, lichessUsername }), gameId);
    case "win-as-black": return withSubmittedGameId(await verifyWinAsBlackAttempt({ gameId, lichessUsername }), gameId);
    case "draw-any-game": return withSubmittedGameId(await verifyDrawAnyGameAttempt({ gameId, lichessUsername }), gameId);
    case "draw-as-white": return withSubmittedGameId(await verifyDrawAsWhiteAttempt({ gameId, lichessUsername }), gameId);
    case "draw-as-black": return withSubmittedGameId(await verifyDrawAsBlackAttempt({ gameId, lichessUsername }), gameId);
    case "lose-any-game": return withSubmittedGameId(await verifyLoseAnyGameAttempt({ gameId, lichessUsername }), gameId);
    case "lose-as-white": return withSubmittedGameId(await verifyLoseAsWhiteAttempt({ gameId, lichessUsername }), gameId);
    case "lose-as-black": return withSubmittedGameId(await verifyLoseAsBlackAttempt({ gameId, lichessUsername }), gameId);
    default:
      return {
        status: "pending",
        gameId,
        summary: `Submitted ${gameId} for ${lichessUsername}. Automated specific-game verification is not active for this Side Quest yet.`,
      };
  }
}

async function verifySubmittedChessComAttempt(challengeId: string, gameUrl: string, chessComUsername: string): Promise<LatestChallengeVerdict> {
  switch (challengeId) {
    case "finish-any-game": return withSubmittedGameId(await verifyChessComFinishAnyGameAttempt({ gameUrl, chessComUsername }), gameUrl);
    case "finish-as-white": return withSubmittedGameId(await verifyChessComFinishAsWhiteAttempt({ gameUrl, chessComUsername }), gameUrl);
    case "finish-as-black": return withSubmittedGameId(await verifyChessComFinishAsBlackAttempt({ gameUrl, chessComUsername }), gameUrl);
    case "win-as-white": return withSubmittedGameId(await verifyChessComWinAsWhiteAttempt({ gameUrl, chessComUsername }), gameUrl);
    case "win-as-black": return withSubmittedGameId(await verifyChessComWinAsBlackAttempt({ gameUrl, chessComUsername }), gameUrl);
    case "draw-any-game": return withSubmittedGameId(await verifyChessComDrawAnyGameAttempt({ gameUrl, chessComUsername }), gameUrl);
    case "draw-as-white": return withSubmittedGameId(await verifyChessComDrawAsWhiteAttempt({ gameUrl, chessComUsername }), gameUrl);
    case "draw-as-black": return withSubmittedGameId(await verifyChessComDrawAsBlackAttempt({ gameUrl, chessComUsername }), gameUrl);
    case "lose-any-game": return withSubmittedGameId(await verifyChessComLoseAnyGameAttempt({ gameUrl, chessComUsername }), gameUrl);
    case "lose-as-white": return withSubmittedGameId(await verifyChessComLoseAsWhiteAttempt({ gameUrl, chessComUsername }), gameUrl);
    case "lose-as-black": return withSubmittedGameId(await verifyChessComLoseAsBlackAttempt({ gameUrl, chessComUsername }), gameUrl);
    default:
      return {
        status: "pending",
        gameId: gameUrl,
        summary: `Submitted ${gameUrl} for ${chessComUsername}. Automated specific-game verification is not active for this Side Quest yet.`,
      };
  }
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
    playerColor: verdict.playerColor ?? verdict.failureDiagnostic?.playerColor,
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
    playerColor: check.playerColor ?? check.failureDiagnostic?.playerColor,
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
