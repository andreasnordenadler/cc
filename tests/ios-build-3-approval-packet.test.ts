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
  assert.match(packet, /8000e9f2edd067a2d7d206f292b5ea7695db3c19f53c8e190bcf618a9ba544f7/);
  assert.match(packet, /0\.1\.349 \(3\)/);
  assert.match(packet, /Manual release/);
  assert.match(packet, /53 passing/);
  assert.doesNotMatch(packet, /48 passing/);
  assert.match(packet, /2,272 passing/);
  assert.doesNotMatch(packet, /1,502 passing/);
  assert.match(packet, /autoIncrement: true/);
  assert.match(packet, /clean detached checkout/);
  assert.match(packet, /Android and web public launch-order gate/);
  assert.match(packet, /archive itself carries the Apple Development signature/);
  assert.match(packet, /exported IPA carries the Apple Distribution signature/);
  assert.match(packet, /get-task-allow=false/);
  assert.match(packet, /Do not upload, select, submit, or release/);
});
