import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import SiteNav from "@/components/site-nav";
import { CHALLENGES, type Challenge } from "@/lib/challenges";
import {
  getActiveChallenge,
  getChallengeProgress,
  type UserMetadataRecord,
} from "@/lib/user-metadata";

const categories = ["All", "Blunder", "Restrictions", "Chaos", "Style", "Friends", "Near-impossible"];

export default async function ChallengesPage() {
  const { userId } = await auth();
  const user = userId ? await currentUser() : null;
  const metadata = user?.publicMetadata ? (user.publicMetadata as UserMetadataRecord) : {};
  const activeChallenge = getActiveChallenge(metadata);
  const progress = getChallengeProgress(metadata);
  const completedSet = new Set(progress.completedChallengeIds);
  const currentChallenge = activeChallenge?.id
    ? CHALLENGES.find((challenge) => challenge.id === activeChallenge.id) ?? null
    : null;

  return (
    <main className="site-shell">
      <SiteNav isSignedIn={Boolean(userId)} active="challenges" />

      <div className="content-wrap">
        <section className="hero-card">
          <span className="eyebrow">Challenge Hub</span>
          <h1>Pick your next bad idea.</h1>
          <p className="hero-copy">
            These are not lessons. They are chess dares with proof attached. Start one, play real games on Lichess or Chess.com, and come back when the bad idea has evidence.
          </p>
          <div className="chip-row" aria-label="Challenge categories">
            {categories.map((category) => <span className="chip" key={category}>{category}</span>)}
          </div>
        </section>

        <section className="grid" aria-label="Challenge status">
          <Fact label="Completed" value={`${progress.totalCompletedChallenges}`} copy={`${progress.totalRewardPoints} points banked`} />
          <Fact label="Active dare" value={currentChallenge?.title ?? "None yet"} copy={currentChallenge?.proofCallout ?? "Choose one and start causing problems."} />
          <Fact label="Most failed" value="Queen? Never Heard of Her" copy="Perfect. That means the premise is working." />
        </section>

        {currentChallenge ? (
          <section className="mission-card">
            <div className="section-head">
              <div>
                <span className="eyebrow">Continue now</span>
                <h2>{currentChallenge.title}</h2>
              </div>
              <span className="badge green">active</span>
            </div>
            <p>{currentChallenge.objective}</p>
            <Link href={`/challenges/${currentChallenge.id}`} className="button primary">Continue challenge</Link>
          </section>
        ) : null}

        <section className="big-grid" aria-label="Available challenges">
          {CHALLENGES.map((challenge, index) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              featured={index === 0}
              completed={completedSet.has(challenge.id)}
              active={currentChallenge?.id === challenge.id}
            />
          ))}
        </section>
      </div>
    </main>
  );
}

function ChallengeCard({ challenge, featured, completed, active }: { challenge: Challenge; featured?: boolean; completed?: boolean; active?: boolean }) {
  const difficultyTone = challenge.difficulty === "Brutal" || challenge.difficulty === "Absurd" ? "danger" : "blue";

  return (
    <article className={`challenge-card ${featured ? "featured" : ""}`}>
      <div className="card-meta">
        <span>{challenge.category}</span>
        <span className={`badge ${difficultyTone}`}>{challenge.difficulty}</span>
      </div>
      <h3>{challenge.title}</h3>
      <p>{challenge.objective}</p>
      <em>{challenge.openingHint}</em>
      <div className="proof-line">{challenge.proofCallout}</div>
      <div className="badge-row">
        {completed ? <span className="badge green">completed</span> : null}
        {active ? <span className="badge gold">active</span> : null}
        <span className="chip">{challenge.completionRate}</span>
      </div>
      <div className="card-footer">
        <strong>+{challenge.reward} pts</strong>
        <span>{challenge.badge}</span>
        <Link href={`/challenges/${challenge.id}`}>{active ? "Continue" : "Accept quest"}</Link>
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
