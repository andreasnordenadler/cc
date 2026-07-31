import Image from "next/image";
import Link from "next/link";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { unstable_noStore as noStore } from "next/cache";
import { notFound, redirect } from "next/navigation";
import MobileAppWebShell from "@/components/mobile-app-web-shell";
import CustomSideQuestOwnerControls from "@/components/custom-side-quest-owner-controls";
import CustomSideQuestProofControls from "@/components/custom-side-quest-proof-controls";
import CustomSideQuestActivity from "@/components/custom-side-quest-activity";
import CommunitySoloShareControls from "@/components/community-solo-share-controls";
import { getCustomSideQuestRulePresentation } from "@/lib/community-side-quests";
import { buildOwnedCustomQuestStats, loadCustomQuestGroupContext } from "@/lib/custom-side-quest-activity";
import { buildReplicatedCustomSoloCompletionState } from "@/lib/community-solo-detail-state";
import { getCustomSideQuestBadgeUrl, getCustomSideQuestById, getCustomSideQuests } from "@/lib/custom-side-quests";
import { getCustomOwnerStateSavedMessage } from "@/lib/custom-owner-controls";
import { listPublicGroupQuests, listUserRelatedGroupQuests } from "@/lib/groupquests";
import { getChessComUsername, getLichessUsername, getPreferredRunnerName, type UserMetadataRecord } from "@/lib/user-metadata";

export const dynamic = "force-dynamic";

export default async function CustomSideQuestOwnerPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ "state-saved"?: string | string[] }> }) {
  noStore();
  const { id } = await params;
  const query = await searchParams;
  const [user, client] = await Promise.all([currentUser(), clerkClient()]);
  if (!user) redirect(`/sign-in?redirect_url=${encodeURIComponent(`/custom-side-quests/${id}`)}`);

  const publicMetadata = user.publicMetadata ? user.publicMetadata as UserMetadataRecord : {};
  const privateMetadata = user.privateMetadata && typeof user.privateMetadata === "object" ? user.privateMetadata as UserMetadataRecord : {};
  const sourceMetadata = getCustomSideQuests(privateMetadata).length ? privateMetadata : publicMetadata;
  const quest = getCustomSideQuestById(sourceMetadata, id);
  if (!quest) notFound();
  const questLifecycle = quest.lifecycle ?? "published";
  const questVisibility = quest.visibility ?? "private";

  const displayName = getPreferredRunnerName(publicMetadata, {
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    emailAddress: user.primaryEmailAddress?.emailAddress,
  }) || "Side Quest Chess";
  const rulePresentation = getCustomSideQuestRulePresentation(quest.config, quest.summary);
  const active = Boolean(publicMetadata.activeChallenge && typeof publicMetadata.activeChallenge === "object" && (publicMetadata.activeChallenge as { id?: string }).id === quest.id);
  const completionState = await buildReplicatedCustomSoloCompletionState({ metadataRecords: [publicMetadata, sourceMetadata], quest });
  const groupQuests = await loadCustomQuestGroupContext({
    loadRelated: () => listUserRelatedGroupQuests(client, user.id),
    loadPublic: () => listPublicGroupQuests(client),
  });
  const stats = buildOwnedCustomQuestStats({
    questId: quest.id,
    publicMetadata,
    groupQuests,
  });

  return <MobileAppWebShell
    activeTab="sideQuests"
    signedIn
    displayName={displayName}
    lichessUsername={getLichessUsername(publicMetadata)}
    chessComUsername={getChessComUsername(publicMetadata)}
    modalPresentation
    immersivePresentation
    closeHref="/custom-side-quests"
  >
    <div className="sqc-stack sqc-custom-library-screen">
      <section className="sqc-native-card sqc-community-detail-hero">
        <span className="sqc-custom-detail-coat-frame" aria-hidden="true">
          <Image className="sqc-custom-detail-coat-image" alt="" src={getCustomSideQuestBadgeUrl(quest)} width={108} height={118} priority />
          {completionState.completed ? <Image className="sqc-custom-detail-completion-seal" alt="" src="/mobile-source/stamps/quest-complete-red-wax-sqc-v3.png" width={44} height={44} priority /> : null}
        </span>
        <span className="sqc-card-eyebrow">Your Custom Side Quest · {quest.lifecycle === "draft" ? "Draft" : quest.lifecycle === "archived" ? "Archived" : quest.visibility === "public" ? "Published publicly" : "Ready privately"}</span>
        <h1>{quest.title}</h1>
        <p>{rulePresentation.summary}</p>
      </section>

      {query["state-saved"] === `${questLifecycle}-${questVisibility}` ? <p className="sqc-action-success" role="status">{getCustomOwnerStateSavedMessage(quest.title, { lifecycle: questLifecycle, visibility: questVisibility })}</p> : null}

      <section className="sqc-native-card sqc-multiplayer-native-card">
        <span className="sqc-card-eyebrow">Challenge</span>
        <h2>What to do</h2>
        <p>{rulePresentation.summary}</p>
        <p>Play a new public game after picking this Side Quest.</p>
      </section>

      <section className="sqc-native-card sqc-multiplayer-native-card">
        <span className="sqc-card-eyebrow">Rule details</span>
        <h2>{rulePresentation.logicLabel}</h2>
        <p>{rulePresentation.lines.length} saved condition{rulePresentation.lines.length === 1 ? "" : "s"}</p>
        <ol>{rulePresentation.lines.map((rule, index) => <li key={`${index}-${rule}`}>{rule}</li>)}</ol>
        <p>Complete these conditions in one eligible public game.</p>
      </section>

      <CustomSideQuestProofControls
        questId={quest.id}
        active={active}
        playable={quest.lifecycle === "published"}
        completed={completionState.completed}
        completedAt={completionState.completedAt}
        resultHref={completionState.resultHref}
        latestAttempt={completionState.latestAttempt}
        allowCompletedReset
      />

      <CustomSideQuestActivity stats={stats} />

      <CustomSideQuestOwnerControls quest={{
        id: quest.id,
        title: quest.title,
        summary: quest.summary,
        config: quest.config,
        visibility: quest.visibility ?? "private",
        lifecycle: quest.lifecycle ?? "published",
      }} active={active} />

      <div className="sqc-community-detail-actions">
        {quest.visibility === "public" && quest.lifecycle === "published" ? <>
          <CommunitySoloShareControls id={quest.id} title={quest.title} />
          <Link className="sqc-detail-secondary-button" href={`/challenges/community/${encodeURIComponent(quest.id)}`}>View public page</Link>
        </> : null}
        <Link className="sqc-detail-quiet-button" href="/custom-side-quests">Back to My Custom Side Quests</Link>
      </div>
    </div>
  </MobileAppWebShell>;
}
