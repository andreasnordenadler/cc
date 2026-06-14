import { getChallengeById } from "@/lib/challenges";
import { checkLatestChallengeForProvider, type LatestChallengeOutcome } from "@/lib/challenge-latest-verifiers";
import { checkLatestCustomSideQuestForProvider, type CustomSideQuest } from "@/lib/custom-side-quests";

export type GroupQuestCheckResult = {
  status: "passed" | "failed" | "pending";
  gameId: string;
  summary: string;
  gameTime?: string;
  finalPositionFen?: string;
  lastMoveUci?: string;
  lastMoveSan?: string;
  outcome?: LatestChallengeOutcome;
};

function resolveVerdictTime(verdict: { completedGameAt?: string; startedGameAt?: string }) {
  return verdict.completedGameAt ?? verdict.startedGameAt;
}

function buildWindowedResult(
  challengeId: string,
  verdict: {
    status: "passed" | "failed" | "pending";
    gameId: string;
    summary: string;
    evidence?: string[];
    completedGameAt?: string;
    startedGameAt?: string;
    finalPositionFen?: string;
    lastMoveUci?: string;
    lastMoveSan?: string;
    outcome?: LatestChallengeOutcome;
  },
  startAt?: string,
  endAt?: string,
  rules?: Record<string, string>,
): GroupQuestCheckResult {
  const title = getChallengeById(challengeId)?.title ?? challengeId;
  const gameTime = resolveVerdictTime(verdict);
  const startTs = startAt ? Date.parse(startAt) : NaN;
  const endTs = endAt ? Date.parse(endAt) : NaN;
  const gameTs = gameTime ? Date.parse(gameTime) : NaN;

  if (verdict.status !== "pending" && Number.isFinite(startTs)) {
    if (!Number.isFinite(gameTs) || gameTs <= startTs) {
      return {
        status: "pending",
        gameId: `${challengeId}-before-window`,
        summary: `No new eligible games were found since this ${title} Multiplayer Side Quest started. Play a fresh public game after the start time, then refresh checks again.`,
      };
    }
  }

  if (verdict.status !== "pending" && Number.isFinite(endTs) && Number.isFinite(gameTs) && gameTs > endTs) {
    return {
      status: "pending",
      gameId: `${challengeId}-after-window`,
      summary: `A newer public game was found, but it landed after this ${title} Multiplayer Side Quest closed. Use a game inside the multiplayer window.`,
    };
  }

  const requiresWin = (rules?.result ?? "Any result").toLowerCase() === "win required";
  if (requiresWin && verdict.status === "passed") {
    if (verdict.outcome !== "win") {
      return {
        status: "failed",
        gameId: verdict.gameId,
        summary: `${title} matched the Side Quest condition, but this Community Multiplayer Side Quest also requires the player to win the game. Latest result was ${verdict.outcome ?? "unknown"}.`,
        gameTime,
        finalPositionFen: verdict.finalPositionFen,
        lastMoveUci: verdict.lastMoveUci,
        lastMoveSan: verdict.lastMoveSan,
        outcome: verdict.outcome,
      };
    }
  }

  return {
    status: verdict.status,
    gameId: verdict.gameId,
    summary: `${verdict.summary} ${verdict.evidence?.join(" ") ?? ""}`.trim(),
    gameTime,
    finalPositionFen: verdict.finalPositionFen,
    lastMoveUci: verdict.lastMoveUci,
    lastMoveSan: verdict.lastMoveSan,
    outcome: verdict.outcome,
  };
}

function buildCustomQuestForVerifier(snapshot: NonNullable<CheckLatestGroupQuestChallengeInput["customQuest"]>): CustomSideQuest {
  return {
    id: snapshot.id,
    title: snapshot.title,
    summary: snapshot.summary,
    config: snapshot.config,
    createdAt: new Date(0).toISOString(),
    updatedAt: new Date(0).toISOString(),
    badgeImageUrl: snapshot.badgeImageUrl ?? null,
  };
}

export type CheckLatestGroupQuestChallengeInput = {
  challengeId: string;
  provider: "lichess" | "chesscom";
  username: string;
  startAt?: string;
  endAt?: string;
  customQuest?: {
    id: string;
    title: string;
    summary: string;
    config: string;
    badgeImageUrl?: string | null;
  } | null;
  rules?: Record<string, string>;
};

export async function checkLatestGroupQuestChallenge(input: CheckLatestGroupQuestChallengeInput): Promise<GroupQuestCheckResult> {
  const { challengeId, provider, username, startAt, endAt, customQuest, rules } = input;

  if (!username) {
    return {
      status: "pending",
      gameId: `${challengeId}-awaiting-username`,
      summary: "Add a public chess username before running Multiplayer Side Quest proof checks.",
    };
  }

  return buildWindowedResult(
    challengeId,
    customQuest
      ? await checkLatestCustomSideQuestForProvider({ quest: buildCustomQuestForVerifier(customQuest), provider, username })
      : await checkLatestChallengeForProvider({ challengeId, provider, username }),
    startAt,
    endAt,
    rules,
  );
}
