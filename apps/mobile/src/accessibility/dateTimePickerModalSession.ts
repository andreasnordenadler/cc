export type DateTimePickerModalSessionDependencies<TTarget, TTrigger> = {
  show: (target: TTarget, sessionId: number) => void;
  hide: () => void;
  clear: () => void;
  focus: (trigger: TTrigger) => void;
};

export function createDateTimePickerModalSessionController<TTarget, TTrigger>(
  dependencies: DateTimePickerModalSessionDependencies<TTarget, TTrigger>,
) {
  let nextSessionId = 1;
  let state:
    | { phase: "idle" }
    | { phase: "open"; sessionId: number; trigger: TTrigger }
    | { phase: "closing"; sessionId: number; trigger: TTrigger } = { phase: "idle" };

  function open(target: TTarget, nextTrigger: TTrigger) {
    if (state.phase !== "idle") return null;

    const sessionId = nextSessionId;
    nextSessionId += 1;
    state = { phase: "open", sessionId, trigger: nextTrigger };
    dependencies.show(target, sessionId);
    return sessionId;
  }

  function requestClose(sessionId: number) {
    if (state.phase !== "open" || state.sessionId !== sessionId) return false;

    state = { phase: "closing", sessionId: state.sessionId, trigger: state.trigger };
    dependencies.hide();
    return true;
  }

  function completeDismissal(sessionId: number) {
    if (state.phase !== "closing" || state.sessionId !== sessionId) return false;

    const { trigger } = state;
    state = { phase: "idle" };
    dependencies.focus(trigger);
    dependencies.clear();
    return true;
  }

  function isOpen(sessionId: number) {
    return state.phase === "open" && state.sessionId === sessionId;
  }

  return {
    open,
    requestClose,
    completeDismissal,
    isOpen,
  };
}

export type NativeDateTimePickerChangeInput<TValue, TMode> = {
  platform: string;
  eventType: string;
  selected?: TValue;
  targetMode: TMode | null;
  value: TValue;
  applySelection: (value: TValue, selected: TValue, mode: TMode) => TValue;
  onChange: (next: TValue) => void;
  closeIos: () => void;
  clearNonIos: () => void;
  isIosSessionOpen: () => boolean;
};

export function handleNativeDateTimePickerChange<TValue, TMode>(
  input: NativeDateTimePickerChangeInput<TValue, TMode>,
) {
  if (input.platform === "ios") {
    if (!input.isIosSessionOpen()) return;
    if (input.eventType === "dismissed") {
      input.closeIos();
      return;
    }
    if (input.selected === undefined || input.targetMode === null) return;
    input.onChange(input.applySelection(input.value, input.selected, input.targetMode));
    return;
  }

  input.clearNonIos();
  if (input.eventType === "dismissed") return;
  if (input.selected === undefined || input.targetMode === null) return;
  input.onChange(input.applySelection(input.value, input.selected, input.targetMode));
}
