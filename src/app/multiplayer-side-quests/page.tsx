import MobileAppWebShell, { MobileMultiplayerSideQuestsScreen } from "@/components/mobile-app-web-shell";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { getMobileWebMultiplayerPreviews } from "@/lib/mobile-web-multiplayer";
import { unstable_noStore as noStore } from "next/cache";
import { getChessComUsername, getLichessUsername, getPreferredRunnerName, type UserMetadataRecord } from "@/lib/user-metadata";

export { metadata } from "../multiplayer/page";

export default async function MultiplayerSideQuestsPage() {
  noStore();
  const [user, client] = await Promise.all([currentUser(), clerkClient()]);
  const metadata = user?.publicMetadata ? (user.publicMetadata as UserMetadataRecord) : {};
  const { officialRows, communityRows, previousOfficialRows } = await getMobileWebMultiplayerPreviews(client, user?.id);
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
    >
      <MobileMultiplayerSideQuestsScreen
        selectedTab="community"
        signedIn={Boolean(user)}
        officialRows={officialRows}
        communityRows={communityRows}
        previousOfficialRows={previousOfficialRows}
      />
    </MobileAppWebShell>
  );
}
