import assert from "node:assert/strict";
import test from "node:test";

import {
  buildCommunityDiscoveryHref,
  buildCommunityQuestDetailHref,
  parseCommunityDiscoveryState,
  resolveCommunityDiscoveryReturnHref,
} from "../src/lib/community-discovery-state";

test("Community discovery state round-trips through a quest detail return target", () => {
  const state = parseCommunityDiscoveryState({
    q: "  pawn storm  ",
    filter: "new",
    sort: "liked",
    limit: "30",
    creator: "andreas",
  });

  assert.deepEqual(state, {
    query: "pawn storm",
    filter: "new",
    sort: "liked",
    limit: 30,
    creator: "andreas",
  });

  const discoveryHref = buildCommunityDiscoveryHref(state);
  assert.equal(discoveryHref, "/community-side-quests?q=pawn+storm&filter=new&sort=liked&limit=30&creator=andreas");
  assert.equal(
    buildCommunityQuestDetailHref("quest/one", discoveryHref),
    "/challenges/community/quest%2Fone?returnTo=%2Fcommunity-side-quests%3Fq%3Dpawn%2Bstorm%26filter%3Dnew%26sort%3Dliked%26limit%3D30%26creator%3Dandreas",
  );
  assert.equal(resolveCommunityDiscoveryReturnHref(discoveryHref), discoveryHref);
});

test("Community discovery return targets reject external and malformed routes", () => {
  for (const unsafe of [
    "https://example.com/community-side-quests?q=pawn",
    "//example.com/community-side-quests",
    "/community-side-quests\\@example.com",
    "/community-side-quests/%2e%2e/account",
    "/community-side-quests#fake-panel",
    "/sign-in?returnTo=/community-side-quests",
  ]) {
    assert.equal(resolveCommunityDiscoveryReturnHref(unsafe), "/community-side-quests", unsafe);
  }

  assert.equal(
    resolveCommunityDiscoveryReturnHref("/community-side-quests?filter=unknown&sort=nope&limit=110&extra=discarded"),
    "/community-side-quests?limit=110",
  );
  assert.equal(
    resolveCommunityDiscoveryReturnHref("/community-side-quests?limit=20junk"),
    "/community-side-quests",
  );
});
