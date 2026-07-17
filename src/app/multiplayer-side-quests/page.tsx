import MobileAppWebShell, { MobileMultiplayerSideQuestsScreen } from "@/components/mobile-app-web-shell";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { getMobileWebMultiplayerPreviews, getMultiplayerHostFilter } from "@/lib/mobile-web-multiplayer";
import { unstable_noStore as noStore } from "next/cache";
import { getChessComUsername, getLichessUsername, getPreferredRunnerName, type UserMetadataRecord } from "@/lib/user-metadata";

export { metadata } from "../multiplayer/page";

export default async function MultiplayerSideQuestsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string | string[]; host?: string | string[] }>;
}) {
  noStore();
  const [{ tab, host }, user, client] = await Promise.all([searchParams, currentUser(), clerkClient()]);
  const metadata = user?.publicMetadata ? (user.publicMetadata as UserMetadataRecord) : {};
  const { officialRows, communityRows, previousOfficialRows, earlierOfficialWeeks } = await getMobileWebMultiplayerPreviews(client, user?.id);
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
        selectedTab={tab === "community" ? "community" : "official"}
        signedIn={Boolean(user)}
        officialRows={officialRows}
        communityRows={communityRows}
        communityHost={getMultiplayerHostFilter(host)}
        previousOfficialRows={previousOfficialRows}
        earlierOfficialWeeks={earlierOfficialWeeks}
      />
    </MobileAppWebShell>
  );
}
