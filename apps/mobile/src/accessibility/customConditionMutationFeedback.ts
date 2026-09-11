export function getNextCustomConditionFeedbackRevision(current: number): number {
  return current + 1;
}

export function getCustomConditionMutationFeedback(
  action: "deleted" | "duplicated",
  index: number,
  savedCount: number,
): string {
  const conditionLabel = `Condition ${String.fromCharCode(65 + index)}`;
  const savedCopy = savedCount === 0
    ? "No conditions saved."
    : `${savedCount} condition${savedCount === 1 ? "" : "s"} saved.`;

  return `${conditionLabel} ${action}. ${savedCopy}`;
}
