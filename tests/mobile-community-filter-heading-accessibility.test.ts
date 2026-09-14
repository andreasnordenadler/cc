import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

test("native Community creator filter shelf exposes its visible title as a screen-reader heading", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const sourceFile = ts.createSourceFile("App.tsx", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const titles: ts.JsxElement[] = [];

  const inspect = (node: ts.Node) => {
    if (ts.isJsxElement(node) && node.openingElement.tagName.getText(sourceFile) === "Text") {
      const text = node.children.map((child) => child.getText(sourceFile)).join("").replace(/\s+/g, " ").trim();
      if (text === "Creator shelf: {communityCreatorFilter}") titles.push(node);
    }
    ts.forEachChild(node, inspect);
  };
  inspect(sourceFile);

  assert.equal(titles.length, 1, "Expected the visible Community creator filter shelf title");
  const role = titles[0]?.openingElement.attributes.properties.find(
    (property): property is ts.JsxAttribute => ts.isJsxAttribute(property)
      && property.name.getText(sourceFile) === "accessibilityRole",
  );
  assert.ok(role?.initializer && ts.isStringLiteral(role.initializer));
  assert.equal(role.initializer.text, "header");
});
