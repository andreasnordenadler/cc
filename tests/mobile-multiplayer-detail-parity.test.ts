import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";

import { MobileMultiplayerDetailScreen } from "../src/components/mobile-app-web-shell";
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

test("finished lifecycle is shown from quest data instead of hardcoding OPEN", () => {
  const html = renderDetail({ ...officialJoinedQuest, lifecycle: "finished", timeLeftLabel: "Final" });
  assert.match(html, />FINISHED</);
  assert.doesNotMatch(html, />OPEN</);
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

test("public Multiplayer detail seal has a dedicated in-flow CSS override with no negative top clipping", async () => {
  const css = await readFile(new URL("../src/app/mobile-web.css", import.meta.url), "utf8");
  assert.match(css, /\.sqc-multiplayer-public-detail-screen \.sqc-multiplayer-detail-hero > \.sqc-section-mark\s*\{[\s\S]*?position:\s*relative;[\s\S]*?top:\s*auto;[\s\S]*?transform:\s*none;/);
});
