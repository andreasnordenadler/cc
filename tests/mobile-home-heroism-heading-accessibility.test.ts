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

test("native Home heroism prompt exposes a screen-reader heading", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const sourceFile = ts.createSourceFile("App.tsx", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const home = findFunction(sourceFile, "HomeScreen");
  const prompts: ts.JsxElement[] = [];

  const inspect = (node: ts.Node) => {
    if (ts.isJsxElement(node)
      && node.openingElement.tagName.getText(sourceFile) === "Text"
      && node.children.some((child) => ts.isJsxText(child)
        && child.getText(sourceFile).trim() === "How heroic are you feeling today?")) {
      prompts.push(node);
    }
    ts.forEachChild(node, inspect);
  };
  inspect(home.body!);
  assert.equal(prompts.length, 1, "Expected the Home heroism prompt");

  const role = prompts[0]!.openingElement.attributes.properties.find(
    (property): property is ts.JsxAttribute => ts.isJsxAttribute(property)
      && property.name.getText(sourceFile) === "accessibilityRole",
  );
  assert.ok(role?.initializer && ts.isStringLiteral(role.initializer));
  assert.equal(role.initializer.text, "header");
});
