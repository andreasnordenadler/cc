import MobileAppWebShell, { MobileTrophyCabinetScreen } from "@/components/mobile-app-web-shell";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { unstable_noStore as noStore } from "next/cache";
import { CHALLENGES } from "@/lib/challenges";
import { getMobileWebTrophyRows } from "@/lib/mobile-web-trophies";
import { getChessComUsername, getLichessUsername, getPreferredRunnerName, type UserMetadataRecord } from "@/lib/user-metadata";
import { getChallengeAttempts, getChallengeProgress } from "@/lib/user-metadata";

export default async function TrophyCabinetPage() {
  noStore();
  const user = await currentUser();
  const metadata = user?.publicMetadata ? (user.publicMetadata as UserMetadataRecord) : {};
  const progress = getChallengeProgress(metadata);
  const proofReceiptCount = getChallengeAttempts(metadata).length;
  const trophyRows = user
    ? await getMobileWebTrophyRows(await clerkClient(), user.id, progress.completedChallengeIds, 12)
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
      displayName={displayName}
      lichessUsername={getLichessUsername(metadata)}
      chessComUsername={getChessComUsername(metadata)}
    >
      <MobileTrophyCabinetScreen
        trophyRows={trophyRows}
        completedSoloCount={progress.totalCompletedChallenges}
        proofReceiptCount={proofReceiptCount}
        officialSoloCount={CHALLENGES.length}
      />
    </MobileAppWebShell>
  );
}
