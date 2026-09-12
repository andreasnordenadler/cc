import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

async function readCompletionCelebrationOverlaySource() {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const componentStart = source.indexOf("function CompletionCelebrationOverlay");
  const componentEnd = source.indexOf("function CelebrationParticles", componentStart);
  const modalStart = source.indexOf("<Modal visible transparent", componentStart);
  const modalEnd = source.indexOf("</Modal>", modalStart);

  assert.notEqual(componentStart, -1);
  assert.notEqual(componentEnd, -1);
  assert.ok(modalStart > componentStart && modalStart < componentEnd);
  assert.ok(modalEnd > modalStart && modalEnd < componentEnd);
  return {
    component: source.slice(componentStart, componentEnd),
    modal: source.slice(modalStart, modalEnd + "</Modal>".length),
  };
}

test("native completion celebration contains screen-reader navigation", async () => {
  const { modal } = await readCompletionCelebrationOverlaySource();

  assert.match(
    modal,
    /<View\s+style=\{compactStyles\.celebrationBackdrop\}\s+accessibilityViewIsModal(?:\s|>)/,
  );
});

test("accessibility escape closes the native completion celebration", async () => {
  const { modal } = await readCompletionCelebrationOverlaySource();

  assert.match(
    modal,
    /<Modal\s+visible\s+transparent[^>]*onRequestClose=\{onClose\}[^>]*>/,
  );
  assert.match(
    modal,
    /<View\s+style=\{compactStyles\.celebrationBackdrop\}\s+accessibilityViewIsModal\s+onAccessibilityEscape=\{onClose\}\s*>/,
  );
  assert.match(
    modal,
    /<Pressable\s+[^>]*accessibilityLabel="Close celebration"[^>]*onPress=\{onClose\}[^>]*>/,
  );
});

test("native completion celebration moves screen-reader focus to its close button", async () => {
  const { component, modal } = await readCompletionCelebrationOverlaySource();

  assert.match(component, /const celebrationCloseButtonRef = useRef<View>\(null\)/);
  const focusHandlerPattern = /function focusCelebrationCloseButton\(\) \{\s*const nodeHandle = findNodeHandle\(celebrationCloseButtonRef\.current\);\s*if \(nodeHandle !== null\) AccessibilityInfo\.setAccessibilityFocus\(nodeHandle\);\s*\}/;
  assert.match(component, focusHandlerPattern);
  assert.doesNotMatch(
    `function focusCelebrationCloseButton() {}\nfunction unusedDecoy() {\n  const nodeHandle = findNodeHandle(celebrationCloseButtonRef.current);\n  if (nodeHandle !== null) AccessibilityInfo.setAccessibilityFocus(nodeHandle);\n}`,
    focusHandlerPattern,
  );
  assert.match(
    modal,
    /<Modal\s+visible\s+transparent[^>]*onShow=\{focusCelebrationCloseButton\}[^>]*>/,
  );
  assert.match(
    modal,
    /<Pressable\s+ref=\{celebrationCloseButtonRef\}\s+accessibilityRole="button"\s+accessibilityLabel="Close celebration"/,
  );
});

test("native completion celebration headline exposes a screen-reader heading", async () => {
  const { modal } = await readCompletionCelebrationOverlaySource();
  const sourceFile = ts.createSourceFile(
    "CompletionCelebrationOverlay.tsx",
    modal,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const matchingHeadlines: ts.JsxElement[] = [];

  const inspect = (node: ts.Node) => {
    if (ts.isJsxElement(node) && node.openingElement.tagName.getText(sourceFile) === "Text") {
      const childExpression = node.children.find(ts.isJsxExpression)?.expression;
      const style = node.openingElement.attributes.properties.find(
        (property): property is ts.JsxAttribute => ts.isJsxAttribute(property)
          && property.name.getText(sourceFile) === "style",
      );
      const styleExpression = style?.initializer
        && ts.isJsxExpression(style.initializer)
        && style.initializer.expression;
      const isHeadline = childExpression
        && ts.isIdentifier(childExpression)
        && childExpression.text === "headline";
      const isHeadlineStyle = styleExpression
        && ts.isPropertyAccessExpression(styleExpression)
        && ts.isIdentifier(styleExpression.expression)
        && styleExpression.expression.text === "compactStyles"
        && styleExpression.name.text === "celebrationHeadline";

      if (isHeadline && isHeadlineStyle) matchingHeadlines.push(node);
    }
    ts.forEachChild(node, inspect);
  };

  inspect(sourceFile);

  assert.equal(matchingHeadlines.length, 1, "Expected exactly one rendered celebration headline");
  const role = matchingHeadlines[0]?.openingElement.attributes.properties.find(
    (property): property is ts.JsxAttribute => ts.isJsxAttribute(property)
      && property.name.getText(sourceFile) === "accessibilityRole",
  );

  assert.ok(role?.initializer && ts.isStringLiteral(role.initializer));
  assert.equal(role.initializer.text, "header");
});
