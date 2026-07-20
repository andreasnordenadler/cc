import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFile } from "node:fs/promises";

import SoloCoatLightbox, { closeSoloCoatDialog, openSoloCoatDialog } from "../src/components/solo-coat-lightbox";
import * as soloCoatModule from "../src/components/solo-coat-lightbox";

test("browser Back closes the enlarged Coat of Arms before leaving the active detail", () => {
  const installHistory = (soloCoatModule as Record<string, unknown>).installSoloCoatDialogHistory;
  assert.equal(typeof installHistory, "function");

  const states: unknown[] = [{ route: "active-detail" }];
  let index = 0;
  const listeners = new Set<() => void>();
  let closeCount = 0;
  let openCount = 0;
  const history = {
    get state() { return states[index]; },
    pushState(state: unknown) {
      states.splice(index + 1, states.length, state);
      index += 1;
    },
    back() {
      index = Math.max(0, index - 1);
      listeners.forEach((listener) => listener());
    },
    forward() {
      index = Math.min(states.length - 1, index + 1);
      listeners.forEach((listener) => listener());
    },
  };
  const events = {
    addEventListener(_type: "popstate", listener: () => void) { listeners.add(listener); },
    removeEventListener(_type: "popstate", listener: () => void) { listeners.delete(listener); },
  };

  const installed = (installHistory as (
    historyValue: { readonly state: unknown; pushState(state: unknown): void; back(): void },
    eventTarget: { addEventListener(type: "popstate", listener: () => void): void; removeEventListener(type: "popstate", listener: () => void): void },
    entryId: string,
    onBack: () => void,
    onForward: () => void,
  ) => { dispose(): void })(history, events, "coffee-horse", () => { closeCount += 1; }, () => { openCount += 1; });
  assert.equal(states.length, 2);

  history.back();

  assert.equal(closeCount, 1);
  assert.deepEqual(history.state, { route: "active-detail" });

  history.forward();
  assert.equal(openCount, 1);

  history.back();
  assert.equal(closeCount, 2);
  assert.deepEqual(history.state, { route: "active-detail" });
  installed.dispose();
});

test("a new dialog entry waits for an asynchronous Back traversal to settle", () => {
  const installHistory = soloCoatModule.installSoloCoatDialogHistory;
  const states: unknown[] = [{ route: "active-detail" }];
  let index = 0;
  const listeners = new Set<() => void>();
  let pendingBack = false;
  const history = {
    get state() { return states[index]; },
    pushState(state: unknown) {
      states.splice(index + 1, states.length, state);
      index += 1;
    },
    back() { pendingBack = true; },
  };
  const events = {
    addEventListener(_type: "popstate", listener: () => void) { listeners.add(listener); },
    removeEventListener(_type: "popstate", listener: () => void) { listeners.delete(listener); },
  };
  const installed = installHistory(history, events, "coffee-horse", () => undefined);

  installed.close();
  assert.equal(pendingBack, true);
  assert.equal(installed.readyForNewEntry(), false);

  index = 0;
  pendingBack = false;
  listeners.forEach((listener) => listener());
  assert.equal(installed.readyForNewEntry(), true);
  installed.dispose();
});

test("disposing during an asynchronous Back traversal does not navigate twice", () => {
  const listeners = new Set<() => void>();
  let backCount = 0;
  const history = {
    state: { route: "active-detail" } as Record<string, unknown>,
    pushState(state: Record<string, unknown>) { this.state = state; },
    back() { backCount += 1; },
  };
  const events = {
    addEventListener(_type: "popstate", listener: () => void) { listeners.add(listener); },
    removeEventListener(_type: "popstate", listener: () => void) { listeners.delete(listener); },
  };
  const installed = soloCoatModule.installSoloCoatDialogHistory(history, events, "coffee-horse", () => undefined);

  installed.close();
  installed.dispose();

  assert.equal(backCount, 1);
});

test("active Solo coat invokes the native modal open and close behavior", () => {
  const calls: string[] = [];
  const dialog = {
    showModal: () => calls.push("open"),
    close: () => calls.push("close"),
  } as Pick<HTMLDialogElement, "showModal" | "close">;

  openSoloCoatDialog(dialog);
  closeSoloCoatDialog(dialog);

  assert.deepEqual(calls, ["open", "close"]);
});

test("active Solo coat exposes the Android enlarge and close actions in server-rendered markup", () => {
  const html = renderToStaticMarkup(React.createElement(SoloCoatLightbox, {
    challengeId: "knights-before-coffee",
    badgeName: "Coffee Horse",
    badgePath: "/mobile-source/badges/v6/knights-before-coffee-badge.png",
    glowPath: "/mobile-source/badges/v6/knights-before-coffee-glow.png",
  }));

  assert.match(html, /<button[^>]*aria-label="Enlarge Coat of Arms"[^>]*aria-controls="solo-coat-knights-before-coffee"[^>]*aria-haspopup="dialog"/);
  assert.match(html, /<dialog[^>]*id="solo-coat-knights-before-coffee"[^>]*aria-label="Enlarged Coat of Arms: Coffee Horse"/);
  assert.match(html, /<button[^>]*aria-label="Close enlarged Coat of Arms"/);
  assert.match(html, />Coffee Horse<\/strong>/);
  assert.doesNotMatch(html, /popover|javascript:/i);
});

test("official Solo route exposes enlargement only for the authenticated active detail state", async () => {
  const source = await readFile(new URL("../src/app/challenges/[id]/page.tsx", import.meta.url), "utf8");

  assert.match(source, /import SoloCoatLightbox from "@\/components\/solo-coat-lightbox"/);
  assert.match(source, /isActiveChallenge \? \([\s\S]*<SoloCoatLightbox[\s\S]*badgeName=\{challenge\.badgeIdentity\.name\}/);
  assert.equal(source.match(/<SoloCoatLightbox/g)?.length, 1);
});

test("Solo coat lightbox preserves Android v338 overlay geometry and motion semantics", async () => {
  const css = await readFile(new URL("../src/app/mobile-web.css", import.meta.url), "utf8");

  assert.match(css, /\.sqc-coat-lightbox\s*\{[\s\S]*width:\s*100vw[\s\S]*height:\s*100dvh[\s\S]*padding:\s*24px[\s\S]*background:\s*rgba\(6,\s*5,\s*7,\s*\.82\)/);
  assert.match(css, /\.sqc-coat-lightbox-card\s*\{[\s\S]*width:\s*min\(100%,\s*460px\)[\s\S]*min-height:\s*min\(420px,\s*calc\(100dvh - 48px\)\)[\s\S]*border-radius:\s*32px[\s\S]*background:\s*rgba\(255,\s*247,\s*232,\s*\.06\)/);
  assert.match(css, /\.sqc-coat-lightbox-close\s*\{[\s\S]*width:\s*100%[\s\S]*height:\s*auto[\s\S]*min-height:\s*100%[\s\S]*display:\s*grid[\s\S]*place-items:\s*center/);
  assert.match(css, /\.sqc-coat-lightbox-glow\s*\{[\s\S]*width:\s*min\(330px,\s*100%\)[\s\S]*height:\s*auto[\s\S]*opacity:\s*\.78/);
  assert.match(css, /\.sqc-coat-lightbox-image\s*\{[\s\S]*width:\s*min\(238px,\s*100%\)[\s\S]*height:\s*auto/);
  assert.match(css, /\.sqc-coat-lightbox\s*\{[\s\S]*overflow-y:\s*auto/);
  assert.match(css, /\.sqc-coat-lightbox\[open\]\s*\{[\s\S]*place-items:\s*start center/);
  assert.match(css, /\.sqc-coat-lightbox-close\s*\{[\s\S]*height:\s*auto[\s\S]*min-height:\s*100%/);
  assert.match(css, /\.sqc-coat-lightbox-card\s*\{[\s\S]*min-height:\s*min\(420px,\s*calc\(100dvh - 48px\)\)/);
  assert.match(css, /\.sqc-coat-lightbox-glow\s*\{[\s\S]*width:\s*min\(330px,\s*100%\)[\s\S]*height:\s*auto/);
  assert.match(css, /\.sqc-coat-lightbox-image\s*\{[\s\S]*width:\s*min\(238px,\s*100%\)[\s\S]*height:\s*auto/);
  assert.match(css, /\.sqc-coat-lightbox\s*\{[\s\S]*opacity:\s*0[\s\S]*transition:[\s\S]*opacity 160ms ease-out[\s\S]*display 160ms allow-discrete[\s\S]*overlay 160ms allow-discrete/);
  assert.match(css, /\.sqc-coat-lightbox\[open\]\s*\{[\s\S]*display:\s*grid[\s\S]*opacity:\s*1/);
  assert.match(css, /@starting-style\s*\{[\s\S]*\.sqc-coat-lightbox\[open\]\s*\{[\s\S]*opacity:\s*0/);
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*\.sqc-coat-lightbox\s*\{\s*transition:\s*none/);
});
