import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { shouldStackActiveQuestSummary } from "../apps/mobile/src/layout/activeQuestLayout";

const appSource = readFileSync(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");

test("active quest proof summary stays side-by-side on a wide default-scale phone", () => {
  assert.equal(shouldStackActiveQuestSummary({ width: 412, fontScale: 1 }), false);
});

test("active quest proof summary stacks on compact phone widths", () => {
  assert.equal(shouldStackActiveQuestSummary({ width: 360, fontScale: 1 }), true);
  assert.equal(shouldStackActiveQuestSummary({ width: 384, fontScale: 1 }), true);
});

test("active quest proof summary stacks when enlarged text reduces usable width", () => {
  assert.equal(shouldStackActiveQuestSummary({ width: 412, fontScale: 1.2 }), true);
  assert.equal(shouldStackActiveQuestSummary({ width: 480, fontScale: 1.5 }), true);
});

test("all active quest proof states apply the responsive stacked layout", () => {
  assert.match(appSource, /useWindowDimensions/);
  assert.match(appSource, /shouldStackActiveQuestSummary/);
  assert.equal(appSource.match(/const stackSummary = useActiveQuestSummaryLayout\(\);/g)?.length, 3);
  assert.equal(appSource.match(/stackSummary && compactStyles\.currentSummaryPanelStacked/g)?.length, 3);
  assert.equal(appSource.match(/stackSummary && compactStyles\.currentProofTextBlockStacked/g)?.length, 3);
});

test("connected chess identities shrink and truncate instead of overlapping", () => {
  assert.match(appSource, /identityAccount: \{[^}]*flexShrink: 1[^}]*minWidth: 0/);
  assert.match(appSource, /identityUsername: \{[^}]*flexShrink: 1[^}]*minWidth: 0/);
  assert.equal(appSource.match(/ellipsizeMode="tail"/g)?.length, 2);
});
