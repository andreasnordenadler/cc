#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const EXPECTED_BUNDLE_ID = "com.sidequestchess.app";
const EXPECTED_SCHEME = "sidequestchess";

const fail = (message) => {
  throw new Error(`Generated iOS verification failed: ${message}`);
};

const readRequired = (path, label) => {
  if (!existsSync(path)) fail(`missing ${label}: ${path}`);
  return readFileSync(path, "utf8");
};

const decodeXml = (value) =>
  value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'");

const parsePlist = (source) => {
  const tokens =
    source.match(
      /<dict>|<dict\s*\/>|<\/dict>|<array>|<array\s*\/>|<\/array>|<true\s*\/>|<false\s*\/>|<key>[\s\S]*?<\/key>|<string>[\s\S]*?<\/string>/g,
    ) ?? [];
  let index = 0;
  const parseValue = () => {
    const token = tokens[index++];
    if (/^<dict\s*\/>$/.test(token ?? "")) return {};
    if (/^<array\s*\/>$/.test(token ?? "")) return [];
    if (/^<true\s*\/>$/.test(token ?? "")) return true;
    if (/^<false\s*\/>$/.test(token ?? "")) return false;
    if (token?.startsWith("<string>")) return decodeXml(token.slice(8, -9));
    if (token === "<array>") {
      const values = [];
      while (tokens[index] !== "</array>") {
        if (index >= tokens.length) fail("malformed plist array");
        values.push(parseValue());
      }
      index += 1;
      return values;
    }
    if (token === "<dict>") {
      const value = Object.create(null);
      while (tokens[index] !== "</dict>") {
        const keyToken = tokens[index++];
        if (!keyToken?.startsWith("<key>")) fail("malformed plist dictionary");
        const key = decodeXml(keyToken.slice(5, -6));
        value[key] = parseValue();
      }
      index += 1;
      return value;
    }
    fail(`unsupported or malformed plist value: ${token ?? "end of file"}`);
  };
  const value = parseValue();
  if (index !== tokens.length) fail("malformed plist trailing values");
  return value;
};

const sameStrings = (actual, expected) =>
  Array.isArray(actual) &&
  actual.length === expected.length &&
  expected.every((value, index) => actual[index] === value);

const appBuildConfigurations = (project) => {
  const list = project.match(
    /\/\* Build configuration list for PBXNativeTarget "SideQuestChess" \*\/\s*=\s*\{[\s\S]*?buildConfigurations\s*=\s*\(([\s\S]*?)\);/,
  )?.[1];
  if (!list) fail("missing SideQuestChess app build configuration list");

  const references = [...list.matchAll(/^\s*([A-Za-z0-9]+)\s+\/\*\s*(Debug|Release)\s*\*\/,/gm)];
  if (references.length !== 2 || new Set(references.map((match) => match[2])).size !== 2) {
    fail("SideQuestChess app build configuration list must contain exactly Debug and Release");
  }

  return references.map(([, id, name]) => {
    const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const block = project.match(
      new RegExp(
        `(?:^|\\n)\\s*${escapedId}\\s+\\/\\*\\s*${name}\\s*\\*\\/\\s*=\\s*\\{([\\s\\S]*?)\\n\\s*name\\s*=\\s*${name};\\s*\\n\\s*\\};`,
      ),
    )?.[1];
    if (!block) fail(`missing SideQuestChess ${name} app build configuration`);
    return { name, source: block.replaceAll(/\/\*[\s\S]*?\*\//g, "") };
  });
};

const buildSetting = (configuration, key) => {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return configuration.source
    .match(new RegExp(`^\\s*${escapedKey}\\s*=\\s*([^;]+);`, "m"))?.[1]
    ?.trim()
    .replace(/^"|"$/g, "");
};

try {
  const root = resolve(process.argv[2] ?? "apps/mobile/ios");
  if (!existsSync(root)) fail(`generated project directory is missing: ${root}`);

  const project = readRequired(resolve(root, "SideQuestChess.xcodeproj/project.pbxproj"), "Xcode project");
  const info = readRequired(resolve(root, "SideQuestChess/Info.plist"), "app Info.plist");
  const entitlements = readRequired(
    resolve(root, "SideQuestChess/SideQuestChess.entitlements"),
    "app entitlements",
  );

  const configurations = appBuildConfigurations(project);
  for (const configuration of configurations) {
    if (buildSetting(configuration, "PRODUCT_BUNDLE_IDENTIFIER") !== EXPECTED_BUNDLE_ID) {
      fail(`${configuration.name} app build configuration bundle identifier must be ${EXPECTED_BUNDLE_ID}`);
    }
    if (buildSetting(configuration, "TARGETED_DEVICE_FAMILY") !== "1,2") {
      fail(`${configuration.name} app build configuration device family must include iPhone and iPad ("1,2")`);
    }
    if (
      buildSetting(configuration, "CODE_SIGN_ENTITLEMENTS") !==
      "SideQuestChess/SideQuestChess.entitlements"
    ) {
      fail(`${configuration.name} app build configuration must reference the Apple sign-in entitlement file`);
    }
  }

  const parsedInfo = parsePlist(info);
  const parsedEntitlements = parsePlist(entitlements);
  if (parsedInfo.CFBundleDisplayName !== "Side Quest Chess") {
    fail("display name must be Side Quest Chess");
  }

  const urlSchemes = Array.isArray(parsedInfo.CFBundleURLTypes)
    ? parsedInfo.CFBundleURLTypes.flatMap((urlType) =>
        urlType && typeof urlType === "object" && Array.isArray(urlType.CFBundleURLSchemes)
          ? urlType.CFBundleURLSchemes
          : [],
      )
    : [];
  if (!urlSchemes.includes(EXPECTED_SCHEME)) {
    fail(`URL scheme must include ${EXPECTED_SCHEME} inside CFBundleURLTypes`);
  }

  const ats = parsedInfo.NSAppTransportSecurity;
  if (!ats || typeof ats !== "object" || ats.NSAllowsArbitraryLoads !== false) {
    fail("arbitrary network loads must remain disabled in NSAppTransportSecurity");
  }
  const disallowedAtsRelaxations = [
    "NSExceptionDomains",
    "NSAllowsArbitraryLoadsForMedia",
    "NSAllowsArbitraryLoadsInWebContent",
  ];
  const foundAtsRelaxation = disallowedAtsRelaxations.find((key) => Object.hasOwn(ats, key));
  if (foundAtsRelaxation) fail(`ATS relaxation is not allowed: ${foundAtsRelaxation}`);

  const sensitiveUsageKeys = Object.keys(parsedInfo).filter((key) => /^NS[A-Za-z0-9]+UsageDescription$/.test(key));
  if (sensitiveUsageKeys.length > 0) {
    fail(`unexpected sensitive usage description: ${sensitiveUsageKeys.join(", ")}`);
  }

  const requiredPhoneOrientations = [
    "UIInterfaceOrientationPortrait",
    "UIInterfaceOrientationPortraitUpsideDown",
  ];
  if (!sameStrings(parsedInfo.UISupportedInterfaceOrientations, requiredPhoneOrientations)) {
    fail("iPhone orientations must exactly retain both portrait orientations");
  }

  const requiredIPadOrientations = [
    "UIInterfaceOrientationPortrait",
    "UIInterfaceOrientationPortraitUpsideDown",
    "UIInterfaceOrientationLandscapeLeft",
    "UIInterfaceOrientationLandscapeRight",
  ];
  if (!sameStrings(parsedInfo["UISupportedInterfaceOrientations~ipad"], requiredIPadOrientations)) {
    fail("iPad orientations must exactly retain portrait and landscape support");
  }

  if (!sameStrings(parsedEntitlements["com.apple.developer.applesignin"], ["Default"])) {
    fail("Apple sign-in entitlement must use Default access");
  }

  console.log(`Verified generated iOS project at ${root}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
