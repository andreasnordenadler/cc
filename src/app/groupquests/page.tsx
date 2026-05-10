import Image from "next/image";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import SiteNav from "@/components/site-nav";

const overviewSteps = [
  {
    title: "Create",
    copy: "Pick one or more side quests, set the proof window, choose invite rules, and lock the group quest constraints.",
    href: "/groupquests/create",
  },
  {
    title: "Play",
    copy: "Everyone plays real games elsewhere. SQC only counts proof that matches the room rules.",
    href: "/groupquests/gq_demo_no_castle_01",
  },
  {
    title: "Prove",
    copy: "Each room gets its own leaderboard, event feed, and group-valid proof separate from solo progress.",
    href: "#group-side-quest-proof-rule",
  },
];

const loggedOutActions = [
  {
    title: "Create a New Group Side Quest",
    copy: "Start the ridiculous dare, choose the side quests, and invite the people who deserve trouble.",
    action: "Create Group Side Quest",
    href: "/groupquests/create",
  },
  {
    title: "Join by invite",
    copy: "Got sent a room link? Open it, check the rules, and prove the nonsense inside the window.",
    action: "How invites work",
    href: "#join-group-side-quest",
  },
];

const currentRooms = [
  {
    title: "No Castle Night",
    status: "Live now",
    role: "Hosting",
    detail: "1 of 3 side quests cleared · proof window open",
    href: "/groupquests/gq_demo_no_castle_01",
    action: "Enter room",
  },
  {
    title: "Beginner Chaos Ladder",
    status: "Next up",
    role: "Playing",
    detail: "Starts when the host opens the room",
    href: "/groupquests/gq_demo_no_castle_01",
    action: "View room",
  },
];

const previousRooms = [
  {
    title: "Proof Loop Warmup",
    status: "Finished",
    role: "Played",
    detail: "Final proof and leaderboard available",
    href: "/groupquests/gq_demo_no_castle_01",
    action: "View results",
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
          <h1>Group Side Quests.</h1>
          <p className="hero-copy">
            Start a ridiculous chess dare with friends. Pick the nonsense, set the rules, then see who can actually prove it over the board.
          </p>
        </section>

        {userId ? (
          <section className="mission-card groupquests-user-overview" aria-label="Your Group Side Quests overview">
            <div className="section-head">
              <div>
                <span className="eyebrow">Your Group Side Quests</span>
                <h2>Current rooms first.</h2>
              </div>
              <Link className="button secondary" href="/groupquests/create">Create new</Link>
            </div>

            <div className="groupquests-user-grid">
              <article className="groupquests-user-column">
                <div className="section-head compact">
                  <h3>Active now</h3>
                  <span className="badge gold">{currentRooms.length}</span>
                </div>
                <div className="groupquests-card-stack">
                  {currentRooms.map((room) => (
                    <Link className="groupquests-room-row" href={room.href} key={`${room.title}-${room.role}`}>
                      <div>
                        <span>{room.role}</span>
                        <h4>{room.title}</h4>
                        <p>{room.detail}</p>
                      </div>
                      <strong>{room.status}</strong>
                      <em>{room.action}</em>
                    </Link>
                  ))}
                </div>
              </article>

              <article className="groupquests-user-column muted">
                <div className="section-head compact">
                  <h3>Previous</h3>
                  <span className="badge">{previousRooms.length}</span>
                </div>
                <div className="groupquests-card-stack">
                  {previousRooms.map((room) => (
                    <Link className="groupquests-room-row" href={room.href} key={`${room.title}-${room.role}`}>
                      <div>
                        <span>{room.role}</span>
                        <h4>{room.title}</h4>
                        <p>{room.detail}</p>
                      </div>
                      <strong>{room.status}</strong>
                      <em>{room.action}</em>
                    </Link>
                  ))}
                </div>
              </article>
            </div>
          </section>
        ) : (
          <>
            <section className="mission-card groupquests-story-card" aria-label="What Group Side Quests are">
              <div>
                <span className="eyebrow">How it feels</span>
                <h2>A tiny chess tournament for bad ideas.</h2>
                <p>
                  Group Side Quests turn normal chess nights into a shared challenge: one player creates a room, everyone agrees on the side quests and game rules, then players prove their results with real games from Lichess or Chess.com.
                </p>
                <p>
                  Each room has its own deadline, leaderboard, proof feed, and winner moment. Your personal coat of arms still matters — but the group only counts proof earned inside that room.
                </p>
              </div>
              <div className="groupquests-process-graphic" aria-label="Group Side Quest process graphic">
                <Image
                  alt="Noble chess knights competing, with the winner holding a stamped proof scroll"
                  className="groupquests-knight-competition-art"
                  height={720}
                  priority={false}
                  src="/illustrations/group-side-quests-knight-competition.png"
                  width={960}
                />
              </div>
            </section>

            <section className="grid groupquests-logged-out-actions" aria-label="Start with Group Side Quests">
              {loggedOutActions.map((item) => (
                <article className="mission-card groupquests-action-card" key={item.title}>
                  <h2>{item.title}.</h2>
                  <p>{item.copy}</p>
                  <Link className="button primary" href={item.href}>{item.action}</Link>
                </article>
              ))}
            </section>
          </>
        )}

        <section className="mission-card groupquests-how-card" aria-label="How Group Side Quests work">
          <div className="section-head">
            <div>
              <h2>Create. Play. Prove.</h2>
            </div>
          </div>
          <div className="groupquests-how-grid">
            {overviewSteps.map((step, index) => (
              <Link
                className="groupquests-how-step clickable"
                href={step.href}
                key={step.title}
              >
                <strong>{index + 1}</strong>
                <span>{step.title}</span>
                <p>{step.copy}</p>
              </Link>
            ))}
          </div>
        </section>

        {userId ? null : (
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
        )}

        <section className="mission-card groupquests-rules-card" id="group-side-quest-proof-rule" aria-label="Group Side Quest completion rules">
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
