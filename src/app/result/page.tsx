import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import ChallengeBadge from "@/components/challenge-badge";
import ChallengeInviteActions from "@/components/challenge-invite-actions";
import ShareProofActions from "@/components/share-proof-actions";
import SiteNav from "@/components/site-nav";
import { CHALLENGES, getChallengeById } from "@/lib/challenges";
import {
  buildAttemptSummary,
  getChallengeProgress,
  getLatestChallengeAttempt,
  type ChallengeAttempt,
  type UserMetadataRecord,
} from "@/lib/user-metadata";

export default async function ResultPage({
  searchParams,
}: {
  searchParams?: Promise<{ challengeId?: string }>;
}) {
  const user = await currentUser();
  const metadata = user?.publicMetadata ? (user.publicMetadata as UserMetadataRecord) : {};
  const progress = getChallengeProgress(metadata);
  const requestedChallengeId = (await searchParams)?.challengeId;
  const requestedChallenge = requestedChallengeId ? getChallengeById(requestedChallengeId) : null;
  const requestedAttempt = requestedChallenge ? getLatestChallengeAttempt(metadata, requestedChallenge.id) : null;
  const allAttempts = Array.isArray(metadata.challengeAttempts)
    ? (metadata.challengeAttempts as ChallengeAttempt[])
    : [];
  const latestPassedAttempt = allAttempts
    .toReversed()
    .find((attempt) => attempt.status === "passed" && typeof attempt.challengeId === "string");
  const latestAttempt = requestedAttempt ?? latestPassedAttempt ?? getLatestChallengeAttempt(metadata);
  const challenge = requestedChallenge ?? (latestAttempt?.challengeId
    ? getChallengeById(String(latestAttempt.challengeId)) ?? CHALLENGES[0]
    : CHALLENGES[0]);
  const latestAttemptSummary = buildAttemptSummary(latestAttempt);
  const isPassed = latestAttempt?.status === "passed" || progress.completedChallengeIds.includes(challenge.id);
  const isPending = latestAttempt?.status === "pending" || !latestAttempt;
  const proofStatus = isPassed ? "Quest completed" : isPending ? "Waiting on proof" : "Attempt logged";
  const posterTitle = isPassed
    ? "Quest completed. Coat of arms unlocked."
    : isPending
      ? "Proof is warming up."
      : "Not cursed enough yet.";
  const posterCopy = isPassed
    ? `The verifier accepted the proof: ${latestAttempt?.summary ?? challenge.objective} Your ${challenge.badgeIdentity.name} coat of arms is now share-ready.`
    : latestAttempt
      ? latestAttempt.summary ?? "Latest Side Quest Chess attempt saved."
      : "Start a quest, play real chess, and Side Quest Chess turns the latest check into a shareable proof card.";
  const gameLabel = latestAttempt?.gameId ?? "latest-game-check";
  const shareCopy = isPassed
    ? `I completed “${challenge.title}” on Side Quest Chess. ${challenge.badgeIdentity.name} unlocked. ${challenge.badge} +${challenge.reward} points. Proof + coat of arms included.`
    : latestAttempt
      ? `I tried “${challenge.title}” on Side Quest Chess. ${latestAttemptSummary.headline}: ${latestAttemptSummary.detail}`
      : `I am trying “${challenge.title}” on Side Quest Chess — chess side quests for people who enjoy bad ideas.`;
  const receiptNextStep = isPassed
    ? {
        label: "Passed",
        title: "The celebration is the proof.",
        copy: "The passed state should feel like a small victory poster: unlocked coat of arms first, quest proof second, points and share actions immediately obvious.",
        action: "Share victory proof",
        href: "/result",
      }
    : isPending
      ? {
          label: "Pending",
          title: "Play one eligible public game.",
          copy: "Pending usually means SQC has not found a recent public Lichess or Chess.com game that matches this quest yet. Keep the quest active, play normally, then run the latest-game check again.",
          action: "Open My Side Quests",
          href: "/account",
        }
      : {
          label: "Failed",
          title: "The receipt should explain why.",
          copy: "A failed receipt is still useful: it should point back to the exact quest rule that did not land, then make the next attempt feel obvious instead of mysterious.",
          action: "Review quest rule",
          href: `/challenges/${challenge.id}`,
        };

  return (
    <main className="site-shell">
      <SiteNav isSignedIn={Boolean(user)} active="result" />

      <div className="content-wrap">
        <section className="hero-grid">
          <article className={isPassed ? "result-poster completion-poster" : "result-poster"}>
            <div className="eyebrow" style={{ color: "#140d0d", background: "rgba(20,13,13,.12)" }}>
              {isPassed ? "Side Quest Chess victory proof" : "Side Quest Chess proof"}
            </div>
            {isPassed ? <div className="completion-stamp">Quest complete</div> : null}
            <h1>{posterTitle}</h1>
            <p>{posterCopy}</p>
            <div className="completion-coat-stage">
              <ChallengeBadge challenge={challenge} size="hero" earned={isPassed} />
            </div>
            <div className="proof-grid">
              <Fact label="Quest" value={challenge.title} />
              <Fact label="Status" value={proofStatus} />
              <Fact label="Game" value={gameLabel} />
              <Fact label="Points" value={isPassed ? `+${challenge.reward}` : `${progress.totalRewardPoints} banked`} />
            </div>
            <strong>{isPassed ? `Coat unlocked: ${challenge.badgeIdentity.name}.` : `Badge target: ${challenge.badgeIdentity.name}.`}</strong>
            <p>{challenge.badgeIdentity.heraldry.meaning} {challenge.badgeIdentity.heraldry.weirdness}</p>
          </article>

          <aside className={isPassed ? "mission-card completion-share-panel" : "mission-card"}>
            <span className="eyebrow">{isPassed ? "Shareable celebration" : "Live proof card"}</span>
            <h2>{isPassed ? "The coat of arms is the headline." : "The result now follows your latest check."}</h2>
            <p>
              {isPassed
                ? "When a quest completes, the result should lead with the unlocked coat of arms and package it with the proof, points, and one-tap sharing."
                : "This screen turns the latest saved quest check into the product’s core loop: honest status, clear next action, badge progress, and share copy when the proof lands."}
            </p>
            <div className="button-row">
              <Link href="/account" className="button primary">Open My Side Quests</Link>
              <Link href={`/challenges/${challenge.id}`} className="button secondary">View quest rules</Link>
            </div>
          </aside>
        </section>

        <section className="mission-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">Receipt next step</span>
              <h2>{receiptNextStep.title}</h2>
            </div>
            <span className={isPassed ? "badge green" : isPending ? "badge blue" : "badge gold"}>
              {receiptNextStep.label}
            </span>
          </div>
          <p>{receiptNextStep.copy}</p>
          <div className="checker-flow" aria-label="Latest receipt interpretation guide">
            <div className={isPassed ? "flow-step ready" : "flow-step"}>
              <strong>Passed</strong>
              <p>Share proof, bank the badge, and invite someone else.</p>
            </div>
            <div className={!isPassed && !isPending ? "flow-step hot" : "flow-step"}>
              <strong>Failed</strong>
              <p>Use the rule callout to understand exactly what missed.</p>
            </div>
            <div className={isPending ? "flow-step hot" : "flow-step"}>
              <strong>Pending</strong>
              <p>Play or expose a recent eligible public game, then check again.</p>
            </div>
          </div>
          <div className="button-row">
            <Link href={receiptNextStep.href} className="button primary">{receiptNextStep.action}</Link>
            <Link href="/support" className="button pink">Report confusing receipt</Link>
            <Link href="/proof-log" className="button secondary">Open proof log</Link>
          </div>
        </section>

        <section className="mission-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">Beta support shortcut</span>
              <h2>If the receipt feels unfair, capture the useful details.</h2>
            </div>
            <span className="badge blue">quest + game link</span>
          </div>
          <p>
            Private-beta testers now have a direct path from the latest receipt to the support packet, so wrong or confusing pass/fail/pending outcomes can be reported with the quest, provider, username, game link, and expected result.
          </p>
          <div className="button-row">
            <Link href="/support" className="button primary">Open support packet</Link>
            <Link href={`/challenges/${challenge.id}`} className="button secondary">Recheck quest rules</Link>
          </div>
        </section>

        <section className="big-grid">
          <article className={isPassed ? "mission-card share-card victory-share-card" : "mission-card share-card"}>
            <span className="eyebrow">{isPassed ? "Share the unlock" : "Share copy"}</span>
            <h2>{isPassed ? `${challenge.badgeIdentity.name} is unlocked.` : `I tried “${challenge.title}.”`}</h2>
            {isPassed ? <ChallengeBadge challenge={challenge} presentation="art" earned /> : null}
            <p>{shareCopy}</p>
            <ShareProofActions
              copy={shareCopy}
              challengeTitle={challenge.title}
              copyLabel={isPassed ? "Copy victory proof" : "Copy receipt"}
              shareLabel={isPassed ? "Share victory proof" : "Share quest"}
              idleCopy={isPassed
                ? "Copies the victory line plus the proof-card link, so the unlocked coat of arms travels with the completed quest."
                : "Copies the current result text plus this proof-card link. No PGN upload, no homework."
              }
            />
          </article>
          <article className="mission-card share-card">
            <span className="eyebrow">Send the next quest</span>
            <h2>Turn this receipt into the next bad decision.</h2>
            <p>
              After a pass, fail, or pending check, send the exact same quest to a friend so the loop continues with a quest-specific invite instead of a generic homepage pitch.
            </p>
            <ChallengeInviteActions
              challengeTitle={challenge.title}
              challengeObjective={challenge.objective}
              challengePath={`/dare/${challenge.id}`}
              reward={challenge.reward}
              badgeName={challenge.badgeIdentity.name}
            />
          </article>
          <article className="mission-card">
            <span className="eyebrow">Latest check</span>
            <h2>{latestAttemptSummary.headline}</h2>
            <p>{latestAttemptSummary.detail}</p>
            <p className="muted">{latestAttemptSummary.meta}</p>
            <Link href="/challenges" className="button pink">Try another quest</Link>
          </article>
        </section>

        <section className="mission-card beta-template-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">Launch loop</span>
              <h2>From receipt to next quest in one screen.</h2>
            </div>
            <Link href="/share-kit" className="button secondary">Share a quest</Link>
          </div>
          <p>
            The result page now points every state toward the real SQC loop: passed receipts become shareable proof, failed receipts explain the rule miss, and pending receipts send players back to a clean latest-game check.
          </p>
          <div className="checker-flow" aria-label="Receipt to next quest loop">
            <div className="flow-step ready">
              <strong>Share</strong>
              <p>Copy the proof when the quest lands.</p>
            </div>
            <div className="flow-step hot">
              <strong>Retry</strong>
              <p>Use failed or pending receipts as the next-attempt guide.</p>
            </div>
            <div className="flow-step ready">
              <strong>Continue</strong>
              <p>Pick another quest from the full hub or choose a different level of chaos.</p>
            </div>
          </div>
          <div className="button-row">
            <Link href="/challenges" className="button primary">Browse quests</Link>
            <Link href="/challenges" className="button secondary">Browse quests</Link>
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
