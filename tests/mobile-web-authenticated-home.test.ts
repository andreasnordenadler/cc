import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { MiniChessBoard, SignedInHome } from "../src/components/mobile-app-web-shell";
import DeactivateQuestControl from "../src/components/deactivate-quest-control";
import { CHALLENGES } from "../src/lib/challenges";
import { checkActiveCustomSoloQuest } from "../src/lib/mobile-web-active-solo-check";
import { buildHomeActiveSoloProofPath, resolveHomeActiveSoloQuest } from "../src/lib/mobile-web-home";
import { decodePublicProof } from "../src/lib/proof-share";

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

test("active Custom Home refresh uses the authenticated custom-capable quest route", async () => {
  const requests: Array<{ input: string; init?: RequestInit }> = [];
  const result = await checkActiveCustomSoloQuest(async (input: string | URL | Request, init?: RequestInit) => {
    requests.push({ input: String(input), init });
    return new Response(JSON.stringify({ ok: true, message: "Latest-game check done." }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  });

  assert.deepEqual(requests, [{
    input: "/api/mobile/quest",
    init: {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "check" }),
    },
  }]);
  assert.deepEqual(result, {
    status: "checked",
    completion: null,
    message: "Latest-game check done.",
    error: null,
  });
});

test("Home wires nonofficial active Solo refresh to the custom-capable checker", async () => {
  const [shellSource, actionSource] = await Promise.all([
    readFile(new URL("../src/components/mobile-app-web-shell.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/active-solo-actions.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(shellSource, /<ActiveSoloActions checkMode=\{activeSolo\.source === "custom" \|\| activeSolo\.source === "community" \? "custom" : "official"\} \/>/);
  assert.match(actionSource, /checkMode === "custom" \? checkActiveCustomSoloQuestAction : checkActiveChallengeWithResult/);
});

test("completed Custom Solo on Home links directly to its accepted proof", async () => {
  const quest = {
    id: "custom/home-proof",
    title: "Home Proof Quest",
    summary: "Move a knight and win.",
    config: "{\"version\":2,\"logic\":\"all\",\"blocks\":[]}",
    lifecycle: "published" as const,
    visibility: "private" as const,
    badgeImageUrl: "/badges/custom/community/community-coat-08.png",
    createdAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-02T00:00:00.000Z",
  };
  const attempt = {
    challengeId: quest.id,
    status: "passed" as const,
    checkedAt: "2026-07-29T12:00:00.000Z",
    gameId: "accepted-custom-home-game",
    provider: "lichess" as const,
    summary: "Custom proof accepted.",
  };

  const path = await buildHomeActiveSoloProofPath({
    completed: true,
    officialChallenge: null,
    customQuest: quest,
    attempt,
    runnerName: "Side Quest Chess tester",
  });

  assert.ok(path?.startsWith("/proof/"));
  const decoded = await decodePublicProof(path?.slice("/proof/".length));
  assert.equal(decoded?.payload.challengeId, quest.id);
  assert.equal(decoded?.payload.gameId, attempt.gameId);
  assert.equal(decoded?.payload.challengeTitle, quest.title);
});

test("Home proof paths stay absent for incomplete or unresolved nonofficial Solo quests", async () => {
  const customQuest = {
    id: "custom/incomplete",
    title: "Incomplete quest",
    summary: "Not completed yet.",
    config: "{}",
    createdAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-02T00:00:00.000Z",
  };

  assert.equal(await buildHomeActiveSoloProofPath({
    completed: false,
    officialChallenge: null,
    customQuest,
    attempt: null,
  }), null);
  assert.equal(await buildHomeActiveSoloProofPath({
    completed: true,
    officialChallenge: null,
    customQuest: null,
    attempt: null,
  }), null);
});

test("Home keeps the accepted Official Solo proof contract unchanged", async () => {
  const challenge = CHALLENGES[0];
  const attempt = {
    challengeId: challenge.id,
    status: "passed" as const,
    checkedAt: "2026-07-29T12:00:00.000Z",
    gameId: "accepted-official-home-game",
    provider: "chess.com" as const,
    summary: "Official proof accepted.",
  };
  const path = await buildHomeActiveSoloProofPath({
    completed: true,
    officialChallenge: challenge,
    customQuest: null,
    attempt,
    runnerName: "Side Quest Chess tester",
  });
  const decoded = await decodePublicProof(path?.slice("/proof/".length));

  assert.equal(decoded?.payload.challengeId, challenge.id);
  assert.equal(decoded?.payload.runnerName, "Side Quest Chess tester");
  assert.equal(decoded?.payload.gameId, attempt.gameId);
});

test("authenticated Home resolves an active owned Custom Solo quest instead of showing the empty state", () => {
  const resolved = resolveHomeActiveSoloQuest("custom/knight", [{
    id: "custom/knight",
    title: "Knight Errand",
    summary: "Move the original knight before move ten.",
    config: "{}",
    lifecycle: "published",
    visibility: "private",
    badgeImageUrl: "/badges/custom/community/community-coat-07.png",
    createdAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-01T00:00:00.000Z",
  }], []);

  assert.deepEqual(resolved, {
    id: "custom/knight",
    href: "/custom-side-quests/custom%2Fknight",
    title: "Knight Errand",
    objective: "Move the original knight before move ten.",
    instruction: "Move the original knight before move ten.",
    badgeImage: "/badges/custom/community/community-coat-07.png",
    badgeColors: null,
    source: "custom",
  });
});

test("authenticated Home resolves an active Community Solo quest to its public detail", () => {
  const communityQuest = {
    id: "community/pawns",
    title: "Pawn Parade",
    summary: "Advance three pawns before move twelve.",
    config: "{}",
    lifecycle: "published" as const,
    visibility: "public" as const,
    badgeImageUrl: "/badges/custom/community/community-coat-08.png",
    createdAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-01T00:00:00.000Z",
    creatorName: "Quest runner",
    creatorKey: "sqc-player-viewer",
    creatorUserId: "viewer",
    creatorBrowsePath: "/community-side-quests?creator=sqc-player-viewer",
    detailPath: "/challenges/community/community%2Fpawns",
    ruleLabel: "Custom rule",
    ruleDetails: ["Custom rule"],
    updatedAtMs: 1,
    stats: { soloAttempts: 0, soloSelections: 1, soloCompletions: 0, multiplayerLineups: 0, multiplayerAttempts: 0, multiplayerFulfillments: 0 },
    popularityScore: 1,
    likeSummary: { count: 0, likedByViewer: false },
  };

  assert.deepEqual(resolveHomeActiveSoloQuest(communityQuest.id, [], [communityQuest]), {
    id: communityQuest.id,
    href: communityQuest.detailPath,
    title: communityQuest.title,
    objective: communityQuest.summary,
    instruction: communityQuest.summary,
    badgeImage: communityQuest.badgeImageUrl,
    badgeColors: null,
    source: "community",
  });
});

test("authenticated Home preserves an active Community Solo snapshot when bounded discovery cannot find its owner", () => {
  const resolved = resolveHomeActiveSoloQuest("community/beyond-page-limit", [], [], {
    id: "community/beyond-page-limit",
    title: "Faraway Knight Errand",
    config: "{\"version\":2,\"logic\":\"all\",\"blocks\":[]}",
    lifecycle: "published",
  });

  assert.deepEqual(resolved, {
    id: "community/beyond-page-limit",
    href: "/challenges/community/community%2Fbeyond-page-limit",
    title: "Faraway Knight Errand",
    objective: "Complete this community Side Quest rule in a fresh public game.",
    instruction: "Complete this community Side Quest rule in a fresh public game.",
    badgeImage: null,
    badgeColors: null,
    source: "community",
  });
});

test("authenticated Home tolerates a malformed legacy Custom summary", () => {
  const resolved = resolveHomeActiveSoloQuest("custom-legacy", [{
    id: "custom-legacy",
    title: "Legacy quest",
    summary: 42 as unknown as string,
    config: "{}",
    createdAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-01T00:00:00.000Z",
  }], []);

  assert.equal(resolved?.objective, "Complete your custom Side Quest rule in a fresh public game.");
});

test("Home page feeds authenticated Custom and Community records into active Solo resolution", async () => {
  const source = await readFile(new URL("../src/app/page.tsx", import.meta.url), "utf8");

  assert.match(source, /getCustomSideQuests\(privateMetadata\)/);
  assert.match(source, /listPublicCommunitySideQuests\([\s\S]*maxPages:\s*10/);
  assert.match(source, /resolveHomeActiveSoloQuest\(activeChallenge\?\.id, customSideQuests, communitySideQuests, activeChallenge\?\.customQuestSnapshot\)/);
  assert.match(source, /activeSolo=\{activeSoloQuest \? \{/);
  assert.match(source, /href:\s*activeSoloQuest\.href/);
  assert.match(source, /title:\s*activeSoloQuest\.title/);
  assert.match(source, /objective:\s*activeSoloQuest\.objective/);
});

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
