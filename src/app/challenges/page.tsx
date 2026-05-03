import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import ChallengeBadge from "@/components/challenge-badge";
import SiteNav from "@/components/site-nav";
import { CHALLENGES, type Challenge } from "@/lib/challenges";
import { getVerifierStatus } from "@/lib/verifier-status";
import {
  getActiveChallenge,
  getChallengeProgress,
  type UserMetadataRecord,
} from "@/lib/user-metadata";

const categories = ["All", "Blunder", "Restrictions", "Chaos", "Style", "Friends", "Near-impossible"];
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

const proofLoopSteps = [
  {
    label: "1 · Accept",
    value: "Pick one quest",
    copy: "Start from the recommended route or any quest card. Side Quest Chess saves the active quest so the account page knows what receipt to check next.",
  },
  {
    label: "2 · Play",
    value: "Win on your chess site",
    copy: "Use a normal public Lichess or Chess.com game. No PGN upload, engine dashboard, or fake sandbox game required.",
  },
  {
    label: "3 · Prove",
    value: "Run latest-game check",
    copy: "Return to Account for an honest passed, failed, or pending receipt with the next action spelled out for beta feedback.",
  },
];

export default async function ChallengesPage() {
  const { userId } = await auth();
  const user = userId ? await currentUser() : null;
  const metadata = user?.publicMetadata ? (user.publicMetadata as UserMetadataRecord) : {};
  const activeChallenge = getActiveChallenge(metadata);
  const progress = getChallengeProgress(metadata);
  const completedSet = new Set(progress.completedChallengeIds);
  const liveVerifierCount = CHALLENGES.filter((challenge) => getVerifierStatus(challenge).state === "live").length;
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
          <div className="chip-row" aria-label="Quest categories">
            {categories.map((category) => <span className="chip" key={category}>{category}</span>)}
          </div>
        </section>

        <section className="grid" aria-label="Quest status">
          <Fact label="Completed" value={`${progress.totalCompletedChallenges}`} copy={`${progress.totalRewardPoints} points banked`} />
          <Fact label="Active quest" value={currentChallenge?.title ?? "None yet"} copy={currentChallenge?.proofCallout ?? "Choose one and start causing problems."} />
          <Fact
            label="Automated proof deck"
            value={`${liveVerifierCount}/${CHALLENGES.length} quests`}
            copy="Every starter quest can check latest games on Lichess or Chess.com today."
          />
        </section>

        {currentChallenge ? (
          <section className="mission-card active-quest-card">
            <div className="section-head">
              <div>
                <span className="eyebrow">Active quest</span>
                <div className="active-quest-title-row">
                  <span className="clean-quest-logo active-quest-badge" aria-hidden="true">
                    <ChallengeBadge challenge={currentChallenge} earned={completedSet.has(currentChallenge.id)} presentation="art" />
                  </span>
                  <h2>{currentChallenge.title}</h2>
                </div>
              </div>
            </div>
            <p>{currentChallenge.objective}</p>
            <Link href={`/challenges/${currentChallenge.id}`} className="button primary">Continue quest</Link>
          </section>
        ) : null}

        <section className="mission-card" aria-label="Recommended starter route">
          <div className="section-head">
            <div>
              <span className="eyebrow">Recommended starter route</span>
              <h2>Three picks that remove choice paralysis.</h2>
            </div>
            <span className="badge blue">start here</span>
          </div>
          <p>
            New here? This is the same three-step ladder as Starter path, so the homepage, nav, account preflight, and quest hub all point beginners at one consistent first run.
          </p>
          <div className="note-card">
            <strong>Full deck proof is live.</strong>
            <p>All ten current starter quests use the same latest-game flow on Lichess or Chess.com, so this route lowers first-run choice pressure without hiding partial verifier coverage.</p>
          </div>
          <div className="grid">
            {betaStarterRoute.map((step, index) => {
              const challenge = CHALLENGES.find((candidate) => candidate.id === step.challengeId) ?? CHALLENGES[0];

              return (
                <article className="fact" key={step.challengeId}>
                  <span>Step {index + 1} · {step.label}</span>
                  <ChallengeBadge challenge={challenge} earned={completedSet.has(challenge.id)} presentation="art" />
                  <strong>{challenge.title}</strong>
                  <p>{step.why}</p>
                  <Link href={`/challenges/${challenge.id}`} className="button secondary">Open step rules</Link>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mission-card" aria-label="Latest-game proof loop">
          <div className="section-head">
            <div>
              <span className="eyebrow">Latest-game proof loop</span>
              <h2>Accept, play, prove — no PGN homework.</h2>
            </div>
            <span className="badge green">private beta path</span>
          </div>
          <p>
            The quest hub now explains the whole tester loop before someone commits to a quest, so the next action is clear even before sign-in.
          </p>
          <div className="grid">
            {proofLoopSteps.map((step) => (
              <article className="fact" key={step.label}>
                <span>{step.label}</span>
                <strong>{step.value}</strong>
                <p>{step.copy}</p>
              </article>
            ))}
          </div>
          <div className="card-footer">
            <strong>Ready after a real game?</strong>
            <Link href="/account">Verify latest game</Link>
          </div>
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
      <div className="challenge-card-title-row">
        <ChallengeBadge challenge={challenge} earned={completed} presentation="art" />
        <div>
          <h3>{challenge.title}</h3>
          <p>{challenge.objective}</p>
          <em>{challenge.openingHint}</em>
        </div>
      </div>
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
