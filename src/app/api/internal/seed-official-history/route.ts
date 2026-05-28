import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const TOKEN = "sqc-seed-official-history-2026-05-28";
const HISTORY_PREFIX = "official-history-w";
const CURRENT_OFFICIAL_IDS = new Set(["official-current-easy", "official-current-medium", "official-current-hard"]);
const DIFFICULTIES = [
  { key: "easy", label: "Easy", name: "Official Easy Sprint", questIds: ["finish-any-game"], rules: { timeControl: "Any time control", rated: "Rated or casual", color: "Any color" } },
  { key: "medium", label: "Medium", name: "Official Medium Gauntlet", questIds: ["knights-before-coffee", "bishop-field-trip"], rules: { timeControl: "Any time control", rated: "Rated preferred", color: "Any color" } },
  { key: "hard", label: "Hard", name: "Official Hard No-Castle Cup", questIds: ["no-castle-club", "one-bishop-to-rule-them-all"], rules: { timeControl: "Blitz, rapid, or classical", rated: "Rated preferred", color: "Any color" } },
];
const PLAYER_NAMES = ["Mira Forkwell", "Theo Endgame", "Lina Castleborn", "Otto Tempo", "Nora Pinlord", "Felix Blunderbrook", "Ada Skewer", "Max Rookhart", "Iris Zugzwang", "Leo Gambit", "Kira Checkfile", "Sam Rankseven", "Vera Knightfall", "Noah Pawnstorm", "Elsa Matewatch"];

function addDays(date: Date, days: number) { return new Date(date.getTime() + days * 86_400_000); }
function slug(value: string) { return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""); }
function mondayOfWeek(date: Date) {
  const weekStart = new Date(date);
  const day = weekStart.getUTCDay() || 7;
  weekStart.setUTCDate(weekStart.getUTCDate() - day + 1);
  weekStart.setUTCHours(9, 0, 0, 0);
  return weekStart;
}
function participants(id: string, questIds: string[], startAt: Date, endAt: Date) {
  return PLAYER_NAMES.map((name, index) => {
    const completedCount = Math.max(0, Math.min(questIds.length, questIds.length - Math.floor(index / 5)));
    const completedQuestIds = questIds.slice(0, completedCount);
    const questFinishedAt = Object.fromEntries(completedQuestIds.map((questId, questIndex) => [questId, addDays(startAt, 1 + questIndex + index / 36).toISOString()]));
    return {
      userId: `official-history-player-${slug(id)}-${String(index + 1).padStart(2, "0")}`,
      provider: index % 2 === 0 ? "lichess" : "chesscom",
      username: `hist_${slug(name).replace(/-/g, "_")}_${slug(id).slice(-8)}`.slice(0, 60),
      leaderboardName: name,
      joinedAt: addDays(startAt, Math.min(1, index / 24)).toISOString(),
      score: Math.max(0, (questIds.length * 10) + 15 - index * 2),
      completedQuestIds,
      questFinishedAt,
      lastProofSummary: completedCount ? `Verified ${completedCount}/${questIds.length} official Side Quest${completedCount === 1 ? "" : "s"} before the weekly deadline.` : "Joined the official leaderboard; no verified Side Quest before close.",
      lastProofAt: completedCount ? addDays(endAt, -0.5).toISOString() : undefined,
    };
  });
}
async function getOrCreateHost(client: Awaited<ReturnType<typeof clerkClient>>, id: string, label: string) {
  const email = `sqc.official.history.${id}@example.com`;
  const existing = await client.users.getUserList({ emailAddress: [email], limit: 1 }).catch(() => ({ data: [] }));
  if (existing.data?.[0]) return existing.data[0];
  return client.users.createUser({
    emailAddress: [email],
    firstName: "SQC Official",
    lastName: label,
    password: `SQC-History-${Math.random().toString(36).slice(2)}!1a`,
    skipPasswordChecks: true,
    skipPasswordRequirement: true,
    publicMetadata: { runnerDisplayName: `SQC Official ${label}`, lichessUsername: "sqc_official", chessComUsername: "sqc_official" },
  });
}
function buildWeekQuest(weekBack: number, difficulty: typeof DIFFICULTIES[number]) {
  const currentWeekStart = mondayOfWeek(new Date());
  const startAt = addDays(currentWeekStart, -7 * weekBack);
  const endAt = addDays(startAt, 6.5);
  const id = `${HISTORY_PREFIX}${weekBack}-${difficulty.key}`;
  return {
    id,
    name: `${difficulty.name} · Week ${weekBack}`,
    inviteCopy: `Final results for the official ${difficulty.label.toLowerCase()} Multiplayer Side Quest from ${weekBack === 1 ? "last week" : `${weekBack} weeks ago`}.`,
    inviteMode: "public" as const,
    questIds: difficulty.questIds,
    providerMode: "both" as const,
    providerLabel: "Lichess or Chess.com",
    official: true,
    officialLabel: `Official SQC · ${difficulty.label}`,
    startAt: startAt.toISOString(),
    endAt: endAt.toISOString(),
    createdAt: addDays(startAt, -0.5).toISOString(),
    rules: difficulty.rules,
    participants: participants(id, difficulty.questIds, startAt, endAt),
  };
}

export async function POST(request: Request) {
  if (request.headers.get("x-seed-token") !== TOKEN) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  const client = await clerkClient();
  const removed: string[] = [];
  let offset = 0;
  while (true) {
    const users = await client.users.getUserList({ limit: 100, offset, orderBy: "-created_at" });
    for (const user of users.data) {
      const quests = Array.isArray(user.privateMetadata?.sqcGroupQuests) ? user.privateMetadata.sqcGroupQuests : [];
      const filtered = quests.filter((quest) => {
        const id = String((quest as { id?: unknown }).id ?? "");
        const isOfficial = (quest as { official?: unknown }).official === true || id.startsWith("official-");
        if (id.startsWith(HISTORY_PREFIX)) { removed.push(id); return false; }
        if (isOfficial && !CURRENT_OFFICIAL_IDS.has(id) && !id.startsWith(HISTORY_PREFIX)) return true;
        return true;
      });
      if (filtered.length !== quests.length) await client.users.updateUserMetadata(user.id, { privateMetadata: { ...(user.privateMetadata ?? {}), sqcGroupQuests: filtered } });
    }
    if (users.data.length < 100) break;
    offset += users.data.length;
  }
  const created = [];
  for (let weekBack = 1; weekBack <= 5; weekBack += 1) {
    for (const difficulty of DIFFICULTIES) {
      const quest = buildWeekQuest(weekBack, difficulty);
      const host = await getOrCreateHost(client, quest.id, `${difficulty.label} Week ${weekBack}`);
      const storedQuest = { ...quest, hostUserId: host.id, hostName: "SQC Official" };
      await client.users.updateUserMetadata(host.id, { privateMetadata: { ...(host.privateMetadata ?? {}), sqcOfficialHistorySeed: "official-history-2026-05-28", sqcOfficialHistorySeedUpdatedAt: new Date().toISOString(), sqcGroupQuests: [storedQuest] } });
      created.push({ id: storedQuest.id, name: storedQuest.name, endAt: storedQuest.endAt, participants: storedQuest.participants.length });
    }
  }
  return NextResponse.json({ ok: true, removed: removed.length, created: created.length, lastWeek: created.filter((quest) => quest.id.startsWith(`${HISTORY_PREFIX}1-`)), olderWeeks: created.filter((quest) => !quest.id.startsWith(`${HISTORY_PREFIX}1-`)) });
}
