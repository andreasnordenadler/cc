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

test("public-facing source never abbreviates Side Quest Chess as SQC", () => {
  const violations = sourceRoots.flatMap((root) => sourceFiles(root).flatMap(publicTextViolations));
  assert.deepEqual(violations, []);
});
