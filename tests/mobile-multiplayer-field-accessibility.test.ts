import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("native Multiplayer join and create fields expose explicit screen-reader labels", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const screenStart = source.indexOf("function MultiplayerSideQuestsScreen");
  const screenEnd = source.indexOf("function OfficialMultiplayerLeaderboardsScreen", screenStart);
  const screen = source.slice(screenStart, screenEnd);

  assert.notEqual(screenStart, -1);
  assert.notEqual(screenEnd, -1);
  assert.match(screen, /<TextInput\s+accessibilityLabel="Invite code"[^>]*?value=\{inviteKey\}[^>]*?>/);
  assert.match(screen, /<TextInput\s+accessibilityLabel="Quest name"[^>]*?value=\{createName\}[^>]*?>/);
  assert.match(screen, /<TextInput\s+accessibilityLabel="Intro text"[^>]*?value=\{createInviteCopy\}[^>]*?>/);
});

test("native Multiplayer owner settings fields expose explicit screen-reader labels", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const detailStart = source.indexOf("function JoinedMultiplayerQuestModal");
  const detailEnd = source.indexOf("function AppRow", detailStart);
  const detail = source.slice(detailStart, detailEnd);

  assert.notEqual(detailStart, -1);
  assert.notEqual(detailEnd, -1);
  assert.match(detail, /<TextInput\s+accessibilityLabel="Quest name"[^>]*?value=\{adminName\}[^>]*?>/);
  assert.match(detail, /<TextInput\s+accessibilityLabel="Intro text"[^>]*?value=\{adminInviteCopy\}[^>]*?>/);
});
