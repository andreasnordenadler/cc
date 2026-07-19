import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import Loading from "../src/app/loading";

test("route loading matches Android v338 live quest board state", () => {
  const html = renderToStaticMarkup(React.createElement(Loading));

  assert.match(html, /role="status"/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /Loading the live quest board/);
  assert.match(html, /sqc-loading-spinner/);
  assert.doesNotMatch(html, /fake|sample|preview/i);
});
