import MobileAppWebShell, { MobileSimpleScreen } from "@/components/mobile-app-web-shell";
import { currentUser } from "@clerk/nextjs/server";
import { unstable_noStore as noStore } from "next/cache";
import { getChessComUsername, getLichessUsername, getPreferredRunnerName, type UserMetadataRecord } from "@/lib/user-metadata";

export const metadata = {
  title: "Settings — Side Quest Chess",
  description: "Side Quest Chess settings for profile, chess usernames, custom quests, and support.",
};

export default async function SettingsPage() {
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
        eyebrow="Settings"
        title="Keep your Side Quest Chess account ready."
        body="Profile, public chess usernames, custom rules, and support live close to Account in the mobile app."
        primaryAction={{ label: "Open My Account", href: "/account" }}
        rows={[
          { title: "Player profile", meta: "Set the name SQC should show on proof receipts and Multiplayer tables.", status: "Open", href: "/profile" },
          { title: "Chess usernames", meta: "Add the public Lichess or Chess.com usernames SQC can check for proof.", status: "Update", href: "/account" },
          { title: "Custom Side Quests", meta: "Manage private drafts and player-made rules.", status: "Open", href: "/custom-side-quests" },
          { title: "Help & Support", meta: "Proof troubleshooting, account help, and support context.", status: "Help", href: "/support" },
        ]}
      />
    </MobileAppWebShell>
  );
}
