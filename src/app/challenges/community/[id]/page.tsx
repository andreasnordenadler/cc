import { notFound } from "next/navigation";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { unstable_noStore as noStore } from "next/cache";
import MobileAppWebShell, { MobileCommunitySideQuestDetailScreen } from "@/components/mobile-app-web-shell";
import { findPublicCommunitySideQuestById } from "@/lib/community-side-quests";
import { getChessComUsername, getLichessUsername, getPreferredRunnerName, type UserMetadataRecord } from "@/lib/user-metadata";
import { getCommunityLikeSummaries } from "@/lib/community-likes";

export const dynamic = "force-dynamic";

export default async function CommunitySideQuestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  noStore();
  const { id } = await params;
  const [user, client] = await Promise.all([currentUser(), clerkClient()]);
  const quest = await findPublicCommunitySideQuestById(client, id);

  if (!quest) {
    notFound();
  }
  const likeSummary = (await getCommunityLikeSummaries(client, user?.id ?? null)).get("solo", quest.id);

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
      modalPresentation
      immersivePresentation
      closeHref="/community-side-quests"
      theme={{
        backgroundTop: "#352021",
        backgroundMid: "#171011",
        glow: "rgba(245, 200, 106, .24)",
        accent: "rgba(245, 200, 106, .14)",
      }}
    >
      <MobileCommunitySideQuestDetailScreen
        quest={quest}
        signedIn={Boolean(user)}
        ownedByYou={quest.creatorUserId === user?.id}
        activeQuestId={metadataRecord.activeChallenge && typeof metadataRecord.activeChallenge === "object" ? String((metadataRecord.activeChallenge as { id?: string }).id ?? "") : null}
        likeSummary={likeSummary}
      />
    </MobileAppWebShell>
  );
}
