import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import MobileAppWebShell from "../src/components/mobile-app-web-shell";
import Loading from "../src/app/loading";
import NotFound from "../src/app/not-found";

test("signed-out Home matches Android v338 without an extra guest navigation panel", () => {
  const html = renderToStaticMarkup(React.createElement(MobileAppWebShell, {
    activeTab: "home",
    signedIn: false,
  }));

  assert.match(html, />Browse Solo Side Quests</);
  assert.match(html, />Browse Multiplayer Side Quests</);
  assert.match(html, />Choose sign-in method</);
  assert.doesNotMatch(html, /aria-label="Guest menu"/);
});

test("signed-out support and privacy remain reachable after leaving Home", () => {
  const html = renderToStaticMarkup(React.createElement(MobileAppWebShell, {
    activeTab: "sideQuests",
    signedIn: false,
  }, React.createElement("p", null, "Solo catalog")));

  assert.match(html, /aria-label="Guest menu"/);
  assert.match(html, /href="\/support"[^>]*>Help &amp; Support</);
  assert.match(html, /href="\/privacy"[^>]*>Privacy</);
});

test("route loading matches Android v338 without navigation before data is ready", () => {
  const html = renderToStaticMarkup(React.createElement(Loading));

  assert.match(html, /Loading the live quest board/);
  assert.doesNotMatch(html, /sqc-app-header/);
  assert.doesNotMatch(html, /aria-label="Guest menu"/);
});

test("signed-out not-found keeps mobile recovery and adds a desktop recovery workspace", () => {
  const html = renderToStaticMarkup(React.createElement(NotFound));

  assert.match(html, /class="[^"]*desktop-recovery/);
  assert.match(html, /aria-label="Desktop shortcuts"/);
  assert.match(html, /aria-labelledby="desktop-recovery-title"/);
  assert.match(html, /id="desktop-recovery-title"[^>]*>That page wandered off the board\.</);
  assert.match(html, /href="\/"[^>]*>Return home</);
  assert.match(html, /href="\/side-quests"><span>01<\/span><strong>Browse Solo/);
  assert.match(html, /href="\/community-side-quests"><span>02<\/span><strong>Browse Community/);
  assert.match(html, /href="\/multiplayer"><span>03<\/span><strong>Browse Multiplayer/);
  assert.match(html, /href="\/support"><span>04<\/span><strong>Get help/);

  assert.match(html, /aria-label="Guest menu"/);
  assert.match(html, /href="\/support"[^>]*>Help &amp; Support</);
});

test("desktop recovery preserves the 1180px composition boundary", () => {
  const css = readFileSync(new URL("../src/app/mobile-web.css", import.meta.url), "utf8");

  assert.match(css, /\.sqc-desktop-recovery\s*\{\s*display:\s*none;/);
  assert.match(css, /@media \(min-width:\s*1180px\)[\s\S]*\.desktop-recovery \.sqc-recovery-mobile[^{]*\{[^}]*display:\s*none;/);
  assert.match(css, /@media \(min-width:\s*1180px\)[\s\S]*\.desktop-recovery \.sqc-desktop-recovery[^{]*\{[^}]*display:\s*grid;/);
  assert.match(css, /\.desktop-recovery \.sqc-desktop-recovery-routes[^{]*\{[^}]*grid-template-columns:\s*repeat\(2,/);
});

test("guest Home navigation change leaves signed-in, modal, and immersive shells unchanged", () => {
  const signedIn = renderToStaticMarkup(React.createElement(MobileAppWebShell, {
    activeTab: "home",
    signedIn: true,
  }));
  assert.match(signedIn, /aria-label="Open main menu"/);
  assert.doesNotMatch(signedIn, /aria-label="Guest menu"/);

  for (const html of [
    renderToStaticMarkup(React.createElement(MobileAppWebShell, {
      activeTab: "sideQuests",
      signedIn: false,
      modalPresentation: true,
    }, React.createElement("p", null, "Modal"))),
    renderToStaticMarkup(React.createElement(MobileAppWebShell, {
      activeTab: "sideQuests",
      signedIn: false,
      immersivePresentation: true,
    }, React.createElement("p", null, "Immersive"))),
  ]) {
    assert.doesNotMatch(html, /aria-label="Guest menu"/);
  }
});
