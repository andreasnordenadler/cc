import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { createDateTimePickerModalSessionController } from "../apps/mobile/src/accessibility/dateTimePickerModalSession";

async function readDateTimeControlSource() {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const start = source.indexOf("function GroupQuestDateTimeControl");
  const end = source.indexOf("type NativeDateTimePickerTarget", start);

  assert.notEqual(start, -1);
  assert.ok(end > start);
  return source.slice(start, end);
}

type TestDateTimePickerChangeHandler = (input: {
  platform: string;
  eventType: string;
  selected?: string;
  targetMode: string | null;
  value: string;
  applySelection: (value: string, selected: string, mode: string) => string;
  onChange: (next: string) => void;
  closeIos: () => void;
  clearNonIos: () => void;
  isIosSessionOpen: () => boolean;
}) => void;

async function loadDateTimePickerChangeHandler() {
  const imported = await import("../apps/mobile/src/accessibility/dateTimePickerModalSession") as unknown as Record<string, unknown>;
  assert.equal(typeof imported.handleNativeDateTimePickerChange, "function", "native date/time picker change handler is missing");
  return imported.handleNativeDateTimePickerChange as TestDateTimePickerChangeHandler;
}

test("date and time picker sessions reject stale dismissal tokens", async () => {
  const events: string[] = [];
  const controller = createDateTimePickerModalSessionController<string, string>({
    show: (target) => events.push(`show:${target}`),
    hide: () => events.push("hide"),
    clear: () => events.push("clear"),
    focus: (trigger) => events.push(`focus:${trigger}`),
  });

  assert.equal(controller.open("date", "date-button"), 1);
  assert.equal(controller.requestClose(1), true);
  assert.equal(controller.open("time", "time-button"), null);
  assert.equal(controller.completeDismissal(1), true);
  assert.deepEqual(events, ["show:date", "hide", "focus:date-button", "clear"]);

  assert.equal(controller.open("time", "time-button"), 2);
  assert.equal(controller.requestClose(2), true);
  assert.equal(controller.completeDismissal(1), false);
  assert.deepEqual(events, ["show:date", "hide", "focus:date-button", "clear", "show:time", "hide"]);

  assert.equal(controller.completeDismissal(2), true);
  assert.deepEqual(events, [
    "show:date",
    "hide",
    "focus:date-button",
    "clear",
    "show:time",
    "hide",
    "focus:time-button",
    "clear",
  ]);
});

test("date and time picker sessions reject stale close tokens", () => {
  const events: string[] = [];
  const controller = createDateTimePickerModalSessionController<string, string>({
    show: (target) => events.push(`show:${target}`),
    hide: () => events.push("hide"),
    clear: () => events.push("clear"),
    focus: (trigger) => events.push(`focus:${trigger}`),
  });

  assert.equal(controller.open("date", "date-button"), 1);
  assert.equal(controller.requestClose(1), true);
  assert.equal(controller.completeDismissal(1), true);
  assert.equal(controller.open("time", "time-button"), 2);
  assert.equal(controller.requestClose(1), false);
  assert.deepEqual(events, ["show:date", "hide", "focus:date-button", "clear", "show:time"]);
  assert.equal(controller.requestClose(2), true);
});

test("date and time picker sessions identify only their current open token", () => {
  const controller = createDateTimePickerModalSessionController<string, string>({
    show: () => undefined,
    hide: () => undefined,
    clear: () => undefined,
    focus: () => undefined,
  });

  assert.equal(controller.isOpen(1), false);
  assert.equal(controller.open("date", "date-button"), 1);
  assert.equal(controller.isOpen(1), true);
  assert.equal(controller.isOpen(2), false);
  assert.equal(controller.requestClose(1), true);
  assert.equal(controller.isOpen(1), false);
  assert.equal(controller.completeDismissal(1), true);
  assert.equal(controller.open("time", "time-button"), 2);
  assert.equal(controller.isOpen(1), false);
  assert.equal(controller.isOpen(2), true);
});

test("date and time picker sessions still clear when the opener ref is unavailable", () => {
  const events: string[] = [];
  const controller = createDateTimePickerModalSessionController<string, string | null>({
    show: (target) => events.push(`show:${target}`),
    hide: () => events.push("hide"),
    clear: () => events.push("clear"),
    focus: (trigger) => events.push(`focus:${trigger ?? "none"}`),
  });

  assert.equal(controller.open("date", null), 1);
  assert.equal(controller.requestClose(1), true);
  assert.equal(controller.completeDismissal(1), true);
  assert.deepEqual(events, ["show:date", "hide", "focus:none", "clear"]);
});

test("native iOS date and time picker applies successive wheel changes without clearing", async () => {
  const handleChange = await loadDateTimePickerChangeHandler();
  const events: string[] = [];
  const input = {
    platform: "ios",
    eventType: "set",
    targetMode: "date",
    value: "current",
    applySelection: (value: string, selected: string, mode: string) => {
      events.push(`apply:${value}:${selected}:${mode}`);
      return `next:${selected}`;
    },
    onChange: (next: string) => events.push(`change:${next}`),
    closeIos: () => events.push("close"),
    clearNonIos: () => events.push("clear"),
    isIosSessionOpen: () => true,
  };

  handleChange({ ...input, selected: "first" });
  handleChange({ ...input, selected: "second" });

  assert.deepEqual(events, [
    "apply:current:first:date",
    "change:next:first",
    "apply:current:second:date",
    "change:next:second",
  ]);
});

test("native iOS date and time picker rejects a stale session selection", async () => {
  const handleChange = await loadDateTimePickerChangeHandler();
  const events: string[] = [];

  handleChange({
    platform: "ios",
    eventType: "set",
    selected: "stale",
    targetMode: "date",
    value: "current",
    applySelection: () => {
      events.push("apply");
      return "next";
    },
    onChange: () => events.push("change"),
    closeIos: () => events.push("close"),
    clearNonIos: () => events.push("clear"),
    isIosSessionOpen: () => false,
  });

  assert.deepEqual(events, []);
});

test("native iOS date and time picker dismissal requests modal close without clearing", async () => {
  const handleChange = await loadDateTimePickerChangeHandler();
  const events: string[] = [];

  handleChange({
    platform: "ios",
    eventType: "dismissed",
    selected: "ignored",
    targetMode: "time",
    value: "current",
    applySelection: () => {
      events.push("apply");
      return "next";
    },
    onChange: () => events.push("change"),
    closeIos: () => events.push("close"),
    clearNonIos: () => events.push("clear"),
    isIosSessionOpen: () => true,
  });

  assert.deepEqual(events, ["close"]);
});

test("native Android date and time picker applies a selection and clears immediately", async () => {
  const handleChange = await loadDateTimePickerChangeHandler();
  const events: string[] = [];

  handleChange({
    platform: "android",
    eventType: "set",
    selected: "selected",
    targetMode: "time",
    value: "current",
    applySelection: (value, selected, mode) => {
      events.push(`apply:${value}:${selected}:${mode}`);
      return "next";
    },
    onChange: (next) => events.push(`change:${next}`),
    closeIos: () => events.push("close"),
    clearNonIos: () => events.push("clear"),
    isIosSessionOpen: () => false,
  });

  assert.deepEqual(events, ["clear", "apply:current:selected:time", "change:next"]);
});

test("native Android date and time picker clears when selection is unavailable", async () => {
  const handleChange = await loadDateTimePickerChangeHandler();
  const events: string[] = [];

  handleChange({
    platform: "android",
    eventType: "set",
    targetMode: "date",
    value: "current",
    applySelection: () => {
      events.push("apply");
      return "next";
    },
    onChange: () => events.push("change"),
    closeIos: () => events.push("close"),
    clearNonIos: () => events.push("clear"),
    isIosSessionOpen: () => false,
  });

  assert.deepEqual(events, ["clear"]);

  events.length = 0;
  handleChange({
    platform: "android",
    eventType: "set",
    selected: "selected",
    targetMode: null,
    value: "current",
    applySelection: () => {
      events.push("apply");
      return "next";
    },
    onChange: () => events.push("change"),
    closeIos: () => events.push("close"),
    clearNonIos: () => events.push("clear"),
    isIosSessionOpen: () => false,
  });

  assert.deepEqual(events, ["clear"]);
});

test("native Android date and time picker dismissal clears without applying", async () => {
  const handleChange = await loadDateTimePickerChangeHandler();
  const events: string[] = [];

  handleChange({
    platform: "android",
    eventType: "dismissed",
    selected: "ignored",
    targetMode: "date",
    value: "current",
    applySelection: () => {
      events.push("apply");
      return "next";
    },
    onChange: () => events.push("change"),
    closeIos: () => events.push("close"),
    clearNonIos: () => events.push("clear"),
    isIosSessionOpen: () => false,
  });

  assert.deepEqual(events, ["clear"]);
});

test("Group Quest date and time control delegates platform change semantics to the tested handler", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const control = await readDateTimeControlSource();

  assert.match(
    source,
    /import \{ createDateTimePickerModalSessionController, handleNativeDateTimePickerChange \} from "\.\/src\/accessibility\/dateTimePickerModalSession";/,
  );
  assert.match(
    control,
    /const handleNativePickerChange = \(sessionId: number \| null, event: DateTimePickerEvent, selected\?: Date\) => \{\s*handleNativeDateTimePickerChange\(\{[\s\S]*platform: Platform\.OS,[\s\S]*eventType: event\.type,[\s\S]*selected,[\s\S]*targetMode: pickerTarget\?\.mode \?\? null,[\s\S]*applySelection: applyNativeDateTimeSelection,[\s\S]*onChange,[\s\S]*closeIos: \(\) => \{[\s\S]*closeNativePicker\(sessionId\);[\s\S]*clearNonIos:/,
  );
});

test("Group Quest date and time control scopes iOS callbacks to their modal session", async () => {
  const control = await readDateTimeControlSource();

  assert.match(
    control,
    /function closeNativePicker\(sessionId: number\) \{\s*pickerModalSession\.requestClose\(sessionId\);\s*\}/,
  );
  assert.match(
    control,
    /const handleNativePickerChange = \(sessionId: number \| null, event: DateTimePickerEvent, selected\?: Date\) => \{[\s\S]*isIosSessionOpen: \(\) => sessionId !== null && pickerModalSession\.isOpen\(sessionId\),/,
  );
  assert.match(
    control,
    /<Modal[^>]*onDismiss=\{\(\) => restoreNativePickerTriggerFocus\(pickerModalSessionId\)\}[^>]*onRequestClose=\{\(\) => closeNativePicker\(pickerModalSessionId\)\}/,
  );
  assert.match(
    control,
    /<DateTimePicker[\s\S]*onChange=\{\(event, selected\) => handleNativePickerChange\(pickerModalSessionId, event, selected\)\}/,
  );
});

test("native iOS date and time spinners expose Done", async () => {
  const control = await readDateTimeControlSource();

  assert.match(
    control,
    /<Pressable[^>]*accessibilityLabel=\{`Done choosing \$\{pickerTarget\.label\} \$\{pickerTarget\.mode\}`\}[^>]*onPress=\{\(\) => closeNativePicker\(pickerModalSessionId\)\}[^>]*>/,
  );
});

test("native iOS date and time spinner contains screen-reader navigation", async () => {
  const control = await readDateTimeControlSource();

  assert.match(
    control,
    /<Modal\s+key=\{pickerModalSessionId\}\s+visible=\{pickerModalVisible\}\s+transparent\s+animationType="fade"/,
  );
  assert.match(control, /onRequestClose=\{\(\) => closeNativePicker\(pickerModalSessionId\)\}/);
  assert.match(
    control,
    /<View\s+style=\{styles\.dateTimePickerBackdrop\}\s+accessibilityViewIsModal\s+onAccessibilityEscape=\{\(\) => closeNativePicker\(pickerModalSessionId\)\}>/,
  );
});

test("accessibility escape dismisses the native iOS date and time spinner", async () => {
  const control = await readDateTimeControlSource();

  assert.match(
    control,
    /<View\s+style=\{styles\.dateTimePickerSurface\}\s+accessibilityViewIsModal=\{Platform\.OS === "ios"\}\s+onAccessibilityEscape=\{\(\) => closeNativePicker\(pickerModalSessionId\)\}>/,
  );
  assert.match(
    control,
    /<Pressable[^>]*accessibilityLabel=\{`Done choosing \$\{pickerTarget\.label\} \$\{pickerTarget\.mode\}`\}[^>]*onPress=\{\(\) => closeNativePicker\(pickerModalSessionId\)\}[^>]*>/,
  );
});

test("native iOS date and time spinner moves screen-reader focus to Done", async () => {
  const control = await readDateTimeControlSource();

  assert.match(control, /const pickerDoneButtonRef = useRef<View>\(null\);/);
  assert.match(
    control,
    /function focusNativePickerDoneButton\(\) \{\s*const nodeHandle = findNodeHandle\(pickerDoneButtonRef\.current\);\s*if \(nodeHandle !== null\) AccessibilityInfo\.setAccessibilityFocus\(nodeHandle\);\s*\}/,
  );
  assert.match(
    control,
    /<Modal\s+key=\{pickerModalSessionId\}\s+visible=\{pickerModalVisible\}\s+transparent\s+animationType="fade"\s+onShow=\{focusNativePickerDoneButton\}[^>]*>/,
  );
  assert.match(
    control,
    /<Pressable\s+ref=\{pickerDoneButtonRef\}[^>]*accessibilityLabel=\{`Done choosing \$\{pickerTarget\.label\} \$\{pickerTarget\.mode\}`\}/,
  );
});

test("native iOS date and time spinner serializes open, close, and dismissal through one session", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const control = await readDateTimeControlSource();

  assert.match(
    source,
    /import \{ createDateTimePickerModalSessionController, handleNativeDateTimePickerChange \} from "\.\/src\/accessibility\/dateTimePickerModalSession";/,
  );
  assert.match(control, /const \[pickerModalVisible, setPickerModalVisible\] = useState\(false\);/);
  assert.match(control, /const \[pickerModalSessionId, setPickerModalSessionId\] = useState<number \| null>\(null\);/);
  assert.match(control, /const dateButtonRef = useRef<View>\(null\);/);
  assert.match(control, /const timeButtonRef = useRef<View>\(null\);/);
  assert.doesNotMatch(control, /pickerTriggerRef/);
  assert.match(
    control,
    /createDateTimePickerModalSessionController<Exclude<NativeDateTimePickerTarget, null>, View \| null>\(\{[\s\S]*show: \(target, sessionId\) => \{[\s\S]*setPickerTarget\(target\);[\s\S]*setPickerModalSessionId\(sessionId\);[\s\S]*setPickerModalVisible\(true\);[\s\S]*hide: \(\) => setPickerModalVisible\(false\),[\s\S]*clear: \(\) => \{[\s\S]*setPickerTarget\(null\);[\s\S]*setPickerModalSessionId\(null\);[\s\S]*focus: \(trigger\) => \{[\s\S]*findNodeHandle\(trigger\)[\s\S]*AccessibilityInfo\.setAccessibilityFocus\(nodeHandle\)/,
  );
  assert.match(
    control,
    /function openNativePicker\([\s\S]*if \(Platform\.OS === "ios"\) \{[\s\S]*pickerModalSession\.open\(target, trigger\);[\s\S]*return;[\s\S]*\}[\s\S]*setPickerTarget\(target\);/,
  );
  assert.match(
    control,
    /function restoreNativePickerTriggerFocus\(sessionId: number\) \{\s*pickerModalSession\.completeDismissal\(sessionId\);\s*\}/,
  );
  assert.match(
    control,
    /function closeNativePicker\(sessionId: number\) \{\s*pickerModalSession\.requestClose\(sessionId\);\s*\}/,
  );
  assert.match(
    control,
    /<Pressable\s+ref=\{dateButtonRef\}[^>]*onPress=\{\(\) => openNativePicker\(\{ label, mode: "date" \}, dateButtonRef\.current\)\}/,
  );
  assert.match(
    control,
    /<Pressable\s+ref=\{timeButtonRef\}[^>]*onPress=\{\(\) => openNativePicker\(\{ label, mode: "time" \}, timeButtonRef\.current\)\}/,
  );
  assert.match(
    control,
    /\{pickerTarget \? \(\s*Platform\.OS === "ios" \? \(\s*pickerModalSessionId !== null \? \(\s*<Modal\s+key=\{pickerModalSessionId\}\s+visible=\{pickerModalVisible\}[^>]*onDismiss=\{\(\) => restoreNativePickerTriggerFocus\(pickerModalSessionId\)\}[^>]*onRequestClose=\{\(\) => closeNativePicker\(pickerModalSessionId\)\}/,
  );
});

test("native iOS date and time spinner Done control has a 44-point touch target", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");

  assert.match(
    source,
    /dateTimePickerDoneButton:\s*\{[^}]*minHeight:\s*44,[^}]*minWidth:\s*76,/,
  );
});
