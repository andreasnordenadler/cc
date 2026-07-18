import MobileAppWebShell, { MobileCreateCustomScreen } from "@/components/mobile-app-web-shell";
import { currentUser } from "@clerk/nextjs/server";
import { unstable_noStore as noStore } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { getCustomSideQuestById, getCustomSideQuests } from "@/lib/custom-side-quests";
import { getChessComUsername, getLichessUsername, getPreferredRunnerName, type UserMetadataRecord } from "@/lib/user-metadata";

export default async function CreateCustomSideQuestPage({ searchParams }: { searchParams: Promise<{ edit?: string | string[] }> }) {
  noStore();
  const editParam = (await searchParams).edit;
  const edit = typeof editParam === "string" ? editParam : "";
  const user = await currentUser();
  if (edit && !user) redirect(`/sign-in?redirect_url=${encodeURIComponent(`/create-custom-side-quest?edit=${edit}`)}`);
  const metadataRecord = user?.publicMetadata ? (user.publicMetadata as UserMetadataRecord) : {};
  const privateMetadata = user?.privateMetadata && typeof user.privateMetadata === "object" ? user.privateMetadata as UserMetadataRecord : {};
  const sourceMetadata = getCustomSideQuests(privateMetadata).length ? privateMetadata : metadataRecord;
  const savedEditQuest = edit ? getCustomSideQuestById(sourceMetadata, edit) : null;
  if (edit && !savedEditQuest) notFound();
  const editQuest = savedEditQuest ? {
    id: savedEditQuest.id,
    title: savedEditQuest.title,
    summary: savedEditQuest.summary,
    config: savedEditQuest.config,
    visibility: savedEditQuest.visibility === "public" ? "public" as const : "private" as const,
    lifecycle: savedEditQuest.lifecycle === "draft" || savedEditQuest.lifecycle === "archived" ? savedEditQuest.lifecycle : "published" as const,
  } : null;
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
      immersivePresentation
      theme={{
        backgroundTop: "#352021",
        backgroundMid: "#171011",
        glow: "rgba(245, 200, 106, .22)",
        accent: "rgba(96, 240, 175, .08)",
      }}
    >
      <MobileCreateCustomScreen signedIn={Boolean(user)} initialQuest={editQuest} />
    </MobileAppWebShell>
  );
}
