import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import { matchesBackportHashes, resolveAuditPackage, verifyPatchedFinding } from "../scripts/dependency-patch-verification.mjs";
import { evaluateProductionAudit } from "../scripts/production-audit-lib.mjs";

const forgePath = "apps__mobile>expo>@expo/cli>node-forge";
const bracesPath = "apps__mobile>react-native>@react-native/community-cli-plugin>metro>metro-file-map>micromatch>braces";
const load = (findingPath: string) => createRequire(path.join(resolveAuditPackage(findingPath), "package.json"))(resolveAuditPackage(findingPath));
const forge = load(forgePath);
const braces = load(bracesPath);

test("missing, empty or tampered source cannot satisfy backport hashes", () => {
  const directory = resolveAuditPackage(forgePath);
  const hashes = { "lib/rsa.js": createHash("sha256").update(readFileSync(path.join(directory, "lib/rsa.js"))).digest("hex") };
  assert.equal(matchesBackportHashes(directory, hashes), true);
  assert.equal(matchesBackportHashes(directory, hashes, () => Buffer.from("tampered")), false);
  assert.equal(matchesBackportHashes(directory, {}), false);
  assert.throws(() => matchesBackportHashes(directory, { "missing.js": hashes["lib/rsa.js"] }));
});

test("audit requires verified installed backports rather than accepting the advisory by name", () => {
  const advisories = Object.fromEntries([
    ["GHSA-86w9-cpqp-85rv", "node-forge", "1.4.0", forgePath],
    ["GHSA-vfj7-8cjw-p6xm", "braces", "3.0.3", bracesPath],
  ].map(([id, name, version, findingPath]) => [id, {
    github_advisory_id: id, module_name: name, severity: "high", findings: [{ version, paths: [findingPath] }],
  }]));
  assert.deepEqual(evaluateProductionAudit({ advisories }), {
    acceptedAdvisories: [], patchedAdvisories: ["GHSA-86w9-cpqp-85rv", "GHSA-vfj7-8cjw-p6xm"],
  });
  const forgeAdvisory = advisories["GHSA-86w9-cpqp-85rv"];
  assert.throws(() => evaluateProductionAudit({ advisories: { bad: {
    ...forgeAdvisory, findings: [{ version: "1.4.0", paths: [forgePath, "root>node-forge"] }],
  } } }), /audit blocked/);
  assert.throws(() => evaluateProductionAudit({ advisories: { bad: {
    ...forgeAdvisory, github_advisory_id: "GHSA-new-unreviewed-vulnerability",
  } } }), /audit blocked/);
});

const digest = () => forge.md.sha256.create().update("dependency backport regression fixture", "utf8");
const keys = forge.pki.rsa.generateKeyPair({ bits: 1024, e: 65537 });

function encodedDigest(extra: boolean, parameters = true) {
  const a = forge.asn1;
  const algorithm = [a.create(a.Class.UNIVERSAL, a.Type.OID, false, a.oidToDer(forge.pki.oids.sha256).getBytes())];
  if (parameters) algorithm.push(a.create(a.Class.UNIVERSAL, a.Type.NULL, false, ""));
  if (extra) algorithm.push(a.create(a.Class.UNIVERSAL, a.Type.OCTETSTRING, false, "unconsumed nested bytes"));
  return a.toDer(a.create(a.Class.UNIVERSAL, a.Type.SEQUENCE, true, [
    a.create(a.Class.UNIVERSAL, a.Type.SEQUENCE, true, algorithm),
    a.create(a.Class.UNIVERSAL, a.Type.OCTETSTRING, false, digest().digest().bytes()),
  ])).getBytes();
}

test("RSA backport rejects extra nested DigestAlgorithm elements with or without NULL", () => {
  for (const parameters of [true, false]) {
    const signature = keys.privateKey.sign(encodedDigest(true, parameters), "NONE");
    assert.throws(() => keys.publicKey.verify(digest().digest().bytes(), signature), /DigestInfo/);
  }
});

test("RSA backport preserves valid signatures with optional NULL and rejects wrong messages", () => {
  for (const parameters of [true, false]) {
    const signature = keys.privateKey.sign(encodedDigest(false, parameters), "NONE");
    assert.equal(keys.publicKey.verify(digest().digest().bytes(), signature), true);
    assert.equal(keys.publicKey.verify(forge.md.sha256.create().update("wrong").digest().bytes(), signature), false);
  }
});

test("braces bounds brace, parentheses and mixed nesting before recursive walkers", () => {
  for (const input of ["{".repeat(4000) + "a" + "}".repeat(4000), "(".repeat(4000) + "a" + ")".repeat(4000), "{(".repeat(2000) + "a" + ")}".repeat(2000)]) {
    for (const expand of [false, true]) assert.throws(() => braces(input, { expand, maxDepth: Infinity }), /maximum nesting depth/);
  }
});

test("braces preserves ordinary expansion, escaped literals and the supported nesting boundary", () => {
  assert.deepEqual(braces.expand("src/{a,b}/{1..2}.ts"), ["src/a/1.ts", "src/a/2.ts", "src/b/1.ts", "src/b/2.ts"]);
  assert.doesNotThrow(() => braces("{".repeat(100) + "a" + "}".repeat(100)));
  assert.doesNotThrow(() => braces("\\{".repeat(200)));
  assert.throws(() => braces("{".repeat(101) + "a" + "}".repeat(101)), /maximum nesting depth/);
});

test("direct braces AST entry points also fail before stack exhaustion", () => {
  for (const method of ["compile", "expand", "stringify"]) {
    type Ast = { type: string; value?: string; nodes?: Ast[] };
    let ast: Ast = { type: "text", value: "x" };
    for (let i = 0; i < 4000; i++) ast = { type: "root", nodes: [ast] };
    assert.throws(() => braces[method](ast), /maximum AST depth/);
  }
});

test("backport admission is source-bound and rejects mismatched versions, identity and paths", () => {
  for (const [id, name, version, findingPath] of [
    ["GHSA-86w9-cpqp-85rv", "node-forge", "1.4.0", forgePath],
    ["GHSA-vfj7-8cjw-p6xm", "braces", "3.0.3", bracesPath],
  ]) {
    const advisory = { github_advisory_id: id, module_name: name };
    const finding = { version, paths: [findingPath] };
    assert.equal(verifyPatchedFinding(advisory, finding), true);
    assert.equal(verifyPatchedFinding(advisory, { ...finding, version: "0.0.0" }), false);
    assert.equal(verifyPatchedFinding({ ...advisory, module_name: "other" }, finding), false);
    assert.equal(verifyPatchedFinding(advisory, { ...finding, paths: [findingPath, "root>" + name] }), false);
  }
});
