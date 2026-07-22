import assert from "node:assert/strict";
import test from "node:test";
import React, { type ReactElement, type ReactNode } from "react";
import { readFile } from "node:fs/promises";
import { renderToStaticMarkup } from "react-dom/server";

import ErrorScreen from "../src/app/error";
import { CHALLENGES } from "../src/lib/challenges";

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
  assert.match(html, /Saved official board/);
  assert.match(html, /Live account, likes, progress, and Multiplayer are unavailable/);
  for (const challenge of CHALLENGES.slice(0, 6)) {
    assert.match(html, new RegExp(challenge.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.match(html, new RegExp(challenge.instruction.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    for (const rule of challenge.rules) {
      assert.match(html, new RegExp(rule.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    }
  }
  assert.equal((html.match(/<details/g) ?? []).length, 6);
  assert.doesNotMatch(html, /<a\b|href=/i);
  assert.doesNotMatch(html, /Guest menu|your connection is unavailable/i);
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
  assert.match(css, /\.sqc-native-card\.sqc-offline-catalog\s*\{[\s\S]*width:\s*min\(100%, 460px\)/);
  assert.match(css, /\.sqc-offline-quest-list\s*\{[\s\S]*grid-template-columns:\s*minmax\(0, 1fr\)/);
  assert.match(css, /\.sqc-offline-quest-list details\s*\{[\s\S]*grid-template-columns:\s*minmax\(0, 1fr\)/);
  assert.match(css, /\.sqc-offline-quest-list summary\s*\{[\s\S]*cursor:\s*pointer/);
  assert.match(css, /\.sqc-offline-quest-list summary::after\s*\{[\s\S]*content:\s*"＋"/);
  assert.match(css, /\.sqc-offline-quest-list details\[open\] summary::after\s*\{[\s\S]*content:\s*"−"/);
});
