import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

test("mobile Solo Side Quest deck exposes its section heading", () => {
  const source = readFileSync(resolve(process.cwd(), "apps/mobile/App.tsx"), "utf8");

  assert.match(
    source,
    /<Text accessibilityRole="header" style=\{styles\.sectionTitle\}>Solo Side Quest deck<\/Text>/,
    "the Solo Side Quest deck must expose its visible section title as a heading",
  );
});
