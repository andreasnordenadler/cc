import type { Metadata } from "next";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import SiteNav from "@/components/site-nav";
import { getAnalyticsStore, getSupportMessages, isAdminAnalyticsViewer, type SQCSupportMessage, type SQCAnalyticsDeviceType, type SQCAnalyticsEvent } from "@/lib/analytics";
import { getStoredGroupQuests, type ServerGroupQuest } from "@/lib/groupquests";
import { getChallengeAttempts, getChallengeProgress, getChessComUsername, getLichessUsername, getPreferredRunnerName, type ChallengeAttempt, type UserMetadataRecord } from "@/lib/user-metadata";

export const metadata: Metadata = {
  title: "SQC Analytics · Side Quest Chess",
  robots: { index: false, follow: false },
};

type AnalyticsUserRow = {
  id: string;
  name: string;
  email: string;
  firstSeenAt?: string;
  lastSeenAt?: string;
  pageViews: number;
  questStarts: number;
  questCompletions: number;
  questFailures: number;
  questPending: number;
  profileSaves: number;
  completedChallengeIds: string[];
  questStats: ReturnType<typeof getAnalyticsStore>["questStats"];
  lichessUsername: string;
  chessComUsername: string;
  latestGameFetches: number;
  latestGameFetchesByProvider: {
    lichess: number;
    chessCom: number;
  };
  deviceCounts: Partial<Record<SQCAnalyticsDeviceType, number>>;
  topDeviceType: SQCAnalyticsDeviceType | "none";
  recentEvents: SQCAnalyticsEvent[];
  supportMessages: SQCSupportMessage[];
};

type QuestSummary = {
  questId: string;
  starts: number;
  completions: number;
  failures: number;
  pending: number;
};

type MultiplayerQuestRow = {
  quest: ServerGroupQuest;
  hostName: string;
  hostEmail: string;
};

export default async function AdminAnalyticsPage() {
  const authState = await auth();
  const viewer = await currentUser().catch(() => null);
  const claimEmail = getEmailFromClaims(authState.sessionClaims);
  const canView = isAdminAnalyticsViewer(viewer) || isAllowedAdminEmail(claimEmail);

  if (!canView) {
    return (
      <main className="site-shell">
        <SiteNav isSignedIn={Boolean(viewer)} active="account" />
        <div className="content-wrap">
          <section className="hero-card">
            <span className="eyebrow">SQC Analytics</span>
            <h1>Admin access needed.</h1>
            <p className="hero-copy">
              This private dashboard shows user activity and quest outcomes. Ask Sam to grant your Clerk user <code>sqcAdmin</code> access or add your email to <code>SQC_ADMIN_EMAILS</code>.
            </p>
            <Link href="/account" className="button secondary">Back to My Side Quests</Link>
          </section>
        </div>
      </main>
    );
  }

  const client = await clerkClient();
  const response = await client.users.getUserList({ limit: 100, orderBy: "-created_at" });
  const rows: AnalyticsUserRow[] = response.data.map((user) => {
    const store = getAnalyticsStore(user.privateMetadata);
    const publicMetadata = user.publicMetadata as UserMetadataRecord;
    const progress = getChallengeProgress(publicMetadata);
    const completedChallengeIds = getCompletedChallengeIds(publicMetadata, progress.completedChallengeIds);
    const latestGameFetchesByProvider = countLatestGameFetches(publicMetadata);

    return {
      id: user.id,
      name: getPreferredRunnerName(publicMetadata, {
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        emailAddress: user.primaryEmailAddress?.emailAddress,
      }) || "Unnamed user",
      email: user.primaryEmailAddress?.emailAddress ?? "No email",
      firstSeenAt: store.firstSeenAt,
      lastSeenAt: store.lastSeenAt,
      pageViews: store.pageViews ?? 0,
      questStarts: store.questStarts ?? 0,
      questCompletions: Math.max(store.questCompletions ?? 0, completedChallengeIds.length),
      questFailures: store.questFailures ?? 0,
      questPending: store.questPending ?? 0,
      profileSaves: store.profileSaves ?? 0,
      completedChallengeIds,
      questStats: store.questStats,
      lichessUsername: getLichessUsername(publicMetadata),
      chessComUsername: getChessComUsername(publicMetadata),
      latestGameFetches: latestGameFetchesByProvider.lichess + latestGameFetchesByProvider.chessCom,
      latestGameFetchesByProvider,
      deviceCounts: store.deviceCounts ?? {},
      topDeviceType: getTopDeviceType(store.deviceCounts),
      recentEvents: store.recentEvents ?? [],
      supportMessages: getSupportMessages(user.privateMetadata),
    };
  });
  const activeRows = rows.filter((row) => row.pageViews || row.questStarts || row.profileSaves || row.questCompletions || row.completedChallengeIds.length || row.recentEvents.length);
  const questSummaries = buildQuestSummaries(rows);
  const multiplayerQuestRows = response.data
    .flatMap((user): MultiplayerQuestRow[] => getStoredGroupQuests(user.privateMetadata).map((quest) => ({
      quest,
      hostName: getPreferredRunnerName((user.publicMetadata as UserMetadataRecord) ?? {}, {
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        emailAddress: user.primaryEmailAddress?.emailAddress,
      }) || quest.hostName || "Unnamed host",
      hostEmail: user.primaryEmailAddress?.emailAddress ?? "No email",
    })))
    .sort((a, b) => Date.parse(b.quest.createdAt) - Date.parse(a.quest.createdAt));
  const totalUsers = response.data.length;
  const activeUsers = activeRows.length;
  const totalPageViews = sum(activeRows, "pageViews");
  const totalQuestStarts = sum(activeRows, "questStarts");
  const totalCompletions = sum(activeRows, "questCompletions");
  const totalFailures = sum(activeRows, "questFailures");
  const deviceTotals = mergeDeviceCounts(activeRows.map((row) => row.deviceCounts));
  const recentEvents = activeRows
    .flatMap((row) => row.recentEvents.map((event) => ({ ...event, user: row.name, email: row.email })))
    .sort((a, b) => Date.parse(b.at) - Date.parse(a.at))
    .slice(0, 30);
  const supportMessages = rows
    .flatMap((row) => row.supportMessages.map((message) => ({ ...message, user: row.name, email: row.email })))
    .sort((a, b) => Date.parse(b.at) - Date.parse(a.at))
    .slice(0, 30);

  return (
    <main className="site-shell">
      <SiteNav isSignedIn={Boolean(viewer)} active="account" />
      <div className="content-wrap">
        <section className="hero-card">
          <span className="eyebrow">SQC Analytics</span>
          <h1>User activity command center.</h1>
          <p className="hero-copy">
            First-party activity tracking for launch: sign-ins, page views, profile saves, quest starts, saved completed quests, and verifier outcomes.
          </p>
        </section>

        <section className="grid lean-status-grid" aria-label="Analytics summary">
          <Fact label="Tracked users" value={`${activeUsers} / ${totalUsers}`} />
          <Fact label="Page views" value={String(totalPageViews)} />
          <Fact label="Quest starts" value={String(totalQuestStarts)} />
          <Fact label="Completed quests" value={String(totalCompletions)} />
          <Fact label="Failed checks" value={String(totalFailures)} />
          <Fact label="Multiplayer quests" value={String(multiplayerQuestRows.length)} />
        </section>

        <section className="mission-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">Device mix</span>
              <h2>Mobile vs desktop usage.</h2>
              <p>Classified from browser/device signals on tracked web events. Tablet and bot traffic are separated where possible.</p>
            </div>
          </div>
          <div className="grid lean-status-grid" aria-label="Device analytics summary">
            <Fact label="Mobile" value={String(deviceTotals.mobile ?? 0)} />
            <Fact label="Desktop / PC" value={String(deviceTotals.desktop ?? 0)} />
            <Fact label="Tablet" value={String(deviceTotals.tablet ?? 0)} />
            <Fact label="Bot / unknown" value={String((deviceTotals.bot ?? 0) + (deviceTotals.unknown ?? 0))} />
          </div>
        </section>

        <section className="mission-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">Quest signals</span>
              <h2>Popular and painful quests.</h2>
              <p>Starts show interest. Completed counts come from saved quest state; failed and pending counts are verifier checks, not unique users.</p>
            </div>
          </div>
          <div className="public-groupquests-list">
            {questSummaries.length ? questSummaries.map((quest) => (
              <div className="public-groupquest-row" key={quest.questId}>
                <div>
                  <span>{quest.questId}</span>
                  <strong>{quest.starts} starts</strong>
                  <p>{quest.completions} saved completed · {quest.failures} failed checks · {quest.pending} pending checks</p>
                </div>
              </div>
            )) : <p>No quest analytics yet.</p>}
          </div>
        </section>

        <section className="mission-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">Multiplayer Side Quests</span>
              <h2>Who created multiplayer quests?</h2>
              <p>Shows every stored Multiplayer Side Quest, including private/unlisted rooms, with creator and participant counts.</p>
            </div>
          </div>
          <div className="public-groupquests-list">
            {multiplayerQuestRows.length ? multiplayerQuestRows.map(({ quest, hostName, hostEmail }) => (
              <Link className="public-groupquest-row" href={`/groupquests/${quest.id}`} key={quest.id}>
                <div>
                  <span>{formatDate(quest.createdAt)} · {quest.inviteMode}</span>
                  <strong>{quest.name}</strong>
                  <p>Created by {hostName} · {hostEmail}</p>
                </div>
                <div className="public-groupquest-meta">
                  <small>{quest.questIds.length} quests</small>
                  <small>{quest.participants.length} participants</small>
                  <small>{quest.providerLabel}</small>
                  <small>{formatDate(quest.startAt)} → {formatDate(quest.endAt)}</small>
                </div>
              </Link>
            )) : <p>No Multiplayer Side Quests created yet.</p>}
          </div>
        </section>

        <section className="mission-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">Users</span>
              <h2>Who is using SQC?</h2>
            </div>
          </div>
          <div className="public-groupquests-list">
            {rows.length ? rows.map((row) => (
              <article className="public-groupquest-row" key={row.id}>
                <div>
                  <span>{row.email}</span>
                  <strong>{row.name}</strong>
                  <p>Last seen {formatDate(row.lastSeenAt)} · first seen {formatDate(row.firstSeenAt)}</p>
                  <p>{formatChessUsernames(row)}</p>
                </div>
                <div className="public-groupquest-meta">
                  <small>{row.pageViews} page views</small>
                  <small>{row.questStarts} starts</small>
                  <small>{row.questCompletions} completed quests / {row.questFailures} failed checks / {row.questPending} pending checks</small>
                  <small>{row.latestGameFetches} latest-game fetches</small>
                  <small>{row.latestGameFetchesByProvider.lichess} Lichess / {row.latestGameFetchesByProvider.chessCom} Chess.com</small>
                  <small>{formatDeviceLabel(row.topDeviceType)} dominant device</small>
                </div>
              </article>
            )) : <p>No users found yet.</p>}
          </div>
        </section>

        <section className="mission-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">Support inbox</span>
              <h2>Messages from the mobile profile form.</h2>
              <p>Notes submitted from Help & Support in the app, attached to the user account that sent them.</p>
            </div>
          </div>
          <div className="public-groupquests-list">
            {supportMessages.length ? supportMessages.map((message) => (
              <div className="public-groupquest-row" key={message.id}>
                <div>
                  <span>{formatDate(message.at)} · {message.user} · {message.email}</span>
                  <strong>{message.source ?? "mobile"}</strong>
                  <p>{message.message}</p>
                </div>
              </div>
            )) : <p>No support messages yet.</p>}
          </div>
        </section>

        <section className="mission-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">Recent events</span>
              <h2>Latest interaction trail.</h2>
            </div>
          </div>
          <div className="public-groupquests-list">
            {recentEvents.length ? recentEvents.map((event, index) => (
              <div className="public-groupquest-row" key={`${event.at}-${event.type}-${index}`}>
                <div>
                  <span>{formatDate(event.at)} · {event.user}</span>
                  <strong>{event.type.replaceAll("_", " ")}</strong>
                  <p>{[event.path, event.questId, event.provider, event.status, event.deviceType ? formatDeviceLabel(event.deviceType) : undefined].filter(Boolean).join(" · ") || event.email}</p>
                </div>
              </div>
            )) : <p>No events yet.</p>}
          </div>
        </section>
      </div>
    </main>
  );
}

function mergeDeviceCounts(counts: Partial<Record<SQCAnalyticsDeviceType, number>>[]) {
  return counts.reduce<Partial<Record<SQCAnalyticsDeviceType, number>>>((total, current) => {
    for (const type of ["mobile", "tablet", "desktop", "bot", "unknown"] satisfies SQCAnalyticsDeviceType[]) {
      total[type] = (total[type] ?? 0) + (current[type] ?? 0);
    }
    return total;
  }, {});
}

function getTopDeviceType(counts?: Partial<Record<SQCAnalyticsDeviceType, number>>): SQCAnalyticsDeviceType | "none" {
  const entries = Object.entries(counts ?? {}) as [SQCAnalyticsDeviceType, number][];
  const [top] = entries.filter(([, count]) => count > 0).sort((a, b) => b[1] - a[1]);
  return top?.[0] ?? "none";
}

function formatDeviceLabel(value?: SQCAnalyticsDeviceType | "none") {
  if (!value || value === "none") return "No device data";
  if (value === "desktop") return "Desktop / PC";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getEmailFromClaims(claims: unknown) {
  if (!claims || typeof claims !== "object") return "";
  const record = claims as Record<string, unknown>;
  for (const key of ["email", "email_address", "primary_email_address"]) {
    const value = record[key];
    if (typeof value === "string" && value.includes("@")) return value.toLowerCase();
  }
  return "";
}

function isAllowedAdminEmail(email: string) {
  const allowed = (process.env.SQC_ADMIN_EMAILS ?? "andreas.nordenadler@gmail.com")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
  return Boolean(email && allowed.includes(email));
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="fact">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function sum(rows: AnalyticsUserRow[], key: keyof Pick<AnalyticsUserRow, "pageViews" | "questStarts" | "questCompletions" | "questFailures">) {
  return rows.reduce((total, row) => total + row[key], 0);
}

function getCompletedChallengeIds(metadata: UserMetadataRecord, progressIds: string[]) {
  const completed = new Set(progressIds);

  for (const attempt of getChallengeAttempts(metadata)) {
    const challengeId = getAttemptChallengeId(attempt);
    if (attempt.status === "passed" && challengeId) {
      completed.add(challengeId);
    }
  }

  return [...completed];
}

function getAttemptChallengeId(attempt: ChallengeAttempt) {
  return typeof attempt.challengeId === "string"
    ? attempt.challengeId
    : typeof attempt.id === "string"
      ? attempt.id.split(":")[0]
      : undefined;
}

function countLatestGameFetches(metadata: UserMetadataRecord) {
  return getChallengeAttempts(metadata).reduce(
    (total, attempt) => {
      if (!attempt.gameId || attempt.provider === "fixture") return total;

      if (attempt.provider === "lichess") {
        total.lichess += 1;
      }

      if (attempt.provider === "chess.com") {
        total.chessCom += 1;
      }

      return total;
    },
    { lichess: 0, chessCom: 0 },
  );
}

function formatChessUsernames(row: Pick<AnalyticsUserRow, "lichessUsername" | "chessComUsername">) {
  const labels = [
    row.lichessUsername ? `Lichess: ${row.lichessUsername}` : "Lichess: not set",
    row.chessComUsername ? `Chess.com: ${row.chessComUsername}` : "Chess.com: not set",
  ];

  return labels.join(" · ");
}

function buildQuestSummaries(rows: AnalyticsUserRow[]): QuestSummary[] {
  const totals = new Map<string, QuestSummary>();

  for (const row of rows) {
    for (const [questId, stat] of Object.entries(row.questStats ?? {})) {
      const current = totals.get(questId) ?? { questId, starts: 0, completions: 0, failures: 0, pending: 0 };
      current.starts += stat.starts ?? 0;
      current.completions += stat.completions ?? 0;
      current.failures += stat.failures ?? 0;
      current.pending += stat.pending ?? 0;
      totals.set(questId, current);
    }

    for (const questId of row.completedChallengeIds) {
      const current = totals.get(questId) ?? { questId, starts: 0, completions: 0, failures: 0, pending: 0 };
      current.completions = Math.max(current.completions, 1);
      totals.set(questId, current);
    }
  }

  return [...totals.values()].sort((a, b) => b.starts + b.completions - (a.starts + a.completions));
}

function formatDate(value?: string) {
  if (!value) return "never";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Stockholm",
  }).format(new Date(value));
}
