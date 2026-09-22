import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const packet = readFileSync(
  new URL("../docs/IOS_APP_STORE_BUILD_3_APPROVAL_PACKET_2026-09-19.md", import.meta.url),
  "utf8",
);

test("build 3 approval packet binds the exact signed IPA and keeps every irreversible App Store action approval-gated", () => {
  assert.match(packet, /Frozen candidate source commit/);
  assert.doesNotMatch(packet, /Source commit \/ `origin\/main`/);
  assert.match(packet, /82a5fc62b24e107143f84107a87da3f264516dee/);
  assert.match(packet, /f2d28e6603268b42b38e939368fc504e70430f41/);
  assert.match(packet, /8000e9f2edd067a2d7d206f292b5ea7695db3c19f53c8e190bcf618a9ba544f7/);
  assert.match(packet, /0\.1\.349 \(3\)/);
  assert.match(packet, /Manual release/);
  assert.match(packet, /67 passing/);
  assert.match(packet, /2,296 passing/);
  assert.match(packet, /Expo Doctor \*\*17\/18\*\* with the known native-folder\/app-config advisory/);
  assert.match(packet, /does not imply that later web\/analytics source is part of the signed IPA/);
  assert.match(packet, /CURRENT APP STORE CONNECT READBACK — WAITING FOR REVIEW/);
  assert.match(packet, /`upload\.log` reports “Upload succeeded”/);
  assert.match(packet, /autoIncrement: true/);
  assert.match(packet, /clean detached checkout/);
  assert.match(packet, /Android and web public launch-order gate/);
  assert.match(packet, /archive itself carries the Apple Development signature/);
  assert.match(packet, /exported IPA carries the Apple Distribution signature/);
  assert.match(packet, /get-task-allow=false/);
  assert.match(packet, /Do not upload, replace, remove from review, reply, edit, resubmit, or release/);
});

test("build 3 approval packet binds the current App Store Connect readback without authorizing another mutation", () => {
  assert.match(packet, /CURRENT APP STORE CONNECT READBACK — WAITING FOR REVIEW/);
  assert.match(packet, /Apple ID `6804424166`/);
  assert.match(packet, /selected build shown in App Store Connect as \*\*build 3\*\*/);
  assert.match(packet, /\*\*Manually release this version\*\*/);
  assert.match(packet, /do not upload, replace the build, edit metadata, answer App Review, remove the version from review, or release/);
  assert.match(packet, /`upload\.log` reports “Upload succeeded”/);
  assert.match(packet, /inspection\.json.*records `uploaded: false`/);
  assert.match(packet, /stale pre-upload inspection artifact/);
  assert.doesNotMatch(packet, /NOT UPLOADED/);
});

test("build 3 approval packet inventories the two retained draft screenshots without presenting them as selected App Store media", () => {
  assert.match(packet, /iphone17pro-home\.png/);
  assert.match(packet, /1206 × 2622/);
  assert.match(packet, /376402aee2d1ae6228e999707aef838b13680153d3a4cf0b256b963d01be8534/);
  assert.match(packet, /ipadpro13-home\.png/);
  assert.match(packet, /2064 × 2752/);
  assert.match(packet, /fc4051cc374343c702d9a85cf3704bc3fb0d36e1a2508de3ddf9cdf0af13bb8e/);
  assert.match(packet, /draft assets; neither is accepted or selected in App Store Connect/);
});
