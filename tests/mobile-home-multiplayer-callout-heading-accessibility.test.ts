import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

test("mobile Home Multiplayer callout exposes its section heading", () => {
  const source = readFileSync(resolve(process.cwd(), "apps/mobile/App.tsx"), "utf8");

  assert.match(
    source,
    /<Text accessibilityRole="header" style=\{styles\.sectionTitle\}>Same nonsense, now with witnesses\.<\/Text>/,
    "the Home Multiplayer callout must expose its visible section title as a heading",
  );
});
