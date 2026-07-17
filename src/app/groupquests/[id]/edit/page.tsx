import { auth, clerkClient } from "@clerk/nextjs/server";
import { unstable_noStore as noStore } from "next/cache";
import { notFound, redirect } from "next/navigation";
import GroupQuestEditForm from "@/components/group-quest-edit-form";
import MobileAppWebShell from "@/components/mobile-app-web-shell";
import { isAdminAnalyticsViewer } from "@/lib/analytics";
import { CHALLENGES } from "@/lib/challenges";
import { listPublicCommunitySideQuests } from "@/lib/community-side-quests";
import { getCustomSideQuests, parseCustomRuleConfig } from "@/lib/custom-side-quests";
import { getGroupQuestEditAccess } from "@/lib/groupquest-edit-access";
import { findGroupQuestById, isGroupQuestFinished } from "@/lib/groupquests";
import { getChessComUsername, getLichessUsername, getPreferredRunnerName, type UserMetadataRecord } from "@/lib/user-metadata";

export const metadata = {
  title: "Edit Multiplayer Side Quest · Side Quest Chess",
  description: "Host-only editor for a Multiplayer Side Quest.",
};

export default async function EditGroupQuestPage({ params }: { params: Promise<{ id: string }> }) {
  noStore();
  const [{ userId }, { id }, client] = await Promise.all([auth(), params, clerkClient()]);
  const record = await findGroupQuestById(client, id);
  const access = getGroupQuestEditAccess({
    userId,
    quest: record ? {
      id: record.groupQuest.id,
      hostUserId: record.groupQuest.hostUserId,
      storageUserId: record.userId,
      finished: isGroupQuestFinished(record.groupQuest),
    } : null,
  });
  if (access.kind === "not-found") notFound();
  if (access.kind === "redirect") redirect(access.href);

  const signedInUser = await client.users.getUser(userId!);
  const publicMetadata = (signedInUser.publicMetadata ?? {}) as UserMetadataRecord;
  const privateMetadata = (signedInUser.privateMetadata ?? {}) as UserMetadataRecord;
  const customQuests = getCustomSideQuests(privateMetadata).filter((quest) =>
    (quest.lifecycle ?? "published") === "published" && Boolean(parseCustomRuleConfig(quest.config)?.blocks.length),
  );
  const customQuestIds = new Set(customQuests.map((quest) => quest.id));
  const snapshotQuestIds = new Set((record!.groupQuest.customQuestSnapshots ?? []).map((snapshot) => snapshot.id));
  const publicCommunityQuests = (await listPublicCommunitySideQuests(client, { limit: 120 })).filter((quest) =>
    !customQuestIds.has(quest.id)
      && !snapshotQuestIds.has(quest.id)
      && Boolean(parseCustomRuleConfig(quest.config)?.blocks.length),
  );
  const editQuests = [
    ...CHALLENGES.map((challenge) => ({ ...challenge, source: "official" as const })),
    ...customQuests.map((quest) => ({
      id: quest.id,
      title: quest.title,
      objective: quest.summary,
      reward: 100,
      difficulty: "Custom Solo Side Quest",
      source: "custom" as const,
    })),
    ...publicCommunityQuests.map((quest) => ({
      id: quest.id,
      title: quest.title,
      objective: quest.summary,
      reward: 100,
      difficulty: "Community Solo Side Quest",
      source: "community" as const,
    })),
    ...(record!.groupQuest.customQuestSnapshots ?? [])
      .filter((snapshot) => !customQuestIds.has(snapshot.id))
      .map((snapshot) => ({
        id: snapshot.id,
        title: snapshot.title,
        objective: snapshot.summary,
        reward: snapshot.reward ?? 100,
        difficulty: "Saved custom snapshot",
        source: "snapshot" as const,
      })),
  ];
  const displayName = getPreferredRunnerName(publicMetadata, {
    firstName: signedInUser.firstName,
    lastName: signedInUser.lastName,
    username: signedInUser.username,
    emailAddress: signedInUser.primaryEmailAddress?.emailAddress,
  }) || "Side Quest Chess";

  return (
    <MobileAppWebShell
      activeTab="multiplayerSideQuests"
      signedIn
      displayName={displayName}
      lichessUsername={getLichessUsername(publicMetadata)}
      chessComUsername={getChessComUsername(publicMetadata)}
      modalPresentation
      immersivePresentation
      closeHref={`/groupquests/${encodeURIComponent(id)}`}
      theme={{
        backgroundTop: "#352021",
        backgroundMid: "#171011",
        glow: "rgba(245, 200, 106, .24)",
        accent: "rgba(245, 200, 106, .14)",
      }}
    >
      <div className="sqc-stack sqc-create-multiplayer-screen">
        <section className="sqc-multiplayer-detail-hero sqc-create-multiplayer-hero">
          <span className="sqc-multiplayer-kicker">Host controls</span>
          <h1>Edit Multiplayer Side Quest.</h1>
          <p>Update the invite, schedule, proof rules, and Side Quest lineup for {record!.groupQuest.name}.</p>
        </section>
        <GroupQuestEditForm
          canMarkOfficial={isAdminAnalyticsViewer(signedInUser)}
          groupQuest={record!.groupQuest}
          quests={editQuests}
        />
      </div>
    </MobileAppWebShell>
  );
}
