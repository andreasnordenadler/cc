import MobileAppWebShell, { MobileMultiplayerSideQuestsScreen } from "@/components/mobile-app-web-shell";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { getMobileWebMultiplayerPreviews } from "@/lib/mobile-web-multiplayer";
import { unstable_noStore as noStore } from "next/cache";
import { getChessComUsername, getLichessUsername, getPreferredRunnerName, type UserMetadataRecord } from "@/lib/user-metadata";
import { parseCommunityMultiplayerDiscoveryState } from "@/lib/multiplayer-discovery-state";

export { metadata } from "../multiplayer/page";

export default async function MultiplayerSideQuestsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  noStore();
  const [rawSearchParams, user, client] = await Promise.all([searchParams, currentUser(), clerkClient()]);
  const { tab } = rawSearchParams;
  const discoveryState = parseCommunityMultiplayerDiscoveryState(rawSearchParams);
  const metadata = user?.publicMetadata ? (user.publicMetadata as UserMetadataRecord) : {};
  const { officialRows, communityRows, previousOfficialRows, earlierOfficialWeeks, catalogStatus } = await getMobileWebMultiplayerPreviews(client, user?.id, undefined, { signedOutUnavailableFallback: true });
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
      desktopPresentation="multiplayer-discovery"
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
        communityHost={discoveryState.host}
        initialState={discoveryState}
        previousOfficialRows={previousOfficialRows}
        earlierOfficialWeeks={earlierOfficialWeeks}
        catalogStatus={catalogStatus}
      />
    </MobileAppWebShell>
  );
}
