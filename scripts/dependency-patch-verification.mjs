import { createHash } from "node:crypto";
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const workspaceRoot = realpathSync(fileURLToPath(new URL("..", import.meta.url)));
const packageName = /^(?:@[a-z0-9._-]+\/)?[a-z0-9][a-z0-9._-]*$/;

// Only reviewed, exact-version backports may satisfy these advisories.
// Forge: algorithm from upstream PR #1152, head ceba34402e329f0365134f23fe19898756527d65.
// Braces: source/AST depth bounds with actual overflow and compatibility regressions.
const backports = new Map([
  ["GHSA-86w9-cpqp-85rv", { name: "node-forge", version: "1.4.0", files: {
    "lib/rsa.js": "fcd5a695667163e286635028ff4a664e503ea1ca67ca928e57182a3f5c5f904b",
  } }],
  ["GHSA-vfj7-8cjw-p6xm", { name: "braces", version: "3.0.3", files: {
    "lib/parse.js": "5e85ce4b8303d4c6157894dcf3ecf2c09016b0ae9adb5c3e31d1775b698c5bbd",
    "lib/compile.js": "bf53aad8a8b0415148efbdf7b82e25a4b19180f2adc6124234b0ac4ccaf20fb9",
    "lib/expand.js": "a81d5d3dab6037f38b81b80ed87d769dc00088f55c7a7d9a3d7f0ef6e3872fc6",
    "lib/stringify.js": "82559798f4446ac96512652bbf02cb3be1f71031434c5299b1609d4ea1ee02cc",
  } }],
]);

export function resolveAuditPackage(findingPath) {
  const [workspace, ...names] = findingPath.split(">");
  if (workspace !== "apps__mobile" || names.length === 0) throw new Error("Unsupported audit workspace.");
  let directory = path.join(workspaceRoot, "apps/mobile");
  for (const name of names) {
    if (!packageName.test(name)) throw new Error("Invalid audited package name.");
    const require = createRequire(path.join(directory, "package.json"));
    const manifest = require.resolve.paths(name)?.map(base => path.join(base, name, "package.json")).find(existsSync);
    if (!manifest) throw new Error(`Audited package not installed: ${name}`);
    directory = path.dirname(realpathSync(manifest));
    if (!directory.startsWith(workspaceRoot + path.sep)) throw new Error("Audited package escaped the isolated workspace.");
    if (JSON.parse(readFileSync(manifest, "utf8")).name !== name) throw new Error("Audited package identity mismatch.");
  }
  return directory;
}

export function matchesBackportHashes(directory, files, read = file => readFileSync(file)) {
  return Object.entries(files).length > 0 && Object.entries(files).every(([file, expected]) =>
    createHash("sha256").update(read(path.join(directory, file))).digest("hex") === expected);
}

export function verifyPatchedFinding(advisory, finding) {
  const backport = backports.get(advisory.github_advisory_id);
  if (!backport || advisory.module_name !== backport.name || finding.version !== backport.version) return false;
  try {
    return finding.paths.length > 0 && finding.paths.every(findingPath => {
      const directory = resolveAuditPackage(findingPath);
      const manifest = JSON.parse(readFileSync(path.join(directory, "package.json"), "utf8"));
      return manifest.name === backport.name && manifest.version === backport.version
        && matchesBackportHashes(directory, backport.files);
    });
  } catch {
    return false;
  }
}
