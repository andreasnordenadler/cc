import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import AuthActionButtons from "@/components/auth-action-buttons";
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

const recommendationBands = [
  {
    label: "Want to start easy?",
    action: "Pick Knights Before Coffee",
    challengeId: "knights-before-coffee",
  },
  {
    label: "Looking for trouble?",
    action: "Start No Castle Club",
    challengeId: "no-castle-club",
  },
  {
    label: "Badass?",
    action: "Start Queen? Never Heard of Her",
    challengeId: "queen-never-heard-of-her",
  },
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
  const recommendedQuests = recommendationBands
    .map((band) => {
      const challenge = CHALLENGES.find((candidate) => candidate.id === band.challengeId);
      return challenge ? { ...band, challenge } : null;
    })
    .filter((entry): entry is (typeof recommendationBands)[number] & { challenge: (typeof CHALLENGES)[number] } => Boolean(entry));
  const activeQuestRecord = activeQuest?.id
    ? CHALLENGES.find((challenge) => challenge.id === activeQuest.id)
    : null;
  const connectedIdentity = [lichessUsername, chessComUsername].filter(Boolean).join(" / ");
  const badgePreviewChallenges = CHALLENGES.filter((challenge) => challenge.badgeIdentity.image).slice(0, 6);

  return (
    <main className="site-shell">
      <SiteNav isSignedIn={isSignedIn} active="home" />

      <div className="content-wrap">
        <section className={`hero-grid launch-home-hero clean-home-hero ${isSignedIn ? "" : "signed-out-home-hero"}`}>
          <article className="hero-card simplified-home-hero">
            <h1>Chess, but with stupidly hard side quests.</h1>
            <p className="hero-copy">
              {isSignedIn
                ? "Pick one quest, play a real Lichess or Chess.com game, then come back for an automatic proof card."
                : "Sign in, connect your public chess usernames, choose one ridiculous quest, and let Side Quest Chess check your latest real game."}
            </p>
            {isSignedIn ? (
              <>
                <div className="button-row hero-actions">
                  <Link href="/challenges" className="button primary">Browse quests</Link>
                  <Link href="/today" className="button secondary">Today’s quest</Link>
                  <Link href="/connect" className="button secondary">Connect account</Link>
                </div>
                <p className="plain-loop-copy">Pick → play → prove. One quest at a time.</p>
              </>
            ) : (
              <div className="button-row hero-actions signed-out-hero-auth-actions" aria-label="Sign in or connect">
                <AuthActionButtons />
              </div>
            )}
          </article>

          <aside className="side-card card recommended-quests-panel signed-out-start-panel">
            <div>
              <span className="eyebrow">Where to begin</span>
              <h2>Choose your level of bad idea.</h2>
              <p>Start with the quest that matches your current appetite for chaos.</p>
            </div>
            <div className="quest-list signed-out-quest-preview difficulty-start-preview" aria-label="Recommended quests by appetite">
              {recommendedQuests.map(({ label, action, challenge }) => (
                <Link
                  key={challenge.id}
                  href={`/challenges/${challenge.id}`}
                  className="quest-list-item final-bare-quest-card difficulty-start-card"
                  style={{
                    gridTemplateColumns: "1fr",
                    justifyItems: "center",
                    alignItems: "center",
                    textAlign: "center",
                    background: "transparent",
                    borderColor: "transparent",
                    boxShadow: "none",
                    padding: "12px 8px",
                  }}
                >
                  <span className="quest-list-copy final-bare-quest-copy" style={{ display: "grid", justifyItems: "center", gap: "8px", background: "transparent" }}>
                    <small className="quest-list-difficulty" style={{ background: "transparent", padding: 0, borderRadius: 0 }}>{label}</small>
                    <strong>{action}</strong>
                  </span>
                  <ChallengeBadge challenge={challenge} presentation="art" />
                </Link>
              ))}
            </div>
          </aside>
        </section>

        {!isSignedIn ? (
          <section className="mission-card signed-out-explainer" aria-label="What Side Quest Chess is for signed-out visitors">
            <div className="section-head">
              <div>
                <span className="eyebrow">What happens after sign-in</span>
                <h2>A tiny loop, not another chess dashboard.</h2>
              </div>
            </div>
            <div className="checker-flow signed-out-loop-cards" aria-label="Signed-out product explanation">
              <div className="flow-step ready">
                <strong>Choose one quest</strong>
                <p>Start easy, look for trouble, or go straight for something unhinged. Each quest has one weird rule and a badge.</p>
              </div>
              <div className="flow-step ready">
                <strong>Play where you already play</strong>
                <p>Use a normal public Lichess or Chess.com game. Side Quest Chess never asks for chess-site passwords.</p>
              </div>
              <div className="flow-step ready">
                <strong>Get the receipt</strong>
                <p>The latest-game checker returns passed, failed, or pending with a shareable proof card.</p>
              </div>
            </div>
          </section>
        ) : (
          <section className="mission-card" aria-label="How Side Quest Chess proof works">
            <div className="section-head">
              <div>
                <span className="eyebrow">Proof loop</span>
                <h2>From bad idea to brag receipt.</h2>
              </div>
              <span className="badge blue">3 steps</span>
            </div>
            <p>
              Pick one quest, play a real public game, then turn the latest-game check into a result card and saved proof log before the next ridiculous quest begins.
            </p>
            <div className="checker-flow" aria-label="Pick play prove loop">
              <Link href="/challenges" className="flow-step ready clickable-quest-card">
                <strong>1. Pick the quest</strong>
                <p>Choose how hard you want to go, then make one quest active.</p>
              </Link>
              <Link href="/account" className="flow-step hot clickable-quest-card">
                <strong>2. Play real chess</strong>
                <p>Use Lichess or Chess.com public games. No PGN uploads, no password nonsense.</p>
              </Link>
              <Link href="/result" className="flow-step ready clickable-quest-card">
                <strong>3. Prove or retry</strong>
                <p>Share a passed receipt, understand a miss, or save it in the proof log.</p>
              </Link>
            </div>
            <div className="button-row">
              <Link href="/account" className="button primary">Run latest-game check</Link>
              <Link href="/proof-log" className="button secondary">Open proof log</Link>
            </div>
          </section>
        )}


        <section className="hero-card home-badge-vault-card" aria-label="SQC badge vault preview">
          <span className="eyebrow">SQC badge vault</span>
          <h2>Every bad idea deserves a coat of arms.</h2>
          <p className="hero-copy">
            Side Quest Chess badges are collectible heraldic receipts: each shield explains the exact nonsense you survived, why it matters, and what your friends should mock respectfully.
          </p>
          <div className="home-badge-art-row" aria-label="Side Quest Chess coat of arms preview">
            {badgePreviewChallenges.map((challenge) => (
              <ChallengeBadge key={challenge.id} challenge={challenge} presentation="art" earned />
            ))}
          </div>
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
            <p>
              {activeQuestRecord
                ? "Play the active quest on Lichess or Chess.com, then jump straight to Account to run the latest-game check."
                : "Choose one quest first so Account knows which weird rule to judge after your next public game."}
            </p>
            <div className="button-row">
              <Link href={activeQuestRecord ? "/account" : "/challenges"} className="button primary">
                {activeQuestRecord ? "Run latest-game check" : "Choose a quest"}
              </Link>
              {activeQuestRecord ? (
                <Link href={`/challenges/${activeQuestRecord.id}`} className="button secondary">Review active rules</Link>
              ) : (
                <Link href="/account" className="button secondary">Account details</Link>
              )}
            </div>
          </section>
        ) : null}

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
