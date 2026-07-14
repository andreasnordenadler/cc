import Image from "next/image";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { unstable_noStore as noStore } from "next/cache";
import { notFound, redirect } from "next/navigation";
import MobileAppWebShell from "@/components/mobile-app-web-shell";
import CustomSideQuestOwnerControls from "@/components/custom-side-quest-owner-controls";
import { describeCustomSideQuestRuleDetails } from "@/lib/community-side-quests";
import { getCustomSideQuestBadgeUrl, getCustomSideQuestById, getCustomSideQuests } from "@/lib/custom-side-quests";
import { getChessComUsername, getLichessUsername, getPreferredRunnerName, type UserMetadataRecord } from "@/lib/user-metadata";

export const dynamic = "force-dynamic";

export default async function CustomSideQuestOwnerPage({ params }: { params: Promise<{ id: string }> }) {
  noStore();
  const { id } = await params;
  const user = await currentUser();
  if (!user) redirect(`/sign-in?redirect_url=${encodeURIComponent(`/custom-side-quests/${id}`)}`);

  const publicMetadata = user.publicMetadata ? user.publicMetadata as UserMetadataRecord : {};
  const privateMetadata = user.privateMetadata && typeof user.privateMetadata === "object" ? user.privateMetadata as UserMetadataRecord : {};
  const sourceMetadata = getCustomSideQuests(privateMetadata).length ? privateMetadata : publicMetadata;
  const quest = getCustomSideQuestById(sourceMetadata, id);
  if (!quest) notFound();

  const displayName = getPreferredRunnerName(publicMetadata, {
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    emailAddress: user.primaryEmailAddress?.emailAddress,
  }) || "Side Quest Chess";
  const rules = describeCustomSideQuestRuleDetails(quest.config);

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
        <Image alt="" src={getCustomSideQuestBadgeUrl(quest)} width={132} height={148} priority />
        <span className="sqc-card-eyebrow">Your Custom Side Quest · {quest.lifecycle === "draft" ? "Draft" : quest.lifecycle === "archived" ? "Archived" : quest.visibility === "public" ? "Published publicly" : "Ready privately"}</span>
        <h1>{quest.title}</h1>
        <p>{quest.summary}</p>
      </section>

      <section className="sqc-native-card sqc-multiplayer-native-card">
        <span className="sqc-card-eyebrow">What counts</span>
        <h2>{rules.length} saved condition{rules.length === 1 ? "" : "s"}</h2>
        <ul>{rules.map((rule) => <li key={rule}>{rule}</li>)}</ul>
        <p>These are the verifier rules currently saved for this Side Quest.</p>
      </section>

      <CustomSideQuestOwnerControls quest={{
        id: quest.id,
        title: quest.title,
        summary: quest.summary,
        config: quest.config,
        visibility: quest.visibility ?? "private",
        lifecycle: quest.lifecycle ?? "published",
      }} />

      <div className="sqc-community-detail-actions">
        {quest.visibility === "public" && quest.lifecycle === "published" ? <Link className="sqc-detail-secondary-button" href={`/challenges/community/${encodeURIComponent(quest.id)}`}>View public page</Link> : null}
        <Link className="sqc-detail-quiet-button" href="/custom-side-quests">Back to My Custom Side Quests</Link>
      </div>
    </div>
  </MobileAppWebShell>;
}
