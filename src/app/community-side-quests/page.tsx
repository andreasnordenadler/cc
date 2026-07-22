import MobileAppWebShell, { MobileCommunitySideQuestsScreen } from "@/components/mobile-app-web-shell";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { unstable_noStore as noStore } from "next/cache";
import { listPublicCommunitySideQuests } from "@/lib/community-side-quests";
import { getChallengeProgress, getChessComUsername, getLichessUsername, getPreferredRunnerName, type UserMetadataRecord } from "@/lib/user-metadata";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Community Side Quests — Side Quest Chess",
  description: "Community Side Quests in the Side Quest Chess mobile app shell.",
};

export default async function CommunitySideQuestsPage({
  searchParams,
}: {
  searchParams: Promise<{ creator?: string }>;
}) {
  noStore();
  const { creator } = await searchParams;
  const client = await clerkClient();
  const user = await currentUser();
  const communityQuests = await listPublicCommunitySideQuests(client, { limit: null, viewerUserId: user?.id ?? null });
  const metadataRecord = user?.publicMetadata ? (user.publicMetadata as UserMetadataRecord) : {};
  const completedIds = new Set(getChallengeProgress(metadataRecord).completedChallengeIds);
  const newQuestCutoffMs = getCommunityNewCutoffMs();
  const displayName = user
    ? getPreferredRunnerName(metadataRecord, {
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        emailAddress: user.primaryEmailAddress?.emailAddress,
      }) || "Side Quest Chess"
    : null;

  return (
    <MobileAppWebShell
      activeTab="sideQuests"
      signedIn={Boolean(user)}
      displayName={displayName}
      lichessUsername={getLichessUsername(metadataRecord)}
      chessComUsername={getChessComUsername(metadataRecord)}
      immersivePresentation
      theme={{
        backgroundTop: "#8a6f3d",
        backgroundMid: "#312817",
        glow: "rgba(245, 200, 106, .28)",
        accent: "rgba(245, 200, 106, .18)",
      }}
    >
      <MobileCommunitySideQuestsScreen
        signedIn={Boolean(user)}
        initialCreator={creator ?? null}
        rows={communityQuests.map((quest) => {
          const likeSummary = quest.likeSummary;
          return {
            id: quest.id,
            title: quest.title,
            meta: `${quest.creatorName ? `By ${quest.creatorName} · ` : ""}${quest.summary} · ${formatCommunityStats(quest.stats)}`,
            href: quest.detailPath,
            image: quest.badgeImageUrl,
            sourceBadge: quest.creatorUserId === user?.id ? "Yours" : "Community",
            status: completedIds.has(quest.id) ? "Completed" : "Ready",
            creatorKey: quest.creatorKey,
            creatorName: quest.creatorName,
            updatedAtMs: quest.updatedAtMs,
            popularityScore: quest.popularityScore,
            likeCount: likeSummary.count,
            likedByViewer: likeSummary.likedByViewer,
            completedByViewer: completedIds.has(quest.id),
            isNew: quest.updatedAtMs > newQuestCutoffMs,
          };
        })}
      />
    </MobileAppWebShell>
  );
}

function getCommunityNewCutoffMs() {
  return Date.now() - 1000 * 60 * 60 * 24 * 30;
}

function formatCommunityStats(stats: {
  soloAttempts: number;
  soloCompletions: number;
  multiplayerLineups: number;
}) {
  return `Solo: ${stats.soloAttempts} tries, ${stats.soloCompletions} completed · Multiplayer: used ${stats.multiplayerLineups} times`;
}
