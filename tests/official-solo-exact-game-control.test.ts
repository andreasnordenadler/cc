import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { OfficialSoloExactGameForm } from "../src/components/official-solo-detail-actions";
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

test("active official Solo detail can submit one exact finished game without account identity fields", () => {
  const html = renderToStaticMarkup(React.createElement(OfficialSoloExactGameForm, {
    challengeId: "finish-any-game",
    action: async () => {},
  }));

  assert.match(html, /<form[^>]*aria-label="Submit specific game proof"/);
  assert.match(html, /type="hidden" name="challengeId" value="finish-any-game"/);
  assert.match(html, /name="gameId"/);
  assert.match(html, /placeholder="Lichess game ID or Chess\.com URL"/);
  assert.match(html, /required=""/);
  assert.match(html, /paste a finished public game to check that exact proof instead of only the latest game/);
  assert.match(html, />Submit game\/link<\/button>/);
  assert.doesNotMatch(html, /userId|username|provider/);
});

test("official Solo page exposes exact-game submission only in the active detail state", async () => {
  const page = await import("node:fs/promises").then((fs) => fs.readFile(new URL("../src/app/challenges/[id]/page.tsx", import.meta.url), "utf8"));

  assert.match(page, /isActiveChallenge[\s\S]*<OfficialSoloExactGameControl challengeId=\{challenge\.id\}/);
  assert.equal(page.match(/<OfficialSoloExactGameControl/g)?.length, 1);
});

test("exact-game submission keeps the Android input stack bounded at mobile width", async () => {
  const css = await import("node:fs/promises").then((fs) => fs.readFile(new URL("../src/app/mobile-web.css", import.meta.url), "utf8"));

  assert.match(css, /\.sqc-exact-game-form\s*\{[\s\S]*?display:\s*grid;[\s\S]*?gap:/);
  assert.match(css, /\.sqc-exact-game-form \.sqc-secondary-action\s*\{[\s\S]*?width:\s*100%;/);
});
