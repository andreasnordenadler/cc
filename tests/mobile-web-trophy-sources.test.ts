import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { MobileTrophyCabinetScreen } from "../src/components/mobile-app-web-shell";
import { getMultiplayerTrophySource } from "../src/lib/mobile-web-trophies";

const communityPodium = {
  id: "multiplayer-community-table-gold",
  title: "Friday Forks",
  meta: "Community Multiplayer placement · 1st place",
  href: "/groupquests/community-table?accepted=1",
  statusImage: "/mobile-source/stamps/sqc-gold-seal.png",
  source: "communityMultiplayer",
} as const;

test("community Multiplayer podiums are separated from official trophies", () => {
  const html = renderToStaticMarkup(React.createElement(MobileTrophyCabinetScreen, {
    trophyRows: [communityPodium],
    completedSoloCount: 0,
    proofReceiptCount: 0,
    officialSoloCount: 0,
    officialChallenges: [],
  }));

  assert.match(html, /Community Multiplayer trophies/);
  assert.match(html, /1 Community Multiplayer Side Quest podium/);
  assert.doesNotMatch(html, /1 Official Multiplayer Side Quest podium/);
});

test("trophy source follows the canonical official flag with legacy id fallback", () => {
  assert.equal(getMultiplayerTrophySource({ id: "official-cycle", official: false }), "officialMultiplayer");
  assert.equal(getMultiplayerTrophySource({ id: "current-cycle", official: true }), "officialMultiplayer");
  assert.equal(getMultiplayerTrophySource({ id: "friday-forks", official: false }), "communityMultiplayer");
});
