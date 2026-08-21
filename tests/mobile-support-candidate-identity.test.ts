import assert from "node:assert/strict";
import test from "node:test";

import { getMobileCandidateIdentity } from "../apps/mobile/src/support/mobileCandidateIdentity";

const config = {
  version: "0.1.349",
  ios: { bundleIdentifier: "com.sidequestchess.app" },
  android: { package: "com.sidequestchess.app", versionCode: 349 },
};

test("iOS support identity reports the App Store bundle and native build without Android release claims", () => {
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
    artifactLabel: "iOS App Store candidate",
    releaseCandidate: "0.1.349 (7)",
    releaseUrl: null,
  });
});
