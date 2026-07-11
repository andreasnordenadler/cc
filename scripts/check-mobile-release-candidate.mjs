#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeCertificateSha256, parseSignerCertificateSha256 } from "./mobile-release-lib.mjs";

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), "..");
const appJsonPath = path.join(repoRoot, "apps/mobile/app.json");
const smokePath = path.join(repoRoot, "apps/mobile/REAL_DEVICE_SMOKE.md");

const androidToolEnv = {
  ...process.env,
  JAVA_HOME: process.env.JAVA_HOME ?? "/opt/homebrew/Cellar/openjdk@17/17.0.19/libexec/openjdk.jdk/Contents/Home",
  ANDROID_HOME: process.env.ANDROID_HOME ?? "/opt/homebrew/share/android-commandlinetools",
  ANDROID_SDK_ROOT: process.env.ANDROID_SDK_ROOT ?? "/opt/homebrew/share/android-commandlinetools",
  PATH: `${process.env.JAVA_HOME ?? "/opt/homebrew/Cellar/openjdk@17/17.0.19/libexec/openjdk.jdk/Contents/Home"}/bin:${process.env.ANDROID_HOME ?? "/opt/homebrew/share/android-commandlinetools"}/platform-tools:${process.env.ANDROID_HOME ?? "/opt/homebrew/share/android-commandlinetools"}/cmdline-tools/latest/bin:${process.env.PATH}`,
};

function ghJson(args) {
  try {
    return JSON.parse(execFileSync("gh", args, { cwd: repoRoot, encoding: "utf8" }));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Could not read GitHub release data with gh: ${message}`);
  }
}

function capture(command, commandArgs) {
  return execFileSync(command, commandArgs, {
    cwd: repoRoot,
    encoding: "utf8",
    env: androidToolEnv,
  }).trim();
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function findAndroidBuildTool(toolName) {
  const buildToolsDir = path.join(androidToolEnv.ANDROID_HOME, "build-tools");
  if (!existsSync(buildToolsDir)) {
    throw new Error(`Android build-tools directory not found: ${buildToolsDir}`);
  }

  const candidates = readdirSync(buildToolsDir)
    .map((version) => path.join(buildToolsDir, version, toolName))
    .filter((toolPath) => existsSync(toolPath))
    .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));

  assert(candidates.length > 0, `Could not find ${toolName} under ${buildToolsDir}.`);
  return candidates[0];
}

function extractSmokeValue(label, smokeText) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = smokeText.match(new RegExp(`- ${escaped}:\\s*(.+)`));
  return match?.[1]?.trim() ?? null;
}

const releases = ghJson(["release", "list", "--limit", "100", "--json", "tagName,isDraft,isPrerelease,publishedAt"]);
const mobileReleases = releases
  .filter((release) => /^mobile-v\d+$/.test(release.tagName) && !release.isDraft)
  .sort((a, b) => Number.parseInt(b.tagName.replace("mobile-v", ""), 10) - Number.parseInt(a.tagName.replace("mobile-v", ""), 10));

assert(mobileReleases.length > 0, "No non-draft mobile-v* GitHub releases found.");

const latest = mobileReleases[0];
const release = ghJson(["release", "view", latest.tagName, "--json", "tagName,isDraft,isPrerelease,publishedAt,assets,body,url"]);
const versionCode = Number.parseInt(release.tagName.replace("mobile-v", ""), 10);
const apkAssets = release.assets.filter((asset) => asset.name.endsWith(".apk"));
const apkAsset = apkAssets[0];
const shaAssets = apkAsset
  ? release.assets.filter((asset) => asset.name === `${apkAsset.name}.sha256`)
  : [];
const shaAsset = shaAssets[0];
const versionMatch = release.body.match(/Version:\s*([^\n]+)/i);
const versionCodeMatch = release.body.match(/Version code:\s*(\d+)/i);
const shaMatch = release.body.match(/SHA256:\s*([a-f0-9]{64})/i);
const sourceCommitMatch = release.body.match(/Source commit:\s*([a-f0-9]{40})/i);
const signerShaMatch = release.body.match(/Signer certificate SHA256:\s*([a-f0-9:]{64,95})/i);

assert(!release.isDraft, `${release.tagName} is still a draft release.`);
assert(apkAssets.length === 1, `${release.tagName} must have exactly one APK asset, found ${apkAssets.length}.`);
assert(apkAsset, `${release.tagName} has no APK asset.`);
assert(shaAssets.length === 1, `${release.tagName} must have exactly one SHA256 sidecar named ${apkAsset.name}.sha256, found ${shaAssets.length}.`);
assert(shaAsset, `${release.tagName} has no APK SHA256 sidecar asset.`);
assert(versionMatch, `${release.tagName} release notes are missing Version.`);
assert(versionCodeMatch, `${release.tagName} release notes are missing Version code.`);
assert(shaMatch, `${release.tagName} release notes are missing SHA256.`);
assert(sourceCommitMatch, `${release.tagName} release notes are missing Source commit.`);
assert(signerShaMatch, `${release.tagName} release notes are missing signer certificate SHA256.`);
assert(apkAsset.name.includes(`v${versionCode}`), `APK asset name ${apkAsset.name} does not include v${versionCode}.`);
assert(versionCodeMatch[1] === String(versionCode), `${release.tagName} release notes version code ${versionCodeMatch[1]} does not match tag ${versionCode}.`);
const tagCommit = capture("git", ["rev-list", "-n", "1", release.tagName]);
assert(tagCommit === sourceCommitMatch[1], `${release.tagName} points to ${tagCommit}, not release-note source ${sourceCommitMatch[1]}.`);
const taggedAppConfig = JSON.parse(capture("git", ["show", `${release.tagName}:apps/mobile/app.json`]));
assert(taggedAppConfig.expo?.android?.versionCode === versionCode, `${release.tagName} source app.json does not identify versionCode ${versionCode}.`);
assert(
  !apkAsset.digest || apkAsset.digest === `sha256:${shaMatch[1]}`,
  `${release.tagName} APK asset digest ${apkAsset.digest} does not match release-note SHA256 ${shaMatch[1]}.`,
);

const appConfig = JSON.parse(readFileSync(appJsonPath, "utf8"));
const appVersion = appConfig.expo?.version;
const appVersionCode = appConfig.expo?.android?.versionCode;
const appPackage = appConfig.expo?.android?.package;
const appAllowBackup = appConfig.expo?.android?.allowBackup;
assert(appVersion === versionMatch[1].trim(), `apps/mobile/app.json version ${appVersion} does not match latest release ${versionMatch[1].trim()}.`);
assert(appVersionCode === versionCode, `apps/mobile/app.json versionCode ${appVersionCode} does not match latest release ${versionCode}.`);
assert(typeof appPackage === "string" && appPackage.length > 0, "apps/mobile/app.json is missing expo.android.package.");
assert(appAllowBackup === false, "apps/mobile/app.json must set expo.android.allowBackup=false for launch candidates.");

const smokeText = readFileSync(smokePath, "utf8");
const smokeTag = extractSmokeValue("GitHub Release tag", smokeText);
const smokeUrl = extractSmokeValue("Release URL", smokeText);
const smokeFilename = extractSmokeValue("APK filename", smokeText);
const smokePackageId = extractSmokeValue("Package ID", smokeText);
const smokeVersionName = extractSmokeValue("Version name", smokeText);
const smokeVersionCode = extractSmokeValue("Android version code", smokeText);
const smokeSha = extractSmokeValue("APK SHA256", smokeText);

assert(smokeTag === `\`${release.tagName}\``, `REAL_DEVICE_SMOKE current tag ${smokeTag ?? "missing"} does not match ${release.tagName}.`);
assert(smokeUrl === `<${release.url}>`, `REAL_DEVICE_SMOKE release URL ${smokeUrl ?? "missing"} does not match ${release.url}.`);
assert(smokeFilename === `\`${apkAsset.name}\``, `REAL_DEVICE_SMOKE APK filename ${smokeFilename ?? "missing"} does not match ${apkAsset.name}.`);
assert(smokePackageId === `\`${appPackage}\``, `REAL_DEVICE_SMOKE package ID ${smokePackageId ?? "missing"} does not match ${appPackage}.`);
assert(smokeVersionName === `\`${appVersion}\``, `REAL_DEVICE_SMOKE version name ${smokeVersionName ?? "missing"} does not match ${appVersion}.`);
assert(smokeVersionCode === `\`${versionCode}\``, `REAL_DEVICE_SMOKE version code ${smokeVersionCode ?? "missing"} does not match ${versionCode}.`);
assert(smokeSha === `\`${shaMatch[1]}\``, "REAL_DEVICE_SMOKE APK SHA256 does not match latest release notes.");

const tmpDir = mkdtempSync(path.join(os.tmpdir(), "sqc-mobile-candidate-"));
try {
  execFileSync("gh", ["release", "download", release.tagName, "--pattern", shaAsset.name, "--pattern", apkAsset.name, "--dir", tmpDir, "--clobber"], {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: "pipe",
  });
  const apkPath = path.join(tmpDir, apkAsset.name);
  const shaSidecarText = readFileSync(path.join(tmpDir, shaAsset.name), "utf8").trim();
  const sidecarSha = shaSidecarText.match(/[a-f0-9]{64}/i)?.[0]?.toLowerCase();
  const downloadedSha = createHash("sha256").update(readFileSync(apkPath)).digest("hex");
  assert(sidecarSha === shaMatch[1], `${release.tagName} SHA256 sidecar ${sidecarSha ?? "missing"} does not match release-note SHA256 ${shaMatch[1]}.`);
  assert(downloadedSha === shaMatch[1], `${release.tagName} downloaded APK SHA256 ${downloadedSha} does not match release-note SHA256 ${shaMatch[1]}.`);

  const manifestVersionName = capture("apkanalyzer", ["manifest", "version-name", apkPath]);
  const manifestVersionCode = capture("apkanalyzer", ["manifest", "version-code", apkPath]);
  const manifestPackage = capture("apkanalyzer", ["manifest", "application-id", apkPath]);
  const debuggable = capture("apkanalyzer", ["manifest", "debuggable", apkPath]);
  const manifestPrint = capture("apkanalyzer", ["manifest", "print", apkPath]);
  assert(manifestVersionName === appVersion, `${release.tagName} APK versionName ${manifestVersionName} does not match app.json ${appVersion}.`);
  assert(manifestVersionCode === String(versionCode), `${release.tagName} APK versionCode ${manifestVersionCode} does not match tag ${versionCode}.`);
  assert(manifestPackage === appPackage, `${release.tagName} APK package ${manifestPackage} does not match app.json ${appPackage}.`);
  assert(debuggable === "false", `${release.tagName} APK debuggable must be false, got ${debuggable}.`);
  assert(manifestPrint.includes('android:allowBackup="false"'), `${release.tagName} APK manifest must set android:allowBackup="false".`);

  const apksigner = findAndroidBuildTool("apksigner");
  const signerOutput = capture(apksigner, ["verify", "--verbose", "--print-certs", apkPath]);
  const signerSha256 = parseSignerCertificateSha256(signerOutput);
  const expectedSignerSha256 = normalizeCertificateSha256(signerShaMatch[1]);
  assert(signerSha256 === expectedSignerSha256, `${release.tagName} APK signer SHA-256 ${signerSha256} does not match release notes ${expectedSignerSha256}.`);
} finally {
  rmSync(tmpDir, { recursive: true, force: true });
}

console.log(`✅ Latest mobile candidate is consistent: ${release.tagName}`);
console.log(`   APK: ${apkAsset.name}`);
console.log(`   Version: ${appVersion} (${versionCode})`);
console.log(`   SHA256: ${shaMatch[1]}`);
console.log(`   APK manifest: package ${appPackage}, version identity matches, debuggable=false, allowBackup=false`);
console.log("   APK signer: verified release certificate is not the Android debug identity");
console.log("   Real-device launch gate still requires installing this GitHub Release APK on a signed device.");
