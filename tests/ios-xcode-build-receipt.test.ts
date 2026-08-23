import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const packet = readFileSync(new URL("../docs/IOS_APP_STORE_RELEASE_PACKET_2026-08-21.md", import.meta.url), "utf8");

test("iOS release packet records the current clean simulator build and launch receipt", () => {
  assert.match(packet, /exact-current-main.*7a2c32cb77c296b484ba4ce71177f350a59c3a47.*Release simulator build succeeded/i);
  assert.match(packet, /CODE_SIGNING_ALLOWED=NO/i);
  assert.match(packet, /iPhone 17e.*25423278-D058-4FD7-95FE-7BA695DA23CE/i);
  assert.match(packet, /iPad mini \(A17 Pro\).*2DE5C1CA-35C5-4792-A4FF-F3209AA06986/i);
  assert.match(packet, /sidequestchess:\/\/sso-callback.*reopened the app/i);
  assert.match(packet, /callback was not a completed provider authentication/i);
  assert.match(packet, /simulator evidence.*not.*TestFlight.*real iPhone/i);
  assert.match(packet, /unsigned archive inspection: not attempted/i);
  assert.doesNotMatch(packet, /Simulator registration remains locally blocked/i);
  assert.doesNotMatch(packet, /signed (?:simulator )?(?:build|IPA).*succeeded/i);
});
