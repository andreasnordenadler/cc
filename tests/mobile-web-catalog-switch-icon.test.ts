import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

function cssBlock(css: string, selector: string) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const matches = [...css.matchAll(new RegExp(`(?:^|\\n)${escaped}\\s*\\{([^}]*)\\}`, "g"))];
  assert.ok(matches.length, `Missing CSS block for ${selector}`);
  return matches.at(-1)![1];
}

test("authenticated Solo and Multiplayer catalogs match the Android swap control with route-navigation semantics", async () => {
  const css = await readFile(new URL("../src/app/mobile-web.css", import.meta.url), "utf8");
  const shell = await readFile(new URL("../src/components/mobile-app-web-shell.tsx", import.meta.url), "utf8");

  assert.match(shell, /<nav className="sqc-brand-tabs sqc-multiplayer-brand-tabs" aria-label="Multiplayer Side Quest catalog"/);
  assert.match(shell, /<nav className="sqc-brand-tabs sqc-solo-brand-tabs" aria-label="Solo Side Quest catalog"/);
  assert.doesNotMatch(shell, /className="[^"]*(?:sqc-solo-brand-tabs|sqc-multiplayer-brand-tabs)[^"]*" role="tablist"/);

  const tabs = cssBlock(css, ".sqc-brand-tabs");
  assert.match(tabs, /gap:\s*12px/);

  const button = cssBlock(css, ".sqc-brand-switch");
  assert.match(button, /width:\s*44px/);
  assert.match(button, /height:\s*44px/);

  const icon = cssBlock(css, '.sqc-brand-switch[data-icon="swap-horizontal"] span');
  assert.match(icon, /width:\s*19px/);
  assert.match(icon, /height:\s*19px/);
  assert.match(icon, /M8%2C10V13H14V18H8V21L2%2C15\.5L8%2C10M22%2C8\.5L16%2C3V6H10V11H16V14L22%2C8\.5Z/);
  assert.match(icon, /mask:\s*url\(/);
  assert.match(cssBlock(css, '.sqc-brand-switch[data-icon="swap-horizontal"] span::before'), /display:\s*none/);

  const authenticatedTabs = cssBlock(css, ".sqc-mobile-web:not(.signed-out) :is(.sqc-solo-brand-tabs, .sqc-multiplayer-brand-tabs)");
  assert.match(authenticatedTabs, /grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/);

  const authenticatedSwitch = cssBlock(css, '.sqc-mobile-web:not(.signed-out) :is(.sqc-solo-brand-tabs, .sqc-multiplayer-brand-tabs) .sqc-brand-switch[data-icon="swap-horizontal"]');
  assert.match(authenticatedSwitch, /box-sizing:\s*border-box/);
  assert.match(authenticatedSwitch, /position:\s*absolute/);
  assert.match(authenticatedSwitch, /left:\s*50%/);
  assert.match(authenticatedSwitch, /top:\s*50%/);
  assert.match(authenticatedSwitch, /margin-top:\s*-22px/);
  assert.match(authenticatedSwitch, /margin-left:\s*-22px/);

  const signedOutTabs = cssBlock(css, ".sqc-mobile-web.signed-out .sqc-brand-tabs");
  assert.match(signedOutTabs, /grid-template-columns:\s*minmax\(0,1fr\) 36px minmax\(0,1fr\)/);
  const signedOutSwitch = cssBlock(css, '.sqc-mobile-web.signed-out .sqc-brand-switch[data-icon="swap-horizontal"]');
  assert.match(signedOutSwitch, /width:\s*36px/);
  assert.match(signedOutSwitch, /height:\s*36px/);

  assert.doesNotMatch(css, /content:\s*"⇄"/);
});
