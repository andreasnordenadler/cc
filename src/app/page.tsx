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
              Pick a ridiculous quest, play real games on Lichess or Chess.com, and let Side Quest Chess prove whether you actually pulled it off.
            </p>
            <div className="button-row hero-actions">
              <Link href="/today" className="button primary">Open today’s quest</Link>
              <Link href="/random" className="button pink">Spin a bad idea</Link>
              <Link href="/challenges" className="button secondary">Pick from the hub</Link>
              <Link href="/path" className="button secondary">Start the path</Link>
              <Link href="/badges" className="button secondary">Open badge vault</Link>
              <Link href="/scoreboard" className="button secondary">View scoreboard</Link>
              <Link href="/rules" className="button secondary">Read the rulebook</Link>
              <Link href="/verifiers" className="button secondary">Open verifier board</Link>
              <Link href="/beta" className="button secondary">Private beta notes</Link>
              <Link href="/share-kit" className="button secondary">Open share kit</Link>
              <Link href="/proof-log" className="button secondary">View proof log</Link>
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
              <p>Play real games elsewhere. Side Quest Chess is the weird quest layer and proof machine.</p>
            </div>
          </aside>
        </section>

        <section className="card mission-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">Private beta quickstart</span>
              <h2>Run the first tester loop without route hunting.</h2>
            </div>
            <span className="badge gold">5 min</span>
          </div>
          <div className="grid">
            <Fact label="1 · Set identity" value="Open /account, add Lichess or Chess.com, and confirm the preflight checklist." />
            <Fact label="2 · Pick the starter route" value="Use the three-quest beta route on /challenges instead of browsing the full chaos deck cold." />
            <Fact label="3 · Check the receipt" value="After a real game, open /result and copy the beta report if anything feels unfair or confusing." />
          </div>
          <div className="button-row">
            <Link href="/account" className="button primary">Start account preflight</Link>
            <Link href="/challenges" className="button secondary">Open starter route</Link>
            <Link href="/result" className="button secondary">Check latest receipt</Link>
          </div>
        </section>

        <section className="card mission-card beta-trust-strip" aria-label="Private beta trust basics">
          <div>
            <span className="eyebrow">Private beta trust basics</span>
            <h2>Real games, public data, no password nonsense.</h2>
            <p>
              Side Quest Chess checks public Lichess and Chess.com game records only. Testers should never share chess-site passwords, and confusing receipts should be reported with the copied beta packet plus a screenshot.
            </p>
          </div>
          <div className="button-row">
            <Link href="/rules" className="button secondary">Read proof rules</Link>
            <Link href="/support" className="button primary">Open support packet</Link>
          </div>
        </section>

        <section className="big-grid" aria-label="Product surfaces">
          <article className="mission-card daily-card">
            <span className="eyebrow">Daily side quest</span>
            <h2>One bad idea for everyone today.</h2>
            <p>The daily quest gives Side Quest Chess a repeatable ritual: same quest, same badge target, easy to share with friends.</p>
            <Link href="/today" className="button primary">See today’s quest</Link>
          </article>

          <article className="mission-card">
            <span className="eyebrow">Random quest machine</span>
            <h2>Let fate pick the bad idea.</h2>
            <p>Spin the starter deck, accept the quest, or send the exact friend-quest link before common sense gets involved.</p>
            <Link href="/random" className="button pink">Spin the deck</Link>
          </article>

          <article className="mission-card">
            <span className="eyebrow">Starter path</span>
            <h2>Three bad ideas, in survivable order.</h2>
            <p>A tiny first-run ladder gives new players a clear next quest before they browse the full chaos deck.</p>
            <Link href="/path" className="button primary">Start the path</Link>
          </article>

          <article className="mission-card">
            <span className="eyebrow">Quest Hub</span>
            <h2>Pick your next bad idea.</h2>
            <p>Browse weird chess quests by chaos level, difficulty, and brag value. The hub is the product center — not an account dashboard.</p>
            <Link href="/challenges" className="button primary">Open quest hub</Link>
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
            <p>Every starter quest now has a distinct SQC coat of arms with a motto, meaning, and weird little brag identity.</p>
            <Link href="/badges" className="button pink">Browse badges</Link>
          </article>

          <article className="mission-card">
            <span className="eyebrow">Scoreboard</span>
            <h2>Your bad-idea score, in public.</h2>
            <p>Track starter-deck points, earned coat-of-arms badges, and the next quest worth attempting without pretending this is a serious leaderboard.</p>
            <Link href="/scoreboard" className="button secondary">View scoreboard</Link>
          </article>

          <article className="mission-card">
            <span className="eyebrow">Rulebook</span>
            <h2>Funny quests. Serious receipts.</h2>
            <p>The proof explainer shows how SQC verifies real games without PGN homework, engine dashboards, or fake success copy.</p>
            <Link href="/rules" className="button secondary">Read the rulebook</Link>
          </article>

          <article className="mission-card">
            <span className="eyebrow">Private beta</span>
            <h2>Test the loop before launch hype.</h2>
            <p>A beta note now explains what is ready, how to test, what chess data SQC uses, and how friends should report confusing verifier outcomes.</p>
            <Link href="/beta" className="button primary">Open beta notes</Link>
          </article>

          <article className="mission-card">
            <span className="eyebrow">Verifier board</span>
            <h2>Live proof, not fake glory.</h2>
            <p>See which starter quests are live-backed today, which adapters are next, and what evidence each weird receipt will need.</p>
            <Link href="/verifiers" className="button secondary">Open verifier board</Link>
          </article>

          <article className="mission-card">
            <span className="eyebrow">Share kit</span>
            <h2>Every quest, ready to send.</h2>
            <p>A single page for quest-specific friend links, daily/random rituals, OG preview targets, and no-excuse invite copy.</p>
            <Link href="/share-kit" className="button pink">Open share kit</Link>
          </article>

          <article className="mission-card">
            <span className="eyebrow">Proof log</span>
            <h2>Your receipts, without the spreadsheet energy.</h2>
            <p>Every latest-game check now has a home: passed, failed, or pending side-quest evidence tied back to the exact quest.</p>
            <Link href="/proof-log" className="button secondary">View proof log</Link>
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
              <Fact label="Active quest" value={activeChallenge?.id ? activeChallenge.id.replaceAll("-", " ") : "None yet"} />
              <Fact label="Completed" value={`${progress.totalCompletedChallenges} quests`} />
            </div>
          ) : (
            <p>
              You can browse quests now. Sign in only when you want Side Quest Chess to remember your profile, streaks, and proof cards.
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
