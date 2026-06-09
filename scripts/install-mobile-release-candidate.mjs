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
assert(shaMatch, `${release.tagName} release notes are missing SHA256.`);
const expectedSha = shaMatch[1].toLowerCase();

const devices = listAuthorizedDevices();
assert(devices.length > 0, "No authorized Android device found. Connect and unlock a real signed device with USB debugging authorized.");
assert(devices.length === 1, `Expected exactly one authorized Android device, found ${devices.length}: ${devices.map((device) => device.serial).join(", ")}.`);

const serial = devices[0].serial;
const isEmulator = serial.startsWith("emulator-") || getDeviceProp(serial, "ro.kernel.qemu") === "1";
assert(!isEmulator, `Refusing to satisfy the real-device gate with an emulator (${serial}).`);
const model = getDeviceProp(serial, "ro.product.model") || "unknown model";
const osVersion = getDeviceProp(serial, "ro.build.version.release") || "unknown Android";

const tmpDir = mkdtempSync(path.join(os.tmpdir(), "sqc-mobile-device-install-"));
try {
  console.log(`Downloading ${release.tagName} APK from GitHub Release, not local dist...`);
  run("gh", ["release", "download", release.tagName, "--pattern", apkAsset.name, "--dir", tmpDir, "--clobber"], { stdio: "inherit" });
  const apkPath = path.join(tmpDir, apkAsset.name);
  const actualSha = createHash("sha256").update(readFileSync(apkPath)).digest("hex");
  assert(actualSha === expectedSha, `Downloaded APK SHA256 ${actualSha} does not match release note ${expectedSha}.`);

  console.log(`Installing ${apkAsset.name} on ${model} (${serial}, Android ${osVersion})...`);
  adb(["-s", serial, "install", "-r", apkPath], { stdio: "inherit" });

  console.log(`Launching ${packageId}...`);
  adb(["-s", serial, "shell", "monkey", "-p", packageId, "-c", "android.intent.category.LAUNCHER", "1"], { stdio: "inherit" });

  console.log(`✅ Installed and launched ${release.tagName} on real device ${model} (${serial}, Android ${osVersion}).`);
  console.log("Continue REAL_DEVICE_SMOKE.md from the Auth and account sync section and record screenshots/clips.");
} finally {
  rmSync(tmpDir, { recursive: true, force: true });
}
