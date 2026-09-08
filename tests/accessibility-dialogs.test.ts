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
  assert.match(primitive, /trigger\?\.isConnected/);
  assert.match(primitive, /trigger\.focus\(\)/);
  assert.match(startControl, /<AccessibleModalDialog/);
  assert.match(startControl, /data-dialog-initial-focus/);
  assert.match(resetControl, /<AccessibleModalDialog/);
  assert.match(resetControl, /data-dialog-initial-focus/);
});
