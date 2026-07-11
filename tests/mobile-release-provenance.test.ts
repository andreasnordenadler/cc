import assert from "node:assert/strict";
import test from "node:test";

import {
  assertCleanReleaseSource,
  assertReleaseTagIdentity,
  normalizeCertificateSha256,
  parseSignerCertificateSha256,
} from "../scripts/mobile-release-lib.mjs";

test("release source must be clean before an immutable build", () => {
  assert.throws(
    () => assertCleanReleaseSource(" M apps/mobile/app.json\n", "abc123"),
    /Commit the version bump and all release inputs before building/,
  );
  assert.doesNotThrow(() => assertCleanReleaseSource("", "abc123"));
});

test("release tag and app version code must identify the same source", () => {
  assert.doesNotThrow(() => assertReleaseTagIdentity("mobile-v337", 337));
  assert.throws(() => assertReleaseTagIdentity("mobile-v336", 337), /does not match app versionCode 337/);
});

test("signer verification requires the configured SHA-256 certificate", () => {
  const fingerprint = "ab".repeat(32);
  const colonFingerprint = fingerprint.match(/../g)!.join(":").toUpperCase();
  const output = `Signer #1 certificate SHA-256 digest: ${colonFingerprint}`;
  assert.equal(parseSignerCertificateSha256(output), fingerprint);
  assert.equal(normalizeCertificateSha256(colonFingerprint), fingerprint);
  assert.throws(() => normalizeCertificateSha256("not-a-fingerprint"), /64 hexadecimal characters/);
});
