import assert from "node:assert/strict";
import test from "node:test";

import { getMobileCandidateIdentity } from "../apps/mobile/src/support/mobileCandidateIdentity";

const config = {
  version: "0.1.349",
  ios: { bundleIdentifier: "com.sidequestchess.app" },
  android: { package: "com.sidequestchess.app", versionCode: 349 },
};

test("iOS support identity reports the bundle and native build without claiming a distribution channel", () => {
  assert.deepEqual(getMobileCandidateIdentity({
    platform: "ios",
    nativeApplicationVersion: "0.1.349",
    nativeBuildVersion: "7",
    applicationId: "com.sidequestchess.app",
    config,
  }), {
    appVersion: "0.1.349",
    appBuild: "7",
    applicationId: "com.sidequestchess.app",
    artifactLabel: "iOS app build",
    releaseCandidate: "0.1.349 (7)",
    releaseUrl: null,
  });
});

test("Android support identity uses the installed package and native version code", () => {
  assert.deepEqual(getMobileCandidateIdentity({
    platform: "android",
    nativeApplicationVersion: "0.1.350",
    nativeBuildVersion: "350",
    applicationId: "com.sidequestchess.app",
    config,
  }), {
    appVersion: "0.1.350",
    appBuild: "350",
    applicationId: "com.sidequestchess.app",
    artifactLabel: "GitHub Release APK",
    releaseCandidate: "mobile-v350",
    releaseUrl: "https://github.com/andreasnordenadler/cc/releases/tag/mobile-v350",
  });
});

test("Android support identity falls back to managed Expo config", () => {
  assert.deepEqual(getMobileCandidateIdentity({
    platform: "android",
    config,
  }), {
    appVersion: "0.1.349",
    appBuild: "349",
    applicationId: "com.sidequestchess.app",
    artifactLabel: "GitHub Release APK",
    releaseCandidate: "mobile-v349",
    releaseUrl: "https://github.com/andreasnordenadler/cc/releases/tag/mobile-v349",
  });
});

test("Android support identity ignores an invalid native build version", () => {
  assert.equal(getMobileCandidateIdentity({
    platform: "android",
    nativeBuildVersion: "not-a-version-code",
    config,
  }).appBuild, "349");
});

test("Android support identity avoids an unverified release link when no version code exists", () => {
  assert.deepEqual(getMobileCandidateIdentity({
    platform: "android",
    config: {},
  }), {
    appVersion: "unknown",
    appBuild: "unknown",
    applicationId: "unknown",
    artifactLabel: "GitHub Release APK",
    releaseCandidate: "unknown",
    releaseUrl: null,
  });
});
