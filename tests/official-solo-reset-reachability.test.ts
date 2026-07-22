import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import ResetQuestControl from "../src/components/reset-quest-control";
import { getChallengeById } from "../src/lib/challenges";

test("completed Official Solo detail keeps the Android reset capability reachable", async () => {
  const challenge = getChallengeById("finish-any-game");
  assert.ok(challenge);

  const html = renderToStaticMarkup(React.createElement(ResetQuestControl, { challenge }));
  assert.match(html, /<button[^>]*>Reset quest<\/button>/);

  const source = await import("node:fs/promises").then((fs) =>
    fs.readFile(new URL("../src/app/challenges/[id]/page.tsx", import.meta.url), "utf8"),
  );
  assert.match(source, /import ResetQuestControl from "@\/components\/reset-quest-control"/);
  assert.match(source, /\{completed && user \? \([\s\S]*?<ResetQuestControl challenge=\{challenge\} \/>[\s\S]*?\) : null\}/);
});
