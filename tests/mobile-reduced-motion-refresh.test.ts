import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  createReducedMotionPreferenceController,
  shouldAnimateRefreshIcon,
} from "../apps/mobile/src/accessibility/reducedMotionPreference";

test("reduced-motion preference starts with the current native setting", async () => {
  let listener: ((enabled: boolean) => void) | null = null;
  const observed: boolean[] = [];
  const controller = createReducedMotionPreferenceController({
    getInitialValue: async () => true,
    subscribe: (onChange) => {
      listener = onChange;
      return () => {
        listener = null;
      };
    },
    onChange: (enabled) => observed.push(enabled),
  });

  const dispose = controller.start();
  await Promise.resolve();

  assert.deepEqual(observed, [true]);
  assert.notEqual(listener, null);
  dispose();
  assert.equal(listener, null);
});

test("a native preference change wins over an older initial query", async () => {
  let resolveInitial: ((enabled: boolean) => void) | null = null;
  let listener: ((enabled: boolean) => void) | null = null;
  const observed: boolean[] = [];
  const controller = createReducedMotionPreferenceController({
    getInitialValue: () => new Promise<boolean>((resolve) => {
      resolveInitial = resolve;
    }),
    subscribe: (onChange) => {
      listener = onChange;
      return () => {};
    },
    onChange: (enabled) => observed.push(enabled),
  });

  controller.start();
  assert.notEqual(listener, null);
  listener!(true);
  resolveInitial!(false);
  await Promise.resolve();

  assert.deepEqual(observed, [true]);
});

test("an unavailable initial setting keeps native preference changes active", async () => {
  let listener: ((enabled: boolean) => void) | null = null;
  const observed: boolean[] = [];
  const controller = createReducedMotionPreferenceController({
    getInitialValue: async () => {
      throw new Error("native preference unavailable");
    },
    subscribe: (onChange: (enabled: boolean) => void) => {
      listener = onChange;
      return () => {};
    },
    onChange: (enabled: boolean) => observed.push(enabled),
  });

  controller.start();
  await new Promise<void>((resolve) => setImmediate(resolve));
  listener!(true);

  assert.deepEqual(observed, [true]);
});

test("refresh motion runs only while active and reduced motion is off", () => {
  assert.equal(shouldAnimateRefreshIcon(false, false), false);
  assert.equal(shouldAnimateRefreshIcon(true, false), true);
  assert.equal(shouldAnimateRefreshIcon(true, true), false);
});

test("the native refresh icon follows live reduced-motion changes", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const start = source.indexOf("function SpinningRefreshIcon");
  const end = source.indexOf("function TodayDashboard", start);
  const component = source.slice(start, end);

  assert.notEqual(start, -1);
  assert.ok(end > start);
  assert.match(
    source,
    /import \{ createReducedMotionPreferenceController, shouldAnimateRefreshIcon \} from "\.\/src\/accessibility\/reducedMotionPreference";/,
  );
  assert.match(component, /const \[reduceMotionEnabled, setReduceMotionEnabled\] = useState\(true\)/);
  assert.match(component, /getInitialValue: \(\) => AccessibilityInfo\.isReduceMotionEnabled\(\)/);
  assert.match(component, /AccessibilityInfo\.addEventListener\("reduceMotionChanged", onChange\)/);
  assert.match(component, /return \(\) => subscription\.remove\(\)/);
  assert.match(component, /onChange: setReduceMotionEnabled/);
  assert.match(component, /const animate = shouldAnimateRefreshIcon\(spinning, reduceMotionEnabled\)/);
  assert.match(component, /if \(!animate\) \{[\s\S]*rotation\.stopAnimation\(\);[\s\S]*rotation\.setValue\(0\)/);
  assert.match(component, /\}, \[animate, rotation\]\);/);
});
