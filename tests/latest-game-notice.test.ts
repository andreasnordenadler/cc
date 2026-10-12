import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const moduleUrl = "../apps/mobile/src/home/latestGameNotice";
test("shared latest-game notice labels game time separately from provider check and indexing guidance", async () => {
  const noticeModule = await import(moduleUrl).catch(() => null);
  assert.ok(noticeModule, "shared notice formatter is not implemented");
  const notice = noticeModule.buildLatestGameNotice({ game: { provider: "lichess", gameId: "Abcd1234", completedGameAt: "2026-10-12T10:05:00.000Z", startedGameAt: "2026-10-12T10:00:00.000Z" }, checkedAt: "2026-10-12T11:05:00.000Z", pending: true });
  assert.equal(notice.title, "Latest game found");
  assert.match(notice.gameLine, /Lichess · Ended 2026-10-12 10:05 UTC/);
  assert.equal(notice.checkLine, "Game search last checked 2026-10-12 11:05 UTC");
  assert.match(notice.guidance, /may take a little while to appear/);
  assert.match(notice.guidance, /refresh again/);
  assert.doesNotMatch(notice.guidance, /failed|every|seconds/);
});

test("private latest-game UI is wired below identity on native and both web presentations", async () => {
  const mobile = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const home = mobile.slice(mobile.indexOf("function TodayDashboard"), mobile.indexOf("function HomeFeatureCard"));
  assert.match(home, /buildLatestGameNotice\(signedIn\?\.latestGameVisibility\)/);
  assert.ok(home.indexOf('testID="latest-game-visibility"') > home.indexOf("<AccountIdentityLine"));
  const web = await readFile(new URL("../src/components/mobile-app-web-shell.tsx", import.meta.url), "utf8");
  assert.match(web, /latestGameVisibility\?:/);
  assert.ok((web.match(/<LatestGameNotice /g) ?? []).length >= 2, "both app-sized and desktop Home render the notice");
});
