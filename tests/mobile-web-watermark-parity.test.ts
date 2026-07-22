import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path: string) => readFile(new URL(path, root), "utf8");

function cssRule(css: string, selector: string) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = css.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`));
  assert.ok(match, `missing CSS rule ${selector}`);
  return match[1];
}

test("global shell watermark matches the Android v338 logo asset and geometry", async () => {
  const [shell, css] = await Promise.all([
    source("src/components/mobile-app-web-shell.tsx"),
    source("src/app/mobile-web.css"),
  ]);
  const backdrop = cssRule(css, ".sqc-mobile-backdrop");
  const texture = cssRule(css, ".sqc-mobile-backdrop::after");
  const watermark = cssRule(css, ".sqc-mobile-backdrop::before");

  assert.match(shell, /<div className="sqc-mobile-backdrop" aria-hidden="true" \/>/);
  assert.match(watermark, /top:\s*104px;/);
  assert.match(watermark, /left:\s*calc\(50% - 3px\);/);
  assert.match(watermark, /width:\s*620px;/);
  assert.match(watermark, /height:\s*620px;/);
  assert.match(watermark, /background:\s*url\("\/sqc-logo-v11\.png"\) center \/ contain no-repeat;/);
  assert.match(watermark, /opacity:\s*\.025;/);
  assert.match(watermark, /transform:\s*translateX\(-50%\);/);
  assert.doesNotMatch(backdrop, /mask-image:/);
  assert.match(texture, /mask-image:\s*linear-gradient\(180deg, #000, rgba\(0,0,0,\.4\) 48%, transparent\);/);
  assert.doesNotMatch(css, /\.signed-out\s+\.sqc-mobile-backdrop::before\s*\{/);
});
