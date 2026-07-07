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
        eyebrow="Account"
        title={user ? "My Account" : "Sign in, then go make terrible chess decisions."}
        body={
          user
            ? "Manage the profile and public chess usernames SQC uses for proof, progress, custom Side Quests, and Multiplayer Side Quests."
            : "Logging in lets Side Quest Chess remember your profile, public chess usernames, active Side Quest, badges, Multiplayer Side Quests, and proof cards."
        }
        primaryAction={user ? { label: "Update chess usernames", href: "/settings" } : { label: "Choose sign-in method", href: "/sign-in" }}
        secondaryAction={{ label: "Browse Side Quests", href: "/side-quests" }}
        rows={[
          {
            title: "Lichess username",
            meta: lichessUsername || "Not connected yet.",
            status: lichessUsername ? "Ready" : "Missing",
            href: "/settings",
          },
          {
            title: "Chess.com username",
            meta: chessComUsername || "Not connected yet.",
            status: chessComUsername ? "Ready" : "Missing",
            href: "/settings",
          },
          {
            title: "Active Solo Side Quest",
            meta: "Pick one Solo Side Quest before the next proof run.",
            status: "Choose",
            href: "/side-quests",
          },
          {
            title: "Multiplayer Side Quests",
            meta: "Join an official table, join a community table, or create one for friends.",
            status: "Open",
            href: "/multiplayer",
          },
        ]}
      />
    </MobileAppWebShell>
  );
}
