import assert from "node:assert/strict";
import test from "node:test";

import { createAuthenticatedWebFixture } from "../src/lib/authenticated-web-flow-fixture";

test("authenticated fixture exposes real home state and linked account usernames", () => {
  const app = createAuthenticatedWebFixture();
  const home = app.home();
  assert.equal(home.solo?.id, "solo-active");
  assert.equal(home.solo?.proof.label, "Not checked");
  assert.deepEqual(home.multiplayer.map(({ id, status }) => ({ id, status })), [
    { id: "hosted-active", status: "Host" },
    { id: "joined-active", status: "Joined" },
  ]);
  assert.deepEqual(app.account(), { lichessUsername: "fixture-lichess", chessComUsername: "fixture-chess" });
});

test("community Solo pick, like, and report validation mutate only the disposable fixture", () => {
  const app = createAuthenticatedWebFixture();
  assert.deepEqual(app.pickCommunitySolo("community-solo"), { ok: true, href: "/challenges/community/community-solo" });
  assert.equal(app.home().solo?.id, "community-solo");
  assert.deepEqual(app.likeCommunitySolo("community-solo"), { ok: true, likes: 1 });
  assert.deepEqual(app.likeCommunitySolo("community-solo"), { ok: true, likes: 1 });
  assert.deepEqual(app.reportCommunitySolo("community-solo", " "), { ok: false, message: "Add a short reason before reporting this Side Quest." });
  assert.deepEqual(app.reportCommunitySolo("community-solo", "Unsafe instructions"), { ok: true, message: "Community Solo Side Quest community-solo: Unsafe instructions" });
});

test("private invite resolves the exact Multiplayer quest and joins as the authenticated fixture user", async () => {
  const app = createAuthenticatedWebFixture();
  assert.deepEqual(await app.joinInvite("WRONG"), { ok: false, error: "invite_not_found" });
  assert.deepEqual(await app.joinInvite("DISPOSABLE"), { ok: true, href: "/groupquests/invited-private?accepted=1" });
  assert.equal(app.home().multiplayer.some((row) => row.id === "invited-private" && row.status === "Joined"), true);
});

test("custom Solo and Multiplayer creation use deterministic in-memory records", () => {
  const app = createAuthenticatedWebFixture();
  const custom = app.createCustomSolo({ title: "Castle late", summary: "Castle after move ten" });
  assert.deepEqual(custom, { ok: true, id: "custom-1", href: "/account/custom-side-quests" });
  const multiplayer = app.createMultiplayer({ name: "Fixture match", questIds: [custom.id] });
  assert.deepEqual(multiplayer, { ok: true, id: "multiplayer-1", href: "/groupquests/multiplayer-1?accepted=1" });
  assert.equal(app.home().multiplayer[0]?.id, "multiplayer-1");
});

test("proof checks return safe outcomes without network access or production mutation", () => {
  const app = createAuthenticatedWebFixture();
  assert.deepEqual(app.checkProof({ status: "pending", summary: "No eligible public game." }), { kind: "no-eligible-game", label: "No eligible game", tone: "neutral", detail: "No eligible public game." });
  assert.deepEqual(app.checkProof({ status: "failed", summary: "Target condition was not met." }), { kind: "failed", label: "Not Completed", tone: "danger", detail: "Target condition was not met." });
  assert.equal(app.checkProof({ status: "passed", headline: "Proof passed" }).label, "Completed");
});

test("reset cancellation preserves state, confirmation clears it, and logout blocks authenticated actions", () => {
  const app = createAuthenticatedWebFixture();
  assert.deepEqual(app.resetSolo(false), { ok: false, cancelled: true });
  assert.equal(app.home().solo?.id, "solo-active");
  assert.deepEqual(app.resetSolo(true), { ok: true, cancelled: false });
  assert.equal(app.home().solo, null);
  app.logout();
  assert.equal(app.session(), null);
  assert.deepEqual(app.pickCommunitySolo("community-solo"), { ok: false, error: "sign_in_required" });
  assert.deepEqual(app.createCustomSolo({ title: "No", summary: "No" }), { ok: false, error: "sign_in_required" });
});
