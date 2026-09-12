import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

async function readOfficialWeekArchiveModalSource() {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const componentStart = source.indexOf("function OfficialMultiplayerLeaderboardsScreen");
  const componentEnd = source.indexOf("function getChallengesByIds", componentStart);
  const modalStart = source.indexOf(
    "<Modal visible={Boolean(selectedWeek)}",
    componentStart,
  );
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

test("native official week archive modal contains screen-reader navigation", async () => {
  const { modal } = await readOfficialWeekArchiveModalSource();

  assert.match(
    modal,
    /<SafeAreaView\s+style=\{compactStyles\.detailScreen\}\s+accessibilityViewIsModal(?:\s|>)/,
  );
});

test("accessibility escape closes the native official week archive modal", async () => {
  const { component, modal } = await readOfficialWeekArchiveModalSource();

  assert.match(
    component,
    /function closeSelectedWeekArchive\(\) \{\s*setSelectedWeekId\(null\);\s*\}/,
  );
  assert.match(
    modal,
    /<Modal\s+visible=\{Boolean\(selectedWeek\)\}[^>]*onRequestClose=\{closeSelectedWeekArchive\}[^>]*>/,
  );
  assert.match(
    modal,
    /<SafeAreaView\s+style=\{compactStyles\.detailScreen\}\s+accessibilityViewIsModal\s+onAccessibilityEscape=\{closeSelectedWeekArchive\}\s*>/,
  );
  assert.match(
    modal,
    /<Pressable\s+[^>]*accessibilityLabel="Close official weekly results"[^>]*onPress=\{closeSelectedWeekArchive\}[^>]*>/,
  );
});

test("native official week archive modal moves screen-reader focus to its close button", async () => {
  const { component, modal } = await readOfficialWeekArchiveModalSource();

  assert.match(component, /const selectedWeekArchiveCloseButtonRef = useRef<View>\(null\)/);
  const focusHandlerPattern = /function focusSelectedWeekArchiveCloseButton\(\) \{\s*const nodeHandle = findNodeHandle\(selectedWeekArchiveCloseButtonRef\.current\);\s*if \(nodeHandle !== null\) AccessibilityInfo\.setAccessibilityFocus\(nodeHandle\);\s*\}/;
  assert.match(component, focusHandlerPattern);
  assert.doesNotMatch(
    `function focusSelectedWeekArchiveCloseButton() {}\nfunction unusedDecoy() {\n  const nodeHandle = findNodeHandle(selectedWeekArchiveCloseButtonRef.current);\n  if (nodeHandle !== null) AccessibilityInfo.setAccessibilityFocus(nodeHandle);\n}`,
    focusHandlerPattern,
  );
  assert.match(
    modal,
    /<Modal\s+visible=\{Boolean\(selectedWeek\)\}[^>]*onShow=\{focusSelectedWeekArchiveCloseButton\}[^>]*>/,
  );
  assert.match(
    modal,
    /<Pressable\s+ref=\{selectedWeekArchiveCloseButtonRef\}\s+accessibilityRole="button"\s+accessibilityLabel="Close official weekly results"/,
  );
});

test("native official week archive title exposes a screen-reader heading", async () => {
  const { modal } = await readOfficialWeekArchiveModalSource();
  const sourceFile = ts.createSourceFile(
    "OfficialWeekArchiveModal.tsx",
    modal,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const matchingTitles: ts.JsxElement[] = [];

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
      const isWeekTitle = childExpression
        && ts.isPropertyAccessExpression(childExpression)
        && ts.isIdentifier(childExpression.expression)
        && childExpression.expression.text === "selectedWeek"
        && childExpression.name.text === "label";
      const isDetailTitleStyle = styleExpression
        && ts.isPropertyAccessExpression(styleExpression)
        && ts.isIdentifier(styleExpression.expression)
        && styleExpression.expression.text === "compactStyles"
        && styleExpression.name.text === "detailTitle";

      if (isWeekTitle && isDetailTitleStyle) matchingTitles.push(node);
    }
    ts.forEachChild(node, inspect);
  };

  inspect(sourceFile);

  assert.equal(matchingTitles.length, 1, "Expected exactly one rendered official week archive title");
  const role = matchingTitles[0]?.openingElement.attributes.properties.find(
    (property): property is ts.JsxAttribute => ts.isJsxAttribute(property)
      && property.name.getText(sourceFile) === "accessibilityRole",
  );

  assert.ok(role?.initializer && ts.isStringLiteral(role.initializer));
  assert.equal(role.initializer.text, "header");
});
