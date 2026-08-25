import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const readRepoFile = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("iOS declares that the app uses only exempt encryption", () => {
  const config = JSON.parse(readRepoFile("apps/mobile/app.json")).expo;

  assert.equal(
    config.ios.config?.usesNonExemptEncryption,
    false,
    "App Store builds must embed the reviewed export-compliance answer",
  );
});
