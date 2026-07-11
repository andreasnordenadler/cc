export function assertCleanReleaseSource(status, head) {
  if (!head?.trim()) throw new Error("Could not identify the release source commit.");
  if (status.trim()) {
    throw new Error(
      "Commit the version bump and all release inputs before building. Release source must have a clean worktree.\n" + status.trim(),
    );
  }
}

export function assertReleaseTagIdentity(tag, versionCode) {
  const expected = `mobile-v${versionCode}`;
  if (tag !== expected) throw new Error(`Release tag ${tag} does not match app versionCode ${versionCode} (expected ${expected}).`);
}

export function normalizeCertificateSha256(value) {
  const normalized = value.trim().toLowerCase().replace(/:/g, "");
  if (!/^[a-f0-9]{64}$/.test(normalized)) {
    throw new Error("SQC_ANDROID_SIGNING_CERT_SHA256 must contain exactly 64 hexadecimal characters.");
  }
  return normalized;
}

export function parseSignerCertificateSha256(output) {
  const match = output.match(/certificate SHA-256 digest:\s*([a-f0-9:]{64,95})/i);
  if (!match) throw new Error("apksigner output did not include a signer certificate SHA-256 digest.");
  return match[1].toLowerCase().replace(/:/g, "");
}
