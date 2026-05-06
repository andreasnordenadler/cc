import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import ChallengeBadge from "@/components/challenge-badge";
import ProofPositionBoard from "@/components/proof-position-board";
import ShareProofActions from "@/components/share-proof-actions";
import SiteNav from "@/components/site-nav";
import { CHALLENGES } from "@/lib/challenges";
import {
  buildAttemptSummary,
  formatAttemptStatus,
  getActiveChallenge,
  getChallengeAttempts,
  getChallengeProgress,
  type ChallengeAttempt,
  type UserMetadataRecord,
} from "@/lib/user-metadata";

const receiptExamples = [
  {
    status: "Passed",
    tone: "green",
    title: "Badge proof is brag-ready",
    copy: "A passed receipt names the quest, badge, points, and exact next action so a friend can understand the proof without reading the whole rules page.",
    action: "Copy, share, or quest back",
  },
  {
    status: "Failed",
    tone: "danger",
    title: "The miss should be obvious",
    copy: "A failed receipt still helps: it should point at the rule that did not land, then send the player back to the same quest with a cleaner next attempt.",
    action: "Review the rule and retry",
  },
  {
    status: "Pending",
    tone: "gold",
    title: "No mystery dead-end",
    copy: "A pending receipt explains whether SQC needs a saved username, a public eligible game, or another latest-game check after the next real match.",
    action: "Fix preflight, then check again",
  },
];

export default async function ProofLogPage() {
  const { userId } = await auth();
  const user = userId ? await currentUser() : null;
  const metadata = user?.publicMetadata ? (user.publicMetadata as UserMetadataRecord) : {};
  const attempts = getChallengeAttempts(metadata).toReversed();
  const progress = getChallengeProgress(metadata);
  const activeChallenge = getActiveChallenge(metadata);
  const checkLatestHref = activeChallenge?.id ? `/challenges/${activeChallenge.id}` : "/challenges";

  return (
    <main className="site-shell">
      <SiteNav isSignedIn={Boolean(userId)} active="proof-log" />

      <div className="content-wrap">
        <section className="hero-card">
          <span className="eyebrow">Proof log</span>
          <h1>Your side-quest receipts.</h1>
          <p className="hero-copy">
            Every latest-game check becomes a receipt here: passed, failed, or still pending. No manual uploads, no engine lecture — just a running record of the bad ideas Side Quest Chess has judged.
          </p>
          <div className="button-row hero-actions">
            <Link href={checkLatestHref} className="button primary">Check latest games</Link>
            <Link href={activeChallenge?.id ? `/result?challengeId=${activeChallenge.id}` : "/result"} className="button secondary">Open share card</Link>
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
              Accept a side quest, connect your chess identity, play a normal game elsewhere, then use My Side Quests. Your first receipt will appear here once Side Quest Chess has something to judge.
            </p>
            <div className="button-row hero-actions">
              <Link href="/challenges" className="button primary">Browse quests</Link>
              <Link href="/random" className="button pink">Spin a bad idea</Link>
              <Link href="/connect" className="button secondary">Connect account</Link>
            </div>
          </section>
        )}

        <section className="mission-card" aria-label="Proof receipt examples">
          <div className="section-head">
            <div>
              <span className="eyebrow">Receipt states</span>
              <h2>Every proof check should tell testers what to do next.</h2>
            </div>
            <span className="badge blue">beta clarity</span>
          </div>
          <p>
            Friends/private beta testers should never have to decode a verifier result. The proof log now previews the three receipt states before a player has history, then saved receipts use the same pass/fail/pending next-step logic once real checks land.
          </p>
          <div className="checker-flow" aria-label="Pass fail pending receipt examples">
            {receiptExamples.map((item) => (
              <article key={item.status} className={item.status === "Passed" ? "flow-step ready" : item.status === "Failed" ? "flow-step hot" : "flow-step"}>
                <span className={`badge ${item.tone}`}>{item.status}</span>
                <strong>{item.title}</strong>
                <p>{item.copy}</p>
                <p className="proof-line">{item.action}</p>
              </article>
            ))}
          </div>
          <div className="button-row hero-actions">
            <Link href="/account" className="button primary">Open My Side Quests</Link>
            <Link href="/support" className="button secondary">Report confusing receipt</Link>
          </div>
        </section>
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
  const nextStep =
    status === "passed"
      ? {
          label: "Share or quest back",
          copy: "This receipt is brag-ready. Copy it, then send the same quest to someone who deserves worse chess decisions.",
          primaryLabel: "Open victory proof",
          primaryHref: `/result?challengeId=${challenge.id}`,
          secondaryLabel: "Send this quest",
          secondaryHref: `/dare/${challenge.id}`,
        }
      : status === "failed"
        ? {
            label: "Check whether the miss feels fair",
            copy: "Failed receipts should make the missed rule obvious. If this one feels wrong, capture it with the support packet before the game context disappears.",
            primaryLabel: "Review rules",
            primaryHref: `/challenges/${challenge.id}`,
            secondaryLabel: "Report confusing receipt",
            secondaryHref: "/support",
          }
        : {
            label: "Create a clearer latest-game check",
            copy: "Pending receipts usually need one eligible public game or a saved chess username. Fix the preflight, then come back to refresh the receipt.",
            primaryLabel: "Check My Side Quests preflight",
            primaryHref: "/account",
            secondaryLabel: "Open support packet",
            secondaryHref: "/support",
          };

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
      {status === "passed" ? (
        <ProofPositionBoard
          attempt={attempt}
          challenge={challenge}
        />
      ) : null}
      <div className="note-card">
        <strong>{nextStep.label}</strong>
        <p>{nextStep.copy}</p>
        <div className="button-row">
          <Link href={nextStep.primaryHref} className="button secondary">{nextStep.primaryLabel}</Link>
          <Link href={nextStep.secondaryHref} className="button secondary">{nextStep.secondaryLabel}</Link>
        </div>
      </div>
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
