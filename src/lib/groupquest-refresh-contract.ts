import type { GroupQuestCheckResult } from "@/lib/groupquest-proof";

export function buildGroupQuestRefreshChecks(
  checks: Array<{ questId: string; result: GroupQuestCheckResult }>,
) {
  return checks.map(({ questId, result }) => ({
    questId,
    status: result.status,
    summary: result.summary,
    gameId: result.gameId,
    gameUrl: result.gameUrl,
    mismatchCode: result.mismatchReasons?.[0],
    mismatchReasons: result.mismatchReasons,
    finalPositionFen: result.finalPositionFen,
    lastMoveUci: result.lastMoveUci,
    lastMoveSan: result.lastMoveSan,
  }));
}
