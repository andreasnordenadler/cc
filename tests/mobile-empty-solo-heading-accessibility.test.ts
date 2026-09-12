import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

function hasCompactStyle(node: ts.JsxOpeningLikeElement, sourceFile: ts.SourceFile, name: string) {
  return node.attributes.properties.some((property) => {
    if (!ts.isJsxAttribute(property) || property.name.getText(sourceFile) !== "style") return false;
    const expression = property.initializer
      && ts.isJsxExpression(property.initializer)
      && property.initializer.expression;
    return Boolean(
      expression
      && ts.isPropertyAccessExpression(expression)
      && ts.isIdentifier(expression.expression)
      && expression.expression.text === "compactStyles"
      && expression.name.text === name,
    );
  });
}

function findFunction(sourceFile: ts.SourceFile, name: string): ts.FunctionDeclaration {
  const declaration = sourceFile.statements.find(
    (statement): statement is ts.FunctionDeclaration => ts.isFunctionDeclaration(statement)
      && statement.name?.text === name,
  );
  assert.ok(declaration?.body, `Expected ${name}`);
  return declaration;
}

test("native empty Solo Side Quest prompt exposes a screen-reader heading", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const sourceFile = ts.createSourceFile("App.tsx", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const dashboard = findFunction(sourceFile, "TodayDashboard");
  const prompts: ts.JsxElement[] = [];

  const inspect = (node: ts.Node) => {
    if (ts.isJsxElement(node)
      && node.openingElement.tagName.getText(sourceFile) === "Text"
      && hasCompactStyle(node.openingElement, sourceFile, "currentQuestTitle")
      && node.children.some((child) => ts.isJsxText(child) && child.getText(sourceFile).trim() === "Choose a Solo Side Quest")) {
      prompts.push(node);
    }
    ts.forEachChild(node, inspect);
  };
  inspect(dashboard.body!);
  assert.equal(prompts.length, 1, "Expected the dashboard empty Solo Side Quest prompt");

  const role = prompts[0]!.openingElement.attributes.properties.find(
    (property): property is ts.JsxAttribute => ts.isJsxAttribute(property)
      && property.name.getText(sourceFile) === "accessibilityRole",
  );
  assert.ok(role?.initializer && ts.isStringLiteral(role.initializer));
  assert.equal(role.initializer.text, "header");
});
