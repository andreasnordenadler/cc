import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { unstable_noStore as noStore } from "next/cache";
import MobileAppWebShell, {
  MobileMultiplayerDetailScreen,
  communityMultiplayerRows,
  publicMultiplayerRows,
} from "@/components/mobile-app-web-shell";
import { getChessComUsername, getLichessUsername, getPreferredRunnerName, type UserMetadataRecord } from "@/lib/user-metadata";

export function generateStaticParams() {
  return [...publicMultiplayerRows, ...communityMultiplayerRows].map((quest) => ({ id: quest.id }));
}

export default async function GroupQuestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  noStore();
  const { id } = await params;
  const quest = [...publicMultiplayerRows, ...communityMultiplayerRows].find((row) => row.id === id);

  if (!quest) {
    redirect("/multiplayer");
  }

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
      <MobileMultiplayerDetailScreen quest={quest} signedIn={Boolean(user)} />
    </MobileAppWebShell>
  );
}
