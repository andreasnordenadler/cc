import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import PrivacyPage, { metadata } from "../src/app/privacy/page";

test("Privacy Policy keeps its public launch-draft content and actions", () => {
  const html = renderToStaticMarkup(React.createElement(PrivacyPage));

  assert.equal(metadata.title, "Privacy Policy — Side Quest Chess");
  assert.match(html, /<h1[^>]*>Privacy Policy<\/h1>/);
  assert.match(html, /Launch draft updated:/);
  assert.match(html, /Chess game verification/);
  assert.match(html, /Retention and deletion/);
  assert.match(html, /href="mailto:andreas\.nordenadler@gmail\.com\?subject=Side%20Quest%20Chess%20privacy%20request"/);
  assert.equal(html.match(/aria-label="Privacy policy sections"/g)?.length, 1);
  assert.equal(html.match(/<section /g)?.length, 9, "the redesign preserves every policy section");
});

test("Privacy Policy becomes a desktop reading workspace at the established boundary", async () => {
  const html = renderToStaticMarkup(React.createElement(PrivacyPage));
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
