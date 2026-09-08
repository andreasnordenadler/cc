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
