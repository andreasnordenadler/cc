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
        title="Proof, account, and Multiplayer help."
        body="SQC checks public chess games, saves quest progress, and turns completed Side Quests into receipts."
        primaryAction={{ label: "Open Account", href: "/account" }}
        secondaryAction={{ label: "Browse Side Quests", href: "/side-quests" }}
        rows={[
          { title: "Why proof may not verify", meta: "Use a public, finished game on the connected username after choosing the Side Quest.", status: "Proof", href: "/side-quests" },
          { title: "Connecting chess accounts", meta: "SQC reads public games by username only. It never needs a chess-site password.", status: "Account", href: "/account" },
          { title: "Multiplayer Side Quests", meta: "Join while the table is open, play inside the window, then refresh proof.", status: "Shared", href: "/multiplayer" },
        ]}
      />
    </MobileAppWebShell>
  );
}
