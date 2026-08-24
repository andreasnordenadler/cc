import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MobileSoloSideQuestsScreen } from "../src/components/mobile-app-web-shell";
import { CHALLENGES } from "../src/lib/challenges";
import { filterOfficialSideQuests } from "../src/lib/official-solo-discovery";

test("official Solo search matches title, objective, category, difficulty, and opening hint", () => {
  assert.deepEqual(
    filterOfficialSideQuests(CHALLENGES, "knights before coffee").map((quest) => quest.id),
    ["knights-before-coffee"],
  );
  assert.ok(filterOfficialSideQuests(CHALLENGES, "public finished").some((quest) => quest.id === "finish-any-game"));
  assert.ok(filterOfficialSideQuests(CHALLENGES, "starter quest").some((quest) => quest.id === "finish-any-game"));
  assert.ok(filterOfficialSideQuests(CHALLENGES, "absurd").every((quest) => quest.difficulty === "Absurd"));
  assert.ok(filterOfficialSideQuests(CHALLENGES, "escape square").some((quest) => quest.id === "back-rank-goblin"));
});

test("official Solo search treats blank and repeated whitespace as the complete catalog", () => {
  assert.deepEqual(filterOfficialSideQuests(CHALLENGES, "   "), CHALLENGES);
  assert.deepEqual(
    filterOfficialSideQuests(CHALLENGES, "  knights   coffee  ").map((quest) => quest.id),
    ["knights-before-coffee"],
  );
});

test("official Solo discovery renders a desktop search workspace with truthful result context", () => {
  const matches = filterOfficialSideQuests(CHALLENGES, "knights coffee");
  const html = renderToStaticMarkup(createElement(MobileSoloSideQuestsScreen, {
    challenges: matches,
    totalChallengeCount: CHALLENGES.length,
    query: "knights coffee",
  }));

  assert.match(html, /<form class="sqc-solo-search"/);
  assert.match(html, /<form[^>]*action="\/side-quests"/);
  assert.match(html, /<input[^>]*name="q"[^>]*value="knights coffee"|<input[^>]*value="knights coffee"[^>]*name="q"/);
  assert.match(html, /placeholder="Search titles, rules, or difficulty"/);
  assert.match(html, />1 of 13 official<\/span>/);
  assert.match(html, /<a class="sqc-solo-search-clear" href="\/side-quests">Clear search<\/a>/);
  assert.match(html, /<h3[^>]*id="solo-difficulty-easy"[^>]*>Easy<\/h3>/);
  assert.match(html, /Knights Before Coffee/);
  assert.doesNotMatch(html, /No Castle Club/);
});

test("official Solo discovery gives zero matches an honest recovery state", () => {
  const html = renderToStaticMarkup(createElement(MobileSoloSideQuestsScreen, {
    challenges: [],
    totalChallengeCount: CHALLENGES.length,
    query: "dragon",
  }));

  assert.match(html, />No official Side Quests match “dragon”\.<\/h3>/);
  assert.match(html, />Try a title, rule, category, or difficulty — or clear the search to restore all 13 quests\.<\/p>/);
  assert.match(html, /href="\/side-quests">Clear search<\/a>/);
  assert.doesNotMatch(html, /aria-label="Jump to quest difficulty"/);
});

test("official Solo route derives the desktop search from the current query without changing canonical data", () => {
  const route = readFileSync("src/app/side-quests/page.tsx", "utf8");
  assert.match(route, /searchParams:\s*Promise<\{\s*q\?:\s*string\s*\|\s*string\[\]\s*}>/);
  assert.match(route, /const query = typeof rawQuery === "string" \? rawQuery\.trim\(\) : "";/);
  assert.match(route, /const visibleChallenges = filterOfficialSideQuests\(CHALLENGES, query\);/);
  assert.match(route, /challenges=\{visibleChallenges\}/);
  assert.match(route, /totalChallengeCount=\{CHALLENGES\.length\}/);
  assert.match(route, /query=\{query\}/);
});
