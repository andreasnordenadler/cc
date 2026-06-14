#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const ADB = process.env.ADB || join(process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT || "/opt/homebrew/share/android-commandlinetools", "platform-tools", "adb");
const PACKAGE_NAME = "com.sidequestchess.app";
const ACTIVITY = `${PACKAGE_NAME}/.MainActivity`;

function run(args, opts = {}) {
  return execFileSync(ADB, args, { encoding: "utf8", stdio: opts.stdio ?? ["ignore", "pipe", "pipe"] });
}

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = { apk: process.env.MOBILE_APK || "" };
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === "--apk") parsed.apk = args[++index] || "";
  }
  return parsed;
}

function adbReady() {
  const devices = run(["devices"]);
  const ready = devices.split("\n").some((line) => /\tdevice$/.test(line));
  if (!ready) throw new Error(`No ready adb device found. adb devices:\n${devices}`);
}

function dumpXml(name) {
  const dir = mkdtempSync(join(tmpdir(), "sqc-hamburger-smoke-"));
  const remote = "/sdcard/window.xml";
  const local = join(dir, `${name}.xml`);
  try {
    run(["shell", "uiautomator", "dump", remote]);
    run(["pull", remote, local]);
    return { xml: readFileSync(local, "utf8"), cleanup: () => rmSync(dir, { recursive: true, force: true }) };
  } catch (error) {
    rmSync(dir, { recursive: true, force: true });
    throw error;
  }
}

function allNodes(xml) {
  const nodes = [];
  const re = /<node\b([^>]*)>/g;
  let match;
  while ((match = re.exec(xml))) {
    const attrs = match[1];
    const attr = (name) => {
      const m = attrs.match(new RegExp(`${name}="([^"]*)"`));
      return m ? m[1].replace(/&quot;/g, '"').replace(/&amp;/g, "&") : "";
    };
    nodes.push({
      text: attr("text"),
      desc: attr("content-desc"),
      bounds: attr("bounds"),
      clickable: attr("clickable"),
    });
  }
  return nodes;
}

function center(bounds) {
  const nums = [...bounds.matchAll(/\d+/g)].map((m) => Number(m[0]));
  if (nums.length < 4) return null;
  return [Math.round((nums[0] + nums[2]) / 2), Math.round((nums[1] + nums[3]) / 2)];
}

function findNode(xml, predicate) {
  return allNodes(xml).find(predicate);
}

function tapNode(node, label) {
  const point = center(node.bounds || "");
  if (!point) throw new Error(`Cannot tap ${label}; missing bounds: ${JSON.stringify(node)}`);
  run(["shell", "input", "tap", String(point[0]), String(point[1])]);
}

function assertIncludes(xml, needle, label = needle) {
  if (!xml.toLowerCase().includes(needle.toLowerCase())) {
    throw new Error(`Expected UI to include ${label}; excerpt:\n${xml.slice(0, 2500)}`);
  }
}

const { apk } = parseArgs();
adbReady();
if (apk) {
  if (!existsSync(apk)) throw new Error(`APK not found: ${apk}`);
  console.log(`Installing ${apk}`);
  run(["install", "-r", apk], { stdio: "inherit" });
}

run(["shell", "am", "start", "-n", ACTIVITY]);
sleep(4500);

let dump = dumpXml("home");
try {
  const menuButton = findNode(dump.xml, (node) => node.desc === "Open main menu");
  if (!menuButton) throw new Error(`Open main menu button not found. UI excerpt:\n${dump.xml.slice(0, 2500)}`);
  tapNode(menuButton, "Open main menu");
} finally {
  dump.cleanup();
}

sleep(1000);
dump = dumpXml("menu-open");
try {
  for (const label of ["Today", "Solo Side Quests", "Multiplayer", "My SQC / Account"]) {
    assertIncludes(dump.xml, label);
  }
  const multiplayer = findNode(dump.xml, (node) => node.text === "Multiplayer" || node.desc === "Multiplayer");
  if (!multiplayer) throw new Error(`Multiplayer menu item not found after menu open. UI excerpt:\n${dump.xml.slice(0, 2500)}`);
  tapNode(multiplayer, "Multiplayer menu item");
} finally {
  dump.cleanup();
}

sleep(1500);
dump = dumpXml("multiplayer");
try {
  assertIncludes(dump.xml, "Multiplayer Lobby", "Multiplayer Lobby after menu navigation");
} finally {
  dump.cleanup();
}

console.log("✅ Mobile hamburger nav smoke passed");
