import assert from "node:assert/strict";
import test from "node:test";
import {
  sanitizeChessUsername,
  validateChessComUsername,
  validateLichessUsername,
} from "../src/lib/chess-username-validation";

test("rejects an overlong chess identity instead of silently selecting its prefix", () => {
  assert.equal(sanitizeChessUsername("a".repeat(41)), null);
  assert.equal(sanitizeChessUsername(`${"a".repeat(40)}!`), null);
});

test("preserves valid boundary identities and existing blank-field semantics", () => {
  for (const username of ["", "a", "A_b-9", "a".repeat(40)]) {
    assert.equal(sanitizeChessUsername(` ${username} `), username);
  }
  assert.equal(sanitizeChessUsername(undefined), "");
  assert.equal(sanitizeChessUsername("bad/name"), null);
});

test("both providers reject overlong identities without any lookup", async (t) => {
  const fetchMock = t.mock.method(globalThis, "fetch", async () => {
    throw new Error("Rejected identities must not reach the provider");
  });
  for (const validate of [validateLichessUsername, validateChessComUsername]) {
    const username = "a".repeat(41);
    const result = await validate(username);
    assert.equal(result.ok, false);
    assert.equal(result.username, username);
  }
  assert.equal(fetchMock.mock.callCount(), 0);
});
