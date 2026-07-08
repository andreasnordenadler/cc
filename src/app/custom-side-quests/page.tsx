import MobileAppWebShell, { MobileSimpleScreen } from "@/components/mobile-app-web-shell";
import { currentUser } from "@clerk/nextjs/server";
import { unstable_noStore as noStore } from "next/cache";
import { getChessComUsername, getLichessUsername, getPreferredRunnerName, type UserMetadataRecord } from "@/lib/user-metadata";

export const metadata = {
  title: "My Custom Side Quests — Side Quest Chess",
  description: "My Custom Side Quests in the Side Quest Chess mobile app shell.",
};

export default async function CustomSideQuestsPage() {
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
        eyebrow="My Custom Side Quests"
        title="Build your own Side Quest"
        body="Create rules, keep drafts private, publish when ready, and use them solo or in Multiplayer Side Quests you host."
        primaryAction={{ label: "Build a Side Quest", href: "/create-custom-side-quest" }}
        secondaryAction={{ label: "Add/Create a New Side Quest", href: "/create-custom-side-quest" }}
        rows={[
          { title: "Your custom Side Quests are empty.", meta: "Create a draft first, then publish it when the rule feels ready.", status: "Create", href: "/create-custom-side-quest" },
        ]}
      />
    </MobileAppWebShell>
  );
}
