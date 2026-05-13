import Link from "next/link";
import { auth, clerkClient } from "@clerk/nextjs/server";
import SiteNav from "@/components/site-nav";
import { listPublicGroupQuests } from "@/lib/groupquests";

const publicQuests = [
  {
    title: "No Castle Night",
    status: "Open now",
    players: "4 players joined",
    window: "7 days · fresh games only",
    rules: "Any time control · any rated state · any color",
    copy: "Win without castling. The king stays brave, confused, and uninsured.",
    href: "/groupquests/gq_demo_no_castle_01",
  },
  {
    title: "Knights Before Coffee Ladder",
    status: "Starting soon",
    players: "2 players waiting",
    window: "48 hours · starts tonight",
    rules: "Standard games · any time control",
    copy: "Move horses first, ask strategic questions later. Beginner-friendly public chaos.",
    href: "/groupquests/gq_demo_no_castle_01",
  },
  {
    title: "Queen? Never Heard of Her Club",
    status: "Open soon",
    players: "Public listing",
    window: "Manual start · host approval later",
    rules: "Standard games · any color",
    copy: "A public table for players who think material advantage is a personality flaw.",
    href: "/groupquests/gq_demo_no_castle_01",
  },
];

export const metadata = {
  title: "Public Multiplayer Side Quests · Side Quest Chess",
  description: "Public Side Quest Chess Multiplayer Side Quests open for players to inspect and join.",
};

export default async function PublicGroupQuestsPage() {
  const { userId } = await auth();
  const client = await clerkClient();
  const savedPublicQuests = await listPublicGroupQuests(client);
  const quests = savedPublicQuests.length
    ? savedPublicQuests.map((quest) => ({
        title: quest.name,
        status: "Open now",
        players: `${quest.participants.length} player${quest.participants.length === 1 ? "" : "s"} joined`,
        window: `${quest.startAt} → ${quest.endAt}`,
        rules: `${quest.providerLabel} · ${quest.rules.timeControl}`,
        copy: quest.inviteCopy,
        href: `/groupquests/${quest.id}`,
      }))
    : publicQuests;

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
        </section>
      </div>
    </main>
  );
}
