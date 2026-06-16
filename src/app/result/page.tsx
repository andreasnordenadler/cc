import type { ReactNode } from "react";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import ChallengeBadge from "@/components/challenge-badge";
import ChallengeInviteActions from "@/components/challenge-invite-actions";
import ProofImage from "@/components/proof-image";
import ProofTime from "@/components/proof-time";
import RatingPill from "@/components/rating-pill";
import ShareProofActions from "@/components/share-proof-actions";
import SiteNav from "@/components/site-nav";
import { CHALLENGES, getChallengeById } from "@/lib/challenges";
import { buildPublicProofPath, publicProofImagePath } from "@/lib/proof-share";
import {
  buildAttemptSummary,
  getChallengeProgress,
  getLatestChallengeAttempt,
  isSyntheticLatestGameReceipt,
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
  const scrollAchievement = buildVictoryScrollCopy(challenge, latestAttempt);
  const publicProofPath = isPassed
    ? await buildPublicProofPath({
        attempt: latestAttempt,
        challenge,
        runnerName: user?.firstName ?? user?.username ?? undefined,
      })
    : "/result";
  const publicProofToken = publicProofPath.split("/").at(-1) ?? "";
  const receiptNextStep = isPassed
    ? {
        label: "Passed",
        title: "Share the coat, then pick the next run.",
        copy: "Your coat of arms, quest proof, points, and share link are ready. Send the receipt as-is or jump straight into another Solo Side Quest.",
        action: "Share victory proof",
        href: "/result",
      }
    : isPending
      ? {
          label: "Pending",
          title: "Play one eligible public game.",
          copy: "SQC has not found a recent public Lichess or Chess.com game that matches this quest yet. Keep the quest active, play normally, then run the latest-game check again.",
          action: "Open My Side Quests",
          href: "/account",
        }
      : {
          label: "Failed",
          title: "Use the miss as your next-run clue.",
          copy: "The receipt shows which quest rule did not land. Review the rule, play another eligible game, and check again when the run is ready.",
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
              <Fact label="Points" value={isPassed ? <RatingPill value={challenge.reward} /> : <RatingPill value={progress.totalRewardPoints} plus={false} ariaLabel={`${progress.totalRewardPoints} banked rating points`} />} />
            </div>
            <strong>{isPassed ? `Coat unlocked: ${challenge.badgeIdentity.name}.` : `Badge target: ${challenge.badgeIdentity.name}.`}</strong>
            <p>{challenge.badgeIdentity.heraldry.meaning} {challenge.badgeIdentity.heraldry.weirdness}</p>
          </article>

          <aside className={isPassed ? "mission-card completion-share-panel" : "mission-card"}>
            <span className="eyebrow">{isPassed ? "Victory receipt" : "Proof receipt"}</span>
            <h2>{isPassed ? "Your coat of arms is ready to show." : "Your latest check is saved here."}</h2>
            <p>
              {isPassed
                ? "The receipt keeps the unlocked coat, proof summary, points, and sharing tools together so your win is easy to keep or send."
                : "Use this receipt to see the current quest status, the game SQC checked, and the next action to take before trying again."}
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
            <Link href="/account" className="button secondary">Open My Side Quests</Link>
          </div>
        </section>

        <section className="mission-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">Support shortcut</span>
              <h2>If the receipt feels unfair, capture the useful details.</h2>
            </div>
            <span className="badge blue">quest + game link</span>
          </div>
          <p>
            If a pass, fail, or pending receipt looks wrong, send the useful details: quest, provider, username, game link, what SQC showed, and what you expected.
          </p>
          <div className="button-row">
            <Link href="/support" className="button primary">Open support packet</Link>
            <Link href={`/challenges/${challenge.id}`} className="button secondary">Recheck quest rules</Link>
          </div>
        </section>

        <section className="big-grid">
          <article className={isPassed ? "mission-card share-card victory-share-card" : "mission-card share-card"}>
            <span className="eyebrow">{isPassed ? "Share the good news" : "Share copy"}</span>
            <h2>{isPassed ? "A small official notice of questionable glory." : `I tried “${challenge.title}.”`}</h2>
            {isPassed ? (
              <ProofImage
                imagePath={publicProofImagePath(publicProofToken)}
                alt={`Victory scroll image for ${challenge.title}`}
                className="proof-generated-image victory-scroll-image"
              />
            ) : (
              <p>{shareCopy}</p>
            )}
            <ShareProofActions
              copy={isPassed ? `${scrollAchievement} ${challenge.badgeIdentity.name} unlocked. +${challenge.reward} points.` : shareCopy}
              challengeTitle={challenge.title}
              sharePath={isPassed ? publicProofPath : "/result"}
              imagePath={isPassed ? publicProofImagePath(publicProofToken) : undefined}
              shareLabel={isPassed ? "Share proof" : "Share quest"}
            />
          </article>
          <article className="mission-card share-card">
            <span className="eyebrow">Send the next quest</span>
            <h2>Turn this receipt into the next bad decision.</h2>
            <p>
              After a pass, fail, or pending check, send the exact same quest to a friend so the challenge continues with a quest-specific invite instead of a generic homepage pitch.
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
            <p className="muted">
              {latestAttempt ? <ReceiptMeta attempt={latestAttempt} gameLabel={gameLabel} /> : latestAttemptSummary.meta}
            </p>
            <Link href="/challenges" className="button pink">Try another quest</Link>
          </article>
        </section>

        <section className="mission-card beta-template-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">Receipt guide</span>
              <h2>Turn this check into the next good move.</h2>
            </div>
            <Link href="/share-kit" className="button secondary">Share a quest</Link>
          </div>
          <p>
            Every proof receipt has a clear next step: share the win when it lands, retry from the rule clue when it misses, or play one more eligible public game when SQC is still waiting.
          </p>
          <div className="checker-flow" aria-label="Receipt to next quest path">
            <div className="flow-step ready">
              <strong>Share</strong>
              <p>Copy the proof when the quest lands.</p>
            </div>
            <div className="flow-step hot">
              <strong>Retry</strong>
              <p>Use failed or pending receipts as the next-run guide.</p>
            </div>
            <div className="flow-step ready">
              <strong>Continue</strong>
              <p>Pick another Solo Side Quest or find a shared Multiplayer table.</p>
            </div>
          </div>
          <div className="button-row">
            <Link href="/challenges" className="button primary">Browse Solo Side Quests</Link>
            <Link href="/groupquests/public" className="button secondary">Find Multiplayer tables</Link>
          </div>
        </section>
      </div>
    </main>
  );
}

function buildVictoryScrollCopy(challenge: (typeof CHALLENGES)[number], attempt?: ChallengeAttempt | null) {
  const summary = attempt?.summary ?? challenge.objective;

  if (challenge.id === "finish-any-game") {
    return "A public chess game was, against all odds, completed. Win, loss, or draw — the clerks checked the paperwork and declared this good enough for a coat of arms.";
  }

  if (challenge.requirement.result === "win") {
    return `${summary} The important part is that the bad idea survived contact with reality and still ended in victory, which frankly feels like a paperwork error.`;
  }

  if (challenge.requirement.result === "draw") {
    return `${summary} Nobody won, nobody learned, and yet the scroll department has approved the achievement.`;
  }

  if (challenge.requirement.result === "lose") {
    return `${summary} Losing on purpose-adjacent terms is still proof, and Side Quest Chess respects commitment to the bit.`;
  }

  return `${summary} The verifier accepted the evidence, so the coat of arms may now be displayed with entirely appropriate smugness.`;
}

function Fact({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="fact">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ReceiptMeta({ attempt, gameLabel }: { attempt: ChallengeAttempt; gameLabel: string }) {
  const isSyntheticStatus = isSyntheticLatestGameReceipt(attempt);
  const playedAt = isSyntheticStatus ? undefined : attempt.startedGameAt ?? attempt.completedGameAt;

  return (
    <>
      {isSyntheticStatus ? "No post-start game found yet" : gameLabel ? `Game ${gameLabel}` : "Game ID missing"}
      {playedAt ? <> • Game played <ProofTime value={playedAt} /></> : null}
      <> • Receipt updated <ProofTime value={attempt.checkedAt} /></>
    </>
  );
}
