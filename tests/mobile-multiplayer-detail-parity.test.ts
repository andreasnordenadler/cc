import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";

import { MobileMultiplayerDetailScreen, MobileMultiplayerSideQuestsScreen } from "../src/components/mobile-app-web-shell";
import { leaveGroupQuest } from "../src/lib/group-quest-leave";
import { buildGroupQuestSharePayload, shareGroupQuest } from "../src/lib/group-quest-share";
import { validateCommunityMultiplayerReport } from "../src/lib/mobile-web-parity-actions";
import { createCommunityMultiplayerReportSubmitter, submitCommunityMultiplayerReport } from "../src/lib/community-multiplayer-report";
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
  assert.match(html, />Leave Side Quest</);
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
  assert.match(html, /aria-label="Report this Community Multiplayer Side Quest"/);
  assert.match(html, />Report this Side Quest</);
  assert.doesNotMatch(html, /Check my latest game|Leave Side Quest/);
});

test("official Multiplayer detail does not offer the Community report action", () => {
  const html = renderDetail(officialJoinedQuest);
  assert.doesNotMatch(html, /Report this Community Multiplayer Side Quest|Report this Side Quest/);
});

test("hostless Community Multiplayer detail still offers reporting", () => {
  const html = renderDetail({ ...officialJoinedQuest, sourceBadge: "Community", hostName: undefined });
  assert.match(html, /aria-label="Report this Community Multiplayer Side Quest"/);
});

test("Community Multiplayer reports require a useful reason and identify the exact quest", () => {
  assert.deepEqual(validateCommunityMultiplayerReport("community/table", "  "), {
    ok: false,
    message: "Add a short reason before reporting this Side Quest.",
  });
  assert.deepEqual(validateCommunityMultiplayerReport("community/table", "  misleading   rules  "), {
    ok: true,
    message: "Community Multiplayer Side Quest community/table: misleading rules",
  });
});

test("Community Multiplayer report sends only the exact support message", async () => {
  const requests: Array<{ url: string; init?: RequestInit }> = [];
  const result = await submitCommunityMultiplayerReport("community/table", "misleading rules", async (url, init) => {
    requests.push({ url, init });
    return Response.json({ ok: true });
  });

  assert.equal(requests.length, 1);
  assert.equal(requests[0]?.url, "/api/support");
  assert.equal(requests[0]?.init?.method, "POST");
  assert.deepEqual(JSON.parse(String(requests[0]?.init?.body)), {
    message: "Community Multiplayer Side Quest community/table: misleading rules",
  });
  assert.deepEqual(result, { kind: "success", message: "Report sent. We’ll review this Multiplayer Side Quest." });
});

test("Community Multiplayer report submitter rejects overlapping duplicate activation", async () => {
  let resolveRequest!: (response: Response) => void;
  let requests = 0;
  const submit = createCommunityMultiplayerReportSubmitter(async () => {
    requests += 1;
    return new Promise<Response>((resolve) => { resolveRequest = resolve; });
  });

  const first = submit("community/table", "misleading rules");
  const duplicate = await submit("community/table", "misleading rules");
  assert.equal(requests, 1);
  assert.deepEqual(duplicate, { kind: "busy", message: "Report already sending." });
  resolveRequest(Response.json({ ok: true }));
  assert.equal((await first).kind, "success");
});

test("Community Multiplayer report hides server and network details behind a safe error", async () => {
  assert.deepEqual(
    await submitCommunityMultiplayerReport("community/table", "misleading rules", async () => Response.json({ message: "private provider detail" }, { status: 503 })),
    { kind: "error", message: "Could not send the report. Try again." },
  );
  assert.deepEqual(
    await submitCommunityMultiplayerReport("community/table", "misleading rules", async () => { throw new Error("private network detail"); }),
    { kind: "error", message: "Could not send the report. Try again." },
  );
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

test("hosted Multiplayer detail keeps exact owner settings reachable until standings freeze", () => {
  const hostedWithoutParticipation = renderDetail({
    ...officialJoinedQuest,
    id: "community/table",
    sourceBadge: "Community",
    status: "Hosted",
    viewerJoined: false,
    hostName: "Current user",
  });
  assert.match(hostedWithoutParticipation, />Join first</);
  assert.match(hostedWithoutParticipation, />Join your Multiplayer Side Quest before playing your proof game\.</);
  assert.match(hostedWithoutParticipation, />Join Side Quest</);
  assert.match(hostedWithoutParticipation, /href="\/groupquests\/community%2Ftable\/edit"/);
  assert.match(hostedWithoutParticipation, />Manage Side Quest</);
  assert.doesNotMatch(hostedWithoutParticipation, /Check my latest game|Leave Side Quest/);

  const hostedParticipant = renderDetail({
    ...officialJoinedQuest,
    sourceBadge: "Community",
    status: "Hosted",
    viewerJoined: true,
    hostName: "Current user",
  });
  assert.match(hostedParticipant, />Next action</);
  assert.match(hostedParticipant, />Check my latest game</);
  assert.match(hostedParticipant, />Leave Side Quest</);
  assert.match(hostedParticipant, /href="\/groupquests\/official-starter-shield\/edit"/);
  assert.doesNotMatch(hostedParticipant, /Join your Multiplayer Side Quest/);

  const finishedHost = renderDetail({ ...officialJoinedQuest, status: "Hosted", lifecycle: "finished" });
  assert.doesNotMatch(finishedHost, /Manage Side Quest|\/edit/);
});

test("signed-out and finished Multiplayer states keep safe actions", () => {
  const signedOut = renderDetail({ ...officialJoinedQuest, status: "Not joined", viewerJoined: false }, false);
  assert.match(signedOut, />Sign in first</);
  assert.match(signedOut, />Sign in to join</);
  assert.doesNotMatch(signedOut, /Check my latest game|Leave Side Quest/);

  const finished = renderDetail({ ...officialJoinedQuest, lifecycle: "finished" });
  assert.match(finished, />Receipts locked</);
  assert.doesNotMatch(finished, /Check my latest game|Join Side Quest|Leave Side Quest/);
});

test("Multiplayer leave reports a safe error when the request cannot reach SQC", async () => {
  const result = await leaveGroupQuest("official-starter-shield", {
    confirm: () => true,
    request: async () => { throw new Error("private network detail"); },
  });

  assert.deepEqual(result, { kind: "error", message: "Could not leave this quest right now." });
});

test("Multiplayer leave posts only to the exact quest and navigates after success", async () => {
  const requests: Array<{ url: string; method?: string }> = [];
  const destinations: string[] = [];
  const result = await leaveGroupQuest("group/42", {
    confirm: () => true,
    request: async (url, init) => {
      requests.push({ url, method: init.method });
      return Response.json({ ok: true });
    },
    navigate: (destination) => { destinations.push(destination); },
  });

  assert.deepEqual(requests, [{ url: "/api/groupquests/group%2F42/leave", method: "POST" }]);
  assert.deepEqual(destinations, ["/groupquests/group%2F42"]);
  assert.deepEqual(result, { kind: "success" });
});

test("Multiplayer leave cancellation names the consequence and performs no request", async () => {
  let prompt = "";
  let requests = 0;
  const result = await leaveGroupQuest("group-42", {
    confirm: (message) => { prompt = message; return false; },
    request: async () => { requests += 1; return Response.json({ ok: true }); },
  });

  assert.match(prompt, /participant entry will be removed.*rejoin later/i);
  assert.equal(requests, 0);
  assert.deepEqual(result, { kind: "cancelled" });
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

test("active Multiplayer detail renders the live leaderboard and marks the viewer", () => {
  const html = renderDetail({
    ...officialJoinedQuest,
    positionLabel: "#2",
    leaderboardRows: [
      { rank: 1, name: "Ada", provider: "lichess · ada", progress: "2/3", placement: "Gold", viewer: false },
      { rank: 2, name: "Current player", provider: "chess.com · current", progress: "1/3", placement: "Silver", viewer: true },
    ],
  });

  assert.match(html, /aria-label="Live leaderboard"/);
  assert.match(html, />Current Multiplayer Side Quest standings\.</);
  assert.match(html, />Ada</);
  assert.match(html, /2\/3/);
  assert.match(html, />Current player · You</);
  assert.match(html, /1\/3/);
  assert.doesNotMatch(html, /Final leaderboard|Frozen player standings/);
});

test("active Multiplayer detail reports an authoritative empty leaderboard truthfully", () => {
  const html = renderDetail({
    ...officialJoinedQuest,
    status: "Not joined",
    viewerJoined: false,
    playersLabel: "0 players",
    positionLabel: null,
    leaderboardRows: [],
  });

  assert.match(html, />No players have joined yet\.</);
  assert.doesNotMatch(html, /participant data is available/i);
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
