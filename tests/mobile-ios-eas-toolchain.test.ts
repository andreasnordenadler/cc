import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const readRepoJson = (path: string) =>
  JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), "utf8"));

const IOS_PRODUCTION_IMAGE = "macos-sequoia-15.6-xcode-26.0";

test("EAS production iOS builds use the reviewed SDK 54 Xcode image", () => {
  for (const path of ["eas.json", "apps/mobile/eas.json"]) {
    const production = readRepoJson(path).build.production;

    assert.equal(
      production.ios?.image,
      IOS_PRODUCTION_IMAGE,
      `${path} must pin the reviewed iOS image instead of following a mutable EAS default`,
    );
  }
});
