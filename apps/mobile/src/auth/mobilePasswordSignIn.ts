type MobilePasswordSignInResult = {
  status: string | null;
  createdSessionId: string | null;
};

type MobilePasswordSignInOutcome =
  | { status: "complete" }
  | { status: "needs_second_factor" };

export async function startMobilePasswordSignIn({
  identifier,
  password,
  createSignIn,
  attemptFirstFactor,
  prepareSecondFactor,
  setActive,
}: {
  identifier: string;
  password: string;
  createSignIn: (params: { identifier: string }) => Promise<MobilePasswordSignInResult>;
  attemptFirstFactor: (params: { strategy: "password"; password: string }) => Promise<MobilePasswordSignInResult>;
  prepareSecondFactor?: (params: { strategy: "email_code" }) => Promise<MobilePasswordSignInResult>;
  setActive: (params: { session: string }) => Promise<unknown>;
}): Promise<MobilePasswordSignInOutcome> {
  const identification = await createSignIn({ identifier: identifier.trim() });
  const result = identification.status === "complete"
    ? identification
    : await attemptFirstFactor({ strategy: "password", password });

  if (result.status === "complete" && result.createdSessionId) {
    await setActive({ session: result.createdSessionId });
    return { status: "complete" };
  }

  if (result.status === "needs_second_factor") {
    if (!prepareSecondFactor) throw new Error("Password sign-in requires a second-factor delivery method.");
    await prepareSecondFactor({ strategy: "email_code" });
    return { status: "needs_second_factor" };
  }

  throw new Error(`Password sign-in needs another step: ${result.status}.`);
}

export async function continueMobilePasswordSignInSecondFactor({
  code,
  attemptSecondFactor,
  setActive,
}: {
  code: string;
  attemptSecondFactor: (params: { strategy: "email_code"; code: string }) => Promise<MobilePasswordSignInResult>;
  setActive: (params: { session: string }) => Promise<unknown>;
}): Promise<void> {
  const cleanCode = code.trim();
  if (!cleanCode) throw new Error("Enter the verification code sent to the account email.");

  const result = await attemptSecondFactor({ strategy: "email_code", code: cleanCode });
  if (result.status === "complete" && result.createdSessionId) {
    await setActive({ session: result.createdSessionId });
    return;
  }

  throw new Error(`Password sign-in verification did not complete: ${result.status}.`);
}
