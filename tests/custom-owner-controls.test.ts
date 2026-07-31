import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import CustomSideQuestOwnerControls from "../src/components/custom-side-quest-owner-controls";
import * as customOwnerControls from "../src/lib/custom-owner-controls";
import {
  buildCustomOwnerDuplicatePayload,
  buildCustomOwnerSavePayload,
  duplicateCustomOwnerQuest,
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

test("owner duplicate matches Android v339 exact persisted-copy semantics", () => {
  assert.deepEqual(buildCustomOwnerDuplicatePayload({ ...quest, lifecycle: "archived" }), {
    title: "  Queenless sprint   Copy",
    summary: "  Trade queens, then win.  ",
    config: quest.config,
    visibility: "public",
    lifecycle: "published",
  });

  for (const lifecycle of ["draft", "published", "archived"] as const) {
    assert.equal(buildCustomOwnerDuplicatePayload({ ...quest, lifecycle, visibility: "private" }).visibility, "private");
    assert.equal(buildCustomOwnerDuplicatePayload({ ...quest, lifecycle, visibility: "public" }).visibility, "public");
  }
});

test("owner duplicate request ignores unsaved form values and sends the exact persisted quest", async () => {
  let capturedUrl = "";
  let capturedInit: RequestInit | undefined;
  const destination = await duplicateCustomOwnerQuest({ ...quest, lifecycle: "draft" }, async (url: string | URL | Request, init?: RequestInit) => {
    capturedUrl = String(url);
    capturedInit = init;
    return Response.json({ ok: true, customQuest: { id: "custom-copy-1" } });
  });

  assert.equal(capturedUrl, "/api/mobile/custom-quests");
  assert.equal(capturedInit?.method, "POST");
  assert.deepEqual(JSON.parse(String(capturedInit?.body)), {
    title: "  Queenless sprint   Copy",
    summary: "  Trade queens, then win.  ",
    config: quest.config,
    visibility: "public",
    lifecycle: "published",
  });
  assert.equal(destination, "/custom-side-quests/custom-copy-1");
});

test("owner duplicate fails closed for unsafe or unsuccessful responses", async () => {
  const cases: Array<() => Promise<Response>> = [
    async () => Response.json({ ok: true, customQuest: { id: "custom-copy-1" } }, { status: 500 }),
    async () => Response.json({ ok: false, customQuest: { id: "custom-copy-1" } }),
    async () => new Response("not json", { status: 200 }),
    async () => Response.json({ ok: true, customQuest: { id: "../escape" } }),
    async () => Response.json({ ok: true, customQuest: { id: quest.id } }),
  ];

  for (const request of cases) {
    assert.equal(await duplicateCustomOwnerQuest(quest, request), null);
  }
});

test("owner duplicate action uses the persisted quest instead of unsaved form state", async () => {
  const controls = await source("src/components/custom-side-quest-owner-controls.tsx");

  assert.match(controls, /duplicateCustomOwnerQuest\(quest\)/);
  assert.doesNotMatch(controls, /title: `\$\{title\} Copy`/);
});

test("owner delete confirmation matches Android v339 active and inactive consequences", () => {
  const getConfirmation = (customOwnerControls as unknown as {
    getCustomOwnerDeleteConfirmation?: (active: boolean) => string;
  }).getCustomOwnerDeleteConfirmation;

  assert.equal(typeof getConfirmation, "function");
  assert.equal(getConfirmation?.(true), "This will remove it from My Custom Side Quests and clear it as your active Side Quest.");
  assert.equal(getConfirmation?.(false), "This removes it from My Custom Side Quests. Existing Multiplayer Side Quests keep the version they already saved.");
});

test("owner delete control receives active state and exposes Android v339 library wording", async () => {
  const [controls, route] = await Promise.all([
    source("src/components/custom-side-quest-owner-controls.tsx"),
    source("src/app/custom-side-quests/[id]/page.tsx"),
  ]);
  const markup = renderToStaticMarkup(React.createElement(CustomSideQuestOwnerControls, { quest, active: true }));

  assert.match(markup, />Delete from library<\/button>/);
  assert.match(controls, /getCustomOwnerDeleteConfirmation\(active\)/);
  assert.match(controls, /deleteCustomOwnerQuest\(quest\.id\)/);
  assert.match(route, /<CustomSideQuestOwnerControls[\s\S]*active=\{active\}/);
});

test("owner delete request targets the exact persisted quest and returns the library destination", async () => {
  const deleteQuest = (customOwnerControls as unknown as {
    deleteCustomOwnerQuest?: (id: string, request?: typeof fetch) => Promise<string | null>;
  }).deleteCustomOwnerQuest;
  let capturedUrl = "";
  let capturedInit: RequestInit | undefined;

  assert.equal(typeof deleteQuest, "function");
  const destination = await deleteQuest?.(quest.id, async (url: string | URL | Request, init?: RequestInit) => {
    capturedUrl = String(url);
    capturedInit = init;
    return Response.json({ ok: true, action: "delete" });
  });

  assert.equal(capturedUrl, "/api/mobile/custom-quests?id=custom-safe-1");
  assert.equal(capturedInit?.method, "DELETE");
  assert.equal(destination, "/custom-side-quests");
});

test("owner delete fails closed without a confirmed Android-compatible delete response", async () => {
  const deleteQuest = (customOwnerControls as unknown as {
    deleteCustomOwnerQuest: (id: string, request?: typeof fetch) => Promise<string | null>;
  }).deleteCustomOwnerQuest;
  const cases: Array<() => Promise<Response>> = [
    async () => Response.json({ ok: true, action: "delete" }, { status: 500 }),
    async () => Response.json({ ok: false, action: "delete" }),
    async () => Response.json({ ok: true, action: "save" }),
    async () => new Response("not json"),
  ];

  assert.equal(await deleteQuest("../escape", async () => Response.json({ ok: true, action: "delete" })), null);
  for (const request of cases) assert.equal(await deleteQuest(quest.id, request), null);
});

test("owner save keeps drafts private but preserves archived visibility like Android v339", () => {
  assert.equal(buildCustomOwnerSavePayload({ ...quest, lifecycle: "draft", visibility: "public" }).visibility, "private");
  assert.equal(buildCustomOwnerSavePayload({ ...quest, lifecycle: "archived", visibility: "public" }).visibility, "public");
  assert.equal(buildCustomOwnerSavePayload({ ...quest, lifecycle: "archived", visibility: "private" }).visibility, "private");
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

test("owner Archive action preserves the selected visibility", async () => {
  const controls = await source("src/components/custom-side-quest-owner-controls.tsx");

  assert.match(controls, /save\(undefined, \{ lifecycle: "archived", visibility \}\)[\s\S]*>Archive<\/button>/);
  assert.doesNotMatch(controls, /lifecycle: "archived", visibility: "private"/);
});

test("draft and archived owner details expose Android v339's direct Publish action", async () => {
  for (const lifecycle of ["draft", "archived"] as const) {
    const markup = renderToStaticMarkup(React.createElement(CustomSideQuestOwnerControls, {
      quest: { ...quest, lifecycle, visibility: "private" },
    }));
    assert.match(markup, />Publish<\/button>/);
  }

  const published = renderToStaticMarkup(React.createElement(CustomSideQuestOwnerControls, { quest }));
  assert.doesNotMatch(published, />Publish<\/button>/);

  const controls = await source("src/components/custom-side-quest-owner-controls.tsx");
  assert.match(controls, /save\(undefined, \{ lifecycle: "published", visibility \}\)/);
  assert.doesNotMatch(controls, /setLifecycle\("published"\)/);
});

test("published public owner detail keeps Android's direct share and copy actions", async () => {
  const route = await source("src/app/custom-side-quests/[id]/page.tsx");

  assert.match(route, /import CommunitySoloShareControls from "@\/components\/community-solo-share-controls"/);
  assert.match(route, /quest\.visibility === "public" && quest\.lifecycle === "published"[\s\S]*<CommunitySoloShareControls id=\{quest\.id\} title=\{quest\.title\} \/>/);
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
