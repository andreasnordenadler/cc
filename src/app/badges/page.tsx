import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import ChallengeBadge from "@/components/challenge-badge";
import SiteNav from "@/components/site-nav";
import { CHALLENGES, type Challenge } from "@/lib/challenges";
import { getChallengeProgress, type UserMetadataRecord } from "@/lib/user-metadata";

export default async function CoatOfArmsPage() {
  const { userId } = await auth();
  const user = userId ? await currentUser() : null;
  const metadata = user?.publicMetadata ? (user.publicMetadata as UserMetadataRecord) : {};
  const progress = getChallengeProgress(metadata);
  const completedSet = new Set(progress.completedChallengeIds);
  const liveBadgeChallenges = CHALLENGES.filter((challenge) => challenge.badgeIdentity.image);

  return (
    <main className="site-shell">
      <SiteNav isSignedIn={Boolean(userId)} active="badges" />

      <div className="content-wrap">
        <section className="hero-card home-badge-vault-card badges-page-hero" aria-label="Coat of arms intro">
          <h1>Every bad idea deserves a coat of arms.</h1>
          <p className="hero-copy">
            Side Quest Chess coats of arms are collectible heraldic receipts. This vault is generated from the current live quest roster, so every active quest with a coat of arms appears here.
          </p>
          <div className="badge-roster-meta" aria-label="Live coat of arms count">
            <span>{liveBadgeChallenges.length} live quest coats</span>
            <span>Auto-synced from active quests</span>
          </div>
          <div className="home-badge-art-row badges-live-roster" aria-label="Current live Side Quest Chess coats of arms">
            {liveBadgeChallenges.map((challenge) => (
              <Link key={challenge.id} href={`/challenges/${challenge.id}`} className="home-badge-art-link badge-live-roster-link" aria-label={`Open ${challenge.title} quest`}>
                <ChallengeBadge challenge={challenge} presentation="art" earned={completedSet.has(challenge.id)} />
                <span>{challenge.title}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="badge-vault-section" aria-label="Live quest coat of arms meanings">
          <div className="section-head">
            <div>
              <span className="eyebrow">Live quest vault</span>
              <h2>Active quests.</h2>
              <p>When a quest is released, its badge comes from the same quest registry as the hub and detail pages.</p>
            </div>
          </div>
          <div className="badge-description-grid">
            {CHALLENGES.map((challenge) => (
              <BadgeMeaningCard key={challenge.id} challenge={challenge} earned={completedSet.has(challenge.id)} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function BadgeMeaningCard({ challenge, earned }: { challenge: Challenge; earned: boolean }) {
  return (
    <Link href={`/challenges/${challenge.id}`} className="mission-card badge-meaning-card" aria-label={`Open ${challenge.title} quest`}>
      <span className="badge-meaning-art-link" aria-hidden="true">
        <ChallengeBadge challenge={challenge} presentation="art" earned={earned} />
      </span>
      <span className="badge-meaning-copy">
        <h2>{challenge.badgeIdentity.name}</h2>
        <dl>
          <div>
            <dt>Shield</dt>
            <dd>{challenge.badgeIdentity.heraldry.shield}</dd>
          </div>
          <div>
            <dt>Meaning</dt>
            <dd>{challenge.badgeIdentity.heraldry.meaning}</dd>
          </div>
          <div>
            <dt>Quest</dt>
            <dd>{challenge.title}</dd>
          </div>
        </dl>
      </span>
    </Link>
  );
}
