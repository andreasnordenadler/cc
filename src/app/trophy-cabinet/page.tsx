import MobileAppWebShell, { MobileTrophyCabinetScreen } from "@/components/mobile-app-web-shell";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { unstable_noStore as noStore } from "next/cache";
import { CHALLENGES } from "@/lib/challenges";
import { listPublicCommunitySideQuests } from "@/lib/community-side-quests";
import { getCustomSideQuests } from "@/lib/custom-side-quests";
import { getMobileWebTrophyRows, loadOptionalCommunityTrophyQuests } from "@/lib/mobile-web-trophies";
import { getChessComUsername, getLichessUsername, getPreferredRunnerName, type UserMetadataRecord } from "@/lib/user-metadata";
import { getChallengeAttempts, getChallengeProgress } from "@/lib/user-metadata";

export default async function TrophyCabinetPage() {
  noStore();
  const user = await currentUser();
  const metadata = user?.publicMetadata ? (user.publicMetadata as UserMetadataRecord) : {};
  const privateMetadata = user?.privateMetadata && typeof user.privateMetadata === "object"
    ? (user.privateMetadata as UserMetadataRecord)
    : {};
  const progress = getChallengeProgress(metadata);
  const proofReceiptCount = getChallengeAttempts(metadata).length;
  const privateCustomSideQuests = getCustomSideQuests(privateMetadata);
  const customSideQuests = privateCustomSideQuests.length ? privateCustomSideQuests : getCustomSideQuests(metadata);
  const client = user ? await clerkClient() : null;
  const communityQuests = user && client
    ? await loadOptionalCommunityTrophyQuests(() => listPublicCommunitySideQuests(client, { limit: null, viewerUserId: user.id, maxPages: 10 }))
    : [];
  const trophyRows = user && client
    ? await getMobileWebTrophyRows(client, user.id, progress.completedChallengeIds, null, {
        ownedCustomQuests: customSideQuests,
        communityQuests,
      })
    : [];
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
      desktopPresentation="trophy-cabinet"
      displayName={displayName}
      lichessUsername={getLichessUsername(metadata)}
      chessComUsername={getChessComUsername(metadata)}
      immersivePresentation
      theme={{
        backgroundTop: "#766f5b",
        backgroundMid: "#312c24",
        glow: "rgba(245, 200, 106, .24)",
        accent: "rgba(245, 200, 106, .18)",
      }}
    >
      <MobileTrophyCabinetScreen
        trophyRows={trophyRows}
        completedSoloCount={CHALLENGES.filter((challenge) => progress.completedChallengeIds.includes(challenge.id)).length}
        proofReceiptCount={proofReceiptCount}
        officialSoloCount={CHALLENGES.length}
        officialChallenges={CHALLENGES}
      />
    </MobileAppWebShell>
  );
}
