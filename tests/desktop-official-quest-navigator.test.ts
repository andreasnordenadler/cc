import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import DesktopOfficialQuestNavigator from "../src/components/desktop-official-quest-navigator";
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
