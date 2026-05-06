import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import SiteNav from "@/components/site-nav";
import { CHALLENGES } from "@/lib/challenges";

export const metadata: Metadata = {
  title: "How proof works — Side Quest Chess",
  description:
    "The Side Quest Chess rulebook explains how weird chess quests are verified from real Lichess and Chess.com games without manual uploads or engine dashboards.",
  openGraph: {
    title: "How proof works — Side Quest Chess",
    description:
      "Pick a weird quest, play normal games, and let Side Quest Chess look for proof-worthy evidence.",
    url: "/rules",
  },
};

const proofSteps = [
  {
    title: "Pick a quest",
    copy: "Choose a side quest with clear rules, a badge, and a reward. The joke can be stupid; the success condition still has to be precise.",
  },
  {
    title: "Play real chess",
    copy: "Use Lichess or Chess.com like normal. Side Quest Chess is not a replacement board, a manual-upload chore, or an engine-analysis dashboard.",
  },
  {
    title: "Check the latest games",
    copy: "When you ask for proof, SQC reads your connected username’s recent public games and looks for the quest-specific evidence.",
  },
  {
    title: "Share the receipt",
    copy: "Passed, failed, and pending attempts stay honest, then become proof cards and completed side-quest records you can copy or share.",
  },
];

const verifierStatuses = [
  {
    label: "Automated now",
    title: "Queen? Never Heard of Her",
    copy: "The canonical quest already has a deterministic rule checker plus Lichess latest-game normalization for queen loss before move 15, opponent queen present, legal time classes, and a win.",
  },
  {
    label: "Next verifier shape",
    title: "No Castle Club",
    copy: "The next adapter should prove a win with no castling from provider move data. Same pattern: narrow game shape first, provider adapter second.",
  },
  {
    label: "Product contract",
    title: "No fake glory",
    copy: "If the evidence is missing or the game fails the rules, SQC should say so. Failed side quests are still funny receipts, not hidden errors.",
  },
];

export default async function RulesPage() {
  const { userId } = await auth();
  const totalReward = CHALLENGES.reduce((sum, challenge) => sum + challenge.reward, 0);
  const canonicalChallenge = CHALLENGES[0];

  return (
    <main className="site-shell">
      <SiteNav isSignedIn={Boolean(userId)} active="rules" />

      <div className="content-wrap">
        <section className="hero-card">
          <span className="eyebrow">SQC rulebook</span>
          <h1>Funny quests. Serious receipts.</h1>
          <p className="hero-copy">
            Side Quest Chess only works if the proof feels trustworthy. The rulebook keeps the path explicit: choose a weird objective, play real games elsewhere, then let SQC verify the receipt without turning into homework.
          </p>
          <div className="button-row hero-actions">
            <Link href={`/challenges/${canonicalChallenge.id}`} className="button primary">Try the live verifier</Link>
            <Link href="/account" className="button secondary">Open My Side Quests</Link>
            <Link href="/verifiers" className="button secondary">Open verifier board</Link>
            <Link href="/challenges" className="button secondary">Browse all quests</Link>
          </div>
        </section>

        <section className="grid" aria-label="Verification scorecard">
          <Fact label="Quest deck" value={`${CHALLENGES.length} quests`} copy="Every quest has rules, reward points, and a collectible coat-of-arms badge." />
          <Fact label="Deck value" value={`${totalReward} pts`} copy="The point score is brag fuel, not a serious rating system." />
          <Fact label="Proof tone" value="Honest chaos" copy="Pass, fail, and pending states all stay shareable without pretending every attempt succeeded." />
        </section>

        <section className="big-grid" aria-label="How proof works">
          {proofSteps.map((step, index) => (
            <article className="mission-card" key={step.title}>
              <span className="eyebrow">Step {index + 1}</span>
              <h2>{step.title}</h2>
              <p>{step.copy}</p>
            </article>
          ))}
        </section>

        <section className="mission-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">Verifier roadmap</span>
              <h2>What counts as proof?</h2>
            </div>
            <span className="badge gold">no manual uploads</span>
          </div>
          <div className="grid">
            {verifierStatuses.map((item) => (
              <article className="stat-card mission-card" key={item.title}>
                <span className="eyebrow">{item.label}</span>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="card mission-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">Guardrails</span>
              <h2>What Side Quest Chess is not</h2>
            </div>
          </div>
          <div className="chip-row" aria-label="Product anti-goals">
            <span className="chip">not engine analysis</span>
            <span className="chip">not PGN upload chores</span>
            <span className="chip">not a training dashboard</span>
            <span className="chip">not fake success copy</span>
            <span className="chip">not a replacement chess board</span>
          </div>
        </section>
      </div>
    </main>
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
