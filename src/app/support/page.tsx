import type { Metadata } from "next";
import MobileAppWebShell, { MobileSupportScreen } from "@/components/mobile-app-web-shell";
import { currentUser } from "@clerk/nextjs/server";
import { unstable_noStore as noStore } from "next/cache";
import { getChessComUsername, getLichessUsername, getPreferredRunnerName, type UserMetadataRecord } from "@/lib/user-metadata";
import { getSupportMessages } from "@/lib/analytics";

export const metadata: Metadata = {
  title: "Help & Support — Side Quest Chess",
  description: "Help and support notes for Side Quest Chess proof, account setup, and Multiplayer Side Quests.",
};

export default async function SupportPage() {
  noStore();
  const user = await currentUser();
  const metadataRecord = user?.publicMetadata ? (user.publicMetadata as UserMetadataRecord) : {};
  const supportMessages = user?.privateMetadata ? getSupportMessages(user.privateMetadata) : [];
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
      modalPresentation
      theme={{
        backgroundTop: "#352021",
        backgroundMid: "#171011",
        glow: "rgba(255, 122, 102, .16)",
        accent: "rgba(255, 122, 102, .1)",
      }}
    >
      <MobileSupportScreen
        signedIn={Boolean(user)}
        supportMessages={supportMessages.map((message) => ({
          id: message.id,
          at: message.at,
          message: message.message,
          source: message.source ?? null,
        }))}
      />
    </MobileAppWebShell>
  );
}
