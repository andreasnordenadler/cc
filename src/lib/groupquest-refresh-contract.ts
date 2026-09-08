import type { GroupQuestCheckResult } from "@/lib/groupquest-proof";

export function buildGroupQuestRefreshChecks(
  checks: ReadonlyArray<{ questId: string; result: GroupQuestCheckResult | (Omit<GroupQuestCheckResult, "mismatchReasons"> & { mismatchReasons?: readonly NonNullable<GroupQuestCheckResult["mismatchReasons"]>[number][] }) }>,
) {
  return checks.map(({ questId, result }) => ({
    questId,
    status: result.status,
    summary: result.summary,
    gameId: result.gameId,
    gameUrl: result.gameUrl,
    gameTime: result.gameTime,
    outcome: result.outcome,
    mismatchCode: result.mismatchReasons?.[0],
    mismatchReasons: result.mismatchReasons,
    finalPositionFen: result.finalPositionFen,
    lastMoveUci: result.lastMoveUci,
    lastMoveSan: result.lastMoveSan,
    ...(result.failureDiagnostic ? { failureDiagnostic: result.failureDiagnostic } : {}),
  }));
}
