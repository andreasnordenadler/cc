import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import ShareProofActions from "@/components/share-proof-actions";
import SiteNav from "@/components/site-nav";
import { CHALLENGES, getChallengeById } from "@/lib/challenges";
import {
  buildAttemptSummary,
  getChallengeProgress,
  getLatestChallengeAttempt,
  type UserMetadataRecord,
} from "@/lib/user-metadata";

export default async function ResultPage() {
  const user = await currentUser();
  const metadata = user?.publicMetadata ? (user.publicMetadata as UserMetadataRecord) : {};
  const latestAttempt = getLatestChallengeAttempt(metadata);
  const progress = getChallengeProgress(metadata);
  const challenge = latestAttempt?.challengeId
    ? getChallengeById(latestAttempt.challengeId) ?? CHALLENGES[0]
    : CHALLENGES[0];
  const latestAttemptSummary = buildAttemptSummary(latestAttempt);
  const isPassed = latestAttempt?.status === "passed";
  const isPending = latestAttempt?.status === "pending" || !latestAttempt;
  const proofStatus = isPassed ? "Certified chaos" : isPending ? "Waiting on proof" : "Attempt logged";
  const posterTitle = isPassed
    ? "It counts. Somehow."
    : isPending
      ? "Proof is warming up."
      : "Not cursed enough yet.";
  const posterCopy = latestAttempt
    ? latestAttempt.summary ?? "Latest BlunderCheck attempt saved."
    : "Start a dare, play real chess, and BlunderCheck turns the latest check into a shareable proof card.";
  const gameLabel = latestAttempt?.gameId ?? "latest-game-check";
  const shareCopy = isPassed
    ? `I completed “${challenge.title}” on BlunderCheck. ${challenge.badge} unlocked. +${challenge.reward} points.`
    : latestAttempt
      ? `I tried “${challenge.title}” on BlunderCheck. ${latestAttemptSummary.headline}: ${latestAttemptSummary.detail}`
      : `I am trying “${challenge.title}” on BlunderCheck — chess side quests for people who enjoy bad ideas.`;

  return (
    <main className="site-shell">
      <SiteNav isSignedIn={Boolean(user)} active="result" />

      <div className="content-wrap">
        <section className="hero-grid">
          <article className="result-poster">
            <div className="eyebrow" style={{ color: "#140d0d", background: "rgba(20,13,13,.12)" }}>BlunderCheck proof</div>
            <h1>{posterTitle}</h1>
            <p>{posterCopy}</p>
            <div className="proof-grid">
              <Fact label="Challenge" value={challenge.title} />
              <Fact label="Status" value={proofStatus} />
              <Fact label="Game" value={gameLabel} />
              <Fact label="Points" value={isPassed ? `+${challenge.reward}` : `${progress.totalRewardPoints} banked`} />
            </div>
            <strong>“I made a terrible chess decision and BlunderCheck made a receipt.”</strong>
          </article>

          <aside className="mission-card">
            <span className="eyebrow">Live proof card</span>
            <h2>The result now follows your latest check.</h2>
            <p>
              This screen uses the saved active-challenge attempt instead of a static demo, so the share moment can reflect a real passed, failed, or pending verifier result.
            </p>
            <div className="button-row">
              <Link href="/account" className="button primary">Check latest games</Link>
              <Link href={`/challenges/${challenge.id}`} className="button secondary">View challenge rules</Link>
            </div>
          </aside>
        </section>

        <section className="big-grid">
          <article className="mission-card share-card">
            <span className="eyebrow">Share copy</span>
            <h2>{isPassed ? `I completed “${challenge.title}.”` : `I tried “${challenge.title}.”`}</h2>
            <p>{shareCopy}</p>
            <ShareProofActions copy={shareCopy} challengeTitle={challenge.title} />
          </article>
          <article className="mission-card">
            <span className="eyebrow">Latest check</span>
            <h2>{latestAttemptSummary.headline}</h2>
            <p>{latestAttemptSummary.detail}</p>
            <p className="muted">{latestAttemptSummary.meta}</p>
            <Link href="/challenges" className="button pink">Try another bad idea</Link>
          </article>
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
