import type { CSSProperties } from "react";
import type { Challenge } from "@/lib/challenges";

type ChallengeBadgeProps = {
  challenge: Challenge;
  size?: "compact" | "hero";
  earned?: boolean;
};

export default function ChallengeBadge({ challenge, size = "compact", earned = false }: ChallengeBadgeProps) {
  const identity = challenge.badgeIdentity;
  const className = ["challenge-badge-token", size === "hero" ? "hero" : "", earned ? "earned" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={className}
      style={{
        "--badge-primary": identity.colors.primary,
        "--badge-secondary": identity.colors.secondary,
        "--badge-glow": identity.colors.glow,
      } as CSSProperties}
      aria-label={`${identity.name} badge: ${identity.unlockCopy}`}
      title={`${identity.name} · ${identity.unlockCopy}`}
    >
      <span className="badge-token-motif" aria-hidden="true">{identity.motif}</span>
      <span className="badge-token-copy">
        <strong>{identity.name}</strong>
        <small>{identity.rarity}</small>
      </span>
    </div>
  );
}
