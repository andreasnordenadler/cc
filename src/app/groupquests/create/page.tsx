import Link from "next/link";
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
        <section className="hero-card groupquests-hero">
          <span className="eyebrow">Create Multiplayer Side Quest</span>
          <h1>Set the dare before the chaos.</h1>
          <p className="hero-copy">
            Build the Multiplayer Side Quest in stages: side quests, public or private visibility, proof window, locked game rules, and the host maintenance view participants will rely on once it goes live.
          </p>
          <div className="hero-actions button-row">
            <Link className="button secondary" href="/groupquests">Back to overview</Link>
            <Link className="button secondary" href="/groupquests/gq_demo_no_castle_01">Preview live detail</Link>
          </div>
        </section>

        <section className="mission-card groupquests-create-card" aria-label="Multiplayer Side Quest draft builder">
          <GroupQuestDraftBuilder quests={builderQuests} />
        </section>
      </div>
    </main>
  );
}
