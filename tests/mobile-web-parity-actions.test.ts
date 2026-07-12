import assert from "node:assert/strict";
import test from "node:test";

import {
  getCommunitySoloPickState,
  getMultiplayerJoinState,
  normalizeInviteLookupError,
} from "../src/lib/mobile-web-parity-actions";

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
