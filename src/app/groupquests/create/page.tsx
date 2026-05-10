import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import GroupQuestDraftBuilder from "@/components/group-quest-draft-builder";
import SiteNav from "@/components/site-nav";
import { CHALLENGES } from "@/lib/challenges";

const createChecklist = [
  "Name the Group Side Quest and pick the first side quest.",
  "Choose who can join and how long proof stays open.",
  "Lock provider rules so every participant plays under the same constraints.",
  "Preview the participant page and host maintenance controls before sharing.",
];

export const metadata = {
  title: "Create Group Side Quest · Side Quest Chess",
  description: "Create a Side Quest Chess Group Side Quest with invite rules, proof windows, and mandatory game settings.",
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
      <SiteNav isSignedIn={Boolean(userId)} active="groupquests" />

      <div className="content-wrap">
        <section className="hero-card groupquests-hero">
          <span className="eyebrow">Create Group Side Quest</span>
          <h1>Set the dare before the chaos.</h1>
          <p className="hero-copy">
            Build the Group Side Quest in stages: side quests, invites, proof window, locked game rules, and the host maintenance view participants will rely on once it goes live.
          </p>
          <div className="hero-actions button-row">
            <Link className="button secondary" href="/groupquests">Back to overview</Link>
            <Link className="button secondary" href="/groupquests/gq_demo_no_castle_01">Preview live detail</Link>
          </div>
        </section>

        <section className="mission-card groupquests-create-intro" aria-label="Create Group Side Quest checklist">
          <div>
            <span className="eyebrow">Create flow</span>
            <h2>A host should always know what is locked, shareable, and still editable.</h2>
            <p>
              The creator experience now mirrors the future maintenance flow: every decision becomes part of the participant rules summary and the host controls preview.
            </p>
          </div>
          <div className="groupquests-create-steps">
            {createChecklist.map((item, index) => (
              <div key={item}>
                <strong>{index + 1}</strong>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mission-card groupquests-create-card" aria-label="Group Side Quest draft builder">
          <GroupQuestDraftBuilder quests={builderQuests} />
        </section>
      </div>
    </main>
  );
}
