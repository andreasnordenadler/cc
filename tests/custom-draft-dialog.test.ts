import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { Children, createElement, isValidElement, type ComponentType, type ReactElement, type ReactNode, type RefObject } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as customCreateForm from "../src/components/mobile-custom-create-form";

function elementText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (!isValidElement<{ children?: ReactNode }>(node)) return "";
  return Children.toArray(node.props.children).map(elementText).join("");
}

function findButton(node: ReactNode, label: string): ReactElement<{ onClick?: () => void }> | null {
  if (!isValidElement<{ children?: ReactNode; onClick?: () => void }>(node)) return null;
  if (node.type === "button" && elementText(node) === label) return node as ReactElement<{ onClick?: () => void }>;
  for (const child of Children.toArray(node.props.children)) {
    const match = findButton(child, label);
    if (match) return match;
  }
  return null;
}

test("same-document Custom fragment links never disarm draft protection", () => {
  const isSameDocumentNavigation = (customCreateForm as Record<string, unknown>).isSameDocumentCustomDraftNavigation;
  assert.equal(typeof isSameDocumentNavigation, "function");
  const isSameDocument = isSameDocumentNavigation as (currentHref: string, destinationHref: string, rawHref: string) => boolean;

  assert.equal(isSameDocument("https://sidequestchess.com/create-custom-side-quest", "https://sidequestchess.com/create-custom-side-quest", "#"), true);
  assert.equal(isSameDocument("https://sidequestchess.com/create-custom-side-quest", "https://sidequestchess.com/create-custom-side-quest#rules", "#rules"), true);
  assert.equal(isSameDocument("https://sidequestchess.com/create-custom-side-quest", "https://sidequestchess.com/create-custom-side-quest#rules", "/create-custom-side-quest#rules"), true);
  assert.equal(isSameDocument("https://sidequestchess.com/create-custom-side-quest", "https://sidequestchess.com/create-custom-side-quest", "https://sidequestchess.com/create-custom-side-quest#"), true);
  assert.equal(isSameDocument("https://sidequestchess.com/create-custom-side-quest", "https://sidequestchess.com/create-custom-side-quest", "/create-custom-side-quest"), false);
  assert.equal(isSameDocument("https://sidequestchess.com/create-custom-side-quest", "https://sidequestchess.com/", "#"), false);
});

test("unsaved Custom navigation uses a keyboard-modal confirmation instead of window.confirm", async () => {
  const dialog = (customCreateForm as Record<string, unknown>).CustomDraftLeaveDialog;
  assert.equal(typeof dialog, "function");
  let dismissed = 0;
  let discarded = 0;
  const props = {
    onDismiss: () => { dismissed += 1; },
    onDiscard: () => { discarded += 1; },
    returnFocusRef: { current: null },
  };
  const tree = (dialog as (input: typeof props) => ReactElement)(props);

  const html = renderToStaticMarkup(createElement(dialog as ComponentType<{
    onDismiss: () => void;
    onDiscard: () => void;
    returnFocusRef: RefObject<HTMLElement | null>;
  }>, {
    ...props,
  }));

  assert.match(html, /role="alertdialog"/);
  assert.match(html, /aria-modal="true"/);
  assert.match(html, />Discard Custom draft\?</);
  assert.match(html, /data-dialog-initial-focus="true"[^>]*>Keep editing</);
  assert.match(html, />Discard changes</);
  findButton(tree, "Keep editing")?.props.onClick?.();
  assert.deepEqual({ dismissed, discarded }, { dismissed: 1, discarded: 0 });
  findButton(tree, "Discard changes")?.props.onClick?.();
  assert.deepEqual({ dismissed, discarded }, { dismissed: 1, discarded: 1 });

  const source = await readFile(new URL("../src/components/mobile-custom-create-form.tsx", import.meta.url), "utf8");
  assert.match(source, /<AccessibleModalDialog/);
  assert.match(source, /returnFocusRef=\{leaveTrigger\}/);
  assert.match(source, /leaveTrigger\.current = target/);
  assert.match(source, /setLeaveIntent\(\{ href: destination\.href \}\)/);
  assert.match(source, /leaveIntent \? <CustomDraftLeaveDialog/);
  assert.match(source, /allowNavigation\.current = true;[\s\S]*?window\.location\.assign\(intent\.href\)/);
  assert.doesNotMatch(source, /window\.confirm/);
});
