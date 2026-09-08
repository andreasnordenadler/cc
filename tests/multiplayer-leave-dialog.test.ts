import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import React from "react";

import * as leaveActionComponent from "../src/components/group-quest-leave-action";

type InspectableElement = React.ReactElement<{
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  onDismiss?: () => void;
  role?: string;
}>;

function elementText(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (!React.isValidElement(node)) return "";
  return React.Children.toArray((node as InspectableElement).props.children).map(elementText).join("");
}

function findElement(node: React.ReactNode, predicate: (element: InspectableElement) => boolean): InspectableElement | null {
  if (!React.isValidElement(node)) return null;
  const element = node as InspectableElement;
  if (predicate(element)) return element;
  for (const child of React.Children.toArray(element.props.children)) {
    const match = findElement(child, predicate);
    if (match) return match;
  }
  return null;
}

test("joined player leave requires keyboard-modal confirmation before dispatching", async () => {
  const controls = (leaveActionComponent as unknown as Record<string, unknown>).GroupQuestLeaveControls;
  assert.equal(typeof controls, "function");
  const renderControls = controls as (props: Record<string, unknown>) => React.ReactNode;
  const actions: string[] = [];
  let opened = 0;
  const baseProps = {
    descriptionId: "leave-description",
    error: null,
    isConfirming: false,
    onConfirm: () => { actions.push("leave"); },
    onDismiss: () => undefined,
    onOpen: () => { opened += 1; },
    openerRef: { current: null },
    submitting: false,
    titleId: "leave-title",
  };

  const closed = renderControls(baseProps);
  const opener = findElement(closed, (element) => element.type === "button" && elementText(element) === "Leave Side Quest");
  assert.ok(opener?.props.onClick);
  opener.props.onClick();
  assert.equal(opened, 1);
  assert.deepEqual(actions, []);

  const open = renderControls({ ...baseProps, isConfirming: true });
  const dialog = findElement(open, (element) => element.props.role === "alertdialog");
  assert.ok(dialog);
  assert.match(elementText(dialog), /Leave this Multiplayer Side Quest\?/);
  assert.match(elementText(dialog), /participant entry will be removed/);
  const confirmation = findElement(open, (element) => element.type === "button" && element.props.className === "button danger");
  assert.ok(confirmation?.props.onClick);
  confirmation.props.onClick();
  assert.deepEqual(actions, ["leave"]);

  const source = await readFile(new URL("../src/components/group-quest-leave-action.tsx", import.meta.url), "utf8");
  assert.match(source, /<AccessibleModalDialog/);
  assert.match(source, /ref=\{openerRef\}/);
  assert.match(source, /returnFocusRef=\{openerRef\}/);
  assert.match(source, /data-dialog-initial-focus/);
  assert.doesNotMatch(source, /window\.confirm/);
});

test("pending player leave keeps the confirmation dialog non-dismissible", () => {
  const controls = (leaveActionComponent as unknown as Record<string, unknown>).GroupQuestLeaveControls;
  assert.equal(typeof controls, "function");
  const renderControls = controls as (props: Record<string, unknown>) => React.ReactNode;
  let dismissed = 0;
  const pending = renderControls({
    descriptionId: "leave-description",
    error: "You are not currently joined to this quest.",
    isConfirming: true,
    onConfirm: () => undefined,
    onDismiss: () => { dismissed += 1; },
    onOpen: () => undefined,
    openerRef: { current: null },
    submitting: true,
    titleId: "leave-title",
  });

  const dialog = findElement(pending, (element) => element.props.role === "alertdialog");
  assert.ok(dialog?.props.onDismiss);
  dialog.props.onDismiss();
  assert.equal(dismissed, 0);

  const stay = findElement(pending, (element) => element.type === "button" && elementText(element) === "Stay in Side Quest");
  const confirmation = findElement(pending, (element) => element.type === "button" && element.props.className === "button danger");
  assert.equal(stay?.props.disabled, true);
  assert.equal(confirmation?.props.disabled, true);
  assert.equal(elementText(confirmation), "Leaving…");
  assert.match(elementText(pending), /You are not currently joined to this quest\./);
});
