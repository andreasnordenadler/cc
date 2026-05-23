import type { CSSProperties } from "react";
import type { Challenge } from "@/lib/challenges";

export function challengeAccentStyle(challenge: Pick<Challenge, "badgeIdentity">): CSSProperties {
  const { colors } = challenge.badgeIdentity;

  return {
    "--quest-accent-primary": colors.primary,
    "--quest-accent-secondary": colors.secondary,
    "--quest-accent-glow": colors.glow,
  } as CSSProperties;
}
