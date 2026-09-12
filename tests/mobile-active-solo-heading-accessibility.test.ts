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

test("native active Solo Side Quest title exposes a screen-reader heading", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const sourceFile = ts.createSourceFile("App.tsx", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const dashboard = findFunction(sourceFile, "TodayDashboard");
  const activeSoloCards: ts.JsxElement[] = [];

  const inspectDashboard = (node: ts.Node) => {
    if (ts.isJsxElement(node)
      && node.openingElement.tagName.getText(sourceFile) === "Pressable"
      && hasCompactStyle(node.openingElement, sourceFile, "activeSoloSection")) {
      activeSoloCards.push(node);
    }
    ts.forEachChild(node, inspectDashboard);
  };
  inspectDashboard(dashboard.body!);
  assert.equal(activeSoloCards.length, 1, "Expected the rendered active Solo Side Quest card");

  const titles: ts.JsxElement[] = [];
  const inspectCard = (node: ts.Node) => {
    if (ts.isJsxElement(node)
      && node.openingElement.tagName.getText(sourceFile) === "Text"
      && hasCompactStyle(node.openingElement, sourceFile, "currentQuestHeroTitle")) {
      titles.push(node);
    }
    ts.forEachChild(node, inspectCard);
  };
  inspectCard(activeSoloCards[0]!);
  assert.equal(titles.length, 1, "Expected the active Solo Side Quest title");

  const role = titles[0]!.openingElement.attributes.properties.find(
    (property): property is ts.JsxAttribute => ts.isJsxAttribute(property)
      && property.name.getText(sourceFile) === "accessibilityRole",
  );
  assert.ok(role?.initializer && ts.isStringLiteral(role.initializer));
  assert.equal(role.initializer.text, "header");
});
