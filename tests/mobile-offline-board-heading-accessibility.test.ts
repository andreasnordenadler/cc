import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

test("native offline board state exposes its visible title as a heading", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const start = source.indexOf("function MobileShell(");
  const end = source.indexOf("function FixedScreenCloseButton(", start);
  assert.ok(start >= 0 && end > start, "the native mobile shell must be present");

  const sourceFile = ts.createSourceFile(
    "AppShell.tsx",
    source.slice(start, end),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const matches: ts.JsxElement[] = [];
  const inspect = (node: ts.Node) => {
    if (ts.isJsxElement(node) && node.openingElement.tagName.getText(sourceFile) === "Text") {
      const visibleText = node.children.filter(ts.isJsxText).map((child) => child.text).join("").replace(/\s+/g, " ").trim();
      if (visibleText === "Offline Side Quest board") matches.push(node);
    }
    ts.forEachChild(node, inspect);
  };
  inspect(sourceFile);

  assert.equal(matches.length, 1, "Expected the rendered offline board title");
  const role = matches[0]?.openingElement.attributes.properties.find(
    (property): property is ts.JsxAttribute => ts.isJsxAttribute(property)
      && property.name.getText(sourceFile) === "accessibilityRole",
  );
  assert.ok(role?.initializer && ts.isStringLiteral(role.initializer));
  assert.equal(role.initializer.text, "header");
});
