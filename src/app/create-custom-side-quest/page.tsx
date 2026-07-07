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
        eyebrow="Create Custom Side Quest"
        title="Create a custom Solo rule."
        body="Start from a clear chess condition, then save it as a private draft or publish it for community play."
        primaryAction={{ label: "Back to My Custom Side Quests", href: "/custom-side-quests" }}
        rows={[
          { title: "Template: Win the game", meta: "Complete the Side Quest by winning your next public game.", status: "Template", href: "/custom-side-quests" },
          { title: "Template: Piece adventure", meta: "Build a rule around a queen, knight, rook, bishop, king, or pawn condition.", status: "Template", href: "/custom-side-quests" },
          { title: "Template: Opening sequence", meta: "Require a public game to follow a specific early move sequence.", status: "Template", href: "/custom-side-quests" },
        ]}
      />
    </MobileAppWebShell>
  );
}
