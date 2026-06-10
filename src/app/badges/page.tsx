import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import ChallengeBadge from "@/components/challenge-badge";
import SiteNav from "@/components/site-nav";
import { CHALLENGES, type Challenge } from "@/lib/challenges";
import { getChallengeAttempts, getChallengeProgress, type UserMetadataRecord } from "@/lib/user-metadata";

export default async function CoatOfArmsPage() {
  const { userId } = await auth();
  const user = userId ? await currentUser() : null;
  const metadata = user?.publicMetadata ? (user.publicMetadata as UserMetadataRecord) : {};
  const progress = getChallengeProgress(metadata);
  const completedSet = new Set(progress.completedChallengeIds);
  const liveBadgeChallenges = CHALLENGES.filter((challenge) => challenge.badgeIdentity.image);
  const earnedLiveBadgeCount = liveBadgeChallenges.filter((challenge) => completedSet.has(challenge.id)).length;
  const proofReceiptCount = getChallengeAttempts(metadata).filter((attempt) => attempt.status === "passed").length;

  return (
    <main className="site-shell">
      <SiteNav isSignedIn={Boolean(userId)} active="badges" />

      <div className="content-wrap">
        <section className="hero-card home-badge-vault-card badges-page-hero" aria-label="Coat of arms intro">
          <h1>Every bad idea deserves a coat of arms.</h1>
          <div className="home-badge-art-row badges-live-roster" aria-label="Current live Side Quest Chess coats of arms">
            {liveBadgeChallenges.map((challenge) => (
              <Link key={challenge.id} href={`/challenges/${challenge.id}`} className="home-badge-art-link badge-live-roster-link" aria-label={`Open ${challenge.title} quest`}>
                <ChallengeBadge challenge={challenge} presentation="art" earned={completedSet.has(challenge.id)} />
                <span>{challenge.title}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mission-card" aria-label="Coat of Arms progress">
          <div className="section-head">
            <div>
              <span className="eyebrow">Trophy Cabinet status</span>
              <h2>{userId ? "Your Coat of Arms progress" : "Unlock your first Coat of Arms"}</h2>
              <p>
                {userId
                  ? "Your earned-vs-live Coat of Arms progress is ready here, with quick paths back to receipts and account trophies."
                  : "Sign in when you want SQC to remember earned coats, proof receipts, Custom Solo trophies, and Multiplayer podium scrolls."}
              </p>
            </div>
            <Link href={userId ? "/account" : "/sign-in"} className="button secondary">
              {userId ? "Open Trophy Cabinet" : "Sign in to save coats"}
            </Link>
          </div>
          <div className="grid lean-status-grid" aria-label="Coat of Arms progress summary">
            <Fact label="Earned coats" value={`${earnedLiveBadgeCount}/${liveBadgeChallenges.length}`} />
            <Fact label="Proof receipts" value={userId ? `${proofReceiptCount}` : "Saved after sign-in"} />
            <Fact label="Total SQC points" value={userId ? `${progress.totalRewardPoints}` : "Start any quest"} />
          </div>
        </section>

        <section className="badge-vault-section" aria-label="Live quest coat of arms meanings">
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

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="fact">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
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
