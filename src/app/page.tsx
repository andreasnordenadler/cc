import Image from "next/image";
import Link from "next/link";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import ChallengeBadge from "@/components/challenge-badge";
import SiteNav from "@/components/site-nav";
import { CHALLENGES } from "@/lib/challenges";
import {
  getActiveChallenge,
  getChallengeProgress,
  getChessComUsername,
  getLichessUsername,
  type UserMetadataRecord,
} from "@/lib/user-metadata";
import { listPublicGroupQuests, listUserRelatedGroupQuests } from "@/lib/groupquests";


function toTimestamp(value: string) {
  const ts = Date.parse(value);
  return Number.isFinite(ts) ? ts : 0;
}

function deriveQuestState(startAt: string, endAt: string) {
  const now = Date.now();
  const start = toTimestamp(startAt);
  const end = toTimestamp(endAt);
  if (start && now < start) return { status: "Soon", tone: "gold", next: "Review rules", action: "Review" };
  if (end && now > end) return { status: "Finished", tone: "muted", next: "View results", action: "Results" };
  return { status: "Live", tone: "green", next: "Open", action: "Open" };
}

const heroismOptions = [
  {
    label: "Cautiously heroic",
    copy: "I want chaos, but survivable.",
    cta: "Start with Knights Before Coffee",
    challengeId: "knights-before-coffee",
  },
  {
    label: "Recklessly meaningful",
    copy: "I can handle one objectively bad idea.",
    cta: "Try No Castle Club",
    challengeId: "no-castle-club",
  },
  {
    label: "Historically unwise",
    copy: "I am here to become a cautionary tale.",
    cta: "Lose the queen, win anyway",
    challengeId: "queen-never-heard-of-her",
  },
];

export default async function Home() {
  const { userId } = await auth();
  const isSignedIn = Boolean(userId);
  const user = isSignedIn ? await currentUser() : null;
  const metadata = user?.publicMetadata ? (user.publicMetadata as UserMetadataRecord) : {};
  const activeQuest = getActiveChallenge(metadata);
  const progress = getChallengeProgress(metadata);
  const completedSet = new Set(progress.completedChallengeIds);
  const lichessUsername = getLichessUsername(metadata);
  const chessComUsername = getChessComUsername(metadata);
  const activeQuestRecord = activeQuest?.id
    ? CHALLENGES.find((challenge) => challenge.id === activeQuest.id)
    : null;
  const connectedIdentity = [lichessUsername, chessComUsername].filter(Boolean).join(" / ");
  let activeMultiplayerSideQuests: Array<{ title: string; status: string; meta: string; next: string; href: string; action: string; tone: string }> = [];
  let officialMultiplayerSideQuests: typeof activeMultiplayerSideQuests = [];
  let publicMultiplayerSideQuests: typeof activeMultiplayerSideQuests = [];
  let closedMultiplayerSideQuests: Array<{ title: string; meta: string; href: string; action: string }> = [];

  if (userId) {
    const client = await clerkClient();
    const related = await listUserRelatedGroupQuests(client, userId);
    const publicQuests = (await listPublicGroupQuests(client)).filter((quest) => quest.hostUserId !== userId);

    activeMultiplayerSideQuests = related
      .filter((quest) => deriveQuestState(quest.startAt, quest.endAt).status !== "Finished")
      .map((quest) => {
        const state = deriveQuestState(quest.startAt, quest.endAt);
        const isHost = quest.hostUserId === userId;
        return {
          title: quest.name,
          status: state.status,
          meta: `${isHost ? "Hosting" : "Playing"} · ${quest.participants.length} player${quest.participants.length === 1 ? "" : "s"} · ${quest.providerLabel}`,
          next: state.next,
          href: `/groupquests/${quest.id}${isHost ? "" : "?accepted=1"}`,
          action: state.action,
          tone: state.tone,
        };
      });

    const openPublicMultiplayerSideQuests = publicQuests
      .filter((quest) => deriveQuestState(quest.startAt, quest.endAt).status !== "Finished")
      .sort((a, b) => Number(Boolean(b.official)) - Number(Boolean(a.official)) || toTimestamp(b.createdAt) - toTimestamp(a.createdAt))
      .slice(0, 12);

    officialMultiplayerSideQuests = openPublicMultiplayerSideQuests.filter((quest) => quest.official).map((quest) => ({
        title: quest.name,
        status: "Open",
        meta: `${quest.officialLabel ?? "Official SQC"} · ${quest.providerLabel} · ${quest.participants.length} player${quest.participants.length === 1 ? "" : "s"}`,
        next: "Inspect and join",
        href: `/groupquests/${quest.id}`,
        action: "Join",
        tone: "green",
      }));

    publicMultiplayerSideQuests = openPublicMultiplayerSideQuests.filter((quest) => !quest.official).map((quest) => ({
        title: quest.name,
        status: "Open",
        meta: `Public · ${quest.providerLabel} · ${quest.participants.length} player${quest.participants.length === 1 ? "" : "s"}`,
        next: "Inspect and join",
        href: `/groupquests/${quest.id}`,
        action: "Join",
        tone: "green",
      }));

    closedMultiplayerSideQuests = related
      .filter((quest) => deriveQuestState(quest.startAt, quest.endAt).status === "Finished")
      .map((quest) => ({
        title: quest.name,
        meta: `Finished · ${quest.participants.length} player${quest.participants.length === 1 ? "" : "s"} · ${quest.providerLabel}`,
        href: `/groupquests/${quest.id}`,
        action: "Results",
      }));
  }

  const badgePreviewChallenges = CHALLENGES.filter((challenge) => challenge.badgeIdentity.image).slice(0, 6);
  const heroismChoices = heroismOptions
    .map((option) => {
      const challenge = CHALLENGES.find((candidate) => candidate.id === option.challengeId);
      return challenge ? { ...option, challenge } : null;
    })
    .filter((entry): entry is (typeof heroismOptions)[number] & { challenge: (typeof CHALLENGES)[number] } => Boolean(entry));

  return (
    <main className="site-shell">
      <SiteNav isSignedIn={isSignedIn} active="home" />

      <div className="content-wrap">
        <section className={`hero-grid launch-home-hero clean-home-hero ${isSignedIn ? "" : "signed-out-home-hero"}`}>
          <article className="hero-card simplified-home-hero">
            <h1>Chess, but with stupidly hard side quests — solo or multiplayer.</h1>
            <p className="hero-copy">
              {isSignedIn
                ? "Pick a solo quest or join a Multiplayer Side Quest, play a real Lichess or Chess.com game, then come back for automatic proof."
                : "Sign in, connect your public chess usernames, choose one ridiculous solo quest or Multiplayer Side Quest, play on Lichess or Chess.com and let SQC check your latest public games."}
            </p>
            <div className="button-row hero-actions home-mode-actions" aria-label="Choose Solo or Multiplayer Side Quest mode">
              <Link href="/challenges" className="button primary home-choice-button">Go on a <span>Solo</span> Side Quest</Link>
              <Link href="/groupquests" className="button primary home-choice-button">Join a <span>Multiplayer</span> Side Quest</Link>
            </div>
          </article>

          <aside className="side-card card recommended-quests-panel signed-out-start-panel heroism-selector-panel">
            <div className="heroism-selector-head">
              <span className="eyebrow">Where to begin</span>
              <h2>How heroic are you feeling today?</h2>
              <p>Pick a starting quest based on your current tolerance for terrible chess decisions.</p>
            </div>
            <div className="heroism-choice-list" aria-label="Choose a heroism level">
              {heroismChoices.map(({ label, copy, cta, challenge }) => {
                const isActiveChoice = isSignedIn && activeQuest?.id === challenge.id;

                return (
                  <Link
                    key={challenge.id}
                    href={`/challenges/${challenge.id}`}
                    className={isActiveChoice ? "heroism-choice-card active-home-quest-choice" : "heroism-choice-card"}
                    aria-label={isActiveChoice ? `Open active quest: ${challenge.title}` : undefined}
                  >
                    {isActiveChoice ? <span className="active-quest-stamp heroism-active-stamp" aria-label="Active quest" /> : null}
                    <ChallengeBadge challenge={challenge} presentation="art" earned={!isSignedIn || completedSet.has(challenge.id)} />
                    <span className="heroism-choice-copy">
                      <strong>{label}</strong>
                      <small>{copy}</small>
                      <em>{cta}</em>
                    </span>
                  </Link>
                );
              })}
            </div>
            <p className="heroism-custom-path">
              Or go <Link href="/challenges">find your own path</Link>.
            </p>
          </aside>
        </section>

        {!isSignedIn ? (
          <section className="mission-card signed-out-explainer" aria-label="What Side Quest Chess is for signed-out visitors">
            <div className="section-head">
              <div>
                <span className="eyebrow">What happens after sign-in</span>
                <h2>A tiny ritual, not another chess dashboard.</h2>
              </div>
            </div>
            <div className="checker-flow signed-out-loop-cards" aria-label="Signed-out product explanation">
              <div className="flow-step ready">
                <strong>Choose solo or multiplayer</strong>
                <p>Start one quest for yourself, or join a Multiplayer Side Quest when the bad idea deserves witnesses.</p>
              </div>
              <div className="flow-step ready">
                <strong>Play where you already play</strong>
                <p>Use a normal public Lichess or Chess.com game. Side Quest Chess never asks for chess-site passwords.</p>
              </div>
              <div className="flow-step ready">
                <strong>Get the receipt</strong>
                <p>The latest-game checker returns passed, failed, or pending with a shareable proof card, solo progress, and multiplayer leaderboard proof when relevant.</p>
              </div>
            </div>
          </section>
        ) : null}

        {!isSignedIn ? (
          <section className="mission-card signed-out-multiplayer-callout" aria-label="Multiplayer Side Quests">
            <div className="section-head">
              <div>
                <span className="eyebrow">Multiplayer Side Quests</span>
                <h2>Same nonsense, now with witnesses.</h2>
                <p>Join public Multiplayer Side Quests, inspect the rules before committing, or sign in when you want to create one and invite friends.</p>
              </div>
              <Link href="/groupquests" className="button secondary">Join Multiplayer Side Quests</Link>
            </div>
          </section>
        ) : null}


        {isSignedIn ? (
          <>
            <Link
              href={activeQuestRecord ? `/challenges/${activeQuestRecord.id}` : "/challenges"}
              className="card mission-card home-status-card compact-run-card active-quest-home-card"
              aria-label={activeQuestRecord ? `Open active quest: ${activeQuestRecord.title}` : "Choose an active quest"}
            >
              {activeQuestRecord ? (
                <span className="active-quest-card-coat" aria-hidden="true">
                  <ChallengeBadge challenge={activeQuestRecord} presentation="art" earned={completedSet.has(activeQuestRecord.id)} />
                </span>
              ) : null}
              <div className="section-head">
                <div>
                  <span className="eyebrow">Active Solo Side Quest</span>
                  <h2>{activeQuestRecord ? activeQuestRecord.title : "No active solo quest yet."}</h2>
                </div>
              </div>
              <div className="grid lean-status-grid active-quest-home-meta">
                <Fact label="Chess account" value={connectedIdentity || "Add Lichess or Chess.com"} />
              </div>
              <p>
                {activeQuestRecord
                  ? "Open the active quest page for rules, badge details, and the next weird chess side quest."
                  : "Choose one solo quest first so My Side Quests knows which weird rule to judge after your next public game."}
              </p>
            </Link>

            <section className="mission-card groupquests-user-overview home-multiplayer-command-card" aria-label="Multiplayer Side Quests">
              <div className="section-head groupquests-command-head">
                <div>
                  <span className="eyebrow">Multiplayer Side Quests</span>
                  <h2>Your multiplayer command center.</h2>
                  <p>Your active Multiplayer Side Quests, public Multiplayer Side Quests you can join, and closed results — all in one simple list.</p>
                </div>
                <Image
                  alt=""
                  className="groupquests-command-seal"
                  height={112}
                  src="/stamps/SQCBLACK%20SEAL.png"
                  width={112}
                />
              </div>

              <div className="groupquests-timeline-list" aria-label="Home Multiplayer Side Quests overview">
                <section className="groupquests-list-section" aria-label="My Active Multiplayer Side Quests">
                  <div className="groupquests-list-heading">
                    <div>
                      <h3>My Active Multiplayer Side Quests</h3>
                      <p>Live Multiplayer Side Quests, upcoming Multiplayer Side Quests, and drafts you manage.</p>
                    </div>
                    <span className="badge gold">{activeMultiplayerSideQuests.length}</span>
                  </div>

                  <div className="groupquests-compact-room-list">
                    {activeMultiplayerSideQuests.length ? activeMultiplayerSideQuests.map((quest) => (
                      <Link className={`groupquests-compact-room ${quest.tone}`} href={quest.href} key={quest.title}>
                        <strong>{quest.status}</strong>
                        <div>
                          <h4>{quest.title}</h4>
                          <p>{quest.meta}</p>
                        </div>
                        <span>{quest.next}</span>
                        <em>{quest.action}</em>
                      </Link>
                    )) : <p>No active Multiplayer Side Quests yet.</p>}
                  </div>
                </section>

                <section className="groupquests-list-section official" aria-label="Official SQC Multiplayer Side Quests">
                  <div className="groupquests-list-heading">
                    <div>
                      <h3>Official SQC Multiplayer Side Quests</h3>
                      <p>Curated public SQC events you can join right away.</p>
                    </div>
                    <span className="badge gold">{officialMultiplayerSideQuests.length}</span>
                  </div>

                  <div className="groupquests-compact-room-list">
                    {officialMultiplayerSideQuests.length ? officialMultiplayerSideQuests.map((quest) => (
                      <Link className={`groupquests-compact-room official ${quest.tone}`} href={quest.href} key={quest.title}>
                        <strong>{quest.status}</strong>
                        <div>
                          <small className="official-sqc-badge">Official SQC</small>
                          <h4>{quest.title}</h4>
                          <p>{quest.meta}</p>
                        </div>
                        <span>{quest.next}</span>
                        <em>{quest.action}</em>
                      </Link>
                    )) : <p>No official SQC Multiplayer Side Quests available right now.</p>}
                  </div>
                </section>

                <section className="groupquests-list-section" aria-label="Public Multiplayer Side Quests">
                  <div className="groupquests-list-heading">
                    <div>
                      <h3>Public Multiplayer Side Quests</h3>
                      <p>Open public Multiplayer Side Quests anyone can inspect and join.</p>
                    </div>
                    <span className="badge gold">{publicMultiplayerSideQuests.length}</span>
                  </div>

                  <div className="groupquests-compact-room-list">
                    {publicMultiplayerSideQuests.length ? publicMultiplayerSideQuests.map((quest) => (
                      <Link className={`groupquests-compact-room ${quest.tone}`} href={quest.href} key={quest.title}>
                        <strong>{quest.status}</strong>
                        <div>
                          <h4>{quest.title}</h4>
                          <p>{quest.meta}</p>
                        </div>
                        <span>{quest.next}</span>
                        <em>{quest.action}</em>
                      </Link>
                    )) : <p>No public Multiplayer Side Quests available right now.</p>}
                  </div>
                </section>

                <section className="groupquests-list-section finished" aria-label="My Closed Multiplayer Side Quests">
                  <div className="groupquests-list-heading">
                    <div>
                      <h3>My Closed Multiplayer Side Quests</h3>
                      <p>Recent completed Multiplayer Side Quests and placements.</p>
                    </div>
                    <span className="badge">{closedMultiplayerSideQuests.length}</span>
                  </div>

                  <div className="groupquests-finished-list">
                    {closedMultiplayerSideQuests.length ? closedMultiplayerSideQuests.map((quest) => (
                      <Link className="groupquests-finished-row" href={quest.href} key={quest.title}>
                        <div>
                          <strong>{quest.title}</strong>
                          <p>{quest.meta}</p>
                        </div>
                        <span>{quest.action}</span>
                      </Link>
                    )) : <p>No finished Multiplayer Side Quests yet.</p>}
                  </div>
                </section>
              </div>

              <div className="home-multiplayer-quests-footer">
                <Link href="/groupquests" className="button secondary">All Multiplayer Side Quests</Link>
              </div>
            </section>
          </>
        ) : null}

        <Link href="/badges" className="hero-card home-badge-vault-card home-badge-vault-link" aria-label="Open the coat of arms page">
          <h2>Every bad idea deserves a coat of arms.</h2>
          <p className="hero-copy">
            Side Quest Chess badges are collectible heraldic receipts: each shield explains the exact nonsense you survived, why it matters, and what your friends should mock respectfully.
          </p>
          <div className="home-badge-art-row" aria-label="Side Quest Chess coat of arms preview">
            {badgePreviewChallenges.map((challenge) => (
              <span key={challenge.id} className="home-badge-art-link" aria-hidden="true">
                <ChallengeBadge challenge={challenge} presentation="art" earned={!isSignedIn || completedSet.has(challenge.id)} />
              </span>
            ))}
          </div>
        </Link>



      </div>
    </main>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="fact">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
