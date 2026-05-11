import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import GroupQuestShareButton from "@/components/group-quest-share-button";
import SiteNav from "@/components/site-nav";
import { CHALLENGES } from "@/lib/challenges";

const questIds = ["knights-before-coffee", "no-castle-club", "rookless-rampage"];

const leaderboard = [
  { rank: 1, name: "CoffeeKnight", handle: "lichess: coffeeknight", score: 1590, completed: 3, proof: "3/3 verified", last: "Rookless Rampage accepted 12m ago", tone: "gold" },
  { rank: 2, name: "QueenlessHero", handle: "chess.com: queenlesshero", score: 340, completed: 2, proof: "2/3 verified", last: "No Castle Club accepted", tone: "blue" },
  { rank: 3, name: "You", handle: "participant", score: 40, completed: 1, proof: "1/3 verified", last: "Knights Before Coffee accepted", tone: "green" },
  { rank: 4, name: "BlunderBaron", handle: "lichess: blunderbaron", score: 0, completed: 0, proof: "checking latest games", last: "Joined · no valid proof yet", tone: "muted" },
];

const proofChecks = [
  { label: "Provider game found", state: "Ready", tone: "green", copy: "Paste a Lichess or Chess.com public game URL." },
  { label: "Inside quest window", state: "Automatic", tone: "green", copy: "Only games after open and before close can count." },
  { label: "Standard chess", state: "Automatic", tone: "green", copy: "Variants are rejected for this Multiplayer Side Quest." },
  { label: "Quest-specific rules", state: "Per quest", tone: "gold", copy: "Each selected Side Quest runs its own verifier." },
];

const eventFeed = [
  { label: "Proof accepted", copy: "CoffeeKnight completed Rookless Rampage and jumped to first." },
  { label: "Automatic check", copy: "QueenlessHero's latest game passed No Castle Club rules." },
  { label: "Your proof", copy: "Knights Before Coffee is verified. Two quests remain." },
];

export const metadata = {
  title: "Multiplayer Side Quest · Side Quest Chess",
  description: "A participant-focused Side Quest Chess Multiplayer Side Quest page with leaderboard, proof checks, and quest badges.",
};

export default async function GroupQuestByIdPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  const { id } = await params;
  const quests = questIds
    .map((questId) => CHALLENGES.find((challenge) => challenge.id === questId))
    .filter((challenge): challenge is (typeof CHALLENGES)[number] => Boolean(challenge));
  const shareUrl = `https://sidequestchess.com/groupquests/${id}`;
  const totalReward = quests.reduce((sum, quest) => sum + quest.reward, 0);

  return (
    <main className="site-shell groupquests-page groupquest-participant-page">
      <SiteNav isSignedIn={Boolean(userId)} active="groupquests" />

      <div className="content-wrap">
        <section className="hero-card groupquests-hero groupquest-competition-hero">
          <div className="groupquest-hero-copy">
            <span className="eyebrow">Multiplayer Side Quest #{id}</span>
            <h1>No Castle Night</h1>
            <p className="hero-copy">
              Three Side Quests. One leaderboard. Submit public game proof, let SQC check it automatically, and try to climb before the window closes.
            </p>
            <div className="hero-actions button-row">
              <Link className="button primary" href="#submit-proof">Submit proof</Link>
              <GroupQuestShareButton questName="No Castle Night" shareUrl={shareUrl} />
            </div>
          </div>
          <div className="groupquest-seal-card" aria-label="Multiplayer Side Quest trophy summary">
            <div className="groupquest-seal">SQC</div>
            <strong>{totalReward.toLocaleString()} pts</strong>
            <span>available across {quests.length} quests</span>
          </div>
        </section>

        <section className="groupquest-score-strip" aria-label="Your competition standing">
          <div>
            <strong>#3</strong>
            <span>Your rank</span>
          </div>
          <div>
            <strong>40</strong>
            <span>Your points</span>
          </div>
          <div>
            <strong>1 / {quests.length}</strong>
            <span>Verified quests</span>
          </div>
          <div>
            <strong>38h</strong>
            <span>Time left</span>
          </div>
        </section>

        <section className="mission-card groupquest-leaderboard-card" aria-label="Competition leaderboard">
          <div className="section-head">
            <div>
              <span className="eyebrow">Competition leaderboard</span>
              <h2>How you’re doing vs everyone else.</h2>
            </div>
            <span className="badge green">Live checks on</span>
          </div>
          <div className="groupquest-leaderboard-list">
            {leaderboard.map((player) => (
              <article className={`groupquest-leaderboard-row ${player.tone}`} key={player.name}>
                <div className="groupquest-rank">#{player.rank}</div>
                <div>
                  <strong>{player.name}</strong>
                  <small>{player.handle}</small>
                </div>
                <div className="groupquest-progress-bar" aria-label={`${player.completed} of ${quests.length} quests verified`}>
                  <span style={{ width: `${Math.round((player.completed / quests.length) * 100)}%` }} />
                </div>
                <div>
                  <strong>{player.score.toLocaleString()} pts</strong>
                  <small>{player.proof} · {player.last}</small>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid groupquest-competition-grid" aria-label="Proof and quest stack">
          <article className="mission-card groupquests-participant-panel" id="submit-proof">
            <span className="eyebrow">Automatic proof checks</span>
            <h2>Submit once. SQC checks the boring parts.</h2>
            <p>
              Paste a public game URL. The verifier checks the provider data, time window, standard chess requirement, and the selected Side Quest rules.
            </p>
            <div className="groupquests-proof-checklist">
              {proofChecks.map((check) => (
                <div className={check.tone} key={check.label}>
                  <span>{check.label}<small>{check.copy}</small></span>
                  <strong>{check.state}</strong>
                </div>
              ))}
            </div>
            <div className="button-row">
              <button className="button primary" type="button">Submit game link</button>
              <Link className="button secondary" href="/connect">Connect public usernames</Link>
            </div>
          </article>

          <article className="mission-card groupquest-quest-badge-card">
            <div className="section-head">
              <div>
                <span className="eyebrow">Quest coats of arms</span>
                <h2>The stack to beat.</h2>
              </div>
              <span className="badge gold">{quests.length} quests</span>
            </div>
            <div className="groupquest-badge-stack">
              {quests.map((quest, index) => (
                <div className="groupquest-badge-row" key={quest.id}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={quest.badgeIdentity.image} alt="" />
                  <div>
                    <strong>{index + 1}. {quest.title}</strong>
                    <span>{quest.reward} pts · {quest.proofCallout}</span>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="grid groupquests-dashboard-grid" aria-label="Rules and event feed">
          <article className="mission-card groupquests-live-card">
            <div className="section-head">
              <div>
                <span className="eyebrow">Locked competition rules</span>
                <h2>Everyone plays under the same receipt.</h2>
              </div>
            </div>
            <div className="groupquests-status-strip" aria-label="Multiplayer Side Quest settings">
              <div><strong>Visibility</strong><span>Public listing</span></div>
              <div><strong>Variant</strong><span>Standard chess only</span></div>
              <div><strong>Window</strong><span>Open · 38h left</span></div>
              <div><strong>Proof</strong><span>Automatic public-game checks</span></div>
            </div>
          </article>

          <article className="mission-card">
            <div className="section-head">
              <div>
                <span className="eyebrow">Live activity</span>
                <h2>Proof events, not chat noise.</h2>
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
