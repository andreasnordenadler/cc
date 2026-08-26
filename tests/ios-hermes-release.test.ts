import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  deriveReleaseHermesReference,
  verifyHermesReleaseEvidence,
} from "../scripts/ios-hermes-release-lib.mjs";

const releaseUuidOutput = [
  "UUID: 47523131-0F5F-395A-9F76-71E54B94A600 (x86_64) hermes",
  "UUID: E968DCE3-413B-39D3-B1AB-335C6F7FBBAB (arm64) hermes",
].join("\n");

const debugUuidOutput = [
  "UUID: B63B02AF-1729-3B64-B61A-C629DF99AD4B (x86_64) hermes",
  "UUID: 944BD49B-AD2E-3E3C-96AC-0603909FDD97 (arm64) hermes",
].join("\n");

const releaseSymbolsOutput = "000000000001 t _unrelatedReleaseSymbol";

test("pins the iOS candidate to the Expo new architecture release path", () => {
  const appConfig = JSON.parse(readFileSync(new URL("../apps/mobile/app.json", import.meta.url), "utf8"));
  assert.equal(appConfig.expo.ios.newArchEnabled, true);
});

test("derives the trusted Hermes reference from the Release build products instead of caller input", () => {
  assert.equal(
    deriveReleaseHermesReference(
      "/tmp/DerivedData/Build/Products/Release-iphonesimulator/SideQuestChess.app",
    ),
    "/tmp/DerivedData/Build/Products/Release-iphonesimulator/XCFrameworkIntermediates/hermes-engine/Pre-built/hermes.framework/hermes",
  );
  assert.throws(
    () => deriveReleaseHermesReference("/tmp/SideQuestChess.app"),
    /Release build products/,
  );
});

test("accepts a built Hermes framework matching the installed release framework", () => {
  assert.doesNotThrow(() =>
    verifyHermesReleaseEvidence({
      builtUuidOutput: releaseUuidOutput,
      releaseUuidOutput,
      builtSymbolsOutput: releaseSymbolsOutput,
      releaseSymbolsOutput,
    }),
  );
});

test("rejects a Debug Hermes framework copied into a Release app", () => {
  assert.throws(
    () =>
      verifyHermesReleaseEvidence({
        builtUuidOutput: debugUuidOutput,
        releaseUuidOutput,
        builtSymbolsOutput:
          "000000000000e480 t HermesRuntimeImpl15debugJavaScript\n000000000000ed0c t debugJavaScript",
        releaseSymbolsOutput,
      }),
    /Debug Hermes symbol debugJavaScript/,
  );
});

test("rejects a Hermes framework whose architecture UUIDs do not match the release framework", () => {
  assert.throws(
    () =>
      verifyHermesReleaseEvidence({
        builtUuidOutput: debugUuidOutput,
        releaseUuidOutput,
        builtSymbolsOutput: "",
        releaseSymbolsOutput,
      }),
    /UUID mismatch.*arm64.*x86_64/,
  );
});

test("rejects a built Hermes framework missing an architecture from the release reference", () => {
  assert.throws(
    () =>
      verifyHermesReleaseEvidence({
        builtUuidOutput: releaseUuidOutput.split("\n")[1],
        releaseUuidOutput,
        builtSymbolsOutput: "",
        releaseSymbolsOutput,
      }),
    /architecture set mismatch.*x86_64/,
  );
});

test("rejects a Debug Hermes binary masquerading as the Release reference", () => {
  assert.throws(
    () =>
      verifyHermesReleaseEvidence({
        builtUuidOutput: debugUuidOutput,
        releaseUuidOutput: debugUuidOutput,
        builtSymbolsOutput: "",
        releaseSymbolsOutput: "000000000000e480 t HermesRuntimeImpl15debugJavaScript",
      }),
    /Release reference contains the Debug Hermes symbol/,
  );
});
