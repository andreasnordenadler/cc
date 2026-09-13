import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

test("native finished Multiplayer shelf exposes its visible section title as a heading", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const start = source.indexOf("function MultiplayerSideQuestsScreen(");
  const end = source.indexOf("function OfficialMultiplayerLeaderboardsScreen(", start);
  assert.ok(start >= 0 && end > start, "the Multiplayer Side Quests screen must be present");

  const sourceFile = ts.createSourceFile(
    "MultiplayerSideQuestsScreen.tsx",
    source.slice(start, end),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const matches: ts.JsxElement[] = [];
  const inspect = (node: ts.Node) => {
    if (ts.isJsxElement(node) && node.openingElement.tagName.getText(sourceFile) === "Text") {
      const visibleText = node.children.filter(ts.isJsxText).map((child) => child.text).join("").replace(/\s+/g, " ").trim();
      if (visibleText === "Recently finished Multiplayer Side Quests.") matches.push(node);
    }
    ts.forEachChild(node, inspect);
  };
  inspect(sourceFile);

  assert.equal(matches.length, 1, "Expected the rendered finished Multiplayer shelf title");
  const role = matches[0]?.openingElement.attributes.properties.find(
    (property): property is ts.JsxAttribute => ts.isJsxAttribute(property)
      && property.name.getText(sourceFile) === "accessibilityRole",
  );
  assert.ok(role?.initializer && ts.isStringLiteral(role.initializer));
  assert.equal(role.initializer.text, "header");
});
