import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { completeSocialSignIn } from "../apps/mobile/src/auth/completeSocialSignIn";

const appSource = readFileSync(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");

test("social sign-in treats a canceled browser session as a non-error", async () => {
  assert.deepEqual(
    await completeSocialSignIn({ authSessionResult: { type: "cancel" } }),
    { status: "canceled" },
  );
});

test("social sign-in treats a dismissed browser session as a non-error", async () => {
  assert.deepEqual(
    await completeSocialSignIn({ authSessionResult: { type: "dismiss" } }),
    { status: "canceled" },
  );
});

test("social sign-in activates a created Clerk session", async () => {
  const activatedSessions: string[] = [];

  assert.deepEqual(
    await completeSocialSignIn({
      authSessionResult: { type: "success" },
      createdSessionId: "session_123",
      setActive: async ({ session }) => {
        activatedSessions.push(session);
      },
    }),
    { status: "complete" },
  );
  assert.deepEqual(activatedSessions, ["session_123"]);
});

test("social sign-in preserves diagnostics for an incomplete non-canceled return", async () => {
  assert.deepEqual(
    await completeSocialSignIn({
      authSessionResult: { type: "success" },
      signIn: { status: "needs_identifier" },
      signUp: { status: "missing_requirements" },
    }),
    {
      status: "incomplete",
      authResultType: "success",
      signInStatus: "needs_identifier",
      signUpStatus: "missing_requirements",
    },
  );
});

test("mobile social sign-in routes Clerk returns through cancellation-aware completion", () => {
  assert.match(appSource, /import \{ completeSocialSignIn \} from "\.\/src\/auth\/completeSocialSignIn"/);
  assert.match(appSource, /const completion = await completeSocialSignIn\(result\)/);
  assert.match(appSource, /if \(completion\.status !== "incomplete"\) return/);
});
