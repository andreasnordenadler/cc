import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import MobileAppWebShell, { desktopHomeMenuItems, mobileWebMenuItems } from "../src/components/mobile-app-web-shell";

test("desktop home menu preserves the app menu labels, destinations, and order", () => {
  assert.deepEqual(desktopHomeMenuItems, mobileWebMenuItems);
  assert.deepEqual(
    desktopHomeMenuItems.map(({ label, href }) => ({ label, href })),
    [
      { label: "Home", href: "/" },
      { label: "Solo Side Quests", href: "/side-quests" },
      { label: "Multiplayer Side Quests", href: "/multiplayer" },
      { label: "Trophy Cabinet", href: "/trophy-cabinet" },
      { label: "My Custom Side Quests", href: "/custom-side-quests" },
      { label: "Create Custom Side Quest", href: "/create-custom-side-quest" },
      { label: "Create Multiplayer Side Quest", href: "/create-multiplayer-side-quest" },
      { label: "My Account", href: "/account" },
      { label: "Help & Support", href: "/support" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  );
});

test("signed-out home renders an app surface plus a desktop-only guided experience", () => {
  const html = renderToStaticMarkup(
    createElement(MobileAppWebShell, { activeTab: "home", signedIn: false }),
  );

  assert.match(html, /class="sqc-app-only"/);
  assert.match(html, /class="sqc-desktop-home-only"/);
  assert.match(html, /aria-label="Desktop main menu"/);
  assert.match(html, /Choose a Side Quest/);
  assert.match(html, /Play a public game/);
  assert.match(html, /SQC verifies it/);
  assert.match(html, /Earn your Coat of Arms/);
  assert.match(html, /Every bad idea deserves a coat of arms/);
  assert.match(html, /href="\/side-quests"[^>]*>Choose a Side Quest<\/a>/);
  assert.match(html, /href="\/sign-in"[^>]*>Sign in<\/a>/);
});

test("desktop home stays hidden until the full-desktop breakpoint", () => {
  const css = readFileSync("src/app/mobile-web.css", "utf8");
  assert.match(css, /\.sqc-desktop-home-only\s*\{[^}]*display:\s*none;/);
  assert.match(css, /@media\s*\(min-width:\s*1180px\)[\s\S]*?\.sqc-app-only\s*\{[^}]*display:\s*none;/);
  assert.match(css, /@media\s*\(min-width:\s*1180px\)[\s\S]*?\.sqc-desktop-home-only\s*\{[^}]*display:\s*block;/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?html\s*\{[^}]*scroll-behavior:\s*auto;/);
  assert.match(css, /\.sqc-desktop-sign-in\s*\{[^}]*max-width:[^;}]+;[^}]*overflow:\s*hidden;[^}]*text-overflow:\s*ellipsis;[^}]*white-space:\s*nowrap;/);
});

test("signed-in desktop home guides setup while retaining the existing app home", () => {
  const html = renderToStaticMarkup(
    createElement(MobileAppWebShell, {
      activeTab: "home",
      signedIn: true,
      displayName: "Sam",
      activeMultiplayerRows: [],
      trophyRows: [],
    }),
  );

  assert.match(html, /class="sqc-app-only"/);
  assert.match(html, /class="sqc-desktop-home-only"/);
  assert.match(html, /Let’s choose your first Side Quest/);
  assert.match(html, /aria-label="Getting started"/);
  assert.match(html, />Connect chess account<\/a>/);
  assert.match(html, />Choose a Side Quest<\/a>/);
  assert.match(html, />Play and verify<\/strong>/);
  assert.match(html, /class="sqc-current-card/);
  assert.equal(html.match(/class="sqc-current-card/g)?.length, 1, "signed-in Home should render one interactive current-card subtree");
});

test("non-home routes never render the desktop home composition", () => {
  const html = renderToStaticMarkup(
    createElement(
      MobileAppWebShell,
      {
        activeTab: "sideQuests",
        signedIn: false,
      },
      createElement("p", null, "Catalog"),
    ),
  );

  assert.doesNotMatch(html, /sqc-desktop-home-only/);
  assert.doesNotMatch(html, /sqc-app-only/);
  assert.match(html, />Catalog<\/p>/);
});
