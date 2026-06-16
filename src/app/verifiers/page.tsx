import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import ChallengeBadge from "@/components/challenge-badge";
import RatingPill from "@/components/rating-pill";
import SiteNav from "@/components/site-nav";
import { CHALLENGES, type Challenge } from "@/lib/challenges";
import { getVerifierStateLabel, getVerifierStatus } from "@/lib/verifier-status";

export const metadata: Metadata = {
  title: "Verifier status — Side Quest Chess",
  description:
    "See which Side Quest Chess quests have live-backed proof, which checker paths are ready, and how each quest will be checked from real games.",
  openGraph: {
    title: "Verifier status — Side Quest Chess",
    description:
      "The public verifier board for Side Quest Chess: live-backed proof, clear checker status, and honest pending states for every weird chess quest.",
    url: "/verifiers",
  },
};

export default async function VerifiersPage() {
  const { userId } = await auth();
  const liveStatuses = CHALLENGES.map((challenge) => getVerifierStatus(challenge));
  const liveCount = liveStatuses.filter((status) => status.state === "live").length;
  const dualHostCount = liveStatuses.filter((status) => status.summary.includes("Lichess + Chess.com")).length;
  const lichessOnlyCount = liveStatuses.filter((status) => status.summary.includes("Lichess latest-game")).length;
  const parityLabel = lichessOnlyCount === 0 ? "Full deck parity" : "Lichess-only next";
  const parityValue = lichessOnlyCount === 0 ? "0 left" : `${lichessOnlyCount} quests`;
  const parityCopy =
    lichessOnlyCount === 0
      ? "Every current quest now has dual-host latest-game checking for both Lichess and Chess.com."
      : "The remaining live-backed quests are honest Lichess checks first, with Chess.com parity queued after launch-flow hardening.";

  return (
    <main className="site-shell">
      <SiteNav isSignedIn={Boolean(userId)} active="verifiers" />

      <div className="content-wrap">
        <section className="hero-card">
          <span className="eyebrow">Verifier board</span>
          <h1>Every weird quest needs an honest receipt.</h1>
          <p className="hero-copy">
            This board shows which Side Quests can be checked from real public games, what SQC looks for, and where to open the next run. No fake glory, no manual uploads, no engine-dashboard drift.
          </p>
          <div className="button-row hero-actions">
            <Link href="/account" className="button primary">Open My Side Quests</Link>
            <Link href="/rules" className="button secondary">Read proof rules</Link>
            <Link href="/challenges" className="button secondary">Browse Solo Side Quests</Link>
          </div>
        </section>

        <section className="grid" aria-label="Verifier summary">
          <Fact label="Live verifiers" value={`${liveCount} quests`} copy="Every current quest now has an automated latest-game verifier with a clear public-game proof path." />
          <Fact label="Dual-host coverage" value={`${dualHostCount} quests`} copy="Every current quest can read either Lichess UCI evidence or Chess.com PGN evidence today." />
          <Fact label={parityLabel} value={parityValue} copy={parityCopy} />
        </section>

        <section className="mission-card" aria-label="How to use the verifier board">
          <div className="section-head">
            <div>
              <span className="eyebrow">How to use this board</span>
              <h2>Check the promise before you choose the run.</h2>
            </div>
            <span className="badge blue">real-game proof</span>
          </div>
          <div className="checker-flow">
            <div className="flow-step ready">
              <strong>1. Pick a Side Quest</strong>
              <p>Open a quest with a live verifier and make sure the rule sounds fun enough to play now.</p>
            </div>
            <div className="flow-step ready">
              <strong>2. Play on Lichess or Chess.com</strong>
              <p>Use a public standard game so SQC can read the moves without asking for passwords or uploads.</p>
            </div>
            <div className="flow-step hot">
              <strong>3. Keep the receipt</strong>
              <p>Return for the check, then share the proof board when the run passes.</p>
            </div>
          </div>
        </section>

        <section className="big-grid" aria-label="Quest deck verifier statuses">
          {CHALLENGES.map((challenge) => (
            <VerifierCard challenge={challenge} key={challenge.id} />
          ))}
        </section>
      </div>
    </main>
  );
}

function VerifierCard({ challenge }: { challenge: Challenge }) {
  const status = getVerifierStatus(challenge);
  const state = getVerifierStateLabel(status);

  return (
    <article className="mission-card challenge-card">
      <div className="card-meta">
        <span>{challenge.category}</span>
      </div>
      <ChallengeBadge challenge={challenge} />
      <h2>{challenge.title}</h2>
      <p>{challenge.objective}</p>
      <div className="proof-line">{status.summary}</div>
      <div className="note-card">
        <strong>What SQC checks</strong>
        <p>{status.evidence}</p>
      </div>
      <div className="note-card">
        <strong>{challenge.proofCallout}</strong>
        <p>{state.promise}</p>
      </div>
      <div className="card-footer">
        <RatingPill value={challenge.reward} />
        <Link href={`/challenges/${challenge.id}`}>Open quest</Link>
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
