import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import MobileAppWebShell, { desktopHomeMenuItems, mobileWebMenuItems, MobileCommunitySideQuestDetailScreen, MobileCommunitySideQuestsScreen, MobileCreateCustomScreen, MobileCreateMultiplayerScreen, MobileCustomSideQuestsScreen, MobileMultiplayerDetailScreen, MobileMultiplayerSideQuestsScreen, MobileSoloSideQuestsScreen, MobileSupportScreen, MobileTrophyCabinetScreen } from "../src/components/mobile-app-web-shell";
import type { CommunitySoloCatalogClientRow } from "../src/components/catalog-clients";
import DesktopHomeMenu from "../src/components/desktop-home-menu";
import { LocalCustomDraftList } from "../src/components/local-custom-draft-library";
import { CHALLENGES } from "../src/lib/challenges";
import { getAccountReadinessHref } from "../src/lib/account-readiness-navigation";

type IsRequired<T, Key extends keyof T> = Record<Key, T[Key]> extends Pick<T, Key> ? true : false;
type CommunityScreenRow = Parameters<typeof MobileCommunitySideQuestsScreen>[0]["rows"][number];
const communityScreenSummaryIsRequired: IsRequired<CommunityScreenRow, "summary"> = true;
const communityScreenStatsAreRequired: IsRequired<CommunityScreenRow, "stats"> = true;
const communityClientSummaryIsRequired: IsRequired<CommunitySoloCatalogClientRow, "summary"> = true;
const communityClientStatsAreRequired: IsRequired<CommunitySoloCatalogClientRow, "stats"> = true;

test("Community Solo structured row data stays required through the desktop view model", () => {
  assert.equal(communityScreenSummaryIsRequired, true);
  assert.equal(communityScreenStatsAreRequired, true);
  assert.equal(communityClientSummaryIsRequired, true);
  assert.equal(communityClientStatsAreRequired, true);
});

test("desktop navigation preserves app destinations without duplicating the dedicated account action", () => {
  assert.deepEqual(
    desktopHomeMenuItems.slice(0, -1),
    mobileWebMenuItems.filter((item) => item.id !== "account"),
  );
  assert.deepEqual(desktopHomeMenuItems.at(-1), { id: "terms", label: "Terms of Use", href: "/terms", icon: "document" });
  const menuCss = readFileSync("src/app/mobile-web.css", "utf8");
  assert.match(menuCss, /\.sqc-menu-icon\.document\s*\{[^}]*--icon:\s*url\("data:image\/svg\+xml/);
  assert.equal(mobileWebMenuItems.find((item) => item.id === "account")?.href, "/account", "mobile menu keeps its account destination");
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
      { label: "Help & Support", href: "/support" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Use", href: "/terms" },
    ],
  );
});

test("desktop Explore menu groups secondary destinations without repeating persistent shortcuts", () => {
  const html = renderToStaticMarkup(
    createElement(DesktopHomeMenu, {
      items: desktopHomeMenuItems.slice(4),
      activeItemId: "custom",
    }),
  );

  assert.match(html, /<summary[^>]*><span>Explore<\/span>/);
  assert.match(html, /<span class="sqc-desktop-menu-group-title">Create &amp; manage<\/span>/);
  assert.match(html, /<span class="sqc-desktop-menu-group-title">Account &amp; help<\/span>/);
  assert.match(html, /aria-current="page"[^>]*href="\/custom-side-quests"/);
  assert.doesNotMatch(html, /href="\/">Home<\/a>/);
  assert.doesNotMatch(html, /href="\/side-quests">Solo Side Quests<\/a>/);
  assert.doesNotMatch(html, /href="\/multiplayer">Multiplayer Side Quests<\/a>/);
  assert.doesNotMatch(html, /href="\/trophy-cabinet">Trophy Cabinet<\/a>/);
  assert.doesNotMatch(html, /href="\/account">My Account<\/a>/);
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
  assert.match(html, />How heroic are you feeling today\?<\/h2>/);
  assert.match(html, /Pick a starting quest based on your current tolerance for terrible chess decisions\./);
  assert.match(html, /<span class="sqc-desktop-path-label">Cautiously heroic<\/span>/);
  assert.match(html, /<span class="sqc-desktop-path-label">Recklessly meaningful<\/span>/);
  assert.match(html, /<span class="sqc-desktop-path-label">Historically unwise<\/span>/);
  assert.match(html, /href="\/challenges\/knights-before-coffee"[^>]*[\s\S]*?Start with Knights Before Coffee/);
  assert.match(html, /href="\/challenges\/no-castle-club"[^>]*[\s\S]*?Try No Castle Club/);
  assert.match(html, /href="\/challenges\/queen-never-heard-of-her"[^>]*[\s\S]*?Lose the queen, win anyway/);
  assert.match(html, />Surprise me with a random Solo Side Quest<\/button>/);
  assert.match(html, />Or go find your own path\.<\/a>/);
  assert.match(html, /Every bad idea deserves a coat of arms/);
  assert.match(html, />Open the Trophy Cabinet/);
  assert.match(html, />Start a Multiplayer Side Quest/);
  assert.match(html, /Knights Before Coffee/);
  assert.match(html, /href="\/side-quests"[^>]*>Choose your bad idea<\/a>/);
  assert.match(html, /href="\/sign-in\?redirect_url=%2F"[^>]*>Sign in<\/a>/);
  assert.doesNotMatch(html, /href="\/account">My Account<\/a>/);
});

test("desktop home stays hidden until the full-desktop breakpoint", () => {
  const css = readFileSync("src/app/mobile-web.css", "utf8");
  assert.match(css, /\.sqc-desktop-home-only\s*\{[^}]*display:\s*none;/);
  assert.match(css, /@media\s*\(min-width:\s*1180px\)[\s\S]*?\.sqc-app-only\s*\{[^}]*display:\s*none;/);
  assert.match(css, /@media\s*\(min-width:\s*1180px\)[\s\S]*?\.sqc-desktop-home-only\s*\{[^}]*display:\s*block;/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?html\s*\{[^}]*scroll-behavior:\s*auto;/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.sqc-desktop-menu-chevron\s*\{[^}]*transition:\s*none\s*!important;/);
  assert.match(css, /\.sqc-desktop-sign-in\s*\{[^}]*max-width:[^;}]+;[^}]*overflow:\s*hidden;[^}]*text-overflow:\s*ellipsis;[^}]*white-space:\s*nowrap;/);
});

test("desktop global navigation remains available while route workspaces scroll", () => {
  const html = renderToStaticMarkup(
    createElement(MobileAppWebShell, {
      activeTab: "sideQuests",
      signedIn: false,
      desktopPresentation: "community-discovery",
    }),
  );
  const css = readFileSync("src/app/mobile-web.css", "utf8");
  const desktopMedia = readCssBlock(css, css.indexOf("@media (min-width: 1180px)"));

  assert.equal(html.match(/class="sqc-desktop-header-shell"/g)?.length, 1);
  assert.match(html, /<div class="sqc-desktop-header-shell"><header class="sqc-desktop-header">/);
  assert.match(desktopMedia, /\.sqc-desktop-route-only\s*\{[^}]*position:\s*sticky;[^}]*top:\s*0;[^}]*z-index:\s*30;/);
  assert.match(desktopMedia, /\.sqc-desktop-header-shell\s*\{[^}]*position:\s*sticky;[^}]*top:\s*0;[^}]*z-index:\s*30;[^}]*backdrop-filter:\s*blur\(18px\);/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-community-discovery\s+\.sqc-community-browse-panel\s*\{[^}]*top:\s*94px;/);
});

test("desktop Home turns Android heroism choices into a decision workspace", () => {
  const css = readFileSync("src/app/mobile-web.css", "utf8");
  const desktopMedia = readCssBlock(css, css.indexOf("@media (min-width: 1180px)"));

  assert.match(desktopMedia, /\.sqc-desktop-path-card\s*\{[^}]*grid-template-columns:\s*108px\s+minmax\(0,\s*1fr\);[^}]*min-height:\s*220px;/);
  assert.match(desktopMedia, /\.sqc-desktop-path-card\s+strong\s*\{[^}]*color:\s*var\(--gold\);/);
  assert.match(desktopMedia, /\.sqc-desktop-path-footer\s*\{[^}]*display:\s*flex;[^}]*justify-content:\s*space-between;/);
  assert.match(desktopMedia, /\.sqc-desktop-random-quest\s*\{[^}]*min-height:\s*44px;/);
  assert.match(desktopMedia, /\.sqc-desktop-random-quest:focus-visible\s*\{[^}]*outline:\s*3px\s+solid/);
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
  assert.match(html, /class="sqc-desktop-home-only(?:\s[^"]*)?"/);
  const css = readFileSync("src/app/mobile-web.css", "utf8");
  const desktopMedia = readCssBlock(css, css.indexOf("@media (min-width: 1180px)"));

  assert.match(html, /Let’s choose your first Side Quest/);
  assert.match(html, /aria-label="Getting started"/);
  assert.match(html, />Connect chess account<\/a>/);
  assert.match(html, />Choose a Side Quest<\/a>/);
  assert.match(html, />Play and verify<\/strong>/);
  assert.match(html, /class="sqc-current-card/);
  assert.equal(html.match(/class="sqc-current-card/g)?.length, 1, "signed-in Home should render one interactive current-card subtree");
  assert.equal(html.match(/class="sqc-desktop-sign-in" href="\/account"/g)?.length, 1, "signed-in desktop header exposes one dedicated account destination");
  assert.match(html, /class="sqc-desktop-home-only sqc-desktop-home-header-only"[\s\S]*class="sqc-desktop-header-shell"[\s\S]*<\/header><\/div><\/div><div class="sqc-desktop-signed-in sqc-responsive-signed-home">/);
  assert.match(html, /<nav class="sqc-desktop-dashboard-summary" aria-label="Quest log summary">/);
  assert.match(html, /<a href="\/side-quests"><span>Solo focus<\/span><strong>Choose a quest<\/strong><small>Start your next public-game objective<\/small><\/a>/);
  assert.match(html, /<a href="\/multiplayer"><span>Shared tables<\/span><strong>0 active<\/strong><small>Join or host a Multiplayer Side Quest<\/small><\/a>/);
  assert.match(html, /<a href="\/trophy-cabinet"><span>Cabinet<\/span><strong>0 coat of arms<\/strong><small>0 proof receipts recorded<\/small><\/a>/);
  assert.match(css, /\.sqc-responsive-signed-home\s*\{[^}]*width:\s*min\(460px,\s*100%\)/, "signed-in Home content remains in the responsive mobile flow");
  assert.match(css, /\.sqc-desktop-dashboard-summary\s*\{[^}]*display:\s*none;/, "desktop summary is absent from the mobile web composition");
  assert.match(desktopMedia, /\.sqc-desktop-home-header-only\s*\{[^}]*display:\s*contents;/, "only the desktop header wrapper releases its sticky containing block");
  assert.match(desktopMedia, /\.sqc-desktop-dashboard-summary\s*\{[^}]*display:\s*grid;[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\);/);
  assert.match(desktopMedia, /\.sqc-desktop-dashboard-grid\s+\.sqc-current-card\s*\{[^}]*margin:\s*0;[^}]*grid-column:\s*1;[^}]*grid-row:\s*span\s*2;/, "desktop active quest must not retain the mobile emblem offset and escape its grid");
  assert.match(desktopMedia, /\.sqc-desktop-dashboard-grid\s+\.sqc-active-solo-emblem\s*\{[^}]*top:\s*18px;[^}]*right:\s*68px;[^}]*left:\s*auto;[^}]*width:\s*90px;[^}]*height:\s*90px;/, "desktop emblem stays inside the active quest card instead of covering the summary rail");
});

test("desktop home keeps account setup visible when a Solo quest is active without a chess username", () => {
  const html = renderToStaticMarkup(
    createElement(MobileAppWebShell, {
      activeTab: "home",
      signedIn: true,
      displayName: "Sam",
      activeSolo: {
        id: "knights-before-coffee",
        href: "/challenges/knights-before-coffee",
        title: "Knights Before Coffee",
        objective: "Move only knights for the first four moves, then win.",
        instruction: "Play a new public game.",
      },
      activeMultiplayerRows: [],
      trophyRows: [],
    }),
  );

  assert.match(html, /Let’s finish setting up your quest log/);
  assert.match(html, /aria-label="Getting started"/);
  assert.match(html, /<li class="current"><span>1<\/span><a href="\/account">Connect chess account<\/a><\/li>/);
  assert.doesNotMatch(html, /latest proof[^<]*ready below/);
  assert.equal(html.match(/class="sqc-current-card/g)?.length, 1, "active Solo remains available while setup is incomplete");
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
  assert.match(css, /\.sqc-mobile-web\.desktop-solo-discovery\s+\.sqc-catalog\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\);/);
  assert.match(css, /\.sqc-mobile-web\.desktop-solo-discovery\s+\.sqc-app-row\s*\{[^}]*position:\s*relative;[^}]*grid-template-columns:\s*68px\s+minmax\(0,\s*1fr\);/);
  assert.match(css, /\.sqc-mobile-web\.desktop-solo-discovery\s+\.sqc-row-copy\s*\{[^}]*padding-right:\s*64px;/);
  assert.match(css, /\.sqc-mobile-web\.desktop-solo-discovery\s+\.sqc-row-title-line\s*>\s*strong\s*\{[^}]*-webkit-line-clamp:\s*2;[^}]*white-space:\s*normal;/);
  assert.match(css, /@media\s*\(min-width:\s*1180px\)[\s\S]*?\.sqc-mobile-web\.desktop-solo-discovery\s+\.sqc-app-row\s*\{[^}]*min-height:\s*190px/);
  assert.match(css, /\.sqc-mobile-web\.desktop-solo-discovery:not\(\.signed-out\)\s+\.sqc-solo-brand-tabs\s+\.sqc-brand-switch\s*\{[^}]*position:\s*static;[^}]*margin:\s*0;/);
  assert.match(css, /\.sqc-mobile-web\.desktop-solo-discovery\s+\.sqc-solo-brand-tabs\s+\.sqc-brand-switch\s*\{[^}]*width:\s*44px;[^}]*height:\s*44px;[^}]*justify-self:\s*center;/);
});

test("desktop Solo cards keep complete four-line objectives readable in the compact shelves", () => {
  const css = readFileSync("src/app/mobile-web.css", "utf8");
  const desktopMedia = readCssBlock(css, css.indexOf("@media (min-width: 1180px)"));

  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-solo-discovery\s+\.sqc-app-row\s*\{[^}]*min-height:\s*190px/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-solo-discovery\s+\.sqc-row-copy\s+small\s*\{[^}]*-webkit-line-clamp:\s*4;/);
});

test("Solo discovery offers a desktop-only sticky difficulty navigator for the long catalog", () => {
  const html = renderToStaticMarkup(
    createElement(MobileSoloSideQuestsScreen, { challenges: CHALLENGES, signedIn: false }),
  );
  const css = readFileSync("src/app/mobile-web.css", "utf8");
  const desktopMedia = readCssBlock(css, css.indexOf("@media (min-width: 1180px)"));

  assert.match(html, /<nav class="sqc-solo-difficulty-nav" aria-label="Jump to quest difficulty">/);
  assert.equal(html.match(/class="sqc-solo-difficulty-link"/g)?.length, 5);
  assert.match(html, /href="#solo-difficulty-easy"[^>]*><span>Easy<\/span><small>5<\/small><\/a>/);
  assert.match(html, /href="#solo-difficulty-absurd"[^>]*><span>Absurd<\/span><small>1<\/small><\/a>/);
  assert.match(css, /\.sqc-solo-difficulty-nav\s*\{[^}]*display:\s*none;/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-solo-discovery\s+\.sqc-solo-difficulty-nav\s*\{[^}]*display:\s*grid;[^}]*position:\s*sticky;[^}]*top:\s*104px;/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-solo-discovery\s+\.sqc-solo-browser\s*\{[^}]*grid-template-columns:\s*160px\s+minmax\(0,\s*1fr\);/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.sqc-mobile-web\.desktop-solo-discovery\s+\.sqc-solo-difficulty-link\s*\{[^}]*transition:\s*none\s*!important;[^}]*transform:\s*none\s*!important;/);
});

test("Solo discovery groups the one shared catalog into desktop difficulty shelves", () => {
  const html = renderToStaticMarkup(
    createElement(MobileSoloSideQuestsScreen, { challenges: CHALLENGES, signedIn: false }),
  );
  const css = readFileSync("src/app/mobile-web.css", "utf8");
  const desktopMedia = readCssBlock(css, css.indexOf("@media (min-width: 1180px)"));

  assert.equal(html.match(/class="sqc-solo-difficulty-shelf"/g)?.length, 5);
  assert.doesNotMatch(html, /<section class="sqc-solo-difficulty-shelf"|class="sqc-solo-difficulty-shelf"[^>]*aria-labelledby=/);
  for (const difficulty of ["Easy", "Medium", "Hard", "Brutal", "Absurd"]) {
    assert.match(html, new RegExp(`<h3[^>]*aria-label="${difficulty}"[^>]*data-label="${difficulty}"[^>]*></h3>`));
  }
  assert.equal(html.match(/class="sqc-app-row/g)?.length, CHALLENGES.length, "difficulty shelves must not duplicate quest actions");
  assert.match(css, /\.sqc-solo-difficulty-shelf,\s*\.sqc-solo-difficulty-grid\s*\{[^}]*display:\s*contents;/);
  assert.match(css, /\.sqc-solo-difficulty-heading\s*\{[^}]*display:\s*none;/);
  assert.match(css, /\.sqc-solo-difficulty-shelf\s*\+\s*\.sqc-solo-difficulty-shelf\s+\.sqc-app-row:first-child\s*\{[^}]*border-top:\s*1px\s+solid/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-solo-discovery\s+\.sqc-solo-difficulty-shelf\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\);[^}]*display:\s*grid;/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-solo-discovery\s+\.sqc-solo-difficulty-heading\s+h3::before\s*\{[^}]*content:\s*attr\(data-label\);/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-solo-discovery\s+\.sqc-solo-difficulty-heading\s*\{[^}]*display:\s*flex;/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-solo-discovery\s+\.sqc-solo-difficulty-grid\s*\{[^}]*grid-column:\s*1;/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-solo-discovery\s+\.sqc-solo-difficulty-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\);/);
});

test("Solo discovery expands difficulty shelves to three denser readable columns on large desktops", () => {
  const css = readFileSync("src/app/mobile-web.css", "utf8");
  const wideDesktopMedia = readCssBlock(css, css.indexOf("@media (min-width: 1680px)"));

  assert.match(wideDesktopMedia, /\.sqc-mobile-web\.desktop-solo-discovery\s+\.sqc-screen\s*\{[^}]*width:\s*min\(1600px,\s*calc\(100%\s*-\s*80px\)\)/);
  assert.match(wideDesktopMedia, /\.sqc-mobile-web\.desktop-solo-discovery\s+\.sqc-solo-difficulty-grid\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\);/);
  assert.match(
    wideDesktopMedia,
    /\.sqc-mobile-web\.desktop-solo-discovery\s+\.sqc-app-row\s*\{[^}]*min-height:\s*176px/,
    "wide three-column cards should keep all content in a compact comparison grid",
  );
});

test("Solo discovery uses three scan-friendly columns at a standard 1440px desktop", () => {
  const css = readFileSync("src/app/mobile-web.css", "utf8");
  const standardDesktopMedia = readCssBlock(css, css.indexOf("@media (min-width: 1380px)"));

  assert.match(
    standardDesktopMedia,
    /\.sqc-mobile-web\.desktop-solo-discovery\s+\.sqc-solo-difficulty-grid\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\);/,
  );
  assert.match(
    standardDesktopMedia,
    /\.sqc-mobile-web\.desktop-solo-discovery\s+\.sqc-app-row\s*\{[^}]*min-height:\s*178px/,
    "standard desktop cards should stay compact while growing for longer content",
  );
  assert.match(
    standardDesktopMedia,
    /\.sqc-mobile-web\.desktop-solo-discovery\s+\.sqc-row-copy\s*\{[^}]*padding-right:\s*54px/,
    "the denser card should still reserve space for quest status",
  );
});

test("desktop Solo cards expose Android opening hints and an explicit detail affordance without changing mobile rows", () => {
  const html = renderToStaticMarkup(
    createElement(MobileSoloSideQuestsScreen, { challenges: CHALLENGES, signedIn: false }),
  );
  const css = readFileSync("src/app/mobile-web.css", "utf8");
  const desktopMedia = readCssBlock(css, css.indexOf("@media (min-width: 1180px)"));

  assert.equal(html.match(/class="sqc-solo-card-details"/g)?.length, CHALLENGES.length);
  assert.match(html, /class="sqc-solo-card-note">Horses first\. Plans later\.<\/span>/);
  assert.equal(html.match(/class="sqc-solo-card-open">View quest details/g)?.length, CHALLENGES.length);
  assert.match(css, /\.sqc-solo-card-details\s*\{[^}]*display:\s*none;/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-solo-discovery\s+\.sqc-solo-card-details\s*\{[^}]*display:\s*grid;/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-solo-discovery\s+\.sqc-solo-card-note\s*\{[^}]*color:\s*rgba\(255,\s*247,\s*232,\s*\.62\);[^}]*-webkit-line-clamp:\s*2;/);
});

test("Community discovery becomes a desktop browsing workspace without duplicating responsive controls", () => {
  const rows = [{
    id: "community-one",
    title: "Castle? Never Heard Of It",
    meta: "By Nora Skewer · Finish a game without castling.",
    href: "/challenges/community/community-one",
    sourceBadge: "Community",
    status: "Ready",
    creatorKey: "nora",
    creatorName: "Nora Skewer",
    creatorBrowsePath: "/community-side-quests?creator=nora#creator-nora",
    summary: "Finish a game without castling.",
    stats: { soloAttempts: 3, soloCompletions: 1, multiplayerLineups: 2 },
    updatedAtMs: 1,
    popularityScore: 1,
    likeCount: 1,
    likedByViewer: false,
    completedByViewer: false,
    isNew: true,
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
  assert.match(html, /<a class="sqc-community-row-creator" aria-label="Browse Side Quests by Nora Skewer" href="\/community-side-quests\?creator=nora#creator-nora">By Nora Skewer<\/a>/);
  assert.match(html, /class="sqc-community-row-summary">Finish a game without castling\.<\/span>/);
  assert.match(html, /class="sqc-community-row-freshness">New this month<\/span>/);
  assert.match(html, /class="sqc-community-row-stat"><strong>3<\/strong><small>tries<\/small><\/span>/);
  assert.match(html, /class="sqc-community-row-stat"><strong>1<\/strong><small>completed<\/small><\/span>/);
  assert.match(html, /class="sqc-community-row-stat"><strong>2<\/strong><small>multiplayer uses<\/small><\/span>/);
  assert.match(html, /class="sqc-community-row-stats" role="group" aria-label="Quest activity">/);
  assert.equal(html.match(/aria-label="Community Side Quest filters"/g)?.length, 1, "desktop and mobile share one filter subtree");
  assert.equal(html.match(/aria-label="Open Castle\? Never Heard Of It"/g)?.length, 1, "desktop and mobile share one catalog subtree");
});

test("Community discovery exposes URL-backed controls and carries the workspace into quest details", () => {
  const html = renderToStaticMarkup(
    createElement(MobileCommunitySideQuestsScreen, {
      signedIn: false,
      initialState: {
        query: "castle",
        filter: "new",
        sort: "liked",
        limit: 20,
        creator: null,
      },
      rows: [{
        id: "community-one",
        title: "Castle? Never Heard Of It",
        meta: "By Nora Skewer · Finish a game without castling.",
        href: "/challenges/community/community-one",
        sourceBadge: "Community",
        status: "Ready",
        creatorKey: "nora",
        creatorName: "Nora Skewer",
        creatorBrowsePath: "/community-side-quests?creator=nora",
        summary: "Finish a game without castling.",
        stats: { soloAttempts: 3, soloCompletions: 1, multiplayerLineups: 2 },
        updatedAtMs: 100,
        popularityScore: 4,
        likeCount: 2,
        likedByViewer: false,
        completedByViewer: false,
        isNew: true,
      }],
    }),
  );

  assert.match(html, /aria-label="Search Community Side Quests"[^>]*value="castle"/);
  assert.match(html, /<button[^>]*class="active"[^>]*aria-pressed="true"[^>]*>New<\/button>/);
  assert.match(html, /<option value="liked" selected="">Liked<\/option>/);
  assert.match(html, /href="\/challenges\/community\/community-one\?returnTo=%2Fcommunity-side-quests%3Fq%3Dcastle%26filter%3Dnew%26sort%3Dliked%26limit%3D20"/);
});

test("Community discovery keeps its shared search and filters available while desktop users browse the long catalog", () => {
  const css = readFileSync("src/app/mobile-web.css", "utf8");
  const mobilePanel = readCssBlock(css, css.indexOf(".sqc-community-browse-panel"));
  const desktopMedia = readCssBlock(css, css.indexOf("@media (min-width: 1180px)"));

  assert.doesNotMatch(mobilePanel, /position:\s*sticky;/, "mobile retains the established in-flow filter panel");
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-community-discovery\s+\.sqc-community-browse-panel\s*\{[^}]*position:\s*sticky;[^}]*top:\s*94px;[^}]*z-index:\s*12;/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-community-discovery\s+\.sqc-community-browse-panel\s*\{[^}]*backdrop-filter:\s*blur\(18px\);/);
});

test("Community discovery balances a lone result with a real desktop catalog summary", () => {
  const rows = [{
    id: "community-one",
    title: "Castle? Never Heard Of It",
    meta: "By Nora Skewer · Finish a game without castling.",
    href: "/challenges/community/community-one",
    sourceBadge: "Community",
    status: "Ready",
    creatorKey: "nora",
    creatorName: "Nora Skewer",
    creatorBrowsePath: "/community-side-quests?creator=nora#creator-nora",
    summary: "Finish a game without castling.",
    stats: { soloAttempts: 3, soloCompletions: 1, multiplayerLineups: 2 },
    updatedAtMs: 1,
    popularityScore: 1,
    likeCount: 1,
    likedByViewer: false,
    completedByViewer: false,
    isNew: true,
  }];
  const singleHtml = renderToStaticMarkup(createElement(MobileCommunitySideQuestsScreen, { rows, signedIn: false }));
  const twoResultHtml = renderToStaticMarkup(createElement(MobileCommunitySideQuestsScreen, { rows: [...rows, { ...rows[0], id: "community-two", title: "Second quest" }], signedIn: false }));
  const css = readFileSync("src/app/mobile-web.css", "utf8");
  const mobileCss = css.slice(0, css.indexOf("@media (min-width: 1180px)"));
  const desktopMedia = readCssBlock(css, css.indexOf("@media (min-width: 1180px)"));

  assert.match(singleHtml, /class="sqc-community-results-layout single-result"/);
  assert.match(singleHtml, /<aside class="sqc-community-catalog-summary" aria-label="Public catalog at a glance">/);
  assert.match(singleHtml, /<strong>1<\/strong><span>public quest<\/span>/);
  assert.match(singleHtml, /<strong>1<\/strong><span>creator<\/span>/);
  assert.match(singleHtml, /<strong>3<\/strong><span>attempts<\/span>/);
  assert.match(singleHtml, /<strong>1<\/strong><span>completion<\/span>/);
  assert.match(singleHtml, /<strong>2<\/strong><span>multiplayer uses<\/span>/);
  assert.doesNotMatch(twoResultHtml, /aria-label="Public catalog at a glance"/);
  assert.match(mobileCss, /\.sqc-community-catalog-summary\s*\{[^}]*display:\s*none;/, "mobile retains the established single-card flow");
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-community-discovery\s+\.sqc-community-results-layout\.single-result\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*760px\)\s+minmax\(240px,\s*1fr\);/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-community-discovery\s+\.sqc-community-catalog-summary\s*\{[^}]*display:\s*grid;/);
});

test("Community creator shelves become contextual desktop rail destinations", () => {
  const rows = [{
    id: "community-one",
    title: "Castle? Never Heard Of It",
    meta: "By Nora Skewer · Finish a game without castling.",
    href: "/challenges/community/community-one",
    sourceBadge: "Community",
    status: "Ready",
    creatorKey: "nora",
    creatorName: "Nora Skewer",
    creatorBrowsePath: "/community-side-quests?creator=nora#creator-nora",
    summary: "Finish a game without castling.",
    stats: { soloAttempts: 3, soloCompletions: 1, multiplayerLineups: 2 },
    updatedAtMs: 1,
    popularityScore: 1,
    likeCount: 1,
    likedByViewer: false,
    completedByViewer: false,
    isNew: false,
  }];
  const html = renderToStaticMarkup(
    createElement(MobileCommunitySideQuestsScreen, { rows, signedIn: false, initialCreator: "nora" }),
  );

  assert.match(html, /<aside class="sqc-community-creator-shelf" aria-label="Creator shelf">/);
  assert.match(html, /<span>Browsing creator<\/span><strong>Nora Skewer<\/strong><small>1 public Side Quest<\/small>/);
  assert.match(html, /<a[^>]*href="\/community-side-quests">All creators<\/a>/);
  assert.equal(html.match(/>All creators<\/a>/g)?.length, 1, "one responsive creator-shelf action is rendered");
});

test("Community discovery gives desktop users a bounded creator directory without changing the catalog", () => {
  const creators = [
    ["nora", "Nora Skewer", 3],
    ["oskar", "Oskar File", 2],
    ["maja", "Maja Tactic", 1],
    ["theo", "Theo Endgame", 1],
    ["eli", "Eli Blitzy", 1],
    ["felix", "Felix Knight", 1],
    ["sofia", "Sofia Tempo", 1],
  ] as const;
  const rows = creators.flatMap(([creatorKey, creatorName, count]) => Array.from({ length: count }, (_, index) => ({
    id: `${creatorKey}-${index}`,
    title: `${creatorName} quest ${index + 1}`,
    meta: `By ${creatorName} · A public rule.`,
    href: `/challenges/community/${creatorKey}-${index}`,
    sourceBadge: "Community",
    status: "Ready",
    creatorKey,
    creatorName,
    creatorBrowsePath: `/community-side-quests?creator=${creatorKey}#creator-${creatorKey}`,
    summary: "A public rule.",
    stats: { soloAttempts: 0, soloCompletions: 0, multiplayerLineups: 0 },
    updatedAtMs: index,
    popularityScore: index,
    likeCount: 0,
    likedByViewer: false,
    completedByViewer: false,
    isNew: false,
  })));
  const html = renderToStaticMarkup(
    createElement(MobileCommunitySideQuestsScreen, { rows, signedIn: false }),
  );

  assert.match(html, /<aside class="sqc-community-creator-directory" aria-label="Creator shortcuts">/);
  assert.match(html, />Browse creators<\/h2>/);
  assert.match(html, /href="\/community-side-quests\?creator=nora#creator-nora"[^>]*><span>Nora Skewer<\/span><small>3 quests<\/small>/);
  const directoryHtml = html.match(/<aside class="sqc-community-creator-directory"[\s\S]*?<\/aside>/)?.[0] ?? "";
  assert.equal(directoryHtml.match(/class="sqc-community-creator-directory-link"/g)?.length, 6, "the desktop rail stays bounded");
  assert.doesNotMatch(directoryHtml, /creator=theo/, "the seventh creator remains discoverable in cards rather than overfilling the rail");
  assert.match(html, /aria-label="Browse Side Quests by Theo Endgame"/, "creators outside the shortcuts remain available in catalog cards");
  assert.equal(html.match(/aria-label="Open /g)?.length, rows.length, "the directory must not duplicate quest actions");

  const focusedHtml = renderToStaticMarkup(
    createElement(MobileCommunitySideQuestsScreen, { rows, signedIn: false, initialCreator: "nora" }),
  );
  assert.match(focusedHtml, /aria-label="Creator shelf"/);
  assert.doesNotMatch(focusedHtml, /aria-label="Creator shortcuts"/, "the focused creator shelf replaces the directory");

  const unknownCreatorHtml = renderToStaticMarkup(
    createElement(MobileCommunitySideQuestsScreen, { rows, signedIn: false, initialCreator: "retired-creator" }),
  );
  assert.doesNotMatch(unknownCreatorHtml, /aria-label="Creator shortcuts"/, "an unknown creator query must not silently restore generic shortcuts");
});

test("Community creator shortcuts resolve equal rankings with a stable creator-key order", () => {
  const keys = ["zulu", "yankee", "xray", "whiskey", "victor", "bravo", "alpha"];
  const rows = keys.map((creatorKey) => ({
    id: `${creatorKey}-quest`,
    title: "Shared creator name quest",
    meta: "By Shared Name · A public rule.",
    href: `/challenges/community/${creatorKey}-quest`,
    sourceBadge: "Community",
    status: "Ready",
    creatorKey,
    creatorName: "Shared Name",
    creatorBrowsePath: `/community-side-quests?creator=${creatorKey}`,
    summary: "A public rule.",
    stats: { soloAttempts: 0, soloCompletions: 0, multiplayerLineups: 0 },
    updatedAtMs: 0,
    popularityScore: 0,
    likeCount: 0,
    likedByViewer: false,
    completedByViewer: false,
    isNew: false,
  }));
  const html = renderToStaticMarkup(
    createElement(MobileCommunitySideQuestsScreen, { rows, signedIn: false }),
  );
  const directoryHtml = html.match(/<aside class="sqc-community-creator-directory"[\s\S]*?<\/aside>/)?.[0] ?? "";
  const creatorKeys = Array.from(directoryHtml.matchAll(/creator=([a-z]+)/g), (match) => match[1]);

  assert.deepEqual(creatorKeys, ["alpha", "bravo", "victor", "whiskey", "xray", "yankee"]);
});

test("Community discovery uses a wide desktop grid only at the established boundary", () => {
  const css = readFileSync("src/app/mobile-web.css", "utf8");
  const standardDesktopMedia = readCssBlock(css, css.indexOf("@media (min-width: 1380px)"));
  const wideDesktopMedia = readCssBlock(css, css.indexOf("@media (min-width: 1680px)"));

  assert.match(css, /@media\s*\(min-width:\s*1180px\)[\s\S]*?\.sqc-mobile-web\.desktop-community-discovery\s+\.sqc-screen\s*\{[^}]*width:\s*min\(1320px,\s*calc\(100%\s*-\s*64px\)\)/);
  assert.match(css, /\.sqc-mobile-web\.desktop-community-discovery\s+\.sqc-community-solo-screen\s*\{[^}]*grid-template-columns:\s*220px\s+minmax\(0,\s*1fr\);/);
  assert.match(css, /\.sqc-mobile-web\.desktop-community-discovery\s+\.sqc-community-catalog-section\s*\{[^}]*grid-column:\s*2;/);
  assert.match(css, /\.sqc-mobile-web\.desktop-community-discovery\s+\.sqc-catalog\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\);/);
  assert.match(css, /\.sqc-mobile-web\.desktop-community-discovery\s+\.sqc-community-browse-panel\s*\{[^}]*grid-template-columns:\s*minmax\(260px,\s*1fr\)\s+auto;/);
  assert.match(css, /\.sqc-mobile-web\.desktop-community-discovery\s+\.sqc-community-controls\s*\{[^}]*display:\s*flex;/);
  assert.match(css, /\.sqc-community-creator-directory\s*\{[^}]*display:\s*none;/);
  assert.match(css, /@media\s*\(min-width:\s*1180px\)[\s\S]*?\.sqc-mobile-web\.desktop-community-discovery\s+\.sqc-community-creator-directory\s*\{[^}]*display:\s*grid;[^}]*position:\s*sticky;[^}]*grid-column:\s*1;[^}]*grid-row:\s*3;/);
  assert.match(css, /\.sqc-mobile-web\.desktop-community-discovery\s+\.sqc-community-creator-directory-link\s*\{[^}]*min-height:\s*44px;/);
  assert.match(css, /\.sqc-mobile-web\.desktop-community-discovery\s+\.sqc-community-creator-directory-link:focus-visible\s*\{[^}]*outline:\s*3px\s+solid\s+rgba\(96,\s*240,\s*175,\s*\.88\);[^}]*outline-offset:\s*3px;/);
  assert.match(standardDesktopMedia, /\.sqc-mobile-web\.desktop-community-discovery\s+\.sqc-catalog\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\);/, "a standard 1440px desktop should show three comparable quests per row");
  assert.match(standardDesktopMedia, /\.sqc-mobile-web\.desktop-community-discovery\s+\.sqc-app-row\s*\{[^}]*grid-template-columns:\s*58px\s+minmax\(0,\s*1fr\);[^}]*padding:\s*18px\s+14px;/, "standard desktop cards should stay readable at the denser width");
  assert.match(wideDesktopMedia, /\.sqc-mobile-web\.desktop-community-discovery\s+\.sqc-screen\s*\{[^}]*width:\s*min\(1600px,\s*calc\(100%\s*-\s*80px\)\)/);
  assert.match(wideDesktopMedia, /\.sqc-mobile-web\.desktop-community-discovery\s+\.sqc-catalog\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\);/);
});

test("Community discovery uses structured activity cards only at the desktop boundary", () => {
  const css = readFileSync("src/app/mobile-web.css", "utf8");
  const desktopMedia = readCssBlock(css, css.indexOf("@media (min-width: 1180px)"));

  assert.match(css, /\.sqc-community-row-details\s*\{[^}]*display:\s*none;/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-community-discovery\s+\.sqc-row-copy\s*>\s*\.sqc-community-row-mobile-meta\s*\{[^}]*display:\s*none;/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-community-discovery\s+\.sqc-community-row-details\s*\{[^}]*display:\s*grid;/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-community-discovery\s+\.sqc-community-row-context\s*\{[^}]*display:\s*flex;/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-community-discovery\s+\.sqc-community-row-stats\s*\{[^}]*display:\s*grid;[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\);/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-community-discovery\s+\.sqc-community-row-stat\s*\{[^}]*display:\s*grid;[^}]*border-top:\s*1px\s+solid/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-community-discovery\.signed-out\s+\.sqc-row-status\s*\{[^}]*border:\s*1px\s+solid[^}]*background:\s*rgba\(96,\s*240,\s*175,\s*\.1\);[^}]*color:\s*var\(--green\);/);
});

test("Community discovery gives desktop cards an explicit detail affordance without changing mobile rows", () => {
  const rows = [{
    id: "community-one",
    title: "Castle? Never Heard Of It",
    meta: "By Nora Skewer · Finish a game without castling.",
    href: "/challenges/community/community-one",
    sourceBadge: "Community",
    status: "Ready",
    creatorKey: "nora",
    creatorName: "Nora Skewer",
    creatorBrowsePath: "/community-side-quests?creator=nora#creator-nora",
    summary: "Finish a game without castling.",
    stats: { soloAttempts: 3, soloCompletions: 1, multiplayerLineups: 2 },
    updatedAtMs: 1,
    popularityScore: 1,
    likeCount: 1,
    likedByViewer: false,
    completedByViewer: false,
    isNew: false,
  }];
  const html = renderToStaticMarkup(createElement(MobileCommunitySideQuestsScreen, { rows, signedIn: false }));
  const css = readFileSync("src/app/mobile-web.css", "utf8");
  const desktopMedia = readCssBlock(css, css.indexOf("@media (min-width: 1180px)"));

  assert.equal(html.match(/aria-label="Open Castle\? Never Heard Of It"/g)?.length, 1, "the existing card link remains the only detail destination");
  assert.match(html, /class="sqc-community-row-open"[^>]*>View Side Quest details <span aria-hidden="true">→<\/span><\/span>/);
  assert.match(css, /\.sqc-community-row-open\s*\{[^}]*display:\s*none;/, "mobile rows do not gain desktop CTA copy");
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-community-discovery\s+\.sqc-community-row-open\s*\{[^}]*display:\s*inline-flex;[^}]*color:\s*var\(--green\);/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.sqc-community-row-open\s+span\s*\{[^}]*transition:\s*none\s*!important;[^}]*transform:\s*none\s*!important;/);
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
    quests: [],
    playerCount: 0,
    timeLeftLabel: "14d left",
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
  assert.match(html, /<nav class="sqc-desktop-multiplayer-launchpad" aria-label="Multiplayer quick actions">/);
  assert.match(html, /href="\/create-multiplayer-side-quest"[^>]*>Create a Multiplayer Side Quest<\/a>/);
  assert.match(html, /href="\/multiplayer-side-quests\?tab=community#join-private-multiplayer"[^>]*>Join with invite code<\/a>/);
  assert.equal(html.match(/aria-label="Multiplayer Side Quest catalog"/g)?.length, 1, "desktop and mobile share one catalog navigation subtree");
  assert.equal(html.match(/aria-label="Open Official 14-Day Starter Shield"/g)?.length, 1, "desktop and mobile share one quest action subtree");
});

test("Multiplayer quick actions stay desktop-only and point to the existing creation and invite flows", () => {
  const css = readFileSync("src/app/mobile-web.css", "utf8");
  const desktopMedia = readCssBlock(css, css.indexOf("@media (min-width: 1180px)"));
  const reducedMotion = readCssBlock(css, css.lastIndexOf("@media (prefers-reduced-motion: reduce)"));

  assert.match(css, /\.sqc-desktop-multiplayer-launchpad\s*\{[^}]*display:\s*none;/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-multiplayer-discovery\s+\.sqc-desktop-multiplayer-launchpad\s*\{[^}]*display:\s*flex;/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-multiplayer-discovery\s+\.sqc-desktop-multiplayer-launchpad\s+a:focus-visible\s*\{[^}]*outline:\s*3px\s+solid/);
  assert.match(desktopMedia, /#join-private-multiplayer\s*\{[^}]*scroll-margin-top:\s*110px;/);
  assert.match(reducedMotion, /\.sqc-desktop-multiplayer-launchpad\s+a\s*\{[^}]*transition:\s*none\s*!important;[^}]*transform:\s*none\s*!important;/);
});

test("Multiplayer discovery turns official rows into decision-ready desktop cards without duplicating links", () => {
  const row = {
    id: "official-one",
    title: "Official 14-Day Starter Shield",
    meta: "Official · 7 players · 12d left",
    href: "/groupquests/official-one",
    sourceBadge: "Official" as const,
    status: "Not joined" as const,
    likeSummary: { count: 2, likedByViewer: false },
    publiclyListed: true,
    inviteCopy: "Join the table.",
    quests: ["Back Rank Goblin", "Knight Errand"],
    rules: [],
    playerCount: 7,
    playersLabel: "7 players",
    timeLeftLabel: "12d left",
    leaderboardRows: [],
    eventStatus: "Live" as const,
    lifecycle: "open" as const,
    createdAt: "2026-08-01T08:00:00.000Z",
    startAt: "2026-08-01T08:00:00.000Z",
    endAt: "2026-08-15T08:00:00.000Z",
  };
  const html = renderToStaticMarkup(createElement(MobileMultiplayerSideQuestsScreen, {
    selectedTab: "official",
    signedIn: false,
    officialRows: [row],
    communityRows: [],
  }));

  assert.equal(html.match(/aria-label="Open Official 14-Day Starter Shield"/g)?.length, 1);
  assert.match(html, /class="sqc-multiplayer-row-facts" aria-label="Tournament facts"/);
  assert.match(html, /<span>Players<\/span><strong>7<\/strong>/);
  assert.match(html, /<span>Side Quests<\/span><strong>2<\/strong>/);
  assert.match(html, /<span>Closes<\/span><strong>12d left<\/strong>/);
  assert.match(html, /class="sqc-multiplayer-row-open">View tournament desk/);
});

test("Multiplayer discovery keeps mobile below 1180px and uses decision-ready cards at the desktop boundary", () => {
  const css = readFileSync("src/app/mobile-web.css", "utf8");
  const route = readFileSync("src/app/multiplayer/page.tsx", "utf8");
  const aliasRoute = readFileSync("src/app/multiplayer-side-quests/page.tsx", "utf8");
  const desktopMedia = readCssBlock(css, css.indexOf("@media (min-width: 1180px)"));

  assert.match(route, /desktopPresentation="multiplayer-discovery"/);
  assert.match(aliasRoute, /desktopPresentation="multiplayer-discovery"/, "the tab and like-return route must preserve the desktop workspace");
  assert.match(css, /\.sqc-desktop-multiplayer-intro\s*\{[^}]*display:\s*none;/);
  assert.match(css, /\.sqc-multiplayer-row-details\s*\{[^}]*display:\s*none;/, "mobile keeps its compact row");
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-multiplayer-discovery\s+\.sqc-screen\s*\{[^}]*width:\s*min\(1320px,\s*calc\(100%\s*-\s*64px\)\)/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-multiplayer-discovery\s+\.sqc-stack\s*\{[^}]*grid-template-columns:\s*200px\s+minmax\(0,\s*1fr\);/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-multiplayer-discovery\s+\.sqc-panel\.list\s+\.sqc-catalog\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\);/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-multiplayer-discovery\s+\.sqc-multiplayer-row-details\s*\{[^}]*display:\s*grid;[^}]*position:\s*absolute;[^}]*left:\s*18px;[^}]*right:\s*18px;[^}]*bottom:\s*18px;/);
  assert.doesNotMatch(desktopMedia, /\.sqc-mobile-web\.desktop-multiplayer-discovery\s+\.sqc-multiplayer-row-details\s*\{[^}]*margin:\s*[^;]*-/, "the tournament facts must not slide beneath the seal");
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-multiplayer-discovery\s+\.sqc-multiplayer-row-facts\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\);/);
  assert.equal(css.replace(desktopMedia, "").includes(".sqc-mobile-web.desktop-multiplayer-discovery"), false, "desktop Multiplayer rules must not leak below 1180px");
});

test("Trophy Cabinet becomes one desktop collection workspace without duplicating reward links", () => {
  const html = renderToStaticMarkup(
    createElement(
      MobileAppWebShell,
      { activeTab: "coatOfArms", signedIn: false, desktopPresentation: "trophy-cabinet", immersivePresentation: true },
      createElement(MobileTrophyCabinetScreen, {
        signedIn: false,
        trophyRows: [],
        completedSoloCount: 0,
        proofReceiptCount: 0,
        officialSoloCount: 1,
        officialChallenges: [CHALLENGES[0]],
      }),
    ),
  );

  assert.match(html, /class="sqc-mobile-web desktop-trophy-cabinet immersive signed-out"/);
  assert.match(html, /class="sqc-desktop-route-only"/);
  assert.match(html, /<a[^>]*aria-current="page"[^>]*href="\/trophy-cabinet">Trophy Cabinet<\/a>/);
  assert.match(html, /class="sqc-desktop-trophy-intro"/);
  assert.match(html, />Every ridiculous victory, filed in one grand collection\.<\/h1>/);
  assert.match(html, /aria-label="Sign in to sync Trophy Cabinet"/);
  assert.match(html, />Sign in to sync your cabinet\.<\/h2>/);
  assert.match(html, /href="\/sign-in\?redirect_url=%2Ftrophy-cabinet"[^>]*>Sign in to view my rewards<\/a>/);
  assert.match(html, />Browse all 1 official Side Quest coat\.<\/h2>/);
  assert.doesNotMatch(html, /No unlocked trophies yet|No Solo coats yet|0 Official Multiplayer|0 Community Multiplayer|0 of 1 official|Locked preview|sqc-coat-tile-image locked/);
  assert.match(html, /class="sqc-coat-tile-details"/);
  assert.match(html, /class="sqc-coat-tile-context"[^>]*><span>Easy<\/span><span>Style Kill<\/span>/);
  assert.match(html, /class="sqc-coat-tile-objective">Deliver a back-rank mate with maximum goblin energy\.<\/span>/);
  assert.match(html, />Official coat preview<\/small>/);
  assert.equal(html.match(/href="\/challenges\//g)?.length, 1, "desktop and mobile share one official coat grid");
  assert.equal(html.match(/href="\/side-quests"/g)?.length, 1, "signed-out cabinet keeps the persistent Solo discovery shortcut without a false empty-reward action");
});

test("Trophy Cabinet gives desktop collectors an actionable difficulty directory without duplicating coat destinations", () => {
  const html = renderToStaticMarkup(
    createElement(MobileTrophyCabinetScreen, {
      signedIn: false,
      trophyRows: [],
      completedSoloCount: 0,
      proofReceiptCount: 0,
      officialSoloCount: CHALLENGES.length,
      officialChallenges: CHALLENGES,
    }),
  );
  const css = readFileSync("src/app/mobile-web.css", "utf8");
  const desktopMedia = readCssBlock(css, css.indexOf("@media (min-width: 1180px)"));

  assert.match(html, /<div class="sqc-trophy-collection-workspace">/);
  assert.match(html, /<aside class="sqc-trophy-difficulty-index" aria-label="Filter coats by difficulty">/);
  assert.match(html, /<strong>Browse by difficulty<\/strong>/);
  assert.match(html, /<button[^>]*aria-pressed="true"[^>]*><span>All coats<\/span><small>13<\/small><\/button>/);
  for (const difficulty of ["Easy", "Medium", "Hard", "Brutal", "Absurd"]) {
    const count = CHALLENGES.filter((challenge) => challenge.difficulty === difficulty).length;
    assert.match(html, new RegExp(`<button[^>]*aria-pressed="false"[^>]*><span>${difficulty}<\\/span><small>${count}<\\/small><\\/button>`));
  }
  assert.equal(html.match(/href="\/challenges\//g)?.length, CHALLENGES.length, "the difficulty directory must not duplicate coat destinations");
  assert.match(css, /\.sqc-trophy-difficulty-index\s*\{[^}]*display:\s*none;/, "mobile keeps the current coat grid without a desktop rail");
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-trophy-cabinet\s+\.sqc-trophy-collection-workspace\s*\{[^}]*grid-template-columns:\s*180px\s+minmax\(0,\s*1fr\);/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-trophy-cabinet\s+\.sqc-trophy-difficulty-index\s*\{[^}]*display:\s*grid;[^}]*position:\s*sticky;[^}]*top:\s*104px;/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-trophy-cabinet\s+\.sqc-coat-grid\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\);/);
});

test("Trophy Cabinet keeps the mobile stack below 1180px and uses the desktop canvas at the boundary", () => {
  const css = readFileSync("src/app/mobile-web.css", "utf8");
  const route = readFileSync("src/app/trophy-cabinet/page.tsx", "utf8");
  const desktopMedia = readCssBlock(css, css.indexOf("@media (min-width: 1180px)"));
  const reducedMotion = readCssBlock(css, css.lastIndexOf("@media (prefers-reduced-motion: reduce)"));

  assert.match(route, /desktopPresentation="trophy-cabinet"/);
  assert.match(css, /\.sqc-desktop-trophy-intro\s*\{[^}]*display:\s*none;/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-trophy-cabinet\s+\.sqc-screen\s*\{[^}]*width:\s*min\(1320px,\s*calc\(100%\s*-\s*64px\)\)/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-trophy-cabinet\s+\.sqc-trophy-screen\s*\{[^}]*grid-template-columns:\s*repeat\(12,\s*minmax\(0,\s*1fr\)\);/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-trophy-cabinet\s+\.sqc-coat-grid\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\);/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-trophy-cabinet\s+\.sqc-coat-tile\s*\{[^}]*min-height:\s*196px;/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-trophy-cabinet\s+\.sqc-coat-tile\s*\{[^}]*grid-template-columns:\s*112px\s+minmax\(0,\s*1fr\);/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-trophy-cabinet\s+\.sqc-coat-tile-objective\s*\{[^}]*display:\s*block;/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-trophy-cabinet\s+\.sqc-coat-tile:last-child:nth-child\(3n\s*\+\s*1\)\s*\{[^}]*grid-column:\s*2;/);
  assert.match(css, /\.sqc-coat-tile-objective\s*\{[^}]*display:\s*none;/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-trophy-cabinet\.signed-out\s+\.sqc-trophy-sign-in\s*\{[^}]*grid-column:\s*1\s*\/\s*span\s*4;/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-trophy-cabinet\.signed-out\s+\.sqc-trophy-collection-summary\s*\{[^}]*grid-column:\s*5\s*\/\s*-1;/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-trophy-cabinet\s+\.sqc-trophy-sign-in\s+\.sqc-primary-action\s*\{[^}]*width:\s*fit-content;/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.sqc-mobile-web\.desktop-trophy-cabinet\s+\.sqc-coat-tile\s*\{[^}]*transition:\s*none\s*!important;[^}]*transform:\s*none\s*!important;/);
  assert.equal(css.replace(desktopMedia, "").replace(reducedMotion, "").includes(".sqc-mobile-web.desktop-trophy-cabinet"), false, "desktop Trophy Cabinet rules must not leak below 1180px");
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

test("populated signed-in Custom libraries use the wide desktop canvas without changing signed-out layouts", () => {
  const css = readFileSync("src/app/mobile-web.css", "utf8");
  const standardDesktopMedia = readCssBlock(css, css.indexOf("@media (min-width: 1380px)"));
  const wideDesktopMedia = readCssBlock(css, css.indexOf("@media (min-width: 1680px)"));
  const accountCatalog = String.raw`\.sqc-community-catalog-section\s*>\s*\.sqc-catalog:not\(\.sqc-local-custom-drafts\)`;
  const signedInLibrary = String.raw`\.sqc-mobile-web\.desktop-custom-library\.signed-in:has\(${accountCatalog}\)`;
  const unscopedLibrary = String.raw`\.sqc-mobile-web\.desktop-custom-library(?!\.signed-in:has)`;

  assert.match(standardDesktopMedia, new RegExp(`${signedInLibrary}\\s+${accountCatalog}\\s*\\{[^}]*grid-template-columns:\\s*repeat\\(3,\\s*minmax\\(0,\\s*1fr\\)\\);`));
  assert.match(standardDesktopMedia, new RegExp(`${signedInLibrary}\\s+${accountCatalog}\\s+\\.sqc-app-row\\s*\\{[^}]*min-height:\\s*150px;[^}]*grid-template-columns:\\s*58px\\s+minmax\\(0,\\s*1fr\\);[^}]*padding:\\s*18px\\s+14px;`));
  assert.match(wideDesktopMedia, new RegExp(`${signedInLibrary}\\s+\\.sqc-screen\\s*\\{[^}]*width:\\s*min\\(1600px,\\s*calc\\(100%\\s*-\\s*80px\\)\\)`));
  assert.match(wideDesktopMedia, new RegExp(`${signedInLibrary}\\s+${accountCatalog}\\s*\\{[^}]*grid-template-columns:\\s*repeat\\(3,\\s*minmax\\(0,\\s*1fr\\)\\);`));
  assert.doesNotMatch(standardDesktopMedia, new RegExp(`${unscopedLibrary}[^,{]*\\s+\\.sqc-catalog`));
  for (const descendant of ["\\.sqc-app-row", "\\.sqc-row-icon", "\\.sqc-row-glow", "\\.sqc-row-image", "\\.sqc-row-copy", "\\.sqc-row-copy\\s+small", "\\.sqc-row-title-line", "\\.sqc-row-status"]) {
    assert.doesNotMatch(
      standardDesktopMedia,
      new RegExp(`${signedInLibrary}\\s+${descendant}\\s*\\{`),
      `account density must not reach local drafts through broad descendant selector ${descendant}`,
    );
  }
  assert.doesNotMatch(standardDesktopMedia, /\.sqc-local-custom-drafts\s+\.sqc-app-row\s*\{/);
  assert.doesNotMatch(wideDesktopMedia, new RegExp(`${unscopedLibrary}[^,{]*\\s+\\.sqc-screen`));
  assert.doesNotMatch(wideDesktopMedia, new RegExp(`${signedInLibrary}\\s+${accountCatalog}\\s+\\.sqc-app-row\\s*\\{`), "wide cards retain the readable standard-desktop geometry");
});

test("empty Custom library explains the local workshop path without replacing the existing create destination", () => {
  const html = renderToStaticMarkup(createElement(LocalCustomDraftList, { drafts: [] }));

  assert.match(html, /class="sqc-local-custom-empty-copy"/);
  assert.match(html, />No custom Side Quests yet\.<\/strong>/);
  assert.match(html, />Create your own chess challenge and give it a Coat of Arms\.<\/small>/);
  assert.match(html, /<ol class="sqc-local-custom-workflow" aria-label="Custom Side Quest workflow">/);
  assert.match(html, />Shape the rule<\/strong>/);
  assert.match(html, />Choose visibility later<\/strong>/);
  assert.match(html, />Play Solo or host<\/strong>/);
  assert.match(html, /class="sqc-local-custom-start" href="\/create-custom-side-quest">Create a private Side Quest<\/a>/);
  assert.equal(html.match(/href="\/create-custom-side-quest"/g)?.length, 1);
});

test("empty browser drafts stay truthful when the signed-in account already has Custom Side Quests", () => {
  const html = renderToStaticMarkup(createElement(LocalCustomDraftList, { drafts: [], hasAccountQuests: true }));

  assert.match(html, />No local drafts yet\.<\/strong>/);
  assert.match(html, />Build a Side Quest and save it in this browser\.<\/small>/);
  assert.doesNotMatch(html, /No custom Side Quests yet/);
  assert.doesNotMatch(html, /sqc-local-custom-workflow/);
  assert.doesNotMatch(html, /href="\/create-custom-side-quest"/);
});

test("empty Custom library becomes a side-by-side desktop onboarding workspace only at 1180px", () => {
  const css = readFileSync("src/app/mobile-web.css", "utf8");
  const desktopMedia = readCssBlock(css, css.indexOf("@media (min-width: 1180px)"));

  assert.match(css, /\.sqc-local-custom-workflow,\s*\.sqc-local-custom-start,\s*\.sqc-local-custom-empty-copy\s*>\s*span\s*\{[^}]*display:\s*none;/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-custom-library\s+\.sqc-local-custom-empty\s*\{[^}]*grid-template-columns:\s*260px\s+minmax\(0,\s*1fr\);/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-custom-library\s+\.sqc-local-custom-workflow\s*\{[^}]*display:\s*grid;[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\);[^}]*grid-column:\s*2;[^}]*grid-row:\s*1\s*\/\s*span\s*2;/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-custom-library\s+\.sqc-local-custom-start\s*\{[^}]*display:\s*inline-flex;[^}]*grid-column:\s*1;/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-custom-library\s+\.sqc-local-custom-start:hover,[^}]*\.sqc-mobile-web\.desktop-custom-library\s+\.sqc-local-custom-start:focus-visible\s*\{[^}]*transform:\s*translateY\(-2px\);/);
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

  assert.match(css, /\.sqc-quest-command-rail\s*\{[^}]*display:\s*contents;/);
  assert.match(css, /@media\s*\(min-width:\s*1180px\)[\s\S]*?\.sqc-mobile-web\.desktop-official-detail\s+\.sqc-screen\s*\{[^}]*width:\s*min\(1240px,\s*calc\(100%\s*-\s*64px\)\)/);
  assert.match(css, /\.sqc-mobile-web\.desktop-official-detail\s+\.sqc-official-solo-detail-screen\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1\.35fr\)\s+minmax\(340px,\s*\.65fr\);/);
  assert.match(css, /\.sqc-mobile-web\.desktop-official-detail\s+\.sqc-official-quest-card\s*\{[^}]*grid-column:\s*1\s*\/\s*-1;/);
  assert.match(css, /\.sqc-mobile-web\.desktop-official-detail\s+\.sqc-official-solo-detail-screen\s*>\s*\.sqc-quest-command-rail\s*\{[^}]*grid-column:\s*2;[^}]*grid-row:\s*3\s*\/\s*span\s*2;[^}]*position:\s*sticky;[^}]*top:\s*108px;/);
  assert.match(css, /\.sqc-mobile-web\.desktop-official-detail\s+\.sqc-quest-command-rail\s*>\s*\.sqc-community-share-actions\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\);/);
  assert.match(css, /\.sqc-mobile-web\.desktop-official-detail\s+\.sqc-community-share-actions\s*>\s*small\s*\{[^}]*grid-column:\s*1\s*\/\s*-1;/);
  assert.doesNotMatch(css, /\.sqc-mobile-web\.desktop-official-detail\s+\.sqc-official-solo-detail-screen\s*>\s*\.sqc-proof-action-card\s*\{/);
});

test("wide official Solo detail uses the full desktop canvas for a denser quest briefing", () => {
  const css = readFileSync("src/app/mobile-web.css", "utf8");
  const wideDesktopMedia = readCssBlock(css, css.indexOf("@media (min-width: 1680px)"));

  assert.match(wideDesktopMedia, /\.sqc-mobile-web\.desktop-official-detail\s+\.sqc-screen\s*\{[^}]*width:\s*min\(1600px,\s*calc\(100%\s*-\s*80px\)\)/);
  assert.match(wideDesktopMedia, /\.sqc-mobile-web\.desktop-official-detail\s+\.sqc-official-solo-detail-screen\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s+440px;/);
  assert.match(wideDesktopMedia, /\.sqc-mobile-web\.desktop-official-detail\.signed-out\s+\.sqc-quest-instruction-card\s+\.sqc-condition-list\s*\{[^}]*grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\);/);
  assert.match(wideDesktopMedia, /\.sqc-mobile-web\.desktop-official-detail\.signed-out\s+\.sqc-quest-instruction-card\s+\.sqc-condition-compact-row\s*\{[^}]*min-height:\s*118px;/);
  assert.doesNotMatch(wideDesktopMedia, /\.sqc-mobile-web\.desktop-official-detail\s+\.sqc-quest-instruction-card\s+\.sqc-condition-list/);
});

test("active Solo detail turns the centered phone hero into a left-to-right desktop proof workspace", () => {
  const css = readFileSync("src/app/mobile-web.css", "utf8");
  const desktopMedia = readCssBlock(css, css.indexOf("@media (min-width: 1180px)"));

  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-official-detail\s+\.sqc-active-detail-hero\s*\{[^}]*grid-template-columns:\s*250px\s+minmax\(0,\s*1fr\);[^}]*grid-template-rows:\s*auto\s+auto\s+auto;[^}]*justify-items:\s*start;[^}]*text-align:\s*left;/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-official-detail\s+\.sqc-active-detail-hero\s*>\s*\.sqc-detail-coat-frame\s*\{[^}]*grid-column:\s*1;[^}]*grid-row:\s*1\s*\/\s*-1;/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-official-detail\s+\.sqc-active-detail-hero\s*>\s*:not\(\.sqc-detail-coat-frame\):not\(\.sqc-coat-lightbox\)\s*\{[^}]*grid-column:\s*2;/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-official-detail\s+\.sqc-active-detail-hero\s+p\s*\{[^}]*text-align:\s*left;/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-official-detail\s+\.sqc-active-command-panel\s*\{[^}]*grid-column:\s*2;[^}]*grid-row:\s*3\s*\/\s*span\s*2;[^}]*position:\s*sticky;/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-official-detail\s+\.sqc-active-proof-summary\s*\{[^}]*grid-column:\s*1;[^}]*grid-row:\s*3;[^}]*grid-template-columns:\s*minmax\(210px,\s*\.72fr\)\s+minmax\(0,\s*1fr\);[^}]*width:\s*auto;[^}]*min-width:\s*0;/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-official-detail\s+\.sqc-active-conditions-panel\s*\{[^}]*grid-column:\s*1;[^}]*grid-row:\s*4;/);
  assert.equal(css.replace(desktopMedia, "").includes("grid-template-columns: 250px minmax(0, 1fr)"), false, "desktop active-hero composition must not leak below 1180px");
});

test("official Solo detail groups its share and start controls in one contextual command rail", async () => {
  const source = readFileSync("src/app/challenges/[id]/page.tsx", "utf8");
  const rail = source.match(/<aside className="sqc-quest-command-rail"[^>]*>([\s\S]*?)<\/aside>/)?.[1] ?? "";

  assert.match(rail, /<OfficialSoloShareControls id=\{challenge\.id\} title=\{challenge\.title\} \/>/);
  assert.match(rail, /<section className="sqc-native-card sqc-proof-action-card sqc-official-available-action-card">/);
  assert.match(rail, /\{!isActiveChallenge && completed && user \? \([\s\S]*?<CompletedOfficialSoloControls challenge=\{challenge\} proofPath=\{completedProofPath\} \/>[\s\S]*?\) : null\}/);
  assert.ok(rail.indexOf("OfficialSoloShareControls") < rail.indexOf("sqc-proof-action-card"));
  assert.match(source, /\{isActiveChallenge && completed && user \? \([\s\S]*?<CompletedOfficialSoloControls challenge=\{challenge\} proofPath=\{completedProofPath\} \/>[\s\S]*?\) : null\}/);
  assert.equal(source.match(/<CompletedOfficialSoloControls/g)?.length, 2);
});

test("official Solo detail gives desktop visitors a concise quest briefing without changing the mobile card", () => {
  const css = readFileSync("src/app/mobile-web.css", "utf8");
  const route = readFileSync("src/app/challenges/[id]/page.tsx", "utf8");
  const briefing = readFileSync("src/components/desktop-official-quest-briefing.tsx", "utf8");
  const desktopMedia = readCssBlock(css, css.indexOf("@media (min-width: 1180px)"));

  assert.match(route, /<DesktopOfficialQuestBriefing[\s\S]*active=\{isActiveChallenge\}[\s\S]*completed=\{completed\}[\s\S]*difficulty=\{challenge\.difficulty\}[\s\S]*conditionCount=\{conditionLines\.length\}/);
  assert.match(briefing, /className="sqc-desktop-quest-briefing" aria-label="Quest briefing"/);
  assert.match(briefing, /<dt>Difficulty<\/dt>\s*<dd>\{difficulty\}<\/dd>/);
  assert.match(briefing, /<dt>Conditions<\/dt>\s*<dd>\{conditionCount\}<\/dd>/);
  assert.match(briefing, /<dt>Proof<\/dt>\s*<dd>Automatic<\/dd>/);
  assert.match(css, /\.sqc-desktop-quest-briefing\s*\{[^}]*display:\s*none;/, "mobile hides the desktop-only briefing");
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-official-detail\s+\.sqc-desktop-quest-briefing\s*\{[^}]*display:\s*grid;[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\);/);
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

test("Community Solo detail offers desktop contextual wayfinding before the quest hero", () => {
  const html = renderToStaticMarkup(
    createElement(MobileCommunitySideQuestDetailScreen, {
      quest: {
        id: "community-quest",
        title: "Castle? Never Heard Of It",
        summary: "Finish a game without castling.",
        creatorName: "Nora Skewer",
        creatorBrowsePath: "/community-side-quests?creator=nora-skewer#creator-nora-skewer",
        ruleLabel: "No castling",
        ruleDetails: ["Finish without castling."],
        stats: {
          soloAttempts: 0,
          soloSelections: 0,
          soloCompletions: 0,
          multiplayerLineups: 0,
          multiplayerAttempts: 0,
          multiplayerFulfillments: 0,
        },
      },
      signedIn: false,
      returnHref: "/community-side-quests?q=castle&filter=new&sort=liked",
    }),
  );
  const css = readFileSync("src/app/mobile-web.css", "utf8");
  const mobileCss = css.slice(0, css.indexOf("@media (min-width: 1180px)"));
  const desktopMedia = readCssBlock(css, css.indexOf("@media (min-width: 1180px)"));

  assert.match(html, /<nav class="sqc-community-detail-wayfinding" aria-label="Community Solo Side Quest navigation">/);
  assert.ok(html.indexOf("sqc-community-detail-wayfinding") < html.indexOf("sqc-community-detail-hero"), "contextual navigation precedes the hero in reading and focus order");
  assert.match(html, /href="\/community-side-quests\?q=castle&amp;filter=new&amp;sort=liked"><span aria-hidden="true">←<\/span>Back to filtered results<\/a>/);
  assert.match(html, /href="\/sign-in\?redirect_url=%2Fchallenges%2Fcommunity%2Fcommunity-quest%3FreturnTo%3D%252Fcommunity-side-quests%253Fq%253Dcastle%2526filter%253Dnew%2526sort%253Dliked"[^>]*>Sign in<\/a>/);
  assert.match(html, /href="\/community-side-quests\?creator=nora-skewer#creator-nora-skewer"><span>More by<\/span><strong>Nora Skewer<\/strong><\/a>/);
  assert.match(mobileCss, /\.sqc-community-detail-wayfinding\s*\{[^}]*display:\s*none;/, "mobile keeps its existing detail composition below the desktop media query");
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-community-detail\s+\.sqc-community-detail-wayfinding\s*\{[^}]*grid-column:\s*1\s*\/\s*-1;[^}]*display:\s*flex;/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-community-detail\s+\.sqc-community-detail-hero\s*\{[^}]*grid-row:\s*2;/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-community-detail\s+\.sqc-community-task-rail\s*\{[^}]*grid-row:\s*3\s*\/\s*span\s*4;/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.sqc-mobile-web\.desktop-community-detail\s+\.sqc-community-detail-wayfinding\s*>\s*a\s*\{[^}]*transition:\s*none\s*!important;[^}]*transform:\s*none\s*!important;/);
});

test("Community Solo detail becomes a wide reading workspace only at the desktop boundary", () => {
  const css = readFileSync("src/app/mobile-web.css", "utf8");
  const route = readFileSync("src/app/challenges/community/[id]/page.tsx", "utf8");

  assert.match(route, /desktopPresentation="community-detail"/);
  assert.match(css, /@media\s*\(min-width:\s*1180px\)[\s\S]*?\.sqc-mobile-web\.desktop-community-detail\s+\.sqc-screen\s*\{[^}]*width:\s*min\(1240px,\s*calc\(100%\s*-\s*64px\)\)/);
  assert.match(css, /\.sqc-mobile-web\.desktop-community-detail\s+\.sqc-community-detail-screen\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1\.35fr\)\s+minmax\(340px,\s*\.65fr\);/);
  assert.match(css, /\.sqc-mobile-web\.desktop-community-detail\s+\.sqc-community-detail-hero\s*\{[^}]*grid-column:\s*1\s*\/\s*-1;/);
  assert.match(css, /\.sqc-mobile-web\.desktop-community-detail\s+\.sqc-community-detail-hero\s+\.sqc-active-detail-title-row\s*\{[^}]*width:\s*100%;[^}]*max-width:\s*720px;[^}]*justify-content:\s*space-between;/);
  assert.match(css, /\.sqc-mobile-web\.desktop-community-detail\s+\.sqc-community-detail-hero\s+\.sqc-active-detail-title-row\s+h1\s*\{[^}]*min-width:\s*0;/);
  assert.match(css, /\.sqc-mobile-web\.desktop-community-detail\s+\.sqc-community-task-rail\s*\{[^}]*grid-column:\s*2;[^}]*grid-row:\s*3\s*\/\s*span\s*4;[^}]*position:\s*sticky;/);
  assert.match(css, /\.sqc-mobile-web\.desktop-community-detail\s+\.sqc-multiplayer-score-grid\s*\{[^}]*grid-column:\s*1;/);
});

test("Community Solo desktop groups briefing and conditions into one reading panel without changing the mobile stack", () => {
  const html = renderToStaticMarkup(
    createElement(MobileCommunitySideQuestDetailScreen, {
      quest: {
        id: "community-quest",
        title: "Castle? Never Heard Of It",
        summary: "Finish a game without castling.",
        creatorName: "Nora Skewer",
        creatorBrowsePath: "/community-side-quests?creator=nora-skewer#creator-nora-skewer",
        ruleLabel: "No castling",
        ruleDetails: ["Finish without castling."],
        stats: {
          soloAttempts: 0,
          soloSelections: 0,
          soloCompletions: 0,
          multiplayerLineups: 0,
          multiplayerAttempts: 0,
          multiplayerFulfillments: 0,
        },
      },
      signedIn: false,
    }),
  );
  const css = readFileSync("src/app/mobile-web.css", "utf8");
  const mobileCss = css.slice(0, css.indexOf("@media (min-width: 1180px)"));
  const desktopMedia = readCssBlock(css, css.indexOf("@media (min-width: 1180px)"));

  assert.match(html, /<div class="sqc-community-reading-panel">[\s\S]*?<span class="sqc-card-eyebrow">Challenge<\/span>[\s\S]*?<span class="sqc-card-eyebrow">Rule details<\/span>[\s\S]*?<\/div>/);
  assert.match(mobileCss, /\.sqc-community-reading-panel\s*\{[^}]*display:\s*contents;/, "mobile retains the existing separate-card flow");
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-community-detail\s+\.sqc-community-reading-panel\s*\{[^}]*grid-column:\s*1;[^}]*display:\s*grid;[^}]*border:\s*1px\s+solid/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-community-detail\s+\.sqc-community-reading-panel\s*>\s*\.sqc-native-card\s*\{[^}]*border:\s*0;[^}]*background:\s*transparent;[^}]*box-shadow:\s*none;/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-community-detail\s+\.sqc-community-reading-panel\s*>\s*\.sqc-native-card\s*\+\s*\.sqc-native-card\s*\{[^}]*border-top:\s*1px\s+solid/);
});

test("Community Solo desktop action rail separates primary, navigation, sharing, and safety priorities", () => {
  const css = readFileSync("src/app/mobile-web.css", "utf8");
  const desktopMedia = readCssBlock(css, css.indexOf("@media (min-width: 1180px)"));

  assert.match(css, /\.sqc-community-action-group\s*\{[^}]*display:\s*contents;/, "mobile keeps the established flat action stack");
  assert.match(css, /\.sqc-community-action-group-label\s*\{[^}]*display:\s*none;/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-community-detail\s+\.sqc-community-action-group\s*\{[^}]*display:\s*grid;/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-community-detail\s+\.sqc-community-next-actions\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\);/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-community-detail\s+\.sqc-community-action-group-label\s*\{[^}]*display:\s*block;[^}]*grid-column:\s*1\s*\/\s*-1;/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-community-detail\s+\.sqc-community-share-actions\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\);/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-community-detail\s+\.sqc-community-report-action\s*\{[^}]*order:\s*4;[^}]*padding-top:\s*14px;[^}]*border-top:\s*1px\s+solid/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-community-detail\s+\.sqc-community-next-actions\s*>\s*p\s*\{[^}]*grid-column:\s*1\s*\/\s*-1;/);
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
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-multiplayer-detail\s+\.sqc-multiplayer-command-rail\s*\{[^}]*grid-column:\s*2;[^}]*grid-row:\s*3\s*\/\s*span\s*3;[^}]*position:\s*sticky;/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-multiplayer-detail\s+\.sqc-multiplayer-quest-list\s*\{[^}]*grid-column:\s*1;/);
  assert.equal(css.replace(desktopMedia, "").includes(".sqc-mobile-web.desktop-multiplayer-detail"), false, "desktop Multiplayer detail rules must not leak below 1180px");
});

test("Multiplayer detail groups its next action and sharing into one desktop command rail", () => {
  const html = renderToStaticMarkup(createElement(MobileMultiplayerDetailScreen, {
    signedIn: false,
    quest: {
      id: "official-starter",
      title: "Official Starter Shield",
      meta: "Official · 0 players · 12d left",
      href: "/groupquests/official-starter",
      sourceBadge: "Official",
      publiclyListed: true,
      inviteCopy: "Complete three Side Quests together.",
      quests: ["Any Game Counts"],
      rules: [["Games allowed", "Lichess or Chess.com"]],
      status: "Not joined",
      playerCount: 0,
      playersLabel: "0 players",
      timeLeftLabel: "12d left",
      leaderboardRows: [],
      likeSummary: { count: 0, likedByViewer: false },
      lifecycle: "open",
      createdAt: "2026-08-02T00:00:00.000Z",
      startAt: "2026-08-02T00:00:00.000Z",
      endAt: "2026-08-16T00:00:00.000Z",
    },
  }));
  const css = readFileSync("src/app/mobile-web.css", "utf8");
  const desktopMedia = readCssBlock(css, css.indexOf("@media (min-width: 1180px)"));

  assert.equal(html.match(/class="sqc-multiplayer-command-rail"/g)?.length, 1);
  assert.match(html, /<nav class="sqc-multiplayer-context-nav" aria-label="Multiplayer context">[\s\S]*href="\/multiplayer"[\s\S]*Official Starter Shield[\s\S]*<\/nav>/);
  assert.match(html, /<aside class="sqc-multiplayer-command-rail" aria-label="Multiplayer Side Quest actions">[\s\S]*sqc-multiplayer-primary-action[\s\S]*sqc-multiplayer-share-card[\s\S]*<\/aside>/);
  assert.match(css, /\.sqc-multiplayer-context-nav\s*\{[^}]*display:\s*none;/, "mobile keeps the established close control without a duplicate breadcrumb");
  assert.match(css, /\.sqc-multiplayer-command-rail\s*\{[^}]*display:\s*contents;/, "mobile keeps the established card stack");
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-multiplayer-detail\s+\.sqc-multiplayer-context-nav\s*\{[^}]*grid-column:\s*1\s*\/\s*-1;[^}]*display:\s*flex;/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-multiplayer-detail\s+\.sqc-multiplayer-command-rail\s*\{[^}]*grid-column:\s*2;[^}]*grid-row:\s*3\s*\/\s*span\s*3;[^}]*position:\s*sticky;[^}]*display:\s*grid;/);
  assert.equal(css.replace(desktopMedia, "").includes(".sqc-mobile-web.desktop-multiplayer-detail .sqc-multiplayer-command-rail"), false, "desktop command-rail layout must not leak below 1180px");
});

test("Multiplayer creation becomes one desktop planning workspace without duplicating the form", () => {
  const html = renderToStaticMarkup(
    createElement(
      MobileAppWebShell,
      {
        activeTab: "multiplayerSideQuests",
        signedIn: false,
        desktopPresentation: "multiplayer-create",
        immersivePresentation: true,
        closeHref: "/multiplayer",
      },
      createElement(MobileCreateMultiplayerScreen, {
        signedIn: false,
        quests: [{ id: "official-one", title: "Any Game Counts", summary: "Finish a game.", source: "official", sourceLabel: "Official" }],
      }),
    ),
  );

  assert.match(html, /class="sqc-mobile-web desktop-multiplayer-create immersive signed-out"/);
  assert.match(html, /class="sqc-desktop-route-only"/);
  assert.match(html, /<a[^>]*aria-current="page"[^>]*href="\/create-multiplayer-side-quest"><span[^>]*><\/span>Create Multiplayer Side Quest<\/a>/);
  assert.match(html, /<nav class="sqc-multiplayer-create-context-nav" aria-label="Multiplayer creation context">[\s\S]*href="\/multiplayer"[\s\S]*Create Multiplayer Side Quest[\s\S]*<\/nav>/);
  assert.equal(html.match(/aria-label="Create Multiplayer Side Quest form"/g)?.length, 1, "desktop and mobile share one creation form");
  assert.match(html, /class="sqc-native-card sqc-create-setup-card"/);
  assert.match(html, /class="sqc-native-card sqc-create-selected-card"/);
  assert.match(html, /class="sqc-native-card sqc-create-catalog-card"/);
});

test("Multiplayer creation keeps status and error feedback ahead of its desktop action", () => {
  const html = renderToStaticMarkup(
    createElement(MobileCreateMultiplayerScreen, {
      signedIn: false,
      communityUnavailable: true,
      quests: [{ id: "official-one", title: "Any Game Counts", summary: "Finish a game.", source: "official", sourceLabel: "Official" }],
    }),
  );
  const css = readFileSync("src/app/mobile-web.css", "utf8");
  const form = readFileSync("src/components/mobile-multiplayer-create-form.tsx", "utf8");
  const desktopMedia = readCssBlock(css, css.indexOf("@media (min-width: 1180px)"));

  assert.match(html, /class="sqc-native-card sqc-create-community-notice" role="status"/);
  assert.ok(html.indexOf("sqc-create-community-notice") < html.indexOf("sqc-create-footer-bar"), "community status stays before the action in reading order");
  assert.match(form, /className="groupquest-join-error sqc-create-error" role="alert"/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-multiplayer-create\s+\.sqc-hydration-gate\s*\{[^}]*grid-auto-flow:\s*row dense;/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-multiplayer-create\s+:is\(\.sqc-create-community-notice,\s*\.sqc-create-error\)\s*\{[^}]*grid-column:\s*1\s*\/\s*-1;/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-multiplayer-create\s+\.sqc-create-catalog-card\s*\{[^}]*grid-column:\s*2;[^}]*grid-row:\s*span\s*2;/);
});

test("Multiplayer creation becomes a wide two-column planner only at the desktop boundary", () => {
  const css = readFileSync("src/app/mobile-web.css", "utf8");
  const route = readFileSync("src/app/create-multiplayer-side-quest/page.tsx", "utf8");
  const desktopMedia = readCssBlock(css, css.indexOf("@media (min-width: 1180px)"));

  assert.match(route, /desktopPresentation="multiplayer-create"/);
  assert.match(route, /closeHref="\/multiplayer"/, "mobile close destination stays intact");
  assert.match(css, /\.sqc-multiplayer-create-context-nav\s*\{[^}]*display:\s*none;/, "mobile does not duplicate its established close control");
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-multiplayer-create\s+\.sqc-multiplayer-create-context-nav\s*\{[^}]*display:\s*flex;/, "desktop exposes contextual return navigation");
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-multiplayer-create\s+\.sqc-screen\s*\{[^}]*width:\s*min\(1280px,\s*calc\(100%\s*-\s*64px\)\)/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-multiplayer-create\s+\.sqc-create-multiplayer-hero\s*\{[^}]*grid-template-columns:\s*200px\s+minmax\(0,\s*1fr\);/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-multiplayer-create\s+\.sqc-hydration-gate\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1\.15fr\)\s+minmax\(420px,\s*\.85fr\);/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-multiplayer-create\s+\.sqc-create-setup-card\s+\.sqc-option-grid\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\);/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-multiplayer-create\s+\.sqc-create-catalog-card\s*\{[^}]*grid-column:\s*2;[^}]*grid-row:\s*span\s*2;/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-multiplayer-create\s+\.sqc-screen\s*\{[^}]*padding:\s*46px\s+0\s+180px;/, "the desktop planner reserves space for its persistent action bar");
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-multiplayer-create\s+\.sqc-create-footer-bar\s*\{[^}]*grid-column:\s*1\s*\/\s*-1;[^}]*position:\s*fixed;[^}]*bottom:\s*24px;[^}]*left:\s*50%;[^}]*z-index:\s*20;[^}]*width:\s*min\(760px,\s*calc\(100%\s*-\s*64px\)\);[^}]*transform:\s*translateX\(-50%\);/, "the desktop creation action stays visible without changing the mobile footer");
  assert.equal(css.replace(desktopMedia, "").includes(".sqc-mobile-web.desktop-multiplayer-create"), false, "desktop Multiplayer create rules must not leak below 1180px");
});

test("Account becomes one desktop command center while preserving the mobile account stack", () => {
  const css = readFileSync("src/app/mobile-web.css", "utf8");
  const route = readFileSync("src/app/account/page.tsx", "utf8");
  const shell = readFileSync("src/components/mobile-app-web-shell.tsx", "utf8");
  const desktopMedia = readCssBlock(css, css.indexOf("@media (min-width: 1180px)"));
  const reducedMotion = readCssBlock(css, css.lastIndexOf("@media (prefers-reduced-motion: reduce)"));

  assert.match(shell, /\| "account";/);
  assert.match(route, /desktopPresentation="account"/);
  assert.match(route, /className="sqc-account-stack sqc-account-signed-out"/);
  assert.match(route, /className="sqc-desktop-account-intro"/);
  assert.match(route, /className="sqc-account-quests"/);
  assert.match(route, /className="sqc-account-security"/);
  assert.match(css, /\.sqc-desktop-account-intro\s*\{[^}]*display:\s*none;/);
  assert.match(css, /\.sqc-account-sign-in-copy\s*\{[^}]*display:\s*grid;[^}]*gap:\s*14px;/, "the wrapper preserves the existing mobile hero rhythm");
  assert.match(css, /\.sqc-account-security\s*\{[^}]*display:\s*grid;[^}]*gap:\s*14px;/, "signed-in mobile keeps danger-zone and logout separation");
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-account\s+\.sqc-screen\s*\{[^}]*width:\s*min\(1280px,\s*calc\(100%\s*-\s*64px\)\)/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-account\s+\.sqc-account-stack\s*\{[^}]*grid-template-columns:\s*repeat\(12,\s*minmax\(0,\s*1fr\)\);/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-account\s+\.sqc-account-signed-out\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\);/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-account\s+\.sqc-account-sign-in-layout\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*\.9fr\)\s+minmax\(420px,\s*1\.1fr\);/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-account\s+\.sqc-account-quests\s*\{[^}]*grid-column:\s*1\s*\/\s*span\s*7;/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-account\s+\.sqc-account-progress\s*\{[^}]*grid-column:\s*8\s*\/\s*-1;/);
  assert.match(reducedMotion, /\.sqc-mobile-web\.desktop-account\s+\.sqc-account-row\s*\{[^}]*transition:\s*none\s*!important;/);
  assert.equal(css.replace(desktopMedia, "").replace(reducedMotion, "").includes(".sqc-mobile-web.desktop-account"), false, "desktop Account rules must not leak below 1180px");
});

test("Account readiness links preserve the inline mobile editor and use Settings on desktop", () => {
  for (const field of ["lichess-username", "chesscom-username"] as const) {
    assert.equal(getAccountReadinessHref(field, false), `#${field}`);
    assert.equal(getAccountReadinessHref(field, true), `/settings#${field}`);
  }
});

test("desktop Account keeps overview work separate from the dedicated profile workspace", () => {
  const css = readFileSync("src/app/mobile-web.css", "utf8");
  const route = readFileSync("src/app/account/page.tsx", "utf8");
  const settings = readFileSync("src/app/settings/page.tsx", "utf8");
  const navigation = readFileSync("src/lib/account-readiness-navigation.ts", "utf8");
  const desktopMedia = readCssBlock(css, css.indexOf("@media (min-width: 1180px)"));

  assert.match(route, /field="lichess-username"/);
  assert.match(route, /field="chesscom-username"/);
  assert.match(navigation, /desktop\s*\?\s*`\/settings#\$\{field\}`\s*:\s*`#\$\{field\}`/);
  assert.match(settings, /id="lichess-username"/);
  assert.match(settings, /id="chesscom-username"/);
  assert.match(
    desktopMedia,
    /\.sqc-mobile-web\.desktop-account\s+\.sqc-account-profile-editor\s*\{[^}]*display:\s*none;/,
    "desktop Overview delegates profile editing to the persistent Profile settings destination",
  );
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-account\s+\.sqc-account-support\s*\{[^}]*grid-column:\s*1\s*\/\s*span\s*5;/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-account\s+\.sqc-account-security\s*\{[^}]*grid-column:\s*6\s*\/\s*-1;/);
  assert.match(css, /:is\(#lichess-username,\s*#chesscom-username\)\s*\{[^}]*scroll-margin-top:\s*90px;/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-settings\s+:is\(#lichess-username,\s*#chesscom-username\)\s*\{[^}]*scroll-margin-top:\s*156px;/);
  assert.doesNotMatch(
    css.slice(0, css.indexOf("@media (min-width: 1180px)")),
    /\.sqc-account-profile-editor\s*\{[^}]*display:\s*none;/,
    "mobile Account keeps Android's inline profile editor",
  );
});

test("signed-in desktop Account marks its sole persistent account action as current", () => {
  const html = renderToStaticMarkup(
    createElement(
      MobileAppWebShell,
      { activeTab: "account", signedIn: true, displayName: "Sam", desktopPresentation: "account" },
      createElement("p", null, "Account workspace"),
    ),
  );

  assert.equal(html.match(/class="sqc-desktop-sign-in"[^>]*href="\/account"/g)?.length, 1);
  assert.match(html, /class="sqc-desktop-sign-in"[^>]*aria-current="page"[^>]*href="\/account"/);
  assert.doesNotMatch(html, /href="\/account"[^>]*>My Account<\/a>/);
});

test("signed-in Support and Settings do not mislabel the account action as the current page", () => {
  for (const desktopPresentation of ["support", "settings"] as const) {
    const html = renderToStaticMarkup(
      createElement(
        MobileAppWebShell,
        { activeTab: "account", signedIn: true, displayName: "Sam", desktopPresentation },
        createElement("p", null, `${desktopPresentation} workspace`),
      ),
    );
    const accountAction = html.match(/<a class="sqc-desktop-sign-in"[^>]*href="\/account"[^>]*>/)?.[0] ?? "";

    assert.ok(accountAction, `${desktopPresentation} keeps the persistent account action`);
    assert.doesNotMatch(accountAction, /aria-current="page"/, `${desktopPresentation} must not claim that /account is current`);
  }
});

test("desktop account surfaces share a persistent workspace navigator without duplicating mobile navigation", () => {
  const css = readFileSync("src/app/mobile-web.css", "utf8");
  const desktopMedia = readCssBlock(css, css.indexOf("@media (min-width: 1180px)"));
  const surfaces = ["account", "settings", "support"] as const;

  for (const desktopPresentation of surfaces) {
    const html = renderToStaticMarkup(
      createElement(
        MobileAppWebShell,
        { activeTab: "account", signedIn: true, displayName: "Sam", desktopPresentation },
        createElement("p", null, `${desktopPresentation} workspace`),
      ),
    );

    assert.equal(html.match(/aria-label="Account workspace"/g)?.length, 1);
    for (const [label, href] of [["Overview", "/account"], ["Profile settings", "/settings"], ["Help &amp; Support", "/support"]]) {
      assert.match(html, new RegExp(`href="${href}"[^>]*>${label}<`));
    }
    const currentHref = desktopPresentation === "account" ? "/account" : `/${desktopPresentation}`;
    assert.match(html, new RegExp(`aria-current="page"[^>]*href="${currentHref}"|href="${currentHref}"[^>]*aria-current="page"`));
  }

  const unrelated = renderToStaticMarkup(
    createElement(MobileAppWebShell, { activeTab: "sideQuests", signedIn: false, desktopPresentation: "solo-discovery" }, createElement("p", null, "Solo")),
  );
  assert.doesNotMatch(unrelated, /aria-label="Account workspace"/);
  assert.match(css, /\.sqc-account-workspace-nav\s*\{\s*display:\s*none;/, "mobile keeps its established route navigation");
  assert.match(desktopMedia, /\.sqc-mobile-web:is\(\.desktop-account,\s*\.desktop-settings,\s*\.desktop-support\)\s+\.sqc-account-workspace-nav\s*\{[^}]*display:\s*flex;/);
});

test("desktop account workspace navigation clears the sticky Support overview", () => {
  const css = readFileSync("src/app/mobile-web.css", "utf8");
  const desktopMedia = readCssBlock(css, css.indexOf("@media (min-width: 1180px)"));

  assert.match(
    desktopMedia,
    /\.sqc-mobile-web:is\(\.desktop-account,\s*\.desktop-settings,\s*\.desktop-support\)\s+\.sqc-desktop-route-only\s*\{[^}]*background:\s*linear-gradient/,
    "the complete sticky navigation stack must remain visually opaque above scrolling content",
  );
  assert.match(
    desktopMedia,
    /\.sqc-mobile-web\.desktop-support\s+\.sqc-support-overview\s*\{[^}]*top:\s*156px;/,
    "the Support overview must clear the 78px header, 48px workspace bar, and 30px breathing room",
  );
});

test("Help and Support uses persistent desktop navigation without duplicating its support content", () => {
  const html = renderToStaticMarkup(
    createElement(
      MobileAppWebShell,
      { activeTab: "account", signedIn: false, desktopPresentation: "support", modalPresentation: true },
      createElement(MobileSupportScreen, { signedIn: false }),
    ),
  );

  assert.match(html, /class="sqc-mobile-web desktop-support signed-out"/);
  assert.match(html, /class="sqc-desktop-route-only"/);
  assert.match(html, /<a[^>]*aria-current="page"[^>]*href="\/support"><span[^>]*><\/span>Help &amp; Support<\/a>/);
  assert.equal(html.match(/aria-label="Help topics"/g)?.length, 1, "desktop and mobile share one support-content subtree");
  assert.doesNotMatch(html, /sqc-desktop-support-intro/, "desktop composition must not invent support content beyond the Android contract");
  assert.equal(html.match(/>How can we help\?<\/h2>/g)?.length, 1, "the Android support heading remains the single visible content authority");
});

test("Help and Support gives every desktop help topic a direct next destination without changing mobile", () => {
  const html = renderToStaticMarkup(createElement(MobileSupportScreen, { signedIn: false }));
  const css = readFileSync("src/app/mobile-web.css", "utf8");
  const desktopMedia = readCssBlock(css, css.indexOf("@media (min-width: 1180px)"));

  for (const [label, href] of [
    ["Browse Solo Side Quests", "/side-quests"],
    ["Choose a Side Quest", "/side-quests"],
    ["Open chess account settings", "/settings#lichess-username"],
    ["Browse Multiplayer", "/multiplayer"],
    ["Open Trophy Cabinet", "/trophy-cabinet"],
  ]) {
    assert.match(html, new RegExp(`href="${href}"[^>]*>${label}<`));
  }
  assert.match(css, /\.sqc-support-row-action\s*\{[^}]*display:\s*none;/, "topic actions remain absent from the mobile composition");
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-support\s+\.sqc-support-row-action\s*\{[^}]*display:\s*inline-flex;/);
});

test("Help and Support becomes a wide triage workspace only at the desktop boundary", () => {
  const css = readFileSync("src/app/mobile-web.css", "utf8");
  const route = readFileSync("src/app/support/page.tsx", "utf8");
  const desktopMedia = readCssBlock(css, css.indexOf("@media (min-width: 1180px)"));
  const reducedMotion = readCssBlock(css, css.lastIndexOf("@media (prefers-reduced-motion: reduce)"));

  assert.match(route, /desktopPresentation="support"/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-support\s+\.sqc-screen\s*\{[^}]*width:\s*min\(1280px,\s*calc\(100%\s*-\s*64px\)\)/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-support\s+\.sqc-support-screen\s*\{[^}]*grid-template-columns:\s*minmax\(320px,\s*\.72fr\)\s+minmax\(0,\s*1\.28fr\);/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-support\s+\.sqc-support-row-list\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\);/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-support\s+\.sqc-support-report\s*\{[^}]*grid-column:\s*2;/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-support\s+\.sqc-support-overview\s*\{[^}]*position:\s*sticky;/);
  assert.match(reducedMotion, /\.sqc-mobile-web\.desktop-support\s+\.sqc-support-row\s*\{[^}]*transition:\s*none\s*!important;/);
  assert.equal(css.replace(desktopMedia, "").replace(reducedMotion, "").includes(".sqc-mobile-web.desktop-support"), false, "desktop Support rules must not leak below 1180px");
});

test("desktop Support presents help topics as one numbered directory instead of five floating cards", () => {
  const html = renderToStaticMarkup(createElement(MobileSupportScreen, { signedIn: false }));
  const css = readFileSync("src/app/mobile-web.css", "utf8");
  const desktopMedia = readCssBlock(css, css.indexOf("@media (min-width: 1180px)"));

  assert.match(html, /class="sqc-support-directory-head"/);
  assert.match(html, />Help directory<\/h2>/);
  assert.equal(html.match(/class="sqc-support-row-index"/g)?.length, 5);
  assert.match(css, /\.sqc-support-directory-head,\s*\.sqc-support-row-index\s*\{\s*display:\s*none;/, "desktop wayfinding stays out of the mobile composition");
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-support\s+\.sqc-support-directory-head\s*\{[^}]*display:\s*grid;/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-support\s+\.sqc-support-row-list\s*\{[^}]*overflow:\s*hidden;[^}]*border:\s*1px solid/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-support\s+\.sqc-support-row\s*\{[^}]*border-radius:\s*0;[^}]*background:\s*transparent;/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-support\s+\.sqc-support-row:last-of-type\s*\{[^}]*grid-column:\s*1\s*\/\s*-1;/);
});

test("desktop Support keeps the legal and report row directly below the taller help directory", () => {
  const css = readFileSync("src/app/mobile-web.css", "utf8");
  const desktopMedia = readCssBlock(css, css.indexOf("@media (min-width: 1180px)"));

  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-support\s+\.sqc-support-overview\s*\{[^}]*grid-row:\s*1;/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-support\s+\.sqc-support-screen\s*>\s*\.sqc-support-card:not\(\.sqc-support-report\)\s*\{[^}]*grid-column:\s*1;[^}]*grid-row:\s*2;/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-support\s+\.sqc-support-report\s*\{[^}]*grid-column:\s*2;[^}]*grid-row:\s*2;/);
  assert.doesNotMatch(desktopMedia, /\.sqc-mobile-web\.desktop-support\s+\.sqc-support-overview\s*\{[^}]*grid-row:\s*1\s*\/\s*span\s*2;/);
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
