import type { Metadata } from "next";
import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import ChallengeBadge from "@/components/challenge-badge";
import SiteNav from "@/components/site-nav";
import { CHALLENGES, type Challenge } from "@/lib/challenges";
import {
  getActiveChallenge,
  getChallengeProgress,
  type UserMetadataRecord,
} from "@/lib/user-metadata";

export const metadata: Metadata = {
  title: "Starter path — Side Quest Chess",
  description:
    "A three-quest beginner path for Side Quest Chess: simple weirdness first, then two gentle win-required escalations.",
  alternates: { canonical: "/path" },
  openGraph: {
    title: "Starter path — Side Quest Chess",
    description:
      "Three chess side quests that teach the Side Quest Chess loop without making it feel like homework.",
    url: "/path",
    siteName: "Side Quest Chess",
    type: "website",
    images: [
      {
        url: "/api/og/dare/queen-never-heard-of-her",
        width: 1200,
        height: 630,
        alt: "Side Quest Chess starter path preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Starter path — Side Quest Chess",
    description: "A three-quest first run for people ready to make chess worse on purpose.",
    images: ["/api/og/dare/queen-never-heard-of-her"],
  },
};

const STARTER_PATH_IDS = ["knights-before-coffee", "bishop-field-trip", "early-king-walk"];

export default async function StarterPathPage() {
  const { userId } = await auth();
  const user = userId ? await currentUser() : null;
  const metadata = user?.publicMetadata ? (user.publicMetadata as UserMetadataRecord) : {};
  const progress = getChallengeProgress(metadata);
  const activeChallenge = getActiveChallenge(metadata);
  const completedSet = new Set(progress.completedChallengeIds);
  const starterChallenges = STARTER_PATH_IDS
    .map((id) => CHALLENGES.find((challenge) => challenge.id === id))
    .filter((challenge): challenge is Challenge => Boolean(challenge));
  const completedStarterCount = starterChallenges.filter((challenge) => completedSet.has(challenge.id)).length;
  const nextChallenge =
    starterChallenges.find((challenge) => !completedSet.has(challenge.id)) ?? starterChallenges.at(-1) ?? CHALLENGES[0];

  return (
    <main className="site-shell">
      <SiteNav isSignedIn={Boolean(userId)} active="path" />

      <div className="content-wrap">
        <section className="hero-card detail-hero">
          <div className="detail-hero-grid">
            <div>
              <div className="badge-row">
                <span className="eyebrow">Starter path</span>
                <span className="badge gold">{completedStarterCount}/3 cleared</span>
                <span className="badge blue">first run</span>
              </div>
              <h1>Three bad ideas, in survivable order.</h1>
              <p className="hero-copy">
                New players should not have to choose from chaos soup. This path starts with a tiny knight-only ritual, escalates into bishop restraint, then ends with one slightly suspicious king walk once the loop makes sense.
              </p>
              <div className="button-row hero-actions">
                <Link href={`/challenges/${nextChallenge.id}`} className="button primary">Start next step</Link>
                <Link href="/connect" className="button secondary">Connect proof account</Link>
                <Link href="/challenges" className="button secondary">Browse all quests</Link>
              </div>
            </div>
            <ChallengeBadge challenge={nextChallenge} size="hero" earned={completedSet.has(nextChallenge.id)} />
          </div>
        </section>

        <section className="grid" aria-label="Starter path summary">
          <Fact label="Path progress" value={`${completedStarterCount}/3`} copy="A tiny onboarding arc, not a curriculum." />
          <Fact label="Next quest" value={nextChallenge.title} copy={nextChallenge.objective} />
          <Fact label="Proof loop" value="Pick → play → check" copy="No PGN upload. The app checks latest games after you play elsewhere." />
        </section>

        <section className="big-grid" aria-label="Starter path steps">
          {starterChallenges.map((challenge, index) => (
            <PathStep
              key={challenge.id}
              challenge={challenge}
              stepNumber={index + 1}
              active={activeChallenge?.id === challenge.id}
              completed={completedSet.has(challenge.id)}
            />
          ))}
        </section>

        <section className="mission-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">Why this path exists</span>
              <h2>It turns first-time confusion into a quest ladder.</h2>
            </div>
            <span className="badge green">v1 onboarding</span>
          </div>
          <p>
            The product can still stay mischievous while giving beginners one obvious way in: move only knights first and win, develop both bishops before the queen and win, then try one early king walk and win without turning the product into chess homework.
          </p>
        </section>
      </div>
    </main>
  );
}

function PathStep({
  challenge,
  stepNumber,
  active,
  completed,
}: {
  challenge: Challenge;
  stepNumber: number;
  active: boolean;
  completed: boolean;
}) {
  const status = completed ? "cleared" : active ? "active" : "nextable";
  const statusTone = completed ? "green" : active ? "gold" : "blue";

  return (
    <article className={`challenge-card ${stepNumber === 3 ? "featured" : ""}`}>
      <div className="card-meta">
        <span>Step {stepNumber} · {challenge.category}</span>
        <span className={`badge ${statusTone}`}>{status}</span>
      </div>
      <div className="challenge-card-title-row">
        <ChallengeBadge challenge={challenge} earned={completed} />
        <div>
          <h3>{challenge.title}</h3>
          <p>{challenge.objective}</p>
        </div>
      </div>
      <em>{challenge.openingHint}</em>
      <div className="proof-line">{challenge.badgeIdentity.heraldry.motto} · {challenge.proofCallout}</div>
      <div className="card-footer">
        <strong>+{challenge.reward} pts</strong>
        <span>{challenge.badgeIdentity.name}</span>
        <Link href={`/challenges/${challenge.id}`}>{completed ? "Review" : "Start"}</Link>
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
