import type { Metadata } from "next";
import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import ChallengeBadge from "@/components/challenge-badge";
import SiteNav from "@/components/site-nav";
import { startChallenge } from "@/app/actions";
import { CHALLENGES, type Challenge } from "@/lib/challenges";
import {
  getActiveChallenge,
  getChallengeProgress,
  type UserMetadataRecord,
} from "@/lib/user-metadata";

export const metadata: Metadata = {
  title: "Quest picks — Side Quest Chess",
  description:
    "Three suggested Side Quest Chess starting points: easy, trouble, or full chaos.",
  alternates: { canonical: "/path" },
  openGraph: {
    title: "Quest picks — Side Quest Chess",
    description:
      "Choose an easy, troublesome, or brutal chess side quest instead of following a formal onboarding track.",
    url: "/path",
    siteName: "Side Quest Chess",
    type: "website",
    images: [
      {
        url: "/api/og/dare/queen-never-heard-of-her",
        width: 1200,
        height: 630,
        alt: "Side Quest Chess quest picks preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Quest picks — Side Quest Chess",
    description: "Easy, trouble, or badass: pick the level of bad idea you want first.",
    images: ["/api/og/dare/queen-never-heard-of-her"],
  },
};

const QUEST_PICK_IDS = ["knights-before-coffee", "no-castle-club", "queen-never-heard-of-her"];
const PICK_LABELS = ["Start easy", "Looking for trouble", "Badass"];

export default async function QuestPicksPage() {
  const { userId } = await auth();
  const user = userId ? await currentUser() : null;
  const metadata = user?.publicMetadata ? (user.publicMetadata as UserMetadataRecord) : {};
  const progress = getChallengeProgress(metadata);
  const activeChallenge = getActiveChallenge(metadata);
  const completedSet = new Set(progress.completedChallengeIds);
  const questPicks = QUEST_PICK_IDS
    .map((id) => CHALLENGES.find((challenge) => challenge.id === id))
    .filter((challenge): challenge is Challenge => Boolean(challenge));
  const nextChallenge = questPicks.find((challenge) => !completedSet.has(challenge.id)) ?? questPicks.at(0) ?? CHALLENGES[0];

  return (
    <main className="site-shell">
      <SiteNav isSignedIn={Boolean(userId)} active="path" />

      <div className="content-wrap">
        <section className="hero-card detail-hero">
          <div className="detail-hero-grid">
            <div>
              <div className="badge-row">
                <span className="eyebrow">Quest picks</span>
                <span className="badge gold">easy / trouble / badass</span>
                <span className="badge blue">one quest at a time</span>
              </div>
              <h1>Choose how hard you want to go.</h1>
              <p className="hero-copy">
                There is no separate onboarding track. Start with something survivable, look for trouble, or jump straight into a story-worthy disaster.
              </p>
              <div className="button-row hero-actions">
                {userId ? (
                  <form action={startChallenge}>
                    <input type="hidden" name="challengeId" value={nextChallenge.id} />
                    <button type="submit" className="button primary">Make suggested quest active</button>
                  </form>
                ) : (
                  <Link href="/connect" className="button primary">Connect to start</Link>
                )}
                <Link href={`/challenges/${nextChallenge.id}`} className="button secondary">Preview suggested quest</Link>
                <Link href="/challenges" className="button secondary">Browse all quests</Link>
              </div>
            </div>
            <ChallengeBadge challenge={nextChallenge} size="hero" earned={completedSet.has(nextChallenge.id)} />
          </div>
        </section>

        <section className="grid" aria-label="Quest-pick summary">
          <Fact label="Start easy" value="Knights Before Coffee" copy="A small opening ritual that teaches the rhythm without throwing you into peak chaos." />
          <Fact label="Looking for trouble" value="No Castle Club" copy="A very understandable constraint with real danger once the board gets sharp." />
          <Fact label="Badass" value="Queen? Never Heard of Her" copy="A streamer-hard comeback receipt if you want the funny story immediately." />
        </section>

        <section className="mission-card" aria-label="Eligible quest game checklist">
          <div className="section-head">
            <div>
              <span className="eyebrow">Before you play</span>
              <h2>Make the next game count for proof.</h2>
            </div>
            <span className="badge blue">latest public game</span>
          </div>
          <p>
            The verifier reads your latest public standard game from Lichess or Chess.com. For the cleanest first test, play bullet, blitz, or rapid, complete the quest rule, and win the game before coming back to check the receipt.
          </p>
          <div className="checker-flow" aria-label="Quest proof eligibility checklist">
            <div className="flow-step ready">
              <strong>Standard chess only</strong>
              <p>Variants are funny, but they do not count for the v1 proof check.</p>
            </div>
            <div className="flow-step ready">
              <strong>Bullet, blitz, or rapid</strong>
              <p>Use a normal fast time class so the latest-game check lands in the supported window.</p>
            </div>
            <div className="flow-step hot">
              <strong>Quest rule + win</strong>
              <p>Do the weird constraint and still win; every current SQC quest is win-required.</p>
            </div>
          </div>
          <div className="button-row">
            <Link href="/rules" className="button secondary">Read proof rules</Link>
            <Link href="/account" className="button primary">Open My Side Quests</Link>
          </div>
        </section>

        <section className="big-grid" aria-label="Recommended quest picks">
          {questPicks.map((challenge, index) => (
            <PathStep
              key={challenge.id}
              challenge={challenge}
              stepNumber={index + 1}
              pickLabel={PICK_LABELS[index] ?? "Quest pick"}
              active={activeChallenge?.id === challenge.id}
              completed={completedSet.has(challenge.id)}
              isSignedIn={Boolean(userId)}
            />
          ))}
        </section>

        <section className="mission-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">Why these three</span>
              <h2>They give new players a choice of intensity.</h2>
            </div>
            <span className="badge green">v1 onboarding</span>
          </div>
          <p>
            The product should feel like a smart chess friend offering three levels of bad decision, not a curriculum. These picks let new players decide whether they want safe weirdness, real trouble, or immediate legend mode.
          </p>
        </section>
      </div>
    </main>
  );
}

function PathStep({
  challenge,
  stepNumber,
  pickLabel,
  active,
  completed,
  isSignedIn,
}: {
  challenge: Challenge;
  stepNumber: number;
  pickLabel: string;
  active: boolean;
  completed: boolean;
  isSignedIn: boolean;
}) {
  const status = completed ? "cleared" : active ? "active" : "available";
  const statusTone = completed ? "green" : active ? "gold" : "blue";

  return (
    <article className={`challenge-card ${stepNumber === 3 ? "featured" : ""}`}>
      <div className="card-meta">
        <span>{pickLabel} · {challenge.difficulty}</span>
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
        {isSignedIn && !completed ? (
          <form action={startChallenge}>
            <input type="hidden" name="challengeId" value={challenge.id} />
            <button type="submit" className="link-button">{active ? "Restart" : "Make active"}</button>
          </form>
        ) : (
          <Link href={isSignedIn ? `/challenges/${challenge.id}` : "/connect"}>{completed ? "Review" : "Connect to start"}</Link>
        )}
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
