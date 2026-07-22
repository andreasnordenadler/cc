import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import Loading from "../src/app/loading";

test("route loading matches Android v338 live quest board state", () => {
  const html = renderToStaticMarkup(React.createElement(Loading));

  assert.match(html, /role="status"/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, />Loading the live quest board\.\.\.<\/p>/);
  assert.match(html, /sqc-loading-spinner/);
  assert.doesNotMatch(html, /sqc-native-card|sqc-card-eyebrow|Checking the current Side Quests/i);
  assert.doesNotMatch(html, /fake|sample|preview/i);

  const css = readFileSync(new URL("../src/app/mobile-web.css", import.meta.url), "utf8");
  assert.match(css, /\.sqc-loading-card p\s*{[\s\S]*?color:\s*#c7bda9;[\s\S]*?font-size:\s*14px;/);
});
