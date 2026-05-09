import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import GroupQuestDraftBuilder from "@/components/group-quest-draft-builder";
import SiteNav from "@/components/site-nav";
import { CHALLENGES } from "@/lib/challenges";

export const metadata = {
  title: "Create Group Quest · Side Quest Chess",
  description: "Hidden Side Quest Chess group quest draft builder.",
};

export default async function CreateGroupQuestPage() {
  const { userId } = await auth();
  const builderQuests = CHALLENGES.slice(0, 8).map((challenge) => ({
    id: challenge.id,
    title: challenge.title,
    objective: challenge.objective,
    reward: challenge.reward,
    difficulty: challenge.difficulty,
  }));

  return (
    <main className="site-shell groupquests-page">
      <SiteNav isSignedIn={Boolean(userId)} active="challenges" />

      <div className="content-wrap">
        <section className="hero-card groupquests-hero">
          <span className="eyebrow">Create group quest</span>
          <h1>Build the room before the chaos.</h1>
          <p className="hero-copy">
            Name the room, pick the quest, choose invite rules, and make Lichess-style game settings mandatory. This is still hidden and draft-only while persistence is being shaped.
          </p>
          <div className="hero-actions button-row">
            <Link className="button secondary" href="/groupquests">Back to overview</Link>
            <Link className="button secondary" href="/groupquests/gq_demo_no_castle_01">Open room prototype</Link>
          </div>
        </section>

        <section className="mission-card groupquests-create-card" aria-label="Group quest draft builder">
          <GroupQuestDraftBuilder quests={builderQuests} />
        </section>
      </div>
    </main>
  );
}
