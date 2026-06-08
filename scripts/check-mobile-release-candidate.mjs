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
const apkAsset = release.assets.find((asset) => asset.name.endsWith(".apk"));
const shaAsset = release.assets.find((asset) => asset.name === `${apkAsset?.name}.sha256` || asset.name.endsWith(".apk.sha256"));
const versionMatch = release.body.match(/Version:\s*([^\n]+)/i);
const versionCodeMatch = release.body.match(/Version code:\s*(\d+)/i);
const shaMatch = release.body.match(/SHA256:\s*([a-f0-9]{64})/i);

assert(!release.isDraft, `${release.tagName} is still a draft release.`);
assert(apkAsset, `${release.tagName} has no APK asset.`);
assert(shaAsset, `${release.tagName} has no APK SHA256 sidecar asset.`);
assert(versionMatch, `${release.tagName} release notes are missing Version.`);
assert(versionCodeMatch, `${release.tagName} release notes are missing Version code.`);
assert(shaMatch, `${release.tagName} release notes are missing SHA256.`);
assert(apkAsset.name.includes(`v${versionCode}`), `APK asset name ${apkAsset.name} does not include v${versionCode}.`);
assert(versionCodeMatch[1] === String(versionCode), `${release.tagName} release notes version code ${versionCodeMatch[1]} does not match tag ${versionCode}.`);
assert(
  !apkAsset.digest || apkAsset.digest === `sha256:${shaMatch[1]}`,
  `${release.tagName} APK asset digest ${apkAsset.digest} does not match release-note SHA256 ${shaMatch[1]}.`,
);

const appConfig = JSON.parse(readFileSync(appJsonPath, "utf8"));
const appVersion = appConfig.expo?.version;
const appVersionCode = appConfig.expo?.android?.versionCode;
assert(appVersion === versionMatch[1].trim(), `apps/mobile/app.json version ${appVersion} does not match latest release ${versionMatch[1].trim()}.`);
assert(appVersionCode === versionCode, `apps/mobile/app.json versionCode ${appVersionCode} does not match latest release ${versionCode}.`);

const smokeText = readFileSync(smokePath, "utf8");
const smokeTag = extractSmokeValue("GitHub Release tag", smokeText);
const smokeUrl = extractSmokeValue("Release URL", smokeText);
const smokeFilename = extractSmokeValue("APK filename", smokeText);
const smokeVersionName = extractSmokeValue("Version name", smokeText);
const smokeVersionCode = extractSmokeValue("Android version code", smokeText);
const smokeSha = extractSmokeValue("APK SHA256", smokeText);

assert(smokeTag === `\`${release.tagName}\``, `REAL_DEVICE_SMOKE current tag ${smokeTag ?? "missing"} does not match ${release.tagName}.`);
assert(smokeUrl === `<${release.url}>`, `REAL_DEVICE_SMOKE release URL ${smokeUrl ?? "missing"} does not match ${release.url}.`);
assert(smokeFilename === `\`${apkAsset.name}\``, `REAL_DEVICE_SMOKE APK filename ${smokeFilename ?? "missing"} does not match ${apkAsset.name}.`);
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
  const debuggable = capture("apkanalyzer", ["manifest", "debuggable", apkPath]);
  assert(manifestVersionName === appVersion, `${release.tagName} APK versionName ${manifestVersionName} does not match app.json ${appVersion}.`);
  assert(manifestVersionCode === String(versionCode), `${release.tagName} APK versionCode ${manifestVersionCode} does not match tag ${versionCode}.`);
  assert(debuggable === "false", `${release.tagName} APK debuggable must be false, got ${debuggable}.`);

  const apksigner = path.join(androidToolEnv.ANDROID_HOME, "build-tools/36.0.0/apksigner");
  const signerOutput = capture(apksigner, ["verify", "--verbose", "--print-certs", apkPath]);
  assert(!signerOutput.includes("CN=Android Debug"), `${release.tagName} APK is signed with the Android Debug certificate.`);
  assert(!signerOutput.includes("OU=Android"), `${release.tagName} APK signer still looks like the default Android debug identity.`);
} finally {
  rmSync(tmpDir, { recursive: true, force: true });
}

console.log(`✅ Latest mobile candidate is consistent: ${release.tagName}`);
console.log(`   APK: ${apkAsset.name}`);
console.log(`   Version: ${appVersion} (${versionCode})`);
console.log(`   SHA256: ${shaMatch[1]}`);
console.log("   APK manifest: version identity matches and debuggable=false");
console.log("   APK signer: verified release certificate is not the Android debug identity");
console.log("   Real-device launch gate still requires installing this GitHub Release APK on a signed device.");
