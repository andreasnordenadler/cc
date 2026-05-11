import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import GroupQuestDraftBuilder from "@/components/group-quest-draft-builder";
import SiteNav from "@/components/site-nav";
import { CHALLENGES } from "@/lib/challenges";

export const metadata = {
  title: "Create Multiplayer Side Quest · Side Quest Chess",
  description: "Create a Side Quest Chess Multiplayer Side Quest with invite rules, proof windows, and mandatory game settings.",
};

export default async function CreateGroupQuestPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in?redirect_url=%2Fgroupquests%2Fcreate");
  }

  const builderQuests = CHALLENGES.slice(0, 8).map((challenge) => ({
    id: challenge.id,
    title: challenge.title,
    objective: challenge.objective,
    reward: challenge.reward,
    difficulty: challenge.difficulty,
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
          <GroupQuestDraftBuilder quests={builderQuests} />
        </section>
      </div>
    </main>
  );
}
