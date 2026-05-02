import Link from "next/link";
import ChallengeBadge from "@/components/challenge-badge";
import { auth, currentUser } from "@clerk/nextjs/server";
import SiteNav from "@/components/site-nav";
import { CHALLENGES } from "@/lib/challenges";
import {
  getActiveChallenge,
  getChallengeProgress,
  getChessComUsername,
  getLichessUsername,
  type UserMetadataRecord,
} from "@/lib/user-metadata";

const recommendedQuestIds = [
  "knights-before-coffee",
  "no-castle-club",
  "queen-never-heard-of-her",
];

export default async function Home() {
  const { userId } = await auth();
  const isSignedIn = Boolean(userId);
  const user = isSignedIn ? await currentUser() : null;
  const metadata = user?.publicMetadata ? (user.publicMetadata as UserMetadataRecord) : {};
  const progress = getChallengeProgress(metadata);
  const activeQuest = getActiveChallenge(metadata);
  const lichessUsername = getLichessUsername(metadata);
  const chessComUsername = getChessComUsername(metadata);
  const recommendedQuests = recommendedQuestIds
    .map((questId) => CHALLENGES.find((challenge) => challenge.id === questId))
    .filter((challenge): challenge is (typeof CHALLENGES)[number] => Boolean(challenge));
  const activeQuestRecord = activeQuest?.id
    ? CHALLENGES.find((challenge) => challenge.id === activeQuest.id)
    : null;
  const connectedIdentity = [lichessUsername, chessComUsername].filter(Boolean).join(" / ");

  return (
    <main className="site-shell">
      <SiteNav isSignedIn={isSignedIn} active="home" />

      <div className="content-wrap">
        <section className="hero-grid launch-home-hero clean-home-hero">
          <article className="hero-card simplified-home-hero">
            <span className="eyebrow">Side Quest Chess</span>
            <h1>Chess, but with stupidly hard side quests.</h1>
            <p className="hero-copy">
              Pick one quest, play a real Lichess or Chess.com game, then come back for an automatic proof card.
            </p>
            <div className="button-row hero-actions">
              <Link href="/challenges" className="button primary">Start a quest</Link>
              <Link href="/connect" className="button secondary">Connect account</Link>
            </div>
            <p className="plain-loop-copy">Pick → play → prove. No PGN uploads. No chess-site passwords.</p>
          </article>

          <aside className="side-card card recommended-quests-panel">
            <div>
              <span className="eyebrow">Recommended first quests</span>
              <h2>Start with one of these.</h2>
              <p>Three clear routes before the full chaos deck.</p>
            </div>
            <div className="quest-list" aria-label="Recommended first quests">
              {recommendedQuests.map((quest) => (
                <Link key={quest.id} href={`/challenges/${quest.id}`} className="quest-list-item quest-list-item-with-logo clean-quest-logo-card">
                  <span className="quest-list-logo clean-quest-logo" aria-hidden="true">
                    <ChallengeBadge challenge={quest} earned />
                  </span>
                  <span className="quest-list-copy clean-quest-copy">
                    <small className="quest-list-difficulty">{quest.difficulty}</small>
                    <strong>{quest.title}</strong>
                    <small>{quest.objective}</small>
                  </span>
                </Link>
              ))}
            </div>
            <Link href="/today" className="button secondary">Or open today’s quest</Link>
          </aside>
        </section>

        {isSignedIn ? (
          <section className="card mission-card home-status-card compact-run-card">
            <div className="section-head">
              <div>
                <span className="eyebrow">Current run</span>
                <h2>{activeQuestRecord ? activeQuestRecord.title : "No active quest yet."}</h2>
              </div>
              <span className="badge gold readable-points">{progress.totalRewardPoints} points</span>
            </div>
            <div className="grid lean-status-grid">
              <Fact label="Chess account" value={connectedIdentity || "Add Lichess or Chess.com"} />
              <Fact label="Completed quests" value={`${progress.totalCompletedChallenges}`} />
            </div>
            <div className="button-row">
              <Link href={activeQuestRecord ? `/challenges/${activeQuestRecord.id}` : "/challenges"} className="button primary">
                {activeQuestRecord ? "Continue quest" : "Choose a quest"}
              </Link>
              <Link href="/account" className="button secondary">Account details</Link>
            </div>
          </section>
        ) : null}

        <section className="big-grid home-secondary-grid quieter-secondary-grid" aria-label="Useful Side Quest Chess routes">
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

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="fact">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
