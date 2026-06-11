import Link from "next/link";
import { auth, clerkClient } from "@clerk/nextjs/server";
import SiteNav from "@/components/site-nav";
import { listPublicGroupQuests } from "@/lib/groupquests";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Public Multiplayer Side Quests · Side Quest Chess",
  description: "Public Side Quest Chess Multiplayer Side Quests open for players to inspect and join.",
};

type PublicGroupQuestStatusFilter = "open" | "all" | "finished" | "joined" | "hosted";
type PublicGroupQuestSort = "closing" | "newest" | "players";

export default async function PublicGroupQuestsPage({ searchParams }: { searchParams?: Promise<{ host?: string; q?: string; status?: string; sort?: string }> }) {
  const { userId } = await auth();
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const selectedHost = typeof resolvedSearchParams.host === "string" ? decodeURIComponent(resolvedSearchParams.host) : null;
  const searchQuery = typeof resolvedSearchParams.q === "string" ? resolvedSearchParams.q.trim() : "";
  const selectedStatus = getSelectedStatusFilter(resolvedSearchParams.status, Boolean(userId));
  const selectedSort = getSelectedSort(resolvedSearchParams.sort);
  const client = await clerkClient();
  const savedPublicQuests = await listPublicGroupQuests(client);
  const displayablePublicQuests = savedPublicQuests.filter((quest) => isDisplayablePublicQuest(quest, { includeFinished: selectedStatus !== "open" }));
  const filteredPublicQuests = displayablePublicQuests.filter((quest) => {
    const status = getQuestStatus(quest.startAt, quest.endAt);
    const text = `${quest.name} ${quest.inviteCopy} ${quest.hostName} ${quest.providerLabel}`.toLowerCase();
    if (selectedHost && getHostKey(quest.hostName) !== selectedHost) return false;
    if (searchQuery && !text.includes(searchQuery.toLowerCase())) return false;
    if (selectedStatus === "open" && status === "Finished") return false;
    if (selectedStatus === "finished" && status !== "Finished") return false;
    if (selectedStatus === "joined" && (!userId || quest.hostUserId === userId || !quest.participants.some((participant) => participant.userId === userId))) return false;
    if (selectedStatus === "hosted" && (!userId || quest.hostUserId !== userId)) return false;
    return true;
  }).sort((a, b) => sortPublicGroupQuests(a, b, selectedSort));
  const selectedHostQuest = selectedHost ? displayablePublicQuests.find((quest) => getHostKey(quest.hostName) === selectedHost) : null;
  const showOfficialLane = !selectedHost && !searchQuery;
  const officialQuests = showOfficialLane ? filteredPublicQuests.filter((quest) => quest.official).map((quest) => toPublicQuestCard(quest, userId)) : [];
  const communityQuests = filteredPublicQuests.filter((quest) => !quest.official).map((quest) => toPublicQuestCard(quest, userId));
  const totalQuests = officialQuests.length + communityQuests.length;

  return (
    <main className="site-shell groupquests-page">
      <SiteNav isSignedIn={Boolean(userId)} active="groupquests" />

      <div className="content-wrap">
        <section className="hero-card groupquests-hero public-groupquests-hero">
          <span className="eyebrow">Public Multiplayer Side Quests</span>
          <h1>Join a public bad idea.</h1>
          <p className="hero-copy">
            Browse public Multiplayer Side Quest listings, filter by host or status, inspect the rules, proof window, and join conditions before committing your next real chess game to the bit.
          </p>
          <div className="hero-actions button-row">
            <Link className="button secondary" href="/groupquests">Back to Multiplayer Side Quests</Link>
            <Link className="button primary" href="/groupquests/create">Create Multiplayer Side Quest</Link>
          </div>
        </section>

        <section className="mission-card public-groupquests-list-card" aria-label="Public Multiplayer Side Quest listings">
          <div className="section-head">
            <div>
              <span className="eyebrow">Open listings</span>
              <h2>Pick a table before the nonsense starts.</h2>
              <p>{selectedHostQuest ? `Showing public Community Multiplayer tables hosted by ${selectedHostQuest.hostName}. Private invite-only tables and account details stay hidden.` : "Public Multiplayer Side Quests collect open tables anyone can inspect before joining."}</p>
            </div>
            <span className="badge gold">{totalQuests}</span>
          </div>
          <form className="groupquest-empty-state" action="/groupquests/public" aria-label="Filter public Multiplayer Side Quests">
            <p><strong>Discovery filters.</strong> Search public tables, view more from a host, or include finished events without exposing private invites.</p>
            <div className="button-row">
              <input className="text-input" type="search" name="q" defaultValue={searchQuery} placeholder="Search title, host, provider" aria-label="Search public Multiplayer Side Quests" />
              {selectedHost ? <input type="hidden" name="host" value={selectedHost} /> : null}
              <select className="text-input" name="status" defaultValue={selectedStatus} aria-label="Filter by Multiplayer status">
                <option value="open">Open / starting</option>
                <option value="all">All public</option>
                {userId ? <option value="joined">Joined by me</option> : null}
                {userId ? <option value="hosted">Hosted by me</option> : null}
                <option value="finished">Finished</option>
              </select>
              <select className="text-input" name="sort" defaultValue={selectedSort} aria-label="Sort public Multiplayer Side Quests">
                <option value="closing">Sort: closing soon</option>
                <option value="newest">Sort: newest</option>
                <option value="players">Sort: most players</option>
              </select>
              <button className="button primary" type="submit">Apply filters</button>
              {(selectedHost || searchQuery || selectedStatus !== "open" || selectedSort !== "closing") ? <Link className="button secondary" href="/groupquests/public">Show all public</Link> : null}
            </div>
          </form>
          {totalQuests ? (
            <div className="public-groupquests-list-stack">
              {officialQuests.length ? (
                <PublicQuestSection
                  title={selectedStatus === "finished" ? "Official SQC Multiplayer archive" : "Official SQC Multiplayer Side Quests"}
                  copy={selectedStatus === "finished" ? "Final official SQC leaderboards and podium receipts stay inspectable after the event window closes." : "Curated SQC events, highlighted first for players who want the cleanest public table to join."}
                  quests={officialQuests}
                />
              ) : null}
              {communityQuests.length ? (
                <PublicQuestSection
                  title="Public Multiplayer Side Quests"
                  copy="Community-created public tables anyone can inspect and join."
                  quests={communityQuests}
                />
              ) : null}
            </div>
          ) : (
            <div className="groupquest-empty-state" role="status">
              <p>No public Multiplayer Side Quests are available right now.</p>
              <Link className="button primary" href="/groupquests/create">Create the first one</Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function toPublicQuestCard(quest: Awaited<ReturnType<typeof listPublicGroupQuests>>[number], userId: string | null) {
  const isHost = Boolean(userId && quest.hostUserId === userId);
  const isJoined = Boolean(userId && quest.participants.some((participant) => participant.userId === userId));
  return {
    title: quest.name,
    status: getQuestStatus(quest.startAt, quest.endAt),
    players: `${quest.participants.length} player${quest.participants.length === 1 ? "" : "s"} joined`,
    window: `${formatDateTime(quest.startAt)} → ${formatDateTime(quest.endAt)}`,
    rules: `${quest.providerLabel} · ${quest.rules.timeControl}`,
    copy: quest.inviteCopy,
    href: `/groupquests/${quest.id}`,
    hostName: quest.hostName,
    isHost,
    isJoined,
    official: Boolean(quest.official),
    officialLabel: quest.officialLabel ?? "Official SQC Multiplayer Side Quest",
  };
}

function PublicQuestSection({ copy, quests, title }: { copy: string; quests: ReturnType<typeof toPublicQuestCard>[]; title: string }) {
  return (
    <section className={quests.some((quest) => quest.official) ? "public-groupquests-section official" : "public-groupquests-section"}>
      <div className="groupquests-list-heading">
        <div>
          <h3>{title}</h3>
          <p>{copy}</p>
        </div>
        <span className="badge gold">{quests.length}</span>
      </div>
      <div className="public-groupquests-list">
        {quests.map((quest) => (
          <article className={quest.official ? "public-groupquest-row official" : "public-groupquest-row"} key={quest.title}>
            <div>
              <span>{quest.status}</span>
              {quest.official ? <small className="official-sqc-badge">{quest.officialLabel}</small> : null}
              {quest.isHost ? <small className="official-sqc-badge">Hosted by you</small> : quest.isJoined ? <small className="official-sqc-badge">Joined by you</small> : null}
              <strong><Link href={quest.href}>{quest.title}</Link></strong>
              <p>{quest.copy}</p>
            </div>
            <div className="public-groupquest-meta">
              <small>{quest.players}</small>
              <small>{quest.window}</small>
              <small>{quest.rules}</small>
              {!quest.official ? <small>Hosted by {quest.hostName}</small> : null}
            </div>
            <div className="button-row">
              <Link className="button secondary" href={quest.href}>Inspect and join</Link>
              {!quest.official ? <Link className="button ghost" href={`/groupquests/public?host=${encodeURIComponent(getHostKey(quest.hostName))}`}>More by host</Link> : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function getHostKey(hostName: string) {
  return hostName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "sqc-host";
}

function getSelectedStatusFilter(value: string | undefined, signedIn: boolean): PublicGroupQuestStatusFilter {
  if (value === "finished") return "finished";
  if (value === "all") return "all";
  if (signedIn && value === "joined") return "joined";
  if (signedIn && value === "hosted") return "hosted";
  return "open";
}

function getSelectedSort(value: string | undefined): PublicGroupQuestSort {
  if (value === "newest") return "newest";
  if (value === "players") return "players";
  return "closing";
}

function sortPublicGroupQuests(
  a: Awaited<ReturnType<typeof listPublicGroupQuests>>[number],
  b: Awaited<ReturnType<typeof listPublicGroupQuests>>[number],
  sort: PublicGroupQuestSort,
) {
  if (sort === "players") return b.participants.length - a.participants.length || newestFirst(a, b);
  if (sort === "newest") return newestFirst(a, b);

  const aEnd = safeTimestamp(a.endAt);
  const bEnd = safeTimestamp(b.endAt);
  const now = Date.now();
  const aIsFinished = aEnd < now;
  const bIsFinished = bEnd < now;
  if (aIsFinished !== bIsFinished) return aIsFinished ? 1 : -1;
  return aIsFinished ? bEnd - aEnd : aEnd - bEnd;
}

function newestFirst(a: { createdAt?: string; startAt: string }, b: { createdAt?: string; startAt: string }) {
  return safeTimestamp(b.createdAt ?? b.startAt) - safeTimestamp(a.createdAt ?? a.startAt);
}

function safeTimestamp(value: string) {
  const ts = Date.parse(value);
  return Number.isFinite(ts) ? ts : 0;
}

function isDisplayablePublicQuest(quest: Awaited<ReturnType<typeof listPublicGroupQuests>>[number], { includeFinished = false }: { includeFinished?: boolean } = {}) {
  const text = `${quest.name} ${quest.inviteCopy}`.toLowerCase();
  const end = Date.parse(quest.endAt);
  if (!includeFinished && Number.isFinite(end) && end < Date.now()) return false;
  if (/(cokok|asdf|test test|lorem|dummy|prototype)/i.test(text)) return false;
  if (quest.name.trim().length < 4 || quest.inviteCopy.trim().length < 24) return false;
  return true;
}

function getQuestStatus(startAt: string, endAt: string) {
  const now = Date.now();
  const start = Date.parse(startAt);
  const end = Date.parse(endAt);
  if (Number.isFinite(end) && now > end) return "Finished";
  if (Number.isFinite(start) && now < start) return "Starting soon";
  return "Open now";
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || "Not set";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Stockholm",
    timeZoneName: "short",
  }).format(date);
}
