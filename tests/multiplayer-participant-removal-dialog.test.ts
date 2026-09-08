import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import React from "react";

import * as participantRemovalComponent from "../src/components/group-quest-remove-participant-action";

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

test("host participant removal requires keyboard-modal confirmation before dispatching", async () => {
  const controls = (participantRemovalComponent as unknown as Record<string, unknown>).GroupQuestRemoveParticipantControls;
  assert.equal(typeof controls, "function");
  const renderControls = controls as (props: Record<string, unknown>) => React.ReactNode;
  const actions: string[] = [];
  let opened = 0;
  const baseProps = {
    busy: false,
    error: "",
    isConfirming: false,
    onConfirm: () => { actions.push("remove"); },
    onDismiss: () => undefined,
    onOpen: () => { opened += 1; },
    openerRef: { current: null },
    participantName: "Guest player",
  };

  const closed = renderControls(baseProps);
  const opener = findElement(closed, (element) => element.type === "button" && elementText(element) === "Remove player");
  assert.ok(opener?.props.onClick);
  opener.props.onClick();
  assert.equal(opened, 1);
  assert.deepEqual(actions, []);

  const open = renderControls({ ...baseProps, isConfirming: true });
  const dialog = findElement(open, (element) => element.props.role === "alertdialog");
  assert.ok(dialog);
  assert.match(elementText(dialog), /Remove Guest player from this Multiplayer Side Quest\?/);
  assert.match(elementText(dialog), /leaderboard entry and proof progress for this table will be removed/);
  const confirmation = findElement(open, (element) => element.type === "button" && element.props.className === "button danger");
  assert.ok(confirmation?.props.onClick);
  confirmation.props.onClick();
  assert.deepEqual(actions, ["remove"]);

  const source = await readFile(new URL("../src/components/group-quest-remove-participant-action.tsx", import.meta.url), "utf8");
  assert.match(source, /<AccessibleModalDialog/);
  assert.match(source, /ref=\{openerRef\}/);
  assert.match(source, /returnFocusRef=\{openerRef\}/);
  assert.match(source, /data-dialog-initial-focus/);
  assert.doesNotMatch(source, /window\.confirm/);
});

test("pending host participant removal keeps errors inside a non-dismissible dialog", () => {
  const controls = (participantRemovalComponent as unknown as Record<string, unknown>).GroupQuestRemoveParticipantControls;
  assert.equal(typeof controls, "function");
  const renderControls = controls as (props: Record<string, unknown>) => React.ReactNode;
  let dismissed = 0;
  const pending = renderControls({
    busy: true,
    descriptionId: "remove-description",
    error: "That player is no longer in this Multiplayer Side Quest.",
    isConfirming: true,
    onConfirm: () => undefined,
    onDismiss: () => { dismissed += 1; },
    onOpen: () => undefined,
    openerRef: { current: null },
    participantName: "Guest player",
    titleId: "remove-title",
  });

  const dialog = findElement(pending, (element) => element.props.role === "alertdialog");
  assert.ok(dialog?.props.onDismiss);
  dialog.props.onDismiss();
  assert.equal(dismissed, 0);
  const keep = findElement(pending, (element) => element.type === "button" && elementText(element) === "Keep player");
  const confirmation = findElement(pending, (element) => element.type === "button" && element.props.className === "button danger");
  assert.equal(keep?.props.disabled, true);
  assert.equal(confirmation?.props.disabled, true);
  assert.equal(elementText(confirmation), "Removing…");
  assert.match(elementText(pending), /That player is no longer in this Multiplayer Side Quest\./);
});
