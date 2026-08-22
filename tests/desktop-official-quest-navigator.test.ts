import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import DesktopOfficialQuestNavigator from "../src/components/desktop-official-quest-navigator";
import { getOfficialCommandRailItems } from "../src/components/responsive-official-command-rail";
import { CHALLENGES } from "../src/lib/challenges";

function render(currentId: string) {
  return renderToStaticMarkup(
    React.createElement(DesktopOfficialQuestNavigator, {
      challenges: CHALLENGES,
      currentId,
    }),
  );
}

test("desktop official quest navigator exposes the catalog and next quest at the browse boundary", () => {
  const html = render("finish-any-game");

  assert.match(html, /<nav class="sqc-desktop-quest-navigator" aria-label="Browse official Solo Side Quests">/);
  assert.match(html, /href="\/side-quests"[^>]*><span aria-hidden="true">←<\/span>All Solo Side Quests<\/a>/);
  assert.doesNotMatch(html, /aria-label="Previous Solo Side Quest"/);
  assert.match(html, /aria-label="Next Solo Side Quest: Knights Before Coffee"[^>]*href="\/challenges\/knights-before-coffee"/);
  assert.match(html, /<span>Next quest<\/span><strong>Knights Before Coffee<\/strong>/);
});

test("desktop official quest navigator provides both neighbors away from catalog boundaries", () => {
  const html = render("early-king-walk");

  assert.match(html, /aria-label="Previous Solo Side Quest: Back Rank Goblin"[^>]*href="\/challenges\/back-rank-goblin"/);
  assert.match(html, /aria-label="Next Solo Side Quest: No Castle Club"[^>]*href="\/challenges\/no-castle-club"/);
});

test("official quest navigator remains absent from responsive mobile composition", () => {
  const css = readFileSync("src/app/mobile-web.css", "utf8");

  assert.match(css, /\.sqc-desktop-quest-navigator\s*\{[^}]*display:\s*none;/);
  assert.match(css, /@media\s*\(min-width:\s*1180px\)[\s\S]*?\.sqc-mobile-web\.desktop-official-detail\s+\.sqc-desktop-quest-navigator\s*\{[^}]*display:\s*grid;/);
  assert.match(css, /\.sqc-mobile-web\.desktop-official-detail\s+\.sqc-official-quest-card\s*\{[^}]*grid-row:\s*2;/);
  assert.match(css, /\.sqc-mobile-web\.desktop-official-detail\s+\.sqc-official-solo-detail-screen\s*>\s*\.sqc-quest-command-rail\s*\{[^}]*grid-row:\s*3\s*\/\s*span\s*2;/);
  assert.match(css, /\.sqc-mobile-web\.desktop-official-detail\s+\.sqc-active-detail-hero\s*\{[^}]*grid-row:\s*2;/);
  assert.match(css, /\.sqc-mobile-web\.desktop-official-detail\s+\.sqc-active-proof-summary\s*\{[^}]*grid-row:\s*3;/);
});

test("official quest detail expands its existing desktop workspace on large displays", () => {
  const css = readFileSync("src/app/mobile-web.css", "utf8");
  const wideDesktop = css.slice(css.indexOf("@media (min-width: 1680px)"));

  assert.match(wideDesktop, /\.sqc-mobile-web\.desktop-official-detail\s+\.sqc-screen\s*\{[^}]*width:\s*min\(1600px,\s*calc\(100%\s*-\s*80px\)\);/);
  assert.match(wideDesktop, /\.sqc-mobile-web\.desktop-official-detail\s+\.sqc-official-solo-detail-screen\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s+440px;/);
  assert.match(wideDesktop, /\.sqc-mobile-web\.desktop-official-detail\s+\.sqc-active-solo-detail-screen\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s+minmax\(440px,\s*\.72fr\);/);
});

test("available quest desktop utilities and primary action share one command surface", () => {
  const css = readFileSync("src/app/mobile-web.css", "utf8");
  const desktopStart = css.indexOf("/* Official detail keeps the Android content");
  const desktopEnd = css.indexOf("/* Community detail retains one parity-backed content/action subtree");
  const desktopOfficialDetail = css.slice(desktopStart, desktopEnd);

  assert.match(css, /\.sqc-quest-command-rail\s*\{[^}]*display:\s*contents;/);
  assert.match(desktopOfficialDetail, /\.sqc-mobile-web\.desktop-official-detail\s+\.sqc-official-solo-detail-screen\s*>\s*\.sqc-quest-command-rail\s*\{[^}]*padding:\s*12px;[^}]*border:\s*1px\s+solid\s+rgba\(245,\s*200,\s*106,\s*\.2\);[^}]*border-radius:\s*30px;[^}]*background:\s*rgba\(0,\s*0,\s*0,\s*\.22\);/);
  assert.match(desktopOfficialDetail, /\.sqc-mobile-web\.desktop-official-detail\s+\.sqc-quest-command-rail\s*>\s*\.sqc-proof-action-card\s*\{[^}]*border:\s*0;/);
  assert.doesNotMatch(desktopOfficialDetail, /\.sqc-mobile-web\.desktop-official-detail\s+\.sqc-quest-command-rail\s*>\s*\.sqc-proof-action-card\s*\{[^}]*[;{]\s*order\s*:/, "visual order must not diverge from keyboard and screen-reader order");
});

test("official command rail changes its real reading order only for desktop", () => {
  const primary = React.createElement("button", { key: "primary" }, "Start this Side Quest");
  const sharing = React.createElement("button", { key: "sharing" }, "Share public link");

  assert.deepEqual(getOfficialCommandRailItems(true, primary, sharing), [
    { key: "primary", content: primary },
    { key: "sharing", content: sharing },
  ]);
  assert.deepEqual(getOfficialCommandRailItems(false, primary, sharing), [
    { key: "sharing", content: sharing },
    { key: "primary", content: primary },
  ]);

  const completedManagement = React.createElement("section", { key: "completed", "aria-label": "Completed Solo Side Quest management" });
  assert.deepEqual(getOfficialCommandRailItems(true, completedManagement, sharing), [
    { key: "primary", content: completedManagement },
    { key: "sharing", content: sharing },
  ]);
});

test("active quest desktop workspace keeps proof evidence in the reading column and the next action in a sticky command rail", () => {
  const css = readFileSync("src/app/mobile-web.css", "utf8");
  const page = readFileSync("src/app/challenges/[id]/page.tsx", "utf8");
  const desktopStart = css.indexOf("/* Official detail keeps the Android content");
  const desktopEnd = css.indexOf("/* Community detail retains one parity-backed content/action subtree");
  const desktopOfficialDetail = css.slice(desktopStart, desktopEnd);

  assert.notEqual(desktopStart, -1);
  assert.notEqual(desktopEnd, -1);
  assert.match(page, /className="sqc-native-card sqc-detail-panel-strong sqc-active-command-panel"/);
  assert.match(page, /className="sqc-native-card sqc-active-conditions-panel"/);
  assert.match(desktopOfficialDetail, /\.sqc-mobile-web\.desktop-official-detail\s+\.sqc-active-command-panel\s*\{[^}]*grid-column:\s*2;[^}]*grid-row:\s*3\s*\/\s*span\s*2;[^}]*position:\s*sticky;[^}]*top:\s*108px;/);
  assert.match(desktopOfficialDetail, /\.sqc-mobile-web\.desktop-official-detail\s+\.sqc-active-proof-summary\s*\{[^}]*grid-column:\s*1;[^}]*grid-row:\s*3;/);
  assert.match(desktopOfficialDetail, /\.sqc-mobile-web\.desktop-official-detail\s+\.sqc-active-conditions-panel\s*\{[^}]*grid-column:\s*1;[^}]*grid-row:\s*4;/);
});
