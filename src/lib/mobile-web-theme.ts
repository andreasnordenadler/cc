export type MobileWebShellTheme = {
  backgroundTop: string;
  backgroundMid: string;
  glow: string;
  accent: string;
};

export function getMobileWebTheme(colors?: { primary: string; secondary: string; glow: string } | null): MobileWebShellTheme | null {
  if (!colors) return null;

  if (colors.primary.toLowerCase() === "#f5c86a") {
    return {
      backgroundTop: "#766f5b",
      backgroundMid: "#312c24",
      glow: "rgba(245, 200, 106, .24)",
      accent: "rgba(245, 200, 106, .18)",
    };
  }

  if (colors.primary.toLowerCase() === "#2dd4bf" || colors.secondary.toLowerCase() === "#2dd4bf") {
    return {
      backgroundTop: "#1e7773",
      backgroundMid: "#123a3f",
      glow: colors.glow,
      accent: "rgba(45, 212, 191, .2)",
    };
  }

  if (colors.primary.toLowerCase() === "#ff7a66" || colors.primary.toLowerCase() === "#ff5f9f") {
    return {
      backgroundTop: "#703f3e",
      backgroundMid: "#2b1c21",
      glow: colors.glow,
      accent: "rgba(255, 122, 102, .16)",
    };
  }

  if (colors.primary.toLowerCase() === "#a78bfa") {
    return {
      backgroundTop: "#52446f",
      backgroundMid: "#201b32",
      glow: colors.glow,
      accent: "rgba(167, 139, 250, .16)",
    };
  }

  return {
    backgroundTop: "#1e7773",
    backgroundMid: "#123a3f",
    glow: colors.glow,
    accent: "rgba(45, 212, 191, .2)",
  };
}
