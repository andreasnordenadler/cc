import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as createForm from "../src/components/mobile-multiplayer-create-form";
import MobileAppWebShell, { MobileCreateMultiplayerScreen } from "../src/components/mobile-app-web-shell";

const pristineDraft = {
  name: "",
  inviteCopy: "A Multiplayer Side Quest where everyone tries the same Side Quests with fresh public games.",
  inviteMode: "public",
  inviteKey: "",
  providerMode: "both",
  startAt: "2026-09-08T12:05",
  endAt: "2026-09-15T12:05",
  selected: ["finish-any-game", "win-a-game", "play-as-black"],
  timeControl: "Any time control",
  rated: "Any rated state",
  color: "Any color",
};

test("signed-out Multiplayer edits never arm draft protection", () => {
  const shouldProtectMultiplayerDraft = (createForm as Record<string, unknown>).shouldProtectMultiplayerDraft;
  assert.equal(typeof shouldProtectMultiplayerDraft, "function");
  assert.equal(
    (shouldProtectMultiplayerDraft as (input: { signedIn: boolean; hasChanges: boolean }) => boolean)({
      signedIn: false,
      hasChanges: true,
    }),
    false,
  );
});

test("reverting every Multiplayer field disarms draft protection", () => {
  const getMultiplayerDraftDirty = (createForm as Record<string, unknown>).getMultiplayerDraftDirty;
  assert.equal(typeof getMultiplayerDraftDirty, "function");
  assert.equal(
    (getMultiplayerDraftDirty as (initial: typeof pristineDraft, current: typeof pristineDraft) => boolean)(
      pristineDraft,
      { ...pristineDraft, selected: [...pristineDraft.selected] },
    ),
    false,
  );
});

test("pending Multiplayer creation disables draft controls until navigation settles", () => {
  const shouldDisableMultiplayerDraftControls = (createForm as Record<string, unknown>).shouldDisableMultiplayerDraftControls;
  assert.equal(typeof shouldDisableMultiplayerDraftControls, "function");
  const shouldDisable = shouldDisableMultiplayerDraftControls as (input: { hydrated: boolean; saving: boolean }) => boolean;
  assert.equal(shouldDisable({ hydrated: true, saving: true }), true);
  assert.equal(shouldDisable({ hydrated: true, saving: false }), false);
  assert.equal(shouldDisable({ hydrated: false, saving: false }), true);
});

test("each persisted Multiplayer field arms draft protection when it differs", () => {
  const getMultiplayerDraftDirty = (createForm as Record<string, unknown>).getMultiplayerDraftDirty as
    (initial: typeof pristineDraft, current: typeof pristineDraft) => boolean;
  const changedDrafts = [
    { ...pristineDraft, name: "Friday Knight Shift" },
    { ...pristineDraft, inviteCopy: "Bring your bravest rook." },
    { ...pristineDraft, inviteMode: "private-key" },
    { ...pristineDraft, inviteKey: "ROOK-42" },
    { ...pristineDraft, providerMode: "lichess" },
    { ...pristineDraft, startAt: "2026-09-08T13:05" },
    { ...pristineDraft, endAt: "2026-09-16T12:05" },
    { ...pristineDraft, selected: ["finish-any-game"] },
    { ...pristineDraft, timeControl: "Blitz" },
    { ...pristineDraft, rated: "Rated only" },
    { ...pristineDraft, color: "White only" },
  ];

  for (const changed of changedDrafts) assert.equal(getMultiplayerDraftDirty(pristineDraft, changed), true);
});

test("restored saved navigation starts a clean draft lifecycle", () => {
  const restoreMultiplayerDraftLifecycle = (createForm as Record<string, unknown>).restoreMultiplayerDraftLifecycle;
  assert.equal(typeof restoreMultiplayerDraftLifecycle, "function");
  const savedDraft = {
    ...pristineDraft,
    name: "Saved Friday Knight Shift",
    selected: [...pristineDraft.selected, "castle-by-hand"],
  };
  const restored = (restoreMultiplayerDraftLifecycle as (input: {
    reason: "saved" | "discarded" | "none";
    saving: boolean;
    current: typeof pristineDraft;
  }) => { reason: "none"; saving: false; baseline: typeof pristineDraft | null })({
    reason: "saved",
    saving: true,
    current: savedDraft,
  });

  assert.equal(restored.reason, "none");
  assert.deepEqual(restored.baseline, savedDraft);
  assert.notEqual(restored.baseline, savedDraft);
  assert.notEqual(restored.baseline?.selected, savedDraft.selected);
});

test("restored successful creation unlocks the Create action", () => {
  const restored = createForm.restoreMultiplayerDraftLifecycle({
    reason: "saved",
    saving: true,
    current: { ...pristineDraft, name: "Already created" },
  });

  assert.equal(restored.saving, false);
});

test("restored pending creation keeps draft controls locked", () => {
  const restored = createForm.restoreMultiplayerDraftLifecycle({
    reason: "none",
    saving: true,
    current: { ...pristineDraft, name: "Still creating" },
  });

  assert.equal(restored.saving, true);
});

test("restored unsaved navigation keeps the original draft baseline", () => {
  const restored = createForm.restoreMultiplayerDraftLifecycle({
    reason: "none",
    saving: false,
    current: { ...pristineDraft, name: "Still unsaved" },
  });

  assert.equal(restored.reason, "none");
  assert.equal(restored.baseline, null);
});

test("Multiplayer creation renders every exit as a document navigation", () => {
  const html = renderToStaticMarkup(createElement(
    MobileAppWebShell,
    {
      activeTab: "multiplayerSideQuests",
      signedIn: true,
      desktopPresentation: "multiplayer-create",
      modalPresentation: true,
      immersivePresentation: true,
      closeHref: "/multiplayer",
    },
    createElement(MobileCreateMultiplayerScreen, { signedIn: true, quests: [] }),
  ));
  const visibleHtml = html.split('<div hidden="" aria-hidden="true">')[0];
  const anchors = visibleHtml.match(/<a\b[^>]*>/g) ?? [];
  assert.ok(anchors.length > 0);
  assert.deepEqual(
    anchors.filter((anchor) => !anchor.includes('data-sqc-navigation="document"')),
    [],
  );
});
