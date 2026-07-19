import MobileAppWebShell, { MobileOfficialLeaderboardsScreen } from "@/components/mobile-app-web-shell";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { unstable_noStore as noStore } from "next/cache";
import { getMobileWebMultiplayerPreviews } from "@/lib/mobile-web-multiplayer";
import { getChessComUsername, getLichessUsername, getPreferredRunnerName, type UserMetadataRecord } from "@/lib/user-metadata";

export const metadata = {
  title: "Official Leaderboards — Side Quest Chess",
  description: "Track current and final official Side Quest Chess Multiplayer leaderboards.",
};

export default async function OfficialLeaderboardsPage() {
  noStore();
  const [user, client] = await Promise.all([currentUser(), clerkClient()]);
  const metadata = user?.publicMetadata ? (user.publicMetadata as UserMetadataRecord) : {};
  const { officialRows, previousOfficialRows, earlierOfficialWeeks } = await getMobileWebMultiplayerPreviews(client, user?.id);
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
      <MobileOfficialLeaderboardsScreen
        signedIn={Boolean(user)}
        currentRows={officialRows}
        previousRows={previousOfficialRows}
        earlierWeeks={earlierOfficialWeeks}
      />
    </MobileAppWebShell>
  );
}
