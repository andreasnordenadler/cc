import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function readCssBlock(source: string, start: number) {
  assert.notEqual(start, -1, "expected CSS block to exist");
  const open = source.indexOf("{", start);
  let depth = 0;
  for (let index = open; index < source.length; index += 1) {
    if (source[index] === "{") depth += 1;
    if (source[index] === "}") depth -= 1;
    if (depth === 0) return source.slice(start, index + 1);
  }
  throw new Error("unterminated CSS block");
}

test("wide desktop Custom editor grows continuously into the available workbench canvas", () => {
  const css = readFileSync("src/app/mobile-web.css", "utf8");
  const fluidDesktop = readCssBlock(css, css.lastIndexOf("@media (min-width: 1380px)"));

  assert.match(
    fluidDesktop,
    /\.sqc-mobile-web\.desktop-custom-editor\s+\.sqc-screen\s*\{[^}]*width:\s*min\(1600px,\s*calc\(100%\s*-\s*80px\)\)/,
    "the workbench should grow progressively after standard desktop instead of jumping at 1680px",
  );
  assert.match(
    fluidDesktop,
    /\.sqc-mobile-web\.desktop-custom-editor\s+\.sqc-custom-builder-card\s*\{[^}]*grid-template-columns:\s*clamp\(320px,\s*22vw,\s*380px\)\s+minmax\(0,\s*1fr\)/,
    "the recipe rail should grow deliberately with the canvas instead of stretching both columns equally",
  );
  assert.match(
    fluidDesktop,
    /\.sqc-mobile-web\.desktop-custom-editor\s+\.sqc-custom-builder-hero\s*\{[^}]*grid-template-columns:\s*clamp\(220px,\s*15vw,\s*260px\)\s+minmax\(0,\s*1fr\)/,
    "the editor hero should share the fluid workbench proportions",
  );
});
