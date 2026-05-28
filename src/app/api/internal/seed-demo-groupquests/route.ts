import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SEED_TOKEN = "sqc-demo-seed-2026-05-28-graphite-lobster";

const QUESTS = {
  easy: ["finish-any-game"],
  medium: ["knights-before-coffee", "bishop-field-trip"],
  hard: ["no-castle-club", "one-bishop-to-rule-them-all"],
} as const;

const playerNames = [
  "Mira Forkwell", "Theo Endgame", "Lina Castleborn", "Otto Tempo", "Nora Pinlord",
  "Felix Blunderbrook", "Ada Skewer", "Max Rookhart", "Iris Zugzwang", "Leo Gambit",
  "Kira Checkfile", "Sam Rankseven", "Vera Knightfall", "Noah Pawnstorm", "Elsa Matewatch",
];

type Difficulty = keyof typeof QUESTS;

type Spec = {
  short: string;
  id: string;
  name: string;
  difficulty: Difficulty;
  questIds: readonly string[];
  startAt: Date;
  endAt: Date;
  createdAt: Date;
  active: boolean;
};

function iso(date: Date) { return date.toISOString(); }
function addDays(date: Date, days: number) { return new Date(date.getTime() + days * 86_400_000); }
function slug(value: string) { return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""); }

function participants(questIds: readonly string[], seed: Spec, finished: boolean) {
  return playerNames.map((name, index) => {
    const completedCount = finished ? Math.max(0, Math.min(questIds.length, questIds.length - (index % 3))) : index % 4 === 0 ? 1 : 0;
    const completedQuestIds = questIds.slice(0, completedCount);
    const joinedAt = addDays(seed.startAt, Math.min(1, index / 24));
    const finishedAt = addDays(seed.endAt, -Math.max(0.2, (15 - index) / 24));
    return {
      userId: `demo-player-${slug(seed.id)}-${String(index + 1).padStart(2, "0")}`,
      provider: index % 2 === 0 ? "lichess" : "chesscom",
      username: `demo_${slug(name).replace(/-/g, "_")}_${seed.short}`.slice(0, 60),
      leaderboardName: name,
      joinedAt: iso(joinedAt),
      score: completedQuestIds.length * 100 + Math.max(0, 15 - index) * (finished ? 3 : 1),
      completedQuestIds,
      questFinishedAt: Object.fromEntries(completedQuestIds.map((questId, offset) => [questId, iso(addDays(finishedAt, -offset / 24))])),
      lastProofSummary: completedQuestIds.length ? `${completedQuestIds.length} Side Quest${completedQuestIds.length === 1 ? "" : "s"} verified in demo data.` : "Demo player joined, no verified Side Quest yet.",
      ...(completedQuestIds.length ? { lastProofAt: iso(finishedAt) } : {}),
    };
  });
}

function specs() {
  const now = new Date();
  const items: Spec[] = [
    { short: "active-easy", id: "demo-active-opening-sprint", name: "Opening Sprint Demo", difficulty: "easy", questIds: QUESTS.easy, startAt: addDays(now, -1), endAt: addDays(now, 6), createdAt: addDays(now, -1), active: true },
    { short: "active-hard", id: "demo-active-chaos-cup", name: "Chaos Cup Demo", difficulty: "hard", questIds: QUESTS.hard, startAt: addDays(now, -0.5), endAt: addDays(now, 10), createdAt: addDays(now, -0.5), active: true },
  ];
  const labels: Array<[Difficulty, string]> = [["easy", "Easy Week"], ["medium", "Medium Week"], ["hard", "Hard Week"]];
  for (let week = 1; week <= 4; week += 1) {
    for (const [difficulty, label] of labels) {
      const weekStart = addDays(now, -(week * 7 + 5));
      const offset = difficulty === "easy" ? 0 : difficulty === "medium" ? 1 : 2;
      const startAt = addDays(weekStart, offset);
      const endAt = addDays(startAt, 3);
      items.push({
        short: `w${week}-${difficulty}`,
        id: `demo-history-w${week}-${difficulty}`,
        name: `${label} ${week} Demo Results`,
        difficulty,
        questIds: QUESTS[difficulty],
        startAt,
        endAt,
        createdAt: addDays(endAt, 0.15),
        active: false,
      });
    }
  }
  return items;
}

async function getOrCreateUser(client: Awaited<ReturnType<typeof clerkClient>>, email: string, firstName: string, lastName: string) {
  const existing = await client.users.getUserList({ emailAddress: [email], limit: 1 }).catch(() => ({ data: [] }));
  if (existing.data?.[0]) return existing.data[0];
  return client.users.createUser({
    emailAddress: [email],
    firstName,
    lastName,
    password: `SQC-Demo-${Math.random().toString(36).slice(2)}!1a`,
    skipPasswordChecks: true,
    skipPasswordRequirement: true,
    publicMetadata: { runnerDisplayName: `${firstName} ${lastName}`, lichessUsername: "and72nor", chessComUsername: "and72nor" },
  });
}

export async function POST(request: Request) {
  if (request.headers.get("x-seed-token") !== SEED_TOKEN) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }
  const client = await clerkClient();
  const results = [];
  for (const spec of specs()) {
    const email = `sqc.demo.${spec.id}@example.com`;
    const user = await getOrCreateUser(client, email, "SQC Demo", spec.short.toUpperCase());
    const quest = {
      id: spec.id,
      hostUserId: user.id,
      hostName: "SQC Demo Host",
      name: spec.name,
      inviteCopy: spec.active
        ? "Public demo Multiplayer Side Quest seeded so the app Browse/Create screen has realistic active rooms to join."
        : "Historical public demo Multiplayer Side Quest seeded so final results and archive rows have realistic data.",
      inviteMode: "public",
      questIds: spec.questIds,
      providerMode: "both",
      providerLabel: "Lichess or Chess.com",
      official: false,
      startAt: iso(spec.startAt),
      endAt: iso(spec.endAt),
      rules: {
        timeControl: spec.difficulty === "hard" ? "Blitz, rapid, or classical" : "Any time control",
        rated: spec.difficulty === "easy" ? "Rated or casual" : "Rated preferred",
        color: "Any color",
      },
      createdAt: iso(spec.createdAt),
      participants: participants(spec.questIds, spec, !spec.active),
    };
    await client.users.updateUserMetadata(user.id, {
      privateMetadata: {
        ...(user.privateMetadata ?? {}),
        sqcDemoSeed: "public-multiplayer-side-quests-2026-05-28",
        sqcDemoSeedUpdatedAt: new Date().toISOString(),
        sqcGroupQuests: [quest],
      },
    });
    results.push({ id: quest.id, name: quest.name, active: spec.active, participants: quest.participants.length });
  }
  return NextResponse.json({ ok: true, seeded: results.length, active: results.filter((result) => result.active).length, historical: results.filter((result) => !result.active).length, results });
}
