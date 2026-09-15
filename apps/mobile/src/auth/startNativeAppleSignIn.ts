type AppleCredential = {
  identityToken?: unknown;
};

type ClerkSignInResult = {
  createdSessionId?: unknown;
  firstFactorVerification?: { status?: unknown } | null;
};

type ClerkSignUpResult = {
  createdSessionId?: unknown;
};

type NativeAppleSignInParams = {
  requestCredential: () => Promise<AppleCredential>;
  createSignIn: (params: { strategy: "oauth_token_apple"; token: string }) => Promise<ClerkSignInResult>;
  createSignUp: (params: { transfer: true }) => Promise<ClerkSignUpResult>;
  setActive?: (params: { session: string }) => Promise<unknown>;
};

type NativeAppleSignInResult = {
  createdSessionId: string | null;
  setActive?: (params: { session: string }) => Promise<unknown>;
};

function requireSessionId(value: unknown): string | null {
  if (value === null) return null;
  if (typeof value === "string" && value.trim().length > 0) return value;
  throw new Error("Apple sign-in returned an invalid session result.");
}

export async function startNativeAppleSignIn({
  requestCredential,
  createSignIn,
  createSignUp,
  setActive,
}: NativeAppleSignInParams): Promise<NativeAppleSignInResult> {
  // Expo throws ERR_REQUEST_CANCELED here. Do not catch it: preserving the
  // exception is what lets the UI distinguish cancellation from a completed
  // Apple credential exchange that did not create a Clerk session.
  const credential = await requestCredential();
  if (typeof credential.identityToken !== "string" || credential.identityToken.length === 0) {
    throw new Error("No identity token received from Apple Sign-In.");
  }

  const signInResult = await createSignIn({
    strategy: "oauth_token_apple",
    token: credential.identityToken,
  });

  if (signInResult.firstFactorVerification?.status === "transferable") {
    const signUpResult = await createSignUp({ transfer: true });
    return { createdSessionId: requireSessionId(signUpResult.createdSessionId), setActive };
  }

  return { createdSessionId: requireSessionId(signInResult.createdSessionId), setActive };
}
