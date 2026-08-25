import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("authentication becomes a two-column desktop workspace only at the established boundary", async () => {
  const [signIn, signUp, shell, css] = await Promise.all([
    readFile(new URL("../src/app/sign-in/[[...sign-in]]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/app/sign-up/[[...sign-up]]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/mobile-app-web-shell.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/app/mobile-web.css", import.meta.url), "utf8"),
  ]);
  const desktopMedia = css.match(/@media \(min-width: 1180px\) \{[\s\S]*?\/\* End desktop authentication workspace \*\/[\s\S]*?\}/)?.[0] ?? "";

  assert.match(signIn, /desktopPresentation="auth"/);
  assert.match(signUp, /desktopPresentation="auth"/);
  assert.match(signIn, /sqc-auth-workspace/);
  assert.match(signUp, /sqc-auth-workspace/);
  assert.match(shell, /"auth"/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-auth\s+\.sqc-screen\s*\{[^}]*width:\s*min\(1280px,\s*calc\(100%\s*-\s*64px\)\)/);
  assert.match(desktopMedia, /\.sqc-auth-workspace\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1\.08fr\)\s+minmax\(440px,\s*\.92fr\)/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-auth\s+:is\(a, button, input\):focus-visible/);
});

test("wide authentication aligns the sign-in workspace with the global desktop canvas", async () => {
  const css = await readFile(new URL("../src/app/mobile-web.css", import.meta.url), "utf8");
  const wideDesktopStart = css.indexOf("@media (min-width: 1680px) {");
  const wideDesktopEnd = css.indexOf("@media (min-width: 1180px) and (max-width: 1280px)", wideDesktopStart);
  const wideDesktopMedia = css.slice(wideDesktopStart, wideDesktopEnd);

  assert.notEqual(wideDesktopStart, -1);
  assert.match(
    wideDesktopMedia,
    /\.sqc-mobile-web\.desktop-auth\s+\.sqc-screen\s*\{[^}]*width:\s*min\(1600px,\s*calc\(100%\s*-\s*80px\)\)/,
    "the authentication workspace should align with the wide persistent navigation instead of remaining at 1280px",
  );
  assert.match(
    wideDesktopMedia,
    /\.sqc-mobile-web\.desktop-auth\s+\.sqc-auth-workspace\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s+minmax\(560px,\s*\.78fr\);[^}]*min-height:\s*700px/,
    "the provider form should remain a bounded action rail while the editorial account context receives the extra canvas",
  );
  assert.match(
    wideDesktopMedia,
    /\.sqc-mobile-web\.desktop-auth\s+\.sqc-auth-intro\s*\{[^}]*padding:\s*76px\s+88px/,
  );
});
