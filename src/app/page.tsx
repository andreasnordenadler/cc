import Image from "next/image";
import Link from "next/link";
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
            <h1>Chess, but with stupidly hard side quests.</h1>
            <p className="hero-copy">
              Pick one quest, play a real Lichess or Chess.com game, then come back for an automatic proof card.
            </p>
            <div className="button-row hero-actions">
              <Link href="/path" className="button primary">Start starter path</Link>
              <Link href="/challenges" className="button secondary">Browse quests</Link>
              <Link href="/connect" className="button secondary">Connect account</Link>
            </div>
            <p className="plain-loop-copy">Pick → play → prove. No PGN uploads. No chess-site passwords.</p>
          </article>

          <aside className="side-card card recommended-quests-panel">
            <div>
              <h2>Start with the starter path.</h2>
              <p>Three clear quests before the full chaos deck.</p>
            </div>
            <div className="quest-list" aria-label="Recommended first quests">
              {recommendedQuests.map((quest) => (
                <Link
                  key={quest.id}
                  href={`/challenges/${quest.id}`}
                  className="quest-list-item final-bare-quest-card"
                  style={{
                    gridTemplateColumns: "1fr",
                    justifyItems: "center",
                    textAlign: "center",
                    background: "transparent",
                    borderColor: "transparent",
                    boxShadow: "none",
                    padding: "12px 8px",
                  }}
                >
                  {quest.badgeIdentity.image ? (
                    <Image
                      src={quest.badgeIdentity.image}
                      alt=""
                      width={112}
                      height={112}
                      className="final-bare-quest-logo"
                      style={{
                        width: "88px",
                        height: "88px",
                        objectFit: "contain",
                        filter: "drop-shadow(0 12px 18px rgba(0,0,0,.28))",
                      }}
                      unoptimized
                    />
                  ) : null}
                  <span className="quest-list-copy final-bare-quest-copy" style={{ display: "grid", justifyItems: "center", gap: "5px", background: "transparent" }}>
                    <small className="quest-list-difficulty" style={{ background: "transparent", padding: 0, borderRadius: 0 }}>{quest.difficulty}</small>
                    <strong>{quest.title}</strong>
                    <small>{quest.objective}</small>
                  </span>
                </Link>
              ))}
            </div>
            <div className="button-row">
              <Link href="/path" className="button primary">Open starter path</Link>
              <Link href="/today" className="button secondary">Or open today’s quest</Link>
            </div>
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
            <h2>Collect proof you survived.</h2>
            <p>Completed quests unlock heraldic badge progress and bragging rights.</p>
            <Link href="/badges" className="button secondary">View badges</Link>
          </article>

          <article className="mission-card homepage-trust-card">
            <h2>Public games only. No password nonsense.</h2>
            <p>
              Side Quest Chess checks public Lichess and Chess.com game records only. Testers should never share chess-site passwords; confusing receipts belong in the support packet with a screenshot.
            </p>
            <div className="button-row">
              <Link href="/support" className="button secondary">Support & privacy</Link>
              <Link href="/rules" className="button secondary">Proof rules</Link>
            </div>
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
