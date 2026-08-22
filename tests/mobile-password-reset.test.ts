import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { completeMobilePasswordReset, prepareMobilePasswordReset, verifyMobilePasswordResetCode } from "../apps/mobile/src/auth/mobilePasswordReset";

test("mobile password reset sends an email code for the trimmed account identifier", async () => {
  const calls: unknown[] = [];
  const result = await prepareMobilePasswordReset({
    identifier: "  player@example.com  ",
    createSignIn: async (params) => {
      calls.push(params);
      return { status: "needs_first_factor" };
    },
  });

  assert.deepEqual(calls, [{ strategy: "reset_password_email_code", identifier: "player@example.com" }]);
  assert.deepEqual(result, { identifier: "player@example.com" });
});

test("mobile password reset requires an email and the expected Clerk preparation state", async () => {
  let calls = 0;
  await assert.rejects(
    prepareMobilePasswordReset({
      identifier: "playername",
      createSignIn: async () => {
        calls += 1;
        return { status: "needs_first_factor" };
      },
    }),
    /email address/i,
  );
  assert.equal(calls, 0);

  await assert.rejects(
    prepareMobilePasswordReset({
      identifier: "player@example.com",
      createSignIn: async () => ({ status: "complete" }),
    }),
    /could not send a reset code/i,
  );

  const maskedFailureResult = await prepareMobilePasswordReset({
    identifier: "player@example.com",
    createSignIn: async () => {
      throw { errors: [{ code: "form_identifier_not_found" }] };
    },
  });
  assert.deepEqual(maskedFailureResult, { identifier: "player@example.com" });
});

test("mobile password reset reports delivery failures instead of advancing to code verification", async () => {
  await assert.rejects(
    prepareMobilePasswordReset({
      identifier: "player@example.com",
      createSignIn: async () => {
        throw new TypeError("Network request failed");
      },
    }),
    /could not send a reset code/i,
  );

  await assert.rejects(
    prepareMobilePasswordReset({
      identifier: "player@example.com",
      createSignIn: async () => {
        throw { status: 429, errors: [{ code: "too_many_requests" }] };
      },
    }),
    /could not send a reset code/i,
  );
});

test("mobile password reset verifies the code, changes the password, and activates the new session", async () => {
  const calls: unknown[] = [];
  await verifyMobilePasswordResetCode({
    code: " 123456 ",
    attemptFirstFactor: async (params) => {
      calls.push(params);
      return { status: "needs_new_password", createdSessionId: null };
    },
  });
  await completeMobilePasswordReset({
    password: "new-password-123",
    resetPassword: async (params) => {
      calls.push(params);
      return { status: "complete", createdSessionId: "sess_reset" };
    },
    setActive: async (params) => {
      calls.push(params);
    },
  });

  assert.deepEqual(calls, [
    { strategy: "reset_password_email_code", code: "123456" },
    { password: "new-password-123", signOutOfOtherSessions: true },
    { session: "sess_reset" },
  ]);
});

test("mobile password reset refuses incomplete Clerk results instead of claiming success", async () => {
  await assert.rejects(
    verifyMobilePasswordResetCode({
      code: "123456",
      attemptFirstFactor: async () => ({ status: "needs_second_factor", createdSessionId: null }),
    }),
    /another verification step/i,
  );
});

test("mobile password reset rejects missing codes and short passwords before contacting Clerk", async () => {
  let attempts = 0;
  const attemptFirstFactor = async () => {
    attempts += 1;
    return { status: "complete", createdSessionId: "unexpected" };
  };

  await assert.rejects(
    verifyMobilePasswordResetCode({ code: " ", attemptFirstFactor }),
    /email code/i,
  );
  await assert.rejects(
    completeMobilePasswordReset({ password: "short", resetPassword: async () => ({ status: "complete", createdSessionId: "unexpected" }), setActive: async () => undefined }),
    /at least 8 characters/i,
  );
  assert.equal(attempts, 0);
});

test("mobile password reset can retry a rejected new password without re-verifying the email code", async () => {
  let attempts = 0;
  const resetPassword = async () => {
    attempts += 1;
    if (attempts === 1) throw new Error("Password does not meet policy.");
    return { status: "complete", createdSessionId: "sess_retry" };
  };

  await assert.rejects(
    completeMobilePasswordReset({ password: "first-password", resetPassword, setActive: async () => undefined }),
    /policy/i,
  );
  await completeMobilePasswordReset({ password: "second-password", resetPassword, setActive: async () => undefined });
  assert.equal(attempts, 2);
});

test("the password account panel exposes a recoverable forgot-password flow", () => {
  const source = readFileSync(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  assert.match(source, /startPasswordReset/);
  assert.match(source, /completePasswordReset/);
  assert.match(source, /Forgot password\?/);
  assert.match(source, /Reset password/);
  assert.match(source, /Password reset complete/);
});
