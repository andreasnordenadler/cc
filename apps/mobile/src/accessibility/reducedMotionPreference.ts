export type ReducedMotionPreferenceDependencies = {
  getInitialValue: () => Promise<boolean>;
  subscribe: (onChange: (enabled: boolean) => void) => () => void;
  onChange: (enabled: boolean) => void;
};

export function shouldAnimateRefreshIcon(
  spinning: boolean,
  reduceMotionEnabled: boolean,
) {
  return spinning && !reduceMotionEnabled;
}

export function createReducedMotionPreferenceController(
  dependencies: ReducedMotionPreferenceDependencies,
) {
  return {
    start() {
      let active = true;
      let receivedNativeChange = false;
      const unsubscribe = dependencies.subscribe((enabled) => {
        receivedNativeChange = true;
        if (active) dependencies.onChange(enabled);
      });
      void dependencies.getInitialValue().then((enabled) => {
        if (active && !receivedNativeChange) dependencies.onChange(enabled);
      }).catch(() => {
        // Keep the default value; live native changes can still update it.
      });

      return () => {
        active = false;
        unsubscribe();
      };
    },
  };
}
