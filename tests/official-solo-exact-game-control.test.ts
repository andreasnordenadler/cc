import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import OfficialSoloDetailActions from "../src/components/official-solo-detail-actions";
import { assertActiveSoloSubmissionTarget } from "../src/lib/official-solo-exact-game";

test("exact-game submission accepts only the authenticated account's active Solo quest", () => {
  assert.doesNotThrow(() => assertActiveSoloSubmissionTarget({ id: "finish-any-game", startedAt: "2026-07-17T00:00:00.000Z" }, "finish-any-game"));
  assert.throws(() => assertActiveSoloSubmissionTarget(null, "finish-any-game"), /Start this Side Quest before submitting a specific game\./);
  assert.throws(() => assertActiveSoloSubmissionTarget({ id: "another-quest" }, "finish-any-game"), /Start this Side Quest before submitting a specific game\./);
});

test("production exact-game action rejects a non-active target before provider checks or persistence", async () => {
  const actions = await import("node:fs/promises").then((fs) => fs.readFile(new URL("../src/app/actions.ts", import.meta.url), "utf8"));
  const body = actions.slice(actions.indexOf("export async function submitChallengeAttempt"), actions.indexOf("export async function checkActiveChallenge"));
  const guardIndex = body.indexOf("assertActiveSoloSubmissionTarget");

  assert.ok(guardIndex > 0);
  assert.ok(guardIndex < body.indexOf("const lichessUsername"));
  assert.ok(guardIndex < body.indexOf("await clerkClient()"));
});

test("active official Solo detail exposes only the latest-game proof action", () => {
  const html = renderToStaticMarkup(React.createElement(OfficialSoloDetailActions, {
    challengeId: "finish-any-game",
    mode: "check",
  }));

  assert.match(html, />Check my latest game<\/button>/);
  assert.doesNotMatch(html, /Specific proof game|Lichess game ID or Chess\.com URL|Submit game\/link/);
});

test("official Solo page never renders a specific-game proof form", async () => {
  const page = await import("node:fs/promises").then((fs) => fs.readFile(new URL("../src/app/challenges/[id]/page.tsx", import.meta.url), "utf8"));

  assert.doesNotMatch(page, /OfficialSoloExactGameControl|Specific proof game|Submit game\/link/);
});
