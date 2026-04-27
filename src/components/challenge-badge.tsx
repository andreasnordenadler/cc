import Image from "next/image";
import type { CSSProperties } from "react";
import type { Challenge } from "@/lib/challenges";

type ChallengeBadgeProps = {
  challenge: Challenge;
  size?: "compact" | "hero";
  earned?: boolean;
};

export default function ChallengeBadge({ challenge, size = "compact", earned = false }: ChallengeBadgeProps) {
  const identity = challenge.badgeIdentity;
  const heraldry = identity.heraldry;
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
      aria-label={`${identity.name} coat of arms: ${heraldry.meaning}`}
      title={`${identity.name} · ${heraldry.motto} · ${heraldry.meaning}`}
    >
      <span className="badge-heraldry" aria-hidden="true">
        {identity.image ? (
          <Image
            src={identity.image}
            alt=""
            width={size === "hero" ? 220 : 96}
            height={size === "hero" ? 220 : 96}
            className="badge-reference-art"
            priority={size === "hero"}
            unoptimized
          />
        ) : (
          <>
            <span className="badge-crest">✦</span>
            <span className="badge-shield">
              <span className="badge-token-motif">{identity.motif}</span>
            </span>
          </>
        )}
        <span className="badge-ribbon">{heraldry.motto}</span>
      </span>
      <span className="badge-token-copy">
        <strong>{identity.name}</strong>
        <small>{identity.rarity}</small>
        <em>{heraldry.charge}</em>
        <span className="badge-weirdness">{heraldry.weirdness}</span>
      </span>
    </div>
  );
}
