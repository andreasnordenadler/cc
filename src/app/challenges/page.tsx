import { auth, currentUser } from "@clerk/nextjs/server";
import ChallengeDeckBrowser, { ChallengeCard } from "@/components/challenge-deck-browser";
import SiteNav from "@/components/site-nav";
import { CHALLENGES } from "@/lib/challenges";
import {
  getActiveChallenge,
  getChallengeProgress,
  type UserMetadataRecord,
} from "@/lib/user-metadata";

const recommendedStartChallengeIds = ["knights-before-coffee", "no-castle-club", "queen-never-heard-of-her"];

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
  const recommendedStartChallenges = recommendedStartChallengeIds
    .map((challengeId) => CHALLENGES.find((challenge) => challenge.id === challengeId))
    .filter((challenge): challenge is (typeof CHALLENGES)[number] => Boolean(challenge));

  return (
    <main className="site-shell">
      <SiteNav isSignedIn={Boolean(userId)} active="challenges" />

      <div className="content-wrap">
        <section className="hero-card">
          <h1>Pick your next bad idea.</h1>
          <p className="hero-copy">
            These are not lessons. They are chess quests with proof attached. Pick from the live-backed deck, play on Lichess or Chess.com, and come back when the bad idea has evidence.
          </p>
        </section>

        <ChallengeDeckBrowser
          challenges={CHALLENGES}
          activeChallengeId={currentChallenge?.id}
          completedChallengeIds={progress.completedChallengeIds}
        />

        <section className="mission-card" aria-label="Recommended starting quests">
          <div className="section-head">
            <div>
              <span className="eyebrow">Where to begin</span>
              <h2>Pick by how hard you want to go.</h2>
            </div>
          </div>
          <p>
            Not sure where to start? Use one of these: easy, trouble, or full chaos. No separate path, no homework ladder — just choose the level of bad idea you want right now.
          </p>
          <div className="big-grid starter-route-grid">
            {recommendedStartChallenges.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                completed={completedSet.has(challenge.id)}
                active={currentChallenge?.id === challenge.id}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
