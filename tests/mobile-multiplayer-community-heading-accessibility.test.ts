import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

test("native Community Multiplayer catalog title exposes a screen-reader heading", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const activeScreenStart = source.indexOf("function ActiveScreen(");
  const activeScreenEnd = source.indexOf("function SideQuestsScreen(", activeScreenStart);
  const catalogStart = source.indexOf("function MultiplayerSideQuestsScreen(");
  const catalogEnd = source.indexOf("function OfficialMultiplayerLeaderboardsScreen(", catalogStart);

  assert.notEqual(activeScreenStart, -1, "Expected ActiveScreen");
  assert.notEqual(activeScreenEnd, -1, "Expected the next component after ActiveScreen");
  assert.notEqual(catalogStart, -1, "Expected MultiplayerSideQuestsScreen");
  assert.notEqual(catalogEnd, -1, "Expected the next component after MultiplayerSideQuestsScreen");
  assert.match(
    source.slice(activeScreenStart, activeScreenEnd),
    /case "multiplayerSideQuests":\s+return <MultiplayerSideQuestsScreen\b/,
  );

  const catalog = source.slice(catalogStart, catalogEnd);
  const sourceFile = ts.createSourceFile(
    "MultiplayerSideQuestsScreen.tsx",
    catalog,
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
      const isCommunityTitleStyle = styleExpression
        && ts.isPropertyAccessExpression(styleExpression)
        && ts.isIdentifier(styleExpression.expression)
        && styleExpression.expression.text === "compactStyles"
        && styleExpression.name.text === "communityEmptyTitle";

      if (visibleText === "Community Multiplayer Side Quests" && isCommunityTitleStyle) {
        matchingTitles.push(node);
      }
    }
    ts.forEachChild(node, inspect);
  };

  inspect(sourceFile);

  assert.equal(matchingTitles.length, 1, "Expected the rendered Community Multiplayer catalog title");
  const role = matchingTitles[0]?.openingElement.attributes.properties.find(
    (property): property is ts.JsxAttribute => ts.isJsxAttribute(property)
      && property.name.getText(sourceFile) === "accessibilityRole",
  );

  assert.ok(role?.initializer && ts.isStringLiteral(role.initializer));
  assert.equal(role.initializer.text, "header");
});
