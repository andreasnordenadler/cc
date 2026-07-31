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
  getCustomOwnerDuplicateSuccessMessage,
  getCustomOwnerDestination,
  getCustomOwnerStateReloadDestination,
  saveCustomOwnerState,
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

test("owner state mutation sends persisted quest copy with only Android v339 state overrides", async () => {
  let capturedInit: RequestInit | undefined;
  const destination = await saveCustomOwnerState(
    quest,
    { lifecycle: "archived", visibility: "private" },
    async (_url: string | URL | Request, init?: RequestInit) => {
      capturedInit = init;
      return Response.json({ ok: true, customQuest: { id: quest.id } });
    },
  );

  assert.deepEqual(JSON.parse(String(capturedInit?.body)), {
    id: quest.id,
    title: "Queenless sprint",
    summary: "Trade queens, then win.",
    config: quest.config,
    lifecycle: "archived",
    visibility: "private",
  });
  assert.equal(destination, `/custom-side-quests/${quest.id}`);
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

test("owner duplicate success stays on the original detail and acknowledges the Android v339 result", async () => {
  const controls = await source("src/components/custom-side-quest-owner-controls.tsx");

  assert.equal(
    getCustomOwnerDuplicateSuccessMessage("Knight watch"),
    "Knight watch Copy is now in My Custom Side Quests.",
  );
  assert.match(controls, /setMessage\(getCustomOwnerDuplicateSuccessMessage\(quest\.title\)\)/);
  assert.match(controls, /async function duplicate[\s\S]*?setMessageIsError\(false\)[\s\S]*?async function remove/);
  assert.doesNotMatch(controls, /async function duplicate[\s\S]*?window\.location\.assign\(destination\)[\s\S]*?async function remove/);
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

test("owner state action wiring cannot submit unsaved editor copy", async () => {
  const controls = await source("src/components/custom-side-quest-owner-controls.tsx");

  assert.match(controls, /saveCustomOwnerState\(quest, next\)/);
  assert.match(controls, /runStateMutation\(\{ lifecycle: "published", visibility: persistedVisibility \}\)/);
  assert.match(controls, /runStateMutation\(\{ lifecycle: "published", visibility: persistedVisibility === "public" \? "private" : "public" \}\)/);
  assert.match(controls, /runStateMutation\(\{ lifecycle: "archived", visibility: persistedVisibility \}\)/);
  assert.doesNotMatch(controls, /save\(undefined, \{ lifecycle:/);
});

test("later owner failures reset a prior direct-state success to an alert", async () => {
  const controls = await source("src/components/custom-side-quest-owner-controls.tsx");

  assert.match(controls, /async function save[\s\S]*?setMessageIsError\(true\)[\s\S]*?async function runStateMutation/);
  assert.match(controls, /async function duplicate[\s\S]*?setMessageIsError\(true\)[\s\S]*?async function remove/);
  assert.match(controls, /async function remove[\s\S]*?setMessageIsError\(true\)[\s\S]*?return <form/);
});

test("direct owner state success reloads the exact detail so every state surface matches Android v339", async () => {
  const getMessage = (customOwnerControls as unknown as {
    getCustomOwnerStateSavedMessage?: (
      name: string,
      next: Pick<CustomOwnerSaveInput, "lifecycle" | "visibility">,
    ) => string;
  }).getCustomOwnerStateSavedMessage;
  const [controls, route] = await Promise.all([
    source("src/components/custom-side-quest-owner-controls.tsx"),
    source("src/app/custom-side-quests/[id]/page.tsx"),
  ]);

  assert.equal(typeof getMessage, "function");
  assert.equal(getMessage?.("Knight watch", { lifecycle: "archived", visibility: "public" }), "Knight watch is archived and no longer playable.");
  assert.equal(getMessage?.("Knight watch", { lifecycle: "published", visibility: "public" }), "Knight watch is public/shareable. Other players may see its title, goal, and Coat of Arms when it is shared.");
  assert.equal(getMessage?.("Knight watch", { lifecycle: "published", visibility: "private" }), "Knight watch is private. Only you can manage it, but you can still use it in Multiplayer Side Quests you host.");
  assert.equal(getCustomOwnerStateReloadDestination("/custom-side-quests/custom-safe-1", { lifecycle: "archived", visibility: "public" }), "/custom-side-quests/custom-safe-1?state-saved=archived-public");
  assert.equal(getCustomOwnerStateReloadDestination("/custom-side-quests/../escape", { lifecycle: "archived", visibility: "public" }), null);
  assert.match(controls, /getCustomOwnerStateReloadDestination\(destination, next\)/);
  assert.match(controls, /window\.location\.assign\(reloadDestination\)/);
  assert.match(route, /const questLifecycle = quest\.lifecycle \?\? "published"/);
  assert.match(route, /const questVisibility = quest\.visibility \?\? "private"/);
  assert.match(route, /query\["state-saved"\] === `\$\{questLifecycle\}-\$\{questVisibility\}`/);
  assert.match(route, /getCustomOwnerStateSavedMessage\(quest\.title, \{ lifecycle: questLifecycle, visibility: questVisibility \}\)/);
  assert.match(controls, /setMessageIsError\(false\)/);
  assert.match(controls, /className=\{messageIsError \? "groupquest-join-error" : "sqc-action-success"\}/);
  assert.match(controls, /role=\{messageIsError \? "alert" : "status"\}/);
});

test("owner Archive action preserves the persisted visibility", async () => {
  const controls = await source("src/components/custom-side-quest-owner-controls.tsx");

  assert.match(controls, /runStateMutation\(\{ lifecycle: "archived", visibility: persistedVisibility \}\)[\s\S]*"Archive"/);
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
  assert.match(controls, /runStateMutation\(\{ lifecycle: "published", visibility: persistedVisibility \}\)/);
  assert.doesNotMatch(controls, /setLifecycle\("published"\)/);
});

test("published owner detail exposes Android v339's direct visibility mutation", async () => {
  const privateMarkup = renderToStaticMarkup(React.createElement(CustomSideQuestOwnerControls, {
    quest: { ...quest, visibility: "private" },
  }));
  assert.match(privateMarkup, />Make public \/ shareable<\/button>/);

  const publicMarkup = renderToStaticMarkup(React.createElement(CustomSideQuestOwnerControls, { quest }));
  assert.match(publicMarkup, />Make private again<\/button>/);

  const draftMarkup = renderToStaticMarkup(React.createElement(CustomSideQuestOwnerControls, {
    quest: { ...quest, lifecycle: "draft" },
  }));
  assert.doesNotMatch(draftMarkup, /Make public \/ shareable|Make private again/);

  const controls = await source("src/components/custom-side-quest-owner-controls.tsx");
  assert.match(controls, /persistedLifecycle === "published"/);
  assert.match(controls, /runStateMutation\(\{ lifecycle: "published", visibility: persistedVisibility === "public" \? "private" : "public" \}\)/);
  assert.doesNotMatch(controls, /setVisibility\(quest\.visibility === "public" \? "private" : "public"\)/);
});

test("published public owner detail keeps Android's direct share and copy actions", async () => {
  const route = await source("src/app/custom-side-quests/[id]/page.tsx");

  assert.match(route, /import CommunitySoloShareControls from "@\/components\/community-solo-share-controls"/);
  assert.match(route, /quest\.visibility === "public" && quest\.lifecycle === "published"[\s\S]*<CommunitySoloShareControls id=\{quest\.id\} title=\{quest\.title\} \/>/);
});

test("completed owner detail overlays the Android v339 completion seal on the saved Coat of Arms", async () => {
  const [route, css] = await Promise.all([
    source("src/app/custom-side-quests/[id]/page.tsx"),
    source("src/app/mobile-web.css"),
  ]);

  assert.match(route, /className="sqc-custom-detail-coat-frame"[\s\S]*className="sqc-custom-detail-coat-image"[^>]*width=\{108\} height=\{118\}/);
  assert.match(route, /completionState\.completed \? <Image className="sqc-custom-detail-completion-seal" alt="" src="\/mobile-source\/stamps\/quest-complete-red-wax-sqc-v3\.png" width=\{44\} height=\{44\} priority \/> : null/);
  assert.equal(route.match(/quest-complete-red-wax-sqc-v3\.png/g)?.length, 1);
  assert.match(css, /\.sqc-custom-detail-coat-frame \{[\s\S]*?width: 124px;[\s\S]*?height: 136px;[\s\S]*?overflow: visible;[\s\S]*?\}/);
  assert.match(css, /\.sqc-custom-detail-coat-image \{[\s\S]*?width: 108px;[\s\S]*?height: 118px;[\s\S]*?\}/);
  assert.match(css, /\.sqc-custom-detail-completion-seal \{[\s\S]*?right: 6px;[\s\S]*?bottom: 4px;[\s\S]*?width: 44px;[\s\S]*?height: 44px;[\s\S]*?\}/);
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
