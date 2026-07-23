import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MobileCreateCustomScreen, MobileCustomSideQuestsScreen } from "../src/components/mobile-app-web-shell";
import MobileCustomCreateForm from "../src/components/mobile-custom-create-form";
import MobileMultiplayerCreateForm from "../src/components/mobile-multiplayer-create-form";
import { LocalCustomDraftList } from "../src/components/local-custom-draft-library";
import type { CustomSideQuestRuleBlock } from "../src/lib/custom-side-quests";
import {
  buildCustomCreatePayload,
  buildCustomEditConfig,
  buildMultiplayerCreatePayload,
  appendCustomConditionEditorRow,
  deleteCustomConditionEditorRow,
  describeCustomRuleBlock,
  duplicateCustomConditionEditorRow,
  getCreateErrorMessage,
  getCustomCreateDestination,
  getCustomEditFormState,
  getCustomBuilderSnapshot,
  hasUnsavedCustomBuilderChanges,
  getCustomConditionRowKey,
  getCustomMoveSequenceEditorState,
  getCustomRuleBlockChoiceId,
  getCustomTemplateBlocks,
  getCustomTemplateState,
  setCustomRuleBlockNegated,
  updateCustomMoveSequenceEditor,
  updateCustomMoveSequenceBlock,
  updateCustomOpeningSequenceBlock,
  updateCustomPieceStateEditor,
  updateCustomPieceIdentityChoice,
  updateCustomPieceStateBlock,
  finalizeCustomOpeningSequenceInput,
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

test("custom builder detects unsaved changes without treating its loaded state as dirty", () => {
  const loaded = getCustomBuilderSnapshot({
    title: "No Castle Night",
    summary: "Win without castling.",
    logic: "all",
    blocks: getCustomTemplateBlocks("win"),
    visibility: "private",
    lifecycle: "draft",
  });

  assert.equal(hasUnsavedCustomBuilderChanges(loaded, {
    title: "No Castle Night",
    summary: "Win without castling.",
    logic: "all",
    blocks: getCustomTemplateBlocks("win"),
    visibility: "private",
    lifecycle: "draft",
  }), false);
  assert.equal(hasUnsavedCustomBuilderChanges(loaded, {
    title: "No Castle Night renamed",
    summary: "Win without castling.",
    logic: "all",
    blocks: getCustomTemplateBlocks("win"),
    visibility: "private",
    lifecycle: "draft",
  }), true);
  assert.equal(hasUnsavedCustomBuilderChanges(loaded, {
    title: "No Castle Night",
    summary: "Win without castling.",
    logic: "any",
    blocks: getCustomTemplateBlocks("win"),
    visibility: "private",
    lifecycle: "draft",
  }), true);
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

test("custom creator can mark any Android-compatible condition as something that must not happen", () => {
  const conditions: CustomSideQuestRuleBlock[] = [
    { type: "gameResult", result: "win" },
    { type: "moveSequence", sequence: "e4 e5" },
    { type: "openingSequence", raw: "e4 e5", moves: ["e4", "e5"], anchor: "gameStart" },
    { type: "pieceState", piece: "rook", owner: "my", condition: "on square", targetSquare: "e4", timing: { atGameEnd: true } },
  ];

  const negated = conditions.map((condition) => setCustomRuleBlockNegated(condition, true));
  assert.equal(negated.every((condition) => condition.negate === true), true);
  assert.deepEqual(conditions, [
    { type: "gameResult", result: "win" },
    { type: "moveSequence", sequence: "e4 e5" },
    { type: "openingSequence", raw: "e4 e5", moves: ["e4", "e5"], anchor: "gameStart" },
    { type: "pieceState", piece: "rook", owner: "my", condition: "on square", targetSquare: "e4", timing: { atGameEnd: true } },
  ]);
  assert.deepEqual(negated.map((condition) => setCustomRuleBlockNegated(condition, false)), conditions);
});

test("piece selector summaries match Android quantity and starting-piece semantics", () => {
  assert.equal(describeCustomRuleBlock({
    type: "pieceState",
    piece: "rook",
    owner: "my",
    selector: { quantifier: "all", count: 2, maxAvailable: 2, identity: "any" },
    condition: "gone",
    timing: { atGameEnd: true },
  }), "Both of your rooks must be gone at game end.");
  assert.equal(describeCustomRuleBlock({
    type: "pieceState",
    piece: "pawn",
    owner: "opponent",
    selector: { quantifier: "exactly", count: 3, maxAvailable: 8, identity: "any" },
    condition: "moved",
    timing: { byMove: 20 },
    negate: true,
  }), "It must not be true that exactly 3 of your opponent's pawns must be moved by move 20.");
  assert.equal(describeCustomRuleBlock({
    type: "pieceState",
    piece: "knight",
    owner: "my",
    selector: { quantifier: "any one", count: 1, maxAvailable: 2, identity: "queenside" },
    condition: "on square",
    targetSquare: "c3",
    timing: { atMove: 12 },
  }), "Your queenside knight must be on square c3 at move 12.");
});

test("piece identity choices preserve Android's either, both, and specific-piece semantics", () => {
  const rook = {
    type: "pieceState" as const,
    piece: "rook" as const,
    owner: "my" as const,
    selector: { quantifier: "any one" as const, count: 1, maxAvailable: 2, identity: "any" },
    condition: "moved" as const,
    timing: { atGameEnd: true as const },
  };

  assert.deepEqual(updateCustomPieceIdentityChoice(rook, "all"), {
    ...rook,
    selector: { quantifier: "all", count: 2, maxAvailable: 2, identity: "any" },
  });
  assert.deepEqual(updateCustomPieceIdentityChoice(rook, "queenside"), {
    ...rook,
    selector: { quantifier: "any one", count: 1, maxAvailable: 2, identity: "queenside" },
  });
});

test("piece-state editor resets an all-pieces selector when switching to a single king", () => {
  const rook = {
    type: "pieceState" as const,
    piece: "rook" as const,
    owner: "my" as const,
    selector: { quantifier: "all" as const, count: 2, maxAvailable: 2, identity: "any" },
    condition: "moved" as const,
    timing: { atGameEnd: true as const },
  };

  assert.deepEqual(updateCustomPieceStateBlock(rook, { piece: "king" }).selector, {
    quantifier: "any one",
    count: 1,
    maxAvailable: 1,
    identity: "original",
  });
});

test("custom builder shows Android's completion Coat of Arms preview", () => {
  const html = renderToStaticMarkup(React.createElement(MobileCustomCreateForm, { signedIn: true }));

  assert.match(html, /class="sqc-custom-coat-preview"/);
  assert.match(html, /community-coat-01\.png/);
  assert.match(html, /Side Quest Coat of Arms/);
  assert.match(html, /players unlock when this Side Quest is completed/);
});

test("piece-state editor renders Android's identity choices for a saved rook condition", () => {
  const html = renderToStaticMarkup(React.createElement(MobileCustomCreateForm, {
    signedIn: true,
    initialQuest: {
      id: "custom-rook-identity",
      title: "Choose the rook",
      summary: "",
      config: JSON.stringify({
        version: 2,
        logic: "all",
        blocks: [{
          type: "pieceState",
          piece: "rook",
          owner: "my",
          selector: { quantifier: "any one", count: 1, maxAvailable: 2, identity: "any" },
          condition: "moved",
          timing: { atGameEnd: true },
        }],
      }),
      visibility: "private",
      lifecycle: "draft",
    },
  }));

  assert.match(html, /Which rook/);
  assert.match(html, /Either rook/);
  assert.match(html, /Both rooks/);
  assert.match(html, /Queenside rook/);
  assert.match(html, /Kingside rook/);
});

test("negation keeps preset and move-sequence conditions editable without collapsing richer piece rules", () => {
  assert.equal(getCustomRuleBlockChoiceId({ type: "gameResult", result: "win", negate: true }), "win");
  assert.equal(getCustomRuleBlockChoiceId({ type: "pieceState", piece: "king", owner: "my", condition: "not moved", timing: { atGameEnd: true }, negate: true }), "king-still");
  assert.equal(getCustomRuleBlockChoiceId({ type: "moveSequence", sequence: "e4 e5", negate: true }), "move-sequence");
  assert.equal(getCustomRuleBlockChoiceId({
    type: "pieceState",
    piece: "queen",
    owner: "my",
    selector: { quantifier: "all", count: 1 },
    condition: "gone",
    timing: { atGameEnd: true },
    negate: true,
  }), "piece-state");
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

test("custom templates carry Android v338 names and exact single-condition state", () => {
  assert.deepEqual([
    getCustomTemplateState("win"),
    getCustomTemplateState("draw"),
    getCustomTemplateState("queen-adventure"),
    getCustomTemplateState("knight-dare"),
  ], [{
    title: "Win the game",
    blocks: [{ type: "gameResult", result: "win" }],
  }, {
    title: "Draw the game",
    blocks: [{ type: "gameResult", result: "draw" }],
  }, {
    title: "Queen adventure",
    blocks: [{ type: "pieceState", piece: "queen", owner: "my", selector: { quantifier: "any one", count: 1, maxAvailable: 1, identity: "original" }, condition: "moved", targetSquare: null, timing: { byMove: 15 } }],
  }, {
    title: "Knight dare",
    blocks: [{ type: "pieceState", piece: "knight", owner: "my", selector: { quantifier: "any one", count: 1, maxAvailable: 2, identity: "any" }, condition: "moved", targetSquare: null, timing: { byMove: 15 } }],
  }]);
});

test("fresh custom builder starts with no conditions like Android v338", () => {
  const html = renderToStaticMarkup(React.createElement(MobileCustomCreateForm, { signedIn: true }));
  assert.match(html, /sqc-template-card/);
  for (const template of ["Win the game", "Draw the game", "Queen adventure", "Knight dare"]) assert.match(html, new RegExp(`<strong>${template}</strong>`));
  assert.doesNotMatch(html, /Knight-only opening|No-castle game|Queen trade challenge|Win a game/);
  assert.match(html, /How conditions count/);
  assert.match(html, /Complete every condition/);
  assert.match(html, /Complete any one condition/);
  assert.match(html, /Your conditions · 0\/6/);
  assert.match(html, /No conditions yet\. Add the first thing players must do\./);
  assert.match(html, />Add Condition<\/button>/);
  assert.doesNotMatch(html, /Duplicate|Delete|Condition 1 truth/);
});

test("custom builder exposes Android's true or must-not-happen control for each condition", () => {
  const html = renderToStaticMarkup(React.createElement(MobileCustomCreateForm, {
    signedIn: true,
    initialQuest: {
      id: "custom-two-conditions",
      title: "Two conditions",
      summary: "",
      config: JSON.stringify({ version: 2, logic: "all", blocks: [{ type: "gameResult", result: "win" }, { type: "gameResult", result: "draw" }] }),
      visibility: "private",
      lifecycle: "draft",
    },
  }));
  assert.equal((html.match(/Must happen/g) ?? []).length, 2);
  assert.equal((html.match(/Must not happen/g) ?? []).length, 2);
  assert.equal((html.match(/aria-label="Condition \d truth"/g) ?? []).length, 2);
  assert.match(html, /aria-pressed="true"[^>]*>Must happen/);
  assert.match(html, /aria-pressed="false"[^>]*>Must not happen/);
});

test("custom builder creates and edits Android-compatible move-sequence conditions", () => {
  assert.equal(getCustomConditionRowKey(0), "custom-condition-0");
  const original: CustomSideQuestRuleBlock = {
    type: "moveSequence",
    sequence: "e4 e5",
    timing: { atMove: 12 },
    negate: true,
  };

  assert.deepEqual(updateCustomMoveSequenceBlock(original, {
    sequence: "  e4   e5 Nf3?!  ",
    timing: "byMove",
    moveNumber: 18,
  }), {
    type: "moveSequence",
    sequence: "  e4   e5 Nf3?!  ",
    timing: { byMove: 18 },
    negate: true,
  });
  assert.equal(updateCustomMoveSequenceBlock(original, {
    sequence: "e4 ",
    timing: "atMove",
    moveNumber: 12,
  }).sequence, "e4 ");
  const saved = buildCustomCreatePayload({
    title: "Develop in order",
    summary: "",
    logic: "all",
    blocks: [updateCustomMoveSequenceBlock(original, {
      sequence: "  e4   e5 Nf3?!  ",
      timing: "byMove",
      moveNumber: 18,
    })],
    visibility: "private",
    lifecycle: "published",
  });
  assert.equal(JSON.parse(saved.config).blocks[0].sequence, "e4 e5 Nf3");
  const edited = JSON.parse(buildCustomEditConfig(
    JSON.stringify({ version: 7, logic: "any", customTopLevel: true, blocks: [original] }),
    "all",
    [updateCustomMoveSequenceBlock(original, {
      sequence: " e4   e5 ",
      timing: "atMove",
      moveNumber: 12,
    })],
  ));
  assert.equal(edited.blocks[0].sequence, "e4 e5");
  assert.equal(edited.customTopLevel, true);

  const html = renderToStaticMarkup(React.createElement(MobileCustomCreateForm, {
    signedIn: true,
    initialQuest: {
      id: "custom-move-sequence",
      title: "Develop in order",
      summary: "Play the sequence before move 18.",
      config: JSON.stringify({ version: 2, logic: "all", blocks: [original] }),
      visibility: "private",
      lifecycle: "published",
    },
  }));
  assert.match(html, /<option value="move-sequence" selected="">Move sequence<\/option>/);
  assert.match(html, /aria-label="Condition 1 move sequence"[^>]*>e4 e5<\/textarea>/);
  assert.match(html, /aria-label="Condition 1 timing"/);
  assert.match(html, /aria-label="Condition 1 move number"/);
});

test("custom opening-sequence editor matches Android PGN cleanup semantics", () => {
  const original: CustomSideQuestRuleBlock = {
    type: "openingSequence",
    raw: "1.e4 e5",
    moves: ["e4", "e5"],
    anchor: "gameStart",
    negate: true,
  };

  assert.deepEqual(updateCustomOpeningSequenceBlock(original, "1.e4 {King pawn} e5 2.Nf3?! Nc6 1-0"), {
    type: "openingSequence",
    raw: "1.e4 {King pawn} e5 2.Nf3?! Nc6 1-0",
    moves: ["e4", "e5", "Nf3", "Nc6"],
    anchor: "gameStart",
    negate: true,
  });
});

test("editing opening notation persists Android-parsed moves without dropping advanced fields", () => {
  const original = JSON.stringify({
    version: 7,
    logic: "all",
    customTopLevel: { mode: "legacy" },
    blocks: [{ type: "openingSequence", raw: "1.e4 e5", moves: ["e4", "e5"], anchor: "gameStart", negate: true }],
  });
  const editedBlock = {
    type: "openingSequence" as const,
    raw: "1.d4 {Queen pawn} d5 2.c4?!",
    moves: ["stale"],
    anchor: "gameStart" as const,
    negate: true,
  };

  assert.deepEqual(JSON.parse(buildCustomEditConfig(original, "any", [editedBlock])), {
    version: 7,
    logic: "any",
    customTopLevel: { mode: "legacy" },
    blocks: [{
      type: "openingSequence",
      raw: "d4 d5 c4",
      moves: ["d4", "d5", "c4"],
      anchor: "gameStart",
      negate: true,
    }],
  });
});

test("opening notation finalizes like Android when editing ends", () => {
  assert.equal(finalizeCustomOpeningSequenceInput("1.e4 {comment} e5 2.f4?!"), "e4 e5 f4");
  assert.equal(finalizeCustomOpeningSequenceInput(" 1-0 {done} "), "1.e4 e5 2.f4");
  assert.equal(finalizeCustomOpeningSequenceInput("x".repeat(300)).length, 240);
});

test("custom opening-sequence editor renders Android's editable notation and parsed preview", () => {
  const html = renderToStaticMarkup(React.createElement(MobileCustomCreateForm, {
    signedIn: true,
    initialQuest: {
      id: "custom-opening-sequence",
      title: "Gambit line",
      summary: "Follow the opening.",
      config: JSON.stringify({ version: 2, logic: "all", blocks: [{
        type: "openingSequence",
        raw: "1.e4 e5 2.f4",
        moves: ["e4", "e5", "f4"],
        anchor: "gameStart",
      }] }),
      visibility: "private",
      lifecycle: "published",
    },
  }));

  assert.match(html, /aria-label="Condition 1 opening sequence"[^>]*maxLength="260"[^>]*>1\.e4 e5 2\.f4<\/textarea>/);
  assert.match(html, /Paste opening notation with move numbers\. SQC cleans it into: e4 → e5 → f4/);
  assert.match(html, /Opening sequence is always checked from move 1, so no timing is needed\./);
});

test("custom opening-sequence editor rejects notation with no parsed moves", () => {
  assert.throws(() => buildCustomCreatePayload({
    title: "Empty opening",
    summary: "",
    logic: "all",
    blocks: [{ type: "openingSequence", raw: "1-0 {done}", moves: [], anchor: "gameStart" }],
    visibility: "private",
    lifecycle: "published",
  }), /opening line from move 1/i);
});

test("custom move-sequence editor rejects an empty condition like Android v338", () => {
  assert.throws(() => buildCustomCreatePayload({
    title: "Empty sequence",
    summary: "",
    logic: "all",
    blocks: [{ type: "moveSequence", sequence: " ?! ", timing: { atGameEnd: true } }],
    visibility: "private",
    lifecycle: "published",
  }), /algebraic move/i);
});

test("custom move-sequence move number can be cleared and retyped without losing the next value", () => {
  const original = {
    block: { type: "moveSequence" as const, sequence: "e4 e5", timing: { byMove: 18 } },
    moveNumberInput: "18",
  };
  const cleared = updateCustomMoveSequenceEditor(original, { moveNumberInput: "" });
  assert.equal(cleared.moveNumberInput, "");
  assert.deepEqual(cleared.block.timing, { byMove: 1 });

  const retyped = updateCustomMoveSequenceEditor(cleared, { moveNumberInput: "27" });
  assert.equal(retyped.moveNumberInput, "27");
  assert.deepEqual(retyped.block.timing, { byMove: 27 });
});

test("custom move-sequence timing keeps the last move number through the game-end choice", () => {
  const original = {
    block: { type: "moveSequence" as const, sequence: "e4 e5", timing: { atMove: 18 } },
    moveNumberInput: "18",
  };
  const atGameEnd = updateCustomMoveSequenceEditor(original, { timing: "atGameEnd" });
  assert.equal(atGameEnd.moveNumberInput, "18");
  assert.deepEqual(atGameEnd.block.timing, { atGameEnd: true });

  const restored = updateCustomMoveSequenceEditor(atGameEnd, { timing: "byMove" });
  assert.equal(restored.moveNumberInput, "18");
  assert.deepEqual(restored.block.timing, { byMove: 18 });
});

test("custom move-sequence editor matches Android when saved timing fields are ambiguous", () => {
  const state = getCustomMoveSequenceEditorState({
    type: "moveSequence",
    sequence: "e4 e5",
    timing: { byMove: 12, atMove: 18 },
  });
  assert.equal(state.moveNumberInput, "18");
  assert.deepEqual(updateCustomMoveSequenceEditor(state, {}).block.timing, { atMove: 18 });
});

test("custom condition rows enforce the six-condition limit from current state", () => {
  const row = { id: "row-1", block: { type: "gameResult" as const, result: "win" as const }, moveNumberInput: "" };
  const five = Array.from({ length: 5 }, (_, index) => ({ ...structuredClone(row), id: `row-${index + 1}` }));
  const six = appendCustomConditionEditorRow(five, row.block, "row-6");
  const stillSix = appendCustomConditionEditorRow(six, row.block, "row-7");
  assert.equal(six.length, 6);
  assert.equal(stillSix.length, 6);
});

test("custom condition duplicate and delete keep stable row identity aligned with move-number state", () => {
  const rows = [{
    id: "move-row",
    block: { type: "moveSequence" as const, sequence: "e4 e5", timing: { byMove: 27 } },
    moveNumberInput: "27",
  }, {
    id: "result-row",
    block: { type: "gameResult" as const, result: "win" as const },
    moveNumberInput: "",
  }];
  const duplicated = duplicateCustomConditionEditorRow(rows, 0, "duplicate-row");
  assert.equal(duplicated[0]?.id, "move-row");
  assert.equal(duplicated[1]?.id, "duplicate-row");
  assert.deepEqual(duplicated[1]?.block, rows[0]?.block);
  assert.notEqual(duplicated[1]?.block, rows[0]?.block);

  const deleted = deleteCustomConditionEditorRow(duplicated, 0);
  assert.equal(deleted[0]?.id, "duplicate-row");
  assert.equal(deleted[0]?.moveNumberInput, "27");
  assert.deepEqual(deleted[0]?.block, rows[0]?.block);
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
  assert.match(html, /<nav class="sqc-brand-tabs sqc-solo-brand-tabs" aria-label="Solo Side Quest catalog">/);
  assert.match(html, /class="sqc-brand-switch"[^>]*href="\/side-quests"/);
  assert.doesNotMatch(html, /role="(?:tablist|tab)"|aria-selected=/);
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

test("custom piece-state editor preserves Android piece, owner, condition, square, and timing semantics", () => {
  const original: CustomSideQuestRuleBlock = {
    type: "pieceState",
    piece: "rook",
    owner: "my",
    selector: { quantifier: "all", count: 2, maxAvailable: 2, identity: "any" },
    condition: "gone",
    timing: { atGameEnd: true },
    negate: true,
  };

  assert.deepEqual(updateCustomPieceStateBlock(original, {
    piece: "knight",
    owner: "opponent",
    condition: "on square",
    targetSquare: "F6",
    timing: "atMove",
    moveNumber: 23,
  }), {
    type: "pieceState",
    piece: "knight",
    owner: "opponent",
    selector: { quantifier: "all", count: 2, maxAvailable: 2, identity: "any" },
    condition: "on square",
    targetSquare: "f6",
    timing: { atMove: 23 },
    negate: true,
  });

  const html = renderToStaticMarkup(React.createElement(MobileCustomCreateForm, {
    signedIn: true,
    initialQuest: {
      id: "custom-piece-state",
      title: "Knight landing",
      summary: "Land both knights on the target square.",
      config: JSON.stringify({ version: 2, logic: "all", blocks: [original] }),
      visibility: "private",
      lifecycle: "published",
    },
  }));
  assert.match(html, /<option value="piece-state" selected="">Piece state<\/option>/);
  assert.match(html, /role="group" aria-label="Condition 1 piece"/);
  assert.match(html, /role="group" aria-label="Condition 1 owner"/);
  assert.match(html, /role="group" aria-label="Condition 1 piece condition"/);
  assert.match(html, /role="group" aria-label="Condition 1 timing"/);
  assert.match(html, /aria-pressed="true" class="sqc-option-card selected"[^>]*><span aria-hidden="true"><\/span><div class="sqc-option-card-copy"><strong>Rook<\/strong>/);
});

test("legacy either-owner piece rules stay lossless and fail closed outside Android's editor", () => {
  const original: CustomSideQuestRuleBlock = {
    type: "pieceState",
    piece: "rook",
    owner: "either",
    selector: { quantifier: "all", count: 2, maxAvailable: 2, identity: "any" },
    condition: "moved",
    timing: { byMove: 23 },
    negate: true,
  };
  assert.equal(getCustomRuleBlockChoiceId(original), "advanced");
  const cleared = updateCustomPieceStateEditor({ block: original, moveNumberInput: "23" }, { moveNumberInput: "" });
  assert.equal(cleared.moveNumberInput, "");
  const retyped = updateCustomPieceStateEditor(cleared, { moveNumberInput: "42" });
  assert.equal(retyped.moveNumberInput, "42");
  assert.deepEqual(retyped.block, {
    ...original,
    targetSquare: null,
    timing: { byMove: 42 },
  });

  const html = renderToStaticMarkup(React.createElement(MobileCustomCreateForm, {
    signedIn: true,
    initialQuest: {
      id: "custom-either-owner",
      title: "Either rook",
      summary: "Legacy rule",
      config: JSON.stringify({ version: 2, logic: "all", blocks: [original] }),
      visibility: "private",
      lifecycle: "draft",
    },
  }));
  assert.match(html, /<option value="advanced" selected="">Saved advanced condition<\/option>/);
  assert.doesNotMatch(html, /aria-label="Condition 1 owner"/);
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

test("multiplayer creator source switch exposes one truthful pressed-button group instead of an incomplete tablist", () => {
  const html = renderToStaticMarkup(React.createElement(MobileMultiplayerCreateForm, {
    signedIn: false,
    stableNow: "2026-07-23T12:00:00.000Z",
    quests: [
      { id: "official-one", title: "Official one", summary: "Official rules", source: "official", sourceLabel: "SQC official" },
      { id: "community-one", title: "Community one", summary: "Community rules", source: "community", sourceLabel: "Community" },
    ],
  }));

  assert.match(html, /role="group" aria-label="Choose Side Quest source"/);
  assert.match(html, /aria-pressed="true"[^>]*>Official \(1\)<\/button>/);
  assert.match(html, /aria-pressed="false"[^>]*>Community \(1\)<\/button>/);
  assert.doesNotMatch(html, /role="tablist"|role="tab"|aria-selected=/);
  assert.match(html, /<button[^>]*aria-label="Switch to Community Side Quests"/);
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

test("custom piece choices stack helper copy without overlapping labels at mobile width", async () => {
  const css = await source("src/app/mobile-web.css");

  assert.match(css, /\.sqc-create-custom-screen \.sqc-option-card-copy\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0, 1fr\)/);
  assert.match(css, /\.sqc-create-custom-screen \.sqc-option-card-copy > small\s*\{[\s\S]*?grid-column:\s*1/);
});
