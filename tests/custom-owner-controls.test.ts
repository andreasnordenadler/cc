import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import CustomSideQuestOwnerControls from "../src/components/custom-side-quest-owner-controls";
import * as customOwnerControls from "../src/lib/custom-owner-controls";
import {
  buildCustomOwnerSavePayload,
  getCustomOwnerDestination,
  type CustomOwnerSaveInput,
} from "../src/lib/custom-owner-controls";

const root = new URL("../", import.meta.url);
const source = (path: string) => readFile(new URL(path, root), "utf8");

const quest = {
  id: "custom-safe-1",
  title: "  Queenless sprint  ",
  summary: "  Trade queens, then win.  ",
  config: JSON.stringify({ version: 2, logic: "all", blocks: [{ type: "gameResult", result: "win" }] }),
  visibility: "public" as const,
  lifecycle: "published" as const,
};

test("owner save preserves the selected quest identity and rule config", () => {
  assert.deepEqual(buildCustomOwnerSavePayload(quest), {
    id: "custom-safe-1",
    title: "Queenless sprint",
    summary: "Trade queens, then win.",
    config: quest.config,
    visibility: "public",
    lifecycle: "published",
  });
});

test("owner save keeps drafts and archives private", () => {
  assert.equal(buildCustomOwnerSavePayload({ ...quest, lifecycle: "draft", visibility: "public" }).visibility, "private");
  assert.equal(buildCustomOwnerSavePayload({ ...quest, lifecycle: "archived", visibility: "public" }).visibility, "private");
});

test("owner save rejects unsafe quest identity and invalid rule config", () => {
  assert.throws(() => buildCustomOwnerSavePayload({ ...quest, id: "../escape" }), /unknown/i);
  assert.throws(() => buildCustomOwnerSavePayload({ ...quest, config: "not json" }), /rules/i);
});

test("owner mutations only navigate to the exact owned detail", () => {
  assert.equal(getCustomOwnerDestination({ ok: true, customQuest: { id: "custom-safe-1" } }, "custom-safe-1"), "/custom-side-quests/custom-safe-1");
  assert.equal(getCustomOwnerDestination({ ok: true, customQuest: { id: "custom-other" } }, "custom-safe-1"), null);
});

test("Multiplayer eligibility uses the persisted owner quest lifecycle", () => {
  const getHref = (customOwnerControls as unknown as {
    getCustomOwnerMultiplayerHref?: (input: CustomOwnerSaveInput) => string | null;
  }).getCustomOwnerMultiplayerHref;
  assert.equal(typeof getHref, "function");
  assert.equal(getHref?.(quest), "/create-multiplayer-side-quest?quest=custom-safe-1");
  assert.equal(getHref?.({ ...quest, lifecycle: "draft" }), null);
  assert.equal(getHref?.({ ...quest, lifecycle: "archived" }), null);
});

test("only published owned quests can be used in Multiplayer", () => {
  const published = renderToStaticMarkup(React.createElement(CustomSideQuestOwnerControls, { quest }));
  assert.match(published, /href="\/create-multiplayer-side-quest\?quest=custom-safe-1"[^>]*>Use in Multiplayer<\/a>/);

  for (const lifecycle of ["draft", "archived"] as const) {
    const unavailable = renderToStaticMarkup(React.createElement(CustomSideQuestOwnerControls, {
      quest: { ...quest, lifecycle },
    }));
    assert.doesNotMatch(unavailable, /Use in Multiplayer/);
  }
});

test("custom library and route wire each saved quest to an owner detail surface", async () => {
  const [library, route, controls, proofControls, editorRoute] = await Promise.all([
    source("src/app/custom-side-quests/page.tsx"),
    source("src/app/custom-side-quests/[id]/page.tsx"),
    source("src/components/custom-side-quest-owner-controls.tsx"),
    source("src/components/custom-side-quest-proof-controls.tsx"),
    source("src/app/create-custom-side-quest/page.tsx"),
  ]);
  assert.match(library, /\/custom-side-quests\/\$\{encodeURIComponent\(quest\.id\)\}/);
  assert.match(route, /getCustomSideQuestById/);
  assert.match(route, /CustomSideQuestOwnerControls/);
  assert.match(route, /CustomSideQuestProofControls/);
  assert.match(controls, /Archive/);
  assert.match(controls, /Duplicate/);
  assert.match(controls, /Delete/);
  assert.match(controls, /Visibility/);
  assert.match(controls, /\/create-custom-side-quest\?edit=/);
  assert.match(editorRoute, /getCustomSideQuestById/);
  assert.match(editorRoute, /initialQuest=\{editQuest\}/);
  assert.match(proofControls, /run\("start"\)/);
  assert.match(proofControls, /run\("check"\)/);
  assert.match(proofControls, /run\("deactivate"\)/);
});
