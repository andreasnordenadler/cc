export function getNextCustomConditionFeedbackRevision(current: number): number {
  return current + 1;
}

export function getCustomConditionMutationFeedback(
  action: "added" | "updated" | "deleted" | "duplicated",
  index: number,
  savedCount: number,
): string {
  const conditionLabel = `Condition ${String.fromCharCode(65 + index)}`;
  const savedCopy = savedCount === 0
    ? "No conditions saved."
    : `${savedCount} condition${savedCount === 1 ? "" : "s"} saved.`;

  return `${conditionLabel} ${action}. ${savedCopy}`;
}

export function getCustomConditionSaveFeedback(
  state: { editorOpen: boolean; editingId: string | null },
  savedConditions: readonly { id: string }[],
): string | null {
  if (!state.editorOpen) return null;

  const action = state.editingId ? "updated" : "added";
  const index = state.editingId
    ? savedConditions.findIndex((condition) => condition.id === state.editingId)
    : 0;
  if (index < 0 || index >= savedConditions.length) return null;

  return getCustomConditionMutationFeedback(action, index, savedConditions.length);
}
