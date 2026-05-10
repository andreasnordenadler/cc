import Image from "next/image";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import SiteNav from "@/components/site-nav";

const overviewSteps = [
  {
    title: "Create",
    copy: "Pick one or more side quests, set the proof window, choose invite rules, and lock the Group Side Quest constraints.",
    href: "/groupquests/create",
  },
  {
    title: "Play",
    copy: "Everyone plays real games elsewhere. SQC only counts proof that matches the Group Side Quest rules.",
  },
  {
    title: "Prove",
    copy: "Each Group Side Quest gets its own leaderboard, event feed, and group-valid proof separate from solo progress.",
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
    title: "See how it works",
    copy: "Group Side Quests have side quests, a proof window, locked rules, a leaderboard, and one glorious proof-scroll winner.",
    action: "View the flow",
    href: "#group-side-quest-flow",
  },
];

const attentionItems = [
  {
    title: "No Castle Night",
    copy: "Proof window is open. Submit a fresh No Castle game for the group ledger.",
    href: "/groupquests/gq_demo_no_castle_01",
    action: "Submit proof",
    tone: "green",
  },
  {
    title: "Beginner Chaos Ladder",
    copy: "Starts tonight. Confirm the Blitz 5+3 rules before round one opens.",
    href: "/groupquests/gq_demo_no_castle_01",
    action: "Review rules",
    tone: "gold",
  },
];

const roomSections = [
  {
    title: "Live now",
    count: 1,
    rooms: [
      {
        title: "No Castle Night",
        meta: "Hosting · 4 players · Blitz 5+3",
        state: "You: not proven yet",
        next: "Next: submit a fresh No Castle game",
        href: "/groupquests/gq_demo_no_castle_01",
        action: "Open",
        tone: "green",
      },
    ],
  },
  {
    title: "Starting soon",
    count: 1,
    rooms: [
      {
        title: "Beginner Chaos Ladder",
        meta: "Playing · starts in 2 hours · Blitz only",
        state: "Waiting for host",
        next: "Next: review rules before the window opens",
        href: "/groupquests/gq_demo_no_castle_01",
        action: "Review",
        tone: "gold",
      },
    ],
  },
  {
    title: "Drafts you manage",
    count: 1,
    rooms: [
      {
        title: "Friday Fool’s Mate Sprint",
        meta: "Draft · invite link not shared yet",
        state: "Needs invites",
        next: "Next: add chess IDs or copy the room link",
        href: "/groupquests/create",
        action: "Continue setup",
        tone: "blue",
      },
    ],
  },
  {
    title: "Finished",
    count: 1,
    rooms: [
      {
        title: "Proof Loop Warmup",
        meta: "Played · final leaderboard ready",
        state: "You placed 2nd",
        next: "Final proof and results are available",
        href: "/groupquests/gq_demo_no_castle_01",
        action: "View results",
        tone: "muted",
      },
    ],
  },
];

export const metadata = {
  title: "Group Side Quests · Side Quest Chess",
  description: "Side Quest Chess Group Side Quests for shared side quests, fresh proof, and group leaderboards.",
};

export default async function GroupQuestsPage() {
  const { userId } = await auth();

  return (
    <main className="site-shell groupquests-page">
      <SiteNav isSignedIn={Boolean(userId)} active="groupquests" />

      <div className="content-wrap">
        <section className="hero-card groupquests-hero">
          <h1>Group Side Quests.</h1>
          <p className="hero-copy">
            {userId
              ? "Start a ridiculous chess dare with friends. Pick the nonsense, set the rules, then see who can actually prove it over the board."
              : "Sign In/Up and start a ridiculous chess dare with friends. Pick the nonsense, set the rules, then see who can actually prove it over the board."}
          </p>
        </section>

        {userId ? (
          <>
            <section className="mission-card groupquests-user-overview" aria-label="Your Group Side Quests overview">
              <div className="section-head">
                <div>
                  <span className="eyebrow">My Group Side Quests</span>
                  <h2>Rooms you host or play in.</h2>
                  <p>Open the room that needs you, start a new one, or join from an invite link.</p>
                </div>
                <div className="groupquests-dashboard-actions">
                  <Link className="button primary" href="/groupquests/create">Create Group Side Quest</Link>
                  <Link className="button secondary" href="#join-group-side-quest">Join with invite link</Link>
                </div>
              </div>

              <div className="groupquests-attention-panel" aria-label="Group Side Quests needing your attention">
                <div className="section-head compact">
                  <h3>Needs your attention</h3>
                  <span className="badge gold">{attentionItems.length}</span>
                </div>
                <div className="groupquests-attention-list">
                  {attentionItems.map((item) => (
                    <Link className={`groupquests-attention-row ${item.tone}`} href={item.href} key={item.title}>
                      <div>
                        <strong>{item.title}</strong>
                        <p>{item.copy}</p>
                      </div>
                      <span>{item.action}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="groupquests-room-sections" aria-label="Your Group Side Quest rooms by status">
                {roomSections.map((section) => (
                  <article className="groupquests-room-section" key={section.title}>
                    <div className="section-head compact">
                      <h3>{section.title}</h3>
                      <span className="badge">{section.count}</span>
                    </div>
                    <div className="groupquests-card-stack">
                      {section.rooms.map((room) => (
                        <Link className={`groupquests-dashboard-room ${room.tone}`} href={room.href} key={room.title}>
                          <div>
                            <span>{room.meta}</span>
                            <h4>{room.title}</h4>
                            <strong>{room.state}</strong>
                            <p>{room.next}</p>
                          </div>
                          <em>{room.action}</em>
                        </Link>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </>
        ) : (
          <>
            <section className="mission-card groupquests-story-card" aria-label="What Group Side Quests are">
              <div>
                <h2>A tiny chess tournament for bad ideas.</h2>
                <p>
                  Group Side Quests turn normal chess nights into a shared challenge: one player creates a Group Side Quest, everyone agrees on the side quests and game rules, then players prove their results with real games from Lichess or Chess.com.
                </p>
                <p>
                  Each Group Side Quest has its own deadline, leaderboard, proof feed, and winner moment. Your personal coat of arms still matters — but the group only counts proof earned inside that Group Side Quest.
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

        <section className="mission-card groupquests-join-card" id="join-group-side-quest" aria-label="Join a Group Side Quest">
          <div className="section-head">
            <div>
              <span className="eyebrow">Join with invite link</span>
              <h2>Review the rules before your proof counts.</h2>
            </div>
          </div>
          <div className="groupquests-join-grid">
            <div>
              <p>
                Invite links open the Group Side Quest detail page first. Players see the side quest set, proof window, mandatory game rules, leaderboard state, and whether joining is instant or approval-based.
              </p>
              <p>
                Nothing from solo My Side Quests is silently imported. The group ledger starts when the player joins and the proof window is open.
              </p>
            </div>
            <div className="groupquests-invite-preview">
              <strong>Example invite</strong>
              <span>sidequestchess.com/groupquests/gq_demo_no_castle_01</span>
              <Link className="button secondary" href="/groupquests/gq_demo_no_castle_01">Preview detail page</Link>
            </div>
          </div>
        </section>

        <section className="mission-card groupquests-how-card" id="group-side-quest-flow" aria-label="How Group Side Quests work">
          <div className="section-head">
            <div>
              <h2>Create. Play. Prove.</h2>
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

        <section className="mission-card groupquests-rules-card" id="group-side-quest-proof-rule" aria-label="Group Side Quest completion rules">
          <span className="eyebrow">Proof rule</span>
          <h2>Personal proof and group proof are different ledgers.</h2>
          <p>
            Finishing a side quest alone still counts for your account. Finishing it inside a Group Side Quest requires fresh Group Side Quest-valid proof: joined participant, eligible window, matching game rules, Group Side Quest score, and group celebration.
          </p>
        </section>
      </div>
    </main>
  );
}
