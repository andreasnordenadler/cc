import Image from "next/image";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import SiteNav from "@/components/site-nav";

const overviewSteps = [
  {
    title: "Create",
    copy: "Pick one or more side quests, set the proof window, choose invite rules, and lock the Multiplayer Side Quest constraints.",
    href: "/groupquests/create",
  },
  {
    title: "Invite",
    copy: "Share the invite link so players can inspect the side quests, proof window, locked rules, and join conditions before committing.",
  },
  {
    title: "Play",
    copy: "Everyone plays real games elsewhere. SQC only counts proof that matches the Multiplayer Side Quest rules.",
  },
  {
    title: "Prove",
    copy: "Each Multiplayer Side Quest gets its own leaderboard, event feed, and multiplayer-valid proof separate from solo progress.",
  },
];

const loggedOutActions = [
  {
    title: "Create a New Multiplayer Side Quest",
    copy: "Start the ridiculous dare, choose the side quests, and invite the people who deserve trouble.",
    action: "Create Multiplayer Side Quest",
    href: "/groupquests/create",
  },
  {
    title: "Join a Public Multiplayer Side Quest",
    copy: "Find public Multiplayer Side Quests that hosts have opened for anyone to enter, then inspect the rules before joining.",
    action: "Join Public Side Quest",
    href: "/groupquests/public",
  },
];

const activeRooms = [
  {
    title: "No Castle Night",
    status: "Live",
    meta: "Hosting · 4 players · Blitz 5+3",
    next: "Submit fresh proof",
    href: "/groupquests/gq_demo_no_castle_01",
    action: "Open",
    tone: "green",
  },
  {
    title: "Beginner Chaos Ladder",
    status: "Soon",
    meta: "Playing · starts in 2 hours · Blitz only",
    next: "Review rules",
    href: "/groupquests/gq_demo_no_castle_01",
    action: "Review",
    tone: "gold",
  },
  {
    title: "Friday Fool’s Mate Sprint",
    status: "Draft",
    meta: "Managing · invite link not shared yet",
    next: "Add players",
    href: "/groupquests/create",
    action: "Setup",
    tone: "blue",
  },
];

const publicRooms = [
  {
    title: "No Castle Night",
    status: "Open",
    meta: "Public · Blitz 5+3 · 4 players",
    next: "Join the room",
    href: "/groupquests/gq_demo_no_castle_01",
    action: "Join",
    tone: "green",
  },
  {
    title: "Weekly Chaos Table",
    status: "Open",
    meta: "Public · any verified account · fresh proof",
    next: "Review rules",
    href: "/groupquests/public",
    action: "View",
    tone: "gold",
  },
];

const finishedRooms = [
  {
    title: "Proof Loop Warmup",
    meta: "Finished · you placed 2nd",
    href: "/groupquests/gq_demo_no_castle_01",
    action: "Results",
  },
  {
    title: "Pawn Storm Weekend",
    meta: "Finished · final proof saved",
    href: "/groupquests/gq_demo_no_castle_01",
    action: "Results",
  },
];

export const metadata = {
  title: "Multiplayer Side Quests · Side Quest Chess",
  description: "Side Quest Chess Multiplayer Side Quests for shared side quests, fresh proof, and multiplayer leaderboards.",
};

export default async function GroupQuestsPage() {
  const { userId } = await auth();

  return (
    <main className="site-shell groupquests-page">
      <SiteNav isSignedIn={Boolean(userId)} active="groupquests" />

      <div className="content-wrap">
        {!userId ? (
          <section className="hero-card groupquests-hero">
            <h1>Multiplayer Side Quests.</h1>
            <p className="hero-copy">
              Sign In/Up and start a ridiculous chess dare with friends. Pick the nonsense, set the rules, then see who can actually prove it over the board.
            </p>
          </section>
        ) : null}

        {userId ? (
          <>
            <section className="mission-card groupquests-how-card" id="group-side-quest-flow" aria-label="How Multiplayer Side Quests work">
              <div className="section-head">
                <div>
                  <span className="eyebrow">Multiplayer Side Quest flow</span>
                  <h2>Create. Invite. Play. Prove.</h2>
                </div>
                <Link className="button primary" href="/groupquests/create">Create Multiplayer Side Quest</Link>
              </div>
              <div className="groupquests-how-grid">
                {overviewSteps.map((step, index) => {
                  const content = (
                    <>
                      <strong>{index + 1}</strong>
                      <span>{step.title}</span>
                      <p>{step.copy}</p>
                    </>
                  );

                  return step.href ? (
                    <Link
                      className="groupquests-how-step clickable"
                      href={step.href}
                      key={step.title}
                    >
                      {content}
                    </Link>
                  ) : (
                    <article className="groupquests-how-step" key={step.title}>
                      {content}
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="mission-card groupquests-user-overview" aria-label="Your Multiplayer Side Quests overview">
              <div className="section-head">
                <div>
                  <span className="eyebrow">My Multiplayer Side Quests</span>
                  <h2>Your multiplayer command center.</h2>
                  <p>Your active rooms, public rooms you can join, and closed results — all in one simple list.</p>
                </div>
              </div>

              <div className="groupquests-timeline-list" aria-label="Your Multiplayer Quests">
                <section className="groupquests-list-section" aria-label="Active Multiplayer Quests">
                  <div className="groupquests-list-heading">
                    <div>
                      <h3>My Active Multiplayer Side Quests</h3>
                      <p>Live rooms, upcoming rooms, and drafts you manage.</p>
                    </div>
                    <span className="badge gold">{activeRooms.length}</span>
                  </div>

                  <div className="groupquests-compact-room-list">
                    {activeRooms.map((room) => (
                      <Link className={`groupquests-compact-room ${room.tone}`} href={room.href} key={room.title}>
                        <strong>{room.status}</strong>
                        <div>
                          <h4>{room.title}</h4>
                          <p>{room.meta}</p>
                        </div>
                        <span>{room.next}</span>
                        <em>{room.action}</em>
                      </Link>
                    ))}
                  </div>
                </section>

                <section className="groupquests-list-section" aria-label="Public Multiplayer Side Quests">
                  <div className="groupquests-list-heading">
                    <div>
                      <h3>Public Multiplayer Side Quests</h3>
                      <p>Open public rooms anyone can inspect and join.</p>
                    </div>
                    <span className="badge gold">{publicRooms.length}</span>
                  </div>

                  <div className="groupquests-compact-room-list">
                    {publicRooms.map((room) => (
                      <Link className={`groupquests-compact-room ${room.tone}`} href={room.href} key={room.title}>
                        <strong>{room.status}</strong>
                        <div>
                          <h4>{room.title}</h4>
                          <p>{room.meta}</p>
                        </div>
                        <span>{room.next}</span>
                        <em>{room.action}</em>
                      </Link>
                    ))}
                  </div>
                </section>

                <section className="groupquests-list-section finished" aria-label="Finished Multiplayer Quests">
                  <div className="groupquests-list-heading">
                    <div>
                      <h3>My Closed Multiplayer Side Quests</h3>
                      <p>Recent completed rooms and placements.</p>
                    </div>
                    <span className="badge">24</span>
                  </div>

                  <div className="groupquests-finished-list">
                    {finishedRooms.map((room) => (
                      <Link className="groupquests-finished-row" href={room.href} key={room.title}>
                        <div>
                          <strong>{room.title}</strong>
                          <p>{room.meta}</p>
                        </div>
                        <span>{room.action}</span>
                      </Link>
                    ))}
                  </div>

                  <Link className="button secondary groupquests-history-button" href="/groupquests/gq_demo_no_castle_01">
                    View all finished
                  </Link>
                </section>
              </div>
            </section>
          </>
        ) : (
          <>
            <section className="mission-card groupquests-story-card" aria-label="What Multiplayer Side Quests are">
              <div>
                <h2>A tiny chess tournament for bad ideas.</h2>
                <p>
                  Multiplayer Side Quests turn normal chess nights into a shared challenge: one player creates a Multiplayer Side Quest, everyone agrees on the side quests and game rules, then players prove their results with real games from Lichess or Chess.com.
                </p>
                <p>
                  Each Multiplayer Side Quest has its own deadline, leaderboard, proof feed, and winner moment. Your personal coat of arms still matters — but the Multiplayer Quest only counts proof earned inside that Multiplayer Side Quest.
                </p>
              </div>
              <div className="groupquests-process-graphic" aria-label="Multiplayer Side Quest process graphic">
                <Image
                  alt="Noble men and women comically arguing around a chess table during a Multiplayer Side Quest"
                  className="groupquests-knight-competition-art"
                  height={1024}
                  priority={false}
                  src="/illustrations/multiplayer-side-quests-noble-chaos-coat-style.png"
                  width={1024}
                />
              </div>
            </section>

            <section className="grid groupquests-logged-out-actions" aria-label="Start or join Multiplayer Side Quests">
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

        {!userId ? (
          <>
            <section className="mission-card groupquests-how-card" id="group-side-quest-flow" aria-label="How Multiplayer Side Quests work">
              <div className="section-head">
                <div>
                  <h2>Create. Invite. Play. Prove.</h2>
                </div>
              </div>
              <div className="groupquests-how-grid">
                {overviewSteps.map((step, index) => {
                  const content = (
                    <>
                      <strong>{index + 1}</strong>
                      <span>{step.title}</span>
                      <p>{step.copy}</p>
                    </>
                  );

                  return step.href ? (
                    <Link
                      className="groupquests-how-step clickable"
                      href={step.href}
                      key={step.title}
                    >
                      {content}
                    </Link>
                  ) : (
                    <article className="groupquests-how-step" key={step.title}>
                      {content}
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="mission-card groupquests-rules-card" id="group-side-quest-proof-rule" aria-label="Multiplayer Side Quest completion rules">
              <span className="eyebrow">Proof rule</span>
              <h2>Personal proof and multiplayer proof are different ledgers.</h2>
              <p>
                Finishing a side quest alone still counts for your account. Finishing it inside a Multiplayer Side Quest requires fresh Multiplayer Side Quest-valid proof: joined participant, eligible window, matching game rules, Multiplayer Side Quest score, and multiplayer celebration.
              </p>
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}
