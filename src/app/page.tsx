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
            <span className="eyebrow">Side Quest Chess v1</span>
            <h1>Chess, but with stupidly hard side quests.</h1>
            <p className="hero-copy">
              Pick a ridiculous challenge, play real games on Lichess or Chess.com, and let Side Quest Chess prove whether you actually pulled it off.
            </p>
            <div className="button-row hero-actions">
              <Link href="/challenges" className="button primary">Start a quest</Link>
              <Link href="/connect" className="button pink">Connect chess account</Link>
              <Link href="/today" className="button secondary">Open today’s dare</Link>
            </div>

            <div className="steps" aria-label="How Side Quest Chess works">
              <Step num="1" title="Pick" copy="Choose one weird quest." />
              <Step num="2" title="Play" copy="Win a real Lichess or Chess.com game." />
              <Step num="3" title="Prove" copy="Come back for the receipt, points, and badge." />
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

        <section className="card mission-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">First run checklist</span>
              <h2>Start, play, and check proof without route hunting.</h2>
            </div>
            <span className="badge gold">3 steps</span>
          </div>
          <div className="grid">
            <Fact label="1 · Save chess identity" value="Add Lichess or Chess.com once so SQC can check your latest eligible game." />
            <Fact label="2 · Choose one quest" value="Start from the challenge hub and pick a live-backed dare before playing." />
            <Fact label="3 · Read the receipt" value="After the game, check the result page for pass, fail, or pending proof guidance." />
          </div>
          <div className="button-row">
            <Link href="/connect" className="button primary">Connect chess account</Link>
            <Link href="/challenges" className="button secondary">Choose a quest</Link>
            <Link href="/result" className="button secondary">View latest receipt</Link>
          </div>
        </section>

        <section className="big-grid" aria-label="Launch-ready routes">
          <article className="mission-card daily-card">
            <span className="eyebrow">Start here</span>
            <h2>Pick one quest and go play.</h2>
            <p>The fastest launch loop is simple: choose a dare, win a real game on Lichess or Chess.com, then come back for the receipt.</p>
            <Link href="/challenges" className="button primary">Choose a quest</Link>
          </article>

          <article className="mission-card">
            <span className="eyebrow">Proof setup</span>
            <h2>Connect once. No PGN homework.</h2>
            <p>Save your chess username so Side Quest Chess can check your latest eligible game automatically after each attempt.</p>
            <Link href="/connect" className="button pink">Connect Lichess or Chess.com</Link>
          </article>

          <article className="mission-card">
            <span className="eyebrow">Daily ritual</span>
            <h2>One bad idea for today.</h2>
            <p>Daily dares give the product a repeatable reason to come back without making first-time players hunt through every route.</p>
            <Link href="/today" className="button secondary">Open today’s dare</Link>
          </article>

          <article className="mission-card">
            <span className="eyebrow">Proof and progress</span>
            <h2>Receipts, badges, and points.</h2>
            <p>Passed checks become proof cards and badge progress; failed checks explain what was missing so the next attempt feels fair.</p>
            <div className="button-row">
              <Link href="/result" className="button secondary">View latest receipt</Link>
              <Link href="/badges" className="button secondary">Open badge vault</Link>
            </div>
          </article>

          <article className="mission-card">
            <span className="eyebrow">Explore more</span>
            <h2>Chaos when you want it.</h2>
            <p>Once the core loop makes sense, players can spin a random dare, browse the scoreboard, or share a challenge with a friend.</p>
            <div className="button-row">
              <Link href="/random" className="button pink">Spin a bad idea</Link>
              <Link href="/scoreboard" className="button secondary">View scoreboard</Link>
              <Link href="/share-kit" className="button secondary">Share a dare</Link>
            </div>
          </article>

          <article className="mission-card">
            <span className="eyebrow">Trust layer</span>
            <h2>Funny dares. Serious rules.</h2>
            <p>The rulebook and verifier board explain what counts, what does not, and why SQC is using public game data only.</p>
            <div className="button-row">
              <Link href="/rules" className="button secondary">Read rules</Link>
              <Link href="/verifiers" className="button secondary">Open verifier board</Link>
            </div>
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
