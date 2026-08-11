import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const listingPath = path.resolve("docs/SQC_GOOGLE_PLAY_LISTING_V340_2026-07-30.md");
const submissionPackPath = path.resolve("docs/SQC_MOBILE_STORE_SUBMISSION_PACK_2026-07-07.md");
const appConfigPath = path.resolve("apps/mobile/app.json");

function extractTextBlock(document: string, heading: string) {
  const headingStart = document.indexOf(`### ${heading}`);
  assert.notEqual(headingStart, -1, `${heading} heading must exist`);
  const nextHeadingStart = document.indexOf("\n### ", headingStart + 4);
  const section = document.slice(
    headingStart,
    nextHeadingStart === -1 ? document.length : nextHeadingStart,
  );
  const match = section.match(/```text\n([\s\S]*?)\n```/);
  assert.ok(match, `${heading} must have a paste-ready text block`);
  return match[1];
}

async function sha256(filePath: string) {
  return createHash("sha256").update(await readFile(filePath)).digest("hex");
}

test("Google Play listing pack preserves the verified code-349 candidate while source reserves the next baseline", async () => {
  const [listing, appConfigSource] = await Promise.all([
    readFile(listingPath, "utf8"),
    readFile(appConfigPath, "utf8"),
  ]);
  const appConfig = JSON.parse(appConfigSource) as {
    expo: { name: string; version: string; android: { package: string; versionCode: number } };
  };

  assert.match(listing, /Candidate: `0\.1\.348 \(349\)` for Internal testing/);
  assert.match(listing, /Frozen AAB: `side-quest-chess-android-v348-code349\.aab`/);
  assert.match(listing, /Immutable EAS source: `4925cd13b6a39a8be1658ac46c0bea396260dbd2`/);
  assert.match(listing, /AAB SHA-256: `c416609b1240114612f888c8a0fff205fafe0a8821ee4065cb833b395f7cbf71`/);
  assert.match(listing, /EAS build: `dd277377-25fb-4923-a1ec-10b930c25563` \(`production` \/ `STORE`\)/);
  assert.match(listing, /Committed app identity: `0\.1\.348` \/ code `348`; EAS production auto-increment reserved artifact code `349`/);
  assert.match(listing, /Capture from the Play-delivered code-349 install/);
  assert.match(listing, /correspondence with code 349 behavior/);
  assert.match(listing, /Google Play upload\/submission, listing edits, tester assignment, and publication remain explicit owner gates/);
  assert.doesNotMatch(
    listing,
    /code[- ]?34[1-8]|0\.1\.34[0-7]|android-v347-code348|side-quest-chess-android-v347-code348|5ece97b95de996b630775359e312a001e58ff59c|c8755b7175fc6902ec391c8ba2dc69488faf13dd0be78d321507026c89bb5576|c8290195-f35b-48b5-961d-907b7adb532b/i,
  );

  assert.equal(appConfig.expo.name, "Side Quest Chess");
  assert.equal(appConfig.expo.version, "0.1.349");
  assert.equal(appConfig.expo.android.package, "com.sidequestchess.app");
  assert.equal(appConfig.expo.android.versionCode, 349);
});

test("paste-ready Google Play copy stays within field limits", async () => {
  const listing = await readFile(listingPath, "utf8");
  const name = extractTextBlock(listing, "App name");
  const shortDescription = extractTextBlock(listing, "Short description");
  const fullDescription = extractTextBlock(listing, "Full description");

  assert.equal(name, "Side Quest Chess");
  assert.ok(name.length <= 30);
  assert.ok(shortDescription.length <= 80);
  assert.ok(fullDescription.length <= 4_000);
  assert.match(listing, new RegExp(`### App name — ${name.length} / 30 characters`));
  assert.match(listing, new RegExp(`### Short description — ${shortDescription.length} / 80 characters`));
  assert.match(listing, new RegExp(`### Full description — ${fullDescription.length.toLocaleString("en-US")} / 4,000 characters`));
});

test("listing asset inventory is bound to the reviewed repository files", async () => {
  const listing = await readFile(listingPath, "utf8");
  const iconHash = await sha256(path.resolve("apps/mobile/store-assets/google-play/store-icon-512.png"));
  const featureGraphicHash = await sha256(path.resolve("apps/mobile/store-assets/google-play/feature-graphic-1024x500.png"));

  assert.equal(iconHash, "dece7654e1346e799a4ee39f4f1bc4dc399bf138ca96e2fea069d56e3d6a25e2");
  assert.equal(featureGraphicHash, "f89001e2662f29196a53170a8ef2f1f2b8117dc134b71351b54550934e810fe2");
  assert.match(listing, new RegExp(iconHash));
  assert.match(listing, new RegExp(featureGraphicHash));
  assert.match(listing, /Current-candidate store screenshots[^\n]*\*\*Missing/);
});

test("legacy submission pack points to the current Play listing facts without stale Android identity", async () => {
  const submissionPack = await readFile(submissionPackPath, "utf8");

  assert.match(submissionPack, /Current Android candidate: `0\.1\.348 \(349\)`/);
  assert.match(submissionPack, /Committed Android identity: version `0\.1\.348`, version code `348`; EAS production auto-increment reserved candidate code `349`/);
  assert.match(submissionPack, /AAB: `side-quest-chess-android-v348-code349\.aab`/);
  assert.match(submissionPack, /SHA256: `c416609b1240114612f888c8a0fff205fafe0a8821ee4065cb833b395f7cbf71`/);
  assert.match(submissionPack, /EAS build: `dd277377-25fb-4923-a1ec-10b930c25563`/);
  assert.match(submissionPack, /Immutable source: `4925cd13b6a39a8be1658ac46c0bea396260dbd2`/);
  assert.match(submissionPack, /Capture the code-349 Google Play screenshot set/);
  assert.match(submissionPack, /Console changes, policy answers, uploads, tester assignment, and publication remain owner-gated/);
  assert.match(submissionPack, /Developer \/ publisher public name: Crowdler AB/);
  assert.match(submissionPack, /Support email: `sam@crowdler\.com`/);
  assert.match(submissionPack, /Countries \/ regions: Worldwide/);
  assert.match(submissionPack, /store-icon-512\.png/);
  assert.match(submissionPack, /feature-graphic-1024x500\.png/);
  assert.match(
    submissionPack,
    /Use the paste-ready app name, short description, and full description exactly as written in `docs\/SQC_GOOGLE_PLAY_LISTING_V340_2026-07-30\.md`\./,
  );
  assert.doesNotMatch(
    submissionPack,
    /Version: `0\.1\.336`|Android version code: `336`|PENDING ANDREAS|code[- ]?34[1-8]|0\.1\.34[0-7]|android-v347-code348|side-quest-chess-android-v347-code348|5ece97b95de996b630775359e312a001e58ff59c|c8755b7175fc6902ec391c8ba2dc69488faf13dd0be78d321507026c89bb5576|c8290195-f35b-48b5-961d-907b7adb532b|Turn normal chess games into playful side quests/i,
  );
});
