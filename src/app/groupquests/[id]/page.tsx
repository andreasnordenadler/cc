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

const onboardingSteps = [
  { label: "1", title: "Accept the Side Quest", copy: "Join No Castle Night so your games can count for this competition." },
  { label: "2", title: "Play real chess elsewhere", copy: "Use Lichess or Chess.com. No uploads, no private passwords, just public game proof." },
  { label: "3", title: "SQC checks the proof", copy: "Paste a game link or check latest games. The verifier reads the public receipt." },
  { label: "4", title: "Climb the leaderboard", copy: "Completed quests fill the progress bars and move you up before time runs out." },
];

const competitionStartsAt = "May 12, 10:00 CEST";
const competitionEndsAt = "May 14, 00:00 CEST";

const ruleSummary = [
  { label: "Starts", value: competitionStartsAt },
  { label: "Ends", value: competitionEndsAt },
  { label: "Games allowed", value: "Lichess or Chess.com" },
  { label: "Variant", value: "Standard chess only" },
  { label: "Proof", value: "Public games after joining" },
];

export const metadata = {
  title: "Multiplayer Side Quest · Side Quest Chess",
  description: "A participant-focused Side Quest Chess Multiplayer Side Quest page with leaderboard, proof checks, and quest badges.",
};

export default async function GroupQuestByIdPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ accepted?: string }>;
}) {
  const { userId } = await auth();
  const { id } = await params;
  const query = searchParams ? await searchParams : {};
  const hasAcceptedInvite = query.accepted === "1";
  const quests = questIds
    .map((questId) => CHALLENGES.find((challenge) => challenge.id === questId))
    .filter((challenge): challenge is (typeof CHALLENGES)[number] => Boolean(challenge));
  const shareUrl = `https://sidequestchess.com/groupquests/${id}`;
  const totalReward = quests.reduce((sum, quest) => sum + quest.reward, 0);

  if (!hasAcceptedInvite) {
    return (
      <main className="site-shell groupquests-page groupquest-participant-page groupquest-invite-onboarding-page">
        <SiteNav isSignedIn={Boolean(userId)} active="groupquests" />

        <div className="content-wrap">
          <section className="hero-card groupquests-hero groupquest-competition-hero groupquest-invite-hero">
            <div className="groupquest-hero-copy">
              <span className="eyebrow">You were invited · Multiplayer Side Quest #{id}</span>
              <h1>No Castle Night</h1>
              <p className="hero-copy">
                A friend invited you to a chess side quest. Try to win real games while completing weird objectives, then Side Quest Chess checks the public proof and updates the competition leaderboard.
              </p>
              <div className="hero-actions button-row">
                <Link className="button primary" href={`/groupquests/${id}?accepted=1`}>Accept this Side Quest</Link>
                <Link className="button secondary" href="#how-it-works">How it works</Link>
              </div>
            </div>
            <div className="groupquest-seal-card" aria-label="Multiplayer Side Quest invitation summary">
              <div className="groupquest-seal-frame">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="groupquest-seal" src="/stamps/quest-complete-premium-red-wax-sqc-v15.png" alt="Silver Side Quest Chess seal" />
              </div>
              <strong>{competitionStartsAt}</strong>
              <span>Ends {competitionEndsAt} · {leaderboard.length} players are already in</span>
            </div>
          </section>

          <section className="grid groupquest-onboarding-grid" id="how-it-works" aria-label="Side Quest onboarding">
            <article className="mission-card groupquest-onboarding-card">
              <span className="eyebrow">What am I supposed to do?</span>
              <h2>Accept the quest, play normally, let SQC judge the receipt.</h2>
              <div className="groupquest-onboarding-steps">
                {onboardingSteps.map((step) => (
                  <div key={step.title}>
                    <em>{step.label}</em>
                    <span><strong>{step.title}</strong><small>{step.copy}</small></span>
                  </div>
                ))}
              </div>
            </article>

            <article className="mission-card groupquest-onboarding-card">
              <span className="eyebrow">What are the side quests?</span>
              <h2>The quests you are accepting.</h2>
              <div className="groupquest-badge-stack">
                {quests.map((quest, index) => (
                  <div className="groupquest-badge-row" key={quest.id}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={quest.badgeIdentity.image} alt="" />
                    <div>
                      <strong>{index + 1}. {quest.title}</strong>
                      <span>{quest.proofCallout} · {quest.reward} pts</span>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className="grid groupquests-dashboard-grid" aria-label="Rules and participants preview">
            <article className="mission-card groupquest-leaderboard-card">
              <div className="section-head">
                <div>
                  <span className="eyebrow">Who else is participating?</span>
                  <h2>Competition leaderboard preview.</h2>
                </div>
                <span className="badge green">Live</span>
              </div>
              <div className="groupquest-leaderboard-list">
                {leaderboard.slice(0, 3).map((player) => (
                  <article className={`groupquest-leaderboard-row ${player.tone}`} key={player.name}>
                    <div className="groupquest-rank">#{player.rank}</div>
                    <div>
                      <strong>{player.name}</strong>
                      <small>{player.proof}</small>
                    </div>
                    <div className="groupquest-progress-bar" aria-label={`${player.completed} of ${quests.length} quests verified`}>
                      <span style={{ width: `${Math.round((player.completed / quests.length) * 100)}%` }} />
                    </div>
                    <div>
                      <strong>{player.completed} / {quests.length}</strong>
                      <small>{player.last}</small>
                    </div>
                  </article>
                ))}
              </div>
            </article>

            <article className="mission-card groupquests-live-card">
              <span className="eyebrow">Rules and time</span>
              <h2>What counts for this run.</h2>
              <p>
                This competition uses fresh public games. Older personal completions do not automatically count here.
              </p>
              <div className="groupquests-status-strip groupquest-onboarding-rules" aria-label="Onboarding rule summary">
                {ruleSummary.map((rule) => (
                  <div key={rule.label}><strong>{rule.label}</strong><span>{rule.value}</span></div>
                ))}
              </div>
            </article>
          </section>

          <section className="mission-card groupquest-accept-card" aria-label="Accept this Side Quest">
            <div>
              <span className="eyebrow">Ready?</span>
              <h2>Accept this Side Quest.</h2>
              <p>After accepting, you will reach the live competition page with proof checks, leaderboard progress, activity, and share tools.</p>
            </div>
            <Link className="button primary" href={`/groupquests/${id}?accepted=1`}>Accept this Side Quest</Link>
          </section>
        </div>
      </main>
    );
  }

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
            <div className="groupquest-seal-frame">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="groupquest-seal" src="/stamps/quest-complete-premium-red-wax-sqc-v15.png" alt="Silver Side Quest Chess seal" />
            </div>
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
            <strong>May 14</strong>
            <span>Ends 00:00 CEST</span>
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
              <div><strong>Starts</strong><span>{competitionStartsAt}</span></div>
              <div><strong>Ends</strong><span>{competitionEndsAt}</span></div>
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
