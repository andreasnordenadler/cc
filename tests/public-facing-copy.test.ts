import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { extname, join } from "node:path";
import test from "node:test";
import ts from "typescript";

const sourceRoots = ["src", "apps/mobile"];
const sourceExtensions = new Set([".ts", ".tsx"]);

function sourceFiles(path: string): string[] {
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) => {
    const child = join(path, entry.name);
    if (entry.isDirectory()) return sourceFiles(child);
    return sourceExtensions.has(extname(entry.name)) ? [child] : [];
  });
}

function publicTextViolations(path: string) {
  const content = readFileSync(path, "utf8");
  const source = ts.createSourceFile(path, content, ts.ScriptTarget.Latest, true, path.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const violations: string[] = [];
  const inspect = (node: ts.Node) => {
    const isTemplatePart = node.kind === ts.SyntaxKind.TemplateHead || node.kind === ts.SyntaxKind.TemplateMiddle || node.kind === ts.SyntaxKind.TemplateTail;
    const text = ts.isStringLiteralLike(node) || ts.isJsxText(node) || isTemplatePart ? (node as ts.StringLiteralLike).text : null;
    if (text && /\bSQC\b/.test(text)) {
      const line = source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1;
      violations.push(`${path}:${line}: ${text.trim().slice(0, 100)}`);
    }
    ts.forEachChild(node, inspect);
  };
  inspect(source);
  return violations;
}

function standaloneCoatViolations(path: string) {
  const content = readFileSync(path, "utf8");
  const source = ts.createSourceFile(path, content, ts.ScriptTarget.Latest, true, path.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const violations: string[] = [];
  const inspect = (node: ts.Node) => {
    const isTemplatePart = node.kind === ts.SyntaxKind.TemplateHead || node.kind === ts.SyntaxKind.TemplateMiddle || node.kind === ts.SyntaxKind.TemplateTail;
    const text = ts.isStringLiteralLike(node) || ts.isJsxText(node) || isTemplatePart ? (node as ts.StringLiteralLike).text : null;
    const trimmed = text?.trim() ?? "";
    let ancestor = node.parent;
    let appearsInsideJsx = false;
    while (ancestor && !ts.isSourceFile(ancestor)) {
      if (ts.isJsxExpression(ancestor) || ts.isJsxAttribute(ancestor)) appearsInsideJsx = true;
      ancestor = ancestor.parent;
    }
    const publicPropertyNames = new Set(["label", "title", "copy", "body", "description", "ariaLabel", "status", "suffix", "text"]);
    const propertyName = ts.isStringLiteralLike(node) && ts.isPropertyAssignment(node.parent) && ts.isIdentifier(node.parent.name) ? node.parent.name.text : null;
    const isComparisonLiteral = ts.isStringLiteralLike(node) && ts.isBinaryExpression(node.parent) && [ts.SyntaxKind.EqualsEqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsEqualsToken, ts.SyntaxKind.EqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsToken].includes(node.parent.operatorToken.kind);
    const isLowercaseInternalValue = /^(?:coat|coats)$/.test(trimmed) && ((!appearsInsideJsx && !publicPropertyNames.has(propertyName ?? "")) || isComparisonLiteral);
    const isInternalIdentifierToken = /coat/i.test(trimmed) && trimmed.includes("-") && /^[\w-]+$/.test(trimmed);
    const isInternalPathOrSelector = /^(?:@\/|[./])/.test(trimmed) || /\/(?:mobile-source|badges|assets|src)\//.test(trimmed) || /\bsqc-[\w-]+\b/.test(trimmed) || isLowercaseInternalValue || isInternalIdentifierToken;
    const withoutApprovedPhrase = text?.replace(/\b(?:Coat of Arms|Coats of Arms)\b/g, "") ?? "";
    const usesUnapprovedCoatCopy = /\bcoats?\b/i.test(withoutApprovedPhrase);
    if (text && !isInternalPathOrSelector && usesUnapprovedCoatCopy) {
      const line = source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1;
      violations.push(`${path}:${line}: ${trimmed.replace(/\s+/g, " ").slice(0, 140)}`);
    }
    ts.forEachChild(node, inspect);
  };
  inspect(source);
  return violations;
}

test("public-facing source never abbreviates Side Quest Chess as SQC", () => {
  const violations = sourceRoots.flatMap((root) => sourceFiles(root).flatMap(publicTextViolations));
  assert.deepEqual(violations, []);
});

test("public-facing source always says Coat of Arms, never Coat or Coats alone", () => {
  const violations = sourceRoots.flatMap((root) => sourceFiles(root).flatMap(standaloneCoatViolations));
  assert.deepEqual(violations, []);
});
