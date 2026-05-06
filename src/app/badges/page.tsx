import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import ChallengeBadge from "@/components/challenge-badge";
import SiteNav from "@/components/site-nav";
import { CHALLENGES, type Challenge } from "@/lib/challenges";

export default async function CoatOfArmsPage() {
  const { userId } = await auth();
  const badgePreviewChallenges = CHALLENGES.filter((challenge) => challenge.badgeIdentity.image).slice(0, 6);

  return (
    <main className="site-shell">
      <SiteNav isSignedIn={Boolean(userId)} active="badges" />

      <div className="content-wrap">
        <section className="hero-card home-badge-vault-card badges-page-hero" aria-label="Coat of arms intro">
          <h1>Every bad idea deserves a coat of arms.</h1>
          <p className="hero-copy">
            Side Quest Chess coats of arms are collectible heraldic receipts: each shield explains the exact nonsense you survived, why it matters, and what your friends should mock respectfully.
          </p>
          <div className="home-badge-art-row" aria-label="Side Quest Chess coat of arms preview">
            {badgePreviewChallenges.map((challenge) => (
              <Link key={challenge.id} href={`/challenges/${challenge.id}`} className="home-badge-art-link" aria-label={`Open ${challenge.title} quest`}>
                <ChallengeBadge challenge={challenge} presentation="art" earned />
              </Link>
            ))}
          </div>
        </section>

        <section className="badge-description-grid" aria-label="Side Quest Chess coat of arms meanings">
          {CHALLENGES.map((challenge) => (
            <BadgeMeaningCard key={challenge.id} challenge={challenge} />
          ))}
        </section>
      </div>
    </main>
  );
}

function BadgeMeaningCard({ challenge }: { challenge: Challenge }) {
  return (
    <Link href={`/challenges/${challenge.id}`} className="mission-card badge-meaning-card" aria-label={`Open ${challenge.title} quest`}>
      <span className="badge-meaning-art-link" aria-hidden="true">
        <ChallengeBadge challenge={challenge} presentation="art" earned />
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
