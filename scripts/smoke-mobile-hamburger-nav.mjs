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
    nodes.push({ text: attr("text"), desc: attr("content-desc"), bounds: attr("bounds"), clickable: attr("clickable") });
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

function findByLabel(xml, label) {
  const nodes = allNodes(xml);
  return nodes.find((node) => node.desc === label && node.clickable === "true")
    || nodes.find((node) => node.text === label && node.clickable === "true")
    || nodes.find((node) => node.desc === label)
    || nodes.find((node) => node.text === label);
}

function findByLabelLoose(xml, label) {
  return findNode(xml, (node) => node.text === label || node.desc === label || node.text.includes(label) || node.desc.includes(label));
}

function tapNode(node, label) {
  const point = center(node.bounds || "");
  if (!point) throw new Error(`Cannot tap ${label}; missing bounds: ${JSON.stringify(node)}`);
  run(["shell", "input", "tap", String(point[0]), String(point[1])]);
}

function normalizeXmlText(value) {
  return value.replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&#10;/g, "\n");
}

function assertIncludes(xml, needle, label = needle) {
  const normalized = normalizeXmlText(xml);
  if (!normalized.toLowerCase().includes(needle.toLowerCase())) {
    throw new Error(`Expected UI to include ${label}; excerpt:\n${normalized.slice(0, 3000)}`);
  }
}

function assertNotIncludes(xml, needle, label = needle) {
  const normalized = normalizeXmlText(xml);
  if (normalized.toLowerCase().includes(needle.toLowerCase())) {
    throw new Error(`Expected UI not to include ${label}; excerpt:\n${normalized.slice(0, 3000)}`);
  }
}

function launchFresh() {
  run(["shell", "am", "force-stop", PACKAGE_NAME]);
  run(["shell", "am", "start", "-n", ACTIVITY]);
  sleep(4500);
}

function openMenu(tag) {
  const dump = dumpXml(`${tag}-before-menu`);
  try {
    const menuButton = findNode(dump.xml, (node) => node.desc === "Open main menu");
    if (!menuButton) throw new Error(`Open main menu button not found on ${tag}. UI excerpt:\n${dump.xml.slice(0, 3000)}`);
    tapNode(menuButton, "Open main menu");
  } finally {
    dump.cleanup();
  }
  sleep(1000);
  return dumpXml(`${tag}-menu-open`);
}

function chooseMenuItem(label, tag) {
  const menuDump = openMenu(tag);
  try {
    const item = findByLabel(menuDump.xml, label);
    if (!item) throw new Error(`${label} menu item not found after menu open. UI excerpt:\n${menuDump.xml.slice(0, 3000)}`);
    tapNode(item, `${label} menu item`);
  } finally {
    menuDump.cleanup();
  }
  sleep(1500);
  return dumpXml(`${tag}-after-${label.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`);
}

function tapUi(label, tag) {
  const dump = dumpXml(`${tag}-before-tap`);
  try {
    const node = findByLabelLoose(dump.xml, label);
    if (!node) throw new Error(`${label} not found. UI excerpt:\n${dump.xml.slice(0, 3000)}`);
    tapNode(node, label);
  } finally {
    dump.cleanup();
  }
  sleep(1500);
}

const { apk } = parseArgs();
adbReady();
if (apk) {
  if (!existsSync(apk)) throw new Error(`APK not found: ${apk}`);
  console.log(`Installing ${apk}`);
  run(["install", "-r", apk], { stdio: "inherit" });
}

launchFresh();
let dump = chooseMenuItem("Multiplayer Lobby", "home-to-multiplayer-lobby");
try {
  assertIncludes(dump.xml, "Multiplayer Lobby", "Multiplayer Lobby after menu navigation");
  assertIncludes(dump.xml, "Create Multiplayer Side Quest", "Multiplayer create action on lobby");
  assertNotIncludes(dump.xml, "Official public", "legacy community/official metadata wording");
} finally {
  dump.cleanup();
}

launchFresh();
dump = chooseMenuItem("Trophy Cabinet", "home-to-trophy-cabinet");
try {
  assertIncludes(dump.xml, "Trophy Cabinet", "Trophy Cabinet after menu navigation");
  assertNotIncludes(dump.xml, "Close Trophy Cabinet", "Trophy Cabinet should behave as a normal destination page");
  assertIncludes(dump.xml, "Official Solo Side Quest collection", "Official Solo Side Quest collection section");
  assertIncludes(dump.xml, "Unlocked Solo Side Quest rewards", "unified unlocked Solo shelf");
  assertIncludes(dump.xml, "Custom Solo Side Quest", "custom Solo Side Quest reward classification");
  assertNotIncludes(dump.xml, "Close Browse Coat of Arms", "legacy Trophy Cabinet close label");
} finally {
  dump.cleanup();
}


launchFresh();
dump = chooseMenuItem("Solo Side Quests", "home-to-solo-side-quests");
try {
  assertIncludes(dump.xml, "SQC Official Side Quests", "official/community catalog switcher");
} finally {
  dump.cleanup();
}
tapUi("Community Solo Side Quests", "solo-community-tab");
dump = dumpXml("solo-community-subtabs-discover");
try {
  assertIncludes(dump.xml, "Discover", "Discover subtab label visible");
  assertIncludes(dump.xml, "My Custom", "My Custom subtab label visible while Discover selected");
} finally {
  dump.cleanup();
}
tapUi("My Custom", "solo-community-my-custom-subtab");
dump = dumpXml("solo-community-subtabs-my-custom");
try {
  assertIncludes(dump.xml, "Discover", "Discover subtab label visible while My Custom selected");
  assertIncludes(dump.xml, "My Custom", "My Custom subtab label visible");
} finally {
  dump.cleanup();
}

launchFresh();
dump = chooseMenuItem("My Custom Side Quests", "home-to-my-custom-side-quests");
try {
  assertIncludes(dump.xml, "My Custom Side Quests", "My Custom Side Quests after menu navigation");
  assertNotIncludes(dump.xml, "Custom Library", "legacy Custom Library label");
  assertNotIncludes(dump.xml, "My Custom Library", "legacy My Custom Library heading");
} finally {
  dump.cleanup();
}

launchFresh();
dump = chooseMenuItem("Create Custom Side Quest", "home-to-create-custom-side-quest");
try {
  assertIncludes(dump.xml, "Custom Side Quest", "Create Custom Side Quest builder");
  assertIncludes(dump.xml, "Build your Side Quest", "custom Side Quest builder intro");
  assertIncludes(dump.xml, "Side Quest Name", "custom Side Quest builder name section");
} finally {
  dump.cleanup();
}

launchFresh();
dump = chooseMenuItem("Create Multiplayer Side Quest", "home-to-create-multiplayer-side-quest");
try {
  assertIncludes(dump.xml, "Create Multiplayer Side Quest", "Create Multiplayer Side Quest modal");
  assertNotIncludes(dump.xml, "Host Multiplayer", "legacy Host Multiplayer label");
} finally {
  dump.cleanup();
}

launchFresh();
dump = chooseMenuItem("Help & Support", "home-to-support");
try {
  assertIncludes(dump.xml, "HELP & SUPPORT", "Help & Support after Support menu item");
  assertIncludes(dump.xml, "App diagnostics", "Support diagnostics disclosure");
  assertNotIncludes(dump.xml, "Installed candidate", "internal installed-candidate label hidden by default");
  assertNotIncludes(dump.xml, "Package com.sidequestchess.app", "internal package details hidden by default");
} finally {
  dump.cleanup();
}

launchFresh();
tapUi("Open active Solo Side Quest", "solo-detail");
dump = chooseMenuItem("Today", "solo-detail-to-today");
try {
  assertIncludes(dump.xml, "ACTIVE SOLO SIDE QUEST", "Today dashboard after Solo detail menu navigation");
} finally {
  dump.cleanup();
}

launchFresh();
tapUi("Open active Multiplayer Side Quest details", "multiplayer-detail");
dump = chooseMenuItem("Multiplayer Lobby", "multiplayer-detail-to-lobby");
try {
  assertIncludes(dump.xml, "Multiplayer Lobby", "Multiplayer Lobby after detail menu navigation");
} finally {
  dump.cleanup();
}

console.log("✅ Mobile hamburger nav smoke passed");
