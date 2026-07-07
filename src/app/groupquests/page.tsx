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
    copy: "Pick one or more Side Quests, set the proof window, choose invite rules, and lock the Multiplayer Side Quest constraints.",
    href: "/groupquests/create",
  },
  {
    title: "Invite",
    copy: "Share the invite link so players can inspect the Side Quests, proof window, and join conditions before committing.",
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
    title: "Host a Multiplayer Side Quest",
    copy: "Pick the Side Quest stack, proof window, and invite style, then bring friends into a shared challenge.",
    action: "Create Multiplayer Side Quest",
    href: "/groupquests/create",
  },
  {
    title: "Join a public Multiplayer Side Quest",
    copy: "Browse open Multiplayer Side Quests, inspect the rule preview, and choose one that fits your next game.",
    action: "Browse Public Multiplayer Side Quests",
    href: "/groupquests/public",
  },
];

const tableGuideCards = [
  {
    title: "Community Multiplayer Side Quest",
    copy: "Open discovery, visible rules, joined/hosted filters, and a leaderboard anyone can inspect before joining.",
    action: "Browse Community Multiplayer Side Quests",
    href: "/groupquests/public",
  },
  {
    title: "Private host code",
    copy: "Use a host code when the Multiplayer Side Quest is for a known group and should stay out of public discovery.",
    action: "Enter code",
    href: "#private-invite",
  },
  {
    title: "Host your own",
    copy: "Create a launch-ready Multiplayer Side Quest with official or Custom Solo Side Quest rules and proof settings.",
    action: "Build a Multiplayer Side Quest",
    href: "/groupquests/create",
  },
  {
    title: "Proof states",
    copy: "Return to active or closed Multiplayer Side Quests to inspect proof, tables, results, and podium state.",
    action: "Open my Multiplayer Side Quests",
    href: "/multiplayer#my-multiplayer-side-quests",
  },
];

export const metadata = {
  title: "Multiplayer Side Quests · Side Quest Chess",
  description: "Side Quest Chess Multiplayer Side Quests for shared Side Quests, fresh proof, and multiplayer leaderboards.",
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

function MultiplayerLearnPanel() {
  return (
    <details className="groupquests-learn-panel">
      <summary>
        <span className="eyebrow">Learn</span>
        <strong>What Multiplayer Side Quests are</strong>
        <small>Open the educational overview.</small>
      </summary>
      <div className="groupquests-learn-content">
        <section className="groupquests-story-card" aria-label="What Multiplayer Side Quests are">
          <div>
            <h2>A tiny chess tournament for bad ideas.</h2>
            <p>
              One player creates the Multiplayer Side Quest, everyone agrees on rules, then SQC checks fresh public games for each player.
            </p>
          </div>
          <div className="groupquests-process-graphic" aria-label="Multiplayer Side Quest process graphic">
            <Image alt="Noble players during a Multiplayer Side Quest" className="groupquests-knight-competition-art" height={1024} priority={false} src="/illustrations/multiplayer-side-quests-noble-chaos-coat-style.png" width={1024} />
          </div>
        </section>

        <section className="groupquests-how-card" id="group-side-quest-flow" aria-label="How Multiplayer Side Quests work">
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

        <section className="groupquests-rules-card" id="group-side-quest-proof-rule" aria-label="Multiplayer Side Quest completion rules">
          <span className="eyebrow">Proof rule</span>
          <h2>Personal proof and multiplayer proof are different ledgers.</h2>
          <p>
            Finishing a Side Quest alone still counts for your account. Finishing it inside a Multiplayer Side Quest requires fresh Multiplayer Side Quest-valid proof: joined participant, eligible window, matching game rules, verified table progress, and multiplayer celebration.
          </p>
        </section>
      </div>
    </details>
  );
}

export default async function GroupQuestsPage({ searchParams }: { searchParams?: Promise<{ inviteKey?: string }> }) {
  const { userId } = await auth();
  const resolvedSearchParams = await searchParams;
  const inviteKey = typeof resolvedSearchParams?.inviteKey === "string" ? resolvedSearchParams.inviteKey : "";
  const client = await clerkClient();
  const publicQuests = await listPublicGroupQuests(client);
  let activeRooms: Array<{ title: string; status: string; meta: string; next: string; href: string; action: string; tone: string }> = [];
  let officialRooms: typeof activeRooms = [];
  let publicRooms: typeof activeRooms = [];
  let finishedRooms: Array<{ title: string; meta: string; href: string; action: string }> = [];
  let previousOfficialRooms: Array<{ title: string; meta: string; href: string; action: string }> = [];
  let officialWeeks: Array<{ id: string; label: string; rangeLabel: string; rooms: Array<{ title: string; meta: string; href: string; action: string }> }> = [];

  if (userId) {
    const ownQuests = await listUserRelatedGroupQuests(client, userId);

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
  }

  const openPublicQuests = publicQuests
    .filter((quest) => deriveQuestState(quest.startAt, quest.endAt).status !== "Finished")
    .sort((a, b) => Number(Boolean(b.official)) - Number(Boolean(a.official)) || toTimestamp(b.createdAt) - toTimestamp(a.createdAt))
    .slice(0, 12);

  officialRooms = openPublicQuests.filter((quest) => quest.official).map((quest) => {
        const isHost = quest.hostUserId === userId;
        const isParticipant = Boolean(userId && quest.participants.some((participant) => participant.userId === userId));
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
        const isParticipant = Boolean(userId && quest.participants.some((participant) => participant.userId === userId));
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
  const multiplayerParityStates = [
    {
      label: "Official",
      value: `${officialRooms.length}`,
      copy: "Default catalog tab",
      href: "/multiplayer",
    },
    {
      label: "Community",
      value: `${publicRooms.length}`,
      copy: "Public discovery",
      href: "/groupquests/public",
    },
    {
      label: "My active",
      value: userId ? `${activeRooms.length}` : "Sign in",
      copy: "Joined or hosted",
      href: userId ? "#my-multiplayer-side-quests" : "/sign-in",
    },
    {
      label: "Proof states",
      value: userId ? `${finishedRooms.length}` : "Saved",
      copy: "Closed results",
      href: userId ? "#my-multiplayer-side-quests" : "/sign-in",
    },
    {
      label: "Create",
      value: "Host",
      copy: "Build a quest",
      href: "/groupquests/create",
    },
    {
      label: "Join",
      value: "Code",
      copy: "Private invite",
      href: "#private-invite",
    },
  ];

  return (
    <main className="site-shell groupquests-page">
      <SiteNav isSignedIn={Boolean(userId)} active="multiplayer" />

      <div className="content-wrap">
        {!userId ? (
          <section className="hero-card groupquests-hero">
            <span className="eyebrow">Multiplayer Side Quests</span>
            <h1>Shared chess challenges with proof.</h1>
            <p className="hero-copy">
              Sign in to host or join a Multiplayer Side Quest. Pick the challenge, agree on the proof rules, then let SQC keep the leaderboard honest.
            </p>
          </section>
        ) : null}

        <MultiplayerModeSwitcher active="official" />

        <section className="mission-card multiplayer-app-state-strip" aria-label="Mobile Multiplayer Side Quest state summary">
          <div>
            <span className="eyebrow">Mobile parity</span>
            <h2>Official, Community, create, join, and proof states stay on this screen.</h2>
            <p>
              The mobile app opens Multiplayer on Official first, lets players switch to Community, then keeps active, finished, create, and invite-code actions in the same destination.
            </p>
          </div>
          <div className="multiplayer-app-state-grid">
            {multiplayerParityStates.map((state) => (
              <Link className="multiplayer-app-state-item" href={state.href} key={state.label}>
                <span>{state.label}</span>
                <strong>{state.value}</strong>
                <small>{state.copy}</small>
              </Link>
            ))}
          </div>
        </section>

        {userId ? (
          <>
            <section className="mission-card groupquests-table-guide-card" aria-label="Choose a Multiplayer Side Quest">
              <div className="section-head compact">
                <div>
                  <span className="eyebrow">Community · create · join · proof</span>
                  <h2>Switch modes like the mobile Multiplayer screen.</h2>
                  <p>Official Multiplayer Side Quests stay first. Community discovery, host creation, private-code joining, and proof results remain one tap away.</p>
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
                  <p>Paste a private Multiplayer Side Quest code here. Private Multiplayer Side Quests stay hidden from public discovery.</p>
                </div>
              </div>
              <GroupQuestInviteKeyJoin initialInviteKey={inviteKey} isSignedIn={Boolean(userId)} />
            </section>

            <section className="mission-card groupquests-user-overview" id="my-multiplayer-side-quests" aria-label="Your Multiplayer Side Quests overview">
              <div className="section-head groupquests-command-head">
                <div>
                  <span className="eyebrow">My Multiplayer Side Quests</span>
                  <h2>Your Multiplayer Side Quest hub.</h2>
                  <p>Active Multiplayer Side Quests, open public runs, and finished proof receipts are grouped so the next action is clear.</p>
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
                  ) : <p>No active Multiplayer Side Quests yet. Create or join a Multiplayer Side Quest to start your first shared challenge.</p>}
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

            <MultiplayerLearnPanel />
          </>
        ) : (
          <>
            <section className="mission-card groupquests-table-guide-card" aria-label="Choose a Multiplayer Side Quest">
              <div className="section-head compact">
                <div>
                  <span className="eyebrow">Community · create · join · proof</span>
                  <h2>Switch modes like the mobile Multiplayer screen.</h2>
                  <p>Official Multiplayer Side Quests stay first. Community discovery, host creation, private-code joining, and proof results remain one tap away.</p>
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

            <section className="mission-card groupquests-user-overview signed-out-multiplayer-browse" aria-label="Browse Multiplayer Side Quests">
              <div className="section-head groupquests-command-head">
                <div>
                  <span className="eyebrow">Browse before sign-in</span>
                  <h2>Official and Community Multiplayer Side Quests.</h2>
                  <p>The mobile app opens Multiplayer on Official first, with Community one switch away. Web visitors can inspect those same public entry points before signing in to join.</p>
                </div>
                <Image alt="" className="groupquests-command-seal" height={112} src="/stamps/sqc-multiplayer-seal.png" width={112} />
              </div>

              <div className="groupquests-timeline-list" aria-label="Public Multiplayer Side Quest browse lanes">
                <section className="groupquests-list-section official" aria-label="Official SQC Multiplayer Side Quests">
                  <div className="groupquests-list-heading">
                    <div>
                      <h3>Official SQC Multiplayer Side Quests</h3>
                      <p>Curated SQC public events, shown first like the mobile Multiplayer tab.</p>
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

                <section className="groupquests-list-section" aria-label="Community Multiplayer Side Quests">
                  <div className="groupquests-list-heading">
                    <div>
                      <h3>Community Multiplayer Side Quests</h3>
                      <p>Public player-hosted Multiplayer Side Quests anyone can inspect before joining.</p>
                    </div>
                    <span className="badge gold">{publicRooms.length}</span>
                  </div>
                  <div className="button-row">
                    <Link className="button secondary" href="/groupquests/public">Open discovery filters</Link>
                    <Link className="button ghost" href="/sign-in">Sign in to join</Link>
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
                  ) : <p>No public Community Multiplayer Side Quests available right now.</p>}
                </section>
              </div>
            </section>

            <section className="mission-card groupquests-private-invite-card" id="private-invite" aria-label="Join private Multiplayer Side Quest by invite code">
              <div className="section-head compact">
                <div>
                  <span className="eyebrow">Private invite</span>
                  <h2>Have a host code?</h2>
                  <p>Paste a private Multiplayer Side Quest code after signing in. Public Multiplayer Side Quests stay open to browse.</p>
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

        {!userId ? <MultiplayerLearnPanel /> : null}
      </div>
    </main>
  );
}
