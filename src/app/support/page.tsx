import type { Metadata } from "next";
import MobileAppWebShell, { MobileSimpleScreen } from "@/components/mobile-app-web-shell";
import { currentUser } from "@clerk/nextjs/server";
import { unstable_noStore as noStore } from "next/cache";
import { getChessComUsername, getLichessUsername, getPreferredRunnerName, type UserMetadataRecord } from "@/lib/user-metadata";

export const metadata: Metadata = {
  title: "Help & Support — Side Quest Chess",
  description: "Help and support notes for Side Quest Chess proof, account setup, and Multiplayer Side Quests.",
};

export default async function SupportPage() {
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
        eyebrow="Help & Support"
        title="How can we help?"
        body="New to Side Quest Chess? Start here for Side Quests, proof, chess usernames, and Multiplayer."
        primaryAction={{ label: "Open", href: "/account" }}
        secondaryAction={{ label: "Browse Side Quests", href: "/side-quests" }}
        rows={[
          { title: "How Side Quest Chess works", meta: "Start here for Side Quests, proof, chess usernames, and Multiplayer.", status: "Open", href: "/support" },
          { title: "Report a problem", meta: "Tell us what you tried, what happened, and where you got stuck.", status: "Open", href: "/support" },
          { title: "Connecting a chess username", meta: "Add a public Lichess or Chess.com username first. SQC never needs your chess-site password.", status: "Open", href: "/account" },
        ]}
      />
    </MobileAppWebShell>
  );
}
