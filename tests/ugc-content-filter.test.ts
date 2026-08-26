import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { containsObjectionablePublicText } from "../src/lib/ugc-content-filter";

test("public UGC filter rejects separator-obfuscated objectionable words", () => {
  assert.equal(containsObjectionablePublicText("A f.u.c.k challenge"), true);
});

test("public UGC filter rejects common leetspeak substitutions", () => {
  assert.equal(containsObjectionablePublicText("A sh1t challenge"), true);
});

test("public UGC filter rejects spaced-letter obfuscation", () => {
  assert.equal(containsObjectionablePublicText("A f u c k challenge"), true);
});

test("public UGC filter rejects chunked-word obfuscation", () => {
  assert.equal(containsObjectionablePublicText("A fu ck challenge"), true);
});

test("public UGC filter rejects repeated-letter obfuscation", () => {
  assert.equal(containsObjectionablePublicText("A fuuuck challenge"), true);
});

test("public UGC filter rejects objectionable suffix variants", () => {
  assert.equal(containsObjectionablePublicText("A fucks challenge"), true);
});

test("public UGC filter rejects common Unicode homoglyph substitutions", () => {
  assert.equal(containsObjectionablePublicText("A fυck challenge"), true);
});

test("public UGC filter rejects mixed-script homoglyph substitutions", () => {
  assert.equal(containsObjectionablePublicText("A fυсk challenge"), true);
});

test("public UGC filter rejects accented-letter obfuscation", () => {
  assert.equal(containsObjectionablePublicText("A fúck challenge"), true);
});

test("public UGC filter rejects objectionable compounds", () => {
  assert.equal(containsObjectionablePublicText("A fuckyou challenge"), true);
});

test("public UGC filter does not reject benign words containing partial matches", () => {
  assert.equal(containsObjectionablePublicText("Scunthorpe classic knight challenge"), false);
});

test("mobile Community catalog suppresses legacy objectionable public quests", () => {
  const source = readFileSync(new URL("../src/app/api/mobile/account/route.ts", import.meta.url), "utf8");
  assert.match(source, /containsObjectionablePublicText\(quest\.title, quest\.summary\)/);
});
