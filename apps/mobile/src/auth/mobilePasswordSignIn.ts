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
  setActive,
}: {
  identifier: string;
  password: string;
  createSignIn: (params: { identifier: string }) => Promise<MobilePasswordSignInResult>;
  attemptFirstFactor: (params: { strategy: "password"; password: string }) => Promise<MobilePasswordSignInResult>;
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

  if (result.status === "needs_second_factor") return { status: "needs_second_factor" };

  throw new Error(`Password sign-in needs another step: ${result.status}.`);
}

export async function continueMobilePasswordSignInSecondFactor({
  code,
  prepareSecondFactor,
  attemptSecondFactor,
  setActive,
}: {
  code: string;
  prepareSecondFactor: (params: { strategy: "email_code" }) => Promise<MobilePasswordSignInResult>;
  attemptSecondFactor: (params: { strategy: "email_code"; code: string }) => Promise<MobilePasswordSignInResult>;
  setActive: (params: { session: string }) => Promise<unknown>;
}): Promise<void> {
  const cleanCode = code.trim();
  if (!cleanCode) throw new Error("Enter the verification code sent to the account email.");

  await prepareSecondFactor({ strategy: "email_code" });
  const result = await attemptSecondFactor({ strategy: "email_code", code: cleanCode });
  if (result.status === "complete" && result.createdSessionId) {
    await setActive({ session: result.createdSessionId });
    return;
  }

  throw new Error(`Password sign-in verification did not complete: ${result.status}.`);
}
