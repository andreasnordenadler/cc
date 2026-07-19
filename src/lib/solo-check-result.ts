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

export type SoloCheckActionResult =
  | { status: "idle"; completion: null; message: null; error: null }
  | (SoloCheckResult & { message: string; error: null })
  | { status: "error"; completion: null; message: null; error: string };

export async function runSoloCheckAction(
  check: () => Promise<SoloCheckResult>,
): Promise<SoloCheckActionResult> {
  try {
    const result = await check();
    return {
      ...result,
      message: result.status === "completed"
        ? "Quest completed. Your proof is ready."
        : "Side Quest proof checked. Your latest result is shown below.",
      error: null,
    };
  } catch {
    return {
      status: "error",
      completion: null,
      message: null,
      error: "Could not check this Side Quest. Try again in a moment.",
    };
  }
}

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
