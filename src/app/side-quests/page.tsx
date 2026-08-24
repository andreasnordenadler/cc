import MobileAppWebShell, { MobileSoloSideQuestsScreen } from "@/components/mobile-app-web-shell";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { unstable_noStore as noStore } from "next/cache";
import { CHALLENGES } from "@/lib/challenges";
import { getCommunityLikeSummaries } from "@/lib/community-likes";
import { filterOfficialSideQuests } from "@/lib/official-solo-discovery";
import {
  getActiveChallenge,
  getChallengeProgress,
  getChessComUsername,
  getLichessUsername,
  getPreferredRunnerName,
  type UserMetadataRecord,
} from "@/lib/user-metadata";

export default async function SideQuestsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  noStore();
  const rawQuery = (await searchParams).q;
  const query = typeof rawQuery === "string" ? rawQuery.trim() : "";
  const visibleChallenges = filterOfficialSideQuests(CHALLENGES, query);
  const user = await currentUser();
  const metadata = user?.publicMetadata ? (user.publicMetadata as UserMetadataRecord) : {};
  const displayName = user
    ? getPreferredRunnerName(metadata, {
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        emailAddress: user.primaryEmailAddress?.emailAddress,
      }) || "Side Quest Chess"
    : null;
  const activeChallenge = getActiveChallenge(metadata);
  const progress = getChallengeProgress(metadata);
  const activeChallengeId = activeChallenge?.id && !progress.completedChallengeIds.includes(activeChallenge.id) ? activeChallenge.id : null;
  const likeSummaryMap = await getCommunityLikeSummaries(await clerkClient(), user?.id ?? null);
  const likeSummaries = Object.fromEntries(
    CHALLENGES.map((challenge) => [challenge.id, likeSummaryMap.get("solo", challenge.id)]),
  );

  return (
    <MobileAppWebShell
      activeTab="sideQuests"
      desktopPresentation="solo-discovery"
      signedIn={Boolean(user)}
      displayName={displayName}
      lichessUsername={getLichessUsername(metadata)}
      chessComUsername={getChessComUsername(metadata)}
    >
      <MobileSoloSideQuestsScreen
        challenges={visibleChallenges}
        totalChallengeCount={CHALLENGES.length}
        query={query}
        signedIn={Boolean(user)}
        activeChallengeId={activeChallengeId}
        completedChallengeIds={progress.completedChallengeIds}
        likeSummaries={likeSummaries}
      />
    </MobileAppWebShell>
  );
}
