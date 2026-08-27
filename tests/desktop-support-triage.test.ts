import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MobileSupportScreen } from "../src/components/mobile-app-web-shell";

function readCssBlock(css: string, start: number) {
  const open = css.indexOf("{", start);
  let depth = 0;
  for (let index = open; index < css.length; index += 1) {
    if (css[index] === "{") depth += 1;
    if (css[index] === "}") {
      depth -= 1;
      if (depth === 0) return css.slice(start, index + 1);
    }
  }
  return "";
}

test("desktop Support exposes a page heading and direct triage wayfinding without changing its actions", () => {
  const html = renderToStaticMarkup(createElement(MobileSupportScreen, { signedIn: false }));

  assert.match(html, /<h1>How can we help\?<\/h1>/);
  assert.match(html, /<nav class="sqc-support-triage-nav" aria-label="Support tasks">/);
  for (const [label, href] of [
    ["Help topics", "#support-help-topics"],
    ["Legal &amp; privacy", "#support-legal"],
    ["Contact", "#support-contact"],
    ["Report a problem", "#support-report"],
  ]) {
    assert.match(html, new RegExp(`href="${href}"[^>]*>${label}<`));
  }
  for (const id of ["support-help-topics", "support-legal", "support-contact", "support-report"]) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  assert.match(html, /href="\/side-quests"[^>]*>Browse Solo Side Quests<\/a>/);
  assert.match(html, /href="\/sign-in\?redirect_url=\/support"[^>]*>Sign in to message support<\/a>/);

  const signedInHtml = renderToStaticMarkup(createElement(MobileSupportScreen, { signedIn: true }));
  assert.match(signedInHtml, /<section id="support-report" class="sqc-support-card sqc-support-report" aria-label="Report a problem">/);
});

test("support triage wayfinding is desktop-only and clears the sticky account navigation", () => {
  const css = readFileSync("src/app/mobile-web.css", "utf8");
  const mobileCss = css.slice(0, css.indexOf("@media (min-width: 1180px)"));
  const desktopMedia = readCssBlock(css, css.indexOf("@media (min-width: 1180px)"));

  assert.match(mobileCss, /\.sqc-support-hero\s+:is\(h1,\s*h2\)\s*\{[^}]*font-size:\s*30px;/, "the semantic heading upgrade must preserve the mobile support title geometry");
  assert.match(mobileCss, /\.sqc-support-triage-nav\s*\{[^}]*display:\s*none;/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-support\s+\.sqc-support-triage-nav\s*\{[^}]*display:\s*grid;[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\);/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-support\s+:is\(#support-help-topics,\s*#support-legal,\s*#support-contact,\s*#support-report\)\s*\{[^}]*scroll-margin-top:\s*156px;/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-support\s+\.sqc-support-hero\s+h1\s*\{[^}]*font-size:\s*38px;/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.sqc-support-triage-nav\s+a\s*\{[^}]*transition:\s*none\s*!important;/);
});
