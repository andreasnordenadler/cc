import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { MobileCommunitySideQuestDetailScreen, MobileMultiplayerSideQuestsScreen } from "../src/components/mobile-app-web-shell";
import {
  continuePrivateInviteJoin,
  getCommunitySoloPickState,
  getMultiplayerJoinState,
  getPrivateInviteJoinState,
  takePendingPrivateInvite,
  normalizeInviteLookupError,
  validateCommunitySoloReport,
} from "../src/lib/mobile-web-parity-actions";
import { upsertCommunityLike } from "../src/lib/community-likes";
import { buildCommunitySoloCompletionState, buildReplicatedCustomSoloCompletionState } from "../src/lib/community-solo-detail-state";
import { decodePublicProof } from "../src/lib/proof-share";

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

test("private invite join keeps the credential out of the auth return URL", () => {
  assert.deepEqual(getPrivateInviteJoinState({ inviteKey: "  ROOK-42  ", signedIn: false }), {
    kind: "signed-out",
    inviteKey: "ROOK-42",
    href: "/sign-in?redirect_url=%2Fmultiplayer-side-quests%3Ftab%3Dcommunity",
  });
  assert.deepEqual(getPrivateInviteJoinState({ inviteKey: "ROOK-42", signedIn: true }), {
    kind: "join",
    inviteKey: "ROOK-42",
  });
});

test("restored private invite is consumed once before continuation", () => {
  const values = new Map([["sqc.pendingPrivateInviteKey", "ROOK-42"]]);
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    removeItem: (key: string) => values.delete(key),
  };

  assert.equal(takePendingPrivateInvite(storage), "ROOK-42");
  assert.equal(takePendingPrivateInvite(storage), null);
});

test("restored private invite continues through exact lookup and authenticated join", async () => {
  const requests: Array<{ url: string; body: unknown }> = [];
  const responses = [
    { ok: true, json: async () => ({ href: "/groupquests/exact%2Fquest?inviteKey=ROOK-42" }) },
    { ok: true, json: async () => ({ href: "/groupquests/exact%2Fquest?accepted=1" }) },
  ];

  const result = await continuePrivateInviteJoin({
    inviteKey: "ROOK-42",
    origin: "https://sidequestchess.com",
    fetch: async (url, init) => {
      requests.push({ url: String(url), body: JSON.parse(String(init?.body)) });
      return responses.shift() as Response;
    },
  });

  assert.deepEqual(requests, [
    { url: "/api/groupquests/invite/lookup", body: { inviteKey: "ROOK-42" } },
    { url: "/api/groupquests/exact%2Fquest/join", body: { inviteKey: "ROOK-42" } },
  ]);
  assert.deepEqual(result, { ok: true, destination: "/groupquests/exact%2Fquest?accepted=1" });
});

test("restored malformed private invite performs no lookup or join", async () => {
  let requests = 0;
  const result = await continuePrivateInviteJoin({
    inviteKey: "ROOK & 42",
    origin: "https://sidequestchess.com",
    fetch: async () => {
      requests += 1;
      throw new Error("must not fetch");
    },
  });

  assert.equal(requests, 0);
  assert.deepEqual(result, { ok: false, error: "Use the invite code exactly as the host shared it." });
});

test("private invite join rejects malformed and oversized credentials without truncating them", () => {
  const fortyCharacters = "A".repeat(40);
  assert.equal(getPrivateInviteJoinState({ inviteKey: fortyCharacters, signedIn: true }).kind, "join");
  assert.deepEqual(getPrivateInviteJoinState({ inviteKey: `${fortyCharacters}A`, signedIn: true }), {
    kind: "invalid",
    error: "Use the invite code exactly as the host shared it.",
  });
  assert.equal(getPrivateInviteJoinState({ inviteKey: "ROOK & 42", signedIn: false }).kind, "invalid");
});

test("signed-out Community Multiplayer keeps private invite joining reachable without exposing a credential", () => {
  const html = renderToStaticMarkup(React.createElement(MobileMultiplayerSideQuestsScreen, {
    selectedTab: "community",
    signedIn: false,
    officialRows: [],
    communityRows: [],
  }));

  assert.match(html, /aria-label="Join private Multiplayer Side Quest"/);
  assert.doesNotMatch(html, /pattern=|maxLength=/);
  assert.match(html, />Join with code<\/button>/);
  assert.doesNotMatch(html, /ROOK-42|Create a Community Multiplayer Side Quest/);
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
  assert.match(controls, /useActionState\(checkActiveChallengeWithResult/);
  assert.match(controls, /<SoloCheckFeedback result=\{state\}/);
  assert.match(controls, /pending \? "Checking latest game…" : "Check my latest game"/);
  assert.match(controls, /Switch active Side Quest\?/);
});

test("Community Solo detail exposes Android share and copy actions instead of a self-link", () => {
  const html = renderToStaticMarkup(React.createElement(MobileCommunitySideQuestDetailScreen, {
    signedIn: false,
    quest: {
      id: "quest/42",
      title: "Ada's Fork",
      summary: "Win a fork.",
      creatorName: "Ada",
      creatorBrowsePath: "/community-side-quests?creator=ada",
      ruleLabel: "Fork",
      ruleDetails: ["Create a fork."],
      badgeImageUrl: "/badges/custom/community/community-coat-28.png",
      stats: { soloAttempts: 0, soloSelections: 0, soloCompletions: 0, multiplayerLineups: 0, multiplayerAttempts: 0, multiplayerFulfillments: 0 },
    },
  }));

  assert.match(html, /<button[^>]*aria-label="Share Community Solo Side Quest"[^>]*>Share public link<\/button>/);
  assert.match(html, /<button[^>]*aria-label="Copy Community Solo Side Quest public link"[^>]*>Copy public link<\/button>/);
  assert.match(html, /%2Fbadges%2Fcustom%2Fcommunity%2Fcommunity-coat-28\.png/);
  assert.doesNotMatch(html, /%2Fmobile-source%2Fbadges%2Fcustom%2Fcommunity%2Fcommunity-coat-28\.png/);
  assert.doesNotMatch(html, /<a[^>]*href="\/challenges\/community\/quest%2F42"[^>]*>Share public link<\/a>/);
});

test("signed-out Community Solo detail keeps Android's exact report handoff reachable", () => {
  const html = renderToStaticMarkup(React.createElement(MobileCommunitySideQuestDetailScreen, {
    signedIn: false,
    likeSummary: { count: 2, likedByViewer: false },
    quest: {
      id: "quest/42",
      title: "Ada's Fork & Pin",
      summary: "Win a fork.",
      creatorName: "Ada & Lin",
      creatorBrowsePath: "/community-side-quests?creator=ada",
      ruleLabel: "Fork",
      ruleDetails: ["Create a fork."],
      stats: { soloAttempts: 0, soloSelections: 0, soloCompletions: 0, multiplayerLineups: 0, multiplayerAttempts: 0, multiplayerFulfillments: 0 },
    },
  }));

  assert.match(html, /<div class="sqc-active-detail-title-row"><h1>Ada&#x27;s Fork &amp; Pin<\/h1><a[^>]*class="sqc-like-pill"[^>]*aria-label="Sign in to like Ada&#x27;s Fork &amp; Pin\. 2 likes\."/);
  assert.match(html, /data-icon="thumb-up-outline"/);
  assert.doesNotMatch(html, />Sign in to like<\/a>/);
  assert.match(html, /href="\/support\?report=community-solo&amp;questId=quest%2F42&amp;title=Ada%27s\+Fork\+%26\+Pin&amp;creator=Ada\+%26\+Lin"[^>]*>Report this Side Quest<\/a>/);
  assert.doesNotMatch(html, /Sign in to like or report/);
});

test("signed-in Community Solo detail can start an exact preselected Multiplayer draft", () => {
  const html = renderToStaticMarkup(React.createElement(MobileCommunitySideQuestDetailScreen, {
    signedIn: true,
    quest: {
      id: "quest/42",
      title: "Ada's Fork",
      summary: "Win a fork.",
      creatorName: "Ada",
      creatorBrowsePath: "/community-side-quests?creator=ada",
      ruleLabel: "Fork",
      ruleDetails: ["Create a fork."],
      stats: { soloAttempts: 0, soloSelections: 0, soloCompletions: 0, multiplayerLineups: 0, multiplayerAttempts: 0, multiplayerFulfillments: 0 },
    },
  }));

  assert.match(html, /href="\/create-multiplayer-side-quest\?quest=quest%2F42"[^>]*>Use in Multiplayer<\/a>/);
  assert.doesNotMatch(html, /userId=|creatorUserId=/);
});

test("active Community Solo detail exposes only latest-game and deactivate proof actions", () => {
  const html = renderToStaticMarkup(React.createElement(MobileCommunitySideQuestDetailScreen, {
    signedIn: true,
    activeQuestId: "quest/42",
    quest: {
      id: "quest/42",
      title: "Ada's Fork",
      summary: "Win a fork.",
      creatorName: "Ada",
      creatorBrowsePath: "/community-side-quests?creator=ada",
      ruleLabel: "Fork",
      ruleDetails: ["Create a fork."],
      stats: { soloAttempts: 1, soloSelections: 1, soloCompletions: 0, multiplayerLineups: 0, multiplayerAttempts: 0, multiplayerFulfillments: 0 },
    },
  }));

  assert.match(html, />Check my latest game<\/button>/);
  assert.match(html, />Deactivate<\/button>/);
  assert.doesNotMatch(html, /Specific proof game|Lichess game ID or Chess\.com URL|Submit game\/link/);
  assert.doesNotMatch(html, />Active Side Quest<\/a>/);
});

test("signed-out Community Solo detail ignores stale active identity and keeps sign-in actions", () => {
  const html = renderToStaticMarkup(React.createElement(MobileCommunitySideQuestDetailScreen, {
    signedIn: false,
    activeQuestId: "quest/42",
    quest: {
      id: "quest/42",
      title: "Ada's Fork",
      summary: "Win a fork.",
      creatorName: "Ada",
      creatorBrowsePath: "/community-side-quests?creator=ada",
      ruleLabel: "Fork",
      ruleDetails: ["Create a fork."],
      stats: { soloAttempts: 0, soloSelections: 0, soloCompletions: 0, multiplayerLineups: 0, multiplayerAttempts: 0, multiplayerFulfillments: 0 },
    },
  }));

  assert.match(html, /Sign in to pick this Community Solo Side Quest/);
  assert.match(html, />Sign in<\/a>/);
  assert.doesNotMatch(html, />Check my latest game<|>Submit game\/link<|>Deactivate</);
});

test("active Community Solo detail renders the latest failed proof diagnostic from authenticated state", () => {
  const html = renderToStaticMarkup(React.createElement(MobileCommunitySideQuestDetailScreen, {
    signedIn: true,
    activeQuestId: "quest/42",
    latestAttempt: {
      status: "failed",
      summary: "The latest game did not create a fork.",
      checkedAt: "2026-07-19T10:10:00.000Z",
      lastMoveSan: "Kh1",
      failureLabel: "Fork not found",
      failureExplanation: "No move attacked two pieces at once.",
    },
    quest: {
      id: "quest/42",
      title: "Ada's Fork",
      summary: "Win a fork.",
      creatorName: "Ada",
      creatorBrowsePath: "/community-side-quests?creator=ada",
      ruleLabel: "Fork",
      ruleDetails: ["Create a fork."],
      stats: { soloAttempts: 1, soloSelections: 1, soloCompletions: 0, multiplayerLineups: 0, multiplayerAttempts: 0, multiplayerFulfillments: 0 },
    },
  }));

  assert.match(html, /Latest proof check/);
  assert.match(html, /Fork not found/);
  assert.match(html, /The latest game did not create a fork\./);
  assert.match(html, /No move attacked two pieces at once\./);
  assert.match(html, /Last move: Kh1/);
});

test("completed Community Solo detail exposes Android v339's result action instead of pick or active self-links", () => {
  const html = renderToStaticMarkup(React.createElement(MobileCommunitySideQuestDetailScreen, {
    signedIn: true,
    completed: true,
    completedAt: "2026-07-18T10:10:00.000Z",
    resultHref: "/proof/signed-community-result",
    quest: {
      id: "quest/42",
      title: "Ada's Fork",
      summary: "Win a fork.",
      creatorName: "Ada",
      creatorBrowsePath: "/community-side-quests?creator=ada",
      ruleLabel: "Fork",
      ruleDetails: ["Create a fork."],
      stats: { soloAttempts: 0, soloSelections: 0, soloCompletions: 1, multiplayerLineups: 0, multiplayerAttempts: 0, multiplayerFulfillments: 0 },
    },
  }));

  assert.match(html, /Completed Jul 18, 2026/);
  assert.match(html, /href="\/proof\/signed-community-result"[^>]*>View result<\/a>/);
  assert.doesNotMatch(html, />Pick this Side Quest<|>Active Side Quest</);
});

test("completed Community Solo detail keeps the result surface free of active-run diagnostics", () => {
  const html = renderToStaticMarkup(React.createElement(MobileCommunitySideQuestDetailScreen, {
    signedIn: true,
    activeQuestId: "quest/42",
    completed: true,
    completedAt: "2026-07-18T10:10:00.000Z",
    resultHref: "/proof/signed-community-result",
    latestAttempt: {
      status: "passed",
      summary: "Accepted proof.",
      checkedAt: "2026-07-18T10:10:00.000Z",
    },
    quest: {
      id: "quest/42",
      title: "Ada's Fork",
      summary: "Win a fork.",
      creatorName: "Ada",
      creatorBrowsePath: "/community-side-quests?creator=ada",
      ruleLabel: "Fork",
      ruleDetails: ["Create a fork."],
      stats: { soloAttempts: 1, soloSelections: 1, soloCompletions: 1, multiplayerLineups: 0, multiplayerAttempts: 0, multiplayerFulfillments: 0 },
    },
  }));

  assert.match(html, />View result<\/a>/);
  assert.doesNotMatch(html, /Latest proof check|Accepted proof\.|>Deactivate</);
});

test("Community Solo detail state preserves the latest failed proof diagnostic for the active command center", async () => {
  const state = await buildCommunitySoloCompletionState({
    metadata: {
      challengeAttempts: [{
        id: "quest/42:failed",
        challengeId: "quest/42",
        status: "failed",
        summary: "The latest game did not create a fork.",
        checkedAt: "2026-07-19T10:10:00.000Z",
        finalPositionFen: "8/8/8/8/8/8/8/K6k w - - 0 1",
        lastMoveSan: "Kh1",
        failureDiagnostic: { label: "Fork not found", explanation: "No move attacked two pieces at once." },
      }],
    },
    quest: {
      id: "quest/42",
      title: "Ada's Fork",
      summary: "Win a fork.",
      config: JSON.stringify({ version: 1, template: "finishAnyGame" }),
      lifecycle: "published",
      visibility: "public",
      createdAt: "2026-07-12T00:00:00.000Z",
      updatedAt: "2026-07-12T00:00:00.000Z",
    },
  });

  assert.deepEqual(state.latestAttempt, {
    status: "failed",
    summary: "The latest game did not create a fork.",
    checkedAt: "2026-07-19T10:10:00.000Z",
    finalPositionFen: "8/8/8/8/8/8/8/K6k w - - 0 1",
    lastMoveSan: "Kh1",
    failureLabel: "Fork not found",
    failureExplanation: "No move attacked two pieces at once.",
  });
});

test("owned Custom Solo state keeps completion and the newest diagnostic across metadata replicas", async () => {
  const state = await buildReplicatedCustomSoloCompletionState({
    metadataRecords: [
      {
        challengeProgress: { completedChallengeIds: ["custom-replica"] },
        challengeAttempts: [{ id: "custom-replica:passed", challengeId: "custom-replica", status: "passed", summary: "Accepted custom proof.", checkedAt: "2026-07-18T10:10:00.000Z", gameId: "accepted-game" }],
      },
      {
        challengeAttempts: [{
          id: "custom-replica:failed",
          challengeId: "custom-replica",
          status: "failed",
          summary: "The newest game missed the saved condition.",
          checkedAt: "2026-07-19T10:10:00.000Z",
          lastMoveSan: "Kh1",
          failureDiagnostic: { label: "Condition not met", explanation: "The required piece state was absent." },
        }],
      },
    ],
    quest: {
      id: "custom-replica",
      title: "Replica-aware custom quest",
      summary: "Meet the saved condition.",
      config: JSON.stringify({ version: 1, template: "finishAnyGame" }),
      lifecycle: "published",
      visibility: "private",
      createdAt: "2026-07-12T00:00:00.000Z",
      updatedAt: "2026-07-12T00:00:00.000Z",
    },
  });

  assert.equal(state.completed, true);
  assert.equal(state.completedAt, "2026-07-18T10:10:00.000Z");
  assert.deepEqual(state.latestAttempt, {
    status: "failed",
    summary: "The newest game missed the saved condition.",
    checkedAt: "2026-07-19T10:10:00.000Z",
    lastMoveSan: "Kh1",
    failureLabel: "Condition not met",
    failureExplanation: "The required piece state was absent.",
  });
});

test("owned Custom Solo replica merge ignores malformed diagnostics instead of hiding valid state", async () => {
  const state = await buildReplicatedCustomSoloCompletionState({
    metadataRecords: [
      { challengeAttempts: [{ id: "valid", challengeId: "custom-replica", status: "failed", summary: "Valid failure", checkedAt: "2026-07-19T10:10:00.000Z" }] },
      { challengeAttempts: [{ id: "malformed", challengeId: "custom-replica", status: "failed", summary: { hidden: true } as never, checkedAt: "not-a-date" }] },
    ],
    quest: {
      id: "custom-replica",
      title: "Replica-aware custom quest",
      summary: "Meet the saved condition.",
      config: JSON.stringify({ version: 1, template: "finishAnyGame" }),
      lifecycle: "published",
      visibility: "private",
      createdAt: "2026-07-12T00:00:00.000Z",
      updatedAt: "2026-07-12T00:00:00.000Z",
    },
  });

  assert.equal(state.latestAttempt?.summary, "Valid failure");
});

test("Community Solo completion state keeps the latest accepted proof after a later failed check", async () => {
  const state = await buildCommunitySoloCompletionState({
    metadata: {
      challengeProgress: { completedChallengeIds: ["quest/42"] },
      challengeAttempts: [
        { id: "quest/42:passed", challengeId: "quest/42", status: "passed", summary: "Accepted Community proof", checkedAt: "2026-07-18T10:10:00.000Z", gameId: "game-42" },
        { id: "quest/42:failed", challengeId: "quest/42", status: "failed", summary: "Later game failed", checkedAt: "2026-07-19T10:10:00.000Z" },
      ],
    },
    quest: {
      id: "quest/42",
      title: "Ada's Fork",
      summary: "Win a fork.",
      config: JSON.stringify({ version: 1, template: "finishAnyGame" }),
      lifecycle: "published",
      visibility: "public",
      createdAt: "2026-07-12T00:00:00.000Z",
      updatedAt: "2026-07-12T00:00:00.000Z",
    },
  });
  const decoded = await decodePublicProof(state.resultHref?.slice("/proof/".length));

  assert.equal(state.completed, true);
  assert.equal(state.completedAt, "2026-07-18T10:10:00.000Z");
  assert.equal(decoded?.payload.challengeId, "quest/42");
  assert.equal(decoded?.payload.summary, "Accepted Community proof");
});

test("Community Solo completion state ignores malformed retained attempts and keeps a generic result", async () => {
  const state = await buildCommunitySoloCompletionState({
    metadata: {
      challengeProgress: { completedChallengeIds: ["quest/42"] },
      challengeAttempts: [{
        id: "quest/42:malformed",
        challengeId: "quest/42",
        status: "passed",
        summary: { private: "invalid" } as never,
        checkedAt: "2026-07-18T10:10:00.000Z",
      }],
    },
    quest: {
      id: "quest/42",
      title: "Ada's Fork",
      summary: "Win a fork.",
      config: JSON.stringify({ version: 1, template: "finishAnyGame" }),
      lifecycle: "published",
      visibility: "public",
      createdAt: "2026-07-12T00:00:00.000Z",
      updatedAt: "2026-07-12T00:00:00.000Z",
    },
  });
  const decoded = await decodePublicProof(state.resultHref?.slice("/proof/".length));

  assert.equal(state.completed, true);
  assert.equal(state.completedAt, null);
  assert.equal(decoded?.payload.summary, "Completion saved by Side Quest Chess.");
});

test("authenticated Community Solo route passes server-derived completion state to the production detail", async () => {
  const source = await import("node:fs/promises").then((fs) => fs.readFile(new URL("../src/app/challenges/community/[id]/page.tsx", import.meta.url), "utf8"));

  assert.match(source, /buildCommunitySoloCompletionState\(\{ metadata: metadataRecord, quest \}\)/);
  assert.match(source, /completed=\{completionState\.completed\}/);
  assert.match(source, /completedAt=\{completionState\.completedAt\}/);
  assert.match(source, /resultHref=\{completionState\.resultHref\}/);
  assert.match(source, /latestAttempt=\{completionState\.latestAttempt\}/);
});

test("authenticated Custom Solo owner route passes replica-aware latest diagnostics to its proof command center", async () => {
  const source = await import("node:fs/promises").then((fs) => fs.readFile(new URL("../src/app/custom-side-quests/[id]/page.tsx", import.meta.url), "utf8"));

  assert.match(source, /buildReplicatedCustomSoloCompletionState\(\{[\s\S]*metadataRecords:\s*\[publicMetadata, sourceMetadata\][\s\S]*quest/);
  assert.match(source, /latestAttempt=\{completionState\.latestAttempt\}/);
});

test("Community Solo detail keeps its Coat of Arms in flow instead of clipping it above the viewport", async () => {
  const css = await import("node:fs/promises").then(fs => fs.readFile(new URL("../src/app/mobile-web.css", import.meta.url), "utf8"));

  assert.match(css, /\.sqc-community-detail-screen \.sqc-community-detail-hero > \.sqc-section-mark\s*\{[\s\S]*?position:\s*relative;[\s\S]*?top:\s*auto;[\s\S]*?left:\s*auto;[\s\S]*?transform:\s*none;/);
});
