import MobileAppWebShell, { MobileCustomSideQuestsScreen } from "@/components/mobile-app-web-shell";
import LocalCustomDraftLibrary from "@/components/local-custom-draft-library";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { unstable_noStore as noStore } from "next/cache";
import { buildCustomLibraryActivityRows, loadCustomQuestGroupContext } from "@/lib/custom-side-quest-activity";
import { getCustomSideQuests, type CustomSideQuest } from "@/lib/custom-side-quests";
import { listPublicGroupQuests, listUserRelatedGroupQuests } from "@/lib/groupquests";
import { getCustomCreateSuccessMessage, getCustomEditSuccessMessage } from "@/lib/mobile-create-forms";
import { getActiveChallenge, getChallengeProgress, getChessComUsername, getLichessUsername, getPreferredRunnerName, type UserMetadataRecord } from "@/lib/user-metadata";

export const metadata = {
  title: "My Custom Side Quests — Side Quest Chess",
  description: "My Custom Side Quests in the Side Quest Chess mobile app shell.",
};

export default async function CustomSideQuestsPage({ searchParams }: { searchParams: Promise<{ saved?: string | string[]; updated?: string | string[] }> }) {
  noStore();
  const params = await searchParams;
  const savedParam = params.saved;
  const savedId = typeof savedParam === "string" && /^custom-[a-z0-9-]+$/i.test(savedParam) ? savedParam : null;
  const updatedParam = params.updated;
  const updatedId = typeof updatedParam === "string" && /^custom-[a-z0-9-]+$/i.test(updatedParam) ? updatedParam : null;
  const user = await currentUser();
  const metadataRecord = user?.publicMetadata ? (user.publicMetadata as UserMetadataRecord) : {};
  const privateMetadataRecord = user?.privateMetadata ? (user.privateMetadata as UserMetadataRecord) : {};
  const libraryQuests = user ? getCustomSideQuests(getCustomSideQuests(privateMetadataRecord).length ? privateMetadataRecord : metadataRecord) : [];
  const groupQuests = user && libraryQuests.length
    ? await loadCustomQuestGroupContext({
        loadRelated: async () => listUserRelatedGroupQuests(await clerkClient(), user.id),
        loadPublic: async () => listPublicGroupQuests(await clerkClient()),
      })
    : [];
  const activityById = new Map<string, string>(buildCustomLibraryActivityRows({
    quests: libraryQuests,
    publicMetadata: metadataRecord,
    groupQuests,
  }).map((row) => [row.id, row.activity]));
  const customSideQuests = user ? getCustomLibraryRows(privateMetadataRecord, metadataRecord, activityById) : [];
  const updatedQuest = updatedId ? customSideQuests.find((quest) => quest.id === updatedId) : null;
  const savedQuest = savedId ? customSideQuests.find((quest) => quest.id === savedId) ?? null : null;
  const successMessage = updatedQuest
    ? getCustomEditSuccessMessage(updatedQuest.title)
    : savedQuest
      ? getCustomCreateSuccessMessage(savedQuest)
      : null;
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
      <MobileCustomSideQuestsScreen
        rows={customSideQuests}
        localDrafts={<LocalCustomDraftLibrary />}
        successMessage={successMessage}
      />
    </MobileAppWebShell>
  );
}

function getCustomLibraryRows(privateMetadata: UserMetadataRecord, publicMetadata: UserMetadataRecord, activityById: ReadonlyMap<string, string>) {
  const sourceMetadata = getCustomSideQuests(privateMetadata).length ? privateMetadata : publicMetadata;
  const activeId = getActiveChallenge(sourceMetadata)?.id ?? null;
  const completedIds = new Set(getChallengeProgress(sourceMetadata).completedChallengeIds);

  return getCustomSideQuests(sourceMetadata)
    .map((quest) => ({
      id: quest.id,
      title: quest.title,
      meta: [getCustomLibraryMeta(quest), activityById.get(quest.id) ?? "No plays yet."].join(" · "),
      status: getCustomLibraryStatus(quest, activeId, completedIds.has(quest.id)),
      sourceBadge: quest.lifecycle === "draft" ? "Draft" : quest.visibility === "public" ? "Community" : "Private",
      href: `/custom-side-quests/${encodeURIComponent(quest.id)}`,
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
