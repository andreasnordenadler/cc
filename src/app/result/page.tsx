import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import ChallengeBadge from "@/components/challenge-badge";
import ChallengeInviteActions from "@/components/challenge-invite-actions";
import ShareProofActions from "@/components/share-proof-actions";
import SiteNav from "@/components/site-nav";
import { CHALLENGES, getChallengeById } from "@/lib/challenges";
import { buildPublicProofPath, publicProofImagePath } from "@/lib/proof-share";
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
  const scrollAchievement = buildVictoryScrollCopy(challenge, latestAttempt);
  const scrollDate = formatScrollDate(latestAttempt?.completedGameAt ?? latestAttempt?.checkedAt);
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
                : "This screen turns the latest saved quest check into the product’s core ritual: honest status, clear next action, badge progress, and share copy when the proof lands."}
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
            <span className="eyebrow">{isPassed ? "Share the good news" : "Share copy"}</span>
            <h2>{isPassed ? "A small official notice of questionable glory." : `I tried “${challenge.title}.”`}</h2>
            {isPassed ? (
              <div className="victory-scroll" aria-label={`Victory scroll for ${challenge.title}`}>
                <div className="victory-scroll-burn top-left" aria-hidden="true" />
                <div className="victory-scroll-burn top-right" aria-hidden="true" />
                <div className="victory-scroll-crest">
                  <ChallengeBadge challenge={challenge} presentation="art" earned />
                </div>
                <span className="victory-scroll-kicker">Side Quest Chess hereby admits</span>
                <h3>{challenge.badgeIdentity.name}</h3>
                <p className="victory-scroll-copy">{scrollAchievement}</p>
                <p className="victory-scroll-proof">
                  Proof accepted for <strong>{challenge.title}</strong>. {latestAttempt?.gameId ? `Game ${latestAttempt.gameId}.` : "Verifier receipt saved."}
                </p>
                <div className="victory-scroll-footer">
                  <span>{scrollDate}</span>
                  <span>+{challenge.reward} pts</span>
                </div>
                <div className="victory-scroll-seal" aria-label="Side Quest Chess seal of approval" />
              </div>
            ) : (
              <p>{shareCopy}</p>
            )}
            <ShareProofActions
              copy={isPassed ? `${scrollAchievement} ${challenge.badgeIdentity.name} unlocked. +${challenge.reward} points.` : shareCopy}
              challengeTitle={challenge.title}
              sharePath={isPassed ? "/" : "/result"}
              imagePath={isPassed ? publicProofImagePath(publicProofToken) : undefined}
              shareLabel={isPassed ? "Share" : "Share quest"}
              idleCopy={isPassed
                ? "Shares the victory scroll image with a Side Quest Chess link."
                : "Shares the current result text plus this proof-card link. No PGN upload, no homework."
              }
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
            <p className="muted">{latestAttemptSummary.meta}</p>
            <Link href="/challenges" className="button pink">Try another quest</Link>
          </article>
        </section>

        <section className="mission-card beta-template-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">Quest path</span>
              <h2>From receipt to next quest in one screen.</h2>
            </div>
            <Link href="/share-kit" className="button secondary">Share a quest</Link>
          </div>
          <p>
            The result page now points every state toward the next useful step: passed receipts become shareable proof, failed receipts explain the rule miss, and pending receipts send players back to a clean latest-game check.
          </p>
          <div className="checker-flow" aria-label="Receipt to next quest path">
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

function formatScrollDate(value?: string) {
  if (!value) return "Recorded by the suspicious little verifier";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recorded by the suspicious little verifier";

  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="fact">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
