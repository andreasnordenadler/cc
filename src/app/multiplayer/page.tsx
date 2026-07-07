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
        body="Join public Multiplayer Side Quests, inspect the rules before committing, or sign in when you want to create one and invite friends."
        primaryAction={{ label: "Join Multiplayer Side Quests", href: "/multiplayer-side-quests" }}
        secondaryAction={{ label: "Create Multiplayer Side Quest", href: "/create-multiplayer-side-quest" }}
        rows={[
          {
            title: "No active Multiplayer Side Quests",
            meta: "Join or host shared challenges with friends.",
            status: "Explore",
            href: "/multiplayer-side-quests",
          },
          {
            title: "Start a shared Multiplayer Side Quest.",
            meta: "Choose the rules, create the Multiplayer Side Quest, then share the invite with players.",
            status: "Create",
            href: "/create-multiplayer-side-quest",
          },
        ]}
      />
    </MobileAppWebShell>
  );
}
