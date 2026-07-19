export type SoloCompletion = {
  challengeId: string;
  challengeTitle: string;
  badgeName: string;
  badgeImage: string;
  unlockCopy: string;
  accentColor: string;
};

export type SoloCheckResult =
  | { status: "completed"; completion: SoloCompletion }
  | { status: "checked"; completion: null };

export function buildSoloCheckResult({
  challenge,
  passed,
  alreadyCompleted,
}: {
  challenge: {
    id: string;
    title: string;
    badgeName: string;
    badgeImage: string;
    unlockCopy: string;
    accentColor: string;
  };
  passed: boolean;
  alreadyCompleted: boolean;
}): SoloCheckResult {
  if (!passed || alreadyCompleted) {
    return { status: "checked", completion: null };
  }

  return {
    status: "completed",
    completion: {
      challengeId: challenge.id,
      challengeTitle: challenge.title,
      badgeName: challenge.badgeName,
      badgeImage: challenge.badgeImage,
      unlockCopy: challenge.unlockCopy,
      accentColor: challenge.accentColor,
    },
  };
}
