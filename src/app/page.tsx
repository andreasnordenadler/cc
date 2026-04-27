import Image from "next/image";
import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import ChallengeBadge from "@/components/challenge-badge";
import SiteNav from "@/components/site-nav";
import { CHALLENGES } from "@/lib/challenges";
import {
  getActiveChallenge,
  getChallengeProgress,
  getChessComUsername,
  getLichessUsername,
  type UserMetadataRecord,
} from "@/lib/user-metadata";

export default async function Home() {
  const { userId } = await auth();
  const isSignedIn = Boolean(userId);
  const user = isSignedIn ? await currentUser() : null;
  const metadata = user?.publicMetadata ? (user.publicMetadata as UserMetadataRecord) : {};
  const progress = getChallengeProgress(metadata);
  const activeChallenge = getActiveChallenge(metadata);
  const lichessUsername = getLichessUsername(metadata);
  const chessComUsername = getChessComUsername(metadata);
  const featuredChallenge = CHALLENGES[0];

  return (
    <main className="site-shell">
      <SiteNav isSignedIn={isSignedIn} active="home" />

      <div className="content-wrap">
        <section className="hero-grid">
          <article className="hero-card">
            <div className="hero-logo-lockup">
              <Image src="/sqc-temp-logo.jpg" alt="Side Quest Chess temporary logo" width={1200} height={630} priority />
            </div>
            <span className="eyebrow">Side Quest Chess v1</span>
            <h1>Chess, but with stupidly hard side quests.</h1>
            <p className="hero-copy">
              Pick a ridiculous challenge, play real games on Lichess or Chess.com, and let Side Quest Chess prove whether you actually pulled it off.
            </p>
            <div className="button-row hero-actions">
              <Link href="/today" className="button primary">Open today’s dare</Link>
              <Link href="/challenges" className="button primary">Pick a bad idea</Link>
              <Link href="/badges" className="button secondary">Open badge vault</Link>
            </div>

            <div className="steps" aria-label="How Side Quest Chess works">
              <Step num="1" title="Pick" copy="Choose a terrible mission." />
              <Step num="2" title="Play" copy="Use your normal chess site." />
              <Step num="3" title="Prove" copy="We check it and make it shareable." />
            </div>
          </article>

          <aside className="side-card card">
            <div className="spread">
              <span className="eyebrow">Canonical quest</span>
              <span className="badge danger">{featuredChallenge.difficulty}</span>
            </div>
            <ChallengeTeaser challengeId={featuredChallenge.id} />
            <div className="note-card">
              <strong>No PGN homework.</strong>
              <p>Play real games elsewhere. Side Quest Chess is the weird dare layer and proof machine.</p>
            </div>
          </aside>
        </section>

        <section className="big-grid" aria-label="Product surfaces">
          <article className="mission-card daily-card">
            <span className="eyebrow">Daily side quest</span>
            <h2>One bad idea for everyone today.</h2>
            <p>The daily dare gives Side Quest Chess a repeatable ritual: same challenge, same badge target, easy to share with friends.</p>
            <Link href="/today" className="button primary">See today’s dare</Link>
          </article>

          <article className="mission-card">
            <span className="eyebrow">Challenge Hub</span>
            <h2>Pick your next bad idea.</h2>
            <p>Browse weird chess dares by chaos level, difficulty, and brag value. The hub is the product center — not an account dashboard.</p>
            <Link href="/challenges" className="button primary">Open challenge hub</Link>
          </article>

          <article className="mission-card">
            <span className="eyebrow">Automatic proof</span>
            <h2>Play your game. We’ll judge your life choices.</h2>
            <p>V1 presents the proof loop now: connect Lichess/Chess.com, play normal games, then Side Quest Chess checks for side-quest evidence.</p>
            <Link href="/connect" className="button secondary">Connect account</Link>
          </article>

          <article className="mission-card">
            <span className="eyebrow">Badge vault</span>
            <h2>Your nonsense gets heraldry.</h2>
            <p>Every starter challenge now has a distinct SQC coat of arms with a motto, meaning, and weird little brag identity.</p>
            <Link href="/badges" className="button pink">Browse badges</Link>
          </article>
        </section>

        <section className="card mission-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">Your chaos status</span>
              <h2>{isSignedIn ? "Current run" : "Try it without context first"}</h2>
            </div>
            <span className="badge gold">{progress.totalRewardPoints} pts</span>
          </div>

          {isSignedIn ? (
            <div className="grid">
              <Fact label="Connected identity" value={[lichessUsername, chessComUsername].filter(Boolean).join(" / ") || "Not set yet"} />
              <Fact label="Active dare" value={activeChallenge?.id ? activeChallenge.id.replaceAll("-", " ") : "None yet"} />
              <Fact label="Completed" value={`${progress.totalCompletedChallenges} quests`} />
            </div>
          ) : (
            <p>
              You can browse challenges now. Sign in only when you want Side Quest Chess to remember your profile, streaks, and proof cards.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}

function ChallengeTeaser({ challengeId }: { challengeId: string }) {
  const challenge = CHALLENGES.find((item) => item.id === challengeId) ?? CHALLENGES[0];

  return (
    <article className="challenge-card featured">
      <div className="card-meta">
        <span>{challenge.category}</span>
        <span className="badge danger">{challenge.difficulty}</span>
      </div>
      <ChallengeBadge challenge={challenge} />
      <h3>{challenge.title}</h3>
      <p>{challenge.objective}</p>
      <em>{challenge.openingHint}</em>
      <div className="proof-line">{challenge.badgeIdentity.heraldry.motto} · {challenge.badgeIdentity.heraldry.meaning}</div>
      <div className="card-footer">
        <strong>+{challenge.reward} pts</strong>
        <span>{challenge.badgeIdentity.name}</span>
        <Link href={`/challenges/${challenge.id}`}>Start</Link>
      </div>
    </article>
  );
}

function Step({ num, title, copy }: { num: string; title: string; copy: string }) {
  return (
    <div className="step">
      <strong>{num}</strong>
      <span>{title}</span>
      <p>{copy}</p>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="fact">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
