import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { CommunityMultiplayerCatalog } from "../src/components/catalog-clients";
import { MobileMultiplayerDetailScreen } from "../src/components/mobile-app-web-shell";

import {
  buildCommunityMultiplayerDetailHref,
  buildCommunityMultiplayerDiscoveryHref,
  buildUpdatedCommunityMultiplayerDiscoveryHref,
  normalizeCommunityMultiplayerDiscoveryText,
  parseCommunityMultiplayerDiscoveryState,
  resolveCommunityMultiplayerReturnHref,
} from "../src/lib/multiplayer-discovery-state";
import { continueDirectGroupQuestJoin, safeGroupQuestHref } from "../src/lib/mobile-web-parity-actions";

const DEFAULT_RETURN = "/multiplayer-side-quests?tab=community";

test("Community Multiplayer discovery state round-trips through a safe detail return", () => {
  const state = parseCommunityMultiplayerDiscoveryState({
    tab: "community",
    q: "  fork table  ",
    filter: "finished",
    sort: "liked",
    limit: "12",
    host: "Ada & Lin",
  });
  const discoveryHref = buildCommunityMultiplayerDiscoveryHref(state);

  assert.equal(
    discoveryHref,
    "/multiplayer-side-quests?tab=community&q=fork+table&filter=finished&sort=liked&limit=12&host=Ada+%26+Lin",
  );
  assert.equal(resolveCommunityMultiplayerReturnHref(discoveryHref), discoveryHref);
  assert.equal(
    buildCommunityMultiplayerDetailHref("/groupquests/community%2Ftable?accepted=1", discoveryHref),
    "/groupquests/community%2Ftable?accepted=1&returnTo=%2Fmultiplayer-side-quests%3Ftab%3Dcommunity%26q%3Dfork%2Btable%26filter%3Dfinished%26sort%3Dliked%26limit%3D12%26host%3DAda%2B%2526%2BLin",
  );
});

test("successful Community Multiplayer join keeps the server destination and catalog return", () => {
  const origin = "https://sidequestchess.com";
  const returnHref = "/multiplayer-side-quests?tab=community&q=fork&filter=all&sort=players&host=Ada";

  assert.equal(
    safeGroupQuestHref(
      "/groupquests/server-owned-id?accepted=1",
      origin,
      returnHref,
    ),
    "/groupquests/server-owned-id?accepted=1&returnTo=%2Fmultiplayer-side-quests%3Ftab%3Dcommunity%26q%3Dfork%26sort%3Dplayers%26host%3DAda",
  );
  assert.equal(
    safeGroupQuestHref(
      "https://evil.test/groupquests/server-owned-id?accepted=1",
      origin,
      returnHref,
    ),
    null,
  );
});

test("signed-in Community Multiplayer join follows the exact API destination with catalog context", async () => {
  const requests: Array<{ url: string; init?: RequestInit }> = [];
  const returnHref = "/multiplayer-side-quests?tab=community&q=fork&sort=players&host=Ada";

  const result = await continueDirectGroupQuestJoin({
    questId: "client-route-id",
    returnHref,
    origin: "https://sidequestchess.com",
    fetch: async (url, init) => {
      requests.push({ url: String(url), init });
      return new Response(JSON.stringify({ href: "/groupquests/server-owned-id?accepted=1#leaderboard" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    },
  });

  assert.equal(requests.length, 1);
  assert.equal(requests[0]?.url, "/api/groupquests/client-route-id/join");
  assert.equal(requests[0]?.init?.method, "POST");
  assert.equal(new Headers(requests[0]?.init?.headers).get("content-type"), "application/json");
  assert.deepEqual(JSON.parse(String(requests[0]?.init?.body)), {});
  assert.deepEqual(result, {
    ok: true,
    destination: "/groupquests/server-owned-id?accepted=1&returnTo=%2Fmultiplayer-side-quests%3Ftab%3Dcommunity%26q%3Dfork%26sort%3Dplayers%26host%3DAda#leaderboard",
  });
});

test("Community Multiplayer load-more increments from the latest URL state", () => {
  const increaseLimit = (state: ReturnType<typeof parseCommunityMultiplayerDiscoveryState>) => ({
    limit: state.limit + 4,
  });
  const firstHref = buildUpdatedCommunityMultiplayerDiscoveryHref(
    new URLSearchParams("tab=community"),
    increaseLimit,
  );
  const secondHref = buildUpdatedCommunityMultiplayerDiscoveryHref(
    new URL(firstHref, "https://sidequestchess.invalid").searchParams,
    increaseLimit,
  );

  assert.equal(firstHref, "/multiplayer-side-quests?tab=community&limit=8");
  assert.equal(secondHref, "/multiplayer-side-quests?tab=community&limit=12");
});

test("Community Multiplayer return targets fail closed to the Community catalog", () => {
  for (const unsafe of [
    "https://example.com/multiplayer-side-quests?tab=community",
    "//example.com/multiplayer-side-quests?tab=community",
    "/multiplayer-side-quests",
    "/multiplayer-side-quests?tab=official&host=Ada",
    "/multiplayer-side-quests\\@example.com?tab=community",
    "/multiplayer-side-quests/%2e%2e/account?tab=community",
    "/multiplayer-side-quests?tab=community#join-private-multiplayer",
    "/groupquests/community-table?returnTo=/multiplayer-side-quests?tab=community",
  ]) {
    assert.equal(resolveCommunityMultiplayerReturnHref(unsafe), DEFAULT_RETURN, unsafe);
  }
});

test("Community Multiplayer search truncation never leaves an unmatched Unicode surrogate", () => {
  const prefix = "x".repeat(119);
  const normalized = normalizeCommunityMultiplayerDiscoveryText(`  ${prefix}🏰 tail  `, 120);

  assert.equal(normalized, prefix);
  assert.equal(normalizeCommunityMultiplayerDiscoveryText(normalized, 120), normalized);
});

test("Community Multiplayer rows carry the active catalog URL into detail", () => {
  const html = renderToStaticMarkup(React.createElement(
    CommunityMultiplayerCatalog as React.ComponentType<Record<string, unknown>>,
    {
      signedIn: false,
      discoveryState: {
        query: "finished table",
        filter: "finished",
        sort: "liked",
        limit: 12,
        host: "Ada & Lin",
      },
      rows: [{
        id: "community/table",
        title: "Ada's finished table",
        meta: "Community public · 4 players · Final",
        href: "/groupquests/community%2Ftable",
        sourceBadge: "Community",
        hostName: "Ada & Lin",
        publiclyListed: true,
        inviteCopy: "Review the final table.",
        quests: ["Fork finder"],
        questRuleDetails: [],
        rules: [],
        status: "Not joined",
        playerCount: 4,
        playersLabel: "4 players",
        timeLeftLabel: "Final",
        leaderboardRows: [],
        likeSummary: { count: 8, likedByViewer: false },
        lifecycle: "finished",
        createdAt: "2026-09-01T00:00:00.000Z",
        startAt: "2026-09-01T00:00:00.000Z",
        endAt: "2026-09-02T00:00:00.000Z",
      }],
    },
  ));

  assert.match(
    html,
    /href="\/groupquests\/community%2Ftable\?returnTo=%2Fmultiplayer-side-quests%3Ftab%3Dcommunity%26q%3Dfinished%2Btable%26filter%3Dfinished%26sort%3Dliked%26limit%3D12%26host%3DAda%2B%2526%2BLin"/,
  );
  assert.match(
    html,
    /href="\/multiplayer-side-quests\?tab=community&amp;q=finished\+table&amp;filter=finished&amp;sort=liked&amp;limit=12">Show all hosts<\/a>/,
  );
});

test("Community Multiplayer detail links return to the filtered catalog", () => {
  const returnHref = "/multiplayer-side-quests?tab=community&q=fork&filter=all&sort=players&host=Ada";
  const html = renderToStaticMarkup(React.createElement(
    MobileMultiplayerDetailScreen as React.ComponentType<Record<string, unknown>>,
    {
      signedIn: false,
      returnHref,
      quest: {
        id: "community-table",
        title: "Ada's table",
        meta: "Community public · 2 players",
        href: "/groupquests/community-table",
        sourceBadge: "Community",
        hostName: "Ada",
        publiclyListed: true,
        inviteCopy: "Join the table.",
        quests: ["Fork finder"],
        questRuleDetails: [],
        rules: [],
        status: "Not joined",
        playerCount: 2,
        playersLabel: "2 players",
        timeLeftLabel: "2d left",
        leaderboardRows: [],
        likeSummary: { count: 0, likedByViewer: false },
        lifecycle: "open",
        createdAt: "2026-09-01T00:00:00.000Z",
        startAt: "2026-09-01T00:00:00.000Z",
        endAt: "2026-09-10T00:00:00.000Z",
      },
    },
  ));

  assert.match(
    html,
    /href="\/multiplayer-side-quests\?tab=community&amp;q=fork&amp;filter=all&amp;sort=players&amp;host=Ada">Multiplayer Side Quests<\/a>/,
  );
  assert.match(
    html,
    /href="\/sign-in\?redirect_url=%2Fgroupquests%2Fcommunity-table%3FreturnTo%3D%252Fmultiplayer-side-quests%253Ftab%253Dcommunity%2526q%253Dfork%2526sort%253Dplayers%2526host%253DAda">Sign in to join<\/a>/,
  );
});
