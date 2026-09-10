import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { getPasswordAuthFieldSemantics } from "../apps/mobile/src/accessibility/passwordAuthFieldSemantics";

test("native password authentication fields expose mode-specific labels and autofill purposes", () => {
  assert.deepEqual(getPasswordAuthFieldSemantics("sign-in"), {
    identifier: {
      accessibilityLabel: "Email or username",
      autoComplete: "username",
    },
    password: {
      accessibilityLabel: "Password",
      autoComplete: "current-password",
    },
    verificationCode: {
      accessibilityLabel: "Verification code",
      autoComplete: "one-time-code",
    },
  });

  assert.deepEqual(getPasswordAuthFieldSemantics("sign-up"), {
    identifier: {
      accessibilityLabel: "Email or username",
      autoComplete: "username",
    },
    password: {
      accessibilityLabel: "Password",
      autoComplete: "new-password",
    },
    verificationCode: {
      accessibilityLabel: "Verification code",
      autoComplete: "one-time-code",
    },
  });

  assert.deepEqual(getPasswordAuthFieldSemantics("reset"), {
    identifier: {
      accessibilityLabel: "Account email address",
      autoComplete: "email",
    },
    password: {
      accessibilityLabel: "New password",
      autoComplete: "new-password",
    },
    verificationCode: {
      accessibilityLabel: "Verification code",
      autoComplete: "one-time-code",
    },
  });
});

test("native password authentication inputs consume the shared semantics", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const panelStart = source.indexOf("function PasswordAuthPanel");
  const panelEnd = source.indexOf("function MobileAccountStatesCard", panelStart);
  const panel = source.slice(panelStart, panelEnd);

  assert.notEqual(panelStart, -1);
  assert.notEqual(panelEnd, -1);
  assert.match(source, /import \{ getPasswordAuthFieldSemantics \} from "\.\/src\/accessibility\/passwordAuthFieldSemantics";/);
  assert.match(panel, /const passwordAuthFieldSemantics = getPasswordAuthFieldSemantics\(mode\);/);
  assert.match(panel, /<TextInput \{\.\.\.passwordAuthFieldSemantics\.identifier\} value=\{identifier\}/);
  assert.match(panel, /<TextInput \{\.\.\.passwordAuthFieldSemantics\.password\} value=\{password\}/);
  assert.match(panel, /<TextInput \{\.\.\.passwordAuthFieldSemantics\.verificationCode\} value=\{verificationCode\}/);
});

test("native password authentication announces dynamic feedback", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const panelStart = source.indexOf("function PasswordAuthPanel");
  const panelEnd = source.indexOf("function MobileAccountStatesCard", panelStart);
  const panel = source.slice(panelStart, panelEnd);

  assert.notEqual(panelStart, -1);
  assert.notEqual(panelEnd, -1);
  assert.match(panel, /\{message \? <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style=\{styles\.successCopy\}>\{message\}<\/Text> : null\}/);
  assert.match(panel, /\{error \? <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style=\{styles\.errorCopy\}>\{error\}<\/Text> : null\}/);
});
