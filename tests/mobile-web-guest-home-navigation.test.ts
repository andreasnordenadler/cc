import assert from "node:assert/strict";
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

test("signed-out loading and not-found surfaces keep their existing guest navigation", () => {
  for (const html of [
    renderToStaticMarkup(React.createElement(Loading)),
    renderToStaticMarkup(React.createElement(NotFound)),
  ]) {
    assert.match(html, /aria-label="Guest menu"/);
    assert.match(html, /href="\/support"[^>]*>Help &amp; Support</);
  }
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
