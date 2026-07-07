import MobileAppWebShell, { MobileSimpleScreen } from "@/components/mobile-app-web-shell";
import { currentUser } from "@clerk/nextjs/server";
import { unstable_noStore as noStore } from "next/cache";
import { getChessComUsername, getLichessUsername, getPreferredRunnerName, type UserMetadataRecord } from "@/lib/user-metadata";

export { metadata } from "../custom/page";

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
        title="Build your own bad chess idea."
        body="Create private drafts or publish custom Solo rules that can be used for personal attempts and Multiplayer tables."
        primaryAction={{ label: "Create Custom Side Quest", href: "/create-custom-side-quest" }}
        secondaryAction={{ label: "Browse Official Side Quests", href: "/side-quests" }}
        rows={[
          { title: "No custom Side Quests yet", meta: "Start with a simple rule, then tune it before sharing.", status: "Create", href: "/create-custom-side-quest" },
          { title: "Community Side Quests", meta: "Browse player-made rules after the catalog slice is rebuilt.", status: "Soon", href: "/community-side-quests" },
        ]}
      />
    </MobileAppWebShell>
  );
}
