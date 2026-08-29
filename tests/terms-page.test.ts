import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { metadata, TermsPageView } from "../src/app/terms/page";

test("Terms of Use has a dedicated adopted public destination", () => {
  const html = renderToStaticMarkup(React.createElement(TermsPageView, { signedIn: false }));

  assert.equal(metadata.title, "Terms of Use — Side Quest Chess");
  assert.match(html, /<h1[^>]*>Terms of Use<\/h1>/);
  assert.match(html, /class="terms-brand-row"/);
  assert.match(html, /<strong>Effective:<\/strong> August 13, 2026/);
  assert.match(html, /Side Quest Chess is provided by Crowdler AB/);
  assert.match(html, /governed by Swedish law/);
  assert.match(html, /aria-label="Provider information"/);
  assert.match(html, /href="\/privacy"/);
  assert.match(html, /href="\/support"/);
  assert.doesNotMatch(html, /NEXT_REDIRECT/);
});

test("Terms of Use becomes a desktop document workspace at the established boundary", async () => {
  const html = renderToStaticMarkup(React.createElement(TermsPageView, { signedIn: false }));
  const css = await readFile(new URL("../src/app/globals.css", import.meta.url), "utf8");
  const desktopMedia = css.match(/@media \(min-width: 1180px\) \{[\s\S]*?\/\* End desktop Terms workspace \*\/[\s\S]*?\}/)?.[0] ?? "";
  const wideDesktopMedia = css.match(/@media \(min-width: 1680px\) \{[\s\S]*?\/\* End wide desktop Terms workspace \*\/[\s\S]*?\}/)?.[0] ?? "";

  assert.match(html, /class="privacy-policy terms-policy"/);
  assert.match(html, /class="terms-rail"/);
  assert.match(html, /class="terms-document-grid"/);
  assert.equal(html.match(/aria-label="Terms of Use sections"/g)?.length, 1, "desktop and mobile share one navigation subtree");
  assert.match(html, /href="#law">Liability &amp; law<\/a>/, "every legal section must be reachable from the document navigator");
  const termsDocument = html.match(/<div class="terms-document-grid">([\s\S]*?)<\/div><aside/)?.[1] ?? "";
  assert.equal(termsDocument.match(/<section /g)?.length, 9, "the desktop composition preserves every terms section");
  assert.match(desktopMedia, /\.terms-policy\s*\{[^}]*width:\s*min\(1320px,\s*100%\)[^}]*grid-template-columns:\s*minmax\(300px,\s*\.7fr\)\s+minmax\(0,\s*1\.8fr\)/);
  assert.match(desktopMedia, /\.terms-rail\s*\{[^}]*position:\s*sticky[^}]*top:\s*32px/);
  assert.match(desktopMedia, /\.terms-document-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(desktopMedia, /\.terms-document-grid\s+\.privacy-contact\s*\{[^}]*grid-column:\s*1\s*\/\s*-1/);
  assert.equal(css.replace(desktopMedia, "").replace(wideDesktopMedia, "").includes(".terms-policy"), false, "Terms workspace rules must not alter mobile web below 1180px");
});

test("wide Terms uses an editorial reading hierarchy instead of stretching an undifferentiated card matrix", async () => {
  const css = await readFile(new URL("../src/app/globals.css", import.meta.url), "utf8");
  const desktopMedia = css.match(/@media \(min-width: 1180px\) \{[\s\S]*?\/\* End desktop Terms workspace \*\/[\s\S]*?\}/)?.[0] ?? "";
  const wideDesktopMedia = css.match(/@media \(min-width: 1680px\) \{[\s\S]*?\/\* End wide desktop Terms workspace \*\/[\s\S]*?\}/)?.[0] ?? "";

  assert.match(desktopMedia, /\.terms-document-grid\s*\{[^}]*counter-reset:\s*terms-section;/);
  assert.match(desktopMedia, /\.terms-policy \.terms-document-grid section\s*\{[^}]*min-height:\s*0;/);
  assert.match(desktopMedia, /\.terms-policy \.terms-document-grid section:nth-child\(odd\):not\(\.privacy-contact\)\s*\{[^}]*border-right:\s*1px\s+solid/);
  assert.match(desktopMedia, /\.terms-policy \.terms-document-grid section::before\s*\{[^}]*position:\s*absolute;[^}]*counter-increment:\s*terms-section;[^}]*content:\s*"0"\s+counter\(terms-section\);/);
  assert.match(wideDesktopMedia, /\.terms-policy\s*\{[^}]*width:\s*min\(1600px,\s*100%\);[^}]*grid-template-columns:\s*420px\s+minmax\(0,\s*1fr\);/);
});

test("Terms of Use keeps global desktop navigation and signed-in account state without duplicating content", async () => {
  const html = renderToStaticMarkup(
    React.createElement(TermsPageView, {
      signedIn: true,
      displayName: "Sam",
    }),
  );
  const css = await readFile(new URL("../src/app/mobile-web.css", import.meta.url), "utf8");
  const desktopMedia = css.match(/@media \(min-width: 1180px\) \{[\s\S]*?\/\* End desktop Terms shell \*\/[\s\S]*?\}/)?.[0] ?? "";

  assert.equal(html.match(/class="sqc-desktop-header-shell"/g)?.length, 1);
  assert.match(html, /aria-label="Desktop shortcuts"/);
  assert.match(html, /aria-current="page"[^>]*href="\/terms"/);
  assert.match(html, /class="sqc-desktop-sign-in" href="\/account">Sam<\/a>/);
  assert.equal(html.match(/<h1[^>]*>Terms of Use<\/h1>/g)?.length, 1);
  assert.match(desktopMedia, /\.terms-desktop-shell\s+\.sqc-desktop-route-only\s*\{[^}]*display:\s*block/);
  assert.equal(css.replace(desktopMedia, "").includes(".terms-desktop-shell .sqc-desktop-route-only"), false, "mobile Terms must retain its standalone composition below 1180px");
});
