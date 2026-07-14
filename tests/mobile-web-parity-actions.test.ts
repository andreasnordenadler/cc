import assert from "node:assert/strict";
import test from "node:test";

import {
  getCommunitySoloPickState,
  getMultiplayerJoinState,
  normalizeInviteLookupError,
  validateCommunitySoloReport,
} from "../src/lib/mobile-web-parity-actions";
import { upsertCommunityLike } from "../src/lib/community-likes";

test("community solo pick state sends signed-out viewers to the exact detail sign-in return path", () => {
  assert.deepEqual(getCommunitySoloPickState({ questId: "fork & pin", signedIn: false, activeQuestId: null }), {
    kind: "signed-out",
    href: "/sign-in?redirect_url=%2Fchallenges%2Fcommunity%2Ffork%2520%2526%2520pin",
    label: "Sign in",
  });
});

test("community solo pick state starts an inactive quest and never starts the already-active quest again", () => {
  assert.deepEqual(getCommunitySoloPickState({ questId: "fork", signedIn: true, activeQuestId: "pin" }), {
    kind: "pick",
    label: "Pick this Side Quest",
  });
  assert.deepEqual(getCommunitySoloPickState({ questId: "fork", signedIn: true, activeQuestId: "fork" }), {
    kind: "active",
    href: "/challenges/community/fork",
    label: "Active Side Quest",
  });
});

test("multiplayer join state signs in to and joins the exact displayed quest while preserving joined state", () => {
  assert.deepEqual(getMultiplayerJoinState({ questId: "group/42", signedIn: false, status: "Not joined" }), {
    kind: "signed-out",
    href: "/sign-in?redirect_url=%2Fgroupquests%2Fgroup%252F42",
    label: "Sign in to join",
  });
  assert.deepEqual(getMultiplayerJoinState({ questId: "group-42", signedIn: true, status: "Not joined" }), {
    kind: "join",
    label: "Join Side Quest",
  });
  assert.deepEqual(getMultiplayerJoinState({ questId: "group-42", signedIn: true, status: "Joined" }), {
    kind: "joined",
    href: "/groupquests/group-42?accepted=1",
    label: "Joined Side Quest",
  });
});

test("invite lookup errors give useful malformed, not-found, and finished messages", () => {
  assert.equal(normalizeInviteLookupError("missing_invite_key"), "Paste the invite code from the host first.");
  assert.equal(normalizeInviteLookupError("invite_not_found"), "That invite code did not match an open Multiplayer Side Quest.");
  assert.equal(normalizeInviteLookupError("groupquest_finished"), "That Multiplayer Side Quest has finished.");
});

test("community likes are idempotent and reports require a useful reason", () => {
  const once = upsertCommunityLike({}, "solo", "quest-1", new Date("2026-07-12T00:00:00Z"));
  const twice = upsertCommunityLike({ sqcCommunityLikes: once }, "solo", "quest-1", new Date("2026-07-12T01:00:00Z"));
  assert.equal(twice.length, 1);
  assert.deepEqual(validateCommunitySoloReport("quest-1", ""), { ok: false, message: "Add a short reason before reporting this Side Quest." });
  assert.deepEqual(validateCommunitySoloReport("quest-1", "Misleading rule"), { ok: true, message: "Community Solo Side Quest quest-1: Misleading rule" });
});

test("active Solo Home control exposes only the compact proof refresh action", async () => {
  const source = await import("node:fs/promises").then(fs => fs.readFile(new URL("../src/components/active-solo-actions.tsx", import.meta.url), "utf8"));
  assert.match(source, /checkActiveChallenge/);
  assert.match(source, /Refresh active Solo Side Quest/);
  assert.doesNotMatch(source, /deactivateActiveChallenge|confirm\(|Choose another Side Quest|userId/);
});

test("official Solo detail CTAs execute start and proof-check actions instead of redirecting to Account", async () => {
  const fs = await import("node:fs/promises");
  const page = await fs.readFile(new URL("../src/app/challenges/[id]/page.tsx", import.meta.url), "utf8");
  const controls = await fs.readFile(new URL("../src/components/official-solo-detail-actions.tsx", import.meta.url), "utf8");

  assert.match(page, /OfficialSoloDetailActions/);
  assert.match(page, /existingActiveChallenge\?\.title \?\? "your current Side Quest"/);
  assert.doesNotMatch(page, /<Link href="\/account" className="sqc-(?:primary|secondary)-action">(?:Start this Side Quest|Check my latest game)<\/Link>/);
  assert.match(controls, /action={startChallenge}/);
  assert.match(controls, /name="challengeId"/);
  assert.match(controls, /action={checkActiveChallenge}/);
  assert.match(controls, /pending \? "Checking latest game…" : "Check my latest game"/);
  assert.match(controls, /Switch active Side Quest\?/);
});
