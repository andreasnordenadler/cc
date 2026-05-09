import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import SiteNav from "@/components/site-nav";

const managedGroups = [
  {
    title: "No Castle Night",
    href: "/groupquests/no-castle-night",
    role: "You manage",
    status: "Live draft",
    members: "3 players",
    progress: "1 / 3 cleared",
    next: "Invite two friends, then lock quest window",
  },
  {
    title: "Weekend Horse Club",
    href: "/groupquests/create",
    role: "You manage",
    status: "Draft setup",
    members: "Invite-only",
    progress: "0 / 5 joined",
    next: "Choose Knights Before Coffee as the first race",
  },
];

const memberGroups = [
  {
    title: "Queenless After Dark",
    href: "/groupquests/no-castle-night",
    role: "Participant",
    status: "Starts soon",
    members: "6 players",
    progress: "Waiting for start",
    next: "Prepare a public rated game attempt",
  },
  {
    title: "Beginner Chaos Ladder",
    href: "/groupquests/no-castle-night",
    role: "Participant",
    status: "Open invite",
    members: "4 players",
    progress: "Step 1 unlocked",
    next: "Complete Knights Before Coffee inside the group window",
  },
];

export const metadata = {
  title: "Group Quests · Side Quest Chess",
  description: "Hidden Side Quest Chess multiplayer group quest overview.",
};

function GroupCard({ group }: { group: (typeof managedGroups)[number] }) {
  return (
    <article className="mission-card groupquests-group-card">
      <div className="card-meta">
        <span>{group.role}</span>
        <span className="badge green">{group.status}</span>
      </div>
      <h3>{group.title}</h3>
      <div className="groupquests-mini-stats">
        <span>{group.members}</span>
        <span>{group.progress}</span>
      </div>
      <p>{group.next}</p>
      <Link className="button secondary" href={group.href}>Open</Link>
    </article>
  );
}

export default async function GroupQuestsPage() {
  const { userId } = await auth();

  return (
    <main className="site-shell groupquests-page">
      <SiteNav isSignedIn={Boolean(userId)} active="challenges" />

      <div className="content-wrap">
        <section className="hero-card groupquests-hero">
          <span className="eyebrow">Hidden multiplayer overview</span>
          <h1>Group quests overview.</h1>
          <p className="hero-copy">
            This top page is the clean hub: create a group quest, jump into rooms you manage, or continue rooms you belong to. Deeper setup and live room details now live behind separate pages.
          </p>
          <div className="auth-reassurance-grid" aria-label="Current group quest constraints">
            <span>{userId ? "Signed-in hub view" : "Signed-out preview"}</span>
            <span>Fresh competition proof</span>
            <span>No public nav link</span>
          </div>
          <div className="hero-actions button-row">
            <Link className="button primary" href="/groupquests/create">Create group quest</Link>
            <Link className="button secondary" href="/groupquests/no-castle-night">Open room prototype</Link>
          </div>
        </section>

        <section className="grid groupquests-overview-stats" aria-label="Group quest overview stats">
          <article className="stat-card">
            <strong>{managedGroups.length}</strong>
            <span>Managed rooms</span>
          </article>
          <article className="stat-card">
            <strong>{memberGroups.length}</strong>
            <span>Member rooms</span>
          </article>
          <article className="stat-card">
            <strong>0</strong>
            <span>Public links</span>
          </article>
        </section>

        <section className="grid groupquests-hub-grid" aria-label="Group quest hub">
          <article className="mission-card groupquests-create-card">
            <span className="eyebrow">Create</span>
            <h2>Start a group quest.</h2>
            <p>
              The builder now has its own page so this overview stays light. Set name, quest, invite mode, proof window, and mandatory Lichess-style rules there.
            </p>
            <Link className="button primary" href="/groupquests/create">Open builder</Link>
          </article>

          <article className="mission-card groupquests-owned-card">
            <div className="section-head">
              <div>
                <span className="eyebrow">Managed by you</span>
                <h2>Your rooms.</h2>
              </div>
              <span className="badge gold">{managedGroups.length}</span>
            </div>
            <div className="groupquests-card-stack">
              {managedGroups.map((group) => (
                <GroupCard group={group} key={group.title} />
              ))}
            </div>
          </article>
        </section>

        <section className="mission-card" aria-label="Groups you belong to">
          <div className="section-head">
            <div>
              <span className="eyebrow">Member hub</span>
              <h2>Groups you belong to.</h2>
            </div>
            <span className="badge green">{memberGroups.length} active</span>
          </div>
          <div className="big-grid groupquests-member-grid">
            {memberGroups.map((group) => (
              <GroupCard group={group} key={group.title} />
            ))}
          </div>
        </section>

        <section className="mission-card groupquests-rules-card" aria-label="Competition completion rules">
          <span className="eyebrow">Completion state rule</span>
          <h2>Personal proof and group proof are different ledgers.</h2>
          <p>
            Personal completion stays yours. Group completion is separate: joined participant, eligible window, room-specific proof, room score, and group celebration.
          </p>
        </section>
      </div>
    </main>
  );
}
