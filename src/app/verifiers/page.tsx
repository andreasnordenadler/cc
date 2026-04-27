import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import ChallengeBadge from "@/components/challenge-badge";
import SiteNav from "@/components/site-nav";
import { CHALLENGES, type Challenge } from "@/lib/challenges";

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

type VerifierState = "live" | "next" | "spec";

const verifierStatusByChallenge: Record<string, { state: VerifierState; summary: string; evidence: string }> = {
  "queen-never-heard-of-her": {
    state: "live",
    summary: "Live-backed Lichess latest-game verifier",
    evidence:
      "Checks queen loss before move 15, opponent queen still present, legal time class, standard chess, minimum game length, and player win.",
  },
  "no-castle-club": {
    state: "next",
    summary: "Next provider adapter target",
    evidence:
      "Needs move-history normalization that proves a win without kingside or queenside castling for the player.",
  },
  "the-blunder-gambit": {
    state: "spec",
    summary: "Rule spec ready; material-loss detector queued",
    evidence:
      "Will need early material swing evidence before move 10 plus final result checks, without engine scoring.",
  },
  "pawn-storm-maniac": {
    state: "spec",
    summary: "Rule spec ready; pawn-move counter queued",
    evidence:
      "Will count distinct pawn moves before move 15 and combine that with a normal-game win receipt.",
  },
  "knightmare-mode": {
    state: "spec",
    summary: "Rule spec ready; mate-piece detector queued",
    evidence:
      "Will identify the final checking move and prove the knight delivered mate rather than merely appearing nearby.",
  },
  "rookless-rampage": {
    state: "spec",
    summary: "Rule spec ready; rook-loss timeline queued",
    evidence:
      "Will prove both rooks disappeared before move 20 while the final receipt still records a player win.",
  },
  "one-bishop-to-rule-them-all": {
    state: "spec",
    summary: "Rule spec ready; bishop-survival detector queued",
    evidence:
      "Will prove only one bishop remained after move 12 and that the surviving bishop stayed on board through victory.",
  },
};

const stateLabels: Record<VerifierState, { label: string; className: string; promise: string }> = {
  live: {
    label: "Live-backed",
    className: "badge success",
    promise: "Can create an honest pass/fail/pending receipt from a connected Lichess username today.",
  },
  next: {
    label: "Next adapter",
    className: "badge gold",
    promise: "Rules are product-ready; the next implementation step is provider move-data normalization.",
  },
  spec: {
    label: "Specified",
    className: "badge",
    promise: "Shown as a clear product contract now, not as a fake automated success claim.",
  },
};

export default async function VerifiersPage() {
  const { userId } = await auth();
  const liveCount = CHALLENGES.filter((challenge) => verifierStatusByChallenge[challenge.id]?.state === "live").length;
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
          <Fact label="Live verifier" value={`${liveCount} quest`} copy="Queen? Never Heard of Her already uses deterministic rules and Lichess latest-game evidence." />
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
  const status = verifierStatusByChallenge[challenge.id] ?? verifierStatusByChallenge["the-blunder-gambit"];
  const state = stateLabels[status.state];

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
