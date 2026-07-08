import MobileAppWebShell, { MobileSimpleScreen } from "@/components/mobile-app-web-shell";
import { currentUser } from "@clerk/nextjs/server";
import { unstable_noStore as noStore } from "next/cache";
import { getChessComUsername, getLichessUsername, getPreferredRunnerName, type UserMetadataRecord } from "@/lib/user-metadata";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Community Side Quests — Side Quest Chess",
  description: "Community Side Quests in the Side Quest Chess mobile app shell.",
};

export default async function CommunitySideQuestsPage() {
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
      activeTab="sideQuests"
      signedIn={Boolean(user)}
      displayName={displayName}
      lichessUsername={getLichessUsername(metadataRecord)}
      chessComUsername={getChessComUsername(metadataRecord)}
    >
      <MobileSimpleScreen
        eyebrow="Community Side Quests"
        title="No public Community Side Quests yet."
        body={user ? "Create the first public Side Quest from My Custom Side Quests. Public quests will appear here as the catalog grows." : "Public player-made Side Quests will appear here as the catalog grows."}
        primaryAction={{ label: "Add/Create a New Side Quest", href: "/custom-side-quests" }}
        secondaryAction={{ label: "Official Side Quests", href: "/side-quests" }}
        rows={[
          {
            title: "No matches yet.",
            meta: "Try a broader search or switch the filter back to All.",
            status: "Open",
            href: "/side-quests",
          },
        ]}
      />
    </MobileAppWebShell>
  );
}
