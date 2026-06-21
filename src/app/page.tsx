import Image from "next/image";
import Link from "next/link";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ChallengeBadge from "@/components/challenge-badge";
import RandomSoloQuestLink from "@/components/random-solo-quest-link";
import SiteNav from "@/components/site-nav";
import { POST as runQuestAction } from "@/app/api/mobile/quest/route";
import { CHALLENGES } from "@/lib/challenges";
import {
  buildAttemptSummary,
  getActiveChallenge,
  getChallengeAttempts,
  getChallengeProgress,
  getChessComUsername,
  getLatestChallengeAttempt,
  getLichessUsername,
  shouldPreselectDefaultStarterQuest,
  type UserMetadataRecord,
  withDefaultStarterQuest,
} from "@/lib/user-metadata";
import {
  listPublicGroupQuests,
  listUserRelatedGroupQuests,
  type ServerGroupQuest,
} from "@/lib/groupquests";
import { getCustomSideQuests } from "@/lib/custom-side-quests";
import { buildPublicProofPath } from "@/lib/proof-share";

function toTimestamp(value: string) {
  const ts = Date.parse(value);
  return Number.isFinite(ts) ? ts : 0;
}

function getLatestPassedAttempt(metadata: UserMetadataRecord, challengeId: string) {
  return getChallengeAttempts(metadata, challengeId)
    .filter((attempt) => attempt.status === "passed")
    .at(-1) ?? null;
}

function deriveQuestState(startAt: string, endAt: string) {
  const now = Date.now();
  const start = toTimestamp(startAt);
  const end = toTimestamp(endAt);
  if (start && now < start)
    return {
      status: "Soon",
      tone: "gold",
      next: "Review rules",
      action: "Review",
    };
  if (end && now > end)
    return {
      status: "Finished",
      tone: "muted",
      next: "View results",
      action: "Results",
    };
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
  let metadata = user?.publicMetadata
    ? (user.publicMetadata as UserMetadataRecord)
    : {};
  if (user && shouldPreselectDefaultStarterQuest(metadata)) {
    metadata = withDefaultStarterQuest(metadata);
    const client = await clerkClient();
    await client.users.updateUserMetadata(user.id, { publicMetadata: metadata });
  }
  const privateMetadata = user?.privateMetadata
    ? (user.privateMetadata as UserMetadataRecord)
    : {};
  const activeQuest = getActiveChallenge(metadata);
  const progress = getChallengeProgress(metadata);
  const completedSet = new Set(progress.completedChallengeIds);
  const lichessUsername = getLichessUsername(metadata);
  const chessComUsername = getChessComUsername(metadata);
  const customSideQuests = user
    ? getCustomSideQuests(privateMetadata).length
      ? getCustomSideQuests(privateMetadata)
      : getCustomSideQuests(metadata)
    : [];
  const activeQuestRecord = activeQuest?.id
    ? CHALLENGES.find((challenge) => challenge.id === activeQuest.id)
    : null;
  const activeCustomQuestRecord = activeQuest?.id
    ? customSideQuests.find((quest) => quest.id === activeQuest.id) ?? null
    : null;
  const activeSoloQuest = activeQuestRecord
    ? {
        id: activeQuestRecord.id,
        title: activeQuestRecord.title,
        href: `/challenges/${activeQuestRecord.id}`,
        kind: "official" as const,
        completed: completedSet.has(activeQuestRecord.id),
        badgeImageUrl: activeQuestRecord.badgeIdentity.image,
        challenge: activeQuestRecord,
      }
    : activeCustomQuestRecord
      ? {
          id: activeCustomQuestRecord.id,
          title: activeCustomQuestRecord.title,
          href: "/account/custom-side-quests",
          kind: "custom" as const,
          completed: completedSet.has(activeCustomQuestRecord.id),
          badgeImageUrl: activeCustomQuestRecord.badgeImageUrl || "/badges/custom/clean/custom-coat-knight-gold.png",
          challenge: null,
        }
      : null;
  const activeIncompleteChallengeId =
    activeQuestRecord && !completedSet.has(activeQuestRecord.id)
      ? activeQuestRecord.id
      : undefined;
  const randomSoloQuestIds = CHALLENGES.filter(
    (challenge) => !challenge.id.includes("coming-soon"),
  ).map((challenge) => challenge.id);
  const latestActiveAttempt = activeSoloQuest
    ? getLatestChallengeAttempt(metadata, activeSoloQuest.id)
    : null;
  const latestActiveAttemptSummary = latestActiveAttempt
    ? buildAttemptSummary(latestActiveAttempt)
    : null;
  const connectedIdentity = [lichessUsername, chessComUsername]
    .filter(Boolean)
    .join(" / ");
  let activeMultiplayerSideQuests: Array<{
    title: string;
    status: string;
    meta: string;
    next: string;
    href: string;
    action: string;
    tone: string;
  }> = [];
  let officialMultiplayerSideQuests: typeof activeMultiplayerSideQuests = [];
  let publicMultiplayerSideQuests: typeof activeMultiplayerSideQuests = [];
  let closedMultiplayerSideQuests: Array<{
    title: string;
    meta: string;
    href: string;
    action: string;
  }> = [];
  let homeTrophyCabinetItems: Array<{
    title: string;
    meta: string;
    href: string;
    kind: "Solo Side Quest" | "Custom" | "Multiplayer";
    image: string;
    officialChallenge?: (typeof CHALLENGES)[number];
  }> = [];

  if (userId) {
    const client = await clerkClient();
    const related = await listUserRelatedGroupQuests(client, userId);
    const publicQuests = (await listPublicGroupQuests(client)).filter(
      (quest) => quest.hostUserId !== userId,
    );

    activeMultiplayerSideQuests = related
      .filter(
        (quest) =>
          deriveQuestState(quest.startAt, quest.endAt).status !== "Finished",
      )
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
      .filter(
        (quest) =>
          deriveQuestState(quest.startAt, quest.endAt).status !== "Finished",
      )
      .sort(
        (a, b) =>
          Number(Boolean(b.official)) - Number(Boolean(a.official)) ||
          toTimestamp(b.createdAt) - toTimestamp(a.createdAt),
      )
      .slice(0, 12);

    officialMultiplayerSideQuests = openPublicMultiplayerSideQuests
      .filter((quest) => quest.official)
      .map((quest) => ({
        title: quest.name,
        status: "Open",
        meta: `${quest.officialLabel ?? "Official SQC"} · ${quest.providerLabel} · ${quest.participants.length} player${quest.participants.length === 1 ? "" : "s"}`,
        next: "Inspect and join",
        href: `/groupquests/${quest.id}`,
        action: "Join",
        tone: "green",
      }));

    publicMultiplayerSideQuests = openPublicMultiplayerSideQuests
      .filter((quest) => !quest.official)
      .map((quest) => ({
        title: quest.name,
        status: "Open",
        meta: `Public · ${quest.providerLabel} · ${quest.participants.length} player${quest.participants.length === 1 ? "" : "s"}`,
        next: "Inspect and join",
        href: `/groupquests/${quest.id}`,
        action: "Join",
        tone: "green",
      }));

    closedMultiplayerSideQuests = related
      .filter(
        (quest) =>
          deriveQuestState(quest.startAt, quest.endAt).status === "Finished",
      )
      .map((quest) => ({
        title: quest.name,
        meta: `Finished · ${quest.participants.length} player${quest.participants.length === 1 ? "" : "s"} · ${quest.providerLabel}`,
        href: `/groupquests/${quest.id}`,
        action: "Results",
      }));

    const officialTrophies = await Promise.all(CHALLENGES.filter((challenge) =>
      completedSet.has(challenge.id),
    ).map(async (challenge) => {
      const latestProof = getLatestPassedAttempt(metadata, challenge.id);
      const proofPath = await buildPublicProofPath({
        attempt: latestProof,
        challenge,
        runnerName: user?.firstName || user?.username || "SQC player",
      });

      return {
        title: challenge.title,
        meta: `Unlocked ${challenge.badgeIdentity.name}`,
        href: proofPath,
        kind: "Solo Side Quest" as const,
        image:
          challenge.badgeIdentity.image ?? "/badges/proof-loop-test-badge.png",
        officialChallenge: challenge,
      };
    }));
    const customTrophies = customSideQuests
      .filter((quest) => completedSet.has(quest.id))
      .map((quest) => ({
        title: quest.title,
        meta: "Custom Solo Side Quest proof saved to your Trophy Cabinet",
        href: "/account/custom-side-quests",
        kind: "Custom" as const,
        image:
          quest.badgeImageUrl || "/badges/custom/clean/custom-coat-knight-gold.png",
      }));

    homeTrophyCabinetItems = [
      ...officialTrophies,
      ...customTrophies,
      ...buildHomeMultiplayerTrophies(related, userId),
    ].slice(0, 5);
  }

  const badgePreviewChallenges = CHALLENGES.filter(
    (challenge) => challenge.badgeIdentity.image,
  ).slice(0, 6);
  const heroismChoices = heroismOptions
    .map((option) => {
      const challenge = CHALLENGES.find(
        (candidate) => candidate.id === option.challengeId,
      );
      return challenge ? { ...option, challenge } : null;
    })
    .filter(
      (
        entry,
      ): entry is (typeof heroismOptions)[number] & {
        challenge: (typeof CHALLENGES)[number];
      } => Boolean(entry),
    );

  return (
    <main className="site-shell">
      <SiteNav isSignedIn={isSignedIn} active="home" />

      <div className="content-wrap">
        <section
          className={`hero-grid launch-home-hero clean-home-hero ${isSignedIn ? "" : "signed-out-home-hero"}`}
        >
          <article className="hero-card simplified-home-hero">
            <h1>
              Chess, but with stupidly hard side quests — Solo Side Quest or Multiplayer.
            </h1>
            <p className="hero-copy">
              {isSignedIn
                ? "Pick a Solo Side Quest or join a Multiplayer Side Quest, play a real Lichess or Chess.com game, then come back for automatic proof."
                : "Sign in, connect your public chess usernames, choose one ridiculous Solo Side Quest or Multiplayer Side Quest, play on Lichess or Chess.com and let SQC check your latest public games."}
            </p>
            <div
              className="button-row hero-actions home-mode-actions"
              aria-label="Choose Solo Side Quest or Multiplayer Side Quest mode"
            >
              <Link
                href="/challenges"
                className="button primary home-choice-button"
              >
                Go on a <span>Solo Side Quest</span>
              </Link>
              <Link
                href="/groupquests"
                className="button primary home-choice-button"
              >
                Join a <span>Multiplayer</span> Side Quest
              </Link>
            </div>
          </article>

          <aside className="side-card card recommended-quests-panel signed-out-start-panel heroism-selector-panel">
            <div className="heroism-selector-head">
              <span className="eyebrow">Where to begin</span>
              <h2>How heroic are you feeling today?</h2>
              <p>
                Pick a starting quest based on your current tolerance for
                terrible chess decisions.
              </p>
            </div>
            <div
              className="heroism-choice-list"
              aria-label="Choose a heroism level"
            >
              {heroismChoices.map(({ label, copy, cta, challenge }) => {
                const isActiveChoice =
                  isSignedIn && activeQuest?.id === challenge.id;

                return (
                  <Link
                    key={challenge.id}
                    href={`/challenges/${challenge.id}`}
                    className={
                      isActiveChoice
                        ? "heroism-choice-card active-home-quest-choice"
                        : "heroism-choice-card"
                    }
                    aria-label={
                      isActiveChoice
                        ? `Open active quest: ${challenge.title}`
                        : undefined
                    }
                  >
                    {isActiveChoice ? (
                      <span
                        className="active-quest-stamp heroism-active-stamp"
                        aria-label="Active quest"
                      />
                    ) : null}
                    <ChallengeBadge
                      challenge={challenge}
                      presentation="art"
                      earned={!isSignedIn || completedSet.has(challenge.id)}
                    />
                    <span className="heroism-choice-copy">
                      <strong>{label}</strong>
                      <small>{copy}</small>
                      <em>{cta}</em>
                    </span>
                  </Link>
                );
              })}
            </div>
            <div className="heroism-custom-path home-random-solo-path">
              <RandomSoloQuestLink
                challengeIds={randomSoloQuestIds}
                activeChallengeId={activeIncompleteChallengeId}
                completedChallengeIds={progress.completedChallengeIds}
              />
              <p>
                Or go <Link href="/challenges">find your own path</Link>.
              </p>
            </div>
          </aside>
        </section>

        {!isSignedIn ? (
          <section
            className="mission-card signed-out-explainer"
            aria-label="What Side Quest Chess is for signed-out visitors"
          >
            <div className="section-head">
              <div>
                <span className="eyebrow">What happens after sign-in</span>
                <h2>A tiny ritual, not another chess dashboard.</h2>
              </div>
            </div>
            <div
              className="checker-flow signed-out-loop-cards"
              aria-label="Signed-out product explanation"
            >
              <div className="flow-step ready">
                <strong>Choose Solo Side Quest or Multiplayer</strong>
                <p>
                  Start one quest for yourself, or join a Multiplayer Side Quest
                  when the bad idea deserves witnesses.
                </p>
              </div>
              <div className="flow-step ready">
                <strong>Play where you already play</strong>
                <p>
                  Use a normal public Lichess or Chess.com game. Side Quest
                  Chess never asks for chess-site passwords.
                </p>
              </div>
              <div className="flow-step ready">
                <strong>Get the receipt</strong>
                <p>
                  The latest-game checker returns passed, failed, or pending
                  with a shareable proof card, Solo Side Quest progress, and multiplayer
                  leaderboard proof when relevant.
                </p>
              </div>
            </div>
          </section>
        ) : null}

        {!isSignedIn ? (
          <section
            className="mission-card signed-out-multiplayer-callout"
            aria-label="Multiplayer Side Quests"
          >
            <div className="section-head">
              <div>
                <span className="eyebrow">Multiplayer Side Quests</span>
                <h2>Same nonsense, now with witnesses.</h2>
                <p>
                  Join public Multiplayer Side Quests, inspect the rules before
                  committing, or sign in when you want to create one and invite
                  friends.
                </p>
              </div>
              <Link href="/groupquests" className="button secondary">
                Join Multiplayer Side Quests
              </Link>
            </div>
          </section>
        ) : null}

        {isSignedIn ? (
          <>
            <section
              className="card mission-card home-status-card compact-run-card active-quest-home-card"
              aria-label={
                activeSoloQuest
                  ? `Active quest: ${activeSoloQuest.title}`
                  : "Choose an active quest"
              }
            >
              {activeSoloQuest ? (
                <span className="active-quest-card-coat" aria-hidden="true">
                  {activeSoloQuest.challenge ? (
                    <ChallengeBadge
                      challenge={activeSoloQuest.challenge}
                      presentation="art"
                      earned={activeSoloQuest.completed}
                    />
                  ) : (
                    <Image
                      src={activeSoloQuest.badgeImageUrl}
                      alt=""
                      width={128}
                      height={128}
                    />
                  )}
                </span>
              ) : null}
              <div className="section-head">
                <div>
                  <span className="eyebrow">Active Solo Side Quest</span>
                  <h2>
                    {activeSoloQuest
                      ? activeSoloQuest.title
                      : "No active Solo Side Quest yet."}
                  </h2>
                </div>
              </div>
              <div className="grid lean-status-grid active-quest-home-meta">
                <Fact
                  label="Chess account"
                  value={connectedIdentity || "Add Lichess or Chess.com"}
                />
              </div>
              <div
                className="home-active-run-panel"
                aria-label="Active Solo Side Quest next steps"
              >
                <div className="home-active-run-card primary">
                  <span>Fastest check</span>
                  <strong>
                    {activeSoloQuest
                      ? connectedIdentity
                        ? "Judge my latest public game"
                        : "Connect a chess username"
                      : "Choose a Solo Side Quest"}
                  </strong>
                  <p>
                    {activeSoloQuest
                      ? connectedIdentity
                        ? "SQC will inspect your newest public Lichess or Chess.com game against this active Solo Side Quest."
                        : "Add a public Lichess or Chess.com username once, then return here for one-tap proof checks."
                      : "Pick the rule first, then play a normal public chess game when you are ready."}
                  </p>
                </div>
                <div className="home-active-run-card">
                  <span>{activeSoloQuest ? "Run details" : "Good first step"}</span>
                  <strong>
                    {activeSoloQuest
                      ? activeSoloQuest.kind === "custom"
                        ? "Custom controls and receipts"
                        : "Rules, exact game, and receipt"
                      : "Any Game Counts is already friendly"}
                  </strong>
                  <p>
                    {activeSoloQuest
                      ? activeSoloQuest.kind === "custom"
                        ? "Open My Custom Side Quests for exact-game proof, pause/reset controls, rule summaries, and saved receipts."
                        : "Open the quest page when you want the full rule card, exact-game proof, badge details, or public receipt."
                      : "Start simple, then browse stranger official or Community Solo Side Quests once the loop feels familiar."}
                  </p>
                </div>
              </div>
              {latestActiveAttempt && latestActiveAttemptSummary ? (
                <p className="microcopy">
                  Latest check: {latestActiveAttemptSummary.headline} ·{" "}
                  {latestActiveAttemptSummary.detail}
                </p>
              ) : null}
              <div className="button-row hero-actions active-quest-home-actions">
                {activeSoloQuest && connectedIdentity ? (
                  <form action={checkActiveSoloQuestFromHome}>
                    <button type="submit" className="button primary">
                      Check latest game
                    </button>
                  </form>
                ) : activeSoloQuest ? (
                  <Link href="/connect" className="button primary">
                    Add chess username
                  </Link>
                ) : (
                  <Link href="/challenges" className="button primary">
                    Choose a quest
                  </Link>
                )}
                <Link
                  href={activeSoloQuest ? activeSoloQuest.href : "/challenges"}
                  className="button secondary"
                >
                  {activeSoloQuest
                    ? activeSoloQuest.kind === "custom"
                      ? "Open custom controls"
                      : "Open quest details"
                    : "Browse Solo Side Quests"}
                </Link>
              </div>
            </section>

            <section
              className="mission-card groupquests-user-overview home-trophy-cabinet-card"
              aria-label="Trophy Cabinet summary"
            >
              <div className="section-head groupquests-command-head">
                <div>
                  <span className="eyebrow">Trophy Cabinet</span>
                  <h2>Your latest unlocked coats and podium scrolls.</h2>
                  <p>
                    Your latest Trophy Cabinet progress lives here too, so you
                    can jump back into the same receipts from the home screen.
                  </p>
                </div>
                <Image
                  alt=""
                  className="groupquests-command-seal"
                  height={112}
                  src="/badges/proof-loop-test-badge.png"
                  width={112}
                />
              </div>

              <div
                className="groupquests-compact-room-list"
                aria-label="Latest Trophy Cabinet items"
              >
                {homeTrophyCabinetItems.length ? (
                  homeTrophyCabinetItems.map((item) => (
                    <Link
                      className="groupquests-compact-room gold"
                      href={item.href}
                      key={`${item.kind}-${item.title}`}
                    >
                      <strong>{item.kind}</strong>
                      <div className="home-trophy-cabinet-row-copy">
                        {item.officialChallenge ? (
                          <span
                            className="home-trophy-cabinet-thumb"
                            aria-hidden="true"
                          >
                            <ChallengeBadge
                              challenge={item.officialChallenge}
                              presentation="art"
                              earned
                            />
                          </span>
                        ) : (
                          <span
                            className="home-trophy-cabinet-thumb"
                            aria-hidden="true"
                          >
                            <Image
                              src={item.image}
                              alt=""
                              width={48}
                              height={48}
                            />
                          </span>
                        )}
                        <span>
                          <h4>{item.title}</h4>
                          <p>{item.meta}</p>
                        </span>
                      </div>
                      <span>Open</span>
                      <em>Receipt</em>
                    </Link>
                  ))
                ) : (
                  <p>
                    No Trophy Cabinet items yet. Complete a Solo Side Quest or
                    finish top-three in Multiplayer to unlock your first
                    receipt.
                  </p>
                )}
              </div>

              <div className="home-multiplayer-quests-footer">
                <Link href="/account" className="button secondary">
                  Open Trophy Cabinet
                </Link>
                <Link href="/badges" className="button secondary">
                  Browse Coat of Arms
                </Link>
              </div>
            </section>

            <section
              className="mission-card groupquests-user-overview home-multiplayer-command-card"
              aria-label="Multiplayer Side Quests"
            >
              <div className="section-head groupquests-command-head">
                <div>
                  <span className="eyebrow">Multiplayer Side Quests</span>
                  <h2>Your multiplayer command center.</h2>
                  <p>
                    Your active Multiplayer Side Quests, public Multiplayer Side
                    Quests you can join, and closed results — all in one simple
                    list.
                  </p>
                </div>
                <Image
                  alt=""
                  className="groupquests-command-seal"
                  height={112}
                  src="/stamps/sqc-multiplayer-seal.png"
                  width={112}
                />
              </div>

              <div
                className="groupquests-timeline-list"
                aria-label="Home Multiplayer Side Quests overview"
              >
                <section
                  className="groupquests-list-section"
                  aria-label="My Active Multiplayer Side Quests"
                >
                  <div className="groupquests-list-heading">
                    <div>
                      <h3>My Active Multiplayer Side Quests</h3>
                      <p>
                        Live Multiplayer Side Quests, upcoming Multiplayer Side
                        Quests, and drafts you manage.
                      </p>
                    </div>
                    <span className="badge gold">
                      {activeMultiplayerSideQuests.length}
                    </span>
                  </div>

                  <div className="groupquests-compact-room-list">
                    {activeMultiplayerSideQuests.length ? (
                      activeMultiplayerSideQuests.map((quest) => (
                        <Link
                          className={`groupquests-compact-room ${quest.tone}`}
                          href={quest.href}
                          key={quest.title}
                        >
                          <strong>{quest.status}</strong>
                          <div>
                            <h4>{quest.title}</h4>
                            <p>{quest.meta}</p>
                          </div>
                          <span>{quest.next}</span>
                          <em>{quest.action}</em>
                        </Link>
                      ))
                    ) : (
                      <p>No active Multiplayer Side Quests yet.</p>
                    )}
                  </div>
                </section>

                <section
                  className="groupquests-list-section official"
                  aria-label="Official SQC Multiplayer Side Quests"
                >
                  <div className="groupquests-list-heading">
                    <div>
                      <h3>Official SQC Multiplayer Side Quests</h3>
                      <p>Curated public SQC events you can join right away.</p>
                    </div>
                    <span className="badge gold">
                      {officialMultiplayerSideQuests.length}
                    </span>
                  </div>

                  <div className="groupquests-compact-room-list">
                    {officialMultiplayerSideQuests.length ? (
                      officialMultiplayerSideQuests.map((quest) => (
                        <Link
                          className={`groupquests-compact-room official ${quest.tone}`}
                          href={quest.href}
                          key={quest.title}
                        >
                          <strong>{quest.status}</strong>
                          <div>
                            <small className="official-sqc-badge">
                              Official SQC
                            </small>
                            <h4>{quest.title}</h4>
                            <p>{quest.meta}</p>
                          </div>
                          <span>{quest.next}</span>
                          <em>{quest.action}</em>
                        </Link>
                      ))
                    ) : (
                      <p>
                        No official SQC Multiplayer Side Quests available right
                        now.
                      </p>
                    )}
                  </div>
                </section>

                <section
                  className="groupquests-list-section"
                  aria-label="Public Multiplayer Side Quests"
                >
                  <div className="groupquests-list-heading">
                    <div>
                      <h3>Public Multiplayer Side Quests</h3>
                      <p>
                        Open public Multiplayer Side Quests anyone can inspect
                        and join.
                      </p>
                    </div>
                    <span className="badge gold">
                      {publicMultiplayerSideQuests.length}
                    </span>
                  </div>

                  <div className="groupquests-compact-room-list">
                    {publicMultiplayerSideQuests.length ? (
                      publicMultiplayerSideQuests.map((quest) => (
                        <Link
                          className={`groupquests-compact-room ${quest.tone}`}
                          href={quest.href}
                          key={quest.title}
                        >
                          <strong>{quest.status}</strong>
                          <div>
                            <h4>{quest.title}</h4>
                            <p>{quest.meta}</p>
                          </div>
                          <span>{quest.next}</span>
                          <em>{quest.action}</em>
                        </Link>
                      ))
                    ) : (
                      <p>
                        No public Multiplayer Side Quests available right now.
                      </p>
                    )}
                  </div>
                </section>

                <section
                  className="groupquests-list-section finished"
                  aria-label="My Closed Multiplayer Side Quests"
                >
                  <div className="groupquests-list-heading">
                    <div>
                      <h3>My Closed Multiplayer Side Quests</h3>
                      <p>
                        Recent completed Multiplayer Side Quests and placements.
                      </p>
                    </div>
                    <span className="badge">
                      {closedMultiplayerSideQuests.length}
                    </span>
                  </div>

                  <div className="groupquests-finished-list">
                    {closedMultiplayerSideQuests.length ? (
                      closedMultiplayerSideQuests.map((quest) => (
                        <Link
                          className="groupquests-finished-row"
                          href={quest.href}
                          key={quest.title}
                        >
                          <div>
                            <strong>{quest.title}</strong>
                            <p>{quest.meta}</p>
                          </div>
                          <span>{quest.action}</span>
                        </Link>
                      ))
                    ) : (
                      <p>No finished Multiplayer Side Quests yet.</p>
                    )}
                  </div>
                </section>
              </div>

              <div className="home-multiplayer-quests-footer">
                <Link href="/groupquests" className="button secondary">
                  All Multiplayer Side Quests
                </Link>
              </div>
            </section>
          </>
        ) : null}

        <Link
          href="/badges"
          className="hero-card home-badge-vault-card home-badge-vault-link"
          aria-label="Open the coat of arms page"
        >
          <h2>Every bad idea deserves a coat of arms.</h2>
          <p className="hero-copy">
            Side Quest Chess badges are collectible heraldic receipts: each
            shield explains the exact nonsense you survived, why it matters, and
            what your friends should mock respectfully.
          </p>
          <div
            className="home-badge-art-row"
            aria-label="Side Quest Chess coat of arms preview"
          >
            {badgePreviewChallenges.map((challenge) => (
              <span
                key={challenge.id}
                className="home-badge-art-link"
                aria-hidden="true"
              >
                <ChallengeBadge
                  challenge={challenge}
                  presentation="art"
                  earned={!isSignedIn || completedSet.has(challenge.id)}
                />
              </span>
            ))}
          </div>
        </Link>
      </div>
    </main>
  );
}

async function checkActiveSoloQuestFromHome() {
  "use server";

  const response = await runQuestAction(new Request("https://sidequestchess.local/api/mobile/quest", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action: "check" }),
  }));
  const payload = await response.json() as { ok?: boolean };

  if (!response.ok || !payload.ok) {
    redirect("/account/custom-side-quests?error=Latest%20game%20check%20failed.");
  }

  redirect("/?activeSoloChecked=1");
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="fact">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function buildHomeMultiplayerTrophies(
  groupQuests: ServerGroupQuest[],
  userId: string,
) {
  return groupQuests
    .filter(
      (quest) =>
        deriveQuestState(quest.startAt, quest.endAt).status === "Finished",
    )
    .map((quest) => {
      const ranked = [...quest.participants].sort(
        (a, b) => (b.score ?? 0) - (a.score ?? 0),
      );
      const index = ranked.findIndex(
        (participant) => participant.userId === userId,
      );
      const participant = index >= 0 ? ranked[index] : null;

      if (!participant || index > 2 || (participant.score ?? 0) <= 0)
        return null;

      const placement =
        index === 0 ? "Gold" : index === 1 ? "Silver" : "Bronze";
      const completedCount = participant.completedQuestIds?.length ?? 0;

      return {
        title: quest.name,
        meta: `${placement} podium scroll · ${completedCount}/${quest.questIds.length} quests verified`,
        href: `/groupquests/${quest.id}?accepted=1`,
        kind: "Multiplayer" as const,
        image:
          placement === "Gold"
            ? "/stamps/side_quest_chess_seal_gold_transparent.png"
            : placement === "Silver"
              ? "/stamps/side_quest_chess_seal_silver_transparent.png"
              : "/stamps/side_quest_chess_seal_bronze_transparent.png",
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
}
