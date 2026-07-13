import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function source(path: string) {
  return readFile(new URL(path, root), "utf8");
}

test("mobile community detail uses a real pick control and receives active quest identity", async () => {
  const [screen, page] = await Promise.all([
    source("src/components/mobile-app-web-shell.tsx"),
    source("src/app/challenges/community/[id]/page.tsx"),
  ]);
  assert.match(screen, /CommunitySoloPickControl/);
  assert.match(page, /activeQuestId=/);
  assert.doesNotMatch(screen, /Use the mobile app to pick/);
});

test("multiplayer detail uses direct session-derived joining without identity/profile fields", async () => {
  const [screen, directJoin] = await Promise.all([
    source("src/components/mobile-app-web-shell.tsx"),
    source("src/components/group-quest-direct-join.tsx"),
  ]);
  assert.match(screen, /GroupQuestDirectJoin/);
  assert.match(screen, /id=\{quest\.id\}/);
  assert.match(screen, /joinState\.kind === "join"/);
  assert.match(directJoin, /JSON\.stringify\(inviteKey \? \{ inviteKey \} : \{\}\)/);
  assert.match(directJoin, /Joining…/);
  assert.match(directJoin, /\/sign-in\?redirect_url=/);
  assert.doesNotMatch(directJoin, /localStorage|Public username|Leaderboard name|Email address|Location \/ country|Chess provider|groupquest_join_failed/);
});

test("community multiplayer panel embeds invite lookup and joins the resolved private quest", async () => {
  const [screen, inviteJoin] = await Promise.all([
    source("src/components/mobile-app-web-shell.tsx"),
    source("src/components/group-quest-invite-key-join.tsx"),
  ]);
  assert.match(screen, /<GroupQuestInviteKeyJoin isSignedIn=\{signedIn\}/);
  assert.doesNotMatch(screen, /<input readOnly placeholder="e\.g\. nocastle-ab12cd"/);
  assert.match(inviteJoin, /fetch\(`\/api\/groupquests\/\$\{encodeURIComponent\(groupQuestId\)\}\/join`/);
  assert.match(inviteJoin, /normalizeInviteLookupError/);
});

test("official Solo catalog loads and renders real like summaries", async () => {
  const [screen, page] = await Promise.all([
    source("src/components/mobile-app-web-shell.tsx"),
    source("src/app/side-quests/page.tsx"),
  ]);
  assert.match(page, /getCommunityLikeSummaries/);
  assert.match(page, /likeSummaries=\{likeSummaries\}/);
  assert.match(screen, /likeSummary=\{likeSummaries\?\.\[challenge\.id\]\}/);
});
