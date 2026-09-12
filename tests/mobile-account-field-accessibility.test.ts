import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("native profile and chess username fields expose explicit screen-reader labels", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const editorStart = source.indexOf("function ChessUsernameEditor");
  const editorEnd = source.indexOf("function PasswordAuthPanel", editorStart);
  const editor = source.slice(editorStart, editorEnd);

  assert.notEqual(editorStart, -1);
  assert.notEqual(editorEnd, -1);
  assert.match(editor, /<TextInput\s+accessibilityLabel="Display name"[^>]*?value=\{runnerDisplayName\}[^>]*?>/);
  assert.match(editor, /<TextInput\s+accessibilityLabel="Brag line"[^>]*?value=\{runnerBio\}[^>]*?>/);
  assert.match(editor, /<TextInput\s+accessibilityLabel="Lichess username"[^>]*?ref=\{lichessInputRef\}[^>]*?>/);
  assert.match(editor, /<TextInput\s+accessibilityLabel="Chess\.com username"[^>]*?ref=\{chessComInputRef\}[^>]*?>/);
});

test("native profile editor announces save feedback", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const editorStart = source.indexOf("function ChessUsernameEditor");
  const editorEnd = source.indexOf("function PasswordAuthPanel", editorStart);
  const editor = source.slice(editorStart, editorEnd);

  assert.notEqual(editorStart, -1);
  assert.notEqual(editorEnd, -1);
  assert.match(editor, /\{message \? <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style=\{styles\.successCopy\}>\{message\}<\/Text> : null\}/);
  assert.match(editor, /\{error \? <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style=\{styles\.errorCopy\}>\{error\}<\/Text> : null\}/);
});

test("native Account screen exposes its title as a heading in every authentication state", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const dashboardStart = source.indexOf("function AccountTrackerDashboard");
  const dashboardEnd = source.indexOf("function AccountSoloSideQuestSection", dashboardStart);
  const dashboard = source.slice(dashboardStart, dashboardEnd);

  assert.notEqual(dashboardStart, -1);
  assert.notEqual(dashboardEnd, -1);
  assert.equal(
    dashboard.match(/<Text accessibilityRole="header" style=\{compactStyles\.kicker\}>My Account<\/Text>/g)?.length ?? 0,
    3,
  );
});
