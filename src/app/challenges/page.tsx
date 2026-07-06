import Link from "next/link";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import ChallengeDeckBrowser from "@/components/challenge-deck-browser";
import SideQuestModeSwitcher from "@/components/side-quest-mode-switcher";
import SiteNav from "@/components/site-nav";
import { CHALLENGES } from "@/lib/challenges";
import { getCommunityLikeSummaries } from "@/lib/community-likes";
import {
  getActiveChallenge,
  getChallengeProgress,
  shouldPreselectDefaultStarterQuest,
  type UserMetadataRecord,
  withDefaultStarterQuest,
} from "@/lib/user-metadata";

export default async function ChallengesPage() {
  const { userId } = await auth();
  const user = userId ? await currentUser() : null;
  let metadata = user?.publicMetadata ? (user.publicMetadata as UserMetadataRecord) : {};
  if (user && shouldPreselectDefaultStarterQuest(metadata)) {
    metadata = withDefaultStarterQuest(metadata);
    const client = await clerkClient();
    await client.users.updateUserMetadata(user.id, { publicMetadata: metadata });
  }
  const client = await clerkClient();
  const likeSummaries = await getCommunityLikeSummaries(client, userId);
  const officialLikeSummaries = Object.fromEntries(CHALLENGES.map((challenge) => [challenge.id, likeSummaries.get("solo", challenge.id)]));
  const activeChallenge = getActiveChallenge(metadata);
  const progress = getChallengeProgress(metadata);
  const completedSet = new Set(progress.completedChallengeIds);
  const currentChallenge = activeChallenge?.id
    ? CHALLENGES.find((challenge) => challenge.id === activeChallenge.id) ?? null
    : null;
  const activeIncompleteChallengeId = currentChallenge && !completedSet.has(currentChallenge.id)
    ? currentChallenge.id
    : undefined;

  return (
    <main className="site-shell challenges-page-shell">
      <SiteNav isSignedIn={Boolean(userId)} active="solo" />

      <div className="content-wrap challenges-page-wrap">
        <section className="challenges-clean-hero" aria-labelledby="side-quests-title">
          <div>
            <span className="eyebrow">Solo Side Quests</span>
            <h1 id="side-quests-title">Choose your next Side Quest.</h1>
            <p>
              Pick one Side Quest, play on Lichess or Chess.com, then come back for automatic proof and a coat-of-arms reward.
            </p>
          </div>
          <div className="challenges-clean-hero-actions" aria-label="Solo Side Quest actions">
            <Link href="/custom#custom-side-quest-builder" className="mode-link-card">
              <span>Create Custom Side Quest</span>
              <strong>Build a Side Quest</strong>
            </Link>
            <Link href="/community" className="mode-link-card">
              <span>Community Solo Side Quests</span>
              <strong>Browse Community Side Quests</strong>
            </Link>
            <Link href="/multiplayer" className="mode-link-card">
              <span>Multiplayer Side Quests</span>
              <strong>Join a shared run</strong>
            </Link>
          </div>
        </section>

        <SideQuestModeSwitcher active="official" />

        <div id="solo-side-quest-deck" className="official-side-quest-deck">
          <ChallengeDeckBrowser
            challenges={CHALLENGES}
            activeChallengeId={activeIncompleteChallengeId}
            completedChallengeIds={progress.completedChallengeIds}
            likeSummaries={officialLikeSummaries}
            signedIn={Boolean(userId)}
          />
        </div>
      </div>
    </main>
  );
}
