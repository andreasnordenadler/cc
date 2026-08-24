import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { SettingsEditor, SignedOutSettings } from "../src/app/settings/page";

test("Settings preserves the profile and proof-account editing contract", () => {
  const html = renderToStaticMarkup(React.createElement(SettingsEditor, {
    displayName: "Quest Runner",
    runnerBio: "Trying unreasonable openings.",
    lichessUsername: "runner-one",
    chessComUsername: "runner-two",
  }));

  assert.match(html, /name="runnerDisplayName"[^>]*value="Quest Runner"/);
  assert.match(html, /name="runnerBio"[^>]*>Trying unreasonable openings\.<\/textarea>/);
  assert.match(html, /name="lichessUsername"[^>]*value="runner-one"/);
  assert.match(html, /name="chessComUsername"[^>]*value="runner-two"/);
  assert.match(html, /<button[^>]*type="submit"[^>]*>Save usernames<\/button>/);
  assert.match(html, /class="[^"]*sqc-settings-proof-panel[^"]*"/);
  assert.match(html, /never asks for your chess-site password/i);
});

test("signed-out Settings keeps its exact return-to-origin sign-in action", () => {
  const html = renderToStaticMarkup(React.createElement(SignedOutSettings));

  assert.match(html, /class="[^"]*sqc-settings-sign-in-layout[^"]*"/);
  assert.match(html, /Sign in to edit account details\./);
  assert.match(html, /Choose sign-in method/);
  assert.match(html, /Your profile and proof setup stay together/);
});

test("Settings becomes a desktop account workspace only at the established boundary", async () => {
  const [route, css] = await Promise.all([
    readFile(new URL("../src/app/settings/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/app/mobile-web.css", import.meta.url), "utf8"),
  ]);
  const desktopMedia = css.match(/@media \(min-width: 1180px\) \{[\s\S]*?\/\* End desktop Settings workspace \*\/[\s\S]*?\}/)?.[0] ?? "";

  assert.match(route, /desktopPresentation="settings"/);
  assert.doesNotMatch(route, /controlsOnlyHeader/, "mobile Settings keeps its existing signed-in app header below 1180px");
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-settings\s+\.sqc-screen\s*\{[^}]*width:\s*min\(1240px,\s*calc\(100%\s*-\s*64px\)\)/);
  assert.match(desktopMedia, /\.sqc-settings-editor-layout\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1\.35fr\)\s+minmax\(340px,\s*\.65fr\)/);
  assert.match(desktopMedia, /\.sqc-settings-sign-in-layout\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1\.05fr\)\s+minmax\(380px,\s*\.95fr\)/);
  assert.match(desktopMedia, /\.sqc-mobile-web\.desktop-settings\s+:is\(a, button, input, textarea\):focus-visible/);
});

test("wide Settings uses the large desktop canvas and an editorial account split", async () => {
  const css = await readFile(new URL("../src/app/mobile-web.css", import.meta.url), "utf8");
  const wideDesktopMedia = css.match(/@media \(min-width: 1680px\) \{[\s\S]*?\n\}/)?.[0] ?? "";

  assert.match(wideDesktopMedia, /\.sqc-mobile-web\.desktop-settings\s+\.sqc-screen\s*\{[^}]*width:\s*min\(1500px,\s*calc\(100%\s*-\s*96px\)\)/);
  assert.match(wideDesktopMedia, /\.sqc-mobile-web\.desktop-settings\s+\.sqc-account-workspace-nav\s*\{[^}]*width:\s*min\(1500px,\s*calc\(100%\s*-\s*96px\)\)/);
  assert.match(wideDesktopMedia, /\.sqc-mobile-web\.desktop-settings\s+\.sqc-settings-editor-layout\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s+420px/);
  assert.match(wideDesktopMedia, /\.sqc-mobile-web\.desktop-settings\s+\.sqc-settings-profile-panel\s*\{[^}]*padding:\s*48px\s+56px/);
  assert.match(wideDesktopMedia, /\.sqc-mobile-web\.desktop-settings\s+\.sqc-settings-profile-panel\s+\.sqc-input-stack,\s*\.sqc-mobile-web\.desktop-settings\s+\.sqc-settings-field-group\s*\{[^}]*grid-template-columns:\s*190px\s+minmax\(0,\s*1fr\)/);
  assert.match(wideDesktopMedia, /\.sqc-mobile-web\.desktop-settings\s+\.sqc-settings-profile-panel\s+\.sqc-primary-action\s*\{[^}]*margin-left:\s*214px/);
  assert.match(wideDesktopMedia, /\.sqc-mobile-web\.desktop-settings\s+\.sqc-settings-sign-in-layout\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*\.82fr\)\s+minmax\(640px,\s*1\.18fr\);[^}]*min-height:\s*620px/);
  assert.match(wideDesktopMedia, /\.sqc-mobile-web\.desktop-settings\s+\.sqc-settings-sign-in-copy\s*\{[^}]*padding:\s*76px/);
  assert.match(wideDesktopMedia, /\.sqc-mobile-web\.desktop-settings\s+\.sqc-settings-sign-in-context\s*\{[^}]*padding:\s*72px/);
});
