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
                  : "Sign in when you want SQC to remember earned coats, proof receipts, Custom Solo Side Quest trophies, and Multiplayer podium scrolls."}
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

        <section className="mission-card badge-vault-guide" aria-label="Coat room guide">
          <div className="section-head">
            <div>
              <span className="eyebrow">Coat room guide</span>
              <h2>Pick a crest, run the quest, keep the receipt.</h2>
              <p>
                Each coat below now reads like a small quest card: what it asks for, how hard it is, and whether it is already in your Trophy Cabinet.
              </p>
            </div>
            <Link href="/challenges" className="button secondary">
              Browse Solo Side Quests
            </Link>
          </div>
          <div className="badge-guide-steps" aria-label="How coats unlock">
            <div>
              <strong>1. Choose the crest</strong>
              <span>Open any coat to inspect the matching Solo Side Quest.</span>
            </div>
            <div>
              <strong>2. Play a public game</strong>
              <span>SQC checks Lichess or Chess.com proof after the quest starts.</span>
            </div>
            <div>
              <strong>3. Save the proof</strong>
              <span>Passed runs become receipt links and Trophy Cabinet entries.</span>
            </div>
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
        <span className={earned ? "badge-meaning-status earned" : "badge-meaning-status"}>{earned ? "In your Trophy Cabinet" : "Ready to earn"}</span>
        <h2>{challenge.badgeIdentity.name}</h2>
        <span className="badge-run-preview" aria-label={`${challenge.title} run preview`}>
          <span>{challenge.difficulty}</span>
          <span>{challenge.reward} pts</span>
          <span>{challenge.category}</span>
        </span>
        <p>{challenge.objective}</p>
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
            <dt>Next step</dt>
            <dd>Open {challenge.title} to start the run or check proof.</dd>
          </div>
        </dl>
      </span>
    </Link>
  );
}
