export type AppRowAction = () => void;

type InteractiveAppRow = {
  interactive: true;
  accessibilityRole: "button";
  onPress: AppRowAction;
};

type InformationalAppRow = {
  interactive: false;
  accessibilityRole: undefined;
  onPress: undefined;
};

export function getAppRowInteraction(onPress?: AppRowAction): InteractiveAppRow | InformationalAppRow {
  if (!onPress) {
    return {
      interactive: false,
      accessibilityRole: undefined,
      onPress: undefined,
    };
  }

  return {
    interactive: true,
    accessibilityRole: "button",
    onPress,
  };
}
