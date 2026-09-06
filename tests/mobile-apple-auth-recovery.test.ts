import assert from "node:assert/strict";
import test from "node:test";
import { isAppleSignInCancellation, runAppleSignInWithOAuthFallback } from "../apps/mobile/src/auth/runAppleSignInWithOAuthFallback";

test("Apple authorization_invalid falls back to browser OAuth and activates the returned session", async () => {
  const events: string[] = [];

  const result = await runAppleSignInWithOAuthFallback({
    startNative: async () => {
      events.push("native");
      throw {
        code: "authorization_invalid",
        errors: [{ long_message: "You are not authorized to perform this request" }],
      };
    },
    completeNative: async () => {
      events.push("complete-native");
      return "complete";
    },
    startOAuth: async () => {
      events.push("oauth");
      return {
        createdSessionId: "session_review",
        setActive: async ({ session }: { session: string }) => {
          events.push(`active:${session}`);
        },
        authSessionResult: { type: "success" },
      };
    },
    completeOAuth: async (oauthResult) => {
      if (oauthResult.createdSessionId && oauthResult.setActive) {
        await oauthResult.setActive({ session: oauthResult.createdSessionId });
        events.push("complete-oauth");
        return "complete";
      }
      throw new Error("missing OAuth session");
    },
  });

  assert.equal(result, "oauth");
  assert.deepEqual(events, ["native", "oauth", "active:session_review", "complete-oauth"]);
});

test("Apple cancellation remains silent and never starts OAuth fallback", async () => {
  let oauthStarted = false;

  const result = await runAppleSignInWithOAuthFallback({
    startNative: async () => ({ createdSessionId: null }),
    completeNative: async () => "canceled",
    startOAuth: async () => {
      oauthStarted = true;
      return {};
    },
    completeOAuth: async () => "canceled",
  });

  assert.equal(result, "canceled");
  assert.equal(oauthStarted, false);
});

test("a thrown Apple cancellation never starts OAuth fallback", async () => {
  let oauthStarted = false;
  const canceled = {
    code: "ERR_REQUEST_CANCELED",
    message: "You are not authorized to perform this request",
  };

  await assert.rejects(
    runAppleSignInWithOAuthFallback({
      startNative: async () => {
        throw canceled;
      },
      completeNative: async () => "complete",
      startOAuth: async () => {
        oauthStarted = true;
        return {};
      },
      completeOAuth: async () => "complete",
    }),
    (caught) => caught === canceled,
  );

  assert.equal(oauthStarted, false);
});

test("a nested Apple cancellation overrides a matching parent message", async () => {
  let oauthStarted = false;
  const canceled = {
    message: "You are not authorized to perform this request",
    errors: [{ code: "ERR_REQUEST_CANCELED" }],
  };

  await assert.rejects(
    runAppleSignInWithOAuthFallback({
      startNative: async () => {
        throw canceled;
      },
      completeNative: async () => "complete",
      startOAuth: async () => {
        oauthStarted = true;
        return {};
      },
      completeOAuth: async () => "complete",
    }),
    (caught) => caught === canceled,
  );

  assert.equal(oauthStarted, false);
});

test("nested Apple cancellation is recognized at the alert boundary", () => {
  assert.equal(isAppleSignInCancellation({ errors: [{ code: "ERR_REQUEST_CANCELED" }] }), true);
  assert.equal(isAppleSignInCancellation({ code: "authorization_invalid" }), false);
});

test("mixed nested authorization codes cannot trigger OAuth fallback", async () => {
  let oauthStarted = false;
  const mixed = {
    errors: [
      { code: "authorization_invalid" },
      { code: "apple_identity_token_missing" },
    ],
  };

  await assert.rejects(
    runAppleSignInWithOAuthFallback({
      startNative: async () => {
        throw mixed;
      },
      completeNative: async () => "complete",
      startOAuth: async () => {
        oauthStarted = true;
        return {};
      },
      completeOAuth: async () => "complete",
    }),
    (caught) => caught === mixed,
  );

  assert.equal(oauthStarted, false);
});

test("an explicit non-authorization code cannot be promoted by matching message text", async () => {
  let oauthStarted = false;
  const unrelated = {
    code: "apple_identity_token_missing",
    message: "You are not authorized to perform this request",
  };

  await assert.rejects(
    runAppleSignInWithOAuthFallback({
      startNative: async () => {
        throw unrelated;
      },
      completeNative: async () => "complete",
      startOAuth: async () => {
        oauthStarted = true;
        return {};
      },
      completeOAuth: async () => "complete",
    }),
    (caught) => caught === unrelated,
  );

  assert.equal(oauthStarted, false);
});

test("partial or concatenated unauthorized text cannot trigger OAuth fallback", async () => {
  let oauthStarted = false;
  const unrelated = {
    message: "Prefix: You are not authorized to perform this request",
    longMessage: "for an unrelated operation",
  };

  await assert.rejects(
    runAppleSignInWithOAuthFallback({
      startNative: async () => {
        throw unrelated;
      },
      completeNative: async () => "complete",
      startOAuth: async () => {
        oauthStarted = true;
        return {};
      },
      completeOAuth: async () => "complete",
    }),
    (caught) => caught === unrelated,
  );

  assert.equal(oauthStarted, false);
});

test("a non-string explicit code cannot be treated as absent", async () => {
  let oauthStarted = false;
  const malformed = {
    code: 1001,
    message: "You are not authorized to perform this request",
  };

  await assert.rejects(
    runAppleSignInWithOAuthFallback({
      startNative: async () => {
        throw malformed;
      },
      completeNative: async () => "complete",
      startOAuth: async () => {
        oauthStarted = true;
        return {};
      },
      completeOAuth: async () => "complete",
    }),
    (caught) => caught === malformed,
  );

  assert.equal(oauthStarted, false);
});

test("unrelated Apple failures are not hidden behind an OAuth retry", async () => {
  let oauthStarted = false;
  const original = new Error("Apple identity token is missing");

  await assert.rejects(
    runAppleSignInWithOAuthFallback({
      startNative: async () => {
        throw original;
      },
      completeNative: async () => "complete",
      startOAuth: async () => {
        oauthStarted = true;
        return {};
      },
      completeOAuth: async () => "complete",
    }),
    (caught) => caught === original,
  );

  assert.equal(oauthStarted, false);
});

test("an authorization error while activating a native session is not retried as a second login", async () => {
  let oauthStarted = false;
  const activationError = { code: "authorization_invalid" };

  await assert.rejects(
    runAppleSignInWithOAuthFallback({
      startNative: async () => ({ createdSessionId: "native_session" }),
      completeNative: async () => {
        throw activationError;
      },
      startOAuth: async () => {
        oauthStarted = true;
        return {};
      },
      completeOAuth: async () => "complete",
    }),
    (caught) => caught === activationError,
  );

  assert.equal(oauthStarted, false);
});
