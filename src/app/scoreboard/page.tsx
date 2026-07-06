import Link from "next/link";
import { auth, clerkClient } from "@clerk/nextjs/server";
import MultiplayerModeSwitcher from "@/components/multiplayer-mode-switcher";
import SiteNav from "@/components/site-nav";
import { listPublicGroupQuests, type ServerGroupQuest } from "@/lib/groupquests";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Official Leaderboards · Side Quest Chess",
  description: "Live and final official Side Quest Chess Multiplayer leaderboards with weekly archive links.",
};

export default async function ScoreboardPage() {
  const { userId } = await auth();
  const client = await clerkClient();
  const publicQuests = await listPublicGroupQuests(client);
  const officialQuests = publicQuests
    .filter((quest) => quest.official && isDisplayableOfficialQuest(quest))
    .sort((a, b) => Date.parse(b.startAt) - Date.parse(a.startAt));
  const currentOfficial = officialQuests.filter((quest) => getQuestStatus(quest.startAt, quest.endAt) !== "Finished").slice(0, 3);
  const finishedOfficial = officialQuests.filter((quest) => getQuestStatus(quest.startAt, quest.endAt) === "Finished");
  const latestFinished = finishedOfficial.slice(0, 3);
  const weeklyArchive = buildOfficialWeeks(finishedOfficial.slice(3));

  return (
    <main className="site-shell">
      <SiteNav isSignedIn={Boolean(userId)} active="scoreboard" />

      <div className="content-wrap leaderboard-coming-soon-page">
        <section className="hero-card leaderboard-coming-soon-hero">
          <span className="eyebrow">Official Leaderboards</span>
          <h1>Track the official SQC race.</h1>
          <p className="hero-copy">
            Three official Multiplayer Side Quests run in weekly sets. Follow the live quests, open final podium receipts, and browse the weekly archive from the SQC leaderboard hall.
          </p>
          <div className="hero-actions button-row">
            <Link className="button primary" href="/groupquests/public">Browse public Multiplayer Side Quests</Link>
            <Link className="button secondary" href="/multiplayer">Open Multiplayer Side Quests</Link>
          </div>
        </section>

        <MultiplayerModeSwitcher active="official" />

        <section className="mission-card official-scoreboard-guide" aria-label="Official leaderboard guide">
          <div className="section-head">
            <div>
              <span className="eyebrow">How the hall works</span>
              <h2>Pick a Multiplayer Side Quest, prove games, keep the receipt.</h2>
              <p>Official leaderboards use the same verifier-backed Multiplayer flow as regular SQC quests, with final rows kept open after the window closes.</p>
            </div>
          </div>
          <div className="official-scoreboard-guide-steps">
            <div>
              <strong>1. Join the open quest</strong>
              <span>Open an active official Multiplayer Side Quest before the run window ends.</span>
            </div>
            <div>
              <strong>2. Check real games</strong>
              <span>SQC reads your public Lichess or Chess.com games and records verified clears.</span>
            </div>
            <div>
              <strong>3. Review the receipt</strong>
              <span>Final podiums link back to the quest so proof trails and reward context stay inspectable.</span>
            </div>
          </div>
        </section>

        <section className="mission-card" aria-label="Current official Multiplayer leaderboards">
          <div className="section-head">
            <div>
              <span className="eyebrow">Active now</span>
              <h2>Official leaderboards currently open.</h2>
              <p>Join while a window is open, refresh real proof, and climb the leaderboard before the deadline.</p>
            </div>
            <span className="badge gold">{currentOfficial.length}</span>
          </div>
          {currentOfficial.length ? (
            <div className="official-scoreboard-list">
              {currentOfficial.map((quest) => <OfficialQuestRow key={quest.id} quest={quest} viewerUserId={userId} />)}
            </div>
          ) : (
            <div className="groupquest-empty-state" role="status">
              <p>No active official week right now. The latest official Multiplayer Side Quests are archived below; public Multiplayer Side Quests may still be open.</p>
              <Link className="button secondary" href="/groupquests/public?status=all">Check public Multiplayer Side Quests</Link>
            </div>
          )}
        </section>

        <section className="mission-card" aria-label="Previous official Multiplayer results">
          <div className="section-head">
            <div>
              <span className="eyebrow">Previous week</span>
              <h2>Latest final results.</h2>
              <p>Finished official Multiplayer Side Quests stay inspectable with final leaderboard rows and detail links.</p>
            </div>
            <span className="badge gold">{latestFinished.length}</span>
          </div>
          {latestFinished.length ? (
            <div className="official-scoreboard-list">
              {latestFinished.map((quest) => <OfficialQuestRow key={quest.id} quest={quest} viewerUserId={userId} final />)}
            </div>
          ) : (
            <div className="groupquest-empty-state" role="status">
              <p>Final results will appear here after the first official weekly set closes.</p>
            </div>
          )}
        </section>

        <section className="mission-card" aria-label="Official weekly archive">
          <div className="section-head">
            <div>
              <span className="eyebrow">Archive</span>
              <h2>Browse older official weeks.</h2>
              <p>Each archive row links back to the final Multiplayer leaderboard so proofs and podiums remain visible.</p>
            </div>
            <span className="badge gold">{weeklyArchive.length}</span>
          </div>
          {weeklyArchive.length ? (
            <div className="leaderboard-preview-grid">
              {weeklyArchive.map((week) => (
                <article className="mission-card leaderboard-blur-card" key={week.id}>
                  <h3>{week.label}</h3>
                  <p>{week.rangeLabel} · {week.quests.length} official result{week.quests.length === 1 ? "" : "s"}</p>
                  <div className="official-scoreboard-list">
                    {week.quests.map((quest) => <OfficialQuestRow key={quest.id} quest={quest} viewerUserId={userId} compact final />)}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="groupquest-empty-state" role="status">
              <p>Older weekly official sets will be listed here once they exist.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function OfficialQuestRow({ compact = false, final = false, quest, viewerUserId }: { compact?: boolean; final?: boolean; quest: ServerGroupQuest; viewerUserId?: string | null }) {
  const status = getQuestStatus(quest.startAt, quest.endAt);
  const winner = getWinner(quest);
  const players = `${quest.participants.length} player${quest.participants.length === 1 ? "" : "s"}`;
  const completedCount = quest.participants.reduce((total, participant) => total + (participant.completedQuestIds?.length ?? 0), 0);
  const viewerParticipant = viewerUserId ? quest.participants.find((participant) => participant.userId === viewerUserId) ?? null : null;
  const viewerIsHost = Boolean(viewerUserId && quest.hostUserId === viewerUserId);
  const viewerCompletedCount = viewerParticipant?.completedQuestIds?.length ?? 0;
  const viewerContext = getViewerOfficialContext({ final, status, viewerCompletedCount, viewerIsHost, viewerJoined: Boolean(viewerParticipant), viewerUserId });
  const podiumRows = getPodiumRows(quest);
  return (
    <article className="leaderboard-preview-row official-scoreboard-row">
      <div className="official-scoreboard-status">
        <strong>{final ? "Final" : status}</strong>
        <small>{winner ? "Podium ready" : "Run window"}</small>
      </div>
      <div className="official-scoreboard-main">
        <Link href={`/groupquests/${quest.id}`}>{quest.name}</Link>
        <div className="official-scoreboard-facts" aria-label={`${quest.name} leaderboard facts`}>
          <span>{players}</span>
          <span>{completedCount} verified quest{completedCount === 1 ? "" : "s"}</span>
          <span>{formatWindow(quest.startAt, quest.endAt)}</span>
        </div>
        {viewerContext ? <small>{viewerContext}</small> : null}
        {podiumRows.length ? (
          <ol className="official-scoreboard-podium" aria-label={`${quest.name} top leaderboard rows`}>
            {podiumRows.map((row) => (
              <li key={row.userId}>
                <b>{row.rankLabel}</b>
                <span>{row.leaderboardName}</span>
                <small>{row.verifiedCount} verified</small>
              </li>
            ))}
          </ol>
        ) : null}
      </div>
      <div className="official-scoreboard-next-step">
        <span>{winner ? `Winner: ${winner.leaderboardName}` : compact ? status : "Open quest"}</span>
        <Link className="button secondary compact-button" href={`/groupquests/${quest.id}`}>{final ? "View final receipt" : "Open leaderboard"}</Link>
      </div>
    </article>
  );
}

function getPodiumRows(quest: ServerGroupQuest) {
  return [...quest.participants]
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0) || Date.parse(a.lastProofAt ?? a.joinedAt) - Date.parse(b.lastProofAt ?? b.joinedAt))
    .slice(0, 3)
    .map((participant, index) => ({
      userId: participant.userId,
      rankLabel: index === 0 ? "Gold" : index === 1 ? "Silver" : "Bronze",
      leaderboardName: participant.leaderboardName,
      score: participant.score ?? 0,
      verifiedCount: participant.completedQuestIds?.length ?? 0,
    }))
    .filter((participant) => participant.score > 0 || participant.verifiedCount > 0);
}

function getViewerOfficialContext({ final, status, viewerCompletedCount, viewerIsHost, viewerJoined, viewerUserId }: { final: boolean; status: string; viewerCompletedCount: number; viewerIsHost: boolean; viewerJoined: boolean; viewerUserId?: string | null }) {
  if (!viewerUserId) return status === "Finished" ? "Sign in to compare this final quest with your account." : "Sign in to join from the detail page.";
  if (viewerIsHost) return "Hosted by you · open the detail page to manage the quest.";
  if (viewerJoined) {
    const proofCopy = `${viewerCompletedCount} verified quest${viewerCompletedCount === 1 ? "" : "s"}`;
    if (final) return `You joined · final result saved · ${proofCopy}.`;
    return `Joined by you · open to check latest proof · ${proofCopy}.`;
  }
  if (status === "Finished") return "You did not join this finished official quest.";
  return "Not joined yet · open the detail page to join.";
}

function getWinner(quest: ServerGroupQuest) {
  return [...quest.participants]
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0) || Date.parse(a.lastProofAt ?? a.joinedAt) - Date.parse(b.lastProofAt ?? b.joinedAt))
    .find((participant) => (participant.score ?? 0) > 0 || (participant.completedQuestIds?.length ?? 0) > 0) ?? null;
}

function buildOfficialWeeks(quests: ServerGroupQuest[]) {
  const weeks = new Map<string, { id: string; label: string; rangeLabel: string; quests: ServerGroupQuest[] }>();
  for (const quest of quests) {
    const start = new Date(quest.startAt);
    const weekStart = getWeekStart(start);
    const id = weekStart.toISOString().slice(0, 10);
    const weekEnd = new Date(weekStart);
    weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
    const existing = weeks.get(id) ?? {
      id,
      label: `Week of ${formatDate(weekStart)}`,
      rangeLabel: `${formatDate(weekStart)} – ${formatDate(weekEnd)}`,
      quests: [],
    };
    existing.quests.push(quest);
    weeks.set(id, existing);
  }
  return [...weeks.values()].slice(0, 8);
}

function getWeekStart(date: Date) {
  const safeDate = Number.isNaN(date.getTime()) ? new Date() : date;
  const result = new Date(Date.UTC(safeDate.getUTCFullYear(), safeDate.getUTCMonth(), safeDate.getUTCDate()));
  const day = result.getUTCDay() || 7;
  result.setUTCDate(result.getUTCDate() - day + 1);
  return result;
}

function isDisplayableOfficialQuest(quest: ServerGroupQuest) {
  const text = `${quest.name} ${quest.inviteCopy}`.toLowerCase();
  if (/(cokok|asdf|test test|lorem|dummy|prototype)/i.test(text)) return false;
  return quest.name.trim().length >= 4;
}

function getQuestStatus(startAt: string, endAt: string) {
  const now = Date.now();
  const start = Date.parse(startAt);
  const end = Date.parse(endAt);
  if (Number.isFinite(end) && now > end) return "Finished";
  if (Number.isFinite(start) && now < start) return "Starting soon";
  return "Open now";
}

function formatWindow(startAt: string, endAt: string) {
  return `${formatDate(startAt)} → ${formatDate(endAt)}`;
}

function formatDate(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return typeof value === "string" ? value : "Date pending";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", timeZone: "Europe/Stockholm" }).format(date);
}
