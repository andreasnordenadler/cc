import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { shouldUseDevTrackerPreview } from "../apps/mobile/src/preview/devTrackerPreview";

const appSource = readFileSync(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");

test("tracker preview data is never enabled in a production build", () => {
  assert.equal(shouldUseDevTrackerPreview({ isDev: false, authenticated: false }), false);
  assert.equal(shouldUseDevTrackerPreview({ isDev: false, authenticated: true }), false);
  assert.doesNotMatch(appSource, /EXPO_PUBLIC_SQC_MOBILE_PREVIEW_AUTH/);
  assert.match(appSource, /shouldUseDevTrackerPreview\(\{ isDev: __DEV__/);
});

test("development preview data never embeds a personal account identity", () => {
  assert.equal(shouldUseDevTrackerPreview({ isDev: true, authenticated: false }), true);
  assert.equal(shouldUseDevTrackerPreview({ isDev: true, authenticated: true }), false);
  assert.doesNotMatch(appSource, /Andreas|and72nor|andreas\.nordenadler@gmail\.com/i);
});
