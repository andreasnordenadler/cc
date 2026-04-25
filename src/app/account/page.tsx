import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import SiteNav from "@/components/site-nav";
import { CHALLENGES } from "@/lib/challenges";
import {
  getActiveChallenge,
  getChallengeAttempts,
  getChallengeProgress,
  getChessComUsername,
  getLichessUsername,
  type UserMetadataRecord,
} from "@/lib/user-metadata";

export default async function AccountPage() {
  const user = await currentUser();
  const metadata = user?.publicMetadata ? (user.publicMetadata as UserMetadataRecord) : {};
  const lichessUsername = getLichessUsername(metadata);
  const chessComUsername = getChessComUsername(metadata);
  const activeChallenge = getActiveChallenge(metadata);
  const attempts = getChallengeAttempts(metadata).slice().reverse();
  const progress = getChallengeProgress(metadata);
  const completedSet = new Set(progress.completedChallengeIds);
  const completedChallenges = CHALLENGES.filter((challenge) => completedSet.has(challenge.id));
  const activeChallengeRecord = activeChallenge?.id
    ? CHALLENGES.find((challenge) => challenge.id === activeChallenge.id)
    : null;

  return (
    <main className="site-shell">
      <SiteNav isSignedIn={Boolean(user)} active="account" />

      <div className="content-wrap">
        <section className="hero-card">
          <span className="eyebrow">Profile / brag shelf</span>
          <h1>{user?.username || user?.firstName || "Chaos résumé"}</h1>
          <p className="hero-copy">
            Proof that your bad chess decisions were at least documented.
          </p>
          <div className="stats-row">
            <span>{progress.totalRewardPoints} pts</span>
            <span>{progress.totalCompletedChallenges} completed</span>
            <span>{attempts.length} attempts logged</span>
          </div>
        </section>

        <section className="big-grid">
          <article className="mission-card">
            <span className="eyebrow">Current title</span>
            <h2>{progress.totalRewardPoints > 600 ? "Chaos Merchant" : "Bad Idea Apprentice"}</h2>
            <p>Earn titles by completing quests that would make a chess coach pause for several seconds.</p>
          </article>

          <article className="mission-card">
            <span className="eyebrow">Connected identities</span>
            <h2>{lichessUsername || chessComUsername ? "Ready for proof" : "No account connected"}</h2>
            <p>Lichess: {lichessUsername || "not set yet"}</p>
            <p>Chess.com: {chessComUsername || "not set yet"}</p>
            <Link href="/connect" className="button primary">Update identities</Link>
          </article>

          <article className="mission-card">
            <span className="eyebrow">Active dare</span>
            <h2>{activeChallengeRecord?.title ?? "None active"}</h2>
            <p>{activeChallengeRecord?.objective ?? "Choose a side quest and start making questionable decisions."}</p>
            <Link href={activeChallengeRecord ? `/challenges/${activeChallengeRecord.id}` : "/challenges"} className="button secondary">
              {activeChallengeRecord ? "Continue dare" : "Pick a bad idea"}
            </Link>
          </article>
        </section>

        <section className="mission-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">Badges</span>
              <h2>Achievement shelf</h2>
            </div>
            <span className="badge gold">{completedChallenges.length} unlocked</span>
          </div>
          <div className="grid">
            {CHALLENGES.slice(0, 6).map((challenge) => (
              <article className="fact" key={challenge.id}>
                <span>{completedSet.has(challenge.id) ? "Unlocked" : "Locked"}</span>
                <strong>{challenge.badge}</strong>
              </article>
            ))}
          </div>
        </section>

        <section className="mission-card">
          <span className="eyebrow">Recent chaos</span>
          {attempts.length ? (
            <div className="grid">
              {attempts.slice(0, 6).map((attempt) => (
                <article className="fact" key={attempt.id ?? `${attempt.challengeId}-${attempt.checkedAt}`}>
                  <span>{attempt.status ?? "pending"}</span>
                  <strong>{attempt.summary}</strong>
                </article>
              ))}
            </div>
          ) : (
            <p>No attempts yet. Your first verified side quest will show up here.</p>
          )}
        </section>
      </div>
    </main>
  );
}
