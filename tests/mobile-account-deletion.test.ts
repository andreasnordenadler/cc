import assert from "node:assert/strict";
import test from "node:test";
import { deleteMobileAccount } from "../apps/mobile/src/api/sqc";
import { DELETE_ACCOUNT_CONFIRMATION } from "../src/lib/account-deletion";

test("mobile account deletion sends bearer auth and exact confirmation to the first-party endpoint", async () => {
  const originalFetch = globalThis.fetch;
  let request: Request | null = null;
  globalThis.fetch = async (input, init) => {
    request = new Request(input, init);
    return Response.json({ ok: true, code: "account_deleted", message: "deleted" });
  };

  try {
    const result = await deleteMobileAccount({ sessionToken: "session-token", confirmation: DELETE_ACCOUNT_CONFIRMATION });
    assert.equal(result.ok, true);
    assert.ok(request);
    const sentRequest = request as unknown as Request;
    assert.equal(sentRequest.method, "DELETE");
    assert.equal(sentRequest.headers.get("authorization"), "Bearer session-token");
    assert.deepEqual(await sentRequest.json(), { confirmation: DELETE_ACCOUNT_CONFIRMATION });
    assert.equal(new URL(sentRequest.url).pathname, "/api/mobile/account");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("mobile account deletion exposes the server safe error", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => Response.json(
    { ok: false, code: "deletion_temporarily_unavailable", message: "Please try again." },
    { status: 503 },
  );

  try {
    await assert.rejects(
      deleteMobileAccount({ sessionToken: "session-token", confirmation: DELETE_ACCOUNT_CONFIRMATION }),
      /Please try again/,
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
