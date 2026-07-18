import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MobileCreateCustomScreen, MobileCustomSideQuestsScreen } from "../src/components/mobile-app-web-shell";
import MobileCustomCreateForm from "../src/components/mobile-custom-create-form";
import { LocalCustomDraftList } from "../src/components/local-custom-draft-library";
import type { CustomSideQuestRuleBlock } from "../src/lib/custom-side-quests";
import {
  buildCustomCreatePayload,
  buildCustomEditConfig,
  buildMultiplayerCreatePayload,
  getCreateErrorMessage,
  getCustomCreateDestination,
  getCustomEditFormState,
  getCustomTemplateBlocks,
  getMultiplayerCreateDestination,
  getMultiplayerLocalDateTimeDefaults,
} from "../src/lib/mobile-create-forms";
import { getLocalCustomDraftEditHref, getLocalCustomDraftFormState, getLocalCustomDraftIdFromSearch, readLocalCustomDrafts, removeLocalCustomDraft, saveLocalCustomDraft, tryRemoveLocalCustomDraft } from "../src/lib/local-custom-drafts";

const root = new URL("../", import.meta.url);
const source = (path: string) => readFile(new URL(path, root), "utf8");

test("signed-out custom drafts are stored locally without account identity", () => {
  const values = new Map<string, string>();
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
  };

  const draft = saveLocalCustomDraft(storage, {
    id: "local-custom-1",
    title: "  Later Knights  ",
    summary: "  Try this after sign-in. ",
    config: JSON.stringify({ version: 2, logic: "all", blocks: [] }),
    now: "2026-07-18T10:00:00.000Z",
  });

  assert.equal(draft.title, "Later Knights");
  assert.equal(draft.lifecycle, "draft");
  assert.equal(draft.visibility, "private");
  assert.equal("userId" in draft, false);
  assert.equal("ownerId" in draft, false);
  assert.deepEqual(JSON.parse([...values.values()][0]!), [draft]);
});

test("local custom drafts keep the newest six and tolerate malformed saved data", () => {
  const values = new Map<string, string>([["sqc.local-custom-drafts.v1", "not json"]]);
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
  };

  for (let index = 1; index <= 7; index += 1) {
    saveLocalCustomDraft(storage, {
      id: `local-custom-${index}`,
      title: `Draft ${index}`,
      summary: "",
      config: JSON.stringify({ version: 2, logic: "all", blocks: [] }),
      now: `2026-07-18T10:00:0${index}.000Z`,
    });
  }

  const saved = JSON.parse(values.get("sqc.local-custom-drafts.v1")!) as Array<{ id: string }>;
  assert.deepEqual(saved.map((draft) => draft.id), [
    "local-custom-7",
    "local-custom-6",
    "local-custom-5",
    "local-custom-4",
    "local-custom-3",
    "local-custom-2",
  ]);
});

test("local draft edit links resolve only exact browser-local draft IDs", () => {
  assert.equal(
    getLocalCustomDraftIdFromSearch("?draft=local-custom-safe%20id"),
    "local-custom-safe id",
  );
  assert.equal(getLocalCustomDraftIdFromSearch("?draft=server-custom-1"), null);
  assert.equal(getLocalCustomDraftIdFromSearch("?draft="), null);
  assert.equal(getLocalCustomDraftIdFromSearch("?other=local-custom-safe"), null);
});

test("saving an edited local draft preserves its identity and creation time", () => {
  const values = new Map<string, string>();
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
  };
  saveLocalCustomDraft(storage, {
    id: "local-custom-edit",
    title: "First title",
    summary: "",
    config: JSON.stringify({ version: 2, logic: "all", blocks: [] }),
    now: "2026-07-18T10:00:00.000Z",
  });

  const updated = saveLocalCustomDraft(storage, {
    id: "local-custom-edit",
    title: "Updated title",
    summary: "Now complete",
    config: JSON.stringify({ version: 2, logic: "all", blocks: [{ type: "gameResult", result: "win" }] }),
    now: "2026-07-18T11:00:00.000Z",
  });

  assert.equal(updated.id, "local-custom-edit");
  assert.equal(updated.createdAt, "2026-07-18T10:00:00.000Z");
  assert.equal(updated.updatedAt, "2026-07-18T11:00:00.000Z");
  assert.deepEqual(readLocalCustomDrafts(storage), [updated]);
});

test("local drafts can be continued safely and removed only after import", () => {
  const values = new Map<string, string>();
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
  };
  saveLocalCustomDraft(storage, {
    id: "local-custom-safe id",
    title: "Continue me",
    summary: "",
    config: JSON.stringify({ version: 2, logic: "all", blocks: [{ type: "gameResult", result: "win" }] }),
    now: "2026-07-18T10:00:00.000Z",
  });

  assert.equal(getLocalCustomDraftEditHref("local-custom-safe id"), "/create-custom-side-quest?draft=local-custom-safe%20id");
  assert.deepEqual(getLocalCustomDraftFormState(storage, "local-custom-safe id"), {
    id: "local-custom-safe id",
    title: "Continue me",
    summary: "",
    logic: "all",
    blocks: [{ type: "gameResult", result: "win" }],
  });
  assert.equal(getLocalCustomDraftFormState(storage, "local-custom-missing"), null);
  assert.equal(removeLocalCustomDraft(storage, "local-custom-safe id"), true);
  assert.deepEqual(readLocalCustomDrafts(storage), []);
  assert.equal(removeLocalCustomDraft(storage, "local-custom-missing"), false);
});

test("local draft cleanup cannot turn a successful account import into a retry", () => {
  const storage = {
    getItem: () => JSON.stringify([{
      id: "local-custom-imported",
      title: "Imported",
      summary: "",
      config: JSON.stringify({ version: 2, logic: "all", blocks: [] }),
      lifecycle: "draft",
      visibility: "private",
      createdAt: "2026-07-18T10:00:00.000Z",
      updatedAt: "2026-07-18T10:00:00.000Z",
    }]),
    setItem: () => { throw new Error("storage unavailable"); },
  };

  assert.doesNotThrow(() => tryRemoveLocalCustomDraft(storage, "local-custom-imported"));
  assert.equal(tryRemoveLocalCustomDraft(storage, "local-custom-imported"), false);
});

test("custom creator builds a launch-ready rule without accepting owner identity", () => {
  const payload = buildCustomCreatePayload({
    title: "  No Castle Night  ",
    summary: "  Win without castling. ",
    logic: "any",
    blocks: [
      { type: "gameResult", result: "win" },
      { type: "pieceState", piece: "king", owner: "my", condition: "not moved", timing: { atGameEnd: true }, negate: false },
    ],
    visibility: "public",
    lifecycle: "published",
  });
  assert.equal(payload.title, "No Castle Night");
  assert.equal(payload.summary, "Win without castling.");
  assert.equal(payload.visibility, "public");
  assert.deepEqual(JSON.parse(payload.config), {
    version: 2,
    logic: "any",
    blocks: [
      { type: "gameResult", result: "win" },
      { type: "pieceState", piece: "king", owner: "my", condition: "not moved", timing: { atGameEnd: true }, negate: false },
    ],
  });
  assert.equal("userId" in payload, false);
  assert.equal("ownerId" in payload, false);
});

test("custom creator rejects missing title and condition", () => {
  assert.throws(() => buildCustomCreatePayload({ title: "", summary: "", logic: "all", blocks: [], visibility: "private", lifecycle: "published" }), /name/i);
  assert.throws(() => buildCustomCreatePayload({ title: "Named", summary: "", logic: "all", blocks: [], visibility: "private", lifecycle: "published" }), /condition/i);
});

test("custom creator preserves Android's empty signed-in draft behavior", () => {
  const payload = buildCustomCreatePayload({ title: "Later", summary: "", logic: "all", blocks: [], visibility: "public", lifecycle: "draft" });
  assert.deepEqual(JSON.parse(payload.config), { version: 2, logic: "all", blocks: [] });
  assert.equal(payload.visibility, "private");
});

test("custom creator supports six independently editable Android-compatible conditions", () => {
  const blocks: CustomSideQuestRuleBlock[] = [
    { type: "gameResult", result: "win" },
    { type: "gameResult", result: "draw" },
    { type: "gameResult", result: "lose" },
    { type: "pieceState", piece: "queen", owner: "my", condition: "gone", timing: { atGameEnd: true } },
    { type: "pieceState", piece: "king", owner: "opponent", condition: "not moved", timing: { byMove: 20 } },
    { type: "openingSequence", raw: "e4 e5", moves: ["e4", "e5"], anchor: "gameStart" },
  ];
  const payload = buildCustomCreatePayload({ title: "Six rules", summary: "", logic: "all", blocks: [...blocks], visibility: "private", lifecycle: "draft" });
  assert.deepEqual(JSON.parse(payload.config), { version: 2, logic: "all", blocks });
  assert.throws(() => buildCustomCreatePayload({ title: "Seven rules", summary: "", logic: "all", blocks: [...blocks, blocks[0]], visibility: "private", lifecycle: "draft" }), /up to 6/i);
});

test("owned custom Side Quest rules reopen in the exact editor state", () => {
  const blocks: CustomSideQuestRuleBlock[] = [
    { type: "gameResult", result: "win" },
    { type: "pieceState", piece: "queen", owner: "my", condition: "gone", timing: { atGameEnd: true } },
  ];

  assert.deepEqual(getCustomEditFormState({
    id: "custom-edit-safe",
    title: "Queenless sprint",
    summary: "Trade queens, then win.",
    config: JSON.stringify({ version: 2, logic: "any", blocks }),
    visibility: "public",
    lifecycle: "published",
  }), {
    id: "custom-edit-safe",
    title: "Queenless sprint",
    summary: "Trade queens, then win.",
    logic: "any",
    blocks,
    visibility: "public",
    lifecycle: "published",
  });

  assert.equal(getCustomEditFormState({
    id: "custom-edit-safe",
    title: "Broken",
    summary: "",
    config: "not-json",
    visibility: "private",
    lifecycle: "draft",
  }), null);

  assert.equal(getCustomEditFormState({
    id: "custom-archived",
    title: "Archived rules",
    summary: "",
    config: JSON.stringify({ version: 2, logic: "all", blocks }),
    visibility: "private",
    lifecycle: "archived",
  })?.lifecycle, "archived");
});

test("owned custom Side Quest editor can open legacy valid rules above Android's six-condition limit", () => {
  const config = JSON.stringify({
    version: 2,
    logic: "all",
    blocks: Array.from({ length: 7 }, () => ({ type: "gameResult", result: "win" })),
  });
  const quest = {
    id: "custom-seven-rules",
    title: "Legacy seven",
    summary: "Reduce before saving.",
    config,
    visibility: "private" as const,
    lifecycle: "draft" as const,
  };

  assert.equal(getCustomEditFormState(quest)?.blocks.length, 7);
  const html = renderToStaticMarkup(React.createElement(MobileCustomCreateForm, { signedIn: true, initialQuest: quest }));
  assert.match(html, /supports up to 6 conditions/i);
  assert.match(html, /delete at least 1 condition/i);
  assert.match(html, /Save Rule Changes/);
});

test("editing custom rules preserves supported advanced configuration fields", () => {
  const original = JSON.stringify({
    version: 7,
    logic: "all",
    customTopLevel: { mode: "legacy" },
    blocks: [{ type: "moveSequence", sequence: "e4 e5", futureField: true }],
  });
  const blocks = [{ type: "moveSequence", sequence: "e4 e5", futureField: true }] as unknown as CustomSideQuestRuleBlock[];

  assert.deepEqual(JSON.parse(buildCustomEditConfig(original, "any", blocks)), {
    version: 7,
    logic: "any",
    customTopLevel: { mode: "legacy" },
    blocks,
  });
  assert.throws(() => buildCustomEditConfig("not-json", "all", blocks), /rules/i);
});

test("queen-trade template round-trips through Android's my/opponent owner parser", () => {
  const blocks = getCustomTemplateBlocks("queen-trade");
  const owners = blocks.filter((block) => block.type === "pieceState").map((block) => block.owner);
  assert.deepEqual(owners, ["my", "opponent"]);
  assert.equal(blocks.every((block) => block.type !== "pieceState" || block.owner !== "either"), true);
});

test("custom builder renders the Android-style multi-condition command center", () => {
  const html = renderToStaticMarkup(React.createElement(MobileCustomCreateForm, { signedIn: true }));
  assert.match(html, /sqc-template-card/);
  assert.match(html, /How conditions count/);
  assert.match(html, /Complete every condition/);
  assert.match(html, /Complete any one condition/);
  assert.match(html, /Your conditions · 2\/6/);
  assert.match(html, /Add Another Condition/);
  assert.match(html, /Duplicate/);
  assert.match(html, /Delete/);
});

test("owned custom Side Quest editor renders saved rules and exact-resource save intent", async () => {
  const html = renderToStaticMarkup(React.createElement(MobileCustomCreateForm, {
    signedIn: true,
    initialQuest: {
      id: "custom-edit-safe",
      title: "Queenless sprint",
      summary: "Trade queens, then win.",
      config: JSON.stringify({ version: 2, logic: "any", blocks: [{ type: "gameResult", result: "win" }] }),
      visibility: "public",
      lifecycle: "published",
    },
  }));

  assert.match(html, /value="Queenless sprint"/);
  assert.match(html, /Complete any one condition/);
  assert.match(html, /aria-pressed="true"[^>]*>Complete any one condition/);
  assert.match(html, /Editing saved Side Quest/);
  assert.match(html, /Save Rule Changes/);
  const componentSource = await source("src/components/mobile-custom-create-form.tsx");
  assert.match(componentSource, /useEffect\(\(\) => \{\s*if \(initialQuest\) return;/);
});

test("owned custom Side Quest editor remounts its form when exact quest identity changes", () => {
  const quest = {
    title: "Quest one",
    summary: "First rules",
    config: JSON.stringify({ version: 2, logic: "all", blocks: [{ type: "gameResult", result: "win" }] }),
    visibility: "private" as const,
    lifecycle: "published" as const,
  };
  const firstScreen = MobileCreateCustomScreen({ signedIn: true, initialQuest: { ...quest, id: "custom-one" } });
  const secondScreen = MobileCreateCustomScreen({ signedIn: true, initialQuest: { ...quest, id: "custom-two" } });
  const firstForm = (firstScreen.props.children as React.ReactElement[])[1];
  const secondForm = (secondScreen.props.children as React.ReactElement[])[1];

  assert.equal(firstForm.key, "custom-one");
  assert.equal(secondForm.key, "custom-two");
});

test("invalid saved custom rules fail closed instead of rendering a create form", () => {
  const html = renderToStaticMarkup(React.createElement(MobileCustomCreateForm, {
    signedIn: true,
    initialQuest: {
      id: "custom-invalid-edit",
      title: "Invalid saved quest",
      summary: "",
      config: JSON.stringify({ version: 2, logic: "all", blocks: [{ type: "gameResult", result: "win", negate: "false" }] }),
      visibility: "private",
      lifecycle: "draft",
    },
  }));

  assert.match(html, /could not be opened safely/i);
  assert.doesNotMatch(html, /Save Custom Side Quest|Save Rule Changes/);
  assert.doesNotMatch(html, /<form/);
});

test("signed-out custom creator keeps Android's local-draft builder available", () => {
  const signedOut = renderToStaticMarkup(React.createElement(MobileCreateCustomScreen, { signedIn: false }));
  const signedIn = renderToStaticMarkup(React.createElement(MobileCreateCustomScreen, { signedIn: true }));

  assert.match(signedOut, /Custom Side Quest builder/);
  assert.match(signedOut, /Save Draft Locally/);
  assert.match(signedOut, /saved only in this browser/i);
  assert.doesNotMatch(signedOut, /Sign in to create a Custom Side Quest/);
  assert.match(signedIn, /Custom Side Quest builder/);
  assert.match(signedIn, /Save Custom Side Quest/);
  assert.doesNotMatch(signedIn, /Save Draft Locally/);
});

test("signed-out custom library renders locally saved drafts as private browser-only records", () => {
  const html = renderToStaticMarkup(React.createElement(LocalCustomDraftList, {
    drafts: [{
      id: "local-custom-1",
      title: "Later Knights",
      summary: "Try this after sign-in.",
      config: JSON.stringify({ version: 2, logic: "all", blocks: [] }),
      lifecycle: "draft",
      visibility: "private",
      createdAt: "2026-07-18T10:00:00.000Z",
      updatedAt: "2026-07-18T10:00:00.000Z",
    }],
  }));

  assert.match(html, /Later Knights/);
  assert.match(html, /Draft/);
  assert.match(html, /Saved only in this browser/);
  assert.match(html, /href="\/create-custom-side-quest\?draft=local-custom-1"/);
  assert.match(html, /Continue draft/);
});

test("signed-out custom library slot replaces the account-backed empty state", () => {
  const localDrafts = React.createElement("p", null, "Loading drafts saved in this browser…");
  const html = renderToStaticMarkup(React.createElement(MobileCustomSideQuestsScreen, { rows: [], localDrafts }));

  assert.match(html, /Loading drafts saved in this browser/);
  assert.doesNotMatch(html, /Build your own Side Quest/);
  assert.match(html, /class="sqc-brand-switch"[^>]*role="tab"[^>]*aria-selected="false"/);
});

test("signed-out custom library route loads browser-local drafts", async () => {
  const route = await source("src/app/custom-side-quests/page.tsx");
  assert.match(route, /LocalCustomDraftLibrary/);
  assert.match(route, /localDrafts=\{<LocalCustomDraftLibrary \/>\}/);
});

test("custom builder restores and updates the exact local draft from its URL", async () => {
  const form = await source("src/components/mobile-custom-create-form.tsx");

  assert.match(form, /getLocalCustomDraftIdFromSearch\(window\.location\.search\)/);
  assert.match(form, /getLocalCustomDraftFormState\(window\.localStorage, draftId\)/);
  assert.match(form, /setEditingLocalDraftId\(draft\.id\)/);
  assert.match(form, /editingLocalDraftId \?\? `local-custom-\$\{crypto\.randomUUID\(\)\}`/);
});

test("custom success navigates to the owned custom catalog", () => {
  assert.equal(getCustomCreateDestination({ ok: true, customQuest: { id: "custom-safe" } }), "/custom-side-quests?saved=custom-safe");
  assert.equal(getCustomCreateDestination({ ok: true, customQuest: { id: "../escape" } }), null);
});

test("multiplayer creator validates and sends supported fields without client identity", () => {
  const payload = buildMultiplayerCreatePayload({
    name: "Friday Knights",
    inviteCopy: "Play together",
    inviteMode: "private-key",
    inviteKey: "friday-123",
    questIds: ["finish-any-game"],
    providerMode: "lichess",
    startAt: "2026-07-12T12:00:00.000Z",
    endAt: "2026-07-19T12:00:00.000Z",
    rules: { timeControl: "Rapid 10+0", rated: "Rated only", color: "Any color" },
  });
  assert.equal(payload.name, "Friday Knights");
  assert.deepEqual(payload.questIds, ["finish-any-game"]);
  assert.equal(payload.inviteKey, "friday-123");
  assert.equal("hostUserId" in payload, false);
  assert.equal("userId" in payload, false);
  assert.equal("username" in payload, false);
});

test("multiplayer creator rejects malformed fields", () => {
  const base = { name: "Quest", inviteCopy: "", inviteMode: "public", questIds: ["finish-any-game"], providerMode: "both", startAt: "2026-07-12T12:00:00.000Z", endAt: "2026-07-19T12:00:00.000Z", rules: {} };
  assert.throws(() => buildMultiplayerCreatePayload({ ...base, questIds: [] }), /at least one/i);
  assert.throws(() => buildMultiplayerCreatePayload({ ...base, endAt: "2026-07-01T12:00:00.000Z" }), /after/i);
  assert.throws(() => buildMultiplayerCreatePayload({ ...base, inviteMode: "private-key", inviteKey: "" }), /invite code/i);
});

test("multiplayer datetime defaults derive from one stable server timestamp", () => {
  const defaults = getMultiplayerLocalDateTimeDefaults("2026-07-12T23:58:42.000Z");
  assert.equal(defaults.startAt.length, 16);
  assert.equal(defaults.endAt.length, 16);
  assert.equal(new Date(defaults.endAt).getTime() - new Date(defaults.startAt).getTime(), 7 * 24 * 60 * 60 * 1000);
  assert.equal(defaults.startAt.endsWith(":58"), true);
});

test("multiplayer success accepts only exact created-detail navigation", () => {
  assert.equal(getMultiplayerCreateDestination({ ok: true, id: "gq-safe", href: "/groupquests/gq-safe?accepted=1" }), "/groupquests/gq-safe?accepted=1");
  assert.equal(getMultiplayerCreateDestination({ ok: true, id: "gq-safe", href: "/groupquests/other" }), null);
  assert.equal(getMultiplayerCreateDestination({ ok: true, id: "gq-safe", href: "https://evil.test/groupquests/gq-safe" }), null);
});

test("server failures expose safe messages and signed-out guidance", () => {
  assert.equal(getCreateErrorMessage(401, { error: "sign_in_required" }), "Sign in to create a Side Quest.");
  assert.equal(getCreateErrorMessage(500, { error: "database password leaked" }), "Could not create this Side Quest right now. Please try again.");
  assert.equal(getCreateErrorMessage(400, { message: "Add at least one saved condition before saving." }), "Add at least one saved condition before saving.");
});

test("mobile create screens use executable forms and never submit identity fields", async () => {
  const [shell, customForm, multiplayerForm, css] = await Promise.all([
    source("src/components/mobile-app-web-shell.tsx"),
    source("src/components/mobile-custom-create-form.tsx"),
    source("src/components/mobile-multiplayer-create-form.tsx"),
    source("src/app/mobile-web.css"),
  ]);
  assert.match(shell, /MobileCustomCreateForm/);
  assert.match(shell, /MobileMultiplayerCreateForm/);
  assert.match(customForm, /fetch\("\/api\/mobile\/custom-quests"/);
  assert.match(customForm, /Add Another Condition/);
  assert.match(customForm, /Complete any one condition/);
  assert.match(customForm, /Duplicate/);
  assert.match(customForm, /Delete/);
  assert.match(multiplayerForm, /fetch\("\/api\/groupquests"/);
  assert.doesNotMatch(`${customForm}\n${multiplayerForm}`, /hostUserId|ownerId|userId\s*:/);
  assert.doesNotMatch(shell, /<input readOnly value="" placeholder="Name this custom Side Quest"/);
  assert.doesNotMatch(shell, /<Link href="\/multiplayer" className="sqc-create-footer-button">Create<\/Link>/);
  assert.match(css, /\.sqc-template-card\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0, 1fr\)/);
  assert.match(css, /\.sqc-custom-condition-row \.sqc-detail-quiet-button\s*\{[\s\S]*?background:\s*rgba\(255, 247, 232, \.06\)/);
  assert.match(css, /\.sqc-custom-builder-card select\s*\{[\s\S]*?background:\s*rgba\(13, 11, 14, \.92\)[\s\S]*?color:\s*var\(--paper\)/);
  assert.match(css, /\.sqc-mobile-web\.signed-out \.sqc-local-custom-draft-row \.sqc-row-status\s*\{[\s\S]*?color:\s*var\(--gold\)/);
});
