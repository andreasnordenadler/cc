import MobileAppWebShell, { MobileSimpleScreen } from "@/components/mobile-app-web-shell";
import { currentUser } from "@clerk/nextjs/server";
import { unstable_noStore as noStore } from "next/cache";
import { getChessComUsername, getLichessUsername, getPreferredRunnerName, type UserMetadataRecord } from "@/lib/user-metadata";

export default async function TrophyCabinetPage() {
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
      activeTab="coatOfArms"
      signedIn={Boolean(user)}
      displayName={displayName}
      lichessUsername={getLichessUsername(metadata)}
      chessComUsername={getChessComUsername(metadata)}
    >
      <MobileSimpleScreen
        eyebrow="Trophy Cabinet"
        title="No Coat of Arms yet"
        body="Complete a Side Quest to unlock your first trophy."
        primaryAction={{ label: "Explore Solo Side Quests", href: "/side-quests" }}
        rows={[
          {
            title: "No Coat of Arms yet",
            meta: "Complete a Side Quest to unlock your first trophy.",
            status: "Explore",
            href: "/side-quests",
          },
        ]}
      />
    </MobileAppWebShell>
  );
}
