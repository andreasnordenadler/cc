import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const TOKEN = "sqc-normalize-official-groupquests-2026-05-28";
const OFFICIAL_IDS = new Set(["official-current-easy", "official-current-medium", "official-current-hard"]);
const playerNames = ["Mira Forkwell", "Theo Endgame", "Lina Castleborn", "Otto Tempo", "Nora Pinlord", "Felix Blunderbrook", "Ada Skewer", "Max Rookhart", "Iris Zugzwang", "Leo Gambit", "Kira Checkfile", "Sam Rankseven", "Vera Knightfall", "Noah Pawnstorm", "Elsa Matewatch"];

function addDays(date: Date, days: number) { return new Date(date.getTime() + days * 86_400_000); }
function slug(value: string) { return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""); }
function participants(id: string, short: string, questIds: string[], startAt: Date, userIdToInclude?: string | null) {
  const rows = playerNames.map((name, index) => ({
    userId: `official-demo-player-${slug(id)}-${String(index + 1).padStart(2, "0")}`,
    provider: index % 2 === 0 ? "lichess" : "chesscom",
    username: `official_${slug(name).replace(/-/g, "_")}_${short}`.slice(0, 60),
    leaderboardName: name,
    joinedAt: addDays(startAt, Math.min(1, index / 24)).toISOString(),
    score: Math.max(0, 15 - index),
    completedQuestIds: [] as string[],
    questFinishedAt: {},
    lastProofSummary: "Official demo player joined, no verified Side Quest yet.",
  }));
  if (userIdToInclude) {
    rows[0] = { ...rows[0], userId: userIdToInclude, username: "and72nor", leaderboardName: "Andreas", score: 0, lastProofSummary: "Joined this Official Multiplayer Side Quest." };
  }
  return rows;
}

async function getOrCreateUser(client: Awaited<ReturnType<typeof clerkClient>>, email: string, label: string) {
  const existing = await client.users.getUserList({ emailAddress: [email], limit: 1 }).catch(() => ({ data: [] }));
  if (existing.data?.[0]) return existing.data[0];
  return client.users.createUser({
    emailAddress: [email],
    firstName: "SQC Official",
    lastName: label,
    password: `SQC-Official-${Math.random().toString(36).slice(2)}!1a`,
    skipPasswordChecks: true,
    skipPasswordRequirement: true,
    publicMetadata: { runnerDisplayName: `SQC Official ${label}`, lichessUsername: "and72nor", chessComUsername: "and72nor" },
  });
}

export async function POST(request: Request) {
  if (request.headers.get("x-seed-token") !== TOKEN) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  const client = await clerkClient();
  const body = await request.json().catch(() => ({})) as { includeUserId?: string };
  const now = new Date();
  const removed: string[] = [];
  let offset = 0;
  while (true) {
    const users = await client.users.getUserList({ limit: 100, offset, orderBy: "-created_at" });
    for (const user of users.data) {
      const quests = Array.isArray(user.privateMetadata?.sqcGroupQuests) ? user.privateMetadata.sqcGroupQuests : [];
      const filtered = quests.filter((quest) => {
        const record = quest as { id?: unknown; official?: unknown };
        const id = String(record.id ?? "");
        const isOfficial = record.official === true || id.startsWith("official-");
        if (isOfficial && !OFFICIAL_IDS.has(id)) {
          removed.push(id);
          return false;
        }
        return true;
      });
      if (filtered.length !== quests.length) {
        await client.users.updateUserMetadata(user.id, { privateMetadata: { ...(user.privateMetadata ?? {}), sqcGroupQuests: filtered } });
      }
    }
    if (users.data.length < 100) break;
    offset += users.data.length;
  }

  const specs = [
    { id: "official-current-easy", short: "easy", label: "Easy", name: "Official Easy Sprint", questIds: ["finish-any-game"], endDays: 7, rules: { timeControl: "Any time control", rated: "Rated or casual", color: "Any color" } },
    { id: "official-current-medium", short: "medium", label: "Medium", name: "Official Medium Gauntlet", questIds: ["knights-before-coffee", "bishop-field-trip"], endDays: 7, rules: { timeControl: "Any time control", rated: "Rated preferred", color: "Any color" } },
    { id: "official-current-hard", short: "hard", label: "Hard", name: "Official Hard No-Castle Cup", questIds: ["no-castle-club", "one-bishop-to-rule-them-all"], endDays: 7, rules: { timeControl: "Blitz, rapid, or classical", rated: "Rated preferred", color: "Any color" } },
  ];
  const results = [];
  for (const spec of specs) {
    const host = await getOrCreateUser(client, `sqc.official.${spec.id}@example.com`, spec.label);
    const startAt = addDays(now, -0.25);
    const quest = {
      id: spec.id,
      hostUserId: host.id,
      hostName: "SQC Official",
      name: spec.name,
      inviteCopy: `Official ${spec.label.toLowerCase()} Multiplayer Side Quest. One of the three current SQC official public rooms.`,
      inviteMode: "public",
      questIds: spec.questIds,
      providerMode: "both",
      providerLabel: "Lichess or Chess.com",
      official: true,
      officialLabel: `Official SQC · ${spec.label}`,
      startAt: startAt.toISOString(),
      endAt: addDays(now, spec.endDays).toISOString(),
      rules: spec.rules,
      createdAt: now.toISOString(),
      participants: participants(spec.id, spec.short, spec.questIds, startAt, body.includeUserId),
    };
    await client.users.updateUserMetadata(host.id, { privateMetadata: { ...(host.privateMetadata ?? {}), sqcOfficialSeed: "current-three-official-groupquests-2026-05-28", sqcOfficialSeedUpdatedAt: new Date().toISOString(), sqcGroupQuests: [quest] } });
    results.push({ id: quest.id, name: quest.name, participants: quest.participants.length });
  }
  return NextResponse.json({ ok: true, officialActive: results.length, removed, results });
}
