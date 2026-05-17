import Link from "next/link";
import { auth, clerkClient } from "@clerk/nextjs/server";
import SiteNav from "@/components/site-nav";
import { listPublicGroupQuests } from "@/lib/groupquests";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Public Multiplayer Side Quests · Side Quest Chess",
  description: "Public Side Quest Chess Multiplayer Side Quests open for players to inspect and join.",
};

export default async function PublicGroupQuestsPage() {
  const { userId } = await auth();
  const client = await clerkClient();
  const savedPublicQuests = await listPublicGroupQuests(client);
  const displayablePublicQuests = savedPublicQuests.filter(isDisplayablePublicQuest);
  const quests = displayablePublicQuests.map((quest) => ({
    title: quest.name,
    status: getQuestStatus(quest.startAt, quest.endAt),
    players: `${quest.participants.length} player${quest.participants.length === 1 ? "" : "s"} joined`,
    window: `${formatDateTime(quest.startAt)} → ${formatDateTime(quest.endAt)}`,
    rules: `${quest.providerLabel} · ${quest.rules.timeControl}`,
    copy: quest.inviteCopy,
    href: `/groupquests/${quest.id}`,
  }));

  return (
    <main className="site-shell groupquests-page">
      <SiteNav isSignedIn={Boolean(userId)} active="groupquests" />

      <div className="content-wrap">
        <section className="hero-card groupquests-hero public-groupquests-hero">
          <span className="eyebrow">Public Multiplayer Side Quests</span>
          <h1>Join a public bad idea.</h1>
          <p className="hero-copy">
            Browse public Multiplayer Side Quest listings, inspect the rules, proof window, and join conditions before committing your next real chess game to the bit.
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
              <p>Public Multiplayer Side Quests collect open tables anyone can inspect before joining.</p>
            </div>
          </div>
          {quests.length ? (
            <div className="public-groupquests-list">
              {quests.map((quest) => (
                <Link className="public-groupquest-row" href={quest.href} key={quest.title}>
                  <div>
                    <span>{quest.status}</span>
                    <strong>{quest.title}</strong>
                    <p>{quest.copy}</p>
                  </div>
                  <div className="public-groupquest-meta">
                    <small>{quest.players}</small>
                    <small>{quest.window}</small>
                    <small>{quest.rules}</small>
                  </div>
                  <em>Inspect and join</em>
                </Link>
              ))}
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

function isDisplayablePublicQuest(quest: Awaited<ReturnType<typeof listPublicGroupQuests>>[number]) {
  const text = `${quest.name} ${quest.inviteCopy}`.toLowerCase();
  const end = Date.parse(quest.endAt);
  if (Number.isFinite(end) && end < Date.now()) return false;
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
