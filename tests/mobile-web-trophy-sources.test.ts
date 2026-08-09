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
    signedIn: true,
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

test("Custom and Community Solo rewards render in the Android-matched Solo cabinet section", () => {
  const html = renderToStaticMarkup(React.createElement(MobileTrophyCabinetScreen, {
    signedIn: true,
    trophyRows: [
      {
        id: "solo-custom-alpha",
        title: "Knight Errand",
        meta: "Custom Solo Side Quest · Custom Side Quest",
        href: "/custom-side-quests/custom-alpha",
        source: "customSolo",
      },
      {
        id: "solo-community-beta",
        title: "Pawn Parade",
        meta: "Community Solo Side Quest · Community Side Quest",
        href: "/challenges/community/community-beta",
        source: "communitySolo",
      },
    ],
    completedSoloCount: 2,
    proofReceiptCount: 2,
    officialSoloCount: 9,
    officialChallenges: [],
  }));

  assert.match(html, /Official, Custom, and Community Solo Side Quest Coats of Arms/);
  assert.match(html, /Knight Errand/);
  assert.match(html, /Pawn Parade/);
  assert.match(html, /1 Custom Solo Side Quest/);
  assert.match(html, /1 Community Solo Side Quest/);
});

test("trophy source follows the canonical official flag with legacy id fallback", () => {
  assert.equal(getMultiplayerTrophySource({ id: "official-cycle", official: false }), "officialMultiplayer");
  assert.equal(getMultiplayerTrophySource({ id: "current-cycle", official: true }), "officialMultiplayer");
  assert.equal(getMultiplayerTrophySource({ id: "friday-forks", official: false }), "communityMultiplayer");
});
