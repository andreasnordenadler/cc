export const MAX_CUSTOM_CONDITIONS = 6;

export function getCustomConditionSlotCount(
  savedCount: number,
  editorOpen: boolean,
  editingId: string | null,
): number {
  return savedCount + (editorOpen && !editingId ? 1 : 0);
}

export function prependCustomCondition<T>(
  current: readonly T[],
  condition: T,
  reservedSlots = 0,
): T[] | null {
  if (current.length + reservedSlots >= MAX_CUSTOM_CONDITIONS) return null;
  return [condition, ...current];
}

export type CustomConditionState<T> = {
  conditions: readonly T[];
  editorOpen: boolean;
  editingId: string | null;
};

type CustomConditionCapacityAction<T> =
  | { type: "open-new" }
  | { type: "duplicate"; condition: T }
  | { type: "save"; condition: T };

export function transitionCustomConditionState<T extends { id: string }>(
  state: CustomConditionState<T>,
  action: CustomConditionCapacityAction<T>,
): { state: CustomConditionState<T>; accepted: boolean } {
  if (action.type === "open-new") {
    if (getCustomConditionSlotCount(state.conditions.length, state.editorOpen, state.editingId) >= MAX_CUSTOM_CONDITIONS) {
      return { state, accepted: false };
    }
    return { state: { ...state, editorOpen: true, editingId: null }, accepted: true };
  }

  if (action.type === "save") {
    if (!state.editorOpen) return { state, accepted: false };
    if (state.editingId) {
      if (!state.conditions.some((condition) => condition.id === state.editingId)) {
        return { state, accepted: false };
      }
      const conditions = state.conditions.map((condition) => condition.id === state.editingId
        ? { ...action.condition, id: state.editingId }
        : condition);
      return { state: { conditions, editorOpen: false, editingId: null }, accepted: true };
    }
    const conditions = prependCustomCondition(state.conditions, action.condition);
    if (!conditions) return { state, accepted: false };
    return { state: { conditions, editorOpen: false, editingId: null }, accepted: true };
  }

  const conditions = prependCustomCondition(
    state.conditions,
    action.condition,
    state.editorOpen && !state.editingId ? 1 : 0,
  );
  if (!conditions) return { state, accepted: false };
  return { state: { ...state, conditions }, accepted: true };
}
