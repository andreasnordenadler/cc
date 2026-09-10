import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { getMobileActionFeedbackAnnouncement } from "../apps/mobile/src/accessibility/actionFeedbackAnnouncement";

test("native iOS action feedback uses a queued screen-reader announcement", () => {
  assert.deepEqual(getMobileActionFeedbackAnnouncement("ios", "Profile saved."), {
    message: "Profile saved.",
    options: { queue: true },
  });
});

test("native Android action feedback relies on its live region without a duplicate announcement", () => {
  assert.equal(getMobileActionFeedbackAnnouncement("android", "Profile saved."), null);
});

test("native account feedback setters queue every iOS announcement before a panel can unmount", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const hookStart = source.indexOf("function useAccessibleActionFeedback");
  const hookEnd = source.indexOf("function MobileAccountStatesCard", hookStart);
  const hookAndConsumers = source.slice(hookStart, hookEnd);

  assert.notEqual(hookStart, -1);
  assert.notEqual(hookEnd, -1);
  assert.match(source, /import \{ getMobileActionFeedbackAnnouncement \} from "\.\/src\/accessibility\/actionFeedbackAnnouncement";/);
  assert.match(hookAndConsumers, /const announcement = getMobileActionFeedbackAnnouncement\(Platform\.OS, feedback\);/);
  assert.match(hookAndConsumers, /AccessibilityInfo\.announceForAccessibilityWithOptions\(announcement\.message, announcement\.options\);/);
  assert.match(hookAndConsumers, /const setMessage = useCallback\(\(feedback: string \| null\) => \{[\s\S]*?setMessageState\(feedback\);[\s\S]*?announce\(feedback\);/);
  assert.match(hookAndConsumers, /const setError = useCallback\(\(feedback: string \| null\) => \{[\s\S]*?setErrorState\(feedback\);[\s\S]*?announce\(feedback\);/);
  assert.equal((hookAndConsumers.match(/useAccessibleActionFeedback\(\)/g) ?? []).length, 3);
});
