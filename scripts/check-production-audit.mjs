#!/usr/bin/env node
import { spawnSync } from "node:child_process";

import { evaluateProductionAudit } from "./production-audit-lib.mjs";

const result = spawnSync("pnpm", ["audit", "--prod", "--json"], {
  cwd: new URL("..", import.meta.url),
  encoding: "utf8",
  env: process.env,
});

if (result.error) throw result.error;
if (result.status !== 0 && result.status !== 1) {
  throw new Error(`pnpm audit failed with exit code ${result.status}: ${result.stderr.trim()}`);
}

let report;
try {
  report = JSON.parse(result.stdout);
} catch {
  throw new Error("pnpm audit did not return valid JSON.");
}

const { acceptedAdvisories } = evaluateProductionAudit(report);
if (acceptedAdvisories.length > 0) {
  console.log(`Accepted unpatched Expo/Metro build-tool advisories: ${acceptedAdvisories.join(", ")}`);
}
console.log("Production dependency audit passed: no unaccepted high or critical advisories.");
