import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("native catalog section titles expose screen-reader headings", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const sectionTitles = [
    ...source.matchAll(/<Text\b[^>]*style=\{compactStyles\.freshSectionTitle\}[^>]*>/g),
  ].map((match) => match[0]);

  assert.equal(sectionTitles.length, 5, "Expected every current catalog section-title renderer");
  for (const title of sectionTitles) {
    assert.match(title, /accessibilityRole="header"/);
  }
});
