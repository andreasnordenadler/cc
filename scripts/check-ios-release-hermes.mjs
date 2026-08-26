#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import {
  deriveReleaseHermesReference,
  verifyHermesReleaseEvidence,
} from "./ios-hermes-release-lib.mjs";

const [appPathArgument, unexpectedArgument] = process.argv.slice(2);
if (!appPathArgument || unexpectedArgument) {
  console.error("Usage: node scripts/check-ios-release-hermes.mjs <Release.app>");
  process.exit(2);
}

const appPath = path.resolve(appPathArgument);
const builtHermes = path.join(appPath, "Frameworks/hermes.framework/hermes");
let releaseHermes;
try {
  releaseHermes = deriveReleaseHermesReference(appPath);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(2);
}

for (const [label, binary] of [
  ["built Hermes", builtHermes],
  ["release Hermes reference", releaseHermes],
]) {
  if (!existsSync(binary)) {
    console.error(`${label} binary not found: ${binary}`);
    process.exit(2);
  }
}

try {
  const evidence = verifyHermesReleaseEvidence({
    builtUuidOutput: execFileSync("xcrun", ["dwarfdump", "--uuid", builtHermes], {
      encoding: "utf8",
    }),
    releaseUuidOutput: execFileSync("xcrun", ["dwarfdump", "--uuid", releaseHermes], {
      encoding: "utf8",
    }),
    builtSymbolsOutput: execFileSync("nm", [builtHermes], {
      encoding: "utf8",
      maxBuffer: 32 * 1024 * 1024,
    }),
    releaseSymbolsOutput: execFileSync("nm", [releaseHermes], {
      encoding: "utf8",
      maxBuffer: 32 * 1024 * 1024,
    }),
  });
  console.log(`Verified Release Hermes architectures: ${evidence.architectures.join(", ")}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
