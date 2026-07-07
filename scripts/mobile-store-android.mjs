#!/usr/bin/env node
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), "..");
const androidDir = path.join(repoRoot, "apps/mobile/android");
const appJsonPath = path.join(repoRoot, "apps/mobile/app.json");
const bundleSource = path.join(androidDir, "app/build/outputs/bundle/release/app-release.aab");
const artifactDir = path.join(repoRoot, "artifacts/mobile-store");

const androidEnv = {
  ...process.env,
  JAVA_HOME: process.env.JAVA_HOME ?? "/opt/homebrew/Cellar/openjdk@17/17.0.19/libexec/openjdk.jdk/Contents/Home",
  ANDROID_HOME: process.env.ANDROID_HOME ?? "/opt/homebrew/share/android-commandlinetools",
  ANDROID_SDK_ROOT: process.env.ANDROID_SDK_ROOT ?? "/opt/homebrew/share/android-commandlinetools",
};
androidEnv.PATH = `${androidEnv.JAVA_HOME}/bin:${androidEnv.ANDROID_HOME}/platform-tools:${androidEnv.ANDROID_HOME}/cmdline-tools/latest/bin:${process.env.PATH}`;

function run(command, args, options = {}) {
  console.log(`\n$ ${[command, ...args].join(" ")}`);
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? repoRoot,
    env: androidEnv,
    stdio: "inherit",
  });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed with exit code ${result.status}`);
  }
}

function capture(command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: options.cwd ?? repoRoot,
    env: androidEnv,
    encoding: "utf8",
  }).trim();
}

const appConfig = JSON.parse(readFileSync(appJsonPath, "utf8"));
const versionName = appConfig.expo?.version;
const versionCode = appConfig.expo?.android?.versionCode;
const packageName = appConfig.expo?.android?.package;
const releaseDate = new Date().toISOString().slice(0, 10);

if (!versionName || !Number.isInteger(versionCode) || !packageName) {
  throw new Error("apps/mobile/app.json is missing expo.version, expo.android.versionCode, or expo.android.package.");
}

run("pnpm", ["mobile:release:candidate-check"]);
run("./gradlew", [":app:bundleRelease"], { cwd: androidDir });

if (!existsSync(bundleSource)) {
  throw new Error(`Release bundle not found: ${bundleSource}`);
}

const verifyOutput = capture("jarsigner", ["-verify", "-verbose", "-certs", bundleSource]);
if (/jar is unsigned/i.test(verifyOutput)) {
  throw new Error("Release AAB is unsigned.");
}

mkdirSync(artifactDir, { recursive: true });
const artifactBaseName = `sqc-mobile-android-v${versionCode}-${releaseDate}.aab`;
const artifactPath = path.join(artifactDir, artifactBaseName);
const shaPath = `${artifactPath}.sha256`;

copyFileSync(bundleSource, artifactPath);
const sha256 = createHash("sha256").update(readFileSync(artifactPath)).digest("hex");
writeFileSync(shaPath, `${sha256}  ${artifactBaseName}\n`);

console.log(`\n✅ Android Play Store bundle prepared: ${artifactPath}`);
console.log(`   Package: ${packageName}`);
console.log(`   Version: ${versionName} (${versionCode})`);
console.log(`   SHA256: ${sha256}`);
console.log("   Signing: jarsigner verification completed");
console.log("\nNext:");
console.log("1. Upload the AAB to a Play Console internal testing track.");
console.log("2. Complete Google Play Data safety, content rating, app access, and target audience forms.");
console.log("3. Run real-device smoke from the Play internal testing install before production rollout.");
