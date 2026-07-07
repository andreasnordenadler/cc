import MobileAppWebShell, { MobileSimpleScreen } from "@/components/mobile-app-web-shell";
import { currentUser } from "@clerk/nextjs/server";
import { unstable_noStore as noStore } from "next/cache";
import { getChessComUsername, getLichessUsername, getPreferredRunnerName, type UserMetadataRecord } from "@/lib/user-metadata";

export const metadata = {
  title: "Multiplayer Side Quests — Side Quest Chess",
  description: "Join or create shared Side Quest Chess challenges.",
};

export default async function MultiplayerPage() {
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
      activeTab="multiplayerSideQuests"
      signedIn={Boolean(user)}
      displayName={displayName}
      lichessUsername={getLichessUsername(metadata)}
      chessComUsername={getChessComUsername(metadata)}
    >
      <MobileSimpleScreen
        eyebrow="Multiplayer Side Quests"
        title="Same nonsense, now with witnesses."
        body="Join official tables, discover community tables, or create a shared Side Quest for friends."
        primaryAction={{ label: "Create Multiplayer Side Quest", href: "/create-multiplayer-side-quest" }}
        secondaryAction={{ label: "Browse Official Tables", href: "/groupquests/public" }}
        rows={[
          {
            title: "No active Multiplayer Side Quests",
            meta: "Join or host shared challenges with friends.",
            status: "Explore",
            href: "/groupquests/public",
          },
          {
            title: "Create a Multiplayer Side Quest",
            meta: "Choose quests, time window, provider rules, and invite friends.",
            status: "Create",
            href: "/create-multiplayer-side-quest",
          },
        ]}
      />
    </MobileAppWebShell>
  );
}
