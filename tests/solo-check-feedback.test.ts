import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFile } from "node:fs/promises";

import { SoloCheckFeedback } from "../src/components/solo-check-feedback";
import { runSoloCheckAction } from "../src/lib/solo-check-result";

test("Solo proof refresh returns Android-equivalent success feedback", async () => {
  const result = await runSoloCheckAction(async () => ({
    status: "checked",
    completion: null,
  }));

  assert.deepEqual(result, {
    status: "checked",
    completion: null,
    message: "Side Quest proof checked. Your latest result is shown below.",
    error: null,
  });
  assert.match(
    renderToStaticMarkup(React.createElement(SoloCheckFeedback, { result })),
    /role="status"[^>]*>Side Quest proof checked\. Your latest result is shown below\./,
  );
});

test("Solo proof refresh keeps provider details private and renders an inline alert", async () => {
  const result = await runSoloCheckAction(async () => {
    throw new Error("Clerk metadata write failed for user_123");
  });

  assert.deepEqual(result, {
    status: "error",
    completion: null,
    message: null,
    error: "Could not check this Side Quest. Try again in a moment.",
  });
  const html = renderToStaticMarkup(React.createElement(SoloCheckFeedback, { result }));
  assert.match(html, /role="alert"[^>]*>Could not check this Side Quest\. Try again in a moment\./);
  assert.doesNotMatch(html, /Clerk|user_123/);
});

test("Home and active detail render the same inline result from the production check action", async () => {
  const [actions, homeControl, detailControl] = await Promise.all([
    readFile(new URL("../src/app/actions.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/components/active-solo-actions.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/official-solo-detail-actions.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(actions, /return runSoloCheckAction\(runActiveChallengeCheck\)/);
  assert.match(homeControl, /<SoloCheckFeedback result=\{state\}/);
  assert.match(detailControl, /useActionState\(checkActiveChallengeWithResult/);
  assert.match(detailControl, /<SoloCheckFeedback result=\{state\}/);
  assert.doesNotMatch(detailControl, /action=\{checkActiveChallenge\}/);
});

test("Solo check feedback uses the compact Android inline success and error tones", async () => {
  const css = await readFile(new URL("../src/app/mobile-web.css", import.meta.url), "utf8");

  assert.match(css, /\.sqc-solo-check-feedback\.success\s*\{[^}]*color:\s*#60f0af/);
  assert.match(css, /\.sqc-solo-check-feedback\.error\s*\{[^}]*color:\s*#ff9aa7/);
  assert.match(css, /\.sqc-mobile-web \.sqc-solo-check-feedback\s*\{[^}]*font-size:\s*12px[^}]*font-weight:\s*800/);
});
