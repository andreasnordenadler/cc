import Image from "next/image";
import Link from "next/link";
import { auth, clerkClient } from "@clerk/nextjs/server";
import GroupQuestInviteKeyJoin from "@/components/group-quest-invite-key-join";
import MultiplayerModeSwitcher from "@/components/multiplayer-mode-switcher";
import SiteNav from "@/components/site-nav";
import { listPublicGroupQuests, listUserRelatedGroupQuests, type ServerGroupQuest } from "@/lib/groupquests";

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
    copy: "Each Multiplayer Side Quest gets its own leaderboard, event feed, and multiplayer-valid proof separate from Solo Side Quest progress.",
  },
];

const loggedOutActions = [
  {
    title: "Host a table",
    copy: "Pick the quest stack, proof window, and invite style, then bring friends into a shared run.",
    action: "Create Multiplayer Side Quest",
    href: "/groupquests/create",
  },
  {
    title: "Join a public table",
    copy: "Browse open Multiplayer Side Quests, inspect the rule preview, and choose a table that fits your next game.",
    action: "Browse Public Tables",
    href: "/groupquests/public",
  },
];

const tableGuideCards = [
  {
    title: "Public table",
    copy: "Open discovery, visible rules, and a leaderboard anyone can inspect before joining.",
    action: "Browse public tables",
    href: "/groupquests/public",
  },
  {
    title: "Private host code",
    copy: "Use a host code when the table is for a known group and should stay out of public discovery.",
    action: "Enter code",
    href: "#private-invite",
  },
  {
    title: "Host your own",
    copy: "Create a launch-ready Multiplayer Side Quest with official or Custom Solo Side Quest rules and proof settings.",
    action: "Build a table",
    href: "/groupquests/create",
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

function buildOfficialWeeks(quests: ServerGroupQuest[]) {
  const weekMap = new Map<string, { id: string; label: string; rangeLabel: string; rooms: Array<{ title: string; meta: string; href: string; action: string }> }>();

  quests.forEach((quest) => {
    const date = new Date(quest.endAt || quest.startAt || Date.now());
    const weekStart = new Date(date);
    const day = weekStart.getUTCDay() || 7;
    weekStart.setUTCDate(weekStart.getUTCDate() - day + 1);
    weekStart.setUTCHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setUTCDate(weekStart.getUTCDate() + 6);
    const id = weekStart.toISOString().slice(0, 10);
    const label = `Week of ${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
    const rangeLabel = `${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })}–${weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
    const existing = weekMap.get(id) ?? { id, label, rangeLabel, rooms: [] };
    existing.rooms.push({
      title: quest.name,
      meta: `${quest.officialLabel ?? "Official SQC"} · Final · ${quest.providerLabel} · ${quest.participants.length} player${quest.participants.length === 1 ? "" : "s"}`,
      href: `/groupquests/${quest.id}`,
      action: "Results",
    });
    weekMap.set(id, existing);
  });

  return Array.from(weekMap.values()).sort((a, b) => b.id.localeCompare(a.id));
}

export default async function GroupQuestsPage({ searchParams }: { searchParams?: Promise<{ inviteKey?: string }> }) {
  const { userId } = await auth();
  const resolvedSearchParams = await searchParams;
  const inviteKey = typeof resolvedSearchParams?.inviteKey === "string" ? resolvedSearchParams.inviteKey : "";
  let activeRooms: Array<{ title: string; status: string; meta: string; next: string; href: string; action: string; tone: string }> = [];
  let officialRooms: typeof activeRooms = [];
  let publicRooms: typeof activeRooms = [];
  let finishedRooms: Array<{ title: string; meta: string; href: string; action: string }> = [];
  let previousOfficialRooms: Array<{ title: string; meta: string; href: string; action: string }> = [];
  let officialWeeks: Array<{ id: string; label: string; rangeLabel: string; rooms: Array<{ title: string; meta: string; href: string; action: string }> }> = [];

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
    const finishedOfficialQuests = publicQuests
      .filter((quest) => quest.official && deriveQuestState(quest.startAt, quest.endAt).status === "Finished")
      .sort((a, b) => toTimestamp(b.endAt) - toTimestamp(a.endAt));

    previousOfficialRooms = finishedOfficialQuests.slice(0, 3).map((quest) => ({
      title: quest.name,
      meta: `${quest.officialLabel ?? "Official SQC"} · Final · ${quest.providerLabel} · ${quest.participants.length} player${quest.participants.length === 1 ? "" : "s"}`,
      href: `/groupquests/${quest.id}`,
      action: "Results",
    }));
    officialWeeks = buildOfficialWeeks(finishedOfficialQuests);

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
      <SiteNav isSignedIn={Boolean(userId)} active="multiplayer" />

      <div className="content-wrap">
        {!userId ? (
          <section className="hero-card groupquests-hero">
            <span className="eyebrow">Multiplayer Side Quests</span>
            <h1>Chess dares for a shared table.</h1>
            <p className="hero-copy">
              Sign in to host or join a Multiplayer Side Quest. Pick the challenge, agree on the proof rules, then let SQC keep the leaderboard honest.
            </p>
          </section>
        ) : null}

        <MultiplayerModeSwitcher active="overview" />

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

            <section className="mission-card groupquests-table-guide-card" aria-label="Choose a Multiplayer Side Quest table">
              <div className="section-head compact">
                <div>
                  <span className="eyebrow">Choose your table</span>
                  <h2>Public, private, or hosted by you.</h2>
                  <p>Start from the route that matches how your group wants to play, then inspect rules before anyone commits.</p>
                </div>
              </div>
              <div className="groupquests-table-guide-grid">
                {tableGuideCards.map((card) => (
                  <Link className="groupquests-table-guide-item" href={card.href} key={card.title}>
                    <strong>{card.title}</strong>
                    <p>{card.copy}</p>
                    <span>{card.action}</span>
                  </Link>
                ))}
              </div>
            </section>

            <section className="mission-card groupquests-private-invite-card" id="private-invite" aria-label="Join private Multiplayer Side Quest by invite code">
              <div className="section-head compact">
                <div>
                  <span className="eyebrow">Private invite</span>
                  <h2>Join by host code.</h2>
                  <p>Paste a private Multiplayer Side Quest code here. Private tables stay hidden from public discovery.</p>
                </div>
              </div>
              <GroupQuestInviteKeyJoin initialInviteKey={inviteKey} isSignedIn={Boolean(userId)} />
            </section>

            <section className="mission-card groupquests-rules-card" id="group-side-quest-proof-rule" aria-label="Multiplayer Side Quest completion rules">
              <span className="eyebrow">Proof rule</span>
              <h2>Personal proof and multiplayer proof are different ledgers.</h2>
              <p>
                Finishing a Side Quest alone still counts for your account. Finishing it inside a Multiplayer Side Quest requires fresh Multiplayer Side Quest-valid proof: joined participant, eligible window, matching game rules, verified table progress, and multiplayer celebration.
              </p>
            </section>

            <section className="mission-card groupquests-user-overview" aria-label="Your Multiplayer Side Quests overview">
              <div className="section-head groupquests-command-head">
                <div>
                  <span className="eyebrow">My Multiplayer Side Quests</span>
                  <h2>Your Multiplayer table room.</h2>
                  <p>Active tables, open public runs, and finished proof receipts are grouped so the next action is clear.</p>
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
                  ) : <p>No active Multiplayer Side Quests yet. Create or join a table to start your first shared run.</p>}
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

                <section className="groupquests-list-section official finished" aria-label="Previous official Multiplayer Side Quest results">
                  <div className="groupquests-list-heading">
                    <div>
                      <h3>Previous official results</h3>
                      <p>Final official SQC leaderboards stay inspectable here, matching the official results lane players expect.</p>
                    </div>
                    <span className="badge gold">{previousOfficialRooms.length}</span>
                  </div>

                  {previousOfficialRooms.length ? (
                    <div className="groupquests-finished-list">
                      {previousOfficialRooms.map((room) => (
                        <Link className="groupquests-finished-row" href={room.href} key={room.href}>
                          <div>
                            <small className="official-sqc-badge">Official SQC</small>
                            <strong>{room.title}</strong>
                            <p>{room.meta}</p>
                          </div>
                          <span>{room.action}</span>
                        </Link>
                      ))}
                    </div>
                  ) : <p>Final official results will appear here after the next weekly set closes.</p>}
                </section>

                <section className="groupquests-list-section official finished" aria-label="Official Multiplayer Side Quest weekly archive">
                  <div className="groupquests-list-heading">
                    <div>
                      <h3>Official weekly archive</h3>
                      <p>Browse older official weeks by date range, with each final leaderboard one click away.</p>
                    </div>
                    <span className="badge gold">{officialWeeks.length}</span>
                  </div>

                  {officialWeeks.length ? (
                    <div className="groupquests-finished-list">
                      {officialWeeks.map((week) => (
                        <div className="groupquests-finished-row" id={`official-week-${week.id}`} key={week.id}>
                          <div>
                            <strong>{week.label}</strong>
                            <p>{week.rangeLabel} · {week.rooms.length} official result{week.rooms.length === 1 ? "" : "s"}</p>
                            <div className="button-row">
                              {week.rooms.map((room) => (
                                <Link className="button ghost" href={room.href} key={room.href}>{room.title}</Link>
                              ))}
                            </div>
                          </div>
                          <span>Archive</span>
                        </div>
                      ))}
                    </div>
                  ) : <p>Older official weeks will appear here after finished official events accumulate.</p>}
                </section>

                <section className="groupquests-list-section" aria-label="Public Multiplayer Side Quests">
                  <div className="groupquests-list-heading">
                    <div>
                      <h3>Public Multiplayer Side Quests</h3>
                      <p>Open public Multiplayer Side Quests anyone can inspect and join.</p>
                    </div>
                    <span className="badge gold">{publicRooms.length}</span>
                  </div>
                  <div className="button-row">
                    <Link className="button secondary" href="/groupquests/public">Open discovery filters</Link>
                    <Link className="button ghost" href="/groupquests/public?status=joined">Joined by me</Link>
                    <Link className="button ghost" href="/groupquests/public?status=hosted">Hosted by me</Link>
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
                <h2>A shared run with proof everyone can trust.</h2>
                <p>
                  Multiplayer Side Quests turn normal chess nights into a table challenge: one player hosts, everyone reviews the quest stack and game rules, then SQC checks real Lichess or Chess.com games for valid proof.
                </p>
                <p>
                  Each table has its own deadline, leaderboard, proof feed, and winner moment. Your personal coat of arms still matters, but Multiplayer standings only count proof earned inside that table.
                </p>
              </div>
              <div className="groupquests-process-graphic" aria-label="Multiplayer Side Quest process graphic">
                <Image alt="Noble players around a chess table during a Multiplayer Side Quest" className="groupquests-knight-competition-art" height={1024} priority={false} src="/illustrations/multiplayer-side-quests-noble-chaos-coat-style.png" width={1024} />
              </div>
            </section>

            <section className="mission-card groupquests-table-guide-card" aria-label="Choose a Multiplayer Side Quest table">
              <div className="section-head compact">
                <div>
                  <span className="eyebrow">Choose your table</span>
                  <h2>Public, private, or hosted by you.</h2>
                  <p>Use the route that matches your group. Every table still shows its rules before anyone joins.</p>
                </div>
              </div>
              <div className="groupquests-table-guide-grid">
                {tableGuideCards.map((card) => (
                  <Link className="groupquests-table-guide-item" href={card.href} key={card.title}>
                    <strong>{card.title}</strong>
                    <p>{card.copy}</p>
                    <span>{card.action}</span>
                  </Link>
                ))}
              </div>
            </section>

            <section className="mission-card groupquests-private-invite-card" id="private-invite" aria-label="Join private Multiplayer Side Quest by invite code">
              <div className="section-head compact">
                <div>
                  <span className="eyebrow">Private invite</span>
                  <h2>Have a host code?</h2>
                  <p>Paste a private Multiplayer Side Quest code after signing in. Public tables stay open to browse.</p>
                </div>
              </div>
              <GroupQuestInviteKeyJoin initialInviteKey={inviteKey} isSignedIn={Boolean(userId)} />
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
                Finishing a side quest alone still counts for your account. Finishing it inside a Multiplayer Side Quest requires fresh Multiplayer Side Quest-valid proof: joined participant, eligible window, matching game rules, verified table progress, and multiplayer celebration.
              </p>
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}
