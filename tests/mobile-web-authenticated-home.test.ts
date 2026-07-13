import assert from "node:assert/strict";
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
