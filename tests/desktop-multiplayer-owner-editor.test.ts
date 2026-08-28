import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

test("Multiplayer owner editor becomes a desktop workspace at the established boundary", () => {
  const route = readFileSync("src/app/groupquests/[id]/edit/page.tsx", "utf8");
  const shell = readFileSync("src/components/mobile-app-web-shell.tsx", "utf8");
  const css = readFileSync("src/app/mobile-web.css", "utf8");
  const mobileCss = css.slice(0, css.indexOf("@media (min-width: 1180px)"));
  const desktopStart = css.indexOf("/* Multiplayer owner edit desktop workspace */");
  const desktopEnd = css.indexOf("/* End Multiplayer owner edit desktop workspace */", desktopStart);
  const desktopCss = desktopStart >= 0 && desktopEnd >= 0 ? css.slice(desktopStart, desktopEnd) : "";

  assert.match(route, /desktopPresentation="multiplayer-edit"/);
  assert.match(shell, /"multiplayer-edit"/);
  assert.match(route, /className="sqc-multiplayer-edit-context-nav"/);
  assert.match(route, /href=\{`\/groupquests\/\$\{encodeURIComponent\(id\)\}`\}/);
  assert.match(route, /aria-current="page">Edit table<\/span>/);
  assert.match(mobileCss, /\.sqc-multiplayer-edit-context-nav\s*\{[^}]*display:\s*none;/);
  assert.match(mobileCss, /\.sqc-mobile-web\.desktop-multiplayer-edit\s+\.groupquests-builder\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/, "the app composition stays readable immediately below 1180px");
  assert.match(desktopCss, /\.sqc-mobile-web\.desktop-multiplayer-edit\s+\.sqc-desktop-route-only\s*\{[^}]*display:\s*block/);
  assert.match(desktopCss, /\.sqc-mobile-web\.desktop-multiplayer-edit\s+\.sqc-screen\s*\{[^}]*width:\s*min\(1280px,\s*calc\(100%\s*-\s*64px\)\)/);
  assert.match(desktopCss, /\.sqc-mobile-web\.desktop-multiplayer-edit\s+\.groupquests-builder\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s+minmax\(360px,\s*\.58fr\)/);
  assert.match(desktopCss, /\.sqc-mobile-web\.desktop-multiplayer-edit\s+\.groupquests-draft-preview\s*\{[^}]*position:\s*sticky;[^}]*top:\s*102px/);
  assert.match(desktopCss, /\.sqc-mobile-web\.desktop-multiplayer-edit\s+:is\(a,\s*summary,\s*button,\s*input,\s*textarea,\s*select\):focus-visible/);
});
