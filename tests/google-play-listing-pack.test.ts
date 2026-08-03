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

test("Google Play listing pack is aligned with the current code-347 candidate", async () => {
  const [listing, appConfigSource] = await Promise.all([
    readFile(listingPath, "utf8"),
    readFile(appConfigPath, "utf8"),
  ]);
  const appConfig = JSON.parse(appConfigSource) as {
    expo: { name: string; version: string; android: { package: string; versionCode: number } };
  };

  assert.match(listing, /Candidate: `0\.1\.346 \(347\)` for Internal testing/);
  assert.match(listing, /Immutable EAS source: `6a0888cb2b76a667168806b7da186dbd3583c451`/);
  assert.match(listing, /AAB SHA-256: `87353e5b90e6769063524fd830a663b449c4088b3c9c60a2310beca0cef6d316`/);
  assert.doesNotMatch(
    listing,
    /code[- ]?34[15]|0\.1\.34[04]|android-v344-code345|b4847e7b42817f1cc3109f37c1296465018edbce6aa65c390ab073ab21f8dc3d/i,
  );

  assert.equal(appConfig.expo.name, "Side Quest Chess");
  assert.equal(appConfig.expo.version, "0.1.346");
  assert.equal(appConfig.expo.android.package, "com.sidequestchess.app");
  assert.equal(appConfig.expo.android.versionCode, 346);
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

  assert.match(submissionPack, /Current Android candidate: `0\.1\.346 \(347\)`/);
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
    /Version: `0\.1\.336`|Android version code: `336`|PENDING ANDREAS|code[- ]?34[15]|0\.1\.34[04]|android-v344-code345|Turn normal chess games into playful side quests/i,
  );
});
