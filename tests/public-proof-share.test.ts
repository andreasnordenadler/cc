import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import PublicProofShareControls from "../src/components/public-proof-share-controls";
import {
  buildPublicProofSharePayload,
  sharePublicProof,
} from "../src/lib/public-proof-share";

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
  assert.match(source, /<PublicProofShareControls[\s\S]*?token=\{token\}[\s\S]*?challengeTitle=\{payload\.challengeTitle\}[\s\S]*?badgeName=\{payload\.badgeName\}/);
  assert.doesNotMatch(source, /<Link href=\{publicProofImagePath\(token\)\}[^>]*>Share proof<\/Link>/);

  const css = await import("node:fs/promises").then((fs) => fs.readFile(new URL("../src/app/mobile-web.css", import.meta.url), "utf8"));
  assert.match(css, /\.sqc-proof-image\s*\{[\s\S]*?display:\s*block;[\s\S]*?width:\s*100%;[\s\S]*?max-width:\s*100%;[\s\S]*?height:\s*auto;/);
});
