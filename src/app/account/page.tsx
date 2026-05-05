import Link from "next/link";
import ChallengeBadge from "@/components/challenge-badge";
import { currentUser } from "@clerk/nextjs/server";
import SiteNav from "@/components/site-nav";
import { redirect } from "next/navigation";
import { checkActiveChallenge } from "@/app/actions";
import { CHALLENGES } from "@/lib/challenges";
import {
  challengeBanner,
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
  const latestActiveAttempt = activeChallengeRecord
    ? getLatestChallengeAttempt(metadata, activeChallengeRecord.id)
    : null;
  const connectedCount = [lichessUsername, chessComUsername].filter(Boolean).length;
  const hasChessIdentity = connectedCount > 0;

  return (
    <main className="site-shell">
      <SiteNav isSignedIn active="account" />

      <div className="content-wrap my-quest-log focused-quest-log">
        <section className="hero-card quest-log-hero focused-quest-hero">
          <div>
            <span className="eyebrow">My Quest Log</span>
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

        <section className="mission-card quest-log-accounts-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">Connected accounts</span>
              <h2>{hasChessIdentity ? "Ready to check public games." : "Connect where you play chess."}</h2>
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
            <Link href="/connect" className="button primary">{hasChessIdentity ? "Update connected accounts" : "Connect chess account"}</Link>
            <Link href="/profile" className="button secondary">Edit profile</Link>
          </div>
        </section>

        <section className="mission-card quest-log-current-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">Current quest status</span>
              <h2>{activeChallengeRecord?.title ?? "No active quest."}</h2>
            </div>
            <span className={activeChallengeRecord ? "badge green" : "badge blue"}>
              {activeChallenge?.status ?? "idle"}
            </span>
          </div>

          <div className="quest-log-current-layout focused-current-layout">
            {activeChallengeRecord ? (
              <Link href={`/challenges/${activeChallengeRecord.id}`} className="quest-log-badge-link" aria-label={`Open ${activeChallengeRecord.title}`}>
                <ChallengeBadge challenge={activeChallengeRecord} earned={completedSet.has(activeChallengeRecord.id)} />
              </Link>
            ) : (
              <div className="quest-log-empty-badge" aria-hidden="true">?</div>
            )}
            <div>
              <p>{activeChallengeRecord?.objective ?? "Choose a quest when you are ready to start collecting proof."}</p>
              <p className="muted">{challengeBanner(activeChallenge)}</p>
              {latestActiveAttempt ? (
                <article className="note-card latest-check compact-proof-card">
                  <span className="eyebrow">Latest proof for this quest</span>
                  <h3>{formatAttemptStatus(latestActiveAttempt.status)}</h3>
                  <p>{latestActiveAttempt.summary}</p>
                  <small>{latestActiveAttempt.gameId ? `Game ${latestActiveAttempt.gameId}` : "Saved proof receipt"} • {formatTime(latestActiveAttempt.checkedAt)}</small>
                </article>
              ) : null}
              <div className="button-row">
                {activeChallengeRecord ? (
                  <form action={checkActiveChallenge} className="button-row compact-form">
                    <button type="submit" className="button primary">Check latest game</button>
                    <Link href={`/challenges/${activeChallengeRecord.id}`} className="button secondary">Open quest page</Link>
                    <Link href="/proof-log" className="button secondary">Proof log</Link>
                  </form>
                ) : (
                  <>
                    <Link href="/challenges" className="button primary">Choose a quest</Link>
                    <Link href="/proof-log" className="button secondary">Proof log</Link>
                  </>
                )}
              </div>
            </div>
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
