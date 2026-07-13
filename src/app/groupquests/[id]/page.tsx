import { redirect } from "next/navigation";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { unstable_noStore as noStore } from "next/cache";
import MobileAppWebShell, {
  MobileMultiplayerDetailScreen,
} from "@/components/mobile-app-web-shell";
import { getMobileWebMultiplayerDetail, getMobileWebMultiplayerPreviews } from "@/lib/mobile-web-multiplayer";
import { getChessComUsername, getLichessUsername, getPreferredRunnerName, type UserMetadataRecord } from "@/lib/user-metadata";

export default async function GroupQuestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  noStore();
  const { id } = await params;
  const [user, client] = await Promise.all([currentUser(), clerkClient()]);
  const { officialRows, communityRows } = await getMobileWebMultiplayerPreviews(client, user?.id);
  const quest = [...officialRows, ...communityRows].find((row) => row.id === id)
    ?? await getMobileWebMultiplayerDetail(client, id, user?.id);

  if (!quest) {
    redirect("/multiplayer");
  }

  const metadata = user?.publicMetadata ? (user.publicMetadata as UserMetadataRecord) : {};
  const displayName = user
    ? getPreferredRunnerName(metadata, {
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        emailAddress: user.primaryEmailAddress?.emailAddress,
      }) || "Side Quest Chess"
    : null;

  return (
    <MobileAppWebShell
      activeTab="multiplayerSideQuests"
      signedIn={Boolean(user)}
      displayName={displayName}
      lichessUsername={getLichessUsername(metadata)}
      chessComUsername={getChessComUsername(metadata)}
      modalPresentation
      immersivePresentation
      closeHref={quest.sourceBadge === "Community" ? "/multiplayer-side-quests" : "/multiplayer"}
      theme={{
        backgroundTop: "#352021",
        backgroundMid: "#171011",
        glow: "rgba(245, 200, 106, .24)",
        accent: "rgba(245, 200, 106, .14)",
      }}
    >
      <MobileMultiplayerDetailScreen
        quest={quest}
        signedIn={Boolean(user)}
      />
    </MobileAppWebShell>
  );
}
