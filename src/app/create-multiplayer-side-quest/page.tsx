import MobileAppWebShell, { MobileCreateMultiplayerScreen } from "@/components/mobile-app-web-shell";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { unstable_noStore as noStore } from "next/cache";
import { getChessComUsername, getLichessUsername, getPreferredRunnerName, type UserMetadataRecord } from "@/lib/user-metadata";
import { CHALLENGES } from "@/lib/challenges";
import { listPublicCommunitySideQuests } from "@/lib/community-side-quests";
import { getCustomSideQuests } from "@/lib/custom-side-quests";
import { loadMultiplayerCreateQuestChoices, selectCommunityCreateChoices } from "@/lib/multiplayer-create-quest-choices";

export default async function CreateMultiplayerSideQuestPage({
  searchParams,
}: {
  searchParams: Promise<{ quest?: string | string[] }>;
}) {
  noStore();
  const { quest } = await searchParams;
  const user = await currentUser();
  const metadata = user?.publicMetadata ? (user.publicMetadata as UserMetadataRecord) : {};
  const privateMetadata = user?.privateMetadata ? (user.privateMetadata as UserMetadataRecord) : {};
  const ownedMetadata = getCustomSideQuests(privateMetadata).length ? privateMetadata : metadata;
  const { choices: quests, communityUnavailable } = await loadMultiplayerCreateQuestChoices({
    official: CHALLENGES,
    owned: getCustomSideQuests(ownedMetadata),
    loadCommunity: async () => user
      ? selectCommunityCreateChoices(
          await listPublicCommunitySideQuests(await clerkClient(), { limit: 200 }),
          typeof quest === "string" ? quest : undefined,
        )
      : [],
  });
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
      modalPresentation
      immersivePresentation
      closeHref="/multiplayer"
      theme={{
        backgroundTop: "#352021",
        backgroundMid: "#171011",
        glow: "rgba(245, 200, 106, .18)",
        accent: "rgba(96, 240, 175, .045)",
      }}
    >
      <MobileCreateMultiplayerScreen
        signedIn={Boolean(user)}
        quests={quests}
        communityUnavailable={communityUnavailable}
        initialQuestId={typeof quest === "string" ? quest : undefined}
      />
    </MobileAppWebShell>
  );
}
