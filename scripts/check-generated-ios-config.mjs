#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { join, relative, resolve } from "node:path";

const require = createRequire(import.meta.url);
const plist = require("@expo/plist").default;

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
    const infoSource = readFileSync(infoPath, "utf8");
    const entitlementsSource = readFileSync(entitlementsPath, "utf8");
    const project = readFileSync(projectPath, "utf8");

    try {
      const info = plist.parse(infoSource);
      const entitlements = plist.parse(entitlementsSource);
      const urlSchemes = Array.isArray(info.CFBundleURLTypes)
        ? info.CFBundleURLTypes.flatMap((entry) => Array.isArray(entry?.CFBundleURLSchemes) ? entry.CFBundleURLSchemes : [])
        : [];
      if (!urlSchemes.includes("sidequestchess")) fail("missing sidequestchess URL scheme");
      if (info.NSAppTransportSecurity?.NSAllowsArbitraryLoads !== false) fail("ATS arbitrary loads must be disabled");
      const usageDescriptions = Object.keys(info).filter((key) => /UsageDescription$/.test(key));
      if (usageDescriptions.length > 0) {
        fail(`unexpected sensitive-resource usage description(s): ${usageDescriptions.join(", ")}`);
      }
      if (!Array.isArray(entitlements["com.apple.developer.applesignin"]) || !entitlements["com.apple.developer.applesignin"].includes("Default")) {
        fail("missing default Sign in with Apple entitlement");
      }
    } catch (error) {
      fail(`could not parse generated plist: ${error instanceof Error ? error.message : String(error)}`);
    }
    const buildConfigurations = [...project.matchAll(/\bisa\s*=\s*XCBuildConfiguration;[\s\S]*?buildSettings\s*=\s*\{([\s\S]*?)\};[\s\S]*?name\s*=\s*"?([^;"\n]+)"?\s*;[\s\S]*?\};/g)]
      .map((match) => ({ settings: match[1], name: match[2].trim() }));
    const settingValue = (settings, settingName) => {
      const match = settings.match(new RegExp(`\\b${settingName}\\s*=\\s*"?([^;"\\n]+)"?\\s*;`));
      return match?.[1].trim() ?? null;
    };
    const appInfoPlistPath = relative(iosRoot, infoPath).replaceAll("\\", "/");
    const appConfigurations = buildConfigurations.filter(({ settings }) => settingValue(settings, "INFOPLIST_FILE") === appInfoPlistPath);
    const configurationNames = new Set(appConfigurations.map(({ name }) => name));
    if (!configurationNames.has("Debug") || !configurationNames.has("Release")) {
      fail("app identity settings must exist in Debug and Release generated build configurations");
    }

    const settingValues = (settingName) => appConfigurations.map(({ settings }) => settingValue(settings, settingName));
    const appEntitlementsPath = relative(iosRoot, entitlementsPath).replaceAll("\\", "/");
    const codeSignEntitlements = settingValues("CODE_SIGN_ENTITLEMENTS");
    if (codeSignEntitlements.length === 0 || codeSignEntitlements.some((path) => path !== appEntitlementsPath)) {
      fail("app target must use the validated entitlements file in every generated app build configuration");
    }
    const bundleIdentifiers = settingValues("PRODUCT_BUNDLE_IDENTIFIER");
    if (bundleIdentifiers.length === 0 || bundleIdentifiers.some((identifier) => identifier !== "com.sidequestchess.app")) {
      fail("bundle identifier must be com.sidequestchess.app in every generated app build configuration");
    }
    const deviceFamilies = settingValues("TARGETED_DEVICE_FAMILY");
    if (deviceFamilies.length === 0 || deviceFamilies.some((family) => family !== "1,2")) {
      fail("targeted device family must include both iPhone and iPad (1,2) in every generated app build configuration");
    }
  }
}
