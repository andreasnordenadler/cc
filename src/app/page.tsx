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
  const activeQuest = getActiveChallenge(metadata);
  const lichessUsername = getLichessUsername(metadata);
  const chessComUsername = getChessComUsername(metadata);
  const featuredQuest = CHALLENGES[0];
  const activeQuestRecord = activeQuest?.id
    ? CHALLENGES.find((challenge) => challenge.id === activeQuest.id)
    : null;
  const connectedIdentity = [lichessUsername, chessComUsername].filter(Boolean).join(" / ");

  return (
    <main className="site-shell">
      <SiteNav isSignedIn={isSignedIn} active="home" />

      <div className="content-wrap">
        <section className="hero-grid launch-home-hero">
          <article className="hero-card simplified-home-hero">
            <div className="hero-logo-lockup compact">
              <Image src="/sqc-logo.png" alt="Side Quest Chess" width={1254} height={1254} priority />
            </div>
            <span className="eyebrow">Play normal chess. Complete weird quests.</span>
            <h1>Chess, but with stupidly hard side quests.</h1>
            <p className="hero-copy">
              Pick one quest, play a real Lichess or Chess.com game, then come back for an automatic proof card.
            </p>
            <div className="button-row hero-actions">
              <Link href="/challenges" className="button primary">Start a quest</Link>
              <Link href="/connect" className="button pink">Connect chess account</Link>
              <Link href="/result" className="button secondary">View proof card</Link>
            </div>

            <div className="steps clear-steps" aria-label="How Side Quest Chess works">
              <Step num="1" title="Pick" copy="Choose one weird quest." />
              <Step num="2" title="Play" copy="Win on Lichess or Chess.com." />
              <Step num="3" title="Prove" copy="Get points, badge progress, and a receipt." />
            </div>
          </article>

          <aside className="side-card card featured-quest-panel">
            <div className="spread">
              <span className="eyebrow">Recommended first quest</span>
              <span className="badge danger">{featuredQuest.difficulty}</span>
            </div>
            <ChallengeTeaser challengeId={featuredQuest.id} />
          </aside>
        </section>

        {isSignedIn ? (
          <section className="card mission-card home-status-card">
            <div className="section-head">
              <div>
                <span className="eyebrow">Your run</span>
                <h2>{activeQuestRecord ? "Continue your current quest." : "Pick your first quest."}</h2>
              </div>
              <span className="badge gold readable-points">{progress.totalRewardPoints} points</span>
            </div>
            <div className="grid lean-status-grid">
              <Fact label="Chess account" value={connectedIdentity || "Add Lichess or Chess.com"} />
              <Fact label="Current quest" value={activeQuestRecord?.title ?? "None yet"} />
              <Fact label="Completed quests" value={`${progress.totalCompletedChallenges}`} />
            </div>
            <div className="button-row">
              <Link href={activeQuestRecord ? `/challenges/${activeQuestRecord.id}` : "/challenges"} className="button primary">
                {activeQuestRecord ? "Continue quest" : "Choose a quest"}
              </Link>
              <Link href="/account" className="button secondary">Open my account</Link>
            </div>
          </section>
        ) : (
          <section className="card mission-card first-run-card">
            <div className="section-head">
              <div>
                <span className="eyebrow">First run</span>
                <h2>Try the loop in three clicks.</h2>
              </div>
            </div>
            <div className="grid lean-status-grid">
              <Fact label="Start" value="Pick one quest" />
              <Fact label="Connect" value="Save your chess username" />
              <Fact label="Return" value="Check the proof card" />
            </div>
            <div className="button-row">
              <Link href="/challenges" className="button primary">Browse quests</Link>
              <Link href="/connect" className="button secondary">Connect account</Link>
            </div>
          </section>
        )}

        <section className="big-grid home-secondary-grid" aria-label="Useful Side Quest Chess routes">
          <article className="mission-card">
            <span className="eyebrow">Daily quest</span>
            <h2>One bad idea for today.</h2>
            <p>A simple daily reason to come back without browsing every route.</p>
            <Link href="/today" className="button secondary">Open today’s quest</Link>
          </article>

          <article className="mission-card">
            <span className="eyebrow">Badges</span>
            <h2>Collect proof you survived.</h2>
            <p>Completed quests unlock heraldic badge progress and bragging rights.</p>
            <Link href="/badges" className="button secondary">View badges</Link>
          </article>

          <article className="mission-card">
            <span className="eyebrow">Trust</span>
            <h2>Public games only.</h2>
            <p>SQC never needs your chess-site password or PGN uploads.</p>
            <Link href="/support" className="button secondary">Support & privacy</Link>
          </article>
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
        <strong>+{challenge.reward} points</strong>
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
