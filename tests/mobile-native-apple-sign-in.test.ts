import assert from "node:assert/strict";
import test from "node:test";
import { startNativeAppleSignIn } from "../apps/mobile/src/auth/startNativeAppleSignIn";

const cancellation = { code: "ERR_REQUEST_CANCELED" };

test("native Apple cancellation remains thrown before Clerk exchange", async () => {
  let clerkCalled = false;
  await assert.rejects(
    startNativeAppleSignIn({
      requestCredential: async () => { throw cancellation; },
      createSignIn: async () => {
        clerkCalled = true;
        return { createdSessionId: "unexpected", firstFactorVerification: { status: "verified" } };
      },
      createSignUp: async () => ({ createdSessionId: "unexpected" }),
      setActive: async () => undefined,
    }),
    (caught) => caught === cancellation,
  );
  assert.equal(clerkCalled, false);
});

test("native Apple exchanges the identity token and returns an existing-account session", async () => {
  const calls: unknown[] = [];
  const setActive = async () => undefined;
  const result = await startNativeAppleSignIn({
    requestCredential: async () => ({ identityToken: "apple-token" }),
    createSignIn: async (params) => {
      calls.push(params);
      return { createdSessionId: "session-existing", firstFactorVerification: { status: "verified" } };
    },
    createSignUp: async () => { throw new Error("must not transfer"); },
    setActive,
  });
  assert.deepEqual(calls, [{ strategy: "oauth_token_apple", token: "apple-token" }]);
  assert.deepEqual(result, { createdSessionId: "session-existing", setActive });
});

test("native Apple transfers a new account through Clerk sign-up", async () => {
  let transferPayload: unknown;
  const result = await startNativeAppleSignIn({
    requestCredential: async () => ({ identityToken: "apple-token" }),
    createSignIn: async () => ({ createdSessionId: null, firstFactorVerification: { status: "transferable" } }),
    createSignUp: async (params) => {
      transferPayload = params;
      return { createdSessionId: "session-new" };
    },
    setActive: async () => undefined,
  });
  assert.deepEqual(transferPayload, { transfer: true });
  assert.equal(result.createdSessionId, "session-new");
});

test("a completed Apple exchange without a Clerk session remains an explicit fallback case", async () => {
  const result = await startNativeAppleSignIn({
    requestCredential: async () => ({ identityToken: "apple-token" }),
    createSignIn: async () => ({ createdSessionId: null, firstFactorVerification: { status: "needs_first_factor" } }),
    createSignUp: async () => ({ createdSessionId: null }),
    setActive: async () => undefined,
  });
  assert.equal(result.createdSessionId, null);
});

test("missing Apple identity token fails closed", async () => {
  await assert.rejects(
    startNativeAppleSignIn({
      requestCredential: async () => ({ identityToken: null }),
      createSignIn: async () => ({ createdSessionId: null, firstFactorVerification: { status: "needs_identifier" } }),
      createSignUp: async () => ({ createdSessionId: null }),
      setActive: async () => undefined,
    }),
    /identity token/i,
  );
});
