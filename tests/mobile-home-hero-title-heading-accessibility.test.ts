import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

function findFunction(sourceFile: ts.SourceFile, name: string): ts.FunctionDeclaration {
  const declaration = sourceFile.statements.find(
    (statement): statement is ts.FunctionDeclaration => ts.isFunctionDeclaration(statement)
      && statement.name?.text === name,
  );
  assert.ok(declaration?.body, `Expected ${name}`);
  return declaration;
}

test("native Home hero title exposes a screen-reader heading", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const sourceFile = ts.createSourceFile("App.tsx", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const home = findFunction(sourceFile, "HomeScreen");
  const titles: ts.JsxElement[] = [];

  const inspect = (node: ts.Node) => {
    if (ts.isJsxElement(node)
      && node.openingElement.tagName.getText(sourceFile) === "Text"
      && node.children.some((child) => ts.isJsxText(child)
        && child.getText(sourceFile).trim() === "Chess, but with stupidly hard side quests.")) {
      titles.push(node);
    }
    ts.forEachChild(node, inspect);
  };
  inspect(home.body!);
  assert.equal(titles.length, 1, "Expected the Home hero title");

  const role = titles[0]!.openingElement.attributes.properties.find(
    (property): property is ts.JsxAttribute => ts.isJsxAttribute(property)
      && property.name.getText(sourceFile) === "accessibilityRole",
  );
  assert.ok(role?.initializer && ts.isStringLiteral(role.initializer));
  assert.equal(role.initializer.text, "header");
});
