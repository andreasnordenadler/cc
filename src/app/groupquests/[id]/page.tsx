import Link from "next/link";
import { auth, clerkClient } from "@clerk/nextjs/server";
import GroupQuestAcceptModal from "@/components/group-quest-accept-modal";
import GroupQuestInviteCopy from "@/components/group-quest-invite-copy";
import GroupQuestLeaderboard from "@/components/group-quest-leaderboard";
import GroupQuestLeaveAction from "@/components/group-quest-leave-action";
import GroupQuestParticipantSummary from "@/components/group-quest-participant-summary";
import SiteNav from "@/components/site-nav";
import { CHALLENGES } from "@/lib/challenges";
import { findGroupQuestById } from "@/lib/groupquests";

const questIds = ["knights-before-coffee", "no-castle-club", "rookless-rampage"];

const leaderboardPreview = [
  {
    rank: 1,
    name: "CoffeeKnight",
    completed: 3,
    proof: "3/3 verified",
    last: "Rookless Rampage accepted 12m ago",
    tone: "gold",
    questFinishedAt: {
      "knights-before-coffee": "May 12, 10:37 CEST",
      "no-castle-club": "May 12, 11:08 CEST",
      "rookless-rampage": "May 12, 13:38 CEST",
    },
  },
  {
    rank: 2,
    name: "QueenlessHero",
    completed: 2,
    proof: "2/3 verified",
    last: "No Castle Club accepted",
    tone: "blue",
    questFinishedAt: {
      "knights-before-coffee": "May 12, 10:52 CEST",
      "no-castle-club": "May 12, 12:21 CEST",
    },
  },
  {
    rank: 3,
    name: "New participant",
    completed: 1,
    proof: "1/3 verified",
    last: "Knights Before Coffee accepted",
    tone: "green",
    questFinishedAt: {
      "knights-before-coffee": "May 12, 12:44 CEST",
    },
  },
];

const eventFeed = [
  { time: "May 12, 13:38", label: "Proof accepted", copy: "CoffeeKnight completed Rookless Rampage and moved into first." },
  { time: "May 12, 13:12", label: "Refresh check", copy: "QueenlessHero's latest public game passed No Castle Club rules." },
  { time: "May 12, 12:44", label: "Your proof", copy: "Knights Before Coffee verified for your entry." },
  { time: "May 12, 12:21", label: "Proof accepted", copy: "QueenlessHero completed No Castle Club." },
  { time: "May 12, 11:08", label: "Proof accepted", copy: "CoffeeKnight completed No Castle Club." },
];

const defaultInviteCopy = "A friend invited you to a chess side quest. Try to win real games while completing weird objectives, then Side Quest Chess checks the public proof and updates the competition leaderboard.";

const onboardingSteps = [
  { label: "1", title: "Accept the Side Quest", copy: "Join No Castle Night so your games can count for this competition." },
  { label: "2", title: "Play real chess elsewhere", copy: "Use the allowed chess provider shown below. No uploads, no private passwords, just public game proof." },
  { label: "3", title: "Proof gets checked", copy: "Paste a game link or check latest games. The verifier reads the public game proof." },
  { label: "4", title: "Climb the leaderboard", copy: "Completed quests fill the progress bars and move you up before time runs out." },
];

const competitionStartsAt = "May 12, 10:00 CEST";
const competitionEndsAt = "May 21, 00:00 CEST";
const successCriteria = "First to complete all quests wins. If nobody finishes, highest points at the deadline wins.";

const ruleSummary = [
  { label: "Starts", value: competitionStartsAt },
  { label: "Ends", value: competitionEndsAt },
  { label: "Variant", value: "Standard chess only" },
  { label: "Proof", value: "Public games after joining" },
  { label: "Winner", value: successCriteria },
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
  const client = await clerkClient();
  const savedRecord = await findGroupQuestById(client, id);
  const savedQuest = savedRecord?.groupQuest;
  const serverParticipant = userId ? savedQuest?.participants.find((participant) => participant.userId === userId) : undefined;
  const activeQuestIds = savedQuest?.questIds.length ? savedQuest.questIds : questIds;
  const hasServerParticipant = Boolean(serverParticipant);
  const hasAcceptedInvite = query.accepted === "1" || hasServerParticipant;
  const questName = savedQuest?.name ?? "No Castle Night";
  const inviteCopy = savedQuest?.inviteCopy ?? defaultInviteCopy;
  const startsAt = savedQuest?.startAt ?? competitionStartsAt;
  const endsAt = savedQuest?.endAt ?? competitionEndsAt;
  const visibilityLabel = savedQuest?.inviteMode === "unlisted-link" ? "Unlisted link" : savedQuest?.inviteMode === "invite-only" ? "Invite-only" : "Public listing";
  const providerLabel = savedQuest?.providerLabel ?? "Lichess or Chess.com";
  const quests = activeQuestIds
    .map((questId) => CHALLENGES.find((challenge) => challenge.id === questId))
    .filter((challenge): challenge is (typeof CHALLENGES)[number] => Boolean(challenge));
  const totalReward = quests.reduce((sum, quest) => sum + quest.reward, 0);

  if (!hasAcceptedInvite) {
    return (
      <main className="site-shell groupquests-page groupquest-participant-page groupquest-invite-onboarding-page">
        <SiteNav isSignedIn={Boolean(userId)} active="groupquests" />

        <div className="content-wrap">
          <section className="hero-card groupquests-hero groupquest-competition-hero groupquest-invite-hero">
            <div className="groupquest-hero-copy">
              <span className="eyebrow">You were invited · Multiplayer Side Quest #{id}</span>
              <h1>{questName}</h1>
              <GroupQuestInviteCopy id={id} fallback={inviteCopy} />
              <div className="hero-actions button-row">
                <GroupQuestAcceptModal id={id} questName={questName} isSignedIn={Boolean(userId)} />
                <Link className="button secondary" href="#how-it-works">How it works</Link>
              </div>
            </div>
            <div className="groupquest-seal-card" aria-label="Multiplayer Side Quest invitation summary">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="groupquest-seal" src="/stamps/SQCBLACK%20SEAL.png" alt="Black Side Quest Chess seal" />
              <ul className="groupquest-summary-list" aria-label="Competition summary">
                <li><span>Starts</span><strong>{startsAt}</strong></li>
                <li><span>Ends</span><strong>{endsAt}</strong></li>
                <li><span>Players</span><strong>{savedQuest?.participants.length ?? 4} participating</strong></li>
              </ul>
            </div>
          </section>

          <section className="grid groupquest-onboarding-grid" id="how-it-works" aria-label="Side Quest onboarding">
            <article className="mission-card groupquest-onboarding-card">
              <span className="eyebrow">What am I supposed to do?</span>
              <h2>Accept the quest, play normally, climb the leaderboard.</h2>
              <div className="groupquest-onboarding-steps">
                {onboardingSteps.map((step) => {
                  const isAcceptStep = step.label === "1";
                  const content = (
                    <>
                      <em>{step.label}</em>
                      <span><strong>{step.title}</strong><small>{step.copy}</small></span>
                    </>
                  );

                  return isAcceptStep ? (
                    <div className="groupquest-onboarding-step primary-step" key={step.title}>
                      {content}
                    </div>
                  ) : (
                    <div className="groupquest-onboarding-step" key={step.title}>
                      {content}
                    </div>
                  );
                })}
              </div>
            </article>

            <article className="mission-card groupquest-onboarding-card">
              <span className="eyebrow">What are the side quests?</span>
              <h2>The quests you are accepting.</h2>
              <div className="groupquest-badge-stack">
                {quests.map((quest) => (
                  <Link className="groupquest-badge-row" href={`/challenges/${quest.id}`} key={quest.id}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={quest.badgeIdentity.image} alt="" />
                    <div>
                      <strong>{quest.title}</strong>
                      <span>{quest.proofCallout} · {quest.reward} pts · View full quest</span>
                    </div>
                  </Link>
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
                {leaderboardPreview.map((player) => (
                  <details className={`groupquest-leaderboard-row ${player.tone}`} key={player.name}>
                    <summary>
                      <div className="groupquest-rank">#{player.rank}</div>
                      <div>
                        <strong>{player.name}</strong>
                        <small>{player.proof}</small>
                      </div>
                      <div className="groupquest-progress-bar" aria-label={`${player.completed} of ${quests.length} Side Quests verified`}>
                        <span style={{ width: `${Math.round((player.completed / quests.length) * 100)}%` }} />
                      </div>
                      <div>
                        <strong>{player.completed} / {quests.length}</strong>
                        <small>{player.last}</small>
                      </div>
                    </summary>
                    <div className="groupquest-finished-detail" aria-label={`${player.name} quest finish times`}>
                      {quests.map((quest) => {
                        const finishedAt = player.questFinishedAt[quest.id as keyof typeof player.questFinishedAt];
                        return (
                          <div key={quest.id}>
                            <span>{quest.title}</span>
                            <strong>{finishedAt ?? "Not finished yet"}</strong>
                          </div>
                        );
                      })}
                    </div>
                  </details>
                ))}
              </div>
            </article>

            <article className="mission-card groupquests-live-card">
              <span className="eyebrow">Rules and time</span>
              <h2>What counts for this run.</h2>
              <p>
                This competition uses fresh public games. Older personal completions do not automatically count here. Winner rule: first to complete every Side Quest wins; otherwise highest points wins when time expires.
              </p>
              <ul className="groupquest-summary-list groupquest-rules-list" aria-label="Onboarding rule summary">
                <li><span>Games allowed</span><strong>{providerLabel}</strong></li>
                {ruleSummary.map((rule) => (
                  <li key={rule.label}><span>{rule.label}</span><strong>{rule.value}</strong></li>
                ))}
              </ul>
            </article>
          </section>

          <section className="mission-card groupquest-accept-card" aria-label="Accept this Side Quest">
            <div>
              <span className="eyebrow">Ready?</span>
              <h2>Accept this Side Quest.</h2>
              <p>After accepting, you will reach the live competition page with proof checks, leaderboard progress, activity, and share tools.</p>
            </div>
            <GroupQuestAcceptModal id={id} questName={questName} isSignedIn={Boolean(userId)} />
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
            <div className="groupquest-hero-pills" aria-label="Multiplayer Side Quest identity and dates">
              <span className="eyebrow groupquest-id-pill">Multiplayer Side Quest <strong>#{id}</strong></span>
              <span className="eyebrow groupquest-date-pill">{startsAt} → {endsAt}</span>
            </div>
            <h1>{questName}</h1>
            <p className="hero-copy">
              Three Side Quests. One leaderboard. First to finish all quests wins; if nobody finishes, highest points at the deadline wins.
            </p>

          </div>
          <div className="groupquest-seal-card" aria-label="Multiplayer Side Quest trophy summary">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="groupquest-seal" src="/stamps/SQCBLACK%20SEAL.png" alt="Black Side Quest Chess seal" />
            <strong>{totalReward.toLocaleString()} pts</strong>
            <span>available across {quests.length} Side Quests</span>
          </div>
        </section>

        <GroupQuestParticipantSummary
          id={id}
          initialParticipant={serverParticipant ? {
            provider: serverParticipant.provider === "chesscom" ? "Chess.com" : "Lichess",
            username: serverParticipant.username,
            leaderboardName: serverParticipant.leaderboardName,
            emailUpdates: serverParticipant.wantsEmailUpdates ? (serverParticipant.email ?? "On") : "Off",
            location: serverParticipant.location ?? "Optional",
          } : undefined}
        />


        <section className="mission-card groupquest-top-quest-stack" aria-label="Quests to complete">
          <div className="section-head compact">
            <div>
              <span className="eyebrow">Quests to complete</span>
              <h2>Finish these {quests.length} Side Quests to win.</h2>
            </div>
            <span className="badge gold">{quests.length} Side Quests</span>
          </div>
          <div className="groupquest-top-quest-list">
            {quests.map((quest) => (
              <Link className="groupquest-top-quest-row" href={`/challenges/${quest.id}`} key={quest.id}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={quest.badgeIdentity.image} alt="" />
                <span>
                  <strong>{quest.title}</strong>
                  <small>{quest.reward} pts · {quest.proofCallout}</small>
                </span>
              </Link>
            ))}
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
            <span>Verified Side Quests</span>
          </div>
          <div>
            <strong>May 21</strong>
            <span>Ends 00:00 CEST</span>
          </div>
        </section>

        <GroupQuestLeaderboard
          id={id}
          quests={quests.map((quest) => ({
            id: quest.id,
            title: quest.title,
            badgeImage: quest.badgeIdentity.image,
            badgeName: quest.badgeIdentity.name,
          }))}
          participants={savedQuest?.participants}
          currentUserId={userId}
        />

        <section className="grid groupquests-dashboard-grid" aria-label="Rules and event feed">
          <article className="mission-card groupquests-live-card">
            <div className="section-head">
              <div>
                <span className="eyebrow">Locked competition rules</span>
                <h2>Everyone plays under the same receipt.</h2>
              </div>
            </div>
            <ul className="groupquest-summary-list groupquest-rules-list groupquest-accepted-rules-list" aria-label="Multiplayer Side Quest settings">
              <li><span>Visibility</span><strong>{visibilityLabel}</strong></li>
              <li><span>Games allowed</span><strong>{providerLabel}</strong></li>
              <li><span>Variant</span><strong>Standard chess only</strong></li>
              <li><span>Starts</span><strong>{startsAt}</strong></li>
              <li><span>Ends</span><strong>{endsAt}</strong></li>
              <li><span>Winner</span><strong>{successCriteria}</strong></li>
              <li><span>Proof</span><strong>Automatic public-game checks</strong></li>
            </ul>
          </article>

          <article className="mission-card">
            <div className="section-head groupquest-leaderboard-head">
              <div>
                <span className="eyebrow">Live activity</span>
                <h2>Proof events, not chat noise.</h2>
              </div>
              <button className="button secondary groupquest-refresh-button" type="button">Refresh checks</button>
            </div>
            <ul className="groupquests-feed-list groupquests-activity-list" aria-label="Latest activity updates">
              {eventFeed.slice(0, 5).map((event) => (
                <li key={`${event.time}-${event.copy}`}>
                  <time>{event.time}</time>
                  <span><strong>{event.label}</strong>{event.copy}</span>
                </li>
              ))}
            </ul>
          </article>
        </section>

        <GroupQuestLeaveAction id={id} />
      </div>
    </main>
  );
}
