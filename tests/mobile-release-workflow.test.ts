import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const readRepoFile = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("mobile release dependencies resolve newly disclosed uuid and tar vulnerabilities", () => {
  const workspace = readRepoFile("pnpm-workspace.yaml");
  const lockfile = readRepoFile("pnpm-lock.yaml");

  const mappingFor = (source: string, section: string) => {
    const lines = source.split("\n");
    const start = lines.findIndex((line) => line === `${section}:`);
    assert.notEqual(start, -1, `missing ${section} mapping`);
    const entries = new Map<string, string>();
    for (const line of lines.slice(start + 1)) {
      if (line && !line.startsWith(" ")) break;
      const match = line.match(/^  (.+?):\s*["']?([^"']+?)["']?\s*$/);
      if (match) entries.set(match[1], match[2]);
    }
    return entries;
  };
  const snapshotFor = (packagePattern: RegExp) => {
    const snapshots = lockfile.slice(lockfile.indexOf("\nsnapshots:\n") + "\nsnapshots:\n".length);
    const startMatch = snapshots.match(packagePattern);
    assert.ok(startMatch?.index !== undefined, `missing snapshot matching ${packagePattern}`);
    const start = startMatch.index;
    const next = snapshots.slice(start + 1).search(/\n  \S[^\n]*:\n/);
    return snapshots.slice(start, next === -1 ? undefined : start + 1 + next);
  };

  const overrides = mappingFor(workspace, "overrides");
  assert.equal(overrides.get("uuid@<11.1.1"), "11.1.1");
  assert.equal(overrides.get("tar@<7.5.21"), "7.5.21");

  const resolvedVersions = (packageName: string) =>
    [...new Set([...lockfile.matchAll(new RegExp(`^  ${packageName}@(\\d+\\.\\d+\\.\\d+):$`, "gm"))].map((match) => match[1]))];

  assert.deepEqual(resolvedVersions("uuid"), ["11.1.1"]);
  assert.deepEqual(resolvedVersions("tar"), ["7.5.21"]);
  assert.match(snapshotFor(/^  jayson@[^\n]*:\n/m), /^      uuid: 11\.1\.1$/m);
  assert.match(snapshotFor(/^  xcode@3\.0\.1:\n/m), /^      uuid: 11\.1\.1$/m);
  assert.match(snapshotFor(/^  '@expo\/cli@54\.0\.26[^\n]*':\n/m), /^      tar: 7\.5\.21$/m);
});

test("Android signing stays fail-closed for direct and umbrella artifact tasks without blocking release lint", () => {
  const source = readRepoFile("apps/mobile/android/app/build.gradle");

  assert.match(source, /gradle\.taskGraph\.whenReady/);
  assert.match(source, /taskGraph\.allTasks\.any/);
  assert.match(source, /releaseArtifactTaskRequested/);
  for (const task of ["assemblerelease", "bundlerelease", "packagerelease", "installrelease"]) {
    assert.match(source, new RegExp(`"${task}"`));
  }
  assert.match(source, /startsWith\("package"\).*contains\("release"\)[\s\S]*endsWith\("bundle"\).*endsWith\("apk"\)/);
  assert.match(source, /startsWith\("publish"\).*contains\("release"\)/);
  assert.match(source, /if \(!sqcEasBuild && !sqcReleaseSigningConfigured && releaseArtifactTaskRequested\)[\s\S]*Refusing to build a debug-signed release APK/);
});

test("CI uses a pnpm release whose audit client supports the registry bulk advisory endpoint", () => {
  for (const workflow of [".github/workflows/ci.yml", ".github/workflows/mobile-release-gate.yml"]) {
    const source = readRepoFile(workflow);
    const pinnedVersions = [...source.matchAll(/version:\s*(\d+\.\d+\.\d+)/g)].map((match) => match[1]);

    assert.ok(pinnedVersions.length > 0, `${workflow} must pin pnpm`);
    assert.deepEqual(
      [...new Set(pinnedVersions)],
      ["11.12.0"],
      `${workflow} must use pnpm 11.12.0 so the release audit does not call retired npm endpoints`,
    );
  }
});

test("pnpm 11 keeps the release-age guard except for the reviewed Expo patch set", () => {
  const source = readRepoFile("pnpm-workspace.yaml");
  const reviewedExpoPatchSet = [
    "@expo/cli@54.0.26",
    "@expo/config-plugins@54.0.5",
    "@expo/config@12.0.14",
    "@expo/env@2.0.12",
    "@expo/metro-config@54.0.17",
    "@expo/prebuild-config@54.0.9",
    "@expo/schema-utils@0.1.9",
    "babel-preset-expo@54.0.12",
    "expo@54.0.36",
  ];

  assert.doesNotMatch(source, /minimumReleaseAge:\s*0/);
  for (const packageVersion of reviewedExpoPatchSet) {
    assert.ok(source.includes(`- "${packageVersion}"`), `missing reviewed exception ${packageVersion}`);
  }
});

test("pnpm 11 explicitly ignores every dependency build script that CI does not need", () => {
  const source = readRepoFile("pnpm-workspace.yaml");
  const intentionallyIgnored = [
    "@clerk/shared",
    "browser-tabs-lock",
    "bufferutil",
    "core-js",
    "esbuild",
    "sharp",
    "unrs-resolver",
    "utf-8-validate",
  ];

  for (const packageName of intentionallyIgnored) {
    assert.ok(source.includes(`  "${packageName}": false`), `missing denied build-script package ${packageName}`);
  }
});

test("Android release signing stays fail-closed locally while allowing EAS credential injection", () => {
  const source = readRepoFile("apps/mobile/android/app/build.gradle");

  assert.match(source, /def sqcEasBuild = System\.getenv\("EAS_BUILD"\) == "true"/);
  assert.match(source, /if \(!sqcEasBuild && !sqcReleaseSigningConfigured && releaseArtifactTaskRequested\)[\s\S]*Refusing to build a debug-signed release APK/);
  assert.match(source, /buildTypes \{[\s\S]*release \{\s*signingConfig signingConfigs\.release/);
  assert.doesNotMatch(source, /release \{\s*signingConfig signingConfigs\.debug/);
});

test("EAS production builds use the SDK 54 builder and pnpm 11 for the next Play code", () => {
  for (const path of ["eas.json", "apps/mobile/eas.json"]) {
    const config = JSON.parse(readRepoFile(path));
    const production = config.build.production;

    assert.equal(production.android.image, "sdk-54", `${path} must not fall back to a legacy Android image`);
    assert.equal(production.node, "22.22.0", `${path} must satisfy pnpm 11's Node.js engine requirement`);
    assert.equal(production.pnpm, "11.12.0", `${path} must read the pnpm v9 lockfile with the reviewed pnpm release`);
    assert.equal(production.autoIncrement, true, `${path} must reserve the next Play version code`);
  }

  const app = JSON.parse(readRepoFile("apps/mobile/app.json")).expo;
  assert.equal(app.version, "0.1.343");
  assert.equal(app.android.versionCode, 343);
});

test("EAS archives omit the partial generated Android tree so SDK 54 prebuild runs", () => {
  const rootIgnore = readRepoFile(".easignore");
  const mobileIgnore = readRepoFile("apps/mobile/.easignore");

  assert.match(rootIgnore, /^apps\/mobile\/android\/$/m);
  assert.doesNotMatch(rootIgnore, /^!apps\/mobile\/android/m);
  assert.match(mobileIgnore, /^android\/$/m);
  assert.doesNotMatch(mobileIgnore, /^!android/m);
  for (const secretPattern of ["credentials.json", "credentials/", "*.jks", "*.keystore", "*.pem"]) {
    assert.ok(mobileIgnore.split("\n").includes(secretPattern), `apps/mobile/.easignore must exclude ${secretPattern}`);
  }
});

test("Android release blocks permissions that the product does not use", () => {
  const config = JSON.parse(readRepoFile("apps/mobile/app.json"));

  assert.deepEqual(config.expo.android.blockedPermissions, [
    "android.permission.READ_EXTERNAL_STORAGE",
    "android.permission.WRITE_EXTERNAL_STORAGE",
    "android.permission.SYSTEM_ALERT_WINDOW",
    "android.permission.USE_BIOMETRIC",
    "android.permission.USE_FINGERPRINT",
    "com.google.android.finsky.permission.BIND_GET_INSTALL_REFERRER_SERVICE",
  ]);
});
