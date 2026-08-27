import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import PublicProofReceiptDetails, { buildPublicProofReceiptDetails } from "../src/components/public-proof-receipt-details";

test("public proof receipt becomes a desktop evidence workspace at the established boundary", () => {
  const page = readFileSync("src/app/proof/[token]/page.tsx", "utf8");
  const shell = readFileSync("src/components/mobile-app-web-shell.tsx", "utf8");
  const css = readFileSync("src/app/mobile-web.css", "utf8");
  const desktopStart = css.indexOf("/* Public proof keeps one shareable receipt subtree");
  const desktopProof = css.slice(desktopStart);

  assert.match(shell, /desktopPresentation\?:[\s\S]*\| "proof"/);
  assert.match(page, /desktopPresentation="proof"/);
  assert.match(page, /className="sqc-stack sqc-public-proof-workspace"/);
  assert.match(page, /className="sqc-native-card sqc-public-proof-hero"/);
  assert.match(page, /className="sqc-native-card sqc-public-proof-scroll-card"/);
  assert.match(page, /className="sqc-native-card sqc-public-proof-command-rail"/);

  assert.notEqual(desktopStart, -1);
  assert.match(desktopProof, /@media\s*\(min-width:\s*1180px\)/);
  assert.match(desktopProof, /\.sqc-mobile-web\.desktop-proof\s+\.sqc-desktop-route-only\s*\{[^}]*display:\s*block/);
  assert.match(desktopProof, /\.sqc-mobile-web\.desktop-proof\s+\.sqc-screen\s*\{[^}]*width:\s*min\(1240px,\s*calc\(100%\s*-\s*64px\)\)/);
  assert.match(desktopProof, /\.sqc-mobile-web\.desktop-proof\s+\.sqc-public-proof-workspace\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s+minmax\(320px,\s*\.48fr\)/);
  assert.match(desktopProof, /\.sqc-mobile-web\.desktop-proof\s+\.sqc-public-proof-command-rail\s*\{[^}]*position:\s*sticky;[^}]*top:\s*108px/);
  assert.match(desktopProof, /\.sqc-mobile-web\.desktop-proof\s+\.sqc-public-proof-scroll-card\s*\{[^}]*grid-column:\s*1;[^}]*grid-row:\s*2\s*\/\s*span\s*2/);
});

test("public proof expands into a wider evidence desk on large desktop displays", () => {
  const css = readFileSync("src/app/mobile-web.css", "utf8");
  const wideProofStart = css.indexOf("/* Wide proof receipts use the full desktop evidence canvas");
  const wideProof = css.slice(wideProofStart);

  assert.notEqual(wideProofStart, -1);
  assert.match(wideProof, /@media\s*\(min-width:\s*1680px\)/);
  assert.match(wideProof, /\.sqc-mobile-web\.desktop-proof\s+\.sqc-screen\s*\{[^}]*width:\s*min\(1600px,\s*calc\(100%\s*-\s*96px\)\)/);
  assert.match(wideProof, /\.sqc-mobile-web\.desktop-proof\s+\.sqc-public-proof-workspace\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s+420px/);
  assert.match(wideProof, /\.sqc-mobile-web\.desktop-proof\s+\.sqc-public-proof-hero\s*\{[^}]*padding:\s*46px\s+52px/);
  assert.match(wideProof, /\.sqc-mobile-web\.desktop-proof\s+\.sqc-public-proof-scroll-card\s*\{[^}]*padding:\s*30px/);
});

test("public proof preserves one functional share and browse subtree across responsive layouts", () => {
  const page = readFileSync("src/app/proof/[token]/page.tsx", "utf8");

  assert.equal(page.match(/<PublicProofShareControls/g)?.length, 1);
  assert.equal(page.match(/href="\/side-quests"/g)?.length, 1);
  assert.match(page, /aria-label="Victory scroll"/);
  assert.match(page, /<h1>\{payload\.challengeTitle\}<\/h1>/);
});

test("public proof receipt exposes the Android proof facts without inventing missing data", () => {
  const details = buildPublicProofReceiptDetails({
    v: 1,
    challengeId: "back-rank-goblin",
    challengeTitle: "Back Rank Goblin",
    badgeName: "Goblin Crown",
    badgeMotif: "♞",
    reward: 120,
    summary: "Passed all checks.",
    provider: "lichess",
    gameId: "abc123",
    lastMoveSan: "Qh8#",
    lastMoveUci: "h7h8q",
    completedGameAt: "2026-08-27T19:42:00.000Z",
  });

  assert.deepEqual(details, [
    { label: "Game", value: "Lichess · abc123" },
    { label: "Final move", value: "Qh8#" },
    { label: "Completed", value: "Aug 27, 2026, 7:42 PM UTC" },
    { label: "Public proof", value: "Canonical proof link available" },
  ]);

  const missing = renderToStaticMarkup(React.createElement(PublicProofReceiptDetails, {
    payload: {
      v: 1,
      challengeId: "legacy",
      challengeTitle: "Legacy proof",
      badgeName: "Legacy crest",
      badgeMotif: "♞",
      reward: 100,
      summary: "Completion saved by Side Quest Chess.",
    },
  }));

  assert.match(missing, /Game<\/dt><dd>Side Quest Chess verifier<\/dd>/);
  assert.match(missing, /Final move<\/dt><dd>Final move not attached<\/dd>/);
  assert.match(missing, /Completed<\/dt><dd>Completion time not attached<\/dd>/);
  assert.doesNotMatch(missing, /undefined|Invalid Date/);
});

test("public proof keeps one receipt detail subtree across desktop and mobile", () => {
  const page = readFileSync("src/app/proof/[token]/page.tsx", "utf8");

  assert.equal(page.match(/<PublicProofReceiptDetails/g)?.length, 1);
  assert.match(page, /<PublicProofReceiptDetails payload=\{payload\}\s*\/>/);
});
