import assert from "node:assert/strict";
import test from "node:test";
import * as webRoute from "../src/app/api/groupquests/[id]/join/route";
import * as mobileRoute from "../src/app/api/mobile/groupquests/[id]/route";
Object.defineProperty(process.env, "NODE_ENV", { value: "test", writable: true, configurable: true, enumerable: true });
import { joinGroupQuest, upsertHostGroupQuest, type ServerGroupQuest, type GroupQuestParticipant } from "../src/lib/groupquests";

function participant(index: number): GroupQuestParticipant {
  return { userId: `player-${index}`, provider: "lichess", username: `Player${index}`, leaderboardName: `Player ${index}`, joinedAt: "2026-07-01T00:00:00.000Z", score: 100, completedQuestIds: ["finish-any-game"], questFinishedAt: { "finish-any-game": "2026-07-02T00:00:00.000Z" } };
}
function quest(count: number): ServerGroupQuest {
  return { id: "capacity-quest", hostUserId: "host", hostName: "Host", name: "Capacity quest", inviteCopy: "Join", inviteMode: "public", providerMode: "both", providerLabel: "Either", questIds: ["finish-any-game"], startAt: "2026-07-01T00:00:00.000Z", endAt: "2099-07-20T00:00:00.000Z", createdAt: "2026-07-01T00:00:00.000Z", rules: {}, participants: Array.from({ length: count }, (_, i) => participant(i)) };
}

test("full hosted quest rejects admission without evicting an existing completed player", () => {
  const full = quest(80);
  const before = structuredClone(full);
  assert.throws(() => joinGroupQuest(full, participant(80)), { message: "groupquest_full" });
  assert.deepEqual(full, before);
});

test("rejoining a legacy oversized quest preserves every other member and progress through storage", () => {
  const legacy = quest(81);
  const joined = joinGroupQuest(legacy, { ...participant(0), score: 0, completedQuestIds: [], questFinishedAt: {} });
  assert.equal(joined.participants.length, 81);
  assert.deepEqual(JSON.parse(JSON.stringify(joined.participants)), legacy.participants);
  const stored = upsertHostGroupQuest({}, joined)[0];
  assert.equal(stored.participants.length, 81);
  assert.deepEqual(stored.participants.map((p) => p.userId), legacy.participants.map((p) => p.userId));
  assert.equal(stored.participants[80].score, 100);
});

test("official participant-local admission is not constrained by the hosted metadata cap", () => {
  const official = { ...quest(80), hostUserId: "official-sqc", official: true };
  const joined = joinGroupQuest(official, participant(80));
  assert.equal(joined.participants.length, 81);
  assert.equal(joined.participants.at(-1)?.userId, "player-79");
});

test("last hosted slot, duplicate admission and leave/rejoin preserve all earned progress", () => {
  const initial = quest(79);
  const admitted = joinGroupQuest(initial, participant(79));
  assert.equal(admitted.participants.length, 80);
  const duplicate = joinGroupQuest(admitted, { ...participant(79), score: 0, completedQuestIds: [], questFinishedAt: {} });
  assert.deepEqual(duplicate, admitted);
  const left = { ...duplicate, participants: duplicate.participants.filter((p) => p.userId !== "player-79") };
  assert.equal(joinGroupQuest(left, participant(79)).participants.length, 80);
  assert.throws(() => joinGroupQuest(quest(81), participant(90)), /groupquest_full/);
});

test("web exported join dependencies remain isolated across overlapping requests", async () => {
  let unblock!: () => void;
  let started!: () => void;
  const waiting = new Promise<void>((resolve) => { unblock = resolve; });
  const entered = new Promise<void>((resolve) => { started = resolve; });
  const saved: string[] = [];
  const run = (id: string, blocked: boolean) => webRoute.withWebJoinRouteTestDependencies({
    getAuthenticatedUserId: async () => { if (blocked) { started(); await waiting; } return id; },
    findQuestById: async (questId) => ({ userId: "host", groupQuest: { ...quest(0), id: questId } }),
    getUser: async (userId) => ({ id: userId, firstName: userId, publicMetadata: { lichessUsername: userId } }),
    saveJoinedQuest: async ({ authenticatedUserId, joinedQuest }) => {
      assert.equal(joinedQuest.id, id);
      assert.equal(joinedQuest.participants[0].userId, id);
      saved.push(authenticatedUserId);
    },
  }, () => webRoute.POST(new Request("https://sqc.test/join", { method: "POST", body: "{}" }), { params: Promise.resolve({ id }) }));
  const first = run("first", true);
  await entered;
  try { assert.equal((await run("second", false)).status, 200); } finally { unblock(); }
  assert.equal((await first).status, 200);
  assert.deepEqual(saved, ["second", "first"]);
});

test("web join test overrides reject production entry and are ignored by production POST", async () => {
  const setEnv = (value: string) => Object.defineProperty(process.env, "NODE_ENV", { value, writable: true, configurable: true, enumerable: true });
  setEnv("production");
  try { assert.throws(() => webRoute.withWebJoinRouteTestDependencies({} as never, () => undefined), /test-only/); }
  finally { setEnv("test"); }
  let calls = 0;
  await webRoute.withWebJoinRouteTestDependencies({ getAuthenticatedUserId: async () => { calls++; return null; } } as never, async () => {
    setEnv("production");
    try { await webRoute.POST(new Request("https://sqc.test/join", { method: "POST", body: "{}" }), { params: Promise.resolve({ id: "q" }) }); }
    catch { /* Real request context/configuration is intentionally unavailable. */ }
    finally { setEnv("test"); }
  });
  assert.equal(calls, 0);
});

for (const surface of ["web", "mobile"] as const) {
  test(`${surface} full admission returns a stable rejection without persistence or spoofed identity`, async () => {
    const full = quest(80);
    const before = structuredClone(full);
    let writes = 0;
    const request = new Request("https://sqc.test/api/groupquests/capacity-quest", { method: "POST", body: JSON.stringify({ action: "join", userId: "player-0", participantUserId: "player-0" }) });
    const getUser = async (id: string) => ({ id, firstName: "New player", publicMetadata: { lichessUsername: "NewPlayer" }, privateMetadata: {} });
    const response = surface === "web"
      ? await webRoute.withWebJoinRouteTestDependencies({
        getAuthenticatedUserId: async () => "new-player",
        findQuestById: async () => ({ userId: "host", groupQuest: full }),
        getUser,
        saveJoinedQuest: async () => { writes++; },
      }, () => webRoute.POST(request, { params: Promise.resolve({ id: full.id }) }))
      : await mobileRoute.withMobileRefreshRouteTestDependencies({
        authenticate: async () => "new-player",
        getClient: async () => ({ users: { getUser, updateUserMetadata: async () => { writes++; } } }),
        findQuest: async () => ({ userId: "host", groupQuest: full }),
        check: async () => { throw new Error("not a proof request"); },
      } as never, () => mobileRoute.POST(request, { params: Promise.resolve({ id: full.id }) }));
    assert.equal(response.status, 409);
    const body = await response.json();
    assert.equal(body.ok, false);
    assert.equal(surface === "web" ? body.error : body.code, "groupquest_full");
    assert.equal(writes, 0);
    assert.deepEqual(full, before);
  });
}
