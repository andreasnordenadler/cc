import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import SiteNav from "@/components/site-nav";
import { CHALLENGES } from "@/lib/challenges";

const questIds = ["knights-before-coffee", "no-castle-club", "rookless-rampage"];

const participants = [
  { name: "You", handle: "creator", status: "Host · ready to invite", score: 0, proof: "Waiting", tone: "green" },
  { name: "First challenger", handle: "public slot", status: "Not joined yet", score: 0, proof: "Open", tone: "gold" },
  { name: "Second challenger", handle: "public slot", status: "Not joined yet", score: 0, proof: "Open", tone: "blue" },
];

const eventFeed = [
  { label: "Created", copy: "The Multiplayer Side Quest was created and is ready to share." },
  { label: "Public ID assigned", copy: "This URL stays stable even if the title changes later." },
  { label: "Proof window pending", copy: "Games count only inside the configured open/close window." },
];

const hostControls = [
  { title: "Invite controls", copy: "Copy the public URL, pause new joins, or change future access rules." },
  { title: "Proof review", copy: "Review each selected Side Quest proof and explain rejected submissions clearly." },
  { title: "Quest state", copy: "Extend, close, or publish final standings when the window ends." },
];

export const metadata = {
  title: "Multiplayer Side Quest · Side Quest Chess",
  description: "A shareable Side Quest Chess Multiplayer Side Quest page with participant view and host controls.",
};

export default async function GroupQuestByIdPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  const { id } = await params;
  const quests = questIds
    .map((questId) => CHALLENGES.find((challenge) => challenge.id === questId))
    .filter((challenge): challenge is (typeof CHALLENGES)[number] => Boolean(challenge));
  const shareUrl = `https://sidequestchess.com/groupquests/${id}`;

  return (
    <main className="site-shell groupquests-page">
      <SiteNav isSignedIn={Boolean(userId)} active="groupquests" />

      <div className="content-wrap">
        <section className="hero-card groupquests-hero groupquests-detail-hero">
          <span className="eyebrow">Multiplayer Side Quest #{id}</span>
          <h1>No Castle Night</h1>
          <p className="hero-copy">
            A shareable Multiplayer Side Quest page. Participants see the quest stack, rules, schedule, and proof status. The creator gets extra host controls.
          </p>
          <div className="hero-actions button-row">
            <Link className="button secondary" href="/groupquests/create">Edit draft settings</Link>
            <Link className="button primary" href="#submit-proof">Submit proof</Link>
          </div>
        </section>

        <section className="mission-card groupquests-live-card" aria-label="Multiplayer Side Quest status">
          <div className="section-head">
            <div>
              <span className="eyebrow">Shareable URL</span>
              <h2>{shareUrl}</h2>
            </div>
            <span className="badge green">Draft saved</span>
          </div>
          <p>
            This mock page demonstrates the post-save destination. In the real version, the numeric ID is generated server-side and stays stable forever.
          </p>
          <div className="groupquests-status-strip" aria-label="Multiplayer Side Quest settings">
            <div><strong>Visibility</strong><span>Public listing</span></div>
            <div><strong>Variant</strong><span>Standard chess only</span></div>
            <div><strong>Window</strong><span>Configured on create</span></div>
            <div><strong>Proof</strong><span>Inside window</span></div>
          </div>
        </section>

        <section className="grid groupquests-detail-grid" aria-label="Participant and host views">
          <article className="mission-card groupquests-participant-panel" id="submit-proof">
            <span className="eyebrow">Participant view</span>
            <h2>Your proof status.</h2>
            <p>
              Complete the selected Side Quests inside this Multiplayer Side Quest window. Personal solo progress is separate from this shared leaderboard.
            </p>
            <div className="groupquests-proof-checklist">
              <div className="green"><span>Joined participant</span><strong>Ready</strong></div>
              <div className="gold"><span>Inside schedule</span><strong>Required</strong></div>
              <div className="gold"><span>Standard chess</span><strong>Required</strong></div>
              <div className="gold"><span>Selected quest proof</span><strong>Required</strong></div>
            </div>
            <div className="button-row">
              <button className="button primary" type="button">Submit game link</button>
              <button className="button secondary" type="button">Copy share URL</button>
            </div>
          </article>

          <article className="mission-card groupquests-host-panel">
            <span className="eyebrow">Creator controls</span>
            {userId ? (
              <>
                <h2>You are signed in, so host controls appear here.</h2>
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
                <h2>Public participant view.</h2>
                <p>
                  Anyone can open the URL and inspect the rules. The creator signs in to manage joins, proof, and final standings.
                </p>
                <Link className="button primary" href={`/sign-in?redirect_url=${encodeURIComponent(`/groupquests/${id}`)}`}>Sign in to manage</Link>
              </>
            )}
          </article>
        </section>

        <section className="mission-card" aria-label="Selected Side Quest stack">
          <div className="section-head">
            <div>
              <span className="eyebrow">Quest stack</span>
              <h2>Selected Side Quests.</h2>
            </div>
            <span className="badge gold">{quests.length} quests</span>
          </div>
          <div className="big-grid groupquests-quest-grid">
            {quests.map((challenge, index) => (
              <article className="challenge-card" key={challenge.id}>
                <div className="card-meta quest-card-meta">
                  <span className="badge gold">Step {index + 1}</span>
                  <strong className="quest-points">{challenge.reward} pts</strong>
                </div>
                <div>
                  <h3>{challenge.title}</h3>
                  <p>{challenge.objective}</p>
                </div>
                <p className="proof-line">Proof must be from this Multiplayer Side Quest window.</p>
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
      </div>
    </main>
  );
}
