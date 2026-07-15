import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const readRepoFile = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

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
