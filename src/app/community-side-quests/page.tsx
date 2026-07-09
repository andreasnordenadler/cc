import MobileAppWebShell, { MobileCommunitySideQuestsScreen } from "@/components/mobile-app-web-shell";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { unstable_noStore as noStore } from "next/cache";
import { listPublicCommunitySideQuests } from "@/lib/community-side-quests";
import { getChessComUsername, getLichessUsername, getPreferredRunnerName, type UserMetadataRecord } from "@/lib/user-metadata";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Community Side Quests — Side Quest Chess",
  description: "Community Side Quests in the Side Quest Chess mobile app shell.",
};

export default async function CommunitySideQuestsPage() {
  noStore();
  const [user, communityQuests] = await Promise.all([
    currentUser(),
    listPublicCommunitySideQuests(await clerkClient(), { limit: 80 }),
  ]);
  const metadataRecord = user?.publicMetadata ? (user.publicMetadata as UserMetadataRecord) : {};
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
        rows={communityQuests.map((quest) => ({
          id: quest.id,
          title: quest.title,
          meta: `${quest.creatorName ? `By ${quest.creatorName} · ` : ""}${quest.summary} · ${formatCommunityStats(quest.stats)}`,
          href: quest.detailPath,
          image: quest.badgeImageUrl,
          sourceBadge: quest.creatorUserId === user?.id ? "Yours" : "Community",
          status: "Ready",
        }))}
      />
    </MobileAppWebShell>
  );
}

function formatCommunityStats(stats: {
  soloAttempts: number;
  soloCompletions: number;
  multiplayerLineups: number;
}) {
  return `Solo: ${stats.soloAttempts} tries, ${stats.soloCompletions} completed · Multiplayer: used ${stats.multiplayerLineups} times`;
}
