import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

function unwrapParentheses(expression: ts.Expression): ts.Expression {
  let current = expression;
  while (ts.isParenthesizedExpression(current)) {
    current = current.expression;
  }
  return current;
}

function findFunction(sourceFile: ts.SourceFile, name: string): ts.FunctionDeclaration {
  const declaration = sourceFile.statements.find(
    (statement): statement is ts.FunctionDeclaration => ts.isFunctionDeclaration(statement)
      && statement.name?.text === name,
  );
  assert.ok(declaration?.body, `Expected ${name}`);
  return declaration;
}

function isIdentifierStringComparison(node: ts.Node, identifier: string, value: string): node is ts.BinaryExpression {
  if (!ts.isBinaryExpression(node)) return false;
  if (node.operatorToken.kind !== ts.SyntaxKind.EqualsEqualsEqualsToken) return false;

  const left = unwrapParentheses(node.left);
  const right = unwrapParentheses(node.right);
  return (ts.isIdentifier(left) && left.text === identifier && ts.isStringLiteral(right) && right.text === value)
    || (ts.isStringLiteral(left) && left.text === value && ts.isIdentifier(right) && right.text === identifier);
}

function textStyleName(node: ts.JsxElement, sourceFile: ts.SourceFile): string | null {
  const style = node.openingElement.attributes.properties.find(
    (property): property is ts.JsxAttribute => ts.isJsxAttribute(property)
      && property.name.getText(sourceFile) === "style",
  );
  const styleExpression = style?.initializer
    && ts.isJsxExpression(style.initializer)
    && style.initializer.expression;
  return styleExpression
    && ts.isPropertyAccessExpression(styleExpression)
    && ts.isIdentifier(styleExpression.expression)
    && styleExpression.expression.text === "compactStyles"
    ? styleExpression.name.text
    : null;
}

test("native Community Solo catalog title exposes a screen-reader heading", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const sourceFile = ts.createSourceFile(
    "App.tsx",
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );

  const activeScreen = findFunction(sourceFile, "ActiveScreen");
  const routeSwitches: ts.SwitchStatement[] = [];
  const inspectActiveScreen = (node: ts.Node) => {
    if (ts.isSwitchStatement(node) && ts.isIdentifier(node.expression) && node.expression.text === "activeTab") {
      routeSwitches.push(node);
    }
    ts.forEachChild(node, inspectActiveScreen);
  };
  inspectActiveScreen(activeScreen.body!);
  assert.equal(routeSwitches.length, 1, "Expected the actual ActiveScreen route switch");

  const sideQuestCase = routeSwitches[0]?.caseBlock.clauses.find(
    (clause): clause is ts.CaseClause => ts.isCaseClause(clause)
      && ts.isStringLiteral(clause.expression)
      && clause.expression.text === "sideQuests",
  );
  assert.ok(sideQuestCase, "Expected the Side Quests route case");
  const routeReturn = sideQuestCase.statements.find(ts.isReturnStatement);
  assert.ok(routeReturn?.expression, "Expected the Side Quests route return");
  const routeExpression = unwrapParentheses(routeReturn.expression);
  assert.ok(ts.isJsxSelfClosingElement(routeExpression));
  assert.equal(routeExpression.tagName.getText(sourceFile), "QuestBoardDashboard");

  const catalog = findFunction(sourceFile, "QuestBoardDashboard");
  const catalogReturn = catalog.body!.statements.findLast(ts.isReturnStatement);
  assert.ok(catalogReturn?.expression, "Expected the QuestBoardDashboard render return");

  const communityBranches: ts.Expression[] = [];
  const inspectCatalogRender = (node: ts.Node) => {
    if (ts.isConditionalExpression(node) && isIdentifierStringComparison(node.condition, "sideQuestCatalogTab", "community")) {
      communityBranches.push(unwrapParentheses(node.whenTrue));
    }
    ts.forEachChild(node, inspectCatalogRender);
  };
  inspectCatalogRender(catalogReturn.expression);
  assert.equal(communityBranches.length, 1, "Expected the rendered Community Solo catalog branch");

  const matchingTitles: ts.JsxElement[] = [];
  const inspectCommunityBranch = (node: ts.Node) => {
    if (ts.isJsxElement(node) && node.openingElement.tagName.getText(sourceFile) === "Text") {
      const visibleText = node.children
        .filter(ts.isJsxText)
        .map((child) => child.text)
        .join("")
        .replace(/\s+/g, " ")
        .trim();
      if (visibleText === "Community Side Quests" && textStyleName(node, sourceFile) === "communityEmptyTitle") {
        matchingTitles.push(node);
      }
    }
    ts.forEachChild(node, inspectCommunityBranch);
  };
  inspectCommunityBranch(communityBranches[0]!);

  assert.equal(matchingTitles.length, 1, "Expected the rendered Community Solo catalog title");
  const role = matchingTitles[0]?.openingElement.attributes.properties.find(
    (property): property is ts.JsxAttribute => ts.isJsxAttribute(property)
      && property.name.getText(sourceFile) === "accessibilityRole",
  );

  assert.ok(role?.initializer && ts.isStringLiteral(role.initializer));
  assert.equal(role.initializer.text, "header");
});
