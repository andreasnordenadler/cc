import { auth, currentUser } from "@clerk/nextjs/server";
import ChallengeDeckBrowser, { ChallengeCard } from "@/components/challenge-deck-browser";
import SiteNav from "@/components/site-nav";
import { CHALLENGES } from "@/lib/challenges";
import {
  getActiveChallenge,
  getChallengeProgress,
  type UserMetadataRecord,
} from "@/lib/user-metadata";

const betaStarterRouteChallengeIds = ["knights-before-coffee", "bishop-field-trip", "early-king-walk"];

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
  const betaStarterRouteChallenges = betaStarterRouteChallengeIds
    .map((challengeId) => CHALLENGES.find((challenge) => challenge.id === challengeId))
    .filter((challenge): challenge is (typeof CHALLENGES)[number] => Boolean(challenge));

  return (
    <main className="site-shell">
      <SiteNav isSignedIn={Boolean(userId)} active="challenges" />

      <div className="content-wrap">
        <section className="hero-card">
          <h1>Pick your next bad idea.</h1>
          <p className="hero-copy">
            These are not lessons. They are chess quests with proof attached. Start one, play real games on Lichess or Chess.com, and come back when the bad idea has evidence.
          </p>
        </section>

        <ChallengeDeckBrowser
          challenges={CHALLENGES}
          activeChallengeId={currentChallenge?.id}
          completedChallengeIds={progress.completedChallengeIds}
        />

        <section className="mission-card" aria-label="Recommended starter route">
          <div className="section-head">
            <div>
              <span className="eyebrow">Recommended starter route</span>
              <h2>Three picks that remove choice paralysis.</h2>
            </div>
          </div>
          <p>
            New here? Start with these three quests if you want the smoothest first run: one simple win, one clean constraint, then one slightly suspicious king walk.
          </p>
          <div className="big-grid starter-route-grid">
            {betaStarterRouteChallenges.map((challenge) => (
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
