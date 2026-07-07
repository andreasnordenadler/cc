import MobileAppWebShell, { MobileSimpleScreen } from "@/components/mobile-app-web-shell";
import { currentUser } from "@clerk/nextjs/server";
import { unstable_noStore as noStore } from "next/cache";
import { getChessComUsername, getLichessUsername, getPreferredRunnerName, type UserMetadataRecord } from "@/lib/user-metadata";

export default async function AccountPage() {
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
  const lichessUsername = getLichessUsername(metadata);
  const chessComUsername = getChessComUsername(metadata);

  return (
    <MobileAppWebShell
      activeTab="account"
      signedIn={Boolean(user)}
      displayName={displayName}
      lichessUsername={lichessUsername}
      chessComUsername={chessComUsername}
    >
      <MobileSimpleScreen
        eyebrow={user ? "Account sync" : "Account"}
        title={user ? "My Account" : "Sign in, then go make terrible chess decisions."}
        body={
          user
            ? "Side Quest Chess keeps browsing available and syncs progress after sign-in."
            : "Logging in lets Side Quest Chess remember your profile, public chess usernames, active Side Quest, badges, and proof cards."
        }
        primaryAction={user ? { label: "Sync account", href: "/settings" } : { label: "Choose sign-in method", href: "/sign-in" }}
        secondaryAction={{ label: "Browse Side Quests", href: "/side-quests" }}
        rows={[
          {
            title: "Chess username",
            meta: lichessUsername || chessComUsername ? "At least one chess username is connected to your SQC account." : "Add Lichess or Chess.com here before serious proof runs.",
            status: lichessUsername || chessComUsername ? "Done" : "Open",
            href: "/settings",
          },
          {
            title: "Active quest",
            meta: "Choose any Side Quest before checking proof.",
            status: "Open",
            href: "/side-quests",
          },
          {
            title: "Active Multiplayer Side Quests",
            meta: "Join or host shared challenges with friends.",
            status: "Open",
            href: "/multiplayer",
          },
        ]}
      />
    </MobileAppWebShell>
  );
}
