import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function readQuestProgressStripSource() {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const start = source.indexOf("function QuestProgressStrip");
  const end = source.indexOf("function CompletedQuestShelf", start);

  assert.notEqual(start, -1);
  assert.ok(end > start);
  return source.slice(start, end);
}

test("native account progress exposes one bounded progressbar value", async () => {
  const progressStrip = await readQuestProgressStripSource();

  assert.match(progressStrip, /const safeCompleted = Math\.max\(0, Math\.min\(completed, safeTotal\)\);/);
  assert.match(progressStrip, /Math\.round\(\(safeCompleted \/ safeTotal\) \* 100\)/);
  assert.match(
    progressStrip,
    /<View\s+accessible\s+accessibilityRole="progressbar"\s+accessibilityLabel="Side Quest log progress"\s+accessibilityValue=\{\{\s*min: 0,\s*max: safeTotal,\s*now: safeCompleted,\s*text: `\$\{completed\} of \$\{total\} Coats of Arms earned`,?\s*\}\}\s+style=\{styles\.progressTrack\}\s*>/,
  );
});
