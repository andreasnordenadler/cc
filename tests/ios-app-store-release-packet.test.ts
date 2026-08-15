import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const packetPath = path.resolve("docs/SIDE_QUEST_CHESS_IOS_RELEASE_PACKET_2026-08-13.md");
const appConfigPath = path.resolve("apps/mobile/app.json");

function section(document: string, heading: string, nextHeading: string) {
  const start = document.indexOf(heading);
  assert.notEqual(start, -1, `missing ${heading}`);
  const end = document.indexOf(nextHeading, start + heading.length);
  assert.notEqual(end, -1, `missing ${nextHeading}`);
  return document.slice(start, end);
}

function tableValue(document: string, field: string) {
  const match = document.match(new RegExp(`^\\| ${field.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")} \\| ([^|]+?) \\|$`, "m"));
  assert.ok(match, `missing ${field} table value`);
  return match[1].trim();
}

test("iOS App Store packet is bound to the Expo identity and standing product facts", async () => {
  const [packet, appConfigSource] = await Promise.all([
    readFile(packetPath, "utf8"),
    readFile(appConfigPath, "utf8"),
  ]);
  const config = JSON.parse(appConfigSource).expo;

  assert.equal(config.name, "Side Quest Chess");
  assert.equal(config.scheme, "sidequestchess");
  assert.equal(config.ios.bundleIdentifier, "com.sidequestchess.app");
  assert.equal(config.ios.supportsTablet, true);
  assert.equal(config.ios.usesAppleSignIn, true);
  assert.equal(config.ios.config.usesNonExemptEncryption, false);

  assert.match(packet, new RegExp(`Expo source version: \`${config.version.replaceAll(".", "\\.")}\``));
  assert.match(packet, new RegExp(`Source-controlled iOS build number: \`${config.ios.buildNumber}\``));
  assert.match(packet, new RegExp(`Bundle ID candidate: \`${config.ios.bundleIdentifier}\``));
  assert.match(packet, new RegExp(`Scheme: \`${config.scheme}\``));
  assert.match(packet, new RegExp(`Tablet policy in source: ${config.ios.supportsTablet ? "iPhone and iPad" : "iPhone only"}`));
  assert.match(packet, /Authentication callback: `sidequestchess:\/\/sso-callback`/);
  assert.match(packet, /Sign in with Apple policy \| SOURCE-PREPARED, ACCOUNT\/DEVICE BLOCKED/);
  assert.match(packet, new RegExp(`ITSAppUsesNonExemptEncryption = ${config.ios.config.usesNonExemptEncryption}`));
  assert.match(packet, /Publisher and privacy controller: Crowdler AB/);
  assert.match(packet, /worldwide and intended for ages 13 and older/);
  assert.match(packet, /no advertising, in-app purchases, subscriptions, or real-money prizes/);
  assert.match(packet, /https:\/\/sidequestchess\.com\/privacy/);
  assert.match(packet, /https:\/\/sidequestchess\.com\/support/);
  assert.match(packet, /https:\/\/sidequestchess\.com\/terms/);
  assert.match(packet, /Do not use Andreas's personal Apple identity/);
});

test("paste-ready App Store discovery copy stays within Apple field limits and uses the public name", async () => {
  const packet = await readFile(packetPath, "utf8");
  const name = tableValue(packet, "Name");
  const subtitle = tableValue(packet, "Subtitle");
  const keywordsMatch = packet.match(/### Keywords\n\n`([^`]+)`/);
  assert.ok(keywordsMatch, "missing paste-ready keywords");
  const keywords = keywordsMatch[1];
  const listing = section(packet, "## App Store listing draft", "## Age-rating draft");

  assert.equal(name, "Side Quest Chess");
  assert.ok(name.length <= 30, "App Store name exceeds 30 characters");
  assert.ok(subtitle.length <= 30, "App Store subtitle exceeds 30 characters");
  assert.ok(Buffer.byteLength(keywords, "utf8") <= 100, "App Store keywords exceed 100 UTF-8 bytes");
  assert.doesNotMatch(listing, /\bSQC\b/, "public App Store copy must say Side Quest Chess, not SQC");
  assert.match(listing, /### Description\n\nSide Quest Chess/);
  assert.match(listing, /Primary category \| Games/);
  assert.match(listing, /Primary Games subcategory \| Board/);
  assert.match(listing, /Secondary Games subcategory \| Strategy/);
});

test("iOS packet keeps submission evidence fail-closed and separates Apple release states", async () => {
  const packet = await readFile(packetPath, "utf8");
  const gates = section(packet, "## Current gate state", "## Approval boundary");

  for (const requiredSection of [
    "## Current gate state",
    "## App Store listing draft",
    "## Age-rating draft",
    "## App Privacy draft",
    "## Review information draft",
    "## Screenshot and preview plan",
    "## Same-candidate responsive QA matrix",
    "## TestFlight real-iPhone smoke",
    "## Least-privilege Apple access packet",
    "## Build and binary acceptance",
  ]) {
    assert.ok(packet.includes(requiredSection), `missing ${requiredSection}`);
  }

  assert.match(gates, /Signed IPA identity inspected \| BLOCKED/);
  assert.match(gates, /TestFlight real-iPhone smoke \| BLOCKED/);
  assert.match(gates, /App Review submission \| NOT STARTED/);
  assert.match(gates, /Public availability \| NOT STARTED/);
  assert.doesNotMatch(gates, /\| (?:READY|PASSED|SUBMITTED|APPROVED|RELEASED|PUBLIC) \|/);
  assert.match(packet, /Submission, App Review acceptance, release approval, and public storefront availability are four distinct states/);
  assert.match(packet, /This packet does not authorize an invite, acceptance, credential generation, app-record mutation, or upload/);
});
