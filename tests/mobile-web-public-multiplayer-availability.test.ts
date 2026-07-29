import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MobileMultiplayerSideQuestsScreen } from "../src/components/mobile-app-web-shell";
import { getMobileWebMultiplayerPreviews } from "../src/lib/mobile-web-multiplayer";

const emptyLikes = { get: () => ({ count: 0, likedByViewer: false }) };
const client = {} as Parameters<typeof getMobileWebMultiplayerPreviews>[0];

test("signed-out web catalog distinguishes unavailable public Multiplayer data from an available empty catalog", async () => {
  const unavailable = await getMobileWebMultiplayerPreviews(client, null, {
    listPublic: async () => { throw new Error("provider unavailable"); },
    listRelated: async () => [],
    getLikes: async () => emptyLikes,
  }, { signedOutUnavailableFallback: true });

  assert.equal(unavailable.catalogStatus, "unavailable");
  assert.deepEqual(unavailable.officialRows, []);
  assert.deepEqual(unavailable.communityRows, []);

  const officialHtml = renderToStaticMarkup(React.createElement(MobileMultiplayerSideQuestsScreen, {
    selectedTab: "official",
    signedIn: false,
    officialRows: [],
    communityRows: [],
    catalogStatus: unavailable.catalogStatus,
  }));
  const communityHtml = renderToStaticMarkup(React.createElement(MobileMultiplayerSideQuestsScreen, {
    selectedTab: "community",
    signedIn: false,
    officialRows: [],
    communityRows: [],
    catalogStatus: unavailable.catalogStatus,
  }));

  for (const html of [officialHtml, communityHtml]) {
    assert.match(html, /Public Multiplayer Side Quests could not be loaded\./);
    assert.match(html, /Check your connection and try again\./);
  }

  const available = await getMobileWebMultiplayerPreviews(client, null, {
    listPublic: async () => [],
    listRelated: async () => [],
    getLikes: async () => emptyLikes,
  });
  assert.equal(available.catalogStatus, "available");
  const emptyHtml = renderToStaticMarkup(React.createElement(MobileMultiplayerSideQuestsScreen, {
    selectedTab: "official",
    signedIn: false,
    officialRows: [],
    communityRows: [],
    catalogStatus: available.catalogStatus,
  }));
  assert.match(emptyHtml, /No official Multiplayer Side Quests are open\./);
  assert.doesNotMatch(emptyHtml, /could not be loaded/);
});

test("authenticated Multiplayer loading remains fail-closed when personalized data is unavailable", async () => {
  await assert.rejects(() => getMobileWebMultiplayerPreviews(client, "user-1", {
    listPublic: async () => { throw new Error("provider unavailable"); },
    listRelated: async () => [],
    getLikes: async () => emptyLikes,
  }), /provider unavailable/);
});

test("shared signed-out detail loading preserves its fail-closed default", async () => {
  await assert.rejects(() => getMobileWebMultiplayerPreviews(client, null, {
    listPublic: async () => { throw new Error("provider unavailable"); },
    listRelated: async () => [],
    getLikes: async () => emptyLikes,
  }), /provider unavailable/);
});
