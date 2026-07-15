import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const readRepoFile = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("CI uses a pnpm release whose audit client supports the registry bulk advisory endpoint", () => {
  for (const workflow of [".github/workflows/ci.yml", ".github/workflows/mobile-release-gate.yml"]) {
    const source = readRepoFile(workflow);
    const pinnedVersions = [...source.matchAll(/version:\s*(\d+\.\d+\.\d+)/g)].map((match) => match[1]);

    assert.ok(pinnedVersions.length > 0, `${workflow} must pin pnpm`);
    assert.deepEqual(
      [...new Set(pinnedVersions)],
      ["11.12.0"],
      `${workflow} must use pnpm 11.12.0 so the release audit does not call retired npm endpoints`,
    );
  }
});
