import { randomBytes } from "node:crypto";
import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const seedRun = "2026-06-04-realistic-community-v1";
const seedEmailDomain = "example.com";
const fakeUserCount = 50;

const officialQuestIds = [
  "finish-any-game",
  "knights-before-coffee",
  "bishop-field-trip",
  "early-king-walk",
  "pawn-only-picnic",
  "queen-never-heard-of-her",
  "no-castle-club",
  "the-blunder-gambit",
  "pawn-storm-maniac",
  "knightmare-mode",
  "rookless-rampage",
  "one-bishop-to-rule-them-all",
];

const names = [
  "Mira Fork", "Jonas Tempo", "Lena Castle", "Pavel Pin", "Nora Skewer", "Eli Blitzy", "Tara Zug", "Oskar File", "Iris Gambit", "Mateo Storm",
  "Sofia Tempo", "Felix Knight", "Ada Rook", "Theo Endgame", "Maja Tactic", "Vera Bishop", "Nils Check", "Klara Pawn", "Leo Castle", "Alba Fork",
  "Hugo Pin", "Ella Rapid", "Otto Blitz", "Freja Queen", "Maxi Mate", "Liv Puzzle", "Axel Board", "Noa Nimzo", "Saga Sicilian", "Milo London",
  "Emil Dragon", "Lina Vienna", "Aron Scotch", "Rosa Bullet", "Viggo Rapid", "June Ender", "Tilde Trap", "Isak Tempo", "Mina File", "Bo Gambit",
  "Alma Shield", "Rune Rook", "Edda Knight", "Samir Square", "Iben Mate", "Luca Check", "Nova Castle", "Malte Pawn", "Elin Fork", "Casper Clock",
];

const customTemplates: Array<[string, string, Record<string, unknown>]> = [
  ["No Queen, No Problem", "Win or draw after letting the queen disappear from the board.", { type: "pieceState", piece: "queen", owner: "my", condition: "gone", timing: { atGameEnd: true } }],
  ["Knight Tourist", "Get a knight to the edge by move 12 and survive the chaos.", { type: "pieceState", piece: "knight", owner: "my", condition: "on square", targetSquare: "a4", timing: { byMove: 12 } }],
  ["Bishop Road Trip", "Move a bishop before move 6 and finish the game.", { type: "pieceState", piece: "bishop", owner: "my", condition: "moved", timing: { byMove: 6 } }],
  ["Pawn Parade", "Push a pawn early and make the game weird.", { type: "pieceState", piece: "pawn", owner: "my", condition: "moved", timing: { byMove: 4 } }],
  ["Castle? Never Heard Of It", "Finish a game without castling.", { type: "moveSequence", sequence: "e4 e5", timing: { byMove: 2 }, negate: true }],
  ["Win The Mess", "Win any public game after accepting a strange rule.", { type: "gameResult", result: "win" }],
  ["Draw Goblin Pact", "Make peace with a draw.", { type: "gameResult", result: "draw" }],
  ["Opening Hipster", "Start with the London-ish idea d4 and Bf4.", { type: "openingSequence", raw: "d4 d5 Bf4", moves: ["d4", "d5", "Bf4"], anchor: "gameStart" }],
];

type ClerkUser = Awaited<ReturnType<Awaited<ReturnType<typeof clerkClient>>["users"]["getUserList"]>>["data"][number];
type SeedProfile = ReturnType<typeof fakeProfile>;
type CustomQuest = ReturnType<typeof makeCustomQuest>;

function isAuthorized(request: Request) {
  const token = process.env.SQC_SIGNUP_MONITOR_TOKEN;
  if (!token) return false;
  return request.headers.get("authorization") === `Bearer ${token}`;
}

function slug(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function isoDaysFromNow(days: number, hour = 12) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  d.setUTCHours(hour, 0, 0, 0);
  return d.toISOString();
}

function makeRuleConfig(block: Record<string, unknown>, logic = "all") {
  return JSON.stringify({ version: 2, logic, blocks: [block] });
}

function makeCustomQuest(userIndex: number, questIndex: number) {
  const [title, summary, block] = customTemplates[(userIndex + questIndex) % customTemplates.length];
  const now = isoDaysFromNow(-questIndex, 10 + (userIndex % 8));
  return {
    id: `seed-${slug(title)}-${String(userIndex + 1).padStart(2, "0")}-${questIndex + 1}`,
    title,
    summary,
    config: makeRuleConfig(block),
    visibility: "public",
    lifecycle: "published",
    createdAt: now,
    updatedAt: now,
    badgeImageUrl: "/badges/custom/custom-side-quest-crest.png",
    seedRun,
  };
}

function compactQuestSnapshot(quest: CustomQuest) {
  return { id: quest.id, title: quest.title, summary: quest.summary, config: quest.config, badgeImageUrl: quest.badgeImageUrl, reward: 100 };
}

function fakeProfile(index: number) {
  const name = names[index];
  const handle = `sqcseed${String(index + 1).padStart(2, "0")}`;
  return {
    index,
    name,
    firstName: name.split(" ")[0],
    lastName: name.split(" ").slice(1).join(" "),
    username: handle,
    email: `${handle}@${seedEmailDomain}`,
    lichessUsername: `${handle}_lichess`,
    chessComUsername: `${handle}Chess`,
  };
}

function makeParticipant(user: SeedProfile, offset = 0) {
  const useChessCom = (user.index + offset) % 3 === 0;
  return {
    userId: `seed-participant-${user.username}`,
    provider: useChessCom ? "chesscom" : "lichess",
    username: useChessCom ? user.chessComUsername : user.lichessUsername,
    leaderboardName: user.name,
    joinedAt: isoDaysFromNow(-((user.index + offset) % 5), 14),
    score: ((user.index + offset) % 4) * 100,
    completedQuestIds: [] as string[],
    questFinishedAt: {} as Record<string, string>,
  };
}

function makeGroupQuest(host: SeedProfile, hostUserId: string, hostCustomQuests: CustomQuest[], groupIndex: number, allProfiles: SeedProfile[]) {
  const officialA = officialQuestIds[(groupIndex * 2) % officialQuestIds.length];
  const officialB = officialQuestIds[(groupIndex * 2 + 3) % officialQuestIds.length];
  const custom = hostCustomQuests[groupIndex % Math.max(hostCustomQuests.length, 1)];
  const questIds = custom ? [officialA, custom.id, officialB] : [officialA, officialB];
  const participants = [makeParticipant(host, 0)];
  for (let i = 1; i <= 2 + (groupIndex % 3); i += 1) {
    participants.push(makeParticipant(allProfiles[(host.index + i * 3 + groupIndex) % allProfiles.length], i));
  }
  participants.forEach((participant, idx) => {
    const completed = questIds.slice(0, idx % (questIds.length + 1));
    participant.completedQuestIds = completed;
    participant.score = completed.length * 100;
    participant.questFinishedAt = Object.fromEntries(completed.map((id, n) => [id, isoDaysFromNow(-(idx + n + 1), 16)]));
  });
  return {
    id: `seed-public-${slug(host.username)}-${groupIndex + 1}`,
    hostUserId,
    hostName: host.name,
    name: ["Friday Chaos Ladder", "No Queen Club Arena", "Coffee Break Gauntlet", "Tiny Trophy Sprint", "Endgame Goblin League", "Weekend Proof Party", "Opening Oddball Cup", "Blunder Recovery Room", "Pawn Storm Social", "Castle Optional Crew"][groupIndex % 10],
    inviteCopy: "Public Multiplayer Side Quest with realistic players and mixed rules.",
    inviteMode: "public",
    questIds,
    providerMode: groupIndex % 3 === 0 ? "lichess" : groupIndex % 3 === 1 ? "chesscom" : "both",
    providerLabel: groupIndex % 3 === 0 ? "Lichess only" : groupIndex % 3 === 1 ? "Chess.com only" : "Lichess or Chess.com",
    official: false,
    customQuestSnapshots: custom ? [compactQuestSnapshot(custom)] : [],
    startAt: isoDaysFromNow(-2 - (groupIndex % 3), 8),
    endAt: isoDaysFromNow(5 + (groupIndex % 9), 23),
    rules: { timeControl: "Any time control", rated: "Any rated state", color: "Any color" },
    createdAt: isoDaysFromNow(-(groupIndex % 10), 9 + (groupIndex % 8)),
    participants,
    seedRun,
  };
}

async function fetchAllUsers(client: Awaited<ReturnType<typeof clerkClient>>) {
  const out: ClerkUser[] = [];
  let offset = 0;
  while (true) {
    const batch = await client.users.getUserList({ limit: 100, offset, orderBy: "-created_at" });
    out.push(...batch.data);
    if (batch.data.length < 100) return out;
    offset += batch.data.length;
  }
}

function publicMetaFor(profile: SeedProfile) {
  return {
    runnerDisplayName: profile.name,
    runnerBio: "Community player exploring strange Side Quest rules and public multiplayer rooms.",
    lichessUsername: profile.lichessUsername,
    chessComUsername: profile.chessComUsername,
    sqcSeedUser: true,
    sqcSeedRun: seedRun,
    challengeProgress: {
      completedChallengeIds: officialQuestIds.slice(0, profile.index % 5),
      totalCompletedChallenges: profile.index % 5,
      totalRewardPoints: (profile.index % 5) * 100,
    },
    activeChallenge: { id: officialQuestIds[profile.index % officialQuestIds.length], status: "active", startedAt: isoDaysFromNow(-1, 12) },
  };
}

function privateMetaFor(profile: SeedProfile, clerkUserId: string, allProfiles: SeedProfile[]) {
  const customCount = profile.index < 35 ? 1 + (profile.index % 3 === 0 ? 1 : 0) : 0;
  const customSideQuests = Array.from({ length: customCount }, (_, questIndex) => makeCustomQuest(profile.index, questIndex));
  const groupQuestCount = profile.index < 18 ? 1 : 0;
  const sqcGroupQuests = Array.from({ length: groupQuestCount }, (_, groupIndex) => makeGroupQuest(profile, clerkUserId, customSideQuests, profile.index + groupIndex, allProfiles));
  return { sqcSeedUser: true, sqcSeedRun: seedRun, customSideQuests, sqcGroupQuests };
}

function metadataArray(metadata: unknown, key: string) {
  if (!metadata || typeof metadata !== "object") return [] as Array<Record<string, unknown>>;
  const value = (metadata as Record<string, unknown>)[key];
  return Array.isArray(value) ? (value as Array<Record<string, unknown>>) : [];
}

function isAnd72NorUser(user: ClerkUser) {
  const pub = user.publicMetadata as Record<string, unknown>;
  const priv = user.privateMetadata as Record<string, unknown>;
  const emails = user.emailAddresses.map((entry) => entry.emailAddress.toLowerCase());
  return pub.lichessUsername === "and72nor" || pub.chessComUsername === "and72nor" || priv.lichessUsername === "and72nor" || priv.chessComUsername === "and72nor" || emails.some((email) => email.includes("andreas"));
}

function stripAndreasCustomData(user: ClerkUser) {
  const privateMetadata = { ...(user.privateMetadata as Record<string, unknown>) };
  const publicMetadata = { ...(user.publicMetadata as Record<string, unknown>) };
  const beforeCustom = metadataArray(privateMetadata, "customSideQuests").length;
  const beforePublicCustom = metadataArray(publicMetadata, "customSideQuests").length;
  const beforeGroups = metadataArray(privateMetadata, "sqcGroupQuests").length;
  const officialGroups = metadataArray(privateMetadata, "sqcGroupQuests").filter((quest) => quest.official === true || String(quest.id || "").startsWith("official-"));
  const removedIds = new Set([...metadataArray(privateMetadata, "customSideQuests"), ...metadataArray(publicMetadata, "customSideQuests")].map((quest) => String(quest.id || "")).filter(Boolean));
  privateMetadata.customSideQuests = [];
  privateMetadata.sqcGroupQuests = officialGroups;
  if (Array.isArray(publicMetadata.customSideQuests)) publicMetadata.customSideQuests = [];
  if (publicMetadata.activeChallenge && typeof publicMetadata.activeChallenge === "object" && removedIds.has(String((publicMetadata.activeChallenge as Record<string, unknown>).id || ""))) {
    delete publicMetadata.activeChallenge;
  }
  return { privateMetadata, publicMetadata, beforeCustom, beforePublicCustom, beforeGroups, afterGroups: officialGroups.length };
}

async function findOrCreateSeedUser(client: Awaited<ReturnType<typeof clerkClient>>, profile: SeedProfile, existingByEmail: Map<string, ClerkUser>) {
  const found = existingByEmail.get(profile.email.toLowerCase());
  if (found) return found;
  return client.users.createUser({
    emailAddress: [profile.email],
    password: `SQCseed-${randomBytes(12).toString("hex")}-Aa1!`,
    firstName: profile.firstName,
    lastName: profile.lastName,
    username: profile.username,
    skipPasswordChecks: true,
    skipPasswordRequirement: true,
    publicMetadata: publicMetaFor(profile),
    privateMetadata: { sqcSeedUser: true, sqcSeedRun: seedRun },
  });
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as { apply?: boolean };
  const apply = body.apply === true;
  const client = await clerkClient();
  const users = await fetchAllUsers(client);
  const existingByEmail = new Map<string, ClerkUser>();
  for (const user of users) for (const email of user.emailAddresses) existingByEmail.set(email.emailAddress.toLowerCase(), user);
  const andreasUsers = users.filter(isAnd72NorUser);
  const profiles = Array.from({ length: fakeUserCount }, (_, index) => fakeProfile(index));
  const summary = {
    ok: true,
    mode: apply ? "apply" : "dry-run",
    seedRun,
    currentUsers: users.length,
    andreasTargets: andreasUsers.map((user) => ({ id: user.id, email: user.primaryEmailAddress?.emailAddress || null, customPrivate: metadataArray(user.privateMetadata, "customSideQuests").length, customPublic: metadataArray(user.publicMetadata, "customSideQuests").length, groups: metadataArray(user.privateMetadata, "sqcGroupQuests").length })),
    fakeUsersToCreate: profiles.filter((profile) => !existingByEmail.has(profile.email.toLowerCase())).length,
    fakeUsersToUpdate: profiles.filter((profile) => existingByEmail.has(profile.email.toLowerCase())).length,
    plannedPublicCustomSoloQuests: profiles.reduce((sum, profile) => sum + (profile.index < 35 ? 1 + (profile.index % 3 === 0 ? 1 : 0) : 0), 0),
    plannedPublicMultiplayerQuests: profiles.reduce((sum, profile) => sum + (profile.index < 18 ? 1 : 0), 0),
  };
  if (!andreasUsers.length) return NextResponse.json({ ...summary, ok: false, message: "No Andreas/and72nor users found; refusing cleanup." }, { status: 409 });
  if (!apply) return NextResponse.json(summary);

  const cleanup = [];
  for (const user of andreasUsers) {
    const patch = stripAndreasCustomData(user);
    await client.users.updateUserMetadata(user.id, { publicMetadata: patch.publicMetadata, privateMetadata: patch.privateMetadata });
    cleanup.push({ id: user.id, customBefore: patch.beforeCustom + patch.beforePublicCustom, groupsBefore: patch.beforeGroups, groupsAfter: patch.afterGroups });
  }

  const seedUsers = [];
  for (const profile of profiles) {
    const user = await findOrCreateSeedUser(client, profile, existingByEmail);
    seedUsers.push({ profile, user });
    existingByEmail.set(profile.email.toLowerCase(), user);
  }
  for (const { profile, user } of seedUsers) {
    await client.users.updateUserMetadata(user.id, { publicMetadata: publicMetaFor(profile), privateMetadata: privateMetaFor(profile, user.id, profiles) });
  }

  return NextResponse.json({ ...summary, cleanup, appliedAt: new Date().toISOString(), seedUserIds: seedUsers.map(({ user }) => user.id) });
}
