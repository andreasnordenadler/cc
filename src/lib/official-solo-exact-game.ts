type ActiveSoloSubmissionTarget = {
  id?: string;
  startedAt?: string;
} | null | undefined;

export function assertActiveSoloSubmissionTarget(activeChallenge: ActiveSoloSubmissionTarget, challengeId: string) {
  if (!activeChallenge?.id || activeChallenge.id !== challengeId) {
    throw new Error("Start this Side Quest before submitting a specific game.");
  }

  return activeChallenge;
}
