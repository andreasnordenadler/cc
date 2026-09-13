import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

test("mobile account danger zones expose their section heading", () => {
  const source = readFileSync(resolve(process.cwd(), "apps/mobile/App.tsx"), "utf8");

  assert.equal(
    source.match(/<Text accessibilityRole="header" style=\{compactStyles\.kicker\}>Danger zone<\/Text>/g)?.length ?? 0,
    2,
    "both signed-out and signed-in Account danger zones must be announced as headings",
  );
});
