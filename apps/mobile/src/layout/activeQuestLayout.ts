export type ActiveQuestLayoutMetrics = {
  width: number;
  fontScale: number;
};

const MIN_SIDE_BY_SIDE_EFFECTIVE_WIDTH = 400;

export function shouldStackActiveQuestSummary({ width, fontScale }: ActiveQuestLayoutMetrics): boolean {
  const safeWidth = Number.isFinite(width) ? Math.max(0, width) : 0;
  const safeFontScale = Number.isFinite(fontScale) ? Math.max(1, fontScale) : 1;

  return safeWidth / safeFontScale < MIN_SIDE_BY_SIDE_EFFECTIVE_WIDTH;
}
