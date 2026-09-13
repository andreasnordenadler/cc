import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

test("mobile Home sign-in ritual exposes its section heading", () => {
  const source = readFileSync(resolve(process.cwd(), "apps/mobile/App.tsx"), "utf8");
  const ritualStart = source.indexOf("function AppRitualCard");
  const ritualEnd = source.indexOf("function BottomNav", ritualStart);

  assert.ok(ritualStart >= 0 && ritualEnd > ritualStart, "the Home sign-in ritual component must be present");
  assert.match(
    source.slice(ritualStart, ritualEnd),
    /<Text accessibilityRole="header" style=\{styles\.sectionTitle\}>A tiny ritual, not another chess dashboard\.<\/Text>/,
    "the Home sign-in ritual must expose its visible section title as a heading",
  );
});
