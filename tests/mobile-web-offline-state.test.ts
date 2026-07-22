import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { renderToStaticMarkup } from "react-dom/server";

import ErrorScreen, { reduceOfflineState, reduceOfflineView } from "../src/app/error";
import { CHALLENGES } from "../src/lib/challenges";

test("route failures open on Android's compact offline Home before the saved board", () => {
  let retries = 0;
  const error = new Error("Clerk secret details must stay server-side");
  const element = ErrorScreen({ error, unstable_retry: () => { retries += 1; } });
  const html = renderToStaticMarkup(element);

  assert.match(html, /class="sqc-mobile-web immersive signed-out"/);
  assert.match(html, /role="alert"/);
  assert.match(html, /class="sqc-offline-notice"/);
  assert.match(html, /OFFLINE SIDE QUEST BOARD/);
  assert.match(html, /Showing the saved fallback board because the live board could not refresh/);
  assert.match(html, /Sign in to continue/);
  assert.match(html, />Browse Solo Side Quests</);
  assert.match(html, />Try the live board again</);
  assert.doesNotMatch(html, /Saved official board|<details/);
  assert.doesNotMatch(html, /<a\b|href=/i);
  assert.doesNotMatch(html, /Guest menu|your connection is unavailable/i);
  assert.doesNotMatch(html, /Clerk secret details/);

  const contentProps = element.props as { unstable_retry?: () => void };
  assert.equal(typeof contentProps.unstable_retry, "function");
  contentProps.unstable_retry?.();
  assert.equal(retries, 1);
});

test("offline Home opens and closes the bundled Solo board locally", () => {
  assert.equal(reduceOfflineView("home", "browse-solo"), "solo");
  assert.equal(reduceOfflineView("solo", "back"), "home");
  assert.equal(reduceOfflineView("home", "back"), "home");
  assert.equal(CHALLENGES.slice(0, 6).length, 6);
});

test("opening the saved board clears stale offline action guidance", () => {
  assert.deepEqual(
    reduceOfflineState({ view: "home", message: "Sign-in needs a connection." }, "browse-solo"),
    { view: "solo", message: null },
  );
  assert.deepEqual(
    reduceOfflineState({ view: "solo", message: "stale" }, "back"),
    { view: "home", message: null },
  );
});

test("offline notice keeps Android banner typography and compact geometry", async () => {
  const css = await readFile(new URL("../src/app/mobile-web.css", import.meta.url), "utf8");

  assert.match(css, /\.sqc-offline-notice\s*\{[\s\S]*background:\s*rgba\(245, 200, 106, \.09\)/);
  assert.match(css, /\.sqc-offline-notice strong\s*\{[\s\S]*font-size:\s*11px/);
  assert.match(css, /\.sqc-offline-screen \.sqc-secondary-action,\s*\.sqc-offline-screen \.sqc-primary-action\s*\{[^}]*appearance:\s*none;[^}]*border:\s*0;/);
  assert.match(css, /\.sqc-native-card\.sqc-offline-catalog\s*\{[\s\S]*width:\s*min\(100%, 460px\)/);
  assert.match(css, /\.sqc-offline-quest-list\s*\{[\s\S]*grid-template-columns:\s*minmax\(0, 1fr\)/);
  assert.match(css, /\.sqc-offline-quest-list details\s*\{[\s\S]*grid-template-columns:\s*minmax\(0, 1fr\)/);
  assert.match(css, /\.sqc-offline-quest-list summary\s*\{[\s\S]*cursor:\s*pointer/);
  assert.match(css, /\.sqc-offline-quest-list summary::after\s*\{[\s\S]*content:\s*"＋"/);
  assert.match(css, /\.sqc-offline-quest-list details\[open\] summary::after\s*\{[\s\S]*content:\s*"−"/);
});
