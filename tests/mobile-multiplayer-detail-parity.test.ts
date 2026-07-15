import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";

import { MobileMultiplayerDetailScreen, MobileMultiplayerSideQuestsScreen } from "../src/components/mobile-app-web-shell";
import { buildGroupQuestSharePayload, shareGroupQuest } from "../src/lib/group-quest-share";
import type { MobileWebMultiplayerPreview } from "../src/lib/mobile-web-multiplayer";

const officialJoinedQuest: MobileWebMultiplayerPreview = {
  id: "official-starter-shield",
  title: "Official 14-Day Starter Shield",
  meta: "SQC official · You joined",
  href: "/groupquests/official-starter-shield?accepted=1",
  sourceBadge: "SQC Official",
  hostName: "Side Quest Chess",
  inviteCopy: "A two-week official Multiplayer Side Quest.",
  quests: ["Any Game Counts", "Knights Before Coffee", "Bishop Field Trip"],
  rules: [["Games allowed", "Lichess or Chess.com"]],
  status: "Joined",
  playersLabel: "1 player",
  timeLeftLabel: "6d left",
  positionLabel: "#1",
  leaderboardRows: [],
  likeSummary: { count: 0, likedByViewer: false },
  lifecycle: "open",
  createdAt: "2026-07-01T00:00:00.000Z",
  endAt: "2026-07-20T00:00:00.000Z",
};

function renderDetail(quest: MobileWebMultiplayerPreview, signedIn = true) {
  const router = {
    back() {},
    forward() {},
    prefetch() {},
    push() {},
    refresh() {},
    replace() {},
  };
  return renderToStaticMarkup(React.createElement(AppRouterContext.Provider, { value: router },
    React.createElement(MobileMultiplayerDetailScreen, { quest, signedIn }),
  ));
}

test("joined official Multiplayer detail renders the Android next action and real share controls without an official host card", () => {
  const html = renderDetail(officialJoinedQuest);

  assert.match(html, />Next action</);
  assert.match(html, />Refresh proof after your next eligible game\.</);
  assert.match(html, />SQC checks only fresh public games inside this Multiplayer window\.</);
  assert.match(html, />Check my latest game</);
  assert.match(html, />Share Side Quest</);
  assert.match(html, />Copy invite link</);
  assert.doesNotMatch(html, /Back to catalog|Joined Side Quest|before joining|Created by|Hosted by Side Quest Chess/);
});

test("not-joined Multiplayer detail keeps direct joining and community quests keep their host card", () => {
  const html = renderDetail({
    ...officialJoinedQuest,
    id: "community-table",
    sourceBadge: "Community",
    hostName: "Ada",
    status: "Not joined",
    positionLabel: null,
  });

  assert.match(html, />Join first</);
  assert.match(html, />Join Side Quest</);
  assert.match(html, />Created by</);
  assert.match(html, />Hosted by Ada</);
  assert.doesNotMatch(html, /Check my latest game/);
});

test("signed-in Multiplayer detail exposes the Android like action beside the title", () => {
  const html = renderDetail({
    ...officialJoinedQuest,
    likeSummary: { count: 7, likedByViewer: true },
  });

  assert.match(html, /<button[^>]*class="sqc-like-pill liked"[^>]*aria-pressed="true"/);
  assert.match(html, /aria-label="Unlike Official 14-Day Starter Shield\. 7 likes\."/);
  assert.match(html, /data-icon="thumb-up"/);
});

test("signed-in official Multiplayer catalog keeps the exact row link beside the Android like action", () => {
  const html = renderToStaticMarkup(React.createElement(MobileMultiplayerSideQuestsScreen, {
    selectedTab: "official",
    signedIn: true,
    officialRows: [{ ...officialJoinedQuest, likeSummary: { count: 3, likedByViewer: false } }],
    communityRows: [],
  }));

  assert.match(html, /<a class="sqc-app-row-main" aria-label="Open Official 14-Day Starter Shield" href="\/groupquests\/official-starter-shield\?accepted=1"><\/a>/);
  assert.match(html, /<button[^>]*class="sqc-like-pill"[^>]*aria-pressed="false"/);
  assert.match(html, /aria-label="Like Official 14-Day Starter Shield\. 3 likes\."/);
});

test("signed-in Community Multiplayer catalog rows expose the same exact like mutation", () => {
  const communityQuest = {
    ...officialJoinedQuest,
    id: "community-table",
    href: "/groupquests/community-table",
    title: "Ada's Table",
    sourceBadge: "Community" as const,
    likeSummary: { count: 2, likedByViewer: false },
  };
  const html = renderToStaticMarkup(React.createElement(MobileMultiplayerSideQuestsScreen, {
    selectedTab: "community",
    signedIn: true,
    officialRows: [],
    communityRows: [communityQuest],
  }));

  assert.match(html, /aria-label="Open Ada&#x27;s Table"/);
  assert.match(html, /<button[^>]*class="sqc-like-pill"[^>]*aria-pressed="false"/);
  assert.match(html, /aria-label="Like Ada&#x27;s Table\. 2 likes\."/);
});

test("Community Multiplayer like rows keep the full text track instead of the missing icon track", async () => {
  const css = await readFile(new URL("../src/app/mobile-web.css", import.meta.url), "utf8");
  assert.match(css, /\.sqc-app-row\.sqc-app-row-with-like\.text-only\s*\{\s*grid-template-columns:\s*minmax\(0,\s*1fr\) auto;/);
});

test("hosted Multiplayer detail only offers proof refresh when the host is also a participant", () => {
  const hostedWithoutParticipation = renderDetail({
    ...officialJoinedQuest,
    sourceBadge: "Community",
    status: "Hosted",
    viewerJoined: false,
    hostName: "Current user",
  });
  assert.match(hostedWithoutParticipation, />Join first</);
  assert.match(hostedWithoutParticipation, />Join your Multiplayer Side Quest before playing your proof game\.</);
  assert.match(hostedWithoutParticipation, />Join Side Quest</);
  assert.doesNotMatch(hostedWithoutParticipation, /Check my latest game/);

  const hostedParticipant = renderDetail({
    ...officialJoinedQuest,
    sourceBadge: "Community",
    status: "Hosted",
    viewerJoined: true,
    hostName: "Current user",
  });
  assert.match(hostedParticipant, />Next action</);
  assert.match(hostedParticipant, />Check my latest game</);
  assert.doesNotMatch(hostedParticipant, /Join your Multiplayer Side Quest/);
});

test("signed-out and finished Multiplayer states keep safe actions", () => {
  const signedOut = renderDetail({ ...officialJoinedQuest, status: "Not joined", viewerJoined: false }, false);
  assert.match(signedOut, />Sign in first</);
  assert.match(signedOut, />Sign in to join</);
  assert.doesNotMatch(signedOut, /Check my latest game/);

  const finished = renderDetail({ ...officialJoinedQuest, lifecycle: "finished" });
  assert.match(finished, />Receipts locked</);
  assert.doesNotMatch(finished, /Check my latest game|Join Side Quest/);
});

test("finished lifecycle is shown from quest data instead of hardcoding OPEN", () => {
  const html = renderDetail({ ...officialJoinedQuest, lifecycle: "finished", timeLeftLabel: "Final" });
  assert.match(html, />FINISHED</);
  assert.doesNotMatch(html, />OPEN</);
});

test("finished Multiplayer detail renders the final result and frozen leaderboard", () => {
  const html = renderDetail({
    ...officialJoinedQuest,
    lifecycle: "finished",
    timeLeftLabel: "Final",
    positionLabel: "#2",
    leaderboardRows: [
      { rank: 1, name: "Ada", provider: "lichess · ada", progress: "3/3", placement: "Gold", viewer: false },
      { rank: 2, name: "Current player", provider: "chess.com · current", progress: "2/3", placement: "Silver", viewer: true },
      { rank: 3, name: "Lin", provider: "lichess · lin", progress: "1/3", placement: "Bronze", viewer: false },
    ],
  });

  assert.match(html, />Final result</);
  assert.match(html, />Silver finish\.</);
  assert.match(html, />Final leaderboard</);
  assert.match(html, />Ada</);
  assert.match(html, /3\/3/);
  assert.match(html, />Current player/);
  assert.match(html, /2\/3/);
  assert.match(html, />Share final result</);
  assert.match(html, />Copy final link</);
});

test("share payload uses the current origin and exact encoded quest path without identity data", async () => {
  const payload = buildGroupQuestSharePayload({
    id: "group/42",
    title: "Fork & Pin",
    origin: "https://sidequestchess.com/account?user=private",
  });
  assert.deepEqual(payload, {
    title: "Fork & Pin",
    text: "Join me for “Fork & Pin” on Side Quest Chess.",
    url: "https://sidequestchess.com/groupquests/group%2F42",
  });

  let shared: unknown;
  let copied = "";
  const result = await shareGroupQuest(payload, {
    share: async (value) => { shared = value; },
    clipboard: { writeText: async (value) => { copied = value; } },
  });
  assert.deepEqual(shared, payload);
  assert.equal(copied, "");
  assert.deepEqual(result, { kind: "shared", message: "Side Quest shared." });
});

test("share falls back to copying the exact invite URL when native sharing is unavailable", async () => {
  const payload = buildGroupQuestSharePayload({ id: "group-42", title: "Fork", origin: "https://example.com" });
  let copied = "";
  const result = await shareGroupQuest(payload, {
    clipboard: { writeText: async (value) => { copied = value; } },
  });
  assert.equal(copied, payload.url);
  assert.deepEqual(result, { kind: "copied", message: "Invite link copied." });
});

test("native share cancellation and failure return safe human-readable status", async () => {
  const payload = buildGroupQuestSharePayload({ id: "group-42", title: "Fork", origin: "https://example.com" });
  const cancelled = await shareGroupQuest(payload, { share: async () => { throw new DOMException("cancelled", "AbortError"); } });
  const failed = await shareGroupQuest(payload, { share: async () => { throw new Error("private browser detail"); } });
  assert.deepEqual(cancelled, { kind: "cancelled", message: "Sharing cancelled." });
  assert.deepEqual(failed, { kind: "error", message: "Could not open sharing. Copy the invite link instead." });
});

test("public Multiplayer detail seal has a dedicated in-flow CSS override with no negative top clipping", async () => {
  const css = await readFile(new URL("../src/app/mobile-web.css", import.meta.url), "utf8");
  assert.match(css, /\.sqc-multiplayer-public-detail-screen \.sqc-multiplayer-detail-hero > \.sqc-section-mark\s*\{[\s\S]*?position:\s*relative;[\s\S]*?top:\s*auto;[\s\S]*?transform:\s*none;/);
});
