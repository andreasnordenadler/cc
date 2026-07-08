import MobileAppWebShell, { MobileSimpleScreen } from "@/components/mobile-app-web-shell";
import { currentUser } from "@clerk/nextjs/server";
import { unstable_noStore as noStore } from "next/cache";
import { getChessComUsername, getLichessUsername, getPreferredRunnerName, type UserMetadataRecord } from "@/lib/user-metadata";

export default async function CreateCustomSideQuestPage() {
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
        eyebrow="Custom Side Quest"
        title="Build your Side Quest."
        body="Choose what should happen in a real game. SQC will check it after you play."
        primaryAction={{ label: "Build a Side Quest", href: "/custom-side-quests" }}
        rows={[
          { title: "Start from a template", meta: "Saved Side Quests appear in My Custom Side Quests and can be used as Solo Side Quests or Multiplayer Side Quests.", status: "Open", href: "/custom-side-quests" },
          { title: "Side Quest Coat of Arms", meta: "This is the Coat of Arms players unlock when this Side Quest is completed.", status: "Open", href: "/custom-side-quests" },
          { title: "What must happen?", meta: "Add one or more conditions. SQC checks them against your next public game. Public means the game is visible on your connected chess account.", status: "Open", href: "/custom-side-quests" },
        ]}
      />
    </MobileAppWebShell>
  );
}
