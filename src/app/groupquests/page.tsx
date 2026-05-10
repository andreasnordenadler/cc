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

const currentGroupSideQuests = [
  {
    title: "No Castle Night",
    status: "Live now",
    role: "Hosting",
    detail: "1 of 3 side quests cleared · proof window open",
    href: "/groupquests/gq_demo_no_castle_01",
    action: "Manage and play",
    tone: "green",
  },
  {
    title: "Beginner Chaos Ladder",
    status: "Starts soon",
    role: "Playing",
    detail: "Waiting for the host to open the proof window",
    href: "/groupquests/gq_demo_no_castle_01",
    action: "Review rules",
    tone: "gold",
  },
];

const previousGroupSideQuests = [
  {
    title: "Proof Loop Warmup",
    status: "Finished",
    role: "Played",
    detail: "Final proof and leaderboard available",
    href: "/groupquests/gq_demo_no_castle_01",
    action: "View results",
  },
];

const dashboardStats = [
  { label: "Your active", value: "2", copy: "1 hosting · 1 playing" },
  { label: "Needs action", value: "1", copy: "No Castle proof can be submitted" },
  { label: "Invite state", value: "Open", copy: "Join links and approvals stay visible" },
];

const quickActions = [
  { title: "Create", copy: "Start a new Group Side Quest with locked rules and invite mode.", href: "/groupquests/create", action: "Create new" },
  { title: "Continue", copy: "Jump back into No Castle Night, where the proof window is already open.", href: "/groupquests/gq_demo_no_castle_01", action: "Open live quest" },
  { title: "Join", copy: "Paste or open an invite link, then review the rules before you commit.", href: "#join-group-side-quest", action: "Check invite flow" },
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
                  <span className="eyebrow">Your Group Side Quests</span>
                  <h2>One dashboard for hosting, playing, and proof.</h2>
                </div>
                <Link className="button secondary" href="/groupquests/create">Create new</Link>
              </div>

              <div className="groupquests-dashboard-summary" aria-label="Group Side Quest summary">
                {dashboardStats.map((stat) => (
                  <div key={stat.label}>
                    <strong>{stat.value}</strong>
                    <span>{stat.label}</span>
                    <p>{stat.copy}</p>
                  </div>
                ))}
              </div>

              <div className="groupquests-next-action">
                <div>
                  <span className="eyebrow">Next best action</span>
                  <h3>Submit No Castle Night proof before the window closes.</h3>
                  <p>Your personal No Castle clear is separate. This Group Side Quest needs fresh proof from a joined participant after the start time.</p>
                </div>
                <Link className="button primary" href="/groupquests/gq_demo_no_castle_01">Open live Group Side Quest</Link>
              </div>

              <div className="groupquests-user-grid">
                <article className="groupquests-user-column">
                  <div className="section-head compact">
                    <h3>Current</h3>
                    <span className="badge gold">{currentGroupSideQuests.length}</span>
                  </div>
                  <div className="groupquests-card-stack">
                    {currentGroupSideQuests.map((quest) => (
                      <Link className={`groupquests-room-row ${quest.tone}`} href={quest.href} key={`${quest.title}-${quest.role}`}>
                        <div>
                          <span>{quest.role}</span>
                          <h4>{quest.title}</h4>
                          <p>{quest.detail}</p>
                        </div>
                        <strong>{quest.status}</strong>
                        <em>{quest.action}</em>
                      </Link>
                    ))}
                  </div>
                </article>

                <article className="groupquests-user-column muted">
                  <div className="section-head compact">
                    <h3>Previous</h3>
                    <span className="badge">{previousGroupSideQuests.length}</span>
                  </div>
                  <div className="groupquests-card-stack">
                    {previousGroupSideQuests.map((quest) => (
                      <Link className="groupquests-room-row" href={quest.href} key={`${quest.title}-${quest.role}`}>
                        <div>
                          <span>{quest.role}</span>
                          <h4>{quest.title}</h4>
                          <p>{quest.detail}</p>
                        </div>
                        <strong>{quest.status}</strong>
                        <em>{quest.action}</em>
                      </Link>
                    ))}
                  </div>
                </article>
              </div>
            </section>

            <section className="grid groupquests-quick-actions" aria-label="Group Side Quest quick actions">
              {quickActions.map((item) => (
                <Link className="mission-card groupquests-quick-action" href={item.href} key={item.title}>
                  <span className="eyebrow">{item.title}</span>
                  <h3>{item.action}</h3>
                  <p>{item.copy}</p>
                </Link>
              ))}
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
