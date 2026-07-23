import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CommunityMultiplayerCatalog, CustomSoloCatalog } from "@/components/catalog-clients";
import { MobileCommunitySideQuestsScreen, MobileCustomSideQuestsScreen, MobileMultiplayerSideQuestsScreen, MobileSimpleScreen, MobileSoloSideQuestsScreen } from "@/components/mobile-app-web-shell";
import { CHALLENGES } from "@/lib/challenges";
import type { MobileWebMultiplayerPreview } from "@/lib/mobile-web-multiplayer";

const row: MobileWebMultiplayerPreview = {
  id: "community-row",
  title: "A complete community Multiplayer title",
  meta: "Community public · 4 players · Final",
  href: "/multiplayer-side-quests/community-row",
  sourceBadge: "Community",
  publiclyListed: true,
  inviteCopy: "Join the table.",
  quests: ["finish-any-game"],
  rules: [["Mode", "Any"]],
  status: "Joined",
  playerCount: 4,
  playersLabel: "4 players",
  timeLeftLabel: "Final",
  leaderboardRows: [],
  likeSummary: { count: 0, likedByViewer: false },
  lifecycle: "finished",
  createdAt: "2026-07-01T00:00:00.000Z",
  startAt: "2026-07-01T12:00:00.000Z",
  endAt: "2026-07-02T00:00:00.000Z",
};

test("Solo and Multiplayer catalog switches are route navigation without invalid tab semantics", () => {
  const solo = renderToStaticMarkup(createElement(MobileCommunitySideQuestsScreen, { rows: [], signedIn: true }));
  assert.match(solo, /<nav class="sqc-brand-tabs sqc-solo-brand-tabs" aria-label="Solo Side Quest catalog">/);
  assert.match(solo, /aria-label="Switch to Official Side Quests"/);
  assert.match(solo, /data-icon="swap-horizontal"/);
  assert.match(solo, /<a[^>]*aria-current="page"[^>]*href="\/community-side-quests"/);
  assert.doesNotMatch(solo, /role="(?:tablist|tab|separator)"|aria-selected=/);

  const multiplayer = renderToStaticMarkup(createElement(MobileMultiplayerSideQuestsScreen, { selectedTab: "community", signedIn: true, officialRows: [], communityRows: [row] }));
  assert.match(multiplayer, /<nav class="sqc-brand-tabs sqc-multiplayer-brand-tabs" aria-label="Multiplayer Side Quest catalog">/);
  assert.match(multiplayer, /aria-label="Switch to Official Multiplayer Side Quests"/);
  assert.match(multiplayer, /<a[^>]*aria-current="page"[^>]*href="\/multiplayer-side-quests\?tab=community"/);
  assert.doesNotMatch(multiplayer, /role="(?:tablist|tab|separator)"|aria-selected=/);

  const library = renderToStaticMarkup(createElement(MobileCustomSideQuestsScreen, { rows: [] }));
  assert.match(library, /<nav class="sqc-brand-tabs sqc-solo-brand-tabs" aria-label="Solo Side Quest catalog">/);
  assert.match(library, /<nav class="sqc-community-subtabs" aria-label="Community Solo views"><a href="\/community-side-quests">Discover<\/a><span class="active" aria-current="page">My Library<\/span><\/nav>/);
  assert.equal((library.match(/aria-current="page"/g) ?? []).length, 1);
  assert.doesNotMatch(library, /role="(?:tablist|tab|separator)"|aria-selected=/);
});

test("Community Solo intro matches Android without claiming web actions require mobile", () => {
  const html = renderToStaticMarkup(createElement(MobileCommunitySideQuestsScreen, { rows: [], signedIn: true }));

  assert.match(html, /<h1>Community Side Quests<\/h1>/);
  assert.match(html, /These are Side Quests created by the Side Quest Chess community\./);
  assert.doesNotMatch(html, /Use mobile to pick, check, prove, and collect\./);
  assert.doesNotMatch(html, /full tavern-wall browse/);
});

test("Community Solo browse exposes every Android filter and sort choice", () => {
  const html = renderToStaticMarkup(createElement(MobileCommunitySideQuestsScreen, { rows: [], signedIn: true }));

  for (const label of ["All", "Popular", "New", "Completed"]) {
    assert.match(html, new RegExp(`>${label}<`));
  }
  for (const label of ["Top", "Liked", "Newest", "A–Z"]) {
    assert.match(html, new RegExp(`>${label}<`));
  }
});

test("Community Multiplayer browse exposes every Android sort choice", () => {
  const html = renderToStaticMarkup(createElement(MobileMultiplayerSideQuestsScreen, {
    selectedTab: "community",
    signedIn: true,
    officialRows: [],
    communityRows: [row],
  }));

  for (const label of ["Closing", "Liked", "New", "Players"]) {
    assert.match(html, new RegExp(`>${label}<`));
  }
});

test("Community Multiplayer likes feed optimistic state back into like-derived sorting", () => {
  const source = readFileSync(new URL("../src/components/catalog-clients.tsx", import.meta.url), "utf8");

  assert.match(source, /const \[liveRows, setLiveRows\] = useState\(rows\)/);
  assert.match(source, /const \[previousRows, setPreviousRows\] = useState\(rows\)/);
  assert.match(source, /if \(rows !== previousRows\) \{\s*setPreviousRows\(rows\);\s*setLiveRows\(rows\);\s*setRowsGeneration\(\(current\) => current \+ 1\);\s*\}/);
  assert.match(source, /filterMultiplayerCatalog\(hostRows/);
  assert.match(source, /const \[pendingLikeIds, setPendingLikeIds\] = useState<Set<string>>/);
  assert.match(source, /const \[rowsGeneration, setRowsGeneration\] = useState\(0\)/);
  assert.match(source, /setRowsGeneration\(\(current\) => current \+ 1\)/);
  assert.match(source, /stateGeneration=\{rowsGeneration\}/);
  assert.match(source, /const rowsGenerationRef = useRef\(rowsGeneration\)/);
  assert.match(source, /useLayoutEffect\(\(\) => \{\s*rowsGenerationRef\.current = rowsGeneration;\s*\}, \[rowsGeneration\]\)/);
  assert.match(source, /if \(rowsGenerationRef\.current === rowsGeneration\) \{\s*setLiveRows/);
  assert.match(source, /externallyBusy=\{pendingLikeIds\.has\(row\.id\)\}/);
  assert.match(source, /onLikeStateChange=\{\(liked\) => \{/);
  assert.match(source, /setPendingLikeIds\(\(current\) => new Set\(current\)\.add\(row\.id\)\)/);
  assert.match(source, /onMutationSettled=\{\(\) => setPendingLikeIds/);
  assert.match(source, /applyMultiplayerLikeState\(current, row\.id, liked\)/);
});

test("Community Multiplayer discovery initially shows four rows and a real Android-sized load-more action", () => {
  const rows = Array.from({ length: 6 }, (_, index) => ({
    ...row,
    id: `open-${index + 1}`,
    title: `Open table ${index + 1}`,
    href: `/groupquests/open-${index + 1}`,
    status: "Not joined" as const,
    lifecycle: "open" as const,
    endAt: `2026-08-0${index + 1}T00:00:00.000Z`,
  }));
  const html = renderToStaticMarkup(createElement(CommunityMultiplayerCatalog, {
    rows,
    signedIn: false,
  }));

  for (const visible of [1, 2, 3, 4]) assert.match(html, new RegExp(`>Open table ${visible}<`));
  assert.doesNotMatch(html, />Open table 5<|>Open table 6</);
  assert.match(html, /<button[^>]*>More community Side Quests \(2\)<\/button>/);
});

test("Community Solo route carries the creator shelf key from public data into the rendered catalog", () => {
  const page = readFileSync(new URL("../src/app/community-side-quests/page.tsx", import.meta.url), "utf8");
  assert.match(page, /searchParams:\s*Promise<\{ creator\?: string \}>/);
  assert.match(page, /const \{ creator \} = await searchParams/);
  assert.match(page, /creatorKey: quest\.creatorKey/);
  assert.match(page, /creatorName: quest\.creatorName/);
  assert.match(page, /likedByViewer: likeSummary\.likedByViewer/);
  assert.match(page, /initialCreator=\{creator \?\? null\}/);
});

test("Community Solo creator shelf shows only that creator and keeps a real clear action", () => {
  const base = {
    meta: "Community rule",
    image: "/badges/custom/community/community-coat-28.png",
    sourceBadge: "Community",
    status: "Ready",
    updatedAtMs: 100,
    popularityScore: 1,
    likeCount: 0,
    likedByViewer: false,
    completedByViewer: false,
    isNew: false,
  };
  const html = renderToStaticMarkup(createElement(MobileCommunitySideQuestsScreen, {
    signedIn: true,
    initialCreator: "ada-1",
    rows: [
      { ...base, id: "ada-quest", title: "Ada Fork", href: "/challenges/community/ada-quest", creatorKey: "ada-1", creatorName: "Ada" },
      { ...base, id: "nora-quest", title: "Nora Pin", href: "/challenges/community/nora-quest", creatorKey: "nora-2", creatorName: "Nora" },
    ],
  }));

  assert.match(html, /Creator shelf: Ada/);
  assert.match(html, />1\/1</);
  assert.doesNotMatch(html, />2\/2</);
  assert.match(html, /href="\/community-side-quests"[^>]*>Show all creators/);
  assert.match(html, /Ada Fork/);
  assert.doesNotMatch(html, /Nora Pin/);
});

test("Community Solo rows show their Coat of Arms like Android v338", () => {
  const solo = renderToStaticMarkup(createElement(MobileCommunitySideQuestsScreen, {
    signedIn: true,
    rows: [{
      id: "community-solo",
      title: "Castle? Never Heard Of It",
      meta: "By Nora Skewer · Finish without castling.",
      href: "/challenges/community/community-solo",
      image: "/badges/custom/community/community-coat-28.png",
      sourceBadge: "Community",
      status: "Ready",
      updatedAtMs: 1,
      popularityScore: 1,
      likeCount: 1,
      likedByViewer: false,
      completedByViewer: false,
      isNew: false,
    }],
  }));

  assert.match(solo, /class="sqc-row-icon"/);
  assert.match(solo, /community-coat-28\.png/);
  assert.match(solo, /class="sqc-row-glow generic"/);
  assert.doesNotMatch(solo, /sqc-app-row text-only/);
});

test("Community Solo catalog keeps the exact row link beside the Android like action", () => {
  const solo = renderToStaticMarkup(createElement(MobileCommunitySideQuestsScreen, {
    signedIn: true,
    rows: [{
      id: "community-solo",
      title: "Castle? Never Heard Of It",
      meta: "By Nora Skewer · Finish without castling.",
      href: "/challenges/community/community-solo",
      image: "/badges/custom/community/community-coat-28.png",
      sourceBadge: "Community",
      status: "Ready",
      updatedAtMs: 1,
      popularityScore: 1,
      likeCount: 7,
      likedByViewer: true,
      completedByViewer: false,
      isNew: false,
    }],
  }));

  assert.match(solo, /class="sqc-app-row sqc-app-row-with-like"/);
  assert.match(solo, /aria-label="Open Castle\? Never Heard Of It"[^>]*href="\/challenges\/community\/community-solo"/);
  assert.match(solo, /aria-label="Unlike Castle\? Never Heard Of It\. 7 likes\."/);
  assert.match(solo, /data-icon="thumb-up"/);
});

test("earlier official weeks reveal every Android result instead of linking only the first", () => {
  const podiumRows = (["Gold", "Silver", "Bronze"] as const).map((placement) => ({
    placement,
    name: `${placement} player`,
    meta: `${placement} result`,
    pending: false,
  }));
  const multiplayer = renderToStaticMarkup(createElement(MobileMultiplayerSideQuestsScreen, {
    selectedTab: "official",
    signedIn: true,
    officialRows: [],
    communityRows: [],
    earlierOfficialWeeks: [{
      id: "2026-07-06",
      title: "Week of Jul 6",
      meta: "Jul 6-Jul 12 · 2 official results",
      questCount: 2,
      results: [
        { id: "rook-rally", title: "Rook Rally", href: "/groupquests/rook-rally", summary: "Final", podiumRows },
        { id: "bishop-blitz", title: "Bishop Blitz", href: "/groupquests/bishop-blitz", summary: "Final", podiumRows },
      ],
    }],
  }));

  assert.match(multiplayer, /<details class="sqc-official-week-results">/);
  assert.match(multiplayer, /<summary[^>]*>[\s\S]*Week of Jul 6[\s\S]*2 official results[\s\S]*<\/summary>/);
  assert.match(multiplayer, /aria-label="Open official result Rook Rally"[^>]*href="\/groupquests\/rook-rally"/);
  assert.match(multiplayer, /aria-label="Open official result Bishop Blitz"[^>]*href="\/groupquests\/bishop-blitz"/);

  const css = readFileSync("src/app/mobile-web.css", "utf8");
  assert.match(css, /\.sqc-official-week-results\s*>\s*summary\s*\{[^}]*display:\s*grid;[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s+auto;/);
  assert.match(css, /\.sqc-official-week-results\[open\]\s*>\s*summary/);
});

test("official row glows use Android badge tint instead of the raw white mask", () => {
  const challenge = CHALLENGES.find(item => item.id === "bishop-field-trip");
  assert.ok(challenge);
  const solo = renderToStaticMarkup(createElement(MobileSoloSideQuestsScreen, {
    challenges: [challenge],
    signedIn: true,
  }));

  assert.match(solo, /class="sqc-row-glow tinted"/);
  assert.match(solo, /--sqc-row-glow-color:rgba\(45,212,191,\.36\)/);
  assert.match(solo, /--sqc-row-glow-image:url\(&quot;\/mobile-source\/badges\/glow\/bishop-field-trip-glow\.png&quot;\)/);
  assert.doesNotMatch(solo, /<img[^>]*class="sqc-row-glow"/);
});

test("unrelated AppRow consumers do not gain a generic glow", () => {
  const simple = renderToStaticMarkup(createElement(MobileSimpleScreen, {
    eyebrow: "Archive",
    title: "Past Side Quests",
    body: "Browse prior records.",
    rows: [{ title: "Archived row", meta: "No explicit glow", status: "View", href: "/archive" }],
  }));

  assert.doesNotMatch(simple, /class="sqc-row-glow/);
});

test("unrelated explicit AppRow glows preserve their original image rendering", () => {
  const simple = renderToStaticMarkup(createElement(MobileSimpleScreen, {
    eyebrow: "Archive",
    title: "Past Side Quests",
    body: "Browse prior records.",
    rows: [{
      title: "Archived trophy",
      meta: "Existing explicit glow",
      status: "View",
      href: "/archive/trophy",
      image: "/mobile-source/badges/v6/proof-loop-test-badge.png",
      glow: "/mobile-source/badges/glow/finish-any-game-glow.png",
    }],
  }));

  assert.match(simple, /<img[^>]*class="sqc-row-glow"/);
  assert.doesNotMatch(simple, /class="sqc-row-glow tinted"/);
  assert.doesNotMatch(simple, /--sqc-row-glow-color/);
});

test("custom-library rows remain text-only", () => {
  const custom = renderToStaticMarkup(createElement(CustomSoloCatalog, {
    rows: [{
      id: "custom-solo",
      title: "Private draft",
      meta: "Owner-only rule",
      href: "/custom-side-quests/custom-solo",
      image: "/badges/custom/community/community-coat-28.png",
      lifecycle: "draft",
      visibility: "private",
      updatedAt: "2026-07-19T00:00:00.000Z",
    }],
  }));

  assert.match(custom, /class="sqc-app-row text-only"/);
  assert.doesNotMatch(custom, /class="sqc-row-icon"/);
  assert.doesNotMatch(custom, /class="sqc-row-glow/);
});

test("text-only community Multiplayer rows receive the full copy column", () => {
  const multiplayer = renderToStaticMarkup(createElement(MobileMultiplayerSideQuestsScreen, { selectedTab: "community", signedIn: true, officialRows: [], communityRows: [row] }));
  assert.match(multiplayer, /class="sqc-app-row sqc-app-row-with-like text-only"/);
  assert.match(multiplayer, /A complete community Multiplayer title/);
  assert.match(multiplayer, /Community public · 4 players · Final/);

  const css = readFileSync("src/app/mobile-web.css", "utf8");
  assert.match(css, /\.sqc-brand-switch\s*\{[^}]*color:\s*rgba\(255,\s*247,\s*232,\s*\.82\);/);
  assert.match(css, /\.sqc-app-row\.text-only\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s+auto;/);
  assert.match(css, /\.sqc-mobile-web\.signed-out\s+\.sqc-app-row\.text-only\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s+auto;/);
  assert.match(css, /\.sqc-mobile-web:not\(\.signed-out\)\s+:is\(\.sqc-solo-brand-tabs,\s*\.sqc-multiplayer-brand-tabs\)\s*\{[^}]*grid-template-columns:\s*repeat\(2,/);
});
