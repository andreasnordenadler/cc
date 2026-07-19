import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFile } from "node:fs/promises";

import MobileWebHamburgerMenu, { installMobileWebMenuHistory, reduceMobileWebMenu, shouldHandleMobileWebMenuNavigation, wrapMobileWebMenuFocus } from "../src/components/mobile-web-hamburger-menu";

const items = [
  { id: "home", label: "Home", href: "/", icon: "home", active: true },
  { id: "account", label: "My Account", href: "/account", icon: "person", active: false },
];

test("authenticated hamburger uses an explicit modal state instead of browser details state", () => {
  assert.equal(reduceMobileWebMenu(false, "toggle"), true);
  assert.equal(reduceMobileWebMenu(true, "toggle"), false);
  assert.equal(reduceMobileWebMenu(true, "close"), false);

  const html = renderToStaticMarkup(React.createElement(MobileWebHamburgerMenu, { items }));
  assert.match(html, /type="button"/);
  assert.match(html, /aria-label="Open main menu"/);
  assert.match(html, /aria-haspopup="dialog"/);
  assert.doesNotMatch(html, /<details|<summary/);
});

test("modal menu focus wraps at both ends", () => {
  assert.equal(wrapMobileWebMenuFocus(-1, 10, false), 0);
  assert.equal(wrapMobileWebMenuFocus(0, 10, true), 9);
  assert.equal(wrapMobileWebMenuFocus(9, 10, false), 0);
  assert.equal(wrapMobileWebMenuFocus(4, 10, true), null);
});

test("modified menu clicks retain native new-tab behavior", () => {
  assert.equal(shouldHandleMobileWebMenuNavigation({ button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false }), true);
  assert.equal(shouldHandleMobileWebMenuNavigation({ button: 0, metaKey: true, ctrlKey: false, shiftKey: false, altKey: false }), false);
  assert.equal(shouldHandleMobileWebMenuNavigation({ button: 1, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false }), false);
});

test("browser Back closes the modal history entry instead of leaving the screen", () => {
  const listeners = new Set<(event: PopStateEvent) => void>();
  const calls: string[] = [];
  const history: { state: Record<string, unknown>; pushState(state: Record<string, unknown>): void; back(): void } = {
    state: { route: "solo" },
    pushState(state) { this.state = state; calls.push(`push:${JSON.stringify(state)}`); },
    back() { this.state = { route: "solo" }; calls.push("back"); listeners.forEach(listener => listener({} as PopStateEvent)); },
  };
  const events = {
    addEventListener(_type: "popstate", listener: (event: PopStateEvent) => void) { listeners.add(listener); },
    removeEventListener(_type: "popstate", listener: (event: PopStateEvent) => void) { listeners.delete(listener); },
  };

  const controller = installMobileWebMenuHistory(history, events, "menu-test", () => calls.push("close"));
  controller.close();
  controller.close();
  controller.dispose();

  assert.deepEqual(calls, ['push:{"route":"solo","sqcMenu":"menu-test"}', "back", "close"]);
  assert.equal(listeners.size, 0);
});

test("unmount consumes an open modal history entry without firing its close callback", () => {
  const calls: string[] = [];
  const history: { state: Record<string, unknown> | null; pushState(state: Record<string, unknown>): void; back(): void } = {
    state: null,
    pushState(state) { this.state = state; calls.push("push"); },
    back() { calls.push("back"); },
  };
  const events = {
    addEventListener() { calls.push("listen"); },
    removeEventListener() { calls.push("unlisten"); },
  };

  installMobileWebMenuHistory(history, events, "menu-test", () => calls.push("close")).dispose();
  assert.deepEqual(calls, ["listen", "push", "unlisten", "back"]);
});

test("unrelated navigation does not get consumed when an open menu unmounts", () => {
  const calls: string[] = [];
  const history: { state: Record<string, unknown>; pushState(state: Record<string, unknown>): void; back(): void } = {
    state: { route: "solo" },
    pushState(state) { this.state = state; calls.push("push"); },
    back() { calls.push("back"); },
  };
  const events = { addEventListener() {}, removeEventListener() {} };
  const controller = installMobileWebMenuHistory(history, events, "menu-test", () => calls.push("close"));
  history.state = { route: "account" };
  controller.dispose();
  assert.deepEqual(calls, ["push"]);
});

test("Back from an unrelated newer history entry does not close or strand the menu entry", () => {
  const listeners = new Set<(event: PopStateEvent) => void>();
  const calls: string[] = [];
  const history: { state: Record<string, unknown>; pushState(state: Record<string, unknown>): void; back(): void } = {
    state: { route: "solo" },
    pushState(state) { this.state = state; calls.push("push"); },
    back() { calls.push("back"); },
  };
  const events = {
    addEventListener(_type: "popstate", next: (event: PopStateEvent) => void) { listeners.add(next); },
    removeEventListener(_type: "popstate", next: (event: PopStateEvent) => void) { listeners.delete(next); },
  };
  installMobileWebMenuHistory(history, events, "menu-test", () => calls.push("close"));

  history.state = { route: "account", sqcMenu: "menu-test" };
  listeners.forEach(next => next({} as PopStateEvent));
  assert.deepEqual(calls, ["push"]);

  history.state = { route: "solo" };
  listeners.forEach(next => next({} as PopStateEvent));
  assert.deepEqual(calls, ["push", "close"]);
});

test("modal overlay keeps every destination reachable in a short viewport", async () => {
  const css = await readFile(new URL("../src/app/mobile-web.css", import.meta.url), "utf8");
  assert.match(css, /\.sqc-menu-overlay\s*\{[\s\S]*overflow-y:\s*auto/);
  assert.match(css, /\.sqc-menu-overlay\s*\{[\s\S]*padding-bottom:\s*max\(14px, env\(safe-area-inset-bottom\)\)/);
  assert.match(css, /\.sqc-menu-backdrop\s*\{[^}]*position:\s*fixed/);
});
