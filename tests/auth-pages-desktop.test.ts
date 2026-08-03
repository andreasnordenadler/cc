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
