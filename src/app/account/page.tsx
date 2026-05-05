import Link from "next/link";
import ChallengeBadge from "@/components/challenge-badge";
import { currentUser } from "@clerk/nextjs/server";
import SiteNav from "@/components/site-nav";
import { redirect } from "next/navigation";
import { CHALLENGES } from "@/lib/challenges";
import {
  formatAttemptStatus,
  formatTime,
  getActiveChallenge,
  getChallengeAttempts,
  getChallengeProgress,
  getChessComUsername,
  getLatestChallengeAttempt,
  getLichessUsername,
  getRunnerBio,
  getRunnerDisplayName,
  type UserMetadataRecord,
} from "@/lib/user-metadata";

export default async function MyQuestLogPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const metadata = user.publicMetadata ? (user.publicMetadata as UserMetadataRecord) : {};
  const lichessUsername = getLichessUsername(metadata);
  const chessComUsername = getChessComUsername(metadata);
  const activeChallenge = getActiveChallenge(metadata);
  const runnerDisplayName = getRunnerDisplayName(metadata) || user.username || user.firstName || "SQC player";
  const runnerBio = getRunnerBio(metadata);
  const attempts = getChallengeAttempts(metadata).slice().reverse();
  const progress = getChallengeProgress(metadata);
  const completedSet = new Set(progress.completedChallengeIds);
  const completedChallenges = CHALLENGES.filter((challenge) => completedSet.has(challenge.id));
  const activeChallengeRecord = activeChallenge?.id
    ? CHALLENGES.find((challenge) => challenge.id === activeChallenge.id)
    : null;
  const connectedCount = [lichessUsername, chessComUsername].filter(Boolean).length;
  const hasChessIdentity = connectedCount > 0;

  return (
    <main className="site-shell">
      <SiteNav isSignedIn active="account" />

      <div className="content-wrap my-quest-log focused-quest-log">
        <div className="quest-log-top-grid">
          <section className="hero-card quest-log-hero focused-quest-hero">
          <div>
            <h1>{runnerDisplayName}</h1>
            <p className="hero-copy">
              {runnerBio || "Your connected accounts, current quest, points, proof, and earned coat of arms."}
            </p>
          </div>
          <div className="stats-row">
            <span>{progress.totalRewardPoints} points</span>
            <span>{completedChallenges.length} coat{completedChallenges.length === 1 ? "" : "s"} of arms</span>
            <span>{attempts.length} proof receipt{attempts.length === 1 ? "" : "s"}</span>
          </div>
          </section>


          <section className="mission-card quest-log-current-card compact-current-quest-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">Current quest status</span>
              {!activeChallengeRecord ? <h2>No active quest.</h2> : null}
            </div>
          </div>

          {activeChallengeRecord ? (
            <Link href={`/challenges/${activeChallengeRecord.id}`} className="current-quest-coat-link" aria-label={`Open ${activeChallengeRecord.title} quest page`}>
              <ChallengeBadge challenge={activeChallengeRecord} presentation="art" size="hero" earned={completedSet.has(activeChallengeRecord.id)} />
              <small className="current-quest-coat-caption">{activeChallengeRecord.title}</small>
            </Link>
          ) : (
            <Link href="/challenges" className="current-quest-empty-link">
              <div className="quest-log-empty-badge" aria-hidden="true">?</div>
              <span>Choose a quest</span>
            </Link>
          )}
          </section>


        </div>

        <section className="mission-card quest-log-accounts-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">Connected accounts</span>
              <h2>{hasChessIdentity ? "Ready for proof." : "Connect chess account."}</h2>
            </div>
            <span className={hasChessIdentity ? "badge green" : "badge blue"}>
              {connectedCount}/2 connected
            </span>
          </div>
          <div className="account-connection-grid">
            <article className={lichessUsername ? "connection-card connected" : "connection-card"}>
              <span>Lichess</span>
              <strong>{lichessUsername || "Not connected"}</strong>
              <p>{lichessUsername ? "Used for public latest-game proof checks." : "Add your public username. No password needed."}</p>
            </article>
            <article className={chessComUsername ? "connection-card connected" : "connection-card"}>
              <span>Chess.com</span>
              <strong>{chessComUsername || "Not connected"}</strong>
              <p>{chessComUsername ? "Used for public latest-game proof checks." : "Add your public username. No password needed."}</p>
            </article>
          </div>
          <div className="button-row">
            <Link href="/connect" className="button primary">{hasChessIdentity ? "Update accounts" : "Connect chess account"}</Link>
            <Link href="/profile" className="button secondary">Edit profile</Link>
          </div>
        </section>

        <section className="mission-card quest-log-collection-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">Points and collected Coat of Arms</span>
              <h2>{progress.totalRewardPoints} points earned</h2>
            </div>
            <span className="badge gold">{completedChallenges.length}/{CHALLENGES.length} collected</span>
          </div>

          {completedChallenges.length ? (
            <div className="grid collected-coat-grid">
              {completedChallenges.map((challenge) => {
                const latestProof = getLatestChallengeAttempt(metadata, challenge.id);

                return (
                  <Link href={`/challenges/${challenge.id}`} className="fact collected-coat-link" key={challenge.id}>
                    <span>+{challenge.reward} pts</span>
                    <ChallengeBadge challenge={challenge} earned />
                    <strong>{challenge.badge}</strong>
                    <p>{challenge.title}</p>
                    <small>{latestProof ? `${formatAttemptStatus(latestProof.status)} proof • ${formatTime(latestProof.checkedAt)}` : "Open quest proof"}</small>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="empty-collection-state">
              <p>No coat of arms collected yet. Complete a quest and the earned shield will appear here with a link back to its proof.</p>
              <Link href="/challenges" className="button primary">Choose a quest</Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
