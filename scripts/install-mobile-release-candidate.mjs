#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), "..");
const appJsonPath = path.join(repoRoot, "apps/mobile/app.json");
const androidToolEnv = {
  ...process.env,
  ANDROID_HOME: process.env.ANDROID_HOME ?? "/opt/homebrew/share/android-commandlinetools",
  ANDROID_SDK_ROOT: process.env.ANDROID_SDK_ROOT ?? "/opt/homebrew/share/android-commandlinetools",
  PATH: `${process.env.ANDROID_HOME ?? "/opt/homebrew/share/android-commandlinetools"}/platform-tools:${process.env.PATH}`,
};

function run(command, args, options = {}) {
  const output = execFileSync(command, args, {
    cwd: repoRoot,
    encoding: "utf8",
    env: androidToolEnv,
    stdio: options.stdio ?? "pipe",
  });
  return typeof output === "string" ? output.trim() : "";
}

function ghJson(args) {
  try {
    return JSON.parse(run("gh", args));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Could not read GitHub release data with gh: ${message}`);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function adb(args, options) {
  return run("adb", args, options);
}

function listAuthorizedDevices() {
  return adb(["devices"])
    .split("\n")
    .slice(1)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [serial, state] = line.split(/\s+/);
      return { serial, state };
    })
    .filter((device) => device.state === "device");
}

function getDeviceProp(serial, propName) {
  return adb(["-s", serial, "shell", "getprop", propName]).trim();
}

function getInstalledPackageDump(serial, packageId) {
  return adb(["-s", serial, "shell", "dumpsys", "package", packageId]);
}

function assertInstalledVersion(serial, packageId, expectedVersionName, expectedVersionCode) {
  const packageDump = getInstalledPackageDump(serial, packageId);
  assert(packageDump.includes(`versionName=${expectedVersionName}`), `${packageId} installed versionName does not match ${expectedVersionName}.`);
  assert(
    packageDump.includes(`versionCode=${expectedVersionCode}`) || packageDump.includes(`longVersionCode=${expectedVersionCode}`),
    `${packageId} installed versionCode does not match ${expectedVersionCode}.`,
  );
}

function getForegroundPackage(serial) {
  const activityDump = adb(["-s", serial, "shell", "dumpsys", "activity", "activities"]);
  const resumedMatch = activityDump.match(/mResumedActivity:.*?\s([a-zA-Z0-9_.]+)\//);
  if (resumedMatch?.[1]) return resumedMatch[1];

  const focusedMatch = activityDump.match(/mFocusedWindow=.*?\s([a-zA-Z0-9_.]+)\//);
  if (focusedMatch?.[1]) return focusedMatch[1];

  const windowDump = adb(["-s", serial, "shell", "dumpsys", "window", "windows"]);
  const currentFocusMatch = windowDump.match(/mCurrentFocus=.*?\s([a-zA-Z0-9_.]+)\//);
  return currentFocusMatch?.[1] ?? null;
}

console.log("Checking GitHub Release candidate identity before device install...");
run("pnpm", ["mobile:release:candidate-check"], { stdio: "inherit" });

const appConfig = JSON.parse(readFileSync(appJsonPath, "utf8"));
const packageId = appConfig.expo?.android?.package;
assert(typeof packageId === "string" && packageId.length > 0, "apps/mobile/app.json is missing expo.android.package.");

const releases = ghJson(["release", "list", "--limit", "100", "--json", "tagName,isDraft"]);
const latest = releases
  .filter((release) => /^mobile-v\d+$/.test(release.tagName) && !release.isDraft)
  .sort((a, b) => Number.parseInt(b.tagName.replace("mobile-v", ""), 10) - Number.parseInt(a.tagName.replace("mobile-v", ""), 10))[0];
assert(latest, "No non-draft mobile-v* GitHub releases found.");

const release = ghJson(["release", "view", latest.tagName, "--json", "tagName,assets,body,url"]);
const apkAssets = release.assets.filter((asset) => asset.name.endsWith(".apk"));
assert(apkAssets.length === 1, `${release.tagName} must have exactly one APK asset, found ${apkAssets.length}.`);
const apkAsset = apkAssets[0];
const shaMatch = release.body.match(/SHA256:\s*([a-f0-9]{64})/i);
const versionMatch = release.body.match(/Version:\s*([^\n]+)/i);
const versionCodeMatch = release.body.match(/Version code:\s*(\d+)/i);
assert(shaMatch, `${release.tagName} release notes are missing SHA256.`);
assert(versionMatch, `${release.tagName} release notes are missing Version.`);
assert(versionCodeMatch, `${release.tagName} release notes are missing Version code.`);
const expectedSha = shaMatch[1].toLowerCase();
const expectedVersionName = versionMatch[1].trim();
const expectedVersionCode = versionCodeMatch[1];

const devices = listAuthorizedDevices();
assert(devices.length > 0, "No authorized Android device found. Connect and unlock a real signed device with USB debugging authorized.");

const deviceCandidates = devices.map((device) => {
  const isEmulator = device.serial.startsWith("emulator-") || getDeviceProp(device.serial, "ro.kernel.qemu") === "1";
  return {
    ...device,
    isEmulator,
    model: getDeviceProp(device.serial, "ro.product.model") || "unknown model",
    osVersion: getDeviceProp(device.serial, "ro.build.version.release") || "unknown Android",
  };
});
const physicalDevices = deviceCandidates.filter((device) => !device.isEmulator);
const ignoredEmulators = deviceCandidates.filter((device) => device.isEmulator).map((device) => device.serial);

assert(
  physicalDevices.length > 0,
  `No authorized physical Android device found. ${ignoredEmulators.length ? `Ignoring emulator(s): ${ignoredEmulators.join(", ")}. ` : ""}Connect and unlock a real signed device with USB debugging authorized.`,
);
assert(
  physicalDevices.length === 1,
  `Expected exactly one authorized physical Android device, found ${physicalDevices.length}: ${physicalDevices.map((device) => device.serial).join(", ")}.`,
);

if (ignoredEmulators.length > 0) {
  console.log(`Ignoring emulator(s) for the real-device gate: ${ignoredEmulators.join(", ")}`);
}

const { serial, model, osVersion } = physicalDevices[0];

const tmpDir = mkdtempSync(path.join(os.tmpdir(), "sqc-mobile-device-install-"));
try {
  console.log(`Downloading ${release.tagName} APK from GitHub Release, not local dist...`);
  run("gh", ["release", "download", release.tagName, "--pattern", apkAsset.name, "--dir", tmpDir, "--clobber"], { stdio: "inherit" });
  const apkPath = path.join(tmpDir, apkAsset.name);
  const actualSha = createHash("sha256").update(readFileSync(apkPath)).digest("hex");
  assert(actualSha === expectedSha, `Downloaded APK SHA256 ${actualSha} does not match release note ${expectedSha}.`);

  console.log(`Installing ${apkAsset.name} on ${model} (${serial}, Android ${osVersion})...`);
  adb(["-s", serial, "install", "-r", apkPath], { stdio: "inherit" });
  assertInstalledVersion(serial, packageId, expectedVersionName, expectedVersionCode);

  console.log(`Launching ${packageId}...`);
  adb(["-s", serial, "shell", "monkey", "-p", packageId, "-c", "android.intent.category.LAUNCHER", "1"], { stdio: "inherit" });
  const foregroundPackage = getForegroundPackage(serial);
  assert(foregroundPackage === packageId, `Expected ${packageId} to be foreground after launch, got ${foregroundPackage ?? "unknown"}.`);

  console.log(`✅ Installed ${release.tagName} (${expectedVersionName}, code ${expectedVersionCode}) and launched it on real device ${model} (${serial}, Android ${osVersion}).`);
  console.log("Continue REAL_DEVICE_SMOKE.md from the Auth and account sync section and record screenshots/clips.");
} finally {
  rmSync(tmpDir, { recursive: true, force: true });
}
