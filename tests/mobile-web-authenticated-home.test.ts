import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { MiniChessBoard, SignedInHome } from "../src/components/mobile-app-web-shell";
import DeactivateQuestControl from "../src/components/deactivate-quest-control";
import { CHALLENGES } from "../src/lib/challenges";

const failedSolo = {
  id: "one-bishop-to-rule-them-all",
  href: "/challenges/one-bishop-to-rule-them-all",
  title: "One Bishop to Rule Them All",
  objective: "Win a 15+ move game with only one bishop remaining as your minor piece.",
  instruction: "Keep the lonely diagonal manager alive.",
  badgeImage: "/mobile-source/badges/v6/one-bishop-to-rule-them-all.png",
  pickedAt: "2026-07-02T20:14:00.000Z",
  latestAttempt: {
    status: "failed",
    checkedAt: "2026-07-12T12:02:00.000Z",
    failureFen: "8/R3p3/5kp1/5b2/3p4/1P5P/P4PPK/8 w - - 0 1",
    failureUci: "b7b8",
    playerColor: "white" as const,
    summary: "One Bishop to Rule Them All only counts if the lonely diagonal manager also wins. Winner was White.",
  },
};

test("authenticated Home keeps Active Solo compact with one refresh control and one catalog action", () => {
  const html = renderToStaticMarkup(React.createElement(SignedInHome, {
    hasChessAccount: true,
    activeSolo: failedSolo,
    activeSoloTitle: null,
    activeMultiplayerRows: [],
    trophyRows: [],
    completedSoloCount: 0,
    proofReceiptCount: 0,
  }));

  assert.match(html, /aria-label="Refresh active Solo Side Quest"/);
  assert.match(html, /class="sqc-refresh-icon"[^>]*viewBox="0 0 24 24"/);
  assert.ok(html.indexOf("sqc-refresh-form") < html.indexOf("sqc-current-body"), "refresh form must be a direct card control before the card body");
  assert.equal((html.match(/Explore More Solo Side Quests/g) ?? []).length, 1);
  assert.doesNotMatch(html, /Check latest game|Reset active selection|Choose another Side Quest/);
});

test("completed Solo Home opens its accepted proof instead of offering another refresh", () => {
  const html = renderToStaticMarkup(React.createElement(SignedInHome, {
    hasChessAccount: true,
    activeSolo: {
      ...failedSolo,
      completed: true,
      proofHref: "/proof/accepted-home-proof",
      latestAttempt: { ...failedSolo.latestAttempt, status: "passed" },
    },
    activeSoloTitle: null,
    activeMultiplayerRows: [],
    trophyRows: [],
    completedSoloCount: 1,
    proofReceiptCount: 1,
  }));

  assert.match(html, /href="\/proof\/accepted-home-proof"/);
  assert.match(html, />View victory proof</);
  assert.doesNotMatch(html, /aria-label="Refresh active Solo Side Quest"/);
});

test("authenticated Home does not claim unsupported pull-to-refresh behavior", () => {
  const html = renderToStaticMarkup(React.createElement(SignedInHome, {
    hasChessAccount: true,
    activeSolo: failedSolo,
    activeSoloTitle: null,
    activeMultiplayerRows: [],
    trophyRows: [],
    completedSoloCount: 0,
    proofReceiptCount: 0,
  }));

  assert.doesNotMatch(html, /Pull down to refresh/i);
  assert.equal((html.match(/aria-label="Refresh active Solo Side Quest"/g) ?? []).length, 1);
});

test("authenticated Home renders the native empty Multiplayer preview row", () => {
  const html = renderToStaticMarkup(React.createElement(SignedInHome, {
    hasChessAccount: true,
    activeSolo: failedSolo,
    activeSoloTitle: null,
    activeMultiplayerRows: [],
    trophyRows: [],
    completedSoloCount: 0,
    proofReceiptCount: 0,
  }));

  assert.match(html, /No active Multiplayer Side Quests/);
  assert.match(html, /Join or host shared challenges with friends\./);
  assert.match(html, />Explore</);
});

test("authenticated Home previews five active Multiplayer rows and exposes the remaining rows", () => {
  const activeMultiplayerRows = Array.from({ length: 6 }, (_, index) => ({
    id: `quest-${index + 1}`,
    title: `Active table ${index + 1}`,
    meta: "You host · Community public",
    href: `/groupquests/quest-${index + 1}`,
    status: "Host" as const,
    sourceBadge: "Hosted" as const,
  }));
  const html = renderToStaticMarkup(React.createElement(SignedInHome, {
    hasChessAccount: true,
    activeSolo: failedSolo,
    activeSoloTitle: null,
    activeMultiplayerRows,
    trophyRows: [],
    completedSoloCount: 0,
    proofReceiptCount: 0,
  }));

  for (const title of activeMultiplayerRows.slice(0, 5).map((row) => row.title)) {
    assert.ok(html.indexOf(title) < html.indexOf("<details"), `${title} must remain in the five-row preview`);
  }
  assert.ok(html.indexOf("Active table 6") > html.indexOf("<details"), "the sixth row must be inside the expandable disclosure");
  assert.match(html, />Show all active Multiplayer Side Quests</);
  assert.match(html, />Show fewer active Multiplayer Side Quests</);
  assert.match(html, /1 more active Multiplayer Side Quest\./);
});

test("authenticated Home previews five Trophy Cabinet rows and exposes every remaining trophy", () => {
  const trophyRows = Array.from({ length: 6 }, (_, index) => ({
    id: `trophy-${index + 1}`,
    title: `Unlocked trophy ${index + 1}`,
    meta: index % 2 === 0 ? "Solo completion" : "Community Multiplayer placement",
    href: `/proof/trophy-${index + 1}`,
    source: index % 2 === 0 ? "solo" as const : "communityMultiplayer" as const,
  }));
  const html = renderToStaticMarkup(React.createElement(SignedInHome, {
    hasChessAccount: true,
    activeSolo: failedSolo,
    activeSoloTitle: null,
    activeMultiplayerRows: [],
    trophyRows,
    completedSoloCount: 3,
    proofReceiptCount: 3,
  }));

  for (const title of trophyRows.slice(0, 5).map((row) => row.title)) {
    assert.ok(html.indexOf(title) < html.indexOf("Show all Trophy Cabinet items"), `${title} must remain in the five-row preview`);
  }
  assert.ok(html.indexOf("Unlocked trophy 6") > html.indexOf("Show all Trophy Cabinet items"), "the sixth trophy must be inside the expandable disclosure");
  assert.match(html, />Show all Trophy Cabinet items</);
  assert.match(html, />Show fewer Trophy Cabinet items</);
  assert.match(html, /1 more unlocked item\./);
  assert.equal((html.match(/href="\/proof\/trophy-/g) ?? []).length, 6, "every proof destination must remain reachable");
});

test("mini board assigns piece colors from FEN rather than square color", () => {
  const html = renderToStaticMarkup(React.createElement(MiniChessBoard, {
    fen: "8/8/8/3pP3/8/8/8/8 w - - 0 1",
    orientation: "white",
  }));

  assert.match(html, /sqc-mini-piece black/);
  assert.match(html, /sqc-mini-piece white/);
});

test("active quest detail keeps a reachable deactivate control off the compact Home card", () => {
  const challenge = CHALLENGES.find((candidate) => candidate.id === "one-bishop-to-rule-them-all");
  assert.ok(challenge);

  const html = renderToStaticMarkup(React.createElement(DeactivateQuestControl, { challenge }));
  assert.match(html, />Deactivate</);
});

test("mini board fixes all 64 cells to an equal eight-by-eight grid and refresh spins while pending", async () => {
  const css = await readFile(new URL("../src/app/mobile-web.css", import.meta.url), "utf8");
  const actionSource = await readFile(new URL("../src/components/active-solo-actions.tsx", import.meta.url), "utf8");

  assert.match(css, /grid-template-columns:\s*repeat\(8, minmax\(0, 1fr\)\)/);
  assert.match(css, /grid-template-rows:\s*repeat\(8, minmax\(0, 1fr\)\)/);
  assert.match(css, /\.sqc-refresh\.spinning \.sqc-refresh-icon[\s\S]*animation:\s*sqc-refresh-spin/);
  assert.match(css, /\.sqc-home-row-collapse\s*\{[^}]*display:\s*none/);
  assert.match(css, /\.sqc-home-row-disclosure\[open\] \.sqc-home-row-expand\s*\{[^}]*display:\s*none/);
  assert.match(css, /\.sqc-home-row-disclosure\[open\] \.sqc-home-row-collapse\s*\{[^}]*display:\s*inline/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(actionSource, /pending \? "sqc-refresh spinning" : "sqc-refresh"/);
});
