import { redirect } from "next/navigation";
import { auth, clerkClient } from "@clerk/nextjs/server";
import GroupQuestDraftBuilder from "@/components/group-quest-draft-builder";
import SiteNav from "@/components/site-nav";
import { CHALLENGES } from "@/lib/challenges";
import { listPublicCommunitySideQuests } from "@/lib/community-side-quests";
import { getCustomSideQuests, parseCustomRuleConfig } from "@/lib/custom-side-quests";

export const metadata = {
  title: "Create Multiplayer Side Quest · Side Quest Chess",
  description: "Create a Side Quest Chess Multiplayer Side Quest with invite rules, proof windows, and mandatory game settings.",
};

export default async function CreateGroupQuestPage({ searchParams }: { searchParams?: Promise<{ quest?: string | string[] }> }) {
  const { userId } = await auth();
  const resolvedSearchParams = await searchParams;
  const rawRequestedQuestId = Array.isArray(resolvedSearchParams?.quest) ? resolvedSearchParams?.quest[0] : resolvedSearchParams?.quest;
  const requestedQuestId = rawRequestedQuestId ? decodeURIComponent(rawRequestedQuestId) : undefined;

  if (!userId) {
    redirect("/sign-in?redirect_url=%2Fgroupquests%2Fcreate");
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const customQuests = getCustomSideQuests(user.privateMetadata && typeof user.privateMetadata === "object" ? user.privateMetadata as Record<string, unknown> : {})
    .filter((quest) => (quest.lifecycle ?? "published") === "published" && parseCustomRuleConfig(quest.config)?.blocks.length)
    .map((quest) => ({
      id: quest.id,
      title: quest.title,
      objective: quest.summary,
      reward: 100,
      difficulty: "Custom Solo Side Quest",
      source: "custom" as const,
    }));
  const customQuestIds = new Set(customQuests.map((quest) => quest.id));
  const publicCommunityQuests = (await listPublicCommunitySideQuests(client, { limit: 120 }))
    .filter((quest) => !customQuestIds.has(quest.id) && parseCustomRuleConfig(quest.config)?.blocks.length)
    .map((quest) => ({
      id: quest.id,
      title: quest.title,
      objective: quest.summary,
      reward: 100,
      difficulty: "Community Solo Side Quest",
      source: "community" as const,
    }));

  const builderQuests = CHALLENGES.map((challenge) => ({
    id: challenge.id,
    title: challenge.title,
    objective: challenge.objective,
    reward: challenge.reward,
    difficulty: challenge.difficulty,
    source: "official" as const,
  }));

  return (
    <main className="site-shell groupquests-page">
      <SiteNav isSignedIn={Boolean(userId)} active="groupquests" />

      <div className="content-wrap">
        <section className="mission-card groupquests-create-minihero" aria-label="Create Multiplayer Side Quest intro">
          <div>
            <span className="eyebrow">Create Multiplayer Side Quest</span>
            <h1>Build a Multiplayer Side Quest. Blame your friends later.</h1>
          </div>
        </section>

        <section className="mission-card groupquests-create-card" aria-label="Multiplayer Side Quest draft builder">
          <GroupQuestDraftBuilder quests={[...builderQuests, ...customQuests, ...publicCommunityQuests]} initialQuestId={requestedQuestId} />
        </section>
      </div>
    </main>
  );
}
