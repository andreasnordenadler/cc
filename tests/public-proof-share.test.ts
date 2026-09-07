import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import PublicProofShareControls from "../src/components/public-proof-share-controls";
import { getChallengeById } from "../src/lib/challenges";
import {
  buildPublicProofSharePayload,
  sharePublicProof,
} from "../src/lib/public-proof-share";
import { buildPublicProofPath, decodePublicProof, normalizePublicProofBadgeMotif, normalizePublicProofPayload } from "../src/lib/proof-share";
import { getPreferredRunnerIdentity, withPublishedRunnerIdentity } from "../src/lib/user-metadata";

async function makeLegacySignedProofToken(payload: Record<string, unknown>) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const secret = process.env.SQC_PROOF_SHARE_SECRET
    || process.env.CLERK_SECRET_KEY
    || process.env.AUTH_SECRET
    || "side-quest-chess-local-proof-secret";
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return `${body}.${Buffer.from(signature).toString("base64url")}`;
}

test("public proof decoding rejects unsigned preview fixtures", async () => {
  assert.equal(await decodePublicProof("preview-finish-any-game"), null);
});

test("legacy proof motifs never expose the retired public acronym", () => {
  assert.equal(normalizePublicProofBadgeMotif("SQC"), "♞");
  assert.equal(normalizePublicProofBadgeMotif("Knight"), "Knight");
  assert.equal(normalizePublicProofBadgeMotif(undefined), "♞");
});

test("legacy proof tokens normalize every public text field", () => {
  const payload = normalizePublicProofPayload({
    v: 1,
    challengeId: "legacy",
    challengeTitle: "SQC challenge",
    badgeName: "SQC crest",
    badgeMotif: "SQC",
    reward: 100,
    summary: "Verified by SQC.",
    runnerName: "SQC player",
  });
  assert.equal(payload.challengeTitle, "Side Quest Chess challenge");
  assert.equal(payload.badgeName, "Side Quest Chess crest");
  assert.equal(payload.badgeMotif, "♞");
  assert.equal(payload.summary, "Verified by Side Quest Chess.");
  assert.equal(payload.runnerName, "Side Quest Chess player");
});

test("legacy proof tokens redact an email runner identity", () => {
  const loginEmail = "private.login@example.test";
  const payload = normalizePublicProofPayload({
    v: 1,
    challengeId: "legacy",
    challengeTitle: "Legacy challenge",
    badgeName: "Legacy crest",
    badgeMotif: "Knight",
    reward: 100,
    summary: "Completed.",
    runnerName: loginEmail,
  });

  assert.equal(payload.runnerName, "Quest runner");
  assert.equal(JSON.stringify(payload).includes(loginEmail), false);
});

test("legacy proof email detection precedes public text normalization", () => {
  const payload = normalizePublicProofPayload({
    v: 1,
    challengeId: "legacy",
    challengeTitle: "Legacy challenge",
    badgeName: "Legacy crest",
    badgeMotif: "Knight",
    reward: 100,
    summary: "Completed.",
    runnerName: "private.login@sqc.example.test",
  });

  assert.equal(payload.runnerName, "Quest runner");
});

test("signed legacy proof tokens get a sanitized canonical token", async () => {
  const loginEmail = "private.login@example.test";
  const legacyToken = await makeLegacySignedProofToken({
    v: 1,
    challengeId: "finish-any-game",
    challengeTitle: "Finish Any Game",
    badgeName: "First Scroll",
    badgeMotif: "Knight",
    reward: 100,
    summary: "Completed.",
    runnerName: loginEmail,
  });

  const decoded = await decodePublicProof(legacyToken);
  assert.ok(decoded);
  assert.notEqual(decoded.canonicalToken, legacyToken);
  const canonicalBody = decoded.canonicalToken.split(".")[0];
  const canonicalPayload = JSON.parse(Buffer.from(canonicalBody, "base64url").toString("utf8"));
  assert.equal(canonicalPayload.runnerName, "Quest runner");
  assert.equal(Buffer.from(canonicalBody, "base64url").toString("utf8").includes(loginEmail), false);
});

test("canonical proof normalization is a fixed point after legacy text expansion", async () => {
  const legacyToken = await makeLegacySignedProofToken({
    v: 1,
    challengeId: "finish-any-game",
    challengeTitle: "Finish Any Game",
    badgeName: "First Scroll",
    badgeMotif: "Knight",
    reward: 100,
    summary: "Completed.",
    runnerName: `${"A".repeat(55)} SQC`,
  });

  const first = await decodePublicProof(legacyToken);
  assert.ok(first);
  const second = await decodePublicProof(first.canonicalToken);
  assert.ok(second);
  assert.equal(first.payload.runnerName, "Quest runner");
  assert.equal(second.canonicalToken, first.canonicalToken);
  assert.deepEqual(second.payload, first.payload);
});

test("signed legacy proof tokens redact historically truncated email prefixes", async () => {
  const emailPrefix = "p".repeat(60);
  const legacyToken = await makeLegacySignedProofToken({
    v: 1,
    challengeId: "finish-any-game",
    challengeTitle: "Finish Any Game",
    badgeName: "First Scroll",
    badgeMotif: "Knight",
    reward: 100,
    summary: "Completed.",
    runnerName: emailPrefix,
  });

  const decoded = await decodePublicProof(legacyToken);
  assert.ok(decoded);
  assert.equal(decoded.payload.runnerName, "Quest runner");
  const canonicalBody = decoded.canonicalToken.split(".")[0];
  assert.equal(Buffer.from(canonicalBody, "base64url").toString("utf8").includes(emailPrefix), false);
});

test("new public proof tokens never encode an email runner identity", async () => {
  const loginEmail = "private.login@example.test";
  const challenge = getChallengeById("finish-any-game");
  assert.ok(challenge);
  const path = await buildPublicProofPath({ attempt: null, challenge, runnerName: loginEmail });
  const tokenBody = path.slice("/proof/".length).split(".")[0];
  const payload = JSON.parse(Buffer.from(tokenBody, "base64url").toString("utf8")) as { runnerName?: string };

  assert.equal(payload.runnerName, "Quest runner");
  assert.equal(JSON.stringify(payload).includes(loginEmail), false);
});

test("new public proof tokens redact a historical profile email prefix", async () => {
  const emailPrefix = "p".repeat(60);
  const challenge = getChallengeById("finish-any-game");
  assert.ok(challenge);
  const path = await buildPublicProofPath({ attempt: null, challenge, runnerName: emailPrefix });
  const tokenBody = path.slice("/proof/".length).split(".")[0];
  const payload = JSON.parse(Buffer.from(tokenBody, "base64url").toString("utf8")) as { runnerName?: string };

  assert.equal(payload.runnerName, "Quest runner");
  assert.equal(JSON.stringify(payload).includes(emailPrefix), false);
});

test("new public proof tokens preserve a maximum-length alias with profile-save provenance", async () => {
  const alias = "a".repeat(60);
  const challenge = getChallengeById("finish-any-game");
  assert.ok(challenge);
  const runnerIdentity = getPreferredRunnerIdentity(withPublishedRunnerIdentity({}, alias), {});
  assert.ok(runnerIdentity);

  const path = await buildPublicProofPath({ attempt: null, challenge, runnerIdentity });
  const token = path.slice("/proof/".length);
  const tokenBody = token.split(".")[0];
  const payload = JSON.parse(Buffer.from(tokenBody, "base64url").toString("utf8")) as { runnerName?: string };
  const decoded = await decodePublicProof(token);

  assert.equal(payload.runnerName, alias);
  assert.equal(decoded?.payload.runnerName, alias);
});

test("proof canonicalization preserves a trusted maximum-length alias when retired copy expands", async () => {
  const alias = `${"x".repeat(56)} SQC`;
  const canonicalAlias = `${"x".repeat(56)} Side Quest Chess`;
  const challenge = getChallengeById("finish-any-game");
  assert.equal(alias.length, 60);
  assert.ok(challenge);
  const runnerIdentity = getPreferredRunnerIdentity(withPublishedRunnerIdentity({}, alias), {});
  assert.ok(runnerIdentity);

  const path = await buildPublicProofPath({ attempt: null, challenge, runnerIdentity });
  const firstToken = path.slice("/proof/".length);
  const firstDecode = await decodePublicProof(firstToken);
  assert.equal(firstDecode?.payload.runnerName, canonicalAlias);
  assert.equal(firstDecode?.payload.runnerIdentity?.displayName, canonicalAlias);

  const secondDecode = await decodePublicProof(firstDecode?.canonicalToken);
  assert.equal(secondDecode?.payload.runnerName, canonicalAlias);
  assert.equal(secondDecode?.canonicalToken, firstDecode?.canonicalToken);
});

test("authenticated proof issuers pass typed public identity provenance", async () => {
  const fs = await import("node:fs/promises");
  const [challengePage, mobileAccountRoute] = await Promise.all([
    fs.readFile(new URL("../src/app/challenges/[id]/page.tsx", import.meta.url), "utf8"),
    fs.readFile(new URL("../src/app/api/mobile/account/route.ts", import.meta.url), "utf8"),
  ]);

  for (const source of [challengePage, mobileAccountRoute]) {
    assert.match(source, /getPreferredRunnerIdentity/);
    assert.match(source, /runnerIdentity/);
    assert.match(source, /build(?:CompletedOfficial)?PublicProofPath\(\{[\s\S]*?runnerIdentity/);
  }
});

test("long email identities are rejected before proof-name length limiting", async () => {
  const loginEmail = `${"private".repeat(14)}@example.test`;
  const challenge = getChallengeById("finish-any-game");
  assert.ok(challenge);
  const path = await buildPublicProofPath({ attempt: null, challenge, runnerName: loginEmail });
  const tokenBody = path.slice("/proof/".length).split(".")[0];
  const payload = JSON.parse(Buffer.from(tokenBody, "base64url").toString("utf8")) as { runnerName?: string };

  assert.equal(payload.runnerName, "Quest runner");
});

test("public proof sharing targets the exact canonical receipt and opens native sharing", async () => {
  const shared: unknown[] = [];
  const payload = buildPublicProofSharePayload({
    token: "proof/42",
    challengeTitle: "Ada's Fork",
    badgeName: "Forked Crown",
    origin: "https://sidequestchess.com/ignored/path",
  });

  const result = await sharePublicProof(payload, {
    share: async (value) => { shared.push(value); },
  });

  assert.deepEqual(payload, {
    title: "Side Quest Chess: Ada's Fork",
    text: "I completed “Ada's Fork” in the Side Quest Chess app. Forked Crown unlocked. https://sidequestchess.com/proof/proof%2F42",
    url: "https://sidequestchess.com/proof/proof%2F42",
  });
  assert.deepEqual(shared, [payload]);
  assert.deepEqual(result, { kind: "shared", message: "Proof link share sheet opened." });
});

test("public proof sharing copies the canonical receipt when native sharing is unavailable", async () => {
  const copied: string[] = [];
  const payload = buildPublicProofSharePayload({
    token: "receipt-token",
    challengeTitle: "Finish Any Game",
    badgeName: "First Scroll",
    origin: "https://sidequestchess.com",
  });

  const result = await sharePublicProof(payload, {
    clipboard: { writeText: async (value) => { copied.push(value); } },
  });

  assert.deepEqual(copied, ["https://sidequestchess.com/proof/receipt-token"]);
  assert.deepEqual(result, { kind: "copied", message: "Proof link copied." });
});

test("public proof sharing reports cancellation and safe browser failures", async () => {
  const payload = buildPublicProofSharePayload({
    token: "receipt-token",
    challengeTitle: "Finish Any Game",
    badgeName: "First Scroll",
    origin: "https://sidequestchess.com",
  });
  const cancellation = new Error("private browser detail");
  cancellation.name = "AbortError";

  assert.deepEqual(
    await sharePublicProof(payload, { share: async () => { throw cancellation; } }),
    { kind: "cancelled", message: "Sharing cancelled." },
  );
  assert.deepEqual(
    await sharePublicProof(payload, { share: async () => { throw new Error("private browser detail"); } }),
    { kind: "error", message: "Could not open sharing here. Copy the proof link instead." },
  );
  assert.deepEqual(
    await sharePublicProof(payload, { clipboard: { writeText: async () => { throw new Error("private permission detail"); } } }),
    { kind: "error", message: "Could not copy the proof link. Try again." },
  );
});

test("public proof receipt renders real share and copy controls instead of an image link", async () => {
  const html = renderToStaticMarkup(React.createElement(PublicProofShareControls, {
    token: "proof/42",
    challengeTitle: "Ada's Fork",
    badgeName: "Forked Crown",
  }));

  assert.match(html, /<button[^>]*aria-label="Share public proof link"[^>]*>Share proof link<\/button>/);
  assert.match(html, /<button[^>]*aria-label="Copy public proof link"[^>]*>Copy proof link<\/button>/);
  assert.doesNotMatch(html, /<a[^>]*>Share proof<\/a>/);

  const source = await import("node:fs/promises").then((fs) => fs.readFile(new URL("../src/app/proof/[token]/page.tsx", import.meta.url), "utf8"));
  assert.match(source, /import \{ notFound, redirect \} from "next\/navigation"/);
  assert.match(source, /const \{ payload, canonicalToken \} = decoded/);
  assert.match(source, /if \(token !== canonicalToken\) \{\s*redirect\(`\/proof\/\$\{canonicalToken\}`\);\s*\}/);
  assert.match(source, /<PublicProofShareControls[\s\S]*?token=\{canonicalToken\}[\s\S]*?challengeTitle=\{payload\.challengeTitle\}[\s\S]*?badgeName=\{payload\.badgeName\}/);
  assert.doesNotMatch(source, /publicProofImagePath\(token\)/);
  assert.doesNotMatch(source, /<Link href=\{publicProofImagePath\(canonicalToken\)\}[^>]*>Share proof<\/Link>/);

  const css = await import("node:fs/promises").then((fs) => fs.readFile(new URL("../src/app/mobile-web.css", import.meta.url), "utf8"));
  assert.match(css, /\.sqc-proof-image\s*\{[\s\S]*?display:\s*block;[\s\S]*?width:\s*100%;[\s\S]*?max-width:\s*100%;[\s\S]*?height:\s*auto;/);
});
