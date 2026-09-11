import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  createLiveProgrammaticScrollPreference,
  shouldAnimateProgrammaticScroll,
} from "../apps/mobile/src/accessibility/reducedMotionPreference";

test("programmatic scroll animates only when requested and reduced motion is off", () => {
  assert.equal(shouldAnimateProgrammaticScroll(false, false), false);
  assert.equal(shouldAnimateProgrammaticScroll(false, true), false);
  assert.equal(shouldAnimateProgrammaticScroll(true, false), true);
  assert.equal(shouldAnimateProgrammaticScroll(true, true), false);
});

test("a retained scroll callback reads a newer reduced-motion preference", () => {
  const preference = createLiveProgrammaticScrollPreference(false);
  const retainedCallback = (requested: boolean) => preference.shouldAnimate(requested);

  assert.equal(retainedCallback(true), true);
  preference.setReduceMotionEnabled(true);
  assert.equal(retainedCallback(true), false);
});

test("the native account editor reveal follows live reduced-motion changes", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const shellStart = source.indexOf("function MobileShell");
  const shellEnd = source.indexOf("function FixedScreenCloseButton", shellStart);
  const shell = source.slice(shellStart, shellEnd);
  const accountStart = source.indexOf("function AccountTrackerDashboard");
  const accountEnd = source.indexOf("function ActiveScreen", accountStart);
  const account = source.slice(accountStart, accountEnd);

  assert.notEqual(shellStart, -1);
  assert.ok(shellEnd > shellStart);
  assert.notEqual(accountStart, -1);
  assert.ok(accountEnd > accountStart);
  assert.match(
    source,
    /import \{ createLiveProgrammaticScrollPreference, createReducedMotionPreferenceController, shouldAnimateRefreshIcon \} from "\.\/src\/accessibility\/reducedMotionPreference";/,
  );
  assert.match(
    shell,
    /const \[programmaticScrollPreference\] = useState\(\(\) => createLiveProgrammaticScrollPreference\(true\)\)/,
  );
  assert.match(shell, /getInitialValue: \(\) => AccessibilityInfo\.isReduceMotionEnabled\(\)/);
  assert.match(shell, /AccessibilityInfo\.addEventListener\("reduceMotionChanged", onChange\)/);
  assert.match(shell, /return \(\) => subscription\.remove\(\)/);
  assert.match(shell, /onChange: programmaticScrollPreference\.setReduceMotionEnabled/);
  assert.match(shell, /\}\)\.start\(\), \[programmaticScrollPreference\]\);/);
  assert.match(
    shell,
    /onScrollToY=\{\(y, animated = true\) => scrollViewRef\.current\?\.scrollTo\(\{ y, animated: programmaticScrollPreference\.shouldAnimate\(animated\) \}\)\}/,
  );
  assert.match(shell, /<ActiveScreen[\s\S]*onScrollToY=\{\(y, animated = true\)/);
  assert.match(account, /onScrollToY\(targetY, true\)/);
});
