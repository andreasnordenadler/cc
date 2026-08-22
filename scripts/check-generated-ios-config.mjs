#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

function findNamedFile(root, fileName) {
  for (const entry of readdirSync(root)) {
    const path = join(root, entry);
    if (statSync(path).isDirectory()) {
      const nested = findNamedFile(path, fileName);
      if (nested) return nested;
    } else if (entry === fileName) {
      return path;
    }
  }
  return null;
}

function fail(message) {
  console.error(`Generated iOS config check failed: ${message}`);
  process.exitCode = 1;
}

const iosRoot = resolve(process.argv[2] ?? "apps/mobile/ios");
if (!existsSync(iosRoot)) {
  fail(`missing generated iOS directory: ${iosRoot}`);
} else {
  const infoPath = findNamedFile(iosRoot, "Info.plist");
  const entitlementsPath = findNamedFile(iosRoot, "SideQuestChess.entitlements");
  const projectPath = findNamedFile(iosRoot, "project.pbxproj");

  if (!infoPath) fail("missing Info.plist");
  if (!entitlementsPath) fail("missing SideQuestChess.entitlements");
  if (!projectPath) fail("missing Xcode project.pbxproj");

  if (infoPath && entitlementsPath && projectPath) {
    const info = readFileSync(infoPath, "utf8");
    const entitlements = readFileSync(entitlementsPath, "utf8");
    const project = readFileSync(projectPath, "utf8");

    if (!/<string>sidequestchess<\/string>/.test(info)) fail("missing sidequestchess URL scheme");
    if (!/<key>NSAllowsArbitraryLoads<\/key>\s*<false\s*\/>/.test(info)) fail("ATS arbitrary loads must be disabled");
    const usageDescriptions = [...info.matchAll(/<key>(NS[^<]*UsageDescription)<\/key>/g)].map((match) => match[1]);
    if (usageDescriptions.length > 0) {
      fail(`unexpected sensitive-resource usage description(s): ${usageDescriptions.join(", ")}`);
    }
    if (!/<key>com\.apple\.developer\.applesignin<\/key>[\s\S]*?<string>Default<\/string>/.test(entitlements)) {
      fail("missing default Sign in with Apple entitlement");
    }
    const bundleIdentifiers = [...project.matchAll(/PRODUCT_BUNDLE_IDENTIFIER\s*=\s*"?([^;"\s]+)"?\s*;/g)].map((match) => match[1]);
    if (bundleIdentifiers.length === 0 || bundleIdentifiers.some((identifier) => identifier !== "com.sidequestchess.app")) {
      fail("bundle identifier must be com.sidequestchess.app in every generated build configuration");
    }
    const deviceFamilies = [...project.matchAll(/TARGETED_DEVICE_FAMILY\s*=\s*"?([^;"\n]+)"?\s*;/g)].map((match) => match[1].trim());
    if (deviceFamilies.length === 0 || deviceFamilies.some((family) => family !== "1,2")) {
      fail("targeted device family must include both iPhone and iPad (1,2) in every generated build configuration");
    }
  }
}
