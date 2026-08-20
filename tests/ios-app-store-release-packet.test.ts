import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const packetPath = path.resolve("docs/SIDE_QUEST_CHESS_IOS_RELEASE_PACKET_2026-08-13.md");
const appConfigPath = path.resolve("apps/mobile/app.json");
const mobileAppPath = path.resolve("apps/mobile/App.tsx");
const webDeletionPath = path.resolve("src/components/delete-account-control.tsx");
const supportFormPath = path.resolve("src/components/support-contact-form.tsx");

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
  const promotionalText = section(packet, "### Promotional text", "### Description")
    .replace("### Promotional text", "")
    .trim();
  const description = section(packet, "### Description", "### Internal first-version summary")
    .replace("### Description", "")
    .trim();
  const listing = section(packet, "## App Store listing draft", "## Age-rating draft");

  assert.equal(name, "Side Quest Chess");
  assert.ok(name.length <= 30, "App Store name exceeds 30 characters");
  assert.ok(subtitle.length <= 30, "App Store subtitle exceeds 30 characters");
  assert.ok(Buffer.byteLength(keywords, "utf8") <= 100, "App Store keywords exceed 100 UTF-8 bytes");
  assert.ok(promotionalText.length <= 170, "App Store promotional text exceeds 170 characters");
  assert.ok(description.length <= 4_000, "App Store description exceeds 4,000 characters");
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
  assert.match(gates, /Source candidate frozen \| NOT FROZEN/);
  assert.match(gates, /iOS auth\/deep link \| BLOCKED/);
  assert.match(gates, /Privacy labels \| DRAFT ONLY/);
  assert.match(gates, /Current screenshots \| BLOCKED/);
  assert.match(gates, /TestFlight real-iPhone smoke \| BLOCKED/);
  assert.match(gates, /iPad acceptance \| BLOCKED/);
  assert.match(gates, /UGC safety and content rights \| BLOCKED/);
  assert.match(gates, /App Review submission \| NOT STARTED/);
  assert.match(gates, /Public availability \| NOT STARTED/);
  assert.doesNotMatch(gates, /\| (?:READY|PASSED|SUBMITTED|APPROVED|RELEASED|PUBLIC) \|/);
  assert.match(packet, /Submission, App Review acceptance, release approval, and public storefront availability are four distinct states/);
  assert.match(packet, /This packet does not authorize an invite, acceptance, credential generation, app-record mutation, or upload/);
  assert.doesNotMatch(
    packet,
    /(?:\*{3}|<[^>]+>|\b(?:TBD|TK|TO[- ]?DO)\b)/i,
    "release packet contains an unresolved placeholder",
  );
});

test("age, privacy, review, screenshot, and access drafts retain their release contracts", async () => {
  const packet = await readFile(packetPath, "utf8");
  const ageRating = section(packet, "## Age-rating draft", "## App Privacy draft");
  const privacy = section(packet, "## App Privacy draft", "## Review information draft");
  const review = section(packet, "## Review information draft", "## Screenshot and preview plan");
  const screenshots = section(packet, "## Screenshot and preview plan", "## Same-candidate responsive QA matrix");
  const access = section(packet, "## Least-privilege Apple access packet", "## Build and binary acceptance");

  for (const answer of [
    /user-generated content \*\*Yes\*\*/,
    /social media \*\*Yes\*\*/,
    /messaging\/chat \*\*Yes\*\*/,
    /contests \*\*Frequent\*\*/,
    /unrestricted web access \*\*No\*\*/,
    /gambling\/simulated gambling\/real-money gaming \*\*No\*\*/,
  ]) {
    assert.match(ageRating, answer);
  }

  for (const privacyType of [
    "Contact Info / Name",
    "Contact Info / Email Address",
    "Identifiers / User ID",
    "User Content / Customer Support",
    "User Content / Gameplay Content",
    "User Content / Other User Content",
    "Usage Data / Product Interaction",
    "Diagnostics / Other Diagnostic Data",
  ]) {
    assert.ok(privacy.includes(`| ${privacyType} | App Functionality |`), `missing privacy row: ${privacyType}`);
  }
  assert.match(privacy, /Tracking: \*\*No\*\*, provided binary and provider review confirms/);
  assert.match(privacy, /platform and OS version/);
  assert.match(privacy, /Mobile-origin Product Interaction is collected for App Functionality/);
  assert.match(privacy, /Do not add Analytics as a purpose unless Crowdler verifies/);
  assert.match(privacy, /Before adoption, obtain a dated Clerk\/Vercel\/hosting inventory for retained IP addresses, user agents, session\/device identifiers, retention, linkage, and purpose/);
  assert.match(ageRating, /This is not a promise of a uniform worldwide storefront rating/);
  assert.match(ageRating, /AU 16\+, VN 16\+, and KR 15\+/);
  assert.match(ageRating, /Re-evaluate the exact frequency against the frozen candidate and live questionnaire before adoption/);

  assert.match(review, /blocked until Android is public/i);
  assert.match(review, /disposable primary, secondary, and deletion-only review accounts/);
  assert.match(review, /fixture IDs, expected proof result, reset instructions/);
  assert.match(screenshots, /6\.9-inch iPhone set/);
  assert.match(screenshots, /13-inch iPad set/);
  assert.match(screenshots, /source SHA, TestFlight\/build ID/);
  assert.match(screenshots, /exact dimensions, and SHA-256/);
  assert.match(access, /dedicated Sam\/Crowdler operator/);
  assert.match(access, /Expected discovery cost is \*\*SEK 0\*\*/);
  assert.match(access, /invitation issuance and acceptance are mutations/i);
});

test("deletion and support copy do not overstate proof deletion or expose a personal support address", async () => {
  const [packet, mobileApp, webDeletion, supportForm] = await Promise.all([
    readFile(packetPath, "utf8"),
    readFile(mobileAppPath, "utf8"),
    readFile(webDeletionPath, "utf8"),
    readFile(supportFormPath, "utf8"),
  ]);

  assert.match(mobileApp, /Public proof links you already shared may remain accessible/);
  assert.match(webDeletion, /Public proof links you already shared may remain accessible/);
  assert.match(packet, /Already-shared public proof URLs use self-contained signed payloads and may remain accessible after account deletion/);
  assert.match(supportForm, /const SUPPORT_EMAIL = "sam@crowdler\.com"/);
  assert.doesNotMatch(supportForm, /andreas(?:\.|@)/i);
});
