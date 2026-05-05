import Link from "next/link";
import ChallengeBadge from "@/components/challenge-badge";
import { currentUser } from "@clerk/nextjs/server";
import SiteNav from "@/components/site-nav";
import { checkActiveChallenge, startChallenge } from "@/app/actions";
import { CHALLENGES } from "@/lib/challenges";
import { getVerifierStatus } from "@/lib/verifier-status";
import {
  buildAttemptSummary,
  challengeBanner,
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
  const metadata = user?.publicMetadata ? (user.publicMetadata as UserMetadataRecord) : {};
  const lichessUsername = getLichessUsername(metadata);
  const chessComUsername = getChessComUsername(metadata);
  const activeChallenge = getActiveChallenge(metadata);
  const runnerDisplayName = getRunnerDisplayName(metadata) || user?.username || user?.firstName || "Unnamed hero";
  const runnerBio = getRunnerBio(metadata);
  const attempts = getChallengeAttempts(metadata).slice().reverse();
  const recentAttempts = attempts.slice(0, 3);
  const progress = getChallengeProgress(metadata);
  const completedSet = new Set(progress.completedChallengeIds);
  const completedChallenges = CHALLENGES.filter((challenge) => completedSet.has(challenge.id));
  const liveVerifierCount = CHALLENGES.filter((challenge) => getVerifierStatus(challenge).state === "live").length;
  const recommendedStartChallengeIds = [
    "knights-before-coffee",
    "no-castle-club",
    "queen-never-heard-of-her",
  ];
  const recommendedStartChallenges = recommendedStartChallengeIds
    .map((challengeId) => CHALLENGES.find((challenge) => challenge.id === challengeId))
    .filter((challenge): challenge is (typeof CHALLENGES)[number] => Boolean(challenge));
  const activeChallengeRecord = activeChallenge?.id
    ? CHALLENGES.find((challenge) => challenge.id === activeChallenge.id)
    : null;
  const latestActiveAttempt = activeChallengeRecord
    ? getLatestChallengeAttempt(metadata, activeChallengeRecord.id)
    : null;
  const latestAttemptSummary = buildAttemptSummary(latestActiveAttempt);
  const hasChessIdentity = Boolean(lichessUsername || chessComUsername);
  const playerTitle = progress.totalRewardPoints >= 600 ? "Chaos Merchant" : progress.totalCompletedChallenges > 0 ? "Quest Survivor" : "Bad Idea Apprentice";
  const proofIdentity = lichessUsername || chessComUsername;
  const questShelf = completedChallenges.length ? completedChallenges.slice(0, 6) : CHALLENGES.slice(0, 6);

  return (
    <main className="site-shell">
      <SiteNav isSignedIn={Boolean(user)} active="account" />

      <div className="content-wrap my-quest-log">
        <section className="hero-card quest-log-hero">
          <div>
            <span className="eyebrow">My Quest Log</span>
            <h1>{runnerDisplayName}</h1>
            <p className="hero-copy">
              {runnerBio || "Your side-quest dashboard: current quest, proof receipts, coat of arms, and the next bad idea."}
            </p>
          </div>
          <div className="stats-row">
            <span>{playerTitle}</span>
            <span>{progress.totalRewardPoints} pts</span>
            <span>{progress.totalCompletedChallenges} completed</span>
            <span>{attempts.length} receipts</span>
          </div>
          <div className="button-row hero-actions">
            {!user ? (
              <Link href="/sign-in" className="button primary">Sign in to start</Link>
            ) : !hasChessIdentity ? (
              <Link href="/connect" className="button primary">Connect chess account</Link>
            ) : activeChallengeRecord ? (
              <form action={checkActiveChallenge} className="button-row compact-form">
                <button type="submit" className="button primary">Check latest game</button>
                <Link href={`/challenges/${activeChallengeRecord.id}`} className="button secondary">View active quest</Link>
              </form>
            ) : (
              <Link href="/challenges" className="button primary">Choose first quest</Link>
            )}
            <Link href="/profile" className="button secondary">Edit profile</Link>
          </div>
        </section>

        <section className="mission-card quest-log-current-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">Current quest</span>
              <h2>{activeChallengeRecord?.title ?? "Choose your next ridiculous mission."}</h2>
            </div>
            <span className={activeChallengeRecord ? "badge green" : "badge blue"}>
              {activeChallenge?.status ?? "no active quest"}
            </span>
          </div>

          <div className="quest-log-current-layout">
            {activeChallengeRecord ? (
              <ChallengeBadge challenge={activeChallengeRecord} earned={completedSet.has(activeChallengeRecord.id)} />
            ) : (
              <div className="quest-log-empty-badge" aria-hidden="true">?</div>
            )}
            <div>
              <p>{activeChallengeRecord?.objective ?? "Pick one quest, play a normal public game on Lichess or Chess.com, then come back here for the receipt."}</p>
              <p className="muted">{challengeBanner(activeChallenge)}</p>
              <div className="checker-flow compact-checker" aria-label="Current quest next steps">
                <div className={hasChessIdentity ? "flow-step ready" : "flow-step"}>
                  <strong>{hasChessIdentity ? "✓ Chess identity ready" : "1. Connect chess identity"}</strong>
                  <p>{proofIdentity ? `${proofIdentity} is used for latest-game checks.` : "Add a public Lichess or Chess.com username. No passwords."}</p>
                </div>
                <div className={activeChallengeRecord ? "flow-step ready" : "flow-step"}>
                  <strong>{activeChallengeRecord ? "✓ Quest selected" : "2. Pick one quest"}</strong>
                  <p>{activeChallengeRecord ? "Play it wherever you already play chess." : "Start with a recommended quest or browse them all."}</p>
                </div>
                <div className={latestActiveAttempt ? "flow-step hot" : "flow-step"}>
                  <strong>{latestActiveAttempt ? "✓ Latest receipt exists" : "3. Check latest game"}</strong>
                  <p>{latestActiveAttempt ? "Review the latest pass, fail, or pending result." : "After a game, SQC judges the active quest automatically."}</p>
                </div>
              </div>
              <div className="button-row">
                {activeChallengeRecord ? (
                  <form action={checkActiveChallenge} className="button-row compact-form">
                    <button type="submit" className="button primary">Check latest game</button>
                    <Link href="/result" className="button secondary">Latest result</Link>
                    <Link href="/challenges" className="button secondary">Change quest</Link>
                  </form>
                ) : (
                  <>
                    <Link href="/challenges" className="button primary">Choose a quest</Link>
                    <Link href="/connect" className="button secondary">Connect account</Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mission-card account-beta-starter-route">
          <div className="section-head">
            <div>
              <span className="eyebrow">Suggested starts</span>
              <h2>Easy, meaningful, or historically unwise.</h2>
            </div>
            <span className="badge gold">{liveVerifierCount} live verifiers</span>
          </div>
          <div className="grid" aria-label="Recommended My Quest Log quest picks">
            {recommendedStartChallenges.map((challenge, index) => {
              const isActiveChallenge = activeChallengeRecord?.id === challenge.id;

              return (
                <article className="fact" key={challenge.id}>
                  <span>{["Cautiously heroic", "Recklessly meaningful", "Historically unwise"][index] ?? "Quest pick"}</span>
                  <ChallengeBadge challenge={challenge} earned={completedSet.has(challenge.id)} />
                  <strong>{challenge.title}</strong>
                  <p>{challenge.objective}</p>
                  {user ? (
                    <form action={startChallenge} className="button-row">
                      <input type="hidden" name="challengeId" value={challenge.id} />
                      <button type="submit" className={isActiveChallenge ? "button secondary" : "button primary"}>
                        {isActiveChallenge ? "Active now" : "Make active"}
                      </button>
                      <Link href={`/challenges/${challenge.id}`} className="button secondary">Rules</Link>
                    </form>
                  ) : (
                    <Link href={`/challenges/${challenge.id}`} className="button secondary">Preview rules</Link>
                  )}
                </article>
              );
            })}
          </div>
          <p className="heroism-custom-path">
            Or go <Link href="/challenges">find your own path</Link>.
          </p>
        </section>

        <section className="big-grid quest-log-summary-grid">
          <article className="mission-card">
            <span className="eyebrow">Proof identity</span>
            <h2>{hasChessIdentity ? "Ready for receipts" : "Not connected yet"}</h2>
            <p>Lichess: {lichessUsername || "not set"}</p>
            <p>Chess.com: {chessComUsername || "not set"}</p>
            <Link href="/connect" className="button secondary">Update chess usernames</Link>
          </article>

          <article className="mission-card latest-check">
            <span className="eyebrow">Latest receipt</span>
            <h2>{latestAttemptSummary.headline}</h2>
            <p>{latestAttemptSummary.detail}</p>
            <small>{latestAttemptSummary.meta}</small>
            <Link href="/proof-log" className="button secondary">Open proof log</Link>
          </article>

          <article className="mission-card">
            <span className="eyebrow">Next unlock</span>
            <h2>{completedChallenges.length ? "Keep filling the shelf" : "First coat of arms awaits"}</h2>
            <p>{completedChallenges.length} of {CHALLENGES.length} coats of arms unlocked.</p>
            <Link href="/badges" className="button secondary">View Coat of Arms</Link>
          </article>
        </section>

        <section className="mission-card quest-log-shelf-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">Coat of Arms shelf</span>
              <h2>{completedChallenges.length ? "Proof you survived." : "Still gloriously empty."}</h2>
            </div>
            <span className="badge gold">{completedChallenges.length} unlocked</span>
          </div>
          <div className="grid">
            {questShelf.map((challenge) => (
              <article className="fact" key={challenge.id}>
                <span>{completedSet.has(challenge.id) ? "Unlocked" : "Locked"}</span>
                <ChallengeBadge challenge={challenge} earned={completedSet.has(challenge.id)} />
                <strong>{challenge.badge}</strong>
                <p>{challenge.title}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mission-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">Recent proof receipts</span>
              <h2>{recentAttempts.length ? "What SQC judged lately." : "No receipts yet."}</h2>
            </div>
            <Link href="/proof-log" className="button secondary">Full proof log</Link>
          </div>
          {recentAttempts.length ? (
            <div className="grid">
              {recentAttempts.map((attempt) => (
                <article className="fact" key={attempt.id ?? `${attempt.challengeId}-${attempt.checkedAt}`}>
                  <span>{attempt.status ?? "pending"}</span>
                  <strong>{attempt.summary}</strong>
                  <p>{attempt.checkedAt ? new Date(attempt.checkedAt).toLocaleString("en", { dateStyle: "medium", timeStyle: "short" }) : "Latest-game receipt"}</p>
                </article>
              ))}
            </div>
          ) : (
            <p>No attempts yet. Pick a quest, play a public game, then check the latest result.</p>
          )}
        </section>
      </div>
    </main>
  );
}
