import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import ChallengeBadge from "@/components/challenge-badge";
import SiteNav from "@/components/site-nav";
import { CHALLENGES, type Challenge } from "@/lib/challenges";
import { getChallengeProgress, type UserMetadataRecord } from "@/lib/user-metadata";

export default async function BadgesPage() {
  const { userId } = await auth();
  const user = userId ? await currentUser() : null;
  const metadata = user?.publicMetadata ? (user.publicMetadata as UserMetadataRecord) : {};
  const progress = getChallengeProgress(metadata);
  const completedSet = new Set(progress.completedChallengeIds);
  const earnedCount = CHALLENGES.filter((challenge) => completedSet.has(challenge.id)).length;

  return (
    <main className="site-shell">
      <SiteNav isSignedIn={Boolean(userId)} active="badges" />

      <div className="content-wrap">
        <section className="hero-card">
          <span className="eyebrow">SQC badge vault</span>
          <h1>Every bad idea deserves a coat of arms.</h1>
          <p className="hero-copy">
            Side Quest Chess badges are collectible heraldic receipts: each shield explains the exact nonsense you survived, why it matters, and what your friends should mock respectfully.
          </p>
          <div className="button-row hero-actions">
            <Link href="/challenges" className="button primary">Earn a badge</Link>
            <Link href="/result" className="button secondary">Share latest proof</Link>
          </div>
        </section>

        <section className="grid" aria-label="Badge vault status">
          <Fact label="Badges designed" value={`${CHALLENGES.length}`} copy="Each starter quest has its own SQC coat-of-arms identity." />
          <Fact label="Earned by you" value={`${earnedCount}`} copy={userId ? `${progress.totalRewardPoints} points banked so far.` : "Sign in when you want the vault to remember your chaos."} />
          <Fact label="Style rule" value="No generic trophies" copy="Every charge, crest, motto, and joke maps back to a specific challenge." />
        </section>

        <section className="big-grid" aria-label="Side Quest Chess badge collection">
          {CHALLENGES.map((challenge) => (
            <BadgeVaultCard key={challenge.id} challenge={challenge} earned={completedSet.has(challenge.id)} />
          ))}
        </section>
      </div>
    </main>
  );
}

function BadgeVaultCard({ challenge, earned }: { challenge: Challenge; earned: boolean }) {
  return (
    <article className={`challenge-card ${earned ? "featured" : ""}`}>
      <div className="card-meta">
        <span>{challenge.category}</span>
        <span className="badge gold">{challenge.badgeIdentity.rarity}</span>
      </div>
      <ChallengeBadge challenge={challenge} earned={earned} size="hero" />
      <h2>{challenge.badgeIdentity.name}</h2>
      <p>{challenge.badgeIdentity.unlockCopy}</p>
      <div className="proof-line">{challenge.badgeIdentity.heraldry.motto} · {challenge.badgeIdentity.heraldry.charge}</div>
      <ul className="rule-list">
        <li><strong>Shield:</strong> {challenge.badgeIdentity.heraldry.shield}</li>
        <li><strong>Meaning:</strong> {challenge.badgeIdentity.heraldry.meaning}</li>
        <li><strong>Quest:</strong> {challenge.title}</li>
      </ul>
      <div className="card-footer">
        <strong>{earned ? "Earned" : `+${challenge.reward} pts`}</strong>
        <span>{challenge.difficulty}</span>
        <Link href={`/challenges/${challenge.id}`}>{earned ? "View quest" : "Earn this"}</Link>
      </div>
    </article>
  );
}

function Fact({ label, value, copy }: { label: string; value: string; copy: string }) {
  return (
    <article className="stat-card mission-card">
      <span className="eyebrow">{label}</span>
      <h3>{value}</h3>
      <p>{copy}</p>
    </article>
  );
}
