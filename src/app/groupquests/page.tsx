import Image from "next/image";
import Link from "next/link";
import { auth, clerkClient } from "@clerk/nextjs/server";
import SiteNav from "@/components/site-nav";
import { listPublicGroupQuests, listUserRelatedGroupQuests } from "@/lib/groupquests";

const overviewSteps = [
  {
    title: "Create",
    copy: "Pick one or more side quests, set the proof window, choose invite rules, and lock the Multiplayer Side Quest constraints.",
    href: "/groupquests/create",
  },
  {
    title: "Invite",
    copy: "Share the invite link so players can inspect the side quests, proof window, and join conditions before committing.",
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

export const metadata = {
  title: "Multiplayer Side Quests · Side Quest Chess",
  description: "Side Quest Chess Multiplayer Side Quests for shared side quests, fresh proof, and multiplayer leaderboards.",
};

function toTimestamp(value: string) {
  const ts = Date.parse(value);
  return Number.isFinite(ts) ? ts : 0;
}

function deriveQuestState(startAt: string, endAt: string) {
  const now = Date.now();
  const start = toTimestamp(startAt);
  const end = toTimestamp(endAt);
  if (start && now < start) return { status: "Soon", tone: "gold", next: "Review rules" };
  if (end && now > end) return { status: "Finished", tone: "muted", next: "View results" };
  return { status: "Live", tone: "green", next: "Open" };
}

export default async function GroupQuestsPage() {
  const { userId } = await auth();
  let activeRooms: Array<{ title: string; status: string; meta: string; next: string; href: string; action: string; tone: string }> = [];
  let officialRooms: typeof activeRooms = [];
  let publicRooms: typeof activeRooms = [];
  let finishedRooms: Array<{ title: string; meta: string; href: string; action: string }> = [];

  if (userId) {
    const client = await clerkClient();
    const ownQuests = await listUserRelatedGroupQuests(client, userId);
    const publicQuests = await listPublicGroupQuests(client);

    activeRooms = ownQuests
      .filter((quest) => deriveQuestState(quest.startAt, quest.endAt).status !== "Finished")
      .map((quest) => {
        const state = deriveQuestState(quest.startAt, quest.endAt);
        const isHost = quest.hostUserId === userId;
        return {
          title: quest.name,
          status: state.status,
          meta: `${isHost ? "Hosting" : "Playing"} · ${quest.inviteMode === "unlisted-link" ? "Unlisted" : "Public"} · ${quest.participants.length} player${quest.participants.length === 1 ? "" : "s"} · ${quest.providerLabel}`,
          next: state.next,
          href: `/groupquests/${quest.id}${isHost ? "" : "?accepted=1"}`,
          action: state.status === "Soon" ? "Review" : "Open",
          tone: state.tone,
        };
      });



    finishedRooms = ownQuests
      .filter((quest) => deriveQuestState(quest.startAt, quest.endAt).status === "Finished")
      .map((quest) => {
        const isHost = quest.hostUserId === userId;
        return {
          title: quest.name,
          meta: `Finished · ${isHost ? "Hosted" : "Played"} · ${quest.participants.length} player${quest.participants.length === 1 ? "" : "s"} · ${quest.providerLabel}`,
          href: `/groupquests/${quest.id}${isHost ? "" : "?accepted=1"}`,
          action: "Results",
        };
      });

    const openPublicQuests = publicQuests
      .filter((quest) => deriveQuestState(quest.startAt, quest.endAt).status !== "Finished")
      .sort((a, b) => Number(Boolean(b.official)) - Number(Boolean(a.official)) || toTimestamp(b.createdAt) - toTimestamp(a.createdAt))
      .slice(0, 12);

    officialRooms = openPublicQuests.filter((quest) => quest.official).map((quest) => {
        const isHost = quest.hostUserId === userId;
        const isParticipant = quest.participants.some((participant) => participant.userId === userId);
        return {
          title: quest.name,
          status: "Open",
          meta: `${quest.officialLabel ?? "Official SQC"} · ${isHost ? "Hosted" : isParticipant ? "Joined" : "Public"} · ${quest.providerLabel} · ${quest.participants.length} player${quest.participants.length === 1 ? "" : "s"}`,
          next: isHost ? "Open listing" : isParticipant ? "Open joined quest" : "Inspect and join",
          href: `/groupquests/${quest.id}${!isHost && isParticipant ? "?accepted=1" : ""}`,
          action: isHost || isParticipant ? "Open" : "Join",
          tone: "green",
        };
      });

    publicRooms = openPublicQuests.filter((quest) => !quest.official).map((quest) => {
        const isHost = quest.hostUserId === userId;
        const isParticipant = quest.participants.some((participant) => participant.userId === userId);
        return {
          title: quest.name,
          status: "Open",
          meta: `${isHost ? "Hosted public quest" : isParticipant ? "Joined public quest" : "Public"} · ${quest.providerLabel} · ${quest.participants.length} player${quest.participants.length === 1 ? "" : "s"}`,
          next: isHost ? "Open listing" : isParticipant ? "Open joined quest" : "Inspect and join",
          href: `/groupquests/${quest.id}${!isHost && isParticipant ? "?accepted=1" : ""}`,
          action: isHost || isParticipant ? "Open" : "Join",
          tone: "green",
        };
      });
  }

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
                    <Link className="groupquests-how-step clickable" href={step.href} key={step.title}>
                      {content}
                    </Link>
                  ) : (
                    <article className="groupquests-how-step" key={step.title}>
                      {content}
                    </article>
                  );
                })}
              </div>
              <div className="groupquests-create-cta-row">
                <Link className="button primary" href="/groupquests/create">Create New Multiplayer Side Quest</Link>
              </div>
            </section>

            <section className="mission-card groupquests-user-overview" aria-label="Your Multiplayer Side Quests overview">
              <div className="section-head groupquests-command-head">
                <div>
                  <span className="eyebrow">My Multiplayer Side Quests</span>
                  <h2>Your multiplayer command center.</h2>
                  <p>Your active Multiplayer Side Quests, public Multiplayer Side Quests you can join, and closed results — all in one simple list.</p>
                </div>
                <Image alt="" className="groupquests-command-seal" height={112} src="/stamps/sqc-multiplayer-seal.png" width={112} />
              </div>

              <div className="groupquests-timeline-list" aria-label="Your Multiplayer Quests">
                <section className="groupquests-list-section" aria-label="Active Multiplayer Quests">
                  <div className="groupquests-list-heading">
                    <div>
                      <h3>My Active Multiplayer Side Quests</h3>
                      <p>Live Multiplayer Side Quests, upcoming Multiplayer Side Quests, and joined runs tied to your account.</p>
                    </div>
                    <span className="badge gold">{activeRooms.length}</span>
                  </div>

                  {activeRooms.length ? (
                    <div className="groupquests-compact-room-list">
                      {activeRooms.map((room) => (
                        <Link className={`groupquests-compact-room ${room.tone}`} href={room.href} key={room.href}>
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
                  ) : <p>No active Multiplayer Side Quests yet. Create one to start the chaos.</p>}
                </section>

                <section className="groupquests-list-section official" aria-label="Official SQC Multiplayer Side Quests">
                  <div className="groupquests-list-heading">
                    <div>
                      <h3>Official SQC Multiplayer Side Quests</h3>
                      <p>Curated SQC public events, highlighted first for easy joining.</p>
                    </div>
                    <span className="badge gold">{officialRooms.length}</span>
                  </div>

                  {officialRooms.length ? (
                    <div className="groupquests-compact-room-list">
                      {officialRooms.map((room) => (
                        <Link className={`groupquests-compact-room official ${room.tone}`} href={room.href} key={room.href}>
                          <strong>{room.status}</strong>
                          <div>
                            <small className="official-sqc-badge">Official SQC</small>
                            <h4>{room.title}</h4>
                            <p>{room.meta}</p>
                          </div>
                          <span>{room.next}</span>
                          <em>{room.action}</em>
                        </Link>
                      ))}
                    </div>
                  ) : <p>No official SQC Multiplayer Side Quests available right now.</p>}
                </section>

                <section className="groupquests-list-section" aria-label="Public Multiplayer Side Quests">
                  <div className="groupquests-list-heading">
                    <div>
                      <h3>Public Multiplayer Side Quests</h3>
                      <p>Open public Multiplayer Side Quests anyone can inspect and join.</p>
                    </div>
                    <span className="badge gold">{publicRooms.length}</span>
                  </div>

                  {publicRooms.length ? (
                    <div className="groupquests-compact-room-list">
                      {publicRooms.map((room) => (
                        <Link className={`groupquests-compact-room ${room.tone}`} href={room.href} key={room.href}>
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
                  ) : <p>No public Multiplayer Side Quests available right now.</p>}
                </section>

                <section className="groupquests-list-section finished" aria-label="Finished Multiplayer Quests">
                  <div className="groupquests-list-heading">
                    <div>
                      <h3>My Closed Multiplayer Side Quests</h3>
                      <p>Recent completed Multiplayer Side Quests and placements.</p>
                    </div>
                    <span className="badge">{finishedRooms.length}</span>
                  </div>

                  {finishedRooms.length ? (
                    <div className="groupquests-finished-list">
                      {finishedRooms.map((room) => (
                        <Link className="groupquests-finished-row" href={room.href} key={room.href}>
                          <div>
                            <strong>{room.title}</strong>
                            <p>{room.meta}</p>
                          </div>
                          <span>{room.action}</span>
                        </Link>
                      ))}
                    </div>
                  ) : <p>No finished Multiplayer Side Quests yet.</p>}
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
                <Image alt="Noble men and women comically arguing around a chess table during a Multiplayer Side Quest" className="groupquests-knight-competition-art" height={1024} priority={false} src="/illustrations/multiplayer-side-quests-noble-chaos-coat-style.png" width={1024} />
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
                    <Link className="groupquests-how-step clickable" href={step.href} key={step.title}>
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
