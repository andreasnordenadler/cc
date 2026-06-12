import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth, clerkClient } from "@clerk/nextjs/server";
import GroupQuestEditForm from "@/components/group-quest-edit-form";
import SiteNav from "@/components/site-nav";
import { CHALLENGES } from "@/lib/challenges";
import { getCustomSideQuests, parseCustomRuleConfig } from "@/lib/custom-side-quests";
import { isAdminAnalyticsViewer } from "@/lib/analytics";
import { findGroupQuestById } from "@/lib/groupquests";

export const metadata = {
  title: "Edit Multiplayer Side Quest · Side Quest Chess",
  description: "Host-only editor for a Multiplayer Side Quest.",
};

export default async function EditGroupQuestPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  const { id } = await params;
  if (!userId) redirect(`/sign-in?redirect_url=/groupquests/${id}/edit`);

  const client = await clerkClient();
  const record = await findGroupQuestById(client, id);
  if (!record) notFound();
  if (record.groupQuest.hostUserId !== userId) redirect(`/groupquests/${id}`);
  const signedInUser = await client.users.getUser(userId);
  const canMarkOfficial = isAdminAnalyticsViewer(signedInUser);
  const customQuests = getCustomSideQuests(signedInUser.privateMetadata && typeof signedInUser.privateMetadata === "object" ? signedInUser.privateMetadata as Record<string, unknown> : {})
    .filter((quest) => (quest.lifecycle ?? "published") === "published" && parseCustomRuleConfig(quest.config)?.blocks.length)
    .map((quest) => ({
      id: quest.id,
      title: quest.title,
      objective: quest.summary,
      reward: 100,
      difficulty: "Custom Solo Side Quest",
      source: "custom" as const,
    }));
  const snapshotQuests = (record.groupQuest.customQuestSnapshots ?? [])
    .filter((snapshot) => !customQuests.some((quest) => quest.id === snapshot.id))
    .map((snapshot) => ({
      id: snapshot.id,
      title: snapshot.title,
      objective: snapshot.summary,
      reward: snapshot.reward ?? 100,
      difficulty: "Saved custom snapshot",
      source: "snapshot" as const,
    }));
  const officialQuests = CHALLENGES.map((challenge) => ({ ...challenge, source: "official" as const }));

  return (
    <main className="site-shell groupquests-page">
      <SiteNav isSignedIn active="groupquests" />
      <div className="content-wrap">
        <section className="hero-card groupquests-hero public-groupquests-hero">
          <span className="eyebrow">Host tools</span>
          <h1>Edit Multiplayer Side Quest</h1>
          <p className="hero-copy">Update the public listing, invite copy, schedule, quest stack, and host rules for this event.</p>
          <div className="hero-actions button-row">
            <Link className="button secondary" href={`/groupquests/${id}`}>Back to quest</Link>
          </div>
        </section>

        <GroupQuestEditForm canMarkOfficial={canMarkOfficial} groupQuest={record.groupQuest} quests={[...officialQuests, ...customQuests, ...snapshotQuests]} />
      </div>
    </main>
  );
}
