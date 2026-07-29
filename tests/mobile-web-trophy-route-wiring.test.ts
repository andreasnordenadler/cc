import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const trophyPagePath = new URL("../src/app/trophy-cabinet/page.tsx", import.meta.url);
const accountPagePath = new URL("../src/app/account/page.tsx", import.meta.url);

test("authenticated Trophy Cabinet loads owned and public Community Solo records into trophy projection", async () => {
  const source = await readFile(trophyPagePath, "utf8");

  assert.match(source, /getCustomSideQuests\(privateMetadata\)/);
  assert.match(source, /loadOptionalCommunityTrophyQuests\(\(\) => listPublicCommunitySideQuests\(client, \{ limit: null, viewerUserId: user\.id, maxPages: 10 \}\)\)/);
  assert.match(source, /ownedCustomQuests: customSideQuests/);
  assert.match(source, /communityQuests/);
  assert.match(source, /completedSoloCount=\{CHALLENGES\.filter\(\(challenge\) => progress\.completedChallengeIds\.includes\(challenge\.id\)\)\.length\}/);
});

test("authenticated Account trophy preview uses the same Custom and Community Solo reward sources", async () => {
  const source = await readFile(accountPagePath, "utf8");

  assert.match(source, /loadOptionalCommunityTrophyQuests\(\(\) => listPublicCommunitySideQuests\(client, \{ limit: null, viewerUserId: user\.id, maxPages: 10 \}\)\)/);
  assert.match(source, /ownedCustomQuests: customSideQuests/);
  assert.match(source, /communityQuests/);
});
