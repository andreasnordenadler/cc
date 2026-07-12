import assert from "node:assert/strict";
import test from "node:test";

import { handleGroupQuestJoinRequest, type GroupQuestJoinDependencies } from "../src/lib/groupquest-join-route";
import { handleInviteLookupRequest } from "../src/lib/groupquest-invite-route";
import { safeGroupQuestHref, groupQuestIdFromLookupHref } from "../src/lib/mobile-web-parity-actions";
import type { ServerGroupQuest } from "../src/lib/groupquests";

function quest(overrides: Partial<ServerGroupQuest> = {}): ServerGroupQuest {
  return {
    id: "quest-route-id",
    hostUserId: "host-1",
    hostName: "Host",
    name: "Test quest",
    inviteCopy: "Join",
    inviteMode: "public",
    questIds: ["finish-any-game"],
    providerMode: "both",
    providerLabel: "Either",
    startAt: "2026-07-01T00:00:00.000Z",
    endAt: "2099-07-20T00:00:00.000Z",
    rules: {},
    createdAt: "2026-07-01T00:00:00.000Z",
    participants: [],
    ...overrides,
  };
}

function joinDeps(overrides: Partial<GroupQuestJoinDependencies> = {}): GroupQuestJoinDependencies {
  const q = quest();
  return {
    getAuthenticatedUserId: async () => "auth-user",
    findQuestById: async (id) => ({ userId: "host-1", groupQuest: { ...q, id } }),
    getUser: async (id) => ({
      id,
      firstName: "Auth",
      lastName: "Player",
      username: "clerk-name",
      primaryEmailAddress: { emailAddress: "auth@example.test" },
      publicMetadata: { lichessUsername: "auth-lichess", chessComUsername: "auth-chess" },
      privateMetadata: {},
    }),
    saveJoinedQuest: async () => {},
    ...overrides,
  };
}

function post(body: BodyInit | null = "{}") {
  return new Request("https://sqc.test/api/groupquests/quest-route-id/join", { method: "POST", body });
}

test("join route returns 401 when unauthenticated", async () => {
  const response = await handleGroupQuestJoinRequest(post(), "quest-route-id", joinDeps({ getAuthenticatedUserId: async () => null }));
  assert.equal(response.status, 401);
});

test("join route ignores supplied identity and mutates the exact route quest", async () => {
  const lookedUp: string[] = [];
  let saved: ServerGroupQuest | undefined;
  const response = await handleGroupQuestJoinRequest(
    post(JSON.stringify({ userId: "victim", username: "attacker", provider: "chesscom", leaderboardName: "Fake" })),
    "exact-route-quest",
    joinDeps({
      findQuestById: async (id) => {
        lookedUp.push(id);
        return { userId: "host-1", groupQuest: quest({ id }) };
      },
      saveJoinedQuest: async ({ joinedQuest }) => { saved = joinedQuest; },
    }),
  );
  assert.equal(response.status, 200);
  assert.deepEqual(lookedUp, ["exact-route-quest"]);
  assert.equal(saved?.id, "exact-route-quest");
  assert.deepEqual(saved?.participants.map(({ userId, provider, username, leaderboardName }) => ({ userId, provider, username, leaderboardName })), [
    { userId: "auth-user", provider: "lichess", username: "auth-lichess", leaderboardName: "Auth Player" },
  ]);
  assert.equal((await response.json()).href, "/groupquests/exact-route-quest?accepted=1");
});

test("provider-restricted join derives the matching username from authenticated Clerk metadata", async () => {
  let saved: ServerGroupQuest | undefined;
  const response = await handleGroupQuestJoinRequest(post(JSON.stringify({ username: "spoofed" })), "chess-only", joinDeps({
    findQuestById: async () => ({ userId: "host-1", groupQuest: quest({ id: "chess-only", providerMode: "chesscom" }) }),
    saveJoinedQuest: async ({ joinedQuest }) => { saved = joinedQuest; },
  }));
  assert.equal(response.status, 200);
  assert.equal(saved?.participants[0]?.provider, "chesscom");
  assert.equal(saved?.participants[0]?.username, "auth-chess");
});

test("join route rejects malformed JSON without looking up or mutating a quest", async () => {
  let calls = 0;
  const response = await handleGroupQuestJoinRequest(post("{"), "quest-route-id", joinDeps({
    findQuestById: async () => { calls += 1; return null; },
    saveJoinedQuest: async () => { calls += 1; },
  }));
  assert.equal(response.status, 400);
  assert.equal(calls, 0);
  assert.equal((await response.json()).error, "invalid_payload");
});

test("private invite lookup resolves an exact quest and only that quest is joined", async () => {
  const privateQuest = quest({ id: "private-target", inviteMode: "private-key", inviteKey: "SECRET" });
  const lookup = await handleInviteLookupRequest(post(JSON.stringify({ inviteKey: "SECRET" })), {
    getAuthenticatedUserId: async () => "auth-user",
    findQuestByInviteKey: async (key) => key === "SECRET" ? { userId: "host-1", groupQuest: privateQuest } : null,
  });
  assert.equal(lookup.status, 200);
  const lookupBody = await lookup.json() as { href: string };
  const resolvedId = groupQuestIdFromLookupHref(lookupBody.href, "https://sqc.test");
  assert.equal(resolvedId, "private-target");

  const lookedUp: string[] = [];
  const joined = await handleGroupQuestJoinRequest(post(JSON.stringify({ inviteKey: "SECRET" })), resolvedId!, joinDeps({
    findQuestById: async (id) => { lookedUp.push(id); return { userId: "host-1", groupQuest: privateQuest }; },
  }));
  assert.equal(joined.status, 200);
  assert.deepEqual(lookedUp, ["private-target"]);
});

test("invalid private invite keys cannot resolve or join", async () => {
  const privateQuest = quest({ id: "private-target", inviteMode: "private-key", inviteKey: "SECRET" });
  const lookup = await handleInviteLookupRequest(post(JSON.stringify({ inviteKey: "WRONG" })), {
    getAuthenticatedUserId: async () => "auth-user",
    findQuestByInviteKey: async () => null,
  });
  assert.equal(lookup.status, 404);
  const joined = await handleGroupQuestJoinRequest(post(JSON.stringify({ inviteKey: "WRONG" })), "private-target", joinDeps({
    findQuestById: async () => ({ userId: "host-1", groupQuest: privateQuest }),
  }));
  assert.equal(joined.status, 403);
});

test("invite and join href validation cannot become an open redirect", () => {
  assert.equal(groupQuestIdFromLookupHref("https://evil.test/groupquests/victim", "https://sqc.test"), null);
  assert.equal(groupQuestIdFromLookupHref("//evil.test/groupquests/victim", "https://sqc.test"), null);
  assert.equal(safeGroupQuestHref("https://evil.test/phish", "https://sqc.test"), null);
  assert.equal(safeGroupQuestHref("/groupquests/private-target?accepted=1", "https://sqc.test"), "/groupquests/private-target?accepted=1");
});
