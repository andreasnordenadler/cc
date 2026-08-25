import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { completeSocialSignIn } from "../apps/mobile/src/auth/completeSocialSignIn";

const appSource = readFileSync(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");

test("social sign-in treats a canceled authentication session as a non-error", async () => {
  let activated = false;

  const result = await completeSocialSignIn({
    createdSessionId: null,
    setActive: async () => {
      activated = true;
    },
    authSessionResult: { type: "cancel" },
  });

  assert.equal(result, "canceled");
  assert.equal(activated, false);
});

test("social sign-in treats a dismissed authentication session as a non-error", async () => {
  const result = await completeSocialSignIn({
    createdSessionId: null,
    authSessionResult: { type: "dismiss" },
  });

  assert.equal(result, "canceled");
});

test("social sign-in activates the session created by Clerk", async () => {
  let activatedSession: string | null = null;

  const result = await completeSocialSignIn({
    createdSessionId: "session_123",
    setActive: async ({ session }) => {
      activatedSession = session;
    },
    authSessionResult: { type: "success" },
  });

  assert.equal(result, "complete");
  assert.equal(activatedSession, "session_123");
});

test("mobile Google and Facebook sign-in delegate Clerk result handling to the cancellation-safe helper", () => {
  assert.match(appSource, /import \{ completeSocialSignIn \} from "\.\/src\/auth\/completeSocialSignIn"/);
  assert.match(appSource, /await completeSocialSignIn\(result\)/);
  assert.doesNotMatch(appSource, /Details: auth=\$\{authResultType\}/);
});
