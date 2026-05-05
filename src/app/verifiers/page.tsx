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
    "See which Side Quest Chess quests have live-backed proof, which verifiers are next, and how each quest will be checked from real games.",
  openGraph: {
    title: "Verifier status — Side Quest Chess",
    description:
      "The public verifier board for Side Quest Chess: live-backed proof, next adapters, and honest pending states for every weird chess quest.",
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
      : "The remaining live-backed quests are honest Lichess checks first, with Chess.com parity queued after beta-flow hardening.";

  return (
    <main className="site-shell">
      <SiteNav isSignedIn={Boolean(userId)} active="verifiers" />

      <div className="content-wrap">
        <section className="hero-card">
          <span className="eyebrow">Verifier board</span>
          <h1>Every weird quest needs an honest receipt.</h1>
          <p className="hero-copy">
            This board separates what Side Quest Chess can verify live from what is still a public rule contract. No fake glory, no manual uploads, no engine-dashboard drift.
          </p>
          <div className="button-row hero-actions">
            <Link href="/account" className="button primary">Open My Quest Log</Link>
            <Link href="/rules" className="button secondary">Read proof rules</Link>
            <Link href="/proof-log" className="button secondary">Open proof log</Link>
          </div>
        </section>

        <section className="grid" aria-label="Verifier summary">
          <Fact label="Live verifiers" value={`${liveCount} quests`} copy="Every current quest now has an automated latest-game verifier instead of a fake-success or upload-your-PGN workaround." />
          <Fact label="Dual-host coverage" value={`${dualHostCount} quests`} copy="Every current quest can read either Lichess UCI evidence or Chess.com PGN evidence today." />
          <Fact label={parityLabel} value={parityValue} copy={parityCopy} />
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
