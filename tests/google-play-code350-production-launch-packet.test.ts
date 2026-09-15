import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const packetPath = path.resolve("docs/SQC_GOOGLE_PLAY_PRODUCTION_LAUNCH_CODE350_2026-08-13.md");

async function sha256(filePath: string) {
  return createHash("sha256").update(await readFile(filePath)).digest("hex");
}

test("code 350 production packet binds one immutable release and listing asset set", async () => {
  const packet = await readFile(packetPath, "utf8");

  for (const identity of [
    "`com.sidequestchess.app`",
    "`0.1.349` / version code `350`",
    "`189c93a350eb48d2a325f3a3f4edd99ed110c4b5`",
    "`462821e5-6e2a-47c2-bfb8-0c2debcb0e34`",
    "`8003d55e46ed443dd34a9a9a6778334e5abf50081b417fd98685a2620778d01c`",
    "`85,617,302` bytes",
    "`891fdc5a80601eaa2b6db1f3fcb26ab756650179b40b3a3f5f58dd921d753cf2`",
  ]) {
    assert.ok(packet.includes(identity), `packet must bind ${identity}`);
  }

  const assets = [
    ["apps/mobile/store-assets/google-play/store-icon-512.png", "dece7654e1346e799a4ee39f4f1bc4dc399bf138ca96e2fea069d56e3d6a25e2"],
    ["apps/mobile/store-assets/google-play/feature-graphic-1024x500.png", "f89001e2662f29196a53170a8ef2f1f2b8117dc134b71351b54550934e810fe2"],
    ["apps/mobile/store-assets/google-play/code350-phone-screenshots/01-choose-a-solo-side-quest.png", "7c7093ec7c32f53628642d5982342c6b74e37585a178369926e9c9b781aa08ce"],
    ["apps/mobile/store-assets/google-play/code350-phone-screenshots/02-back-rank-goblin.png", "d2a8c1feb6331f344d09224096904dcc34ed59f4f50fbd59ab51bd813d1cf94b"],
    ["apps/mobile/store-assets/google-play/code350-phone-screenshots/03-play-multiplayer-side-quests.png", "3435d056c1acc5fb61962863e1853b1e853edeef0bb31f9b12469a0219f0ec4d"],
  ] as const;

  for (const [assetPath, expectedHash] of assets) {
    assert.equal(await sha256(path.resolve(assetPath)), expectedHash);
    assert.ok(packet.includes(`\`${assetPath}\``));
    assert.ok(packet.includes(`\`${expectedHash}\``));
  }
});

test("code 350 production packet fixes public store facts and the exact rollout transaction", async () => {
  const packet = await readFile(packetPath, "utf8");

  for (const fact of [
    "Crowdler AB",
    "Worldwide",
    "13+",
    "Free",
    "No ads",
    "No in-app purchases",
    "No subscriptions",
    "No real-money prizes",
    "Swedish law",
    "sam@crowdler.com",
    "Exactly two Internal testers remain approved",
    "100% of eligible users in all selected worldwide countries/regions",
  ]) {
    assert.ok(packet.includes(fact), `packet must include ${fact}`);
  }

  assert.match(packet, /promote the unchanged code-350 Internal release to Production/i);
  assert.match(packet, /submit only the enumerated packet-owned changes/i);
  assert.match(packet, /stop if Play groups any unrelated pending change/i);
  assert.match(packet, /screenshot provenance is not yet proven/i);
  assert.match(packet, /do not upload the phone screenshots until/i);
  assert.match(packet, /countdown or other time-sensitive state is still truthful on submission day/i);
  assert.match(packet, /100% rollout has no staged rollback window/i);
  assert.match(packet, /after public availability[\s\S]*corrective higher-version release/i);
  assert.match(packet, /submitted.*under review.*approved.*publicly installable/is);
  assert.match(packet, /do not upload code 350 again/i);
  assert.match(packet, /do not add or remove testers/i);
});

test("code 350 production packet fails closed on unresolved declarations and authority", async () => {
  const packet = await readFile(packetPath, "utf8");

  for (const blocker of [
    "Data safety",
    "App access",
    "Content rating",
    "Target audience",
    "Privacy policy",
    "Terms of Use",
    "moderation",
    "Play Console production availability",
  ]) {
    assert.ok(packet.includes(blocker), `packet must identify ${blocker}`);
  }

  assert.match(packet, /No production mutation is authorized by this document/i);
  assert.match(packet, /exact owner approval phrase/i);
  assert.match(packet, /APPROVE GOOGLE PLAY PUBLIC PRODUCTION LAUNCH OF UNCHANGED CODE 350/i);
  assert.match(packet, /stop without submission/i);
});

test("code 350 production packet records a launch-safe rollback handle", async () => {
  const packet = await readFile(packetPath, "utf8");

  assert.match(packet, /no previous Production release exists/i);
  assert.match(packet, /cancel or halt the pending publication/i);
  assert.match(packet, /code 350 remains the immutable Internal-testing recovery artifact/i);
  assert.match(packet, /corrective build must use version code 351 or higher/i);
});
