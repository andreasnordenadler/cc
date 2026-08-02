import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import MobileAppWebShell, { desktopHomeMenuItems, mobileWebMenuItems, MobileCommunitySideQuestsScreen, MobileCreateCustomScreen, MobileCustomSideQuestsScreen, MobileMultiplayerSideQuestsScreen, MobileSoloSideQuestsScreen } from "../src/components/mobile-app-web-shell";
import { CHALLENGES } from "../src/lib/challenges";

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
  assert.match(html, />Your next chess game needs a terrible side plot\.<\/h1>/);
  assert.match(html, />Choose your bad idea<\/a>/);
  assert.match(html, />The ritual is suspiciously simple\.<\/h2>/);
  assert.match(html, />Present evidence to the paperwork goblin<\/strong>/);
  assert.match(html, />Receive unnecessary heraldry<\/strong>/);
  assert.match(html, />Three respectable ways to ruin a perfectly normal game\.<\/h2>/);
  assert.match(html, /Every bad idea deserves a coat of arms/);
  assert.match(html, />Open the Trophy Cabinet/);
  assert.match(html, />Start a Multiplayer Side Quest/);
  assert.match(html, /Knights Before Coffee/);
  assert.match(html, /href="\/side-quests"[^>]*>Choose your bad idea<\/a>/);
  assert.match(html, /href="\/sign-in\?redirect_url=%2F"[^>]*>Sign in<\/a>/);
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

test("Solo discovery renders one catalog plus desktop navigation with the correct current route", () => {
  const html = renderToStaticMarkup(
    createElement(
      MobileAppWebShell,
      {
        activeTab: "sideQuests",
        signedIn: false,
        desktopPresentation: "solo-discovery",
      },
      createElement(MobileSoloSideQuestsScreen, { challenges: CHALLENGES, signedIn: false }),
    ),
  );

  assert.doesNotMatch(html, /sqc-desktop-home-only/);
  assert.doesNotMatch(html, /sqc-app-only/);
  assert.match(html, /class="sqc-desktop-route-only"/);
  assert.match(html, /aria-label="Desktop shortcuts"/);
  assert.match(html, /<a[^>]*aria-current="page"[^>]*href="\/side-quests">Solo Side Quests<\/a>/);
  assert.doesNotMatch(html, /<a[^>]*aria-current="page"[^>]*href="\/">Home<\/a>/);
  assert.match(html, /class="sqc-desktop-catalog-intro"/);
  assert.match(html, />Choose the rule that will ruin your next perfectly normal game\.<\/h1>/);
  assert.equal(html.match(/class="sqc-catalog"/g)?.length, 1, "desktop and mobile share one catalog subtree");
});

test("routes that share the Solo app tab do not inherit the desktop discovery composition", () => {
  const html = renderToStaticMarkup(
    createElement(
      MobileAppWebShell,
      { activeTab: "sideQuests", signedIn: false },
      createElement("p", null, "Custom or detail surface"),
    ),
  );

  assert.doesNotMatch(html, /sqc-desktop-route-only|desktop-solo-discovery/);
  assert.match(html, />Custom or detail surface<\/p>/);
});

test("Solo discovery switches to a wide card grid only at the established desktop boundary", () => {
  const css = readFileSync("src/app/mobile-web.css", "utf8");

  assert.match(css, /\.sqc-desktop-route-only,\s*\.sqc-desktop-catalog-intro,\s*\.sqc-desktop-community-intro,\s*\.sqc-desktop-custom-intro,\s*\.sqc-desktop-multiplayer-intro\s*\{[^}]*display:\s*none;/);
  assert.match(css, /@media\s*\(min-width:\s*1180px\)[\s\S]*?\.sqc-mobile-web\.desktop-solo-discovery\s+\.sqc-screen\s*\{[^}]*width:\s*min\(1240px,\s*calc\(100%\s*-\s*64px\)\)/);
  assert.match(css, /\.sqc-mobile-web\.desktop-solo-discovery\s+\.sqc-catalog\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\);/);
  assert.match(css, /\.sqc-mobile-web\.desktop-solo-discovery\s+\.sqc-app-row\s*\{[^}]*position:\s*relative;[^}]*grid-template-columns:\s*68px\s+minmax\(0,\s*1fr\);/);
  assert.match(css, /\.sqc-mobile-web\.desktop-solo-discovery\s+\.sqc-row-copy\s*\{[^}]*padding-right:\s*64px;/);
  assert.match(css, /\.sqc-mobile-web\.desktop-solo-discovery\s+\.sqc-row-title-line\s*>\s*strong\s*\{[^}]*-webkit-line-clamp:\s*2;[^}]*white-space:\s*normal;/);
  assert.match(css, /@media\s*\(min-width:\s*1180px\)[\s\S]*?\.sqc-mobile-web\.desktop-solo-discovery\s+\.sqc-app-row\s*\{[^}]*min-height:\s*156px/);
  assert.match(css, /\.sqc-mobile-web\.desktop-solo-discovery:not\(\.signed-out\)\s+\.sqc-solo-brand-tabs\s+\.sqc-brand-switch\s*\{[^}]*position:\s*static;[^}]*margin:\s*0;/);
  assert.match(css, /\.sqc-mobile-web\.desktop-solo-discovery\s+\.sqc-solo-brand-tabs\s+\.sqc-brand-switch\s*\{[^}]*width:\s*44px;[^}]*height:\s*44px;[^}]*justify-self:\s*center;/);
});

test("Community discovery becomes a desktop workspace without duplicating its interactive catalog", () => {
  const rows = [{
    id: "community-one",
    title: "Castle? Never Heard Of It",
    meta: "By Nora Skewer · Finish a game without castling.",
    href: "/challenges/community/community-one",
    sourceBadge: "Community",
    status: "Ready",
    creatorKey: "nora",
    creatorName: "Nora Skewer",
    updatedAtMs: 1,
    popularityScore: 1,
    likeCount: 1,
    likedByViewer: false,
    completedByViewer: false,
    isNew: false,
  }];
  const html = renderToStaticMarkup(
    createElement(
      MobileAppWebShell,
      { activeTab: "sideQuests", signedIn: false, desktopPresentation: "community-discovery" },
      createElement(MobileCommunitySideQuestsScreen, { rows, signedIn: false }),
    ),
  );

  assert.match(html, /class="sqc-desktop-route-only"/);
  assert.match(html, /aria-label="Desktop shortcuts"/);
  assert.doesNotMatch(html, /<a[^>]*aria-current="page"[^>]*href="\/side-quests">Solo Side Quests<\/a>/);
  assert.match(html, /class="sqc-desktop-community-intro"/);
  assert.match(html, />Player-made rules, arranged for serious browsing\.<\/h1>/);
  assert.equal(html.match(/aria-label="Community Side Quest filters"/g)?.length, 1, "desktop and mobile share one filter subtree");
  assert.equal(html.match(/aria-label="Open Castle\? Never Heard Of It"/g)?.length, 1, "desktop and mobile share one catalog subtree");
});

test("Community discovery uses a wide desktop grid only at the established boundary", () => {
  const css = readFileSync("src/app/mobile-web.css", "utf8");

  assert.match(css, /@media\s*\(min-width:\s*1180px\)[\s\S]*?\.sqc-mobile-web\.desktop-community-discovery\s+\.sqc-screen\s*\{[^}]*width:\s*min\(1320px,\s*calc\(100%\s*-\s*64px\)\)/);
  assert.match(css, /\.sqc-mobile-web\.desktop-community-discovery\s+\.sqc-community-solo-screen\s*\{[^}]*grid-template-columns:\s*220px\s+minmax\(0,\s*1fr\);/);
  assert.match(css, /\.sqc-mobile-web\.desktop-community-discovery\s+\.sqc-community-catalog-section\s*\{[^}]*grid-column:\s*2;/);
  assert.match(css, /\.sqc-mobile-web\.desktop-community-discovery\s+\.sqc-catalog\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\);/);
  assert.match(css, /\.sqc-mobile-web\.desktop-community-discovery\s+\.sqc-community-browse-panel\s*\{[^}]*grid-template-columns:\s*minmax\(260px,\s*1fr\)\s+auto;/);
  assert.match(css, /\.sqc-mobile-web\.desktop-community-discovery\s+\.sqc-community-controls\s*\{[^}]*display:\s*flex;/);
});

test("Multiplayer discovery becomes one desktop tournament desk without duplicating catalog actions", () => {
  const rows = [{
    id: "official-one",
    title: "Official 14-Day Starter Shield",
    meta: "Official · 0 players · 14d left",
    href: "/groupquests/official-one",
    sourceBadge: "Official",
    status: "Join",
    likeSummary: { count: 0, likedByViewer: false },
  }];
  const html = renderToStaticMarkup(
    createElement(
      MobileAppWebShell,
      { activeTab: "multiplayerSideQuests", signedIn: false, desktopPresentation: "multiplayer-discovery" },
      createElement(MobileMultiplayerSideQuestsScreen, {
        selectedTab: "official",
        signedIn: false,
        officialRows: rows as never,
        communityRows: [],
      }),
    ),
  );

  assert.match(html, /class="sqc-mobile-web desktop-multiplayer-discovery signed-out"/);
  assert.match(html, /class="sqc-desktop-route-only"/);
  assert.match(html, /<a[^>]*aria-current="page"[^>]*href="\/multiplayer">Multiplayer Side Quests<\/a>/);
  assert.match(html, /class="sqc-desktop-multiplayer-intro"/);
  assert.match(html, />Shared challenges, arranged like a tournament desk\.<\/h1>/);
  assert.equal(html.match(/aria-label="Multiplayer Side Quest catalog"/g)?.length, 1, "desktop and mobile share one catalog navigation subtree");
  assert.equal(html.match(/aria-label="Open Official 14-Day Starter Shield"/g)?.length, 1, "desktop and mobile share one quest action subtree");
});

test("Multiplayer discovery keeps mobile below 1180px and uses a wide desktop grid at the boundary", () => {
  const css = readFileSync("src/app/mobile-web.css", "utf8");
  const route = readFileSync("src/app/multiplayer/page.tsx", "utf8");
  const aliasRoute = readFileSync("src/app/multiplayer-side-quests/page.tsx", "utf8");
  const desktopMedia = readCssBlock(css, css.indexOf("@media (min-width: 1180px)"));

  assert.match(route, /desktopPresentation="multiplayer-discovery"/);
  assert.match(aliasRoute, /desktopPresentation="multiplayer-discovery"/, "the tab and like-return route must preserve the desktop workspace");
  assert.match(css, /\.sqc-desktop-multiplayer-intro\s*\{[^}]*display:\s*none;/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-multiplayer-discovery\s+\.sqc-screen\s*\{[^}]*width:\s*min\(1320px,\s*calc\(100%\s*-\s*64px\)\)/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-multiplayer-discovery\s+\.sqc-stack\s*\{[^}]*grid-template-columns:\s*200px\s+minmax\(0,\s*1fr\);/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-multiplayer-discovery\s+\.sqc-panel\.list\s+\.sqc-catalog\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\);/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-multiplayer-discovery\s+\.sqc-app-row\s*\{[^}]*min-height:\s*156px;/);
  assert.equal(css.replace(desktopMedia, "").includes(".sqc-mobile-web.desktop-multiplayer-discovery"), false, "desktop Multiplayer rules must not leak below 1180px");
});

test("Custom library becomes one desktop workshop without duplicating its filters or create path", () => {
  const rows = [{
    id: "custom-one",
    title: "Knight Errand",
    meta: "Saved · Private to you · Move a knight before move 3. · No plays yet.",
    href: "/custom-side-quests/custom-one",
    image: "/badges/custom/community/community-coat-01.png",
    sourceBadge: "Private",
    status: "Ready",
    lifecycle: "published" as const,
    visibility: "private" as const,
    updatedAt: "2026-08-01T08:00:00.000Z",
  }];
  const html = renderToStaticMarkup(
    createElement(
      MobileAppWebShell,
      { activeTab: "sideQuests", signedIn: true, desktopPresentation: "custom-library" },
      createElement(MobileCustomSideQuestsScreen, { rows }),
    ),
  );

  assert.match(html, /class="sqc-desktop-route-only"/);
  assert.match(html, /class="sqc-desktop-custom-intro"/);
  assert.match(html, />Your Side Quest workshop, with room to think\.<\/h1>/);
  assert.doesNotMatch(html, /<a[^>]*aria-current="page"[^>]*href="\/side-quests">Solo Side Quests<\/a>/);
  assert.match(html, /<a[^>]*aria-current="page"[^>]*href="\/custom-side-quests"><span[^>]*><\/span>My Custom Side Quests<\/a>/);
  assert.equal(html.match(/aria-label="My Custom Side Quest filters"/g)?.length, 1);
  assert.equal(html.match(/>\+ Create<\/a>/g)?.length, 1);
  assert.equal(html.match(/href="\/custom-side-quests\/custom-one"/g)?.length, 1);
});

test("Custom library keeps the mobile composition below 1180px and exposes a desktop two-column workspace at the boundary", () => {
  const css = readFileSync("src/app/mobile-web.css", "utf8");

  assert.match(css, /\.sqc-desktop-custom-intro,\s*\.sqc-desktop-multiplayer-intro\s*\{[^}]*display:\s*none;/);
  assert.match(css, /@media\s*\(min-width:\s*1180px\)[\s\S]*?\.sqc-mobile-web\.desktop-custom-library\s+\.sqc-screen\s*\{[^}]*width:\s*min\(1320px,\s*calc\(100%\s*-\s*64px\)\)/);
  assert.match(css, /\.sqc-mobile-web\.desktop-custom-library\s+\.sqc-custom-library-screen\s*\{[^}]*grid-template-columns:\s*240px\s+minmax\(0,\s*1fr\);/);
  assert.match(css, /\.sqc-mobile-web\.desktop-custom-library\s+\.sqc-community-catalog-section\s*\{[^}]*grid-column:\s*2;/);
  assert.match(css, /\.sqc-mobile-web\.desktop-custom-library\s+\.sqc-catalog\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\);/);
});

test("official Solo detail becomes one desktop workspace without duplicating its actions", () => {
  const html = renderToStaticMarkup(
    createElement(
      MobileAppWebShell,
      { activeTab: "sideQuests", signedIn: false, desktopPresentation: "official-detail" },
      createElement(
        "div",
        { className: "sqc-stack sqc-official-solo-detail-screen" },
        createElement("button", { type: "button" }, "Share public link"),
      ),
    ),
  );

  assert.match(html, /class="sqc-mobile-web desktop-official-detail signed-out"/);
  assert.match(html, /class="sqc-desktop-route-only"/);
  assert.match(html, /<a[^>]*aria-current="page"[^>]*href="\/side-quests">Solo Side Quests<\/a>/);
  assert.equal(html.match(/>Share public link<\/button>/g)?.length, 1, "desktop and mobile share one action subtree");
});

test("official Solo detail uses a wide two-column composition only at the desktop boundary", () => {
  const css = readFileSync("src/app/mobile-web.css", "utf8");

  assert.match(css, /@media\s*\(min-width:\s*1180px\)[\s\S]*?\.sqc-mobile-web\.desktop-official-detail\s+\.sqc-screen\s*\{[^}]*width:\s*min\(1240px,\s*calc\(100%\s*-\s*64px\)\)/);
  assert.match(css, /\.sqc-mobile-web\.desktop-official-detail\s+\.sqc-official-solo-detail-screen\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1\.35fr\)\s+minmax\(340px,\s*\.65fr\);/);
  assert.match(css, /\.sqc-mobile-web\.desktop-official-detail\s+\.sqc-official-quest-card\s*\{[^}]*grid-column:\s*1\s*\/\s*-1;/);
  assert.match(css, /\.sqc-mobile-web\.desktop-official-detail\s+\.sqc-official-solo-detail-screen\s*>\s*\.sqc-proof-action-card\s*\{[^}]*grid-column:\s*2;[^}]*grid-row:\s*2\s*\/\s*span\s*3;/);
  assert.match(css, /\.sqc-mobile-web\.desktop-official-detail\s+\.sqc-official-solo-detail-screen\s*>\s*\.sqc-community-share-actions\s*\{[^}]*grid-column:\s*1;/);
  assert.doesNotMatch(css, /\.sqc-mobile-web\.desktop-official-detail\s+\.sqc-proof-action-card\s*\{/);
});

test("Community Solo detail opts into persistent desktop navigation without duplicating its actions", () => {
  const html = renderToStaticMarkup(
    createElement(
      MobileAppWebShell,
      {
        activeTab: "sideQuests",
        signedIn: false,
        desktopPresentation: "community-detail",
        modalPresentation: true,
        immersivePresentation: true,
        closeHref: "/community-side-quests",
      },
      createElement(
        "div",
        { className: "sqc-stack sqc-community-detail-screen" },
        createElement("div", { className: "sqc-community-task-rail" },
          createElement("button", { type: "button" }, "Share public link"),
        ),
      ),
    ),
  );

  assert.match(html, /class="sqc-mobile-web desktop-community-detail immersive signed-out"/);
  assert.match(html, /class="sqc-desktop-route-only"/);
  assert.match(html, /aria-label="Desktop shortcuts"/);
  assert.equal(html.match(/>Share public link<\/button>/g)?.length, 1, "desktop and mobile share one action subtree");
});

test("Community Solo detail becomes a wide reading workspace only at the desktop boundary", () => {
  const css = readFileSync("src/app/mobile-web.css", "utf8");
  const route = readFileSync("src/app/challenges/community/[id]/page.tsx", "utf8");

  assert.match(route, /desktopPresentation="community-detail"/);
  assert.match(css, /@media\s*\(min-width:\s*1180px\)[\s\S]*?\.sqc-mobile-web\.desktop-community-detail\s+\.sqc-screen\s*\{[^}]*width:\s*min\(1240px,\s*calc\(100%\s*-\s*64px\)\)/);
  assert.match(css, /\.sqc-mobile-web\.desktop-community-detail\s+\.sqc-community-detail-screen\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1\.35fr\)\s+minmax\(340px,\s*\.65fr\);/);
  assert.match(css, /\.sqc-mobile-web\.desktop-community-detail\s+\.sqc-community-detail-hero\s*\{[^}]*grid-column:\s*1\s*\/\s*-1;/);
  assert.match(css, /\.sqc-mobile-web\.desktop-community-detail\s+\.sqc-community-task-rail\s*\{[^}]*grid-column:\s*2;[^}]*grid-row:\s*2\s*\/\s*span\s*4;[^}]*position:\s*sticky;/);
  assert.match(css, /\.sqc-mobile-web\.desktop-community-detail\s+\.sqc-multiplayer-score-grid\s*\{[^}]*grid-column:\s*1;/);
});

test("Custom owner detail opts into one persistent desktop workspace", () => {
  const html = renderToStaticMarkup(
    createElement(
      MobileAppWebShell,
      {
        activeTab: "sideQuests",
        signedIn: true,
        desktopPresentation: "custom-detail",
        modalPresentation: true,
        immersivePresentation: true,
        closeHref: "/custom-side-quests",
      },
      createElement(
        "div",
        { className: "sqc-stack sqc-custom-owner-detail-screen" },
        createElement("button", { type: "button" }, "Edit name & rules"),
      ),
    ),
  );

  assert.match(html, /class="sqc-mobile-web desktop-custom-detail immersive signed-in"/);
  assert.match(html, /class="sqc-desktop-route-only"/);
  assert.match(html, /<a[^>]*aria-current="page"[^>]*href="\/custom-side-quests"><span[^>]*><\/span>My Custom Side Quests<\/a>/);
  assert.equal(html.match(/>Edit name &amp; rules<\/button>/g)?.length, 1, "desktop and mobile share one owner-action subtree");
});

test("Custom owner detail becomes a wide command workspace only at the desktop boundary", () => {
  const css = readFileSync("src/app/mobile-web.css", "utf8");
  const route = readFileSync("src/app/custom-side-quests/[id]/page.tsx", "utf8");
  const desktopMediaStart = css.indexOf("@media (min-width: 1180px)");
  const desktopMedia = readCssBlock(css, desktopMediaStart);

  assert.match(route, /desktopPresentation="custom-detail"/);
  assert.match(route, /className="sqc-stack sqc-custom-library-screen sqc-custom-owner-detail-screen"/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-custom-detail\s+\.sqc-screen\s*\{[^}]*width:\s*min\(1280px,\s*calc\(100%\s*-\s*64px\)\)/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-custom-detail\s+\.sqc-custom-owner-detail-screen\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1\.35fr\)\s+minmax\(360px,\s*\.65fr\);/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-custom-detail\s+\.sqc-custom-owner-detail-hero\s*\{[^}]*grid-column:\s*1\s*\/\s*-1;/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-custom-detail\s+\.sqc-custom-owner-management\s*\{[^}]*grid-column:\s*2;[^}]*grid-row:\s*3\s*\/\s*span\s*3;[^}]*position:\s*sticky;/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-custom-detail\s+\.sqc-custom-owner-proof\s*\{[^}]*grid-column:\s*1;/);
  assert.equal(css.replace(desktopMedia, "").includes(".sqc-mobile-web.desktop-custom-detail"), false, "desktop Custom detail rules must not leak below 1180px");
});

test("Custom owner save feedback stays directly below the desktop hero", () => {
  const css = readFileSync("src/app/mobile-web.css", "utf8");
  const route = readFileSync("src/app/custom-side-quests/[id]/page.tsx", "utf8");
  const desktopMedia = readCssBlock(css, css.indexOf("@media (min-width: 1180px)"));

  assert.match(route, /className="sqc-action-success sqc-custom-owner-save-status"/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-custom-detail\s+\.sqc-custom-owner-save-status\s*\{[^}]*grid-column:\s*1\s*\/\s*-1;[^}]*grid-row:\s*2;/);
  assert.match(desktopMedia, /\.sqc-custom-owner-detail-screen:has\(>\s*\.sqc-custom-owner-save-status\)\s+\.sqc-custom-owner-visibility\s*\{[^}]*grid-row:\s*3;/);
  assert.match(desktopMedia, /\.sqc-custom-owner-detail-screen:has\(>\s*\.sqc-custom-owner-save-status\)\s+\.sqc-custom-owner-management\s*\{[^}]*grid-row:\s*4\s*\/\s*span\s*3;/);
});

test("Custom editor keeps one form while adding persistent desktop navigation and workspace regions", () => {
  const html = renderToStaticMarkup(
    createElement(
      MobileAppWebShell,
      {
        activeTab: "sideQuests",
        signedIn: false,
        desktopPresentation: "custom-editor",
        immersivePresentation: true,
        closeHref: "/custom-side-quests",
      },
      createElement(MobileCreateCustomScreen, { signedIn: false }),
    ),
  );

  assert.match(html, /class="sqc-mobile-web desktop-custom-editor immersive signed-out"/);
  assert.match(html, /class="sqc-desktop-route-only"/);
  assert.match(html, /<a[^>]*aria-current="page"[^>]*href="\/create-custom-side-quest"><span[^>]*><\/span>Create Custom Side Quest<\/a>/);
  assert.equal(html.match(/aria-label="Custom Side Quest builder"/g)?.length, 1, "desktop and mobile share one editor form");
  assert.match(html, /class="sqc-custom-builder-setup"/);
  assert.match(html, /class="sqc-custom-builder-workspace"/);
});

test("Custom editor becomes a wide two-column workbench only at the desktop boundary", () => {
  const css = readFileSync("src/app/mobile-web.css", "utf8");
  const route = readFileSync("src/app/create-custom-side-quest/page.tsx", "utf8");
  const desktopMedia = readCssBlock(css, css.indexOf("@media (min-width: 1180px)"));
  const reducedMotion = readCssBlock(css, css.lastIndexOf("@media (prefers-reduced-motion: reduce)"));

  assert.match(route, /desktopPresentation="custom-editor"/);
  assert.doesNotMatch(route, /closeHref=/, "desktop composition must not change the existing mobile close destination");
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-custom-editor\s+\.sqc-screen\s*\{[^}]*width:\s*min\(1280px,\s*calc\(100%\s*-\s*64px\)\)/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-custom-editor\s+\.sqc-custom-builder-hero\s*\{[^}]*grid-template-columns:\s*220px\s+minmax\(0,\s*1fr\);/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-custom-editor\s+\.sqc-custom-builder-card\s*\{[^}]*grid-template-columns:\s*320px\s+minmax\(0,\s*1fr\);/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-custom-editor\s+\.sqc-custom-builder-setup\s*\{[^}]*position:\s*sticky;/);
  assert.match(reducedMotion, /\.sqc-mobile-web\.desktop-custom-editor\s+\.sqc-template-card\s*\{[^}]*transition:\s*none\s*!important;[^}]*transform:\s*none\s*!important;/);
  assert.equal(css.replace(desktopMedia, "").replace(reducedMotion, "").includes(".sqc-mobile-web.desktop-custom-editor"), false, "desktop Custom editor composition rules must not leak below 1180px");
});

test("Multiplayer detail becomes one desktop tournament workspace without changing the mobile stack", () => {
  const css = readFileSync("src/app/mobile-web.css", "utf8");
  const route = readFileSync("src/app/groupquests/[id]/page.tsx", "utf8");
  const shell = readFileSync("src/components/mobile-app-web-shell.tsx", "utf8");
  const desktopMedia = readCssBlock(css, css.indexOf("@media (min-width: 1180px)"));

  assert.match(route, /desktopPresentation="multiplayer-detail"/);
  assert.match(route, /closeHref=\{quest\.sourceBadge === "Community" \? "\/multiplayer-side-quests" : "\/multiplayer"\}/, "mobile close destination stays intact");
  assert.match(shell, /className="sqc-native-card sqc-multiplayer-native-card sqc-multiplayer-primary-action"/);
  assert.match(shell, /className="sqc-native-card sqc-multiplayer-native-card sqc-multiplayer-share-card"/);
  assert.match(shell, /className="sqc-native-card sqc-multiplayer-native-card sqc-multiplayer-quest-list"/);
  assert.match(shell, /className="sqc-native-card sqc-multiplayer-native-card sqc-multiplayer-leaderboard"/);
  assert.match(shell, /className="sqc-native-card sqc-multiplayer-native-card sqc-multiplayer-rules"/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-multiplayer-detail\s+\.sqc-desktop-route-only\s*\{[^}]*display:\s*block;/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-multiplayer-detail[^{}]*\.sqc-close-screen\)[^{}]*\{[^}]*display:\s*none;/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-multiplayer-detail\s+\.sqc-screen\s*\{[^}]*width:\s*min\(1280px,\s*calc\(100%\s*-\s*64px\)\)/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-multiplayer-detail\s+\.sqc-multiplayer-public-detail-screen\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1\.45fr\)\s+minmax\(360px,\s*\.55fr\);[^}]*grid-auto-flow:\s*dense;/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-multiplayer-detail\s+\.sqc-multiplayer-public-detail-screen\s*>\s*\.sqc-multiplayer-primary-action\s*\{[^}]*grid-column:\s*2;[^}]*grid-row:\s*2\s*\/\s*span\s*2;[^}]*position:\s*sticky;/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-multiplayer-detail\s+\.sqc-multiplayer-quest-list\s*\{[^}]*grid-column:\s*1;/);
  assert.equal(css.replace(desktopMedia, "").includes(".sqc-mobile-web.desktop-multiplayer-detail"), false, "desktop Multiplayer detail rules must not leak below 1180px");
});

function readCssBlock(css: string, start: number) {
  assert.notEqual(start, -1, "expected CSS block start");
  const opening = css.indexOf("{", start);
  let depth = 0;
  for (let index = opening; index < css.length; index += 1) {
    if (css[index] === "{") depth += 1;
    if (css[index] === "}") depth -= 1;
    if (depth === 0) return css.slice(start, index + 1);
  }
  throw new Error("Unclosed CSS block");
}
