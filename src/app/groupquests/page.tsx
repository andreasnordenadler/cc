import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import SiteNav from "@/components/site-nav";

const overviewSteps = [
  {
    title: "Create",
    copy: "Pick one or more side quests, set the proof window, choose invite rules, and lock the group quest constraints.",
  },
  {
    title: "Play",
    copy: "Everyone plays real games elsewhere. SQC only counts proof that matches the room rules.",
  },
  {
    title: "Prove",
    copy: "Each room gets its own leaderboard, event feed, and group-valid proof separate from solo progress.",
  },
];

const roomStates = [
  {
    label: "Hosting",
    title: "Rooms you host",
    copy: "Create the room, invite players, lock rules, start the window, and keep the race moving.",
    action: "Create a room",
    href: "/groupquests/create",
  },
  {
    label: "Playing",
    title: "Rooms you joined",
    copy: "See what is live, what starts next, what proof still counts, and your next side quest move.",
    action: "View sample room",
    href: "/groupquests/gq_demo_no_castle_01",
  },
];

export const metadata = {
  title: "Group Side Quests · Side Quest Chess",
  description: "Side Quest Chess multiplayer rooms for shared side quests, fresh proof, and group leaderboards.",
};

export default async function GroupQuestsPage() {
  const { userId } = await auth();

  return (
    <main className="site-shell groupquests-page">
      <SiteNav isSignedIn={Boolean(userId)} active="challenges" />

      <div className="content-wrap">
        <section className="hero-card groupquests-hero">
          <span className="eyebrow">Multiplayer side quests</span>
          <h1>Group Side Quests.</h1>
          <p className="hero-copy">
            Create a shared side-quest room, invite players, and race to complete fresh chess proof inside the group window.
          </p>
          <div className="auth-reassurance-grid" aria-label="Group Side Quest highlights">
            <span>Private or invite-link rooms</span>
            <span>Fresh proof only</span>
            <span>Leaderboard + celebration</span>
          </div>
          <div className="hero-actions button-row">
            <Link className="button primary" href="/groupquests/create">Create Group Side Quest</Link>
            <a className="button secondary" href="#join-group-side-quest">Join with invite link</a>
          </div>
        </section>

        <section className="mission-card groupquests-how-card" aria-label="How Group Side Quests work">
          <div className="section-head">
            <div>
              <h2>Create. Play. Prove.</h2>
            </div>
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

        <section className="grid groupquests-hub-grid" aria-label="Group Side Quest actions">
          <article className="mission-card groupquests-create-card">
            <span className="eyebrow">Create</span>
            <h2>Start a Group Side Quest.</h2>
            <p>
              Host a one-off race, a short ladder, or a small side-quest night with friends. The room controls who can join, which side quests count, and what games are eligible.
            </p>
            <div className="groupquests-create-steps">
              <div><strong>1</strong><span>Name the room</span></div>
              <div><strong>2</strong><span>Pick one or more side quests</span></div>
              <div><strong>3</strong><span>Lock invite and game rules</span></div>
            </div>
            <Link className="button primary" href="/groupquests/create">Create Group Side Quest</Link>
          </article>

          <article className="mission-card groupquests-owned-card">
            <div className="section-head">
              <div>
                <span className="eyebrow">Your rooms</span>
                <h2>Host or play.</h2>
              </div>
            </div>
            <div className="groupquests-card-stack">
              {roomStates.map((state) => (
                <article className="groupquests-group-card" key={state.title}>
                  <div className="card-meta">
                    <span>{state.label}</span>
                  </div>
                  <h3>{state.title}</h3>
                  <p>{state.copy}</p>
                  <Link className="button secondary" href={state.href}>{state.action}</Link>
                </article>
              ))}
            </div>
          </article>
        </section>

        <section className="mission-card groupquests-join-card" id="join-group-side-quest" aria-label="Join a Group Side Quest">
          <div className="section-head">
            <div>
              <span className="eyebrow">Join</span>
              <h2>Got an invite?</h2>
            </div>
          </div>
          <div className="groupquests-join-grid">
            <div>
              <p>
                Group Side Quests are built around shareable room links. Open an invite, join the room, then complete proof that matches that room’s window and constraints.
              </p>
            </div>
            <div className="groupquests-invite-preview" aria-label="Invite link example">
              <strong>Invite link</strong>
              <span>sidequestchess.com/groupquests/gq_…</span>
            </div>
          </div>
        </section>

        <section className="mission-card groupquests-rules-card" aria-label="Group Side Quest completion rules">
          <span className="eyebrow">Proof rule</span>
          <h2>Personal proof and group proof are different ledgers.</h2>
          <p>
            Finishing a side quest alone still counts for your account. Finishing it inside a Group Side Quest requires fresh room-valid proof: joined participant, eligible window, matching game rules, room score, and group celebration.
          </p>
        </section>
      </div>
    </main>
  );
}
