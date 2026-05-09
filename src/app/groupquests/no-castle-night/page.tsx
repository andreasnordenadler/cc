import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import SiteNav from "@/components/site-nav";
import { CHALLENGES } from "@/lib/challenges";

const featuredQuestIds = ["no-castle-club", "knights-before-coffee", "rookless-rampage"];

const participants = [
  { name: "Andreas", handle: "and72nor", status: "Completed quest 1", score: 120, tone: "green" },
  { name: "QueenlessHero", handle: "lichess: queenlesshero", status: "Attempting quest 1", score: 0, tone: "gold" },
  { name: "CoffeeKnight", handle: "chess.com: coffeeknight", status: "Joined", score: 0, tone: "blue" },
];

const eventFeed = [
  "Andreas completed No Castle Club with a competition-valid game.",
  "QueenlessHero joined the group quest room.",
  "The No Castle Night window opened. Solo completions before this window do not count here.",
];

const settingCards = [
  { title: "Access", value: "Unlisted invite link", copy: "No public navigation yet. Players enter only if someone has the hidden URL or later invite link." },
  { title: "Proof window", value: "Fresh games only", copy: "A quest already completed personally starts incomplete inside this group until new eligible proof lands." },
  { title: "Mandatory time", value: "Blitz 5+3", copy: "The room can require a specific Lichess-style time control for valid proof." },
  { title: "Messaging", value: "System feed first", copy: "Live activity events ship before free-form group chat, keeping moderation risk low while we shape the loop." },
];

export const metadata = {
  title: "No Castle Night · Group Quests · Side Quest Chess",
  description: "Hidden Side Quest Chess group quest room prototype.",
};

export default async function GroupQuestRoomPage() {
  const { userId } = await auth();
  const featuredQuests = featuredQuestIds
    .map((id) => CHALLENGES.find((challenge) => challenge.id === id))
    .filter((challenge): challenge is (typeof CHALLENGES)[number] => Boolean(challenge));

  return (
    <main className="site-shell groupquests-page">
      <SiteNav isSignedIn={Boolean(userId)} active="challenges" />

      <div className="content-wrap">
        <section className="hero-card groupquests-hero">
          <span className="eyebrow">Group room prototype</span>
          <h1>No Castle Night</h1>
          <p className="hero-copy">
            Focused room detail: status, settings, quest set, leaderboard, live feed, and room-specific proof rules. This is the page users should enter after choosing a group from the overview.
          </p>
          <div className="hero-actions button-row">
            <Link className="button secondary" href="/groupquests">Back to overview</Link>
            <Link className="button primary" href="/groupquests/create">Create another group</Link>
          </div>
        </section>

        <section className="mission-card groupquests-live-card" aria-label="Group quest room status">
          <div className="section-head">
            <div>
              <span className="eyebrow">Room status</span>
              <h2>Single Quest Race</h2>
            </div>
            <span className="badge green">Live draft</span>
          </div>
          <p>
            Everyone tries the same quest inside the same time window. Previous personal clears do not auto-complete this group room.
          </p>

          <div className="groupquests-status-strip" aria-label="Competition status">
            <div><strong>Mode</strong><span>Single Quest Race</span></div>
            <div><strong>Window</strong><span>Manual start · 48h</span></div>
            <div><strong>Join</strong><span>Unlisted invite</span></div>
            <div><strong>Proof</strong><span>After join + after start</span></div>
          </div>
        </section>

        <section className="grid" aria-label="Group quest settings">
          {settingCards.map((card) => (
            <article className="mission-card groupquests-setting-card" key={card.title}>
              <span className="eyebrow">{card.title}</span>
              <strong>{card.value}</strong>
              <p>{card.copy}</p>
            </article>
          ))}
        </section>

        <section className="mission-card" aria-label="Quest set preview">
          <div className="section-head">
            <div>
              <span className="eyebrow">Quest set</span>
              <h2>Start with one quest. Design for many.</h2>
            </div>
          </div>
          <div className="big-grid groupquests-quest-grid">
            {featuredQuests.map((challenge, index) => (
              <article className="challenge-card" key={challenge.id}>
                <div className="card-meta quest-card-meta">
                  <span className="badge gold">Step {index + 1}</span>
                  <strong className="quest-points">{challenge.reward} pts</strong>
                </div>
                <div>
                  <h3>{challenge.title}</h3>
                  <p>{challenge.objective}</p>
                </div>
                <p className="proof-line">{index === 0 ? "Active in MVP race" : "Designed for ladder / quest set expansion"}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid groupquests-dashboard-grid" aria-label="Leaderboard and event feed">
          <article className="mission-card">
            <div className="section-head">
              <div>
                <span className="eyebrow">Leaderboard</span>
                <h2>Proof-backed standings.</h2>
              </div>
            </div>
            <div className="groupquests-participant-list">
              {participants.map((participant, index) => (
                <div className={`groupquests-participant ${participant.tone}`} key={participant.name}>
                  <strong>#{index + 1}</strong>
                  <div><span>{participant.name}</span><small>{participant.handle}</small></div>
                  <div><em>{participant.score} pts</em><small>{participant.status}</small></div>
                </div>
              ))}
            </div>
          </article>

          <article className="mission-card">
            <div className="section-head">
              <div>
                <span className="eyebrow">Live feed</span>
                <h2>Events before chat.</h2>
              </div>
            </div>
            <div className="groupquests-feed-list">
              {eventFeed.map((event) => <p key={event}>{event}</p>)}
            </div>
          </article>
        </section>

        <section className="mission-card groupquests-rules-card" aria-label="Competition completion rules">
          <span className="eyebrow">Completion state rule</span>
          <h2>Personal proof and group proof are different ledgers.</h2>
          <p>
            If you already earned a Coat of Arms for a quest, that stays yours. But this room has its own completion state: joined participant, eligible window, room proof, room score, and group celebration.
          </p>
        </section>
      </div>
    </main>
  );
}
