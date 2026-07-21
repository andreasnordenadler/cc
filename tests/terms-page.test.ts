import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import TermsPage, { metadata } from "../src/app/terms/page";

test("Terms of Use has a dedicated public launch-draft destination", () => {
  const html = renderToStaticMarkup(React.createElement(TermsPage));

  assert.equal(metadata.title, "Terms of Use — Side Quest Chess");
  assert.match(html, /<h1[^>]*>Terms of Use<\/h1>/);
  assert.match(html, /Launch draft updated:/);
  assert.match(html, /not legal advice/i);
  assert.match(html, /owner\/legal review/i);
  assert.match(html, /href="\/privacy"/);
  assert.match(html, /href="\/support"/);
  assert.doesNotMatch(html, /NEXT_REDIRECT/);
});
