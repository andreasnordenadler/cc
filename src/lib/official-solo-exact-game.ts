type ActiveSoloSubmissionTarget = {
  id?: string;
  startedAt?: string;
} | null | undefined;

export function assertActiveSoloSubmissionTarget(activeChallenge: ActiveSoloSubmissionTarget, challengeId: string) {
  if (!activeChallenge?.id || activeChallenge.id !== challengeId) {
    throw new Error("Start this Side Quest before submitting a specific game.");
  }

  if (!activeChallenge.startedAt || !Number.isFinite(Date.parse(activeChallenge.startedAt))) {
    throw new Error("Restart this Side Quest before checking proof because its persisted start time is missing or invalid.");
  }

  return activeChallenge;
}
