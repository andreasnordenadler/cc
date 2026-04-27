"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ChallengeBadge from "@/components/challenge-badge";
import ChallengeInviteActions from "@/components/challenge-invite-actions";
import type { Challenge } from "@/lib/challenges";

type ChallengeRouletteProps = {
  challenges: Challenge[];
  initialChallengeId: string;
};

export default function ChallengeRoulette({ challenges, initialChallengeId }: ChallengeRouletteProps) {
  const initialIndex = Math.max(0, challenges.findIndex((challenge) => challenge.id === initialChallengeId));
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);
  const [spinCount, setSpinCount] = useState(0);
  const selectedChallenge = challenges[selectedIndex] ?? challenges[0];

  const remainingCount = useMemo(
    () => challenges.filter((challenge) => challenge.id !== selectedChallenge.id).length,
    [challenges, selectedChallenge.id],
  );

  function spinNextDare() {
    if (challenges.length <= 1) return;

    setSelectedIndex((currentIndex) => {
      const jump = 1 + ((spinCount + currentIndex + 2) % (challenges.length - 1));
      return (currentIndex + jump) % challenges.length;
    });
    setSpinCount((count) => count + 1);
  }

  return (
    <section className="hero-card detail-hero roulette-hero" aria-live="polite">
      <div className="detail-hero-grid">
        <div>
          <div className="badge-row">
            <span className="eyebrow">Random dare machine</span>
            <span className="badge gold">+{selectedChallenge.reward} pts</span>
            <span className="badge danger">{selectedChallenge.difficulty}</span>
          </div>
          <h1>{selectedChallenge.title}</h1>
          <p className="hero-copy">{selectedChallenge.objective}</p>
          <p>{selectedChallenge.flavor}</p>
          <div className="button-row hero-actions">
            <button type="button" className="button pink" onClick={spinNextDare}>Spin another bad idea</button>
            <Link href={`/challenges/${selectedChallenge.id}`} className="button primary">Accept this quest</Link>
            <Link href={`/dare/${selectedChallenge.id}`} className="button secondary">Open friend dare</Link>
          </div>
          <p className="microcopy roulette-count">
            {remainingCount} other cursed options remain in the starter deck. No analysis dashboard, no PGN chores — just pick the bit and go play.
          </p>
        </div>
        <ChallengeBadge challenge={selectedChallenge} size="hero" />
      </div>

      <div className="roulette-details big-grid">
        <article className="mission-card">
          <span className="eyebrow">Badge target</span>
          <h2>{selectedChallenge.badgeIdentity.name}</h2>
          <p>{selectedChallenge.badgeIdentity.unlockCopy}</p>
          <div className="note-card">
            <strong>{selectedChallenge.badgeIdentity.heraldry.motto}</strong>
            <p>{selectedChallenge.badgeIdentity.heraldry.meaning}</p>
          </div>
        </article>

        <article className="mission-card share-card">
          <span className="eyebrow">Send the bit</span>
          <h2>Dare one friend before you overthink it.</h2>
          <p>{selectedChallenge.openingHint}</p>
          <ChallengeInviteActions
            challengeTitle={selectedChallenge.title}
            challengeObjective={selectedChallenge.objective}
            challengePath={`/dare/${selectedChallenge.id}`}
            reward={selectedChallenge.reward}
            badgeName={selectedChallenge.badgeIdentity.name}
          />
        </article>
      </div>
    </section>
  );
}
