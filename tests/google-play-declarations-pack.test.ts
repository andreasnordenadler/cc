import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { canReportCommunityMultiplayerQuest } from "../apps/mobile/src/reports/communityMultiplayerReport";
import { filterBlockedCommunityGroupQuests } from "../src/lib/user-blocking";

const declarationsPath = path.resolve("docs/SQC_GOOGLE_PLAY_DECLARATIONS_V340_2026-07-30.md");
const internalPlanPath = path.resolve("docs/SQC_GOOGLE_PLAY_INTERNAL_TEST_PLAN_V348_2026-08-05.md");
const listingPath = path.resolve("docs/SQC_GOOGLE_PLAY_LISTING_V340_2026-07-30.md");

test("Google Play declarations are bound to the current code-348 AAB", async () => {
  const [declarations, internalPlan] = await Promise.all([
    readFile(declarationsPath, "utf8"),
    readFile(internalPlanPath, "utf8"),
  ]);

  assert.match(declarations, /Current inspected Google Play upload candidate: `0\.1\.347 \(348\)`/);
  assert.match(declarations, /Immutable EAS source: `5ece97b95de996b630775359e312a001e58ff59c`/);
  assert.match(declarations, /EAS build: `c8290195-f35b-48b5-961d-907b7adb532b`/);
  assert.match(declarations, /AAB SHA-256: `c8755b7175fc6902ec391c8ba2dc69488faf13dd0be78d321507026c89bb5576`/);
  assert.match(declarations, /size 86,159,689 bytes/);
  assert.match(declarations, /upload only the bound code-348 AAB/i);
  assert.doesNotMatch(declarations, /current inspected Google Play upload candidate: `0\.1\.346 \(347\)`/i);

  for (const identity of [
    "5ece97b95de996b630775359e312a001e58ff59c",
    "c8290195-f35b-48b5-961d-907b7adb532b",
    "c8755b7175fc6902ec391c8ba2dc69488faf13dd0be78d321507026c89bb5576",
  ]) {
    assert.ok(internalPlan.includes(identity), `internal-test plan must independently contain ${identity}`);
  }
});

test("Google Play declarations quarantine superseded code-347 listing instructions", async () => {
  const [declarations, listing] = await Promise.all([
    readFile(declarationsPath, "utf8"),
    readFile(listingPath, "utf8"),
  ]);

  assert.match(listing, /0\.1\.346 \(347\)/);
  assert.match(listing, /legacy listing copy and asset evidence only/i);
  assert.match(listing, /code-347 candidate and screenshot instructions are superseded/i);
  assert.match(listing, /code-348 internal testing plan controls current candidate operations/i);
  assert.doesNotMatch(listing, /^# Side Quest Chess — exact Google Play listing pack$/m);
  assert.match(declarations, /legacy listing copy and asset evidence only/i);
  assert.match(declarations, /code-347 candidate and screenshot instructions are superseded/i);
  assert.match(declarations, /code-348 internal testing plan controls current candidate operations/i);
});

test("Google Play declarations describe the exact Android creator safety scope", async () => {
  const [declarations, mobileApiSource, accountRouteSource] = await Promise.all([
    readFile(declarationsPath, "utf8"),
    readFile(path.resolve("apps/mobile/src/api/sqc.ts"), "utf8"),
    readFile(path.resolve("src/app/api/mobile/account/route.ts"), "utf8"),
  ]);

  const eligibleQuest = { official: false, inviteMode: "public" as const, isOwner: false };
  assert.equal(canReportCommunityMultiplayerQuest(eligibleQuest, true), true);
  assert.equal(canReportCommunityMultiplayerQuest({ ...eligibleQuest, official: true }, true), false);
  assert.equal(canReportCommunityMultiplayerQuest({ ...eligibleQuest, inviteMode: "private-key" }, true), false);
  assert.equal(canReportCommunityMultiplayerQuest({ ...eligibleQuest, isOwner: true }, true), false);
  assert.equal(canReportCommunityMultiplayerQuest(eligibleQuest, false), false);

  const visibleMultiplayer = filterBlockedCommunityGroupQuests([
    { id: "blocked-community", hostUserId: "blocked-creator", official: false },
    { id: "visible-community", hostUserId: "visible-creator", official: false },
    { id: "official", hostUserId: "blocked-creator", official: true },
  ], new Set(["blocked-creator"]));
  assert.deepEqual(visibleMultiplayer.map((quest) => quest.id), ["visible-community", "official"]);
  assert.match(accountRouteSource, /if \(blockedUserIds\.has\(user\.id\)\) return \[\];/);
  assert.match(mobileApiSource, /targetType: "community-multiplayer"/);
  assert.doesNotMatch(mobileApiSource, /targetType: "community-solo"[^\n]*(?:block|creator)/i);

  assert.match(declarations, /eligible non-owner public Community Multiplayer detail/i);
  assert.match(declarations, /blocking then hides that creator’s public Community Solo and Multiplayer content from discovery/i);
  assert.match(declarations, /no direct creator-report or block entry point for a creator represented only by Community Solo content/i);
  assert.doesNotMatch(declarations, /there is no user-blocking control/i);
  assert.doesNotMatch(declarations, /there is no distinct in-app user-reporting control/i);
  assert.match(declarations, /no dedicated moderation queue/i);
  assert.match(declarations, /public UGC launch compliance remains \*\*BLOCKED\*\*/i);
});

test("Google Play declarations preserve fixed product facts and every owner gate", async () => {
  const declarations = await readFile(declarationsPath, "utf8");

  for (const expected of [
    "Crowdler AB",
    "sam@crowdler.com",
    "Worldwide",
    "13 and older",
    "No ads",
    "No financial features",
    "samnordbot@gmail.com",
  ]) {
    assert.ok(declarations.includes(expected), `declarations must include ${expected}`);
  }

  assert.match(declarations, /existing \*\*Side Quest Chess\*\* Play Console app and package `com\.sidequestchess\.app`/);
  for (const gatedAction of [
    "Tester assignment",
    "AAB upload",
    "Console declaration entry",
    "declaration submission",
    "internal-track rollout",
    "Play-delivered installation",
    "publication",
  ]) {
    assert.match(
      declarations,
      new RegExp(`${gatedAction}[^\\n]*explicit owner gate`, "i"),
      `${gatedAction} must remain an explicit owner gate`,
    );
  }
  assert.match(declarations, /authorized owner\/legal reviewer must approve and publish/i);
  assert.match(declarations, /not legal advice, legal adoption, or authorization to edit Play Console/i);
});
