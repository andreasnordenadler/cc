import type { ReactNode } from "react";
import ChallengeBadge from "@/components/challenge-badge";
import type { Challenge } from "@/lib/challenges";

type VictoryScrollProps = {
  challenge: Challenge;
  badgeName?: string;
  achievementCopy: string;
  proofLine: ReactNode;
  dateLabel: ReactNode;
  reward: number;
  className?: string;
};

export default function VictoryScroll({
  challenge,
  badgeName = challenge.badgeIdentity.name,
  achievementCopy,
  proofLine,
  dateLabel,
  reward,
  className = "",
}: VictoryScrollProps) {
  return (
    <div className={`victory-scroll ${className}`.trim()} aria-label={`Victory scroll for ${challenge.title}`}>
      <div className="victory-scroll-burn top-left" aria-hidden="true" />
      <div className="victory-scroll-burn top-right" aria-hidden="true" />
      <div className="victory-scroll-crest">
        <ChallengeBadge challenge={challenge} presentation="art" earned />
      </div>
      <span className="victory-scroll-kicker">Quest completed</span>
      <h3>{challenge.title}</h3>
      <p className="victory-scroll-reward">Coat of arms unlocked: <strong>{badgeName}</strong></p>
      <p className="victory-scroll-copy">{achievementCopy}</p>
      <p className="victory-scroll-proof">{proofLine}</p>
      <div className="victory-scroll-footer">
        <span>{dateLabel}</span>
        <span>+{reward} pts</span>
      </div>
      <div className="victory-scroll-seal" aria-label="Side Quest Chess seal of approval" />
    </div>
  );
}
