import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SEED_TOKEN = "sqc-demo-seed-more-active-2026-05-28";
const playerNames = ["Mira Forkwell", "Theo Endgame", "Lina Castleborn", "Otto Tempo", "Nora Pinlord", "Felix Blunderbrook", "Ada Skewer", "Max Rookhart", "Iris Zugzwang", "Leo Gambit", "Kira Checkfile", "Sam Rankseven", "Vera Knightfall", "Noah Pawnstorm", "Elsa Matewatch"];

function addDays(date: Date, days: number) { return new Date(date.getTime() + days * 86_400_000); }
function slug(value: string) { return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""); }

function participants(id: string, short: string, questIds: string[], startAt: Date) {
  return playerNames.map((name, index) => {
    const completedQuestIds = index % 5 === 0 ? questIds.slice(0, 1) : [];
    return {
      userId: `demo-player-${slug(id)}-${String(index + 1).padStart(2, "0")}`,
      provider: index % 2 === 0 ? "lichess" : "chesscom",
      username: `demo_${slug(name).replace(/-/g, "_")}_${short}`.slice(0, 60),
      leaderboardName: name,
      joinedAt: addDays(startAt, Math.min(1, index / 24)).toISOString(),
      score: completedQuestIds.length * 100 + Math.max(0, 15 - index),
      completedQuestIds,
      questFinishedAt: Object.fromEntries(completedQuestIds.map((questId) => [questId, new Date().toISOString()])),
      lastProofSummary: completedQuestIds.length ? "1 Side Quest verified in demo data." : "Demo player joined, no verified Side Quest yet.",
      ...(completedQuestIds.length ? { lastProofAt: new Date().toISOString() } : {}),
    };
  });
}

async function getOrCreateUser(client: Awaited<ReturnType<typeof clerkClient>>, email: string, label: string) {
  const existing = await client.users.getUserList({ emailAddress: [email], limit: 1 }).catch(() => ({ data: [] }));
  if (existing.data?.[0]) return existing.data[0];
  return client.users.createUser({
    emailAddress: [email],
    firstName: "SQC Demo",
    lastName: label,
    password: `SQC-Demo-${Math.random().toString(36).slice(2)}!1a`,
    skipPasswordChecks: true,
    skipPasswordRequirement: true,
    publicMetadata: { runnerDisplayName: `SQC Demo ${label}`, lichessUsername: "and72nor", chessComUsername: "and72nor" },
  });
}

export async function POST(request: Request) {
  if (request.headers.get("x-seed-token") !== SEED_TOKEN) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  const client = await clerkClient();
  const now = new Date();
  const specs = [
    { id: "demo-active-royal-rumble", short: "active-royal", name: "Royal Rumble Demo", questIds: ["finish-any-game", "no-castle-club"], startAt: addDays(now, -0.25), endAt: addDays(now, 8), rules: { timeControl: "Rapid or classical preferred", rated: "Rated preferred", color: "Any color" } },
    { id: "demo-active-diagonal-dash", short: "active-diagonal", name: "Diagonal Dash Demo", questIds: ["bishop-field-trip", "knights-before-coffee"], startAt: addDays(now, -0.1), endAt: addDays(now, 5), rules: { timeControl: "Any time control", rated: "Rated or casual", color: "Any color" } },
  ];
  const results = [];
  for (const spec of specs) {
    const user = await getOrCreateUser(client, `sqc.demo.${spec.id}@example.com`, spec.short.toUpperCase());
    const quest = {
      id: spec.id,
      hostUserId: user.id,
      hostName: "SQC Demo Host",
      name: spec.name,
      inviteCopy: "Public demo Multiplayer Side Quest seeded so the app Browse/Create screen has more realistic active rooms to join.",
      inviteMode: "public",
      questIds: spec.questIds,
      providerMode: "both",
      providerLabel: "Lichess or Chess.com",
      official: false,
      startAt: spec.startAt.toISOString(),
      endAt: spec.endAt.toISOString(),
      rules: spec.rules,
      createdAt: now.toISOString(),
      participants: participants(spec.id, spec.short, spec.questIds, spec.startAt),
    };
    await client.users.updateUserMetadata(user.id, { privateMetadata: { ...(user.privateMetadata ?? {}), sqcDemoSeed: "public-multiplayer-side-quests-extra-active-2026-05-28", sqcDemoSeedUpdatedAt: new Date().toISOString(), sqcGroupQuests: [quest] } });
    results.push({ id: quest.id, name: quest.name, participants: quest.participants.length });
  }
  return NextResponse.json({ ok: true, seeded: results.length, results });
}
