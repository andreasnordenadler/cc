import assert from "node:assert/strict";
import test from "node:test";

import { createModalAccessibilityController } from "../apps/mobile/src/accessibility/modalAccessibility";

test("modal accessibility controller delegates dismissal to its owner", () => {
  let dismissCalls = 0;
  const controller = createModalAccessibilityController({
    dismiss: () => {
      dismissCalls += 1;
    },
    getInitialFocusTarget: () => null,
    findNodeHandle: () => null,
    setAccessibilityFocus: () => {
      throw new Error("focus should not run during dismissal");
    },
  });

  controller.dismiss();

  assert.equal(dismissCalls, 1);
});

test("modal accessibility controller blocks dismissal while its owner is busy", () => {
  let dismissCalls = 0;
  const controller = createModalAccessibilityController({
    dismiss: () => {
      dismissCalls += 1;
    },
    canDismiss: () => false,
    getInitialFocusTarget: () => null,
    findNodeHandle: () => null,
    setAccessibilityFocus: () => {},
  });

  controller.dismiss();

  assert.equal(dismissCalls, 0);
});

test("modal accessibility controller ignores a missing initial focus handle", () => {
  const resolvedTargets: Array<object | null> = [];
  const focusedHandles: number[] = [];
  const controller = createModalAccessibilityController({
    dismiss: () => {},
    getInitialFocusTarget: () => null,
    findNodeHandle: (candidate) => {
      resolvedTargets.push(candidate);
      return null;
    },
    setAccessibilityFocus: (nodeHandle) => {
      focusedHandles.push(nodeHandle);
    },
  });

  controller.focusInitial();

  assert.deepEqual(resolvedTargets, [null]);
  assert.deepEqual(focusedHandles, []);
});

test("modal accessibility controller focuses the resolved initial target", () => {
  const target = { id: "close-button" };
  const resolvedTargets: Array<typeof target | null> = [];
  const focusedHandles: number[] = [];
  const controller = createModalAccessibilityController({
    dismiss: () => {},
    getInitialFocusTarget: () => target,
    findNodeHandle: (candidate) => {
      resolvedTargets.push(candidate);
      return 42;
    },
    setAccessibilityFocus: (nodeHandle) => {
      focusedHandles.push(nodeHandle);
    },
  });

  controller.focusInitial();

  assert.deepEqual(resolvedTargets, [target]);
  assert.deepEqual(focusedHandles, [42]);
});
