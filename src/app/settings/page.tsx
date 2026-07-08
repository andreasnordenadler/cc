import MobileAppWebShell, { MobileSimpleScreen } from "@/components/mobile-app-web-shell";
import { currentUser } from "@clerk/nextjs/server";
import { unstable_noStore as noStore } from "next/cache";
import { getChessComUsername, getLichessUsername, getPreferredRunnerName, type UserMetadataRecord } from "@/lib/user-metadata";

export const metadata = {
  title: "Settings — Side Quest Chess",
  description: "Side Quest Chess settings for profile, chess usernames, custom quests, and support.",
};

export default async function SettingsPage() {
  noStore();
  const user = await currentUser();
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
      activeTab="account"
      signedIn={Boolean(user)}
      displayName={displayName}
      lichessUsername={getLichessUsername(metadataRecord)}
      chessComUsername={getChessComUsername(metadataRecord)}
    >
      <MobileSimpleScreen
        eyebrow="Account sync"
        title="Your progress stays connected."
        body="Side Quest Chess keeps browsing available and syncs progress after sign-in."
        primaryAction={{ label: "Sync account", href: "/account" }}
        rows={[
          { title: "Progress sync", meta: "Sign in to save progress", status: "Open", href: "/account" },
          { title: "Chess username", meta: "Add Lichess or Chess.com here before serious proof runs.", status: "Open", href: "/account" },
          { title: "Display name", meta: "Display name", status: "Open", href: "/profile" },
        ]}
      />
    </MobileAppWebShell>
  );
}
