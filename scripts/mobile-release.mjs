#!/usr/bin/env node
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), "..");
const appJsonPath = path.join(repoRoot, "apps/mobile/app.json");
const androidDir = path.join(repoRoot, "apps/mobile/android");
const androidManifestPath = path.join(androidDir, "app/src/main/AndroidManifest.xml");
const apkSource = path.join(androidDir, "app/build/outputs/apk/release/app-release.apk");
const artifactDir = path.join(repoRoot, "artifacts/mobile-releases");

const args = new Set(process.argv.slice(2));
const getArg = (name) => {
  const prefix = `${name}=`;
  const hit = process.argv.slice(2).find((arg) => arg.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : undefined;
};

const shouldPublishGithub = args.has("--github-release");
const shouldSkipBuild = args.has("--skip-build");
const shouldNoBump = args.has("--no-bump");
const explicitVersionName = getArg("--version-name");
const explicitVersionCode = getArg("--version-code");
const releaseDate = getArg("--date") ?? new Date().toISOString().slice(0, 10);

function run(command, commandArgs, options = {}) {
  console.log(`\n$ ${[command, ...commandArgs].join(" ")}`);
  const result = spawnSync(command, commandArgs, {
    cwd: options.cwd ?? repoRoot,
    stdio: "inherit",
    env: {
      ...process.env,
      JAVA_HOME: process.env.JAVA_HOME ?? "/opt/homebrew/Cellar/openjdk@17/17.0.19/libexec/openjdk.jdk/Contents/Home",
      ANDROID_HOME: process.env.ANDROID_HOME ?? "/opt/homebrew/share/android-commandlinetools",
      ANDROID_SDK_ROOT: process.env.ANDROID_SDK_ROOT ?? "/opt/homebrew/share/android-commandlinetools",
      PATH: `${process.env.JAVA_HOME ?? "/opt/homebrew/Cellar/openjdk@17/17.0.19/libexec/openjdk.jdk/Contents/Home"}/bin:${process.env.ANDROID_HOME ?? "/opt/homebrew/share/android-commandlinetools"}/platform-tools:${process.env.ANDROID_HOME ?? "/opt/homebrew/share/android-commandlinetools"}/cmdline-tools/latest/bin:${process.env.PATH}`,
    },
  });
  if (result.status !== 0) {
    throw new Error(`${command} ${commandArgs.join(" ")} failed with exit code ${result.status}`);
  }
}

function capture(command, commandArgs, options = {}) {
  return execFileSync(command, commandArgs, {
    cwd: options.cwd ?? repoRoot,
    encoding: "utf8",
    env: {
      ...process.env,
      JAVA_HOME: process.env.JAVA_HOME ?? "/opt/homebrew/Cellar/openjdk@17/17.0.19/libexec/openjdk.jdk/Contents/Home",
      ANDROID_HOME: process.env.ANDROID_HOME ?? "/opt/homebrew/share/android-commandlinetools",
      ANDROID_SDK_ROOT: process.env.ANDROID_SDK_ROOT ?? "/opt/homebrew/share/android-commandlinetools",
      PATH: `${process.env.JAVA_HOME ?? "/opt/homebrew/Cellar/openjdk@17/17.0.19/libexec/openjdk.jdk/Contents/Home"}/bin:${process.env.ANDROID_HOME ?? "/opt/homebrew/share/android-commandlinetools"}/platform-tools:${process.env.ANDROID_HOME ?? "/opt/homebrew/share/android-commandlinetools"}/cmdline-tools/latest/bin:${process.env.PATH}`,
    },
  }).trim();
}

function nextPatchVersion(version) {
  const parts = version.split(".").map((part) => Number.parseInt(part, 10));
  if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) {
    throw new Error(`Expected semver-like mobile version, got ${version}`);
  }
  parts[2] += 1;
  return parts.join(".");
}

function disableAndroidBackup() {
  const manifest = readFileSync(androidManifestPath, "utf8");
  const hardened = manifest.replace(/android:allowBackup="true"/, 'android:allowBackup="false"');
  if (!hardened.includes('android:allowBackup="false"')) {
    throw new Error('AndroidManifest.xml must set android:allowBackup="false" for release candidates.');
  }
  if (hardened !== manifest) {
    writeFileSync(androidManifestPath, hardened);
    console.log('Hardened AndroidManifest.xml: android:allowBackup="false"');
  }
}

const appConfig = JSON.parse(readFileSync(appJsonPath, "utf8"));
const previousAllowBackup = appConfig.expo.android.allowBackup;
appConfig.expo.android.allowBackup = false;
const currentVersionName = appConfig.expo.version;
const currentVersionCode = appConfig.expo.android.versionCode;
const versionName = explicitVersionName ?? (shouldNoBump ? currentVersionName : nextPatchVersion(currentVersionName));
const versionCode = Number.parseInt(explicitVersionCode ?? (shouldNoBump ? currentVersionCode : currentVersionCode + 1), 10);

if (!Number.isInteger(versionCode) || versionCode <= 0) {
  throw new Error(`Invalid Android versionCode: ${explicitVersionCode}`);
}

if (!shouldNoBump || explicitVersionName || explicitVersionCode) {
  appConfig.expo.version = versionName;
  appConfig.expo.android.versionCode = versionCode;
  writeFileSync(appJsonPath, `${JSON.stringify(appConfig, null, 2)}\n`);
  console.log(`Updated apps/mobile/app.json: version=${versionName}, versionCode=${versionCode}`);
} else if (previousAllowBackup !== false) {
  writeFileSync(appJsonPath, `${JSON.stringify(appConfig, null, 2)}\n`);
  console.log('Updated apps/mobile/app.json: android.allowBackup=false');
} else {
  console.log(`Using existing apps/mobile/app.json: version=${versionName}, versionCode=${versionCode}`);
}

disableAndroidBackup();

run("pnpm", ["audit", "--prod", "--audit-level", "high"]);
run("pnpm", ["--dir", "apps/mobile", "typecheck"]);
run("pnpm", ["lint", "--", "apps/mobile/App.tsx", "apps/mobile/src/api/sqc.ts", "apps/mobile/src/types/sqc.ts"]);
run("pnpm", ["quest:release-gate"]);
run("pnpm", ["build"]);
run("./gradlew", [":app:lintRelease"], { cwd: androidDir });

if (shouldSkipBuild) {
  console.log("\n✅ Mobile release checks passed without APK build (--skip-build).");
  process.exit(0);
}

run("./gradlew", [":app:assembleRelease"], { cwd: androidDir });

if (!existsSync(apkSource)) {
  throw new Error(`Release APK not found: ${apkSource}`);
}

mkdirSync(artifactDir, { recursive: true });
const artifactBaseName = `sqc-mobile-android-v${versionCode}-${releaseDate}.apk`;
const artifactPath = path.join(artifactDir, artifactBaseName);
const shaPath = `${artifactPath}.sha256`;
copyFileSync(apkSource, artifactPath);
const sha256 = createHash("sha256").update(readFileSync(artifactPath)).digest("hex");
writeFileSync(shaPath, `${sha256}  ${artifactBaseName}\n`);

const manifestVersionName = capture("apkanalyzer", ["manifest", "version-name", artifactPath]);
const manifestVersionCode = capture("apkanalyzer", ["manifest", "version-code", artifactPath]);
const debuggable = capture("apkanalyzer", ["manifest", "debuggable", artifactPath]);
const manifestPrint = capture("apkanalyzer", ["manifest", "print", artifactPath]);
if (manifestVersionName !== versionName) throw new Error(`APK versionName mismatch: expected ${versionName}, got ${manifestVersionName}`);
if (manifestVersionCode !== String(versionCode)) throw new Error(`APK versionCode mismatch: expected ${versionCode}, got ${manifestVersionCode}`);
if (debuggable !== "false") throw new Error(`APK debuggable mismatch: expected false, got ${debuggable}`);
if (!manifestPrint.includes('android:allowBackup="false"')) throw new Error('APK manifest must set android:allowBackup="false".');

const apksigner = path.join(process.env.ANDROID_HOME ?? "/opt/homebrew/share/android-commandlinetools", "build-tools/36.0.0/apksigner");
const signerOutput = capture(apksigner, ["verify", "--verbose", "--print-certs", artifactPath]);
if (signerOutput.includes("CN=Android Debug") || signerOutput.includes("OU=Android")) {
  throw new Error("Release APK is still signed with Android Debug certificate");
}
console.log(`\n✅ APK verified: ${artifactPath}`);
console.log(`   versionName=${manifestVersionName}`);
console.log(`   versionCode=${manifestVersionCode}`);
console.log(`   debuggable=${debuggable}`);
console.log("   allowBackup=false");
console.log(`   sha256=${sha256}`);

if (shouldPublishGithub) {
  const tag = `mobile-v${versionCode}`;
  const title = `SQC Mobile Android v${versionCode}`;
  const notes = [
    `Side Quest Chess Android beta candidate v${versionCode}.`,
    ``,
    `Version: ${versionName}`,
    `Version code: ${versionCode}`,
    `SHA256: ${sha256}`,
  ].join("\n");
  run("gh", ["release", "create", tag, artifactPath, shaPath, "--title", title, "--notes", notes, "--latest"]);
  console.log(`✅ GitHub release published: ${tag}`);
}

console.log("\nNext:");
console.log("1. Commit app.json/script changes (do not commit APK artifacts).");
console.log("2. If published: use the GitHub release asset URL for tester distribution.");
console.log("3. Run a signed-device smoke test before broader rollout.");
