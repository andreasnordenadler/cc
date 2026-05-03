import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import ChallengeBadge from "@/components/challenge-badge";
import ShareProofActions from "@/components/share-proof-actions";
import SiteNav from "@/components/site-nav";
import { CHALLENGES } from "@/lib/challenges";
import {
  buildAttemptSummary,
  formatAttemptStatus,
  getChallengeAttempts,
  getChallengeProgress,
  type ChallengeAttempt,
  type UserMetadataRecord,
} from "@/lib/user-metadata";

export default async function ProofLogPage() {
  const { userId } = await auth();
  const user = userId ? await currentUser() : null;
  const metadata = user?.publicMetadata ? (user.publicMetadata as UserMetadataRecord) : {};
  const attempts = getChallengeAttempts(metadata).toReversed();
  const progress = getChallengeProgress(metadata);

  return (
    <main className="site-shell">
      <SiteNav isSignedIn={Boolean(userId)} active="proof-log" />

      <div className="content-wrap">
        <section className="hero-card">
          <span className="eyebrow">Proof log</span>
          <h1>Your side-quest receipts.</h1>
          <p className="hero-copy">
            Every latest-game check becomes a receipt here: passed, failed, or still pending. No PGN homework, no engine lecture — just a running record of the bad ideas Side Quest Chess has judged.
          </p>
          <div className="button-row hero-actions">
            <Link href="/account" className="button primary">Check latest games</Link>
            <Link href="/result" className="button secondary">Open share card</Link>
            <Link href="/challenges" className="button secondary">Pick another quest</Link>
          </div>
        </section>

        <section className="grid" aria-label="Proof log summary">
          <Fact label="Saved receipts" value={`${attempts.length}`} copy="Latest-game checks recorded on your profile." />
          <Fact label="Completed quests" value={`${progress.totalCompletedChallenges}`} copy={`${progress.totalRewardPoints} points banked from verified side quests.`} />
          <Fact label="Verifier posture" value="Automatic" copy="Play on Lichess or Chess.com, then let SQC inspect the evidence." />
        </section>

        {attempts.length > 0 ? (
          <section className="big-grid" aria-label="Saved proof receipts">
            {attempts.map((attempt, index) => (
              <ProofReceipt key={attempt.id ?? `${attempt.challengeId}-${attempt.checkedAt}-${index}`} attempt={attempt} />
            ))}
          </section>
        ) : (
          <section className="mission-card">
            <div className="section-head">
              <div>
                <span className="eyebrow">No receipts yet</span>
                <h2>Start with one gloriously questionable quest.</h2>
              </div>
              <span className="badge gold">empty log</span>
            </div>
            <p>
              Accept a side quest, connect your chess identity, play a normal game elsewhere, then use the account checker. Your first receipt will appear here once Side Quest Chess has something to judge.
            </p>
            <div className="button-row hero-actions">
              <Link href="/today" className="button primary">Open today’s quest</Link>
              <Link href="/random" className="button pink">Spin a bad idea</Link>
              <Link href="/connect" className="button secondary">Connect account</Link>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function ProofReceipt({ attempt }: { attempt: ChallengeAttempt }) {
  const challengeId = attempt.challengeId ?? attempt.id?.split(":")[0] ?? "";
  const challenge = CHALLENGES.find((item) => item.id === challengeId) ?? CHALLENGES[0];
  const summary = buildAttemptSummary(attempt);
  const status = attempt.status ?? "pending";
  const statusTone = status === "passed" ? "green" : status === "failed" ? "danger" : "gold";
  const shareCopy =
    status === "passed"
      ? `I completed “${challenge.title}” on Side Quest Chess. ${challenge.badgeIdentity.name} unlocked for +${challenge.reward} points.`
      : `I logged “${challenge.title}” on Side Quest Chess. ${summary.headline}: ${summary.detail}`;

  return (
    <article className="challenge-card proof-receipt-card">
      <div className="card-meta">
        <span>{challenge.category}</span>
        <span className={`badge ${statusTone}`}>{formatAttemptStatus(status)}</span>
      </div>
      <div className="challenge-card-title-row">
        <ChallengeBadge challenge={challenge} earned={status === "passed"} />
        <div>
          <h3>{challenge.title}</h3>
          <p>{summary.detail}</p>
        </div>
      </div>
      <div className="proof-line">{summary.meta}</div>
      <ShareProofActions
        copy={shareCopy}
        challengeTitle={challenge.title}
        sharePath="/proof-log"
        copyLabel="Copy receipt"
        shareLabel="Share receipt"
        idleCopy="Copies this saved proof receipt plus the proof-log link, so old attempts can still become group-chat bait."
      />
      <div className="card-footer">
        <strong>{summary.headline}</strong>
        <span>{challenge.proofCallout}</span>
        <Link href={`/challenges/${challenge.id}`}>Rules</Link>
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
