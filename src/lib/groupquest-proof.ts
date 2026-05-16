import { getChallengeById } from "@/lib/challenges";
import { checkLatestChallengeForProvider } from "@/lib/challenge-latest-verifiers";

export type GroupQuestCheckResult = {
  status: "passed" | "failed" | "pending";
  gameId: string;
  summary: string;
  gameTime?: string;
};

function resolveVerdictTime(verdict: { completedGameAt?: string; startedGameAt?: string }) {
  return verdict.completedGameAt ?? verdict.startedGameAt;
}

function buildWindowedResult(
  challengeId: string,
  verdict: { status: "passed" | "failed" | "pending"; gameId: string; summary: string; evidence?: string[]; completedGameAt?: string; startedGameAt?: string },
  startAt?: string,
  endAt?: string,
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

  return {
    status: verdict.status,
    gameId: verdict.gameId,
    summary: `${verdict.summary} ${verdict.evidence?.join(" ") ?? ""}`.trim(),
    gameTime,
  };
}

export async function checkLatestGroupQuestChallenge(input: {
  challengeId: string;
  provider: "lichess" | "chesscom";
  username: string;
  startAt?: string;
  endAt?: string;
}): Promise<GroupQuestCheckResult> {
  const { challengeId, provider, username, startAt, endAt } = input;

  if (!username) {
    return {
      status: "pending",
      gameId: `${challengeId}-awaiting-username`,
      summary: "Add a public chess username before running Multiplayer Side Quest proof checks.",
    };
  }

  return buildWindowedResult(
    challengeId,
    await checkLatestChallengeForProvider({ challengeId, provider, username }),
    startAt,
    endAt,
  );
}
