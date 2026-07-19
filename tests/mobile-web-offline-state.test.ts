import assert from "node:assert/strict";
import test from "node:test";
import React, { type ReactElement, type ReactNode } from "react";
import { readFile } from "node:fs/promises";
import { renderToStaticMarkup } from "react-dom/server";

import ErrorScreen from "../src/app/error";

function findElement(node: ReactNode, type: string): ReactElement<Record<string, unknown>> | null {
  if (!React.isValidElement(node)) return null;
  if (node.type === type) return node as ReactElement<Record<string, unknown>>;
  const children = React.Children.toArray((node.props as { children?: ReactNode }).children);
  for (const child of children) {
    const found = findElement(child, type);
    if (found) return found;
  }
  return null;
}

test("route failures show an honest Android-style unavailable board with a real retry", () => {
  let retries = 0;
  const error = new Error("Clerk secret details must stay server-side");
  const element = ErrorScreen({ error, unstable_retry: () => { retries += 1; } });
  const html = renderToStaticMarkup(element);

  assert.match(html, /class="sqc-mobile-web immersive signed-out"/);
  assert.match(html, /role="alert"/);
  assert.match(html, /class="sqc-native-card sqc-offline-card"/);
  assert.match(html, /Side Quest board unavailable/);
  assert.match(html, /temporary connection or service problem/);
  assert.match(html, />Try the live board again</);
  assert.doesNotMatch(html, /Guest menu|saved fallback board|your connection is unavailable/i);
  assert.doesNotMatch(html, /Clerk secret details/);

  const button = findElement(element, "button");
  assert.ok(button);
  assert.equal(button.props.type, "button");
  assert.equal(typeof button.props.onClick, "function");
  (button.props.onClick as () => void)();
  assert.equal(retries, 1);
});

test("offline card keeps Android banner typography and tint at matched viewport", async () => {
  const css = await readFile(new URL("../src/app/mobile-web.css", import.meta.url), "utf8");

  assert.match(css, /\.sqc-native-card\.sqc-offline-card\s*\{[\s\S]*background:\s*rgba\(96, 240, 175, \.09\)/);
  assert.match(css, /\.sqc-offline-card h1\s*\{[\s\S]*font-size:\s*clamp\(24px, 7vw, 32px\)[\s\S]*line-height:\s*1\.05/);
});
