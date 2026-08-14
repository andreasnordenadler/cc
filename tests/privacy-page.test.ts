import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { PrivacyPageView, metadata } from "../src/app/privacy/page";

test("Privacy Policy keeps its adopted public content and actions", () => {
  const html = renderToStaticMarkup(React.createElement(PrivacyPageView, { signedIn: false }));

  assert.equal(metadata.title, "Privacy Policy — Side Quest Chess");
  assert.match(html, /<h1[^>]*>Privacy Policy<\/h1>/);
  assert.match(html, /<strong>Effective:<\/strong> August 13, 2026/);
  assert.match(html, /Chess game verification/);
  assert.match(html, /Retention and deletion/);
  assert.match(html, /href="mailto:sam@crowdler\.com\?subject=Side%20Quest%20Chess%20privacy%20request"/);
  assert.match(html, /aria-label="Controller information"/);
  assert.equal(html.match(/aria-label="Privacy policy sections"/g)?.length, 1);
  const policyDocument = html.match(/<div class="privacy-document-grid">([\s\S]*?)<\/div><aside/)?.[1] ?? "";
  assert.equal(policyDocument.match(/<section /g)?.length, 9, "the redesign preserves every policy section");
});

test("Privacy Policy becomes a desktop reading workspace at the established boundary", async () => {
  const html = renderToStaticMarkup(React.createElement(PrivacyPageView, { signedIn: false }));
  const css = await readFile(new URL("../src/app/globals.css", import.meta.url), "utf8");
  const desktopMedia = css.match(/@media \(min-width: 1180px\) \{[\s\S]*?\/\* End desktop Privacy workspace \*\/[\s\S]*?\}/)?.[0] ?? "";

  assert.match(html, /class="privacy-policy privacy-workspace"/);
  assert.match(html, /class="privacy-workspace-rail"/);
  assert.match(html, /class="privacy-document-grid"/);
  assert.match(desktopMedia, /\.privacy-workspace\s*\{[^}]*width:\s*min\(1320px,\s*100%\)[^}]*grid-template-columns:\s*minmax\(320px,\s*\.72fr\)\s+minmax\(0,\s*1\.8fr\)/);
  assert.match(desktopMedia, /\.privacy-workspace-rail\s*\{[^}]*position:\s*sticky[^}]*top:\s*32px/);
  assert.match(desktopMedia, /\.privacy-document-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(desktopMedia, /\.privacy-document-grid\s+\.privacy-contact\s*\{[^}]*grid-column:\s*1\s*\/\s*-1/);
  assert.equal(css.replace(desktopMedia, "").includes(".privacy-workspace"), false, "Privacy workspace rules must not alter mobile web below 1180px");
});

test("Privacy Policy keeps the global desktop shell and account state without duplicating its mobile content", async () => {
  const html = renderToStaticMarkup(
    React.createElement(PrivacyPageView, {
      signedIn: true,
      displayName: "Sam",
    }),
  );
  const css = await readFile(new URL("../src/app/mobile-web.css", import.meta.url), "utf8");
  const desktopMedia = css.match(/@media \(min-width: 1180px\) \{[\s\S]*?\/\* End desktop Privacy shell \*\/[\s\S]*?\}/)?.[0] ?? "";

  assert.equal(html.match(/class="sqc-desktop-header-shell"/g)?.length, 1);
  assert.match(html, /aria-label="Desktop shortcuts"/);
  assert.match(html, /aria-current="page"[^>]*href="\/privacy"/);
  assert.match(html, /class="sqc-desktop-sign-in" href="\/account">Sam<\/a>/);
  assert.equal(html.match(/<h1[^>]*>Privacy Policy<\/h1>/g)?.length, 1);
  assert.match(desktopMedia, /\.privacy-desktop-shell\s+\.sqc-desktop-route-only\s*\{[^}]*display:\s*block/);
  assert.equal(css.replace(desktopMedia, "").includes(".privacy-desktop-shell .sqc-desktop-route-only"), false, "mobile Privacy must retain its existing standalone composition below 1180px");
});
