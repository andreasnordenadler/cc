import { redirect } from "next/navigation";
import { auth, clerkClient } from "@clerk/nextjs/server";
import GroupQuestDraftBuilder from "@/components/group-quest-draft-builder";
import MultiplayerModeSwitcher from "@/components/multiplayer-mode-switcher";
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
  const officialCount = builderQuests.length;
  const communityCount = customQuests.length + publicCommunityQuests.length;
  const preselectedQuest = requestedQuestId
    ? [...builderQuests, ...customQuests, ...publicCommunityQuests].find((quest) => quest.id === requestedQuestId)
    : null;

  return (
    <main className="site-shell groupquests-page">
      <SiteNav isSignedIn={Boolean(userId)} active="create-multiplayer" />

      <div className="content-wrap">
        <section className="mission-card groupquests-create-minihero" aria-label="Create Multiplayer Side Quest intro">
          <div>
            <span className="eyebrow">Create Multiplayer Side Quest</span>
            <h1>Build a Multiplayer Side Quest. Blame your friends later.</h1>
            <p>Pick up to four Side Quests, set the time window, then share the table with players.</p>
          </div>
        </section>

        <MultiplayerModeSwitcher active="create" />

        <section className="mission-card groupquests-create-mobile-map" aria-label="Mobile create Multiplayer Side Quest flow">
          <div className="section-head compact">
            <div>
              <span className="eyebrow">Create</span>
              <h2>Create a Community Multiplayer Side Quest.</h2>
              <p>The mobile app starts this flow inside Multiplayer, then asks for name, invite copy, Side Quest stack, provider rules, proof window, and visibility.</p>
            </div>
            <div className="create-max-pill">
              <strong>Max 4</strong>
              <span>Side Quests</span>
            </div>
          </div>

          <div className="groupquests-create-source-summary" aria-label="Create Side Quest source tabs">
            <div className="groupquests-create-source-tab official">
              <span>Official Side Quests</span>
              <strong>{officialCount}</strong>
              <small>Default mobile picker source.</small>
            </div>
            <div className="groupquests-create-source-tab community">
              <span>Community Side Quests</span>
              <strong>{communityCount}</strong>
              <small>Your custom quests plus public community rules.</small>
            </div>
          </div>

          <div className="groupquests-create-flow-grid" aria-label="Create Multiplayer Side Quest mobile fields">
            <div>
              <span>1</span>
              <strong>Name and invite copy</strong>
              <p>A Multiplayer Side Quest where everyone tries the same Side Quests with fresh public games.</p>
            </div>
            <div>
              <span>2</span>
              <strong>Pick Side Quests</strong>
              <p>{preselectedQuest ? `${preselectedQuest.title} is preselected from the catalog.` : "Official opens first; Community/Custom is one switch away."}</p>
            </div>
            <div>
              <span>3</span>
              <strong>Provider and rules</strong>
              <p>Lichess or Chess.com, plus time control, rated state, and player color constraints.</p>
            </div>
            <div>
              <span>4</span>
              <strong>Proof window and invite</strong>
              <p>Public listing, unlisted link, or private host code with a clear start and deadline.</p>
            </div>
          </div>
        </section>

        <section className="mission-card groupquests-create-card" aria-label="Multiplayer Side Quest draft builder">
          <GroupQuestDraftBuilder quests={[...builderQuests, ...customQuests, ...publicCommunityQuests]} initialQuestId={requestedQuestId} />
        </section>
      </div>
    </main>
  );
}
