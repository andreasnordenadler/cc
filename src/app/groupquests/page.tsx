import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import SiteNav from "@/components/site-nav";

const managedGroups = [
  {
    title: "No Castle Night",
    href: "/groupquests/gq_demo_no_castle_01",
    role: "Hosting",
    status: "Live draft",
    members: "3 players",
    progress: "1 / 3 cleared",
    next: "Invite two friends, then lock the proof window",
  },
  {
    title: "Weekend Horse Club",
    href: "/groupquests/create",
    role: "Hosting",
    status: "Draft setup",
    members: "Invite-only",
    progress: "0 / 5 joined",
    next: "Choose Knights Before Coffee as the first race",
  },
];

const memberGroups = [
  {
    title: "Queenless After Dark",
    href: "/groupquests/gq_demo_no_castle_01",
    role: "Playing",
    status: "Starts soon",
    members: "6 players",
    progress: "Waiting for start",
    next: "Prepare a public rated game attempt",
  },
  {
    title: "Beginner Chaos Ladder",
    href: "/groupquests/gq_demo_no_castle_01",
    role: "Playing",
    status: "Open invite",
    members: "4 players",
    progress: "Step 1 unlocked",
    next: "Complete Knights Before Coffee inside the group window",
  },
];

const overviewSteps = [
  {
    title: "Create",
    copy: "Pick a side quest, set the proof window, choose invite rules, and lock the chess-game constraints.",
  },
  {
    title: "Play",
    copy: "Everyone plays real games elsewhere. SQC only counts proof that matches the room rules.",
  },
  {
    title: "Celebrate",
    copy: "The room gets its own leaderboard, event feed, and group-valid proof separate from solo progress.",
  },
];

export const metadata = {
  title: "Group Side Quests · Side Quest Chess",
  description: "Hidden Side Quest Chess multiplayer Group Side Quests overview.",
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
          <h1>Group Side Quests.</h1>
          <p className="hero-copy">
            A shared version of My Side Quests: create a room, invite players, and race to complete fresh chess proof inside the group window.
          </p>
          <div className="auth-reassurance-grid" aria-label="Current Group Side Quest constraints">
            <span>{userId ? "Signed-in hub view" : "Signed-out preview"}</span>
            <span>Fresh competition proof</span>
            <span>No public nav link</span>
          </div>
          <div className="hero-actions button-row">
            <Link className="button primary" href="/groupquests/create">Create Group Side Quest</Link>
            <Link className="button secondary" href="/groupquests/gq_demo_no_castle_01">Open room prototype</Link>
          </div>
        </section>

        <section className="mission-card groupquests-how-card" aria-label="How Group Side Quests work">
          <div className="section-head">
            <div>
              <span className="eyebrow">Mission control</span>
              <h2>Create. Play. Prove.</h2>
            </div>
            <span className="badge green">Hidden alpha</span>
          </div>
          <div className="groupquests-how-grid">
            {overviewSteps.map((step, index) => (
              <div key={step.title}>
                <strong>{index + 1}</strong>
                <span>{step.title}</span>
                <p>{step.copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid groupquests-hub-grid" aria-label="Group Side Quest hub">
          <article className="mission-card groupquests-create-card">
            <span className="eyebrow">Create</span>
            <h2>Start a Group Side Quest.</h2>
            <p>
              Start from the builder when you want to host. The overview stays focused on the rooms that need your attention.
            </p>
            <div className="groupquests-create-steps">
              <div><strong>1</strong><span>Name the room</span></div>
              <div><strong>2</strong><span>Pick the side quest</span></div>
              <div><strong>3</strong><span>Lock invite and game rules</span></div>
            </div>
            <Link className="button primary" href="/groupquests/create">Create Group Side Quest</Link>
          </article>

          <article className="mission-card groupquests-owned-card">
            <div className="section-head">
              <div>
                <span className="eyebrow">Hosting</span>
                <h2>Group Side Quests you host.</h2>
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
              <span className="eyebrow">Playing</span>
              <h2>Group Side Quests you joined.</h2>
            </div>
            <span className="badge green">{memberGroups.length} active</span>
          </div>
          <div className="big-grid groupquests-member-grid">
            {memberGroups.map((group) => (
              <GroupCard group={group} key={group.title} />
            ))}
          </div>
        </section>

        <section className="mission-card groupquests-rules-card" aria-label="Group Side Quest completion rules">
          <span className="eyebrow">Completion state rule</span>
          <h2>Personal proof and group proof are different ledgers.</h2>
          <p>
            Finishing a side quest alone still counts for your account. Finishing it inside a Group Side Quest requires fresh room-valid proof: joined participant, eligible window, matching game rules, room score, and group celebration.
          </p>
        </section>
      </div>
    </main>
  );
}
