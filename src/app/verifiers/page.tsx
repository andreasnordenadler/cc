import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import ChallengeBadge from "@/components/challenge-badge";
import SiteNav from "@/components/site-nav";
import { CHALLENGES, type Challenge } from "@/lib/challenges";
import { getVerifierStateLabel, getVerifierStatus } from "@/lib/verifier-status";

export const metadata: Metadata = {
  title: "Verifier status — Side Quest Chess",
  description:
    "See which Side Quest Chess dares have live-backed proof, which verifiers are next, and how each starter challenge will be checked from real games.",
  openGraph: {
    title: "Verifier status — Side Quest Chess",
    description:
      "The public verifier board for Side Quest Chess: live-backed proof, next adapters, and honest pending states for every weird chess dare.",
    url: "/verifiers",
  },
};

export default async function VerifiersPage() {
  const { userId } = await auth();
  const liveCount = CHALLENGES.filter((challenge) => getVerifierStatus(challenge).state === "live").length;
  const queuedCount = CHALLENGES.length - liveCount;

  return (
    <main className="site-shell">
      <SiteNav isSignedIn={Boolean(userId)} active="verifiers" />

      <div className="content-wrap">
        <section className="hero-card">
          <span className="eyebrow">Verifier board</span>
          <h1>Every weird dare needs an honest receipt.</h1>
          <p className="hero-copy">
            This board separates what Side Quest Chess can verify live from what is still a public rule contract. No fake glory, no PGN homework, no engine-dashboard drift.
          </p>
          <div className="button-row hero-actions">
            <Link href="/account" className="button primary">Run the live checker</Link>
            <Link href="/rules" className="button secondary">Read proof rules</Link>
            <Link href="/proof-log" className="button secondary">Open proof log</Link>
          </div>
        </section>

        <section className="grid" aria-label="Verifier summary">
          <Fact label="Live verifier" value={`${liveCount} quest`} copy="No Castle Club now has the first dual-host latest-game path: Lichess UCI or Chess.com PGN evidence." />
          <Fact label="Queued specs" value={`${queuedCount} quests`} copy="The rest of the starter deck has explicit rule contracts before implementation, so receipts stay honest." />
          <Fact label="Proof promise" value="No fake wins" copy="Failed or pending checks are product states, not embarrassing errors to hide." />
        </section>

        <section className="big-grid" aria-label="Starter deck verifier statuses">
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
        <span className={state.className}>{state.label}</span>
      </div>
      <ChallengeBadge challenge={challenge} />
      <h2>{challenge.title}</h2>
      <p>{challenge.objective}</p>
      <div className="proof-line">{status.summary}</div>
      <p>{status.evidence}</p>
      <div className="note-card">
        <strong>{challenge.proofCallout}</strong>
        <p>{state.promise}</p>
      </div>
      <div className="card-footer">
        <strong>+{challenge.reward} pts</strong>
        <Link href={`/challenges/${challenge.id}`}>Open rules</Link>
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
