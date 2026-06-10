import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import ChallengeDeckBrowser, { ChallengeCard } from "@/components/challenge-deck-browser";
import RandomSoloQuestLink from "@/components/random-solo-quest-link";
import SiteNav from "@/components/site-nav";
import { CHALLENGES } from "@/lib/challenges";
import {
  getActiveChallenge,
  getChallengeProgress,
  type UserMetadataRecord,
} from "@/lib/user-metadata";

const suggestedPathChoices = [
  {
    id: "cautiously-heroic",
    label: "Cautiously heroic",
    copy: "I want chaos, but survivable.",
    cta: "Start with Knights Before Coffee",
    challengeId: "knights-before-coffee",
  },
  {
    id: "recklessly-meaningful",
    label: "Recklessly meaningful",
    copy: "I can handle one objectively bad idea.",
    cta: "Try No Castle Club",
    challengeId: "no-castle-club",
  },
  {
    id: "historically-unwise",
    label: "Historically unwise",
    copy: "I am here to become a cautionary tale.",
    cta: "Lose the queen, win anyway",
    challengeId: "queen-never-heard-of-her",
  },
];

const recommendedStartChallengeIds = ["knights-before-coffee", "no-castle-club", "finish-any-game"];

const liveStreamerHardQuestIds = ["queen-never-heard-of-her", "knightmare-mode", "rookless-rampage"];

const quickProofQuestIds = ["finish-any-game", "knights-before-coffee"];

export default async function ChallengesPage() {
  const { userId } = await auth();
  const user = userId ? await currentUser() : null;
  const metadata = user?.publicMetadata ? (user.publicMetadata as UserMetadataRecord) : {};
  const activeChallenge = getActiveChallenge(metadata);
  const progress = getChallengeProgress(metadata);
  const completedSet = new Set(progress.completedChallengeIds);
  const currentChallenge = activeChallenge?.id
    ? CHALLENGES.find((challenge) => challenge.id === activeChallenge.id) ?? null
    : null;
  const activeIncompleteChallengeId = currentChallenge && !completedSet.has(currentChallenge.id)
    ? currentChallenge.id
    : undefined;
  const randomSoloQuestIds = CHALLENGES
    .filter((challenge) => !challenge.id.includes("coming-soon"))
    .map((challenge) => challenge.id);
  const suggestedPath = suggestedPathChoices
    .map((choice) => ({
      ...choice,
      challenge: CHALLENGES.find((challenge) => challenge.id === choice.challengeId) ?? null,
    }))
    .filter((choice): choice is (typeof suggestedPathChoices)[number] & { challenge: (typeof CHALLENGES)[number] } => Boolean(choice.challenge));
  const recommendedStartChallenges = recommendedStartChallengeIds
    .map((challengeId) => CHALLENGES.find((challenge) => challenge.id === challengeId))
    .filter((challenge): challenge is (typeof CHALLENGES)[number] => Boolean(challenge));
  const liveStreamerHardQuests = liveStreamerHardQuestIds
    .map((challengeId) => CHALLENGES.find((challenge) => challenge.id === challengeId))
    .filter((challenge): challenge is (typeof CHALLENGES)[number] => Boolean(challenge));
  const quickProofQuests = quickProofQuestIds
    .map((challengeId) => CHALLENGES.find((challenge) => challenge.id === challengeId))
    .filter((challenge): challenge is (typeof CHALLENGES)[number] => Boolean(challenge));

  return (
    <main className="site-shell">
      <SiteNav isSignedIn={Boolean(userId)} active="challenges" />

      <div className="content-wrap">
        <section className="hero-card side-quests-hub-hero">
          <h1>Pick your next bad idea.</h1>
          <p className="hero-copy">
            Side Quests is the hub: pick a Solo Side Quest for yourself, or start a Multiplayer Side Quest when the bad idea deserves witnesses.
          </p>
        </section>

        <section className="grid side-quest-mode-grid" aria-label="Side Quest modes">
          <article className="mission-card side-quest-mode-card">
            <span className="eyebrow">SQC Official Solo</span>
            <h2>One player. One ridiculous rule. One proof receipt.</h2>
            <p>Choose from the live-backed official deck, play on Lichess or Chess.com, then come back when the bad idea has evidence.</p>
            <Link href="#solo-side-quest-deck" className="button primary">Browse SQC Official</Link>
          </article>
          <article className="mission-card side-quest-mode-card">
            <span className="eyebrow">Community Solo</span>
            <h2>Player-made rules from the village notice board.</h2>
            <p>Browse public custom Solo Side Quests made by SQC players — the experimental, funny, occasionally cursed side of the catalog.</p>
            <Link href="/challenges/community" className="button primary">Browse Community</Link>
          </article>
          <article className="mission-card side-quest-mode-card group-mode-card">
            <span className="eyebrow">Multiplayer Side Quests</span>
            <h2>Multiplayer. Same nonsense, now with witnesses.</h2>
            <p>Create or join a Multiplayer Side Quest with shared rules, a proof window, a leaderboard, and multiplayer-valid proof separate from solo progress.</p>
            <Link href="/groupquests" className="button primary">Open Multiplayer Side Quests</Link>
          </article>
        </section>

        <div id="solo-side-quest-deck">
          <ChallengeDeckBrowser
            challenges={CHALLENGES}
            activeChallengeId={activeIncompleteChallengeId}
            completedChallengeIds={progress.completedChallengeIds}
          />
        </div>

        <section className="mission-card" aria-label="Recommended starting quests">
          <div className="section-head">
            <div>
              <span className="eyebrow">Where to begin</span>
              <h2>How heroic are you feeling today?</h2>
            </div>
            <RandomSoloQuestLink
              challengeIds={randomSoloQuestIds}
              activeChallengeId={activeIncompleteChallengeId}
              completedChallengeIds={progress.completedChallengeIds}
            />
          </div>
          <p>
            Pick a starting quest based on your current tolerance for terrible chess decisions, or let SQC throw you directly at a random Solo Side Quest.
          </p>
          <div className="grid" aria-label="Suggested starting path">
            {suggestedPath.map(({ id, label, copy, cta, challenge }) => (
              <article key={id} className="mission-card side-quest-mode-card">
                <span className="eyebrow">{label}</span>
                <h3>{challenge.title}</h3>
                <p>{copy}</p>
                <Link href={`/challenges/${challenge.id}`} className="button secondary">{cta}</Link>
              </article>
            ))}
          </div>
          <div className="big-grid starter-route-grid">
            {recommendedStartChallenges.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                completed={completedSet.has(challenge.id)}
                active={activeIncompleteChallengeId === challenge.id}
              />
            ))}
          </div>
        </section>

        <section className="mission-card" aria-label="Streamer-hard quest tiers">
          <div className="section-head">
            <div>
              <span className="eyebrow">Streamer-hard lane</span>
              <h2>Brutal is clip-worthy. Absurd is rated-only.</h2>
            </div>
          </div>
          <p>
            Brutal quests are deliberately viral but still runnable in casual or rated public games. Absurd quests are the no-excuses ceiling: rated public games only, higher points, and proof that should feel ridiculous enough to screenshot.
          </p>
          <div className="big-grid starter-route-grid">
            {liveStreamerHardQuests.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                completed={completedSet.has(challenge.id)}
                active={activeIncompleteChallengeId === challenge.id}
              />
            ))}
          </div>
        </section>

        <section className="mission-card" aria-label="Quick proof loop quests">
          <div className="section-head">
            <div>
              <span className="eyebrow">Quick proof loop</span>
              <h2>Pick, play, prove, collect quickly.</h2>
            </div>
          </div>
          <p>
            Good candidates when you want to test the whole Side Quest loop from the website: choose a quest, play one public game, come back for proof, then open the receipt.
          </p>
          <div className="big-grid starter-route-grid">
            {quickProofQuests.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                completed={completedSet.has(challenge.id)}
                active={activeIncompleteChallengeId === challenge.id}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
