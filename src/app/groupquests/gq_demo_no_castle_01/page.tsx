import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import SiteNav from "@/components/site-nav";
import { CHALLENGES } from "@/lib/challenges";

const featuredQuestIds = ["no-castle-club", "knights-before-coffee", "rookless-rampage"];

const participants = [
  { name: "Andreas", handle: "and72nor", status: "Quest 1 complete", score: 120, proof: "Verified", tone: "green" },
  { name: "QueenlessHero", handle: "lichess: queenlesshero", status: "Attempting quest 1", score: 0, proof: "Needs proof", tone: "gold" },
  { name: "CoffeeKnight", handle: "chess.com: coffeeknight", status: "Joined", score: 0, proof: "Not started", tone: "blue" },
];

const eventFeed = [
  { label: "Proof accepted", copy: "Andreas completed No Castle Club with a Multiplayer Side Quest-valid game." },
  { label: "Player joined", copy: "QueenlessHero joined after reviewing the locked rules." },
  { label: "Window opened", copy: "Solo completions before this start time do not count here." },
];

const settingCards = [
  { title: "Access", value: "Unlisted invite link", copy: "Players can join from the link while the host keeps approvals visible." },
  { title: "Proof window", value: "Fresh games only", copy: "A side quest already completed personally starts incomplete inside this Multiplayer Side Quest until new eligible proof lands." },
  { title: "Mandatory time", value: "Blitz 5+3", copy: "The Multiplayer Side Quest requires a specific Lichess-style time control for valid proof." },
  { title: "Messages", value: "System feed first", copy: "Activity events explain joins, proofs, approvals, and leaderboard changes before free-form chat ships." },
];

const proofChecklist = [
  { label: "Joined participant", state: "Done", tone: "green" },
  { label: "After start time", state: "Done", tone: "green" },
  { label: "Blitz 5+3", state: "Required", tone: "gold" },
  { label: "No castling", state: "Required", tone: "gold" },
];

const hostControls = [
  { title: "Invite management", copy: "Copy invite, pause joining, or switch future joins to approval-required." },
  { title: "Proof review", copy: "See which submissions passed the Multiplayer Side Quest rules and which need correction." },
  { title: "Window control", copy: "Extend, close, or finish the Multiplayer Side Quest while keeping the leaderboard explainable." },
];

export const metadata = {
  title: "No Castle Night · Multiplayer Side Quests · Side Quest Chess",
  description: "Side Quest Chess Multiplayer Side Quest detail page with participant proof status and host maintenance controls.",
};

export default async function GroupQuestRoomPage() {
  const { userId } = await auth();
  const featuredQuests = featuredQuestIds
    .map((id) => CHALLENGES.find((challenge) => challenge.id === id))
    .filter((challenge): challenge is (typeof CHALLENGES)[number] => Boolean(challenge));

  return (
    <main className="site-shell groupquests-page">
      <SiteNav isSignedIn={Boolean(userId)} active="groupquests" />

      <div className="content-wrap">
        <section className="hero-card groupquests-hero groupquests-detail-hero">
          <span className="eyebrow">Multiplayer Side Quest detail</span>
          <h1>No Castle Night</h1>
          <p className="hero-copy">
            Your shared dare, current proof status, leaderboard, and host controls in one place. Personal side quest completions stay separate from this Multiplayer Side Quest ledger.
          </p>
          <div className="hero-actions button-row">
            <Link className="button secondary" href="/groupquests">Back to overview</Link>
            <Link className="button primary" href="#submit-proof">Submit proof</Link>
          </div>
        </section>

        <section className="mission-card groupquests-live-card" aria-label="Multiplayer Side Quest status">
          <div className="section-head">
            <div>
              <span className="eyebrow">Live status</span>
              <h2>Single Quest Race · proof window open.</h2>
            </div>
            <span className="badge green">Live</span>
          </div>
          <p>
            Everyone tries the same side quest inside the same time window. Previous personal clears do not auto-complete this Multiplayer Side Quest.
          </p>

          <div className="groupquests-status-strip" aria-label="Competition status">
            <div><strong>Mode</strong><span>Single Quest Race</span></div>
            <div><strong>Window</strong><span>Open · 38h left</span></div>
            <div><strong>Join</strong><span>Unlisted invite</span></div>
            <div><strong>Proof</strong><span>After join + after start</span></div>
          </div>
        </section>

        <section className="grid groupquests-detail-grid" aria-label="Participant and host views">
          <article className="mission-card groupquests-participant-panel" id="submit-proof">
            <span className="eyebrow">Participant view</span>
            <h2>Your proof status.</h2>
            <p>
              You are joined. Submit a fresh game that satisfies every locked rule below; solo My Side Quests progress is not imported into this leaderboard.
            </p>
            <div className="groupquests-proof-checklist">
              {proofChecklist.map((item) => (
                <div className={item.tone} key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.state}</strong>
                </div>
              ))}
            </div>
            <div className="button-row">
              <button className="button primary" type="button">Submit game link</button>
              <button className="button secondary" type="button">Explain rejected proof</button>
            </div>
          </article>

          <article className="mission-card groupquests-host-panel">
            <span className="eyebrow">Host maintenance</span>
            {userId ? (
              <>
                <h2>Keep the Multiplayer Side Quest fair.</h2>
                <div className="groupquests-host-control-list">
                  {hostControls.map((control) => (
                    <div key={control.title}>
                      <strong>{control.title}</strong>
                      <p>{control.copy}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <h2>Sign in to manage this Multiplayer Quest.</h2>
                <p>
                  Anyone can open an invite link and review the rules. Creating and managing Multiplayer Quests requires an SQC account.
                </p>
                <Link className="button primary" href="/sign-in">Sign in to manage</Link>
              </>
            )}
          </article>
        </section>

        <section className="grid" aria-label="Multiplayer Side Quest settings">
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
              <span className="eyebrow">Side quest set</span>
              <h2>Start with one side quest. Design for many.</h2>
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
                <p className="proof-line">{index === 0 ? "Active now · submit fresh proof" : "Queued for multi-step Multiplayer Side Quests"}</p>
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
                  <div><em>{participant.score} pts</em><small>{participant.status} · {participant.proof}</small></div>
                </div>
              ))}
            </div>
          </article>

          <article className="mission-card">
            <div className="section-head">
              <div>
                <span className="eyebrow">Activity feed</span>
                <h2>Every state change explained.</h2>
              </div>
            </div>
            <div className="groupquests-feed-list">
              {eventFeed.map((event) => (
                <p key={event.copy}><strong>{event.label}</strong>{event.copy}</p>
              ))}
            </div>
          </article>
        </section>

        <section className="mission-card groupquests-rules-card" aria-label="Competition completion rules">
          <span className="eyebrow">Completion state rule</span>
          <h2>Personal proof and multiplayer proof are different ledgers.</h2>
          <p>
            If you already earned a Coat of Arms for a side quest, that stays yours. But this Multiplayer Side Quest has its own completion state: joined participant, eligible window, Multiplayer Side Quest proof, Multiplayer Side Quest score, and multiplayer celebration.
          </p>
        </section>
      </div>
    </main>
  );
}
