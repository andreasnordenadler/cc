import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("native password account mode switch exposes contextual radio options", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const panelStart = source.indexOf("function PasswordAuthPanel");
  const panelEnd = source.indexOf("function MobileAccountStatesCard", panelStart);
  const panel = source.slice(panelStart, panelEnd);

  assert.notEqual(panelStart, -1);
  assert.notEqual(panelEnd, -1);
  assert.match(
    panel,
    /<View style=\{styles\.passwordAuthModeRow\} accessibilityRole="radiogroup" accessibilityLabel="Password account mode">/,
  );
  assert.match(
    panel,
    /<Pressable accessibilityRole="radio" accessibilityLabel="Password account mode: Sign in" accessibilityState=\{\{ checked:/,
  );
  assert.match(
    panel,
    /<Pressable accessibilityRole="radio" accessibilityLabel="Password account mode: Create account" accessibilityState=\{\{ checked: mode === "sign-up" \}\}/,
  );
});

test("native password recovery remains inside the checked sign-in option", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const panelStart = source.indexOf("function PasswordAuthPanel");
  const panelEnd = source.indexOf("function MobileAccountStatesCard", panelStart);
  const panel = source.slice(panelStart, panelEnd);

  assert.notEqual(panelStart, -1);
  assert.notEqual(panelEnd, -1);
  assert.match(
    panel,
    /<Pressable accessibilityRole="radio" accessibilityLabel="Password account mode: Sign in" accessibilityState=\{\{ checked: mode === "sign-in" \|\| mode === "reset" \}\} style=\{\[styles\.passwordAuthModeButton, \(mode === "sign-in" \|\| mode === "reset"\) && styles\.passwordAuthModeButtonActive\]\}/,
  );
  assert.match(
    panel,
    /<Text style=\{\[styles\.passwordAuthModeText, \(mode === "sign-in" \|\| mode === "reset"\) && styles\.passwordAuthModeTextActive\]\}>Sign in<\/Text>/,
  );
});
