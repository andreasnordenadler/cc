import MobileAppWebShell, { MobileCustomSideQuestsScreen } from "@/components/mobile-app-web-shell";
import { currentUser } from "@clerk/nextjs/server";
import { unstable_noStore as noStore } from "next/cache";
import { getCustomSideQuests, type CustomSideQuest } from "@/lib/custom-side-quests";
import { getActiveChallenge, getChallengeProgress, getChessComUsername, getLichessUsername, getPreferredRunnerName, type UserMetadataRecord } from "@/lib/user-metadata";

export const metadata = {
  title: "My Custom Side Quests — Side Quest Chess",
  description: "My Custom Side Quests in the Side Quest Chess mobile app shell.",
};

export default async function CustomSideQuestsPage() {
  noStore();
  const user = await currentUser();
  const metadataRecord = user?.publicMetadata ? (user.publicMetadata as UserMetadataRecord) : {};
  const privateMetadataRecord = user?.privateMetadata ? (user.privateMetadata as UserMetadataRecord) : {};
  const customSideQuests = user ? getCustomLibraryRows(privateMetadataRecord, metadataRecord) : [];
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
      activeTab="sideQuests"
      signedIn={Boolean(user)}
      displayName={displayName}
      lichessUsername={getLichessUsername(metadataRecord)}
      chessComUsername={getChessComUsername(metadataRecord)}
    >
      <MobileCustomSideQuestsScreen rows={customSideQuests} />
    </MobileAppWebShell>
  );
}

function getCustomLibraryRows(privateMetadata: UserMetadataRecord, publicMetadata: UserMetadataRecord) {
  const sourceMetadata = getCustomSideQuests(privateMetadata).length ? privateMetadata : publicMetadata;
  const activeId = getActiveChallenge(sourceMetadata)?.id ?? null;
  const completedIds = new Set(getChallengeProgress(sourceMetadata).completedChallengeIds);

  return getCustomSideQuests(sourceMetadata)
    .map((quest) => ({
      id: quest.id,
      title: quest.title,
      meta: getCustomLibraryMeta(quest),
      status: getCustomLibraryStatus(quest, activeId, completedIds.has(quest.id)),
      sourceBadge: quest.lifecycle === "draft" ? "Draft" : quest.visibility === "public" ? "Community" : "Private",
      href: quest.visibility === "public" && quest.lifecycle === "published" ? `/challenges/community/${encodeURIComponent(quest.id)}` : "/create-custom-side-quest",
      image: quest.badgeImageUrl ?? "/badges/custom/community/community-coat-01.png",
      lifecycle: quest.lifecycle ?? "published",
      visibility: quest.visibility ?? "private",
      updatedAt: quest.updatedAt,
    }));
}

function getCustomLibraryMeta(quest: CustomSideQuest) {
  return [
    quest.lifecycle === "draft" ? "Draft" : quest.lifecycle === "archived" ? "Archived" : "Saved",
    quest.visibility === "public" ? "Public" : "Private to you",
    cleanCustomRuleSummaryText(quest.summary),
  ].filter(Boolean).join(" · ");
}

function getCustomLibraryStatus(quest: CustomSideQuest, activeId: string | null, completed: boolean) {
  if (quest.lifecycle === "draft") return "Draft";
  if (quest.lifecycle === "archived") return "Archived";
  if (quest.id === activeId) return "Active";
  return completed ? "Completed" : "Ready";
}

function cleanCustomRuleSummaryText(value: string) {
  return value
    .replace(/game\s+result\s+must\s+be\s+win\.?/gi, "Win a game.")
    .replace(/game\s+result\s+must\s+be\s+draw\.?/gi, "Draw a game.")
    .replace(/game\s+result\s+must\s+be\s+lose\.?/gi, "Finish with a loss.")
    .replace(/\b(your|opponent's) any 1 (king|queen)\b/gi, (_match, owner: string, piece: string) => `${owner} ${piece}`)
    .replace(/\b(your|opponent's) any 1 ((?:queenside|kingside) (?:rook|bishop|knight)|[a-h]-pawn)\b/gi, (_match, owner: string, piece: string) => `${owner} ${piece}`)
    .replace(/\.\./g, ".")
    .replace(/\s+/g, " ")
    .trim();
}
