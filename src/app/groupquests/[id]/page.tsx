import Link from "next/link";
import { auth, clerkClient } from "@clerk/nextjs/server";
import GroupQuestAcceptModal from "@/components/group-quest-accept-modal";
import GroupQuestInviteCopy from "@/components/group-quest-invite-copy";
import GroupQuestLeaderboard from "@/components/group-quest-leaderboard";
import GroupQuestLeaveAction from "@/components/group-quest-leave-action";
import GroupQuestParticipantSummary from "@/components/group-quest-participant-summary";
import GroupQuestProofControls from "@/components/group-quest-proof-controls";
import GroupQuestShareButton from "@/components/group-quest-share-button";
import SiteNav from "@/components/site-nav";
import { CHALLENGES } from "@/lib/challenges";
import { findGroupQuestById, listPublicGroupQuests } from "@/lib/groupquests";
import {
  getChessComUsername,
  getLichessUsername,
  getPreferredRunnerName,
  type UserMetadataRecord,
} from "@/lib/user-metadata";

const questIds = ["knights-before-coffee", "no-castle-club", "rookless-rampage"];

const defaultInviteCopy = "A friend invited you to a chess side quest. Try to win real games while completing weird objectives, then Side Quest Chess checks the public proof and updates the competition leaderboard.";

const onboardingSteps = [
  { label: "1", title: "Accept the Side Quest", copy: "Join this Multiplayer Side Quest so your games can count for this leaderboard." },
  { label: "2", title: "Play real chess elsewhere", copy: "Use the allowed chess provider shown below. No uploads, no private passwords, just public game proof." },
  { label: "3", title: "Proof gets checked", copy: "Paste a game link or check latest games. The verifier reads the public game proof." },
  { label: "4", title: "Climb the leaderboard", copy: "Completed quests fill the progress bars and move you up before time runs out." },
];

const successCriteria = "First to complete all quests wins. If nobody finishes, highest points at the deadline wins.";

export const metadata = {
  title: "Multiplayer Side Quest · Side Quest Chess",
  description: "A participant-focused Side Quest Chess Multiplayer Side Quest page with leaderboard, proof checks, and quest badges.",
};

export default async function GroupQuestByIdPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ accepted?: string; inviteKey?: string }>;
}) {
  const { userId } = await auth();
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const inviteKey = typeof resolvedSearchParams?.inviteKey === "string" ? resolvedSearchParams.inviteKey : undefined;
  const client = await clerkClient();
  const savedRecord = await findGroupQuestById(client, id);
  const savedQuest = savedRecord?.groupQuest;
  const publicGroupQuests = savedQuest && !savedQuest.official ? await listPublicGroupQuests(client) : [];
  const signedInUser = userId ? await client.users.getUser(userId) : null;
  const signedInMetadata = (signedInUser?.publicMetadata as UserMetadataRecord | undefined) ?? {};
  const signedInLichessUsername = getLichessUsername(signedInMetadata);
  const signedInChessComUsername = getChessComUsername(signedInMetadata);
  const acceptProvider = signedInLichessUsername ? "lichess" : signedInChessComUsername ? "chesscom" : "lichess";
  const acceptUsername = acceptProvider === "lichess" ? signedInLichessUsername : signedInChessComUsername;
  const acceptLeaderboardName = signedInUser
    ? (getPreferredRunnerName(signedInMetadata, {
        firstName: signedInUser.firstName,
        lastName: signedInUser.lastName,
        username: signedInUser.username,
        emailAddress: signedInUser.primaryEmailAddress?.emailAddress,
      }) || "")
    : "";
  const canAutoAccept = Boolean(acceptUsername && acceptLeaderboardName);
  const isHost = Boolean(savedQuest && userId === savedQuest.hostUserId);
  const serverParticipant = userId ? savedQuest?.participants.find((participant) => participant.userId === userId) : undefined;
  const activeQuestIds = savedQuest?.questIds.length ? savedQuest.questIds : questIds;
  const hasServerParticipant = Boolean(serverParticipant);
  const hasAcceptedInvite = hasServerParticipant;
  const questName = savedQuest?.name ?? "No Castle Night";
  const inviteCopy = savedQuest?.inviteCopy ?? defaultInviteCopy;
  const startsAt = savedQuest?.startAt ?? new Date().toISOString();
  const endsAt = savedQuest?.endAt ?? new Date().toISOString();
  const startsAtLabel = formatDateTime(startsAt);
  const endsAtLabel = formatDateTime(endsAt);
  const visibilityLabel = savedQuest?.inviteMode === "private-key" ? "Private invite" : savedQuest?.inviteMode === "unlisted-link" ? "Unlisted link" : "Public listing";
  const providerLabel = savedQuest?.providerLabel ?? "Lichess or Chess.com";
  const officialLabel = savedQuest?.officialLabel ?? "Official SQC Multiplayer Side Quest";
  const groupQuestSealSrc = savedQuest?.official ? "/stamps/SQCBLACK%20SEAL.png" : "/stamps/sqc-multiplayer-seal.png";
  const groupQuestSealAlt = savedQuest?.official ? "Official SQC Multiplayer Side Quest seal" : "Multiplayer Side Quest seal";
  const hostPrivateInviteKey = isHost && savedQuest?.inviteMode === "private-key" ? savedQuest.inviteKey : undefined;
  const shareUrl = hostPrivateInviteKey
    ? `https://sidequestchess.com/groupquests/${id}?inviteKey=${encodeURIComponent(hostPrivateInviteKey)}`
    : `https://sidequestchess.com/groupquests/${id}`;
  const customSnapshotsById = new Map((savedQuest?.customQuestSnapshots ?? []).map((snapshot) => [snapshot.id, snapshot]));
  const quests = activeQuestIds
    .map((questId) => {
      const challenge = CHALLENGES.find((entry) => entry.id === questId);
      if (challenge) {
        return {
          id: challenge.id,
          title: challenge.title,
          summary: challenge.objective,
          reward: challenge.reward,
          href: `/challenges/${challenge.id}`,
          badgeImage: challenge.badgeIdentity.image,
          badgeName: challenge.badgeIdentity.name,
          source: "official" as const,
        };
      }

      const snapshot = customSnapshotsById.get(questId);
      if (!snapshot) return null;
      return {
        id: snapshot.id,
        title: snapshot.title,
        summary: snapshot.summary || "Saved Custom Solo Side Quest snapshot.",
        reward: snapshot.reward ?? 100,
        href: null,
        badgeImage: snapshot.badgeImageUrl ?? "/assets/custom-side-quests/custom-side-quest-crest.png",
        badgeName: "Custom Solo Side Quest crest",
        source: "custom" as const,
      };
    })
    .filter((quest): quest is NonNullable<typeof quest> => Boolean(quest));
  const totalReward = quests.reduce((sum, quest) => sum + quest.reward, 0);
  const rankedParticipants = savedQuest?.participants
    ? [...savedQuest.participants].sort((a, b) => {
        const scoreDiff = (b.score ?? 0) - (a.score ?? 0);
        if (scoreDiff !== 0) return scoreDiff;
        const completedDiff = (b.completedQuestIds?.length ?? 0) - (a.completedQuestIds?.length ?? 0);
        if (completedDiff !== 0) return completedDiff;
        return Date.parse(a.joinedAt) - Date.parse(b.joinedAt);
      })
    : [];
  const participantCount = rankedParticipants.length;
  const currentParticipantRank = serverParticipant ? rankedParticipants.findIndex((participant) => participant.userId === userId) + 1 : null;
  const hostKey = savedQuest ? getHostKey(savedQuest.hostName) : "sqc-host";
  const moreByHost = savedQuest && !savedQuest.official
    ? publicGroupQuests
      .filter((quest) => quest.id !== id && !quest.official && getHostKey(quest.hostName) === hostKey)
      .slice(0, 3)
    : [];
  const reportHref = `/support?topic=community-multiplayer&quest=${encodeURIComponent(id)}${savedQuest?.hostName ? `&host=${encodeURIComponent(savedQuest.hostName)}` : ""}`;

  if (!hasAcceptedInvite) {
    return (
      <main className="site-shell groupquests-page groupquest-participant-page groupquest-invite-onboarding-page">
        <SiteNav isSignedIn={Boolean(userId)} active="groupquests" />

        <div className="content-wrap">
          <section className="hero-card groupquests-hero groupquest-competition-hero groupquest-invite-hero">
            <div className="groupquest-hero-copy">
              <span className="eyebrow">You were invited · Multiplayer Side Quest # {id}</span>
              {savedQuest?.official ? <span className="badge gold official-sqc-badge">{officialLabel}</span> : null}
              <h1>{questName}</h1>
              <GroupQuestInviteCopy id={id} fallback={inviteCopy} />
              <div className="hero-actions button-row">
                <GroupQuestAcceptModal
                  id={id}
                  questName={questName}
                  isSignedIn={Boolean(userId)}
                  defaultProvider={acceptProvider}
                  defaultUsername={acceptUsername}
                  defaultLeaderboardName={acceptLeaderboardName}
                  canAutoJoin={canAutoAccept}
                  inviteKey={inviteKey}
                />
                <Link className="button secondary" href="#how-it-works">How it works</Link>
              </div>
              <GroupQuestShareButton questName={questName} shareUrl={shareUrl} buttonLabel="Share quest" />
              {hostPrivateInviteKey ? <p className="microcopy">Private host code: <strong>{hostPrivateInviteKey}</strong>. The copied invite link includes this code.</p> : null}
              {!savedQuest?.official ? <Link className="button ghost" href={reportHref}>Report Side Quest</Link> : null}
              {isHost ? <Link className="button secondary" href={`/groupquests/${id}/edit`}>Edit quest</Link> : null}
            </div>
            <div className="groupquest-seal-card" aria-label="Multiplayer Side Quest invitation summary">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="groupquest-seal" src={groupQuestSealSrc} alt={groupQuestSealAlt} />
              <ul className="groupquest-summary-list" aria-label="Competition summary">
                <li><span>Starts</span><strong>{startsAtLabel}</strong></li>
                <li><span>Ends</span><strong>{endsAtLabel}</strong></li>
                <li><span>Players</span><strong>{savedQuest?.participants.length ?? 0} participating</strong></li>
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
                    <GroupQuestAcceptModal
                      id={id}
                      questName={questName}
                      isSignedIn={Boolean(userId)}
                      defaultProvider={acceptProvider}
                      defaultUsername={acceptUsername}
                      defaultLeaderboardName={acceptLeaderboardName}
                      canAutoJoin={canAutoAccept}
                      inviteKey={inviteKey}
                      buttonClassName="groupquest-onboarding-step primary-step groupquest-onboarding-step-button"
                      key={step.title}
                    >
                      {content}
                    </GroupQuestAcceptModal>
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
                {quests.map((quest) => {
                  const content = (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={quest.badgeImage} alt="" />
                      <div>
                        <strong>{quest.title}</strong>
                        <span>{quest.source === "custom" ? "Custom Solo snapshot · rule details stay safely summarized here" : "View full quest"}</span>
                      </div>
                    </>
                  );

                  return quest.href ? (
                    <Link className="groupquest-badge-row" href={quest.href} key={quest.id}>{content}</Link>
                  ) : (
                    <div className="groupquest-badge-row" key={quest.id}>{content}</div>
                  );
                })}
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
              <div className="groupquest-empty-state" role="status">
                <p>{participantCount === 0 ? "No players have joined yet." : `${participantCount} player${participantCount === 1 ? " has" : "s have"} joined so far.`}</p>
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
                <li><span>Starts</span><strong>{startsAtLabel}</strong></li>
                <li><span>Ends</span><strong>{endsAtLabel}</strong></li>
                <li><span>Variant</span><strong>Standard chess only</strong></li>
                <li><span>Proof</span><strong>Fresh public games inside this window</strong></li>
                <li><span>Winner</span><strong>{successCriteria}</strong></li>
              </ul>
            </article>
          </section>

          <section className="mission-card groupquest-accept-card" aria-label="Accept this Side Quest">
            <div>
              <span className="eyebrow">Ready?</span>
              <h2>Accept this Side Quest.</h2>
              <p>After accepting, you will reach the live competition page with proof checks, leaderboard progress, activity, and share tools.</p>
            </div>
            <GroupQuestAcceptModal
              id={id}
              questName={questName}
              isSignedIn={Boolean(userId)}
              defaultProvider={acceptProvider}
              defaultUsername={acceptUsername}
              defaultLeaderboardName={acceptLeaderboardName}
              canAutoJoin={canAutoAccept}
              inviteKey={inviteKey}
            />
          </section>

          {savedQuest && !savedQuest.official ? <HostContextCard hostName={savedQuest.hostName} hostKey={hostKey} moreByHost={moreByHost} reportHref={reportHref} /> : null}
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
              {savedQuest?.official ? <span className="eyebrow official-sqc-badge">{officialLabel}</span> : null}
              <span className="eyebrow groupquest-date-pill">{startsAtLabel} → {endsAtLabel}</span>
            </div>
            <h1>{questName}</h1>
            <p className="hero-copy">
              Side Quests. One leaderboard. First to finish all quests wins; if nobody finishes, highest points at the deadline wins.
            </p>
            <GroupQuestShareButton questName={questName} shareUrl={shareUrl} buttonLabel="Share quest" />
            {hostPrivateInviteKey ? <p className="microcopy">Private host code: <strong>{hostPrivateInviteKey}</strong>. The copied invite link includes this code.</p> : null}
            {!savedQuest?.official ? <Link className="button ghost" href={reportHref}>Report Side Quest</Link> : null}
            {isHost ? <Link className="button secondary" href={`/groupquests/${id}/edit`}>Edit quest</Link> : null}

          </div>
          <div className="groupquest-seal-card" aria-label="Multiplayer Side Quest trophy summary">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="groupquest-seal" src={groupQuestSealSrc} alt={groupQuestSealAlt} />
            <strong>{totalReward.toLocaleString()} pts</strong>
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

        <GroupQuestProofControls
          id={id}
          quests={quests.map((quest) => ({ id: quest.id, title: quest.title, reward: quest.reward }))}
          initialState={{
            score: serverParticipant?.score ?? 0,
            completedQuestIds: serverParticipant?.completedQuestIds ?? [],
            lastProofSummary: serverParticipant?.lastProofSummary,
            lastProofAt: serverParticipant?.lastProofAt,
          }}
        />

        <section className="groupquest-score-strip" aria-label="Your competition standing">
          <div>
            <strong>{currentParticipantRank ? `#${currentParticipantRank}` : "—"}</strong>
            <span>Your rank</span>
          </div>
          <div>
            <strong>{serverParticipant?.score ?? 0}</strong>
            <span>Your points</span>
          </div>
          <div>
            <strong>{serverParticipant?.completedQuestIds?.length ?? 0} / {quests.length}</strong>
            <span>Verified Side Quests</span>
          </div>
          <div>
            <strong>{participantCount}</strong>
            <span>{participantCount === 1 ? "Participant" : "Participants"}</span>
          </div>
        </section>

        <section className="mission-card groupquest-top-quest-stack" aria-label="Quests to complete">
          <div className="section-head compact">
            <div>
              <span className="eyebrow">Quests to complete</span>
              <h2>Finish these {quests.length} Side Quests to win.</h2>
            </div>
            <span className="badge gold">{quests.length} Side Quests</span>
          </div>
          <div className="groupquest-top-quest-list">
            {quests.map((quest) => {
              const content = (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={quest.badgeImage} alt="" />
                  <span>
                    <strong>{quest.title}</strong>
                    {quest.source === "custom" ? <small>Custom Solo snapshot · {quest.reward} pts</small> : null}
                  </span>
                </>
              );

              return quest.href ? (
                <Link className="groupquest-top-quest-row" href={quest.href} key={quest.id}>{content}</Link>
              ) : (
                <div className="groupquest-top-quest-row" key={quest.id}>{content}</div>
              );
            })}
          </div>
        </section>


        <GroupQuestLeaderboard
          id={id}
          quests={quests.map((quest) => ({
            id: quest.id,
            title: quest.title,
            badgeImage: quest.badgeImage,
            badgeName: quest.badgeName,
          }))}
          participants={savedQuest?.participants}
          currentUserId={userId}
          canManageParticipants={isHost}
        />

        <section className="mission-card groupquests-live-card" aria-label="Rules">
          <div className="section-head">
            <div>
              <span className="eyebrow">Competition rules</span>
              <h2>Everyone plays under the same receipt.</h2>
              <p>Automatic checks enforce the quest objective, public provider, and event window. Extra host settings are shown for clarity while verifier coverage expands.</p>
            </div>
          </div>
          <ul className="groupquest-summary-list groupquest-rules-list groupquest-accepted-rules-list" aria-label="Multiplayer Side Quest settings">
            <li><span>Visibility</span><strong>{visibilityLabel}</strong></li>
            <li><span>Games allowed</span><strong>{providerLabel}</strong></li>
            <li><span>Variant</span><strong>Standard chess only</strong></li>
            <li><span>Starts</span><strong>{startsAtLabel}</strong></li>
            <li><span>Ends</span><strong>{endsAtLabel}</strong></li>
            <li><span>Winner</span><strong>{successCriteria}</strong></li>
            <li><span>Proof</span><strong>Automatic checks for quest, provider, and window</strong></li>
          </ul>
        </section>

        {savedQuest && !savedQuest.official ? <HostContextCard hostName={savedQuest.hostName} hostKey={hostKey} moreByHost={moreByHost} reportHref={reportHref} /> : null}

        <GroupQuestLeaveAction id={id} />
      </div>
    </main>
  );
}

function HostContextCard({
  hostKey,
  hostName,
  moreByHost,
  reportHref,
}: {
  hostKey: string;
  hostName: string;
  moreByHost: Awaited<ReturnType<typeof listPublicGroupQuests>>;
  reportHref: string;
}) {
  return (
    <section className="mission-card groupquests-host-panel" aria-label="Community Multiplayer host context">
      <span className="eyebrow">Host context</span>
      <h2>Hosted by {hostName}.</h2>
      <p>
        Open a public host shelf to browse other Community Multiplayer Side Quests from this host. Private invite-only tables, participant emails, and account details stay hidden.
      </p>
      <div className="button-row">
        <Link className="button secondary" href={`/groupquests/public?host=${encodeURIComponent(hostKey)}`}>More by host</Link>
        <Link className="button ghost" href={reportHref}>Report Side Quest</Link>
      </div>
      {moreByHost.length ? (
        <div className="groupquests-host-control-list" aria-label={`More public Multiplayer Side Quests by ${hostName}`}>
          {moreByHost.map((quest) => (
            <div key={quest.id}>
              <strong><Link href={`/groupquests/${quest.id}`}>{quest.name}</Link></strong>
              <p>{quest.inviteCopy}</p>
            </div>
          ))}
        </div>
      ) : <p>No other public tables by this host are visible right now.</p>}
    </section>
  );
}

function getHostKey(hostName: string) {
  return hostName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "sqc-host";
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
