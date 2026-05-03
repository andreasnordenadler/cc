import Link from "next/link";
import ChallengeBadge from "@/components/challenge-badge";
import { currentUser } from "@clerk/nextjs/server";
import SiteNav from "@/components/site-nav";
import { checkActiveChallenge, startChallenge } from "@/app/actions";
import { CHALLENGES } from "@/lib/challenges";
import { getVerifierStateLabel, getVerifierStatus } from "@/lib/verifier-status";
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

export default async function AccountPage() {
  const user = await currentUser();
  const metadata = user?.publicMetadata ? (user.publicMetadata as UserMetadataRecord) : {};
  const lichessUsername = getLichessUsername(metadata);
  const chessComUsername = getChessComUsername(metadata);
  const activeChallenge = getActiveChallenge(metadata);
  const runnerDisplayName = getRunnerDisplayName(metadata) || user?.username || user?.firstName || "Chaos résumé";
  const runnerBio = getRunnerBio(metadata);
  const attempts = getChallengeAttempts(metadata).slice().reverse();
  const progress = getChallengeProgress(metadata);
  const completedSet = new Set(progress.completedChallengeIds);
  const liveVerifierCount = CHALLENGES.filter((challenge) => getVerifierStatus(challenge).state === "live").length;
  const completedChallenges = CHALLENGES.filter((challenge) => completedSet.has(challenge.id));
  const betaStarterChallengeIds = [
    "knights-before-coffee",
    "no-castle-club",
    "queen-never-heard-of-her",
  ];
  const betaStarterChallenges = betaStarterChallengeIds
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
  const hasActiveDare = Boolean(activeChallengeRecord);
  const hasLatestReceipt = Boolean(latestActiveAttempt);
  const betaPreflightCleared = [Boolean(user), hasChessIdentity, hasActiveDare, hasLatestReceipt].filter(Boolean).length;

  return (
    <main className="site-shell">
      <SiteNav isSignedIn={Boolean(user)} active="account" />

      <div className="content-wrap">
        <section className="hero-card">
          <span className="eyebrow">Profile / brag shelf</span>
          <h1>{runnerDisplayName}</h1>
          <p className="hero-copy">
            {runnerBio || "Proof that your bad chess decisions were at least documented."}
          </p>
          {user ? (
            <Link href="/profile" className="button secondary">Edit profile and usernames</Link>
          ) : (
            <div className="button-row hero-actions">
              <Link href="/sign-in" className="button primary">Sign in to test the full loop</Link>
              <Link href="/profile" className="button secondary">Preview profile setup</Link>
            </div>
          )}
          <div className="stats-row">
            <span>{progress.totalRewardPoints} pts</span>
            <span>{progress.totalCompletedChallenges} completed</span>
            <span>{attempts.length} attempts logged</span>
          </div>
        </section>

        <section className="mission-card test-drive-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">End-to-end test drive</span>
              <h2>Try the full SQC loop in five minutes.</h2>
            </div>
            <span className="badge gold">manual QA path</span>
          </div>
          <div className="checker-flow" aria-label="Side Quest Chess manual test flow">
            <div className="flow-step ready">
              <strong>1. Profile</strong>
              <p>Save a display name, brag line, and either chess username.</p>
            </div>
            <div className="flow-step ready">
              <strong>2. Quest</strong>
              <p>Pick any starter quest; all ten can verify Lichess or Chess.com games.</p>
            </div>
            <div className="flow-step hot">
              <strong>3. Proof</strong>
              <p>Check latest games, then review the pass, fail, or pending receipt.</p>
            </div>
          </div>
          <div className="button-row">
            <Link href="/profile" className="button primary">Start profile setup</Link>
            <Link href={activeChallengeRecord ? "/result" : "/challenges"} className="button secondary">
              {activeChallengeRecord ? "Review latest result" : "Pick first quest"}
            </Link>
          </div>
        </section>

        <section className="mission-card beta-preflight-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">Private beta preflight</span>
              <h2>{betaPreflightCleared}/4 tester steps ready</h2>
            </div>
            <span className={betaPreflightCleared === 4 ? "badge green" : "badge blue"}>
              {betaPreflightCleared === 4 ? "ready to share" : "guided setup"}
            </span>
          </div>
          <p>
            Use this as the friend-test checklist before sending a result screenshot: sign in, connect one chess identity, make a quest active, then generate a latest-game receipt.
          </p>
          <div className="checker-flow" aria-label="Private beta readiness checklist">
            <div className={user ? "flow-step ready" : "flow-step"}>
              <strong>{user ? "✓ Signed in" : "1. Sign in"}</strong>
              <p>{user ? "The beta run can save profile details and receipts." : "Create a beta runner profile so the loop can remember progress."}</p>
            </div>
            <div className={hasChessIdentity ? "flow-step ready" : "flow-step"}>
              <strong>{hasChessIdentity ? "✓ Chess identity set" : "2. Add Lichess or Chess.com"}</strong>
              <p>{hasChessIdentity ? `Using ${lichessUsername || chessComUsername} for latest-game checks.` : "One public username is enough; no passwords or game uploads."}</p>
            </div>
            <div className={hasActiveDare ? "flow-step ready" : "flow-step"}>
              <strong>{hasActiveDare ? "✓ Quest active" : "3. Pick a quest"}</strong>
              <p>{hasActiveDare ? `${activeChallengeRecord?.title} is ready for the proof loop.` : "Choose one of the ten dual-host starter quests."}</p>
            </div>
            <div className={hasLatestReceipt ? "flow-step hot" : "flow-step"}>
              <strong>{hasLatestReceipt ? "✓ Receipt generated" : "4. Check latest games"}</strong>
              <p>{hasLatestReceipt ? "The result page has a pass, fail, or pending receipt to review." : "Run one latest-game check after a real game so feedback is visible."}</p>
            </div>
          </div>
          <div className="button-row">
            <Link href={hasChessIdentity ? "/challenges" : "/connect"} className="button primary">
              {hasChessIdentity ? "Pick or change quest" : "Connect chess identity"}
            </Link>
            <Link href="/beta" className="button secondary">Open tester script</Link>
          </div>
        </section>

        <section className="mission-card account-beta-starter-route">
          <div className="section-head">
            <div>
              <span className="eyebrow">First tester route</span>
              <h2>Start with three quests, not the whole deck.</h2>
            </div>
            <span className="badge gold">choice-saver</span>
          </div>
          <p>
            For a first private-beta pass, run the smallest useful ladder from the account page: one easy proof loop, one clean verifier check, then one memorable chaos attempt.
          </p>
          <div className="grid" aria-label="Account private beta starter route">
            {betaStarterChallenges.map((challenge, index) => {
              const verifierStatus = getVerifierStatus(challenge);
              const isActiveChallenge = activeChallengeRecord?.id === challenge.id;

              return (
                <article className="fact" key={challenge.id}>
                  <span>Step {index + 1} · {challenge.difficulty}</span>
                  <ChallengeBadge challenge={challenge} earned={completedSet.has(challenge.id)} />
                  <strong>{challenge.title}</strong>
                  <p>{challenge.objective}</p>
                  <p className="muted">{verifierStatus.summary}</p>
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
            <span className="eyebrow">Active quest</span>
            <h2>{activeChallengeRecord?.title ?? "None active"}</h2>
            <p>{activeChallengeRecord?.objective ?? "Choose a side quest and start making questionable decisions."}</p>
            <Link href={activeChallengeRecord ? `/challenges/${activeChallengeRecord.id}` : "/challenges"} className="button secondary">
              {activeChallengeRecord ? "Continue quest" : "Pick a bad idea"}
            </Link>
          </article>
        </section>

        <section className="mission-card quest-launch-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">Quest launcher</span>
              <h2>Pick a quest without leaving the test drive.</h2>
            </div>
            <span className="badge green">{liveVerifierCount} live verifiers</span>
          </div>
          <p>
            Every starter quest can now be selected directly from the account page. Beginner quests are intentionally easier to understand; every current quest can create automated latest-game receipts from Lichess or Chess.com today.
          </p>
          <div className="grid">
            {CHALLENGES.map((challenge) => {
              const verifierStatus = getVerifierStatus(challenge);
              const verifierLabel = getVerifierStateLabel(verifierStatus);
              const isActiveChallenge = activeChallengeRecord?.id === challenge.id;

              return (
                <article className="fact" key={challenge.id}>
                  <span>{challenge.difficulty} · +{challenge.reward} pts</span>
                  <ChallengeBadge challenge={challenge} earned={completedSet.has(challenge.id)} />
                  <strong>{challenge.title}</strong>
                  <p>{challenge.objective}</p>
                  <span className={verifierLabel.className}>{verifierLabel.label}</span>
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
                <ChallengeBadge challenge={challenge} earned={completedSet.has(challenge.id)} />
                <strong>{challenge.badge}</strong>
              </article>
            ))}
          </div>
        </section>

        <section className="mission-card active-run-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">Active quest checker</span>
              <h2>{activeChallengeRecord?.title ?? "Pick a quest first"}</h2>
            </div>
            <span className="badge blue">{activeChallenge?.status ?? "idle"}</span>
          </div>
          <p>{challengeBanner(activeChallenge)}</p>

          <div className="checker-flow" aria-label="Active quest verification flow">
            <div className="flow-step ready">
              <strong>1. Identity</strong>
              <p>{lichessUsername || chessComUsername ? `${lichessUsername || chessComUsername} connected` : "Add Lichess or Chess.com on Connect."}</p>
            </div>
            <div className="flow-step ready">
              <strong>2. Play real chess</strong>
              <p>No upload chore. Finish games on the platform you already use.</p>
            </div>
            <div className="flow-step hot">
              <strong>3. Check latest games</strong>
              <p>Side Quest Chess looks for quest evidence and records passed, failed, or pending proof.</p>
            </div>
          </div>

          {activeChallengeRecord ? (
            <form action={checkActiveChallenge} className="button-row">
              <button type="submit" className="button primary">Check latest games</button>
              <Link href={`/challenges/${activeChallengeRecord.id}`} className="button secondary">View quest rules</Link>
            </form>
          ) : (
            <Link href="/challenges" className="button primary">Pick a bad idea</Link>
          )}

          <article className="note-card latest-check">
            <span className="eyebrow">Latest check</span>
            <h3>{latestAttemptSummary.headline}</h3>
            <p>{latestAttemptSummary.detail}</p>
            <small>{latestAttemptSummary.meta}</small>
          </article>
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
