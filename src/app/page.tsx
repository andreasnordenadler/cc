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

const heroismOptions = [
  {
    label: "Cautiously heroic",
    copy: "I want chaos, but survivable.",
    cta: "Start with Knights Before Coffee",
    challengeId: "knights-before-coffee",
  },
  {
    label: "Recklessly meaningful",
    copy: "I can handle one objectively bad idea.",
    cta: "Try No Castle Club",
    challengeId: "no-castle-club",
  },
  {
    label: "Historically unwise",
    copy: "I am here to become a cautionary tale.",
    cta: "Lose the queen, win anyway",
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
  const activeQuestRecord = activeQuest?.id
    ? CHALLENGES.find((challenge) => challenge.id === activeQuest.id)
    : null;
  const connectedIdentity = [lichessUsername, chessComUsername].filter(Boolean).join(" / ");
  const badgePreviewChallenges = CHALLENGES.filter((challenge) => challenge.badgeIdentity.image).slice(0, 6);
  const heroismChoices = heroismOptions
    .map((option) => {
      const challenge = CHALLENGES.find((candidate) => candidate.id === option.challengeId);
      return challenge ? { ...option, challenge } : null;
    })
    .filter((entry): entry is (typeof heroismOptions)[number] & { challenge: (typeof CHALLENGES)[number] } => Boolean(entry));

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
                </div>
              </>
            ) : (
              <div className="button-row hero-actions signed-out-hero-auth-actions" aria-label="Sign in or connect">
                <AuthActionButtons />
              </div>
            )}
          </article>

          <aside className="side-card card recommended-quests-panel signed-out-start-panel heroism-selector-panel">
            <div className="heroism-selector-head">
              <span className="eyebrow">Where to begin</span>
              <h2>How heroic are you feeling today?</h2>
              <p>Pick a starting quest based on your current tolerance for terrible chess decisions.</p>
            </div>
            <div className="heroism-choice-list" aria-label="Choose a heroism level">
              {heroismChoices.map(({ label, copy, cta, challenge }) => (
                <Link key={challenge.id} href={`/challenges/${challenge.id}`} className="heroism-choice-card">
                  <ChallengeBadge challenge={challenge} presentation="art" earned />
                  <span className="heroism-choice-copy">
                    <strong>{label}</strong>
                    <small>{copy}</small>
                    <em>{cta}</em>
                  </span>
                </Link>
              ))}
            </div>
            <p className="heroism-custom-path">
              Or go <Link href="/challenges">find your own path</Link>.
            </p>
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
        ) : null}


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
                ? "Play the active quest on Lichess or Chess.com, then jump straight to My Quest Log to run the latest-game check."
                : "Choose one quest first so My Quest Log knows which weird rule to judge after your next public game."}
            </p>
            <div className="button-row">
              <Link href={activeQuestRecord ? "/account" : "/challenges"} className="button primary">
                {activeQuestRecord ? "Run latest-game check" : "Choose a quest"}
              </Link>
              {activeQuestRecord ? (
                <Link href={`/challenges/${activeQuestRecord.id}`} className="button secondary">Review active rules</Link>
              ) : (
                <Link href="/account" className="button secondary">My Quest Log</Link>
              )}
            </div>
          </section>
        ) : null}

        <section className="hero-card home-badge-vault-card" aria-label="Badge vault preview">
          <h2>Every bad idea deserves a coat of arms.</h2>
          <p className="hero-copy">
            Side Quest Chess badges are collectible heraldic receipts: each shield explains the exact nonsense you survived, why it matters, and what your friends should mock respectfully.
          </p>
          <div className="home-badge-art-row" aria-label="Side Quest Chess coat of arms preview">
            {badgePreviewChallenges.map((challenge) => {
              const isActiveBadge = isSignedIn && activeQuest?.id === challenge.id;

              return (
                <Link
                  key={challenge.id}
                  href="/challenges"
                  className={isActiveBadge ? "home-badge-art-link active-home-quest-badge" : "home-badge-art-link"}
                  aria-label={isActiveBadge ? `Open active quest: ${challenge.title}` : "Open quests page"}
                >
                  {isActiveBadge ? <span className="active-quest-stamp home-badge-active-stamp" aria-label="Active quest" /> : null}
                  <ChallengeBadge challenge={challenge} presentation="art" earned />
                </Link>
              );
            })}
          </div>
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
