import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

async function readMultiplayerCreateModalSource() {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const start = source.indexOf("function MultiplayerSideQuestsScreen");
  const end = source.indexOf("function OfficialMultiplayerLeaderboardsScreen", start);

  assert.notEqual(start, -1);
  assert.notEqual(end, -1);
  return source.slice(start, end);
}

test("native Multiplayer creator modal contains screen-reader navigation", async () => {
  const screen = await readMultiplayerCreateModalSource();

  assert.match(
    screen,
    /<SafeAreaView\s+style=\{compactStyles\.detailScreen\}\s+accessibilityViewIsModal(?:\s|>)/,
  );
});

test("accessibility escape uses the Multiplayer creator discard guard", async () => {
  const screen = await readMultiplayerCreateModalSource();

  assert.match(
    screen,
    /const createBuilderModalAccessibility = createModalAccessibilityController\(\{[\s\S]*dismiss: closeCreateBuilder,[\s\S]*\}\);/,
  );
  assert.match(
    screen,
    /<Modal\s+visible=\{createOpen\}[^>]*onRequestClose=\{createBuilderModalAccessibility\.dismiss\}[^>]*>/,
  );
  assert.match(
    screen,
    /<SafeAreaView\s+style=\{compactStyles\.detailScreen\}\s+accessibilityViewIsModal\s+onAccessibilityEscape=\{createBuilderModalAccessibility\.dismiss\}\s*>/,
  );
  assert.match(
    screen,
    /<Pressable\s+[^>]*accessibilityLabel="Close create Multiplayer Side Quest"[^>]*onPress=\{createBuilderModalAccessibility\.dismiss\}[^>]*>/,
  );
});

test("native Multiplayer creator modal moves screen-reader focus to its close button", async () => {
  const screen = await readMultiplayerCreateModalSource();

  assert.match(screen, /const createBuilderCloseButtonRef = useRef<View>\(null\)/);
  assert.match(
    screen,
    /const createBuilderModalAccessibility = createModalAccessibilityController\(\{[\s\S]*getInitialFocusTarget: \(\) => createBuilderCloseButtonRef\.current,[\s\S]*findNodeHandle,[\s\S]*setAccessibilityFocus: AccessibilityInfo\.setAccessibilityFocus,[\s\S]*\}\);/,
  );
  assert.match(
    screen,
    /<Modal\s+visible=\{createOpen\}[^>]*onShow=\{createBuilderModalAccessibility\.focusInitial\}[^>]*>/,
  );
  assert.match(
    screen,
    /<Pressable\s+ref=\{createBuilderCloseButtonRef\}\s+accessibilityRole="button"\s+accessibilityLabel="Close create Multiplayer Side Quest"/,
  );
});

test("native Multiplayer creator title exposes a screen-reader heading", async () => {
  const screen = await readMultiplayerCreateModalSource();
  const sourceFile = ts.createSourceFile(
    "MultiplayerSideQuestsScreen.tsx",
    screen,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const matchingTitles: ts.JsxElement[] = [];

  const inspect = (node: ts.Node) => {
    if (ts.isJsxElement(node) && node.openingElement.tagName.getText(sourceFile) === "Text") {
      const visibleText = node.children
        .filter(ts.isJsxText)
        .map((child) => child.text)
        .join("")
        .replace(/\s+/g, " ")
        .trim();
      const style = node.openingElement.attributes.properties.find(
        (property): property is ts.JsxAttribute => ts.isJsxAttribute(property)
          && property.name.getText(sourceFile) === "style",
      );
      const styleExpression = style?.initializer
        && ts.isJsxExpression(style.initializer)
        && style.initializer.expression;
      const isDetailTitleStyle = styleExpression
        && ts.isPropertyAccessExpression(styleExpression)
        && ts.isIdentifier(styleExpression.expression)
        && styleExpression.expression.text === "compactStyles"
        && styleExpression.name.text === "detailTitle";
      if (visibleText === "Start a shared Multiplayer Side Quest."
          && isDetailTitleStyle) {
        matchingTitles.push(node);
      }
    }
    ts.forEachChild(node, inspect);
  };

  inspect(sourceFile);

  assert.equal(matchingTitles.length, 1, "Expected exactly one rendered Multiplayer creator modal title");
  const role = matchingTitles[0]?.openingElement.attributes.properties.find(
    (property): property is ts.JsxAttribute => ts.isJsxAttribute(property)
      && property.name.getText(sourceFile) === "accessibilityRole",
  );

  assert.ok(role?.initializer && ts.isStringLiteral(role.initializer));
  assert.equal(role.initializer.text, "header");
});
