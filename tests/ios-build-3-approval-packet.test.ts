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
  assert.match(packet, /63 passing/);
  assert.match(packet, /2,294 passing/);
  assert.match(packet, /Expo Doctor \*\*17\/18\*\* with the known native-folder\/app-config advisory/);
  assert.match(packet, /does not imply that later web\/analytics source is part of the signed IPA/);
  assert.doesNotMatch(packet, /local upload record/);
  assert.doesNotMatch(packet, /Uploaded to Apple/);
  assert.match(packet, /autoIncrement: true/);
  assert.match(packet, /clean detached checkout/);
  assert.match(packet, /Android and web public launch-order gate/);
  assert.match(packet, /archive itself carries the Apple Development signature/);
  assert.match(packet, /exported IPA carries the Apple Distribution signature/);
  assert.match(packet, /get-task-allow=false/);
  assert.match(packet, /Do not select, submit, or release/);
});

test("build 3 approval packet distinguishes the local upload-success log from unverified App Store Connect state", () => {
  assert.match(packet, /local xcodebuild upload log records “Upload succeeded”/);
  assert.match(packet, /not independently confirmed in App Store Connect/);
  assert.match(packet, /does not authorize selection, submission, metadata changes, or release/);
  assert.doesNotMatch(packet, /Because build 3 is \*\*not uploaded\*\*/);
});
