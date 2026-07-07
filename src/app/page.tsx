import MobileAppWebShell from "@/components/mobile-app-web-shell";
import { currentUser } from "@clerk/nextjs/server";
import { unstable_noStore as noStore } from "next/cache";
import { getChessComUsername, getLichessUsername, getPreferredRunnerName, type UserMetadataRecord } from "@/lib/user-metadata";

export default async function Home() {
  noStore();
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
      activeTab="home"
      signedIn={Boolean(user)}
      displayName={displayName}
      lichessUsername={getLichessUsername(metadata)}
      chessComUsername={getChessComUsername(metadata)}
    />
  );
}
