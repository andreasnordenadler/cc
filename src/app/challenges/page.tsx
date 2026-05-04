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

const betaStarterRoute = [
  {
    label: "First weird win",
    challengeId: "knights-before-coffee",
    why: "Smallest rule load: make four knight moves first, then win. Best for confirming the proof loop before chasing harder nonsense.",
  },
  {
    label: "Bishop restraint",
    challengeId: "bishop-field-trip",
    why: "A gentle second step: develop both bishops before the queen, then win. It teaches constraints without feeling like homework.",
  },
  {
    label: "King-walk stretch",
    challengeId: "early-king-walk",
    why: "The first suspicious escalation: move the king early without castling, then still win. Weird enough to be memorable, readable enough to verify.",
  },
];

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
          <span className="eyebrow">Quest Hub</span>
          <h1>Pick your next bad idea.</h1>
          <p className="hero-copy">
            These are not lessons. They are chess quests with proof attached. Start one, play real games on Lichess or Chess.com, and come back when the bad idea has evidence.
          </p>
        </section>

        <section className="mission-card" aria-label="Full quest deck introduction">
          <div className="section-head">
            <div>
              <span className="eyebrow">Full quest deck</span>
              <h2>Ready for the rest of the bad ideas?</h2>
            </div>
            <span className="badge gold">10 quests</span>
          </div>
          <p>
            Browse the full live-backed deck. Every quest below can be checked from public Lichess or Chess.com games.
          </p>
        </section>

        <section className="big-grid" aria-label="Available quests">
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

        <section className="mission-card" aria-label="Recommended starter route">
          <div className="section-head">
            <div>
              <span className="eyebrow">Recommended starter route</span>
              <h2>Three picks that remove choice paralysis.</h2>
            </div>
            <span className="badge blue">start here</span>
          </div>
          <p>
            New here? Start with these three quests if you want the smoothest first run: one simple win, one clean constraint, then one slightly suspicious king walk.
          </p>
          <div className="grid">
            {betaStarterRoute.map((step) => {
              const challenge = CHALLENGES.find((candidate) => candidate.id === step.challengeId) ?? CHALLENGES[0];
              const isActive = currentChallenge?.id === challenge.id;
              const isCompleted = completedSet.has(challenge.id);

              return (
                <Link
                  className={`fact starter-route-card clickable-quest-card ${isActive ? "active-quest-card" : ""}`}
                  href={`/challenges/${challenge.id}`}
                  key={step.challengeId}
                  aria-current={isActive ? "true" : undefined}
                >
                  {isActive ? <span className="active-quest-stamp" aria-label="Active quest" /> : null}
                  <div className="card-meta quest-card-meta">
                    <strong className="quest-points">+{challenge.reward} pts</strong>
                    <span className={`badge difficulty-badge ${getDifficultyTone(challenge.difficulty)}`}>{challenge.difficulty}</span>
                  </div>
                  <ChallengeBadge challenge={challenge} earned={isCompleted} presentation="art" />
                  <strong>{challenge.title}</strong>
                  <p>{step.why}</p>
                  {isCompleted ? (
                    <div className="card-footer quest-state-row">
                      <span className="badge green">completed</span>
                    </div>
                  ) : null}
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}

function ChallengeCard({ challenge, featured, completed, active }: { challenge: Challenge; featured?: boolean; completed?: boolean; active?: boolean }) {
  const difficultyTone = getDifficultyTone(challenge.difficulty);
  return (
    <Link
      href={`/challenges/${challenge.id}`}
      className={`challenge-card clickable-quest-card ${featured ? "featured" : ""} ${active ? "active-quest-card" : ""}`}
      aria-current={active ? "true" : undefined}
    >
      {active ? <span className="active-quest-stamp" aria-label="Active quest" /> : null}
      <div className="card-meta quest-card-meta">
        <strong className="quest-points">+{challenge.reward} pts</strong>
        <span className={`badge difficulty-badge ${difficultyTone}`}>{challenge.difficulty}</span>
      </div>
      <div className="challenge-card-title-row">
        <ChallengeBadge challenge={challenge} earned={completed} presentation="art" />
        <div>
          <h3>{challenge.title}</h3>
          <p>{challenge.objective}</p>
          <em>{challenge.openingHint}</em>
        </div>
      </div>
      {completed ? (
        <div className="card-footer quest-state-row">
          <span className="badge green">completed</span>
        </div>
      ) : null}
    </Link>
  );
}

function getDifficultyTone(difficulty: Challenge["difficulty"]) {
  if (difficulty === "Easy") return "green";
  if (difficulty === "Medium") return "gold";
  if (difficulty === "Hard") return "orange";
  if (difficulty === "Absurd") return "absurd";
  return "danger";
}
