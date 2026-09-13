import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

test("mobile multiplayer weekly-results section exposes its heading", () => {
  const source = readFileSync(resolve(process.cwd(), "apps/mobile/App.tsx"), "utf8");
  const resultsStart = source.indexOf('accessibilityLabel="Browse earlier official Multiplayer Side Quest results"');
  const resultsEnd = source.indexOf("          </View>}", resultsStart);

  assert.ok(resultsStart >= 0 && resultsEnd > resultsStart, "the Multiplayer weekly-results section must be present");
  assert.match(
    source.slice(resultsStart, resultsEnd),
    /<Text accessibilityRole="header" style=\{styles\.sectionTitle\}>Browse weekly results\.<\/Text>/,
    "the visible weekly-results title must be exposed as an accessibility heading",
  );
});
