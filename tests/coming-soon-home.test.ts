import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const pageUrl = new URL("../src/app/page.tsx", import.meta.url);
const styleUrl = new URL("../src/app/page.module.css", import.meta.url);

test("public Home is a static Side Quest Chess coming-soon experience", async () => {
  const source = await readFile(pageUrl, "utf8");

  assert.match(source, /export const metadata/);
  assert.match(source, /Side Quest Chess — Coming soon/);
  assert.match(source, /<main[^>]*className=\{styles\.page\}/);
  assert.match(source, /<h1[^>]*>\s*Every game deserves[\s\S]*a side quest\./);
  assert.match(source, /Coming soon/);
  assert.match(source, /\/mobile-source\/sqc-coat-of-arms\.png/);
  assert.match(source, /href="\/privacy"/);
  assert.match(source, /href="\/support"/);

  assert.doesNotMatch(source, /currentUser|clerkClient|MobileAppWebShell|listPublicCommunitySideQuests/);
  assert.doesNotMatch(source, /<form|type="email"|Sign in|Create account/);
});

test("coming-soon layout is responsive, accessible, and motion-safe", async () => {
  const css = await readFile(styleUrl, "utf8");

  assert.match(css, /\.page\s*\{[\s\S]*min-height:\s*100(?:dvh|vh)/);
  assert.match(css, /@media\s*\(max-width:\s*760px\)/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css, /:focus-visible/);
  assert.doesNotMatch(css, /overflow-x:\s*scroll/);
});
