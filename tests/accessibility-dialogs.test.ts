import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

import { wrapAccessibleDialogFocus } from "../src/components/accessible-modal-dialog";

test("modal dialog focus wraps at both keyboard boundaries", () => {
  assert.equal(wrapAccessibleDialogFocus(-1, 2, false), 0);
  assert.equal(wrapAccessibleDialogFocus(0, 2, true), 1);
  assert.equal(wrapAccessibleDialogFocus(1, 2, false), 0);
  assert.equal(wrapAccessibleDialogFocus(0, 2, false), null);
  assert.equal(wrapAccessibleDialogFocus(1, 2, true), null);
  assert.equal(wrapAccessibleDialogFocus(-1, 0, false), null);
});

test("active-switch and permanent-reset confirmations share the accessible modal boundary", async () => {
  const [primitive, startControl, resetControl] = await Promise.all([
    readFile(new URL("../src/components/accessible-modal-dialog.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/official-solo-detail-actions.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/reset-quest-control.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(primitive, /createPortal/);
  assert.match(primitive, /document\.body\.children/);
  assert.match(primitive, /\.inert = true/);
  assert.match(primitive, /event\.key === "Escape"/);
  assert.match(primitive, /event\.key !== "Tab"/);
  assert.match(primitive, /document\.addEventListener\("focusin"/);
  assert.match(startControl, /<AccessibleModalDialog/);
  assert.match(startControl, /data-dialog-initial-focus/);
  assert.match(resetControl, /<AccessibleModalDialog/);
  assert.match(resetControl, /data-dialog-initial-focus/);
});

test("each Solo confirmation restores focus to its explicit opener", async () => {
  const [primitive, startControl, resetControl] = await Promise.all([
    readFile(new URL("../src/components/accessible-modal-dialog.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/official-solo-detail-actions.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/reset-quest-control.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(primitive, /returnFocusRef: RefObject<HTMLElement \| null>/);
  assert.match(primitive, /returnFocusRef\.current/);
  assert.match(startControl, /ref=\{openSwitchDialogRef\}/);
  assert.match(startControl, /returnFocusRef=\{openSwitchDialogRef\}/);
  assert.match(resetControl, /ref=\{openResetDialogRef\}/);
  assert.match(resetControl, /returnFocusRef=\{openResetDialogRef\}/);
});

test("Solo confirmation content remains reachable in a short viewport", async () => {
  const css = await readFile(new URL("../src/app/globals.css", import.meta.url), "utf8");
  const backdrop = css.match(/\.quest-switch-dialog-backdrop\s*\{([^}]*)\}/)?.[1] ?? "";
  const dialog = css.match(/\.quest-switch-dialog\s*\{([^}]*)\}/)?.[1] ?? "";

  assert.match(backdrop, /overflow-y:\s*auto/);
  assert.match(dialog, /max-height:\s*calc\(100dvh\s*-\s*36px\)/);
  assert.match(dialog, /overflow-y:\s*auto/);
  assert.match(dialog, /overscroll-behavior:\s*contain/);
});

test("active Solo deactivation uses the shared keyboard-modal boundary and restores its opener", async () => {
  const source = await readFile(new URL("../src/components/deactivate-quest-control.tsx", import.meta.url), "utf8");

  assert.match(source, /import \{ useRef, useState \} from "react"/);
  assert.match(source, /<AccessibleModalDialog/);
  assert.match(source, /ref=\{openDeactivateDialogRef\}/);
  assert.match(source, /returnFocusRef=\{openDeactivateDialogRef\}/);
  assert.match(source, /data-dialog-initial-focus/);
  assert.doesNotMatch(source, /<div className="quest-switch-dialog-backdrop"/);
});

test("completion celebrations use the shared keyboard-modal boundary without losing their full-screen backdrop", async () => {
  const [primitive, celebration] = await Promise.all([
    readFile(new URL("../src/components/accessible-modal-dialog.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/solo-completion-celebration.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(primitive, /backdropClassName/);
  assert.match(celebration, /<AccessibleModalDialog/);
  assert.match(celebration, /backdropClassName="sqc-celebration-backdrop"/);
  assert.match(celebration, /dismissOnBackdrop=\{false\}/);
  assert.match(celebration, /data-dialog-initial-focus/);
  assert.doesNotMatch(celebration, /window\.addEventListener\("keydown"/);
  assert.doesNotMatch(celebration, /document\.body\.style\.overflow/);
});

test("Solo refresh completion restores focus to its check button", async () => {
  const source = await readFile(new URL("../src/components/active-solo-actions.tsx", import.meta.url), "utf8");

  assert.match(source, /useRef<HTMLButtonElement>\(null\)/);
  assert.match(source, /buttonRef=\{checkButtonRef\}/);
  assert.match(source, /<button ref=\{buttonRef\}/);
  assert.match(source, /returnFocusRef=\{checkButtonRef\}/);
});

test("Multiplayer refresh completion restores focus to its check button", async () => {
  const source = await readFile(new URL("../src/components/group-quest-refresh-button.tsx", import.meta.url), "utf8");

  assert.match(source, /useRef<HTMLButtonElement>\(null\)/);
  assert.match(source, /ref=\{refreshButtonRef\}/);
  assert.match(source, /returnFocusRef=\{refreshButtonRef\}/);
});

test("Multiplayer completion enables its return-focus target before opening the modal", async () => {
  const source = await readFile(new URL("../src/components/group-quest-refresh-button.tsx", import.meta.url), "utf8");
  const enableIndex = source.indexOf("setRefreshing(false)");
  const openIndex = source.indexOf("setCompletion(buildMultiplayerCompletion");

  assert.ok(enableIndex >= 0, "refresh button should be re-enabled");
  assert.ok(openIndex >= 0, "completion modal should still open");
  assert.ok(enableIndex < openIndex, "return-focus target must be enabled before the modal mounts");
  assert.doesNotMatch(source, /setTimeout\(\(\) => setRefreshing\(false\)/);
});

test("Multiplayer reward previews use the shared keyboard-modal boundary and restore their openers", async () => {
  const source = await readFile(new URL("../src/components/group-quest-leaderboard.tsx", import.meta.url), "utf8");

  assert.match(source, /import \{ useRef, useState \} from "react"/);
  assert.equal(source.match(/<AccessibleModalDialog/g)?.length, 2);
  assert.match(source, /returnFocusRef=\{sealPreviewTriggerRef\}/);
  assert.match(source, /returnFocusRef=\{scrollTriggerRef\}/);
  assert.equal(source.match(/data-dialog-initial-focus/g)?.length, 2);
  assert.match(source, /id="groupquest-seal-preview-title">\{previewSeal\.label\} placement seal for \{selectedSealPreview\.name\}/);
  assert.doesNotMatch(source, /className="groupquest-(?:seal|scroll)-modal" role="dialog"/);
});

test("Multiplayer reward preview modal wrappers retain the dimmed backdrop", async () => {
  const css = await readFile(new URL("../src/app/globals.css", import.meta.url), "utf8");
  const wrapper = css.match(/\.groupquest-scroll-modal, \.groupquest-seal-modal\s*\{([^}]*)\}/)?.[1] ?? "";

  assert.match(wrapper, /background:\s*rgba\(0,0,0,\.72\)/);
  assert.match(wrapper, /backdrop-filter:\s*blur\(6px\)/);
});

test("Multiplayer reward previews remain reachable in short viewports", async () => {
  const css = await readFile(new URL("../src/app/globals.css", import.meta.url), "utf8");
  const wrapper = css.match(/\.groupquest-scroll-modal, \.groupquest-seal-modal\s*\{([^}]*)\}/)?.[1] ?? "";
  const sheets = css.match(/\.groupquest-scroll-sheet, \.groupquest-seal-sheet\s*\{([^}]*)\}/)?.[1] ?? "";

  assert.match(wrapper, /place-items:\s*start center/);
  assert.match(wrapper, /overflow-y:\s*auto/);
  assert.match(wrapper, /overscroll-behavior:\s*contain/);
  assert.match(sheets, /margin-block:\s*auto/);
});
