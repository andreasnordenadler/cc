import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

function disabledPressableStates(source: string) {
  const sourceFile = ts.createSourceFile("mobile-disabled-state-audit.tsx", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const printer = ts.createPrinter({ removeComments: true });
  const buttons: Array<{
    label: string;
    interactionState?: string;
    announcedState?: string;
    auditError?: string;
  }> = [];

  const printExpression = (expression: ts.Expression) =>
    printer.printNode(ts.EmitHint.Expression, expression, sourceFile).trim();

  const propertyName = (name: ts.PropertyName) => {
    if (ts.isIdentifier(name) || ts.isStringLiteral(name)) return name.text;
    if (ts.isComputedPropertyName(name)) {
      let expression: ts.Expression = name.expression;
      while (ts.isParenthesizedExpression(expression)) expression = expression.expression;
      if (ts.isStringLiteralLike(expression)) return expression.text;
    }
    return undefined;
  };

  const unwrapParentheses = (expression: ts.Expression): ts.Expression =>
    ts.isParenthesizedExpression(expression) ? unwrapParentheses(expression.expression) : expression;

  const expressionText = (attribute: ts.JsxAttribute | undefined) => {
    const initializer = attribute?.initializer;
    if (!initializer || !ts.isJsxExpression(initializer) || !initializer.expression) return undefined;
    return printExpression(initializer.expression);
  };

  const inspect = (node: ts.Node) => {
    if ((ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) && node.tagName.getText(sourceFile) === "Pressable") {
      const properties = [...node.attributes.properties];
      const attribute = (name: string) => {
        let found: ts.JsxAttribute | undefined;
        for (const property of properties) {
          if (ts.isJsxAttribute(property) && property.name.getText(sourceFile) === name) found = property;
        }
        return found;
      };
      const disabledAttribute = attribute("disabled");
      if (disabledAttribute) {
        const interactionState = !disabledAttribute.initializer ? "true" : expressionText(disabledAttribute);
        const labelAttribute = attribute("accessibilityLabel");
        const labelInitializer = labelAttribute?.initializer;
        const label = labelInitializer && ts.isStringLiteral(labelInitializer)
          ? labelInitializer.text
          : expressionText(labelAttribute) ?? "unlabelled button";
        const accessibilityStateAttribute = attribute("accessibilityState");
        const accessibilityState = accessibilityStateAttribute?.initializer;
        const disabledIndex = properties.indexOf(disabledAttribute);
        const accessibilityStateIndex = accessibilityStateAttribute ? properties.indexOf(accessibilityStateAttribute) : -1;
        const jsxSpreadMayOverride = properties.some((property, index) =>
          ts.isJsxSpreadAttribute(property)
            && (index > disabledIndex || (accessibilityStateIndex >= 0 && index > accessibilityStateIndex)));
        const accessibilityExpression = accessibilityState && ts.isJsxExpression(accessibilityState) && accessibilityState.expression
          ? unwrapParentheses(accessibilityState.expression)
          : undefined;
        let disabledProperty: ts.PropertyAssignment | ts.ShorthandPropertyAssignment | undefined;
        let accessibilityStateSpreadMayOverride = false;
        let accessibilityStateMemberMayOverride = false;
        if (accessibilityExpression && ts.isObjectLiteralExpression(accessibilityExpression)) {
          for (const property of accessibilityExpression.properties) {
            if ((ts.isPropertyAssignment(property) || ts.isShorthandPropertyAssignment(property))
                && propertyName(property.name) === "disabled") {
              disabledProperty = property;
              accessibilityStateSpreadMayOverride = false;
              accessibilityStateMemberMayOverride = false;
            } else if (ts.isSpreadAssignment(property)) {
              accessibilityStateSpreadMayOverride = true;
            } else if (property.name && (propertyName(property.name) === "disabled" || propertyName(property.name) === undefined)) {
              accessibilityStateMemberMayOverride = true;
            }
          }
        }
        const announcedState = disabledProperty && ts.isPropertyAssignment(disabledProperty)
          ? printExpression(disabledProperty.initializer)
          : disabledProperty && ts.isShorthandPropertyAssignment(disabledProperty)
            ? disabledProperty.name.text
            : undefined;

        buttons.push({
          label,
          interactionState,
          announcedState,
          ...(!interactionState
            ? { auditError: "disabled must use a JSX expression or boolean shorthand" }
            : jsxSpreadMayOverride
              ? { auditError: "JSX spread may override disabled or accessibilityState" }
            : accessibilityStateSpreadMayOverride
              ? { auditError: "accessibilityState spread may override disabled" }
              : accessibilityStateMemberMayOverride
                ? { auditError: "accessibilityState member may override disabled" }
                : {}),
        });
      }
    }
    ts.forEachChild(node, inspect);
  };

  inspect(sourceFile);
  return buttons;
}

test("native specific-proof fields expose an explicit screen-reader label", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const inputs = [...source.matchAll(/<TextInput\b[\s\S]*?\/>/g)]
    .map((match) => match[0])
    .filter((input) => input.includes("value={proofGameReference}"));

  assert.equal(inputs.length, 2, "Expected official and custom Side Quest proof fields");
  for (const input of inputs) {
    assert.match(input, /accessibilityLabel="Specific proof game"/);
  }
});

test("native Solo Side Quest actions expose their disabled state", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const buttons = [...source.matchAll(/<Pressable\b[\s\S]*?>/g)].map((match) => match[0]);
  const expectedStates = new Map([
    ["Check latest game", "actionState.busy"],
    ["Submit specific game proof", "actionState.busy"],
    ["Deactivate quest", "actionState.busy"],
    ["Start this Side Quest", "actionState.busy"],
    ["Check latest game for custom Side Quest", "Boolean(proofBusy)"],
    ["Submit specific game proof for custom Side Quest", "Boolean(proofBusy)"],
    ["Deactivate custom Side Quest", "Boolean(proofBusy)"],
    ["Pick custom Side Quest", "busy || !canStart"],
  ]);

  for (const [label, disabledExpression] of expectedStates) {
    const matches = buttons.filter((button) => button.includes(`accessibilityLabel="${label}"`));
    assert.equal(matches.length, 1, `Expected one ${label} button`);
    assert.match(
      matches[0],
      new RegExp(`accessibilityState=\\{\\{ disabled: ${disabledExpression.replace(/[()|!.]/g, "\\$&")} \\}\\}`),
      `${label} must expose the same disabled state used by its interaction guard`,
    );
  }
});

test("every disabled native button exposes its exact interaction state", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const disabledButtons = disabledPressableStates(source);

  assert.ok(disabledButtons.length > 0, "Expected disabled native buttons");
  for (const button of disabledButtons) {
    assert.equal(button.auditError, undefined, `${button.label}: ${button.auditError}`);
    assert.ok(button.interactionState, `${button.label} must have a readable disabled interaction guard`);
    assert.equal(button.announcedState, button.interactionState, `${button.label} must announce its exact disabled interaction guard`);
  }
});

test("disabled-state audit handles reordered props and nested expressions", () => {
  const source = `
    const button = (
      <Pressable
        onPress={() => navigate("quests")}
        disabled={busy || (offline && !cached)}
        accessibilityState={{
          selected,
          disabled: busy || (offline && !cached),
        }}
      />
    );
  `;

  assert.deepEqual(disabledPressableStates(source), [{
    label: "unlabelled button",
    interactionState: "busy || (offline && !cached)",
    announcedState: "busy || (offline && !cached)",
  }]);
});

test("disabled-state audit handles a boolean disabled prop", () => {
  const source = `<Pressable disabled accessibilityState={{ disabled: true }} />`;

  assert.deepEqual(disabledPressableStates(source), [{
    label: "unlabelled button",
    interactionState: "true",
    announcedState: "true",
  }]);
});

test("disabled-state audit preserves whitespace inside expression literals", () => {
  const source = `<Pressable disabled={value === "a  b"} accessibilityState={{ disabled: value === "a b" }} />`;
  const [button] = disabledPressableStates(source);

  assert.notEqual(button.announcedState, button.interactionState);
});

test("disabled-state audit reports an unsupported disabled initializer", () => {
  const source = `<Pressable disabled="true" accessibilityState={{ disabled: true }} />`;

  assert.deepEqual(disabledPressableStates(source), [{
    label: "unlabelled button",
    interactionState: undefined,
    announcedState: "true",
    auditError: "disabled must use a JSX expression or boolean shorthand",
  }]);
});

test("disabled-state audit handles accessibility-state shorthand", () => {
  const source = `<Pressable disabled={disabled} accessibilityState={{ disabled }} />`;

  assert.deepEqual(disabledPressableStates(source), [{
    label: "unlabelled button",
    interactionState: "disabled",
    announcedState: "disabled",
  }]);
});

test("disabled-state audit handles a quoted disabled property", () => {
  const source = `<Pressable disabled={busy} accessibilityState={{ "disabled": busy }} />`;

  assert.deepEqual(disabledPressableStates(source), [{
    label: "unlabelled button",
    interactionState: "busy",
    announcedState: "busy",
  }]);
});

test("disabled-state audit handles a parenthesized accessibility state", () => {
  const source = `<Pressable disabled={busy} accessibilityState={({ disabled: busy })} />`;

  assert.deepEqual(disabledPressableStates(source), [{
    label: "unlabelled button",
    interactionState: "busy",
    announcedState: "busy",
  }]);
});

test("disabled-state audit reports an overriding accessibility-state spread", () => {
  const source = `<Pressable disabled={busy} accessibilityState={{ disabled: busy, ...{ disabled: !busy } }} />`;

  assert.deepEqual(disabledPressableStates(source), [{
    label: "unlabelled button",
    interactionState: "busy",
    announcedState: "busy",
    auditError: "accessibilityState spread may override disabled",
  }]);
});

test("disabled-state audit reports an overriding JSX spread", () => {
  const source = `<Pressable disabled={busy} accessibilityState={{ disabled: busy }} {...{ disabled: !busy }} />`;

  assert.deepEqual(disabledPressableStates(source), [{
    label: "unlabelled button",
    interactionState: "busy",
    announcedState: "busy",
    auditError: "JSX spread may override disabled or accessibilityState",
  }]);
});

test("disabled-state audit resolves a computed disabled literal", () => {
  const source = `<Pressable disabled={busy} accessibilityState={{ disabled: busy, ["disabled"]: !busy }} />`;

  assert.deepEqual(disabledPressableStates(source), [{
    label: "unlabelled button",
    interactionState: "busy",
    announcedState: "!busy",
  }]);
});

test("disabled-state audit reports a dynamic computed override", () => {
  const source = `<Pressable disabled={busy} accessibilityState={{ disabled: busy, [key]: !busy }} />`;

  assert.deepEqual(disabledPressableStates(source), [{
    label: "unlabelled button",
    interactionState: "busy",
    announcedState: "busy",
    auditError: "accessibilityState member may override disabled",
  }]);
});
