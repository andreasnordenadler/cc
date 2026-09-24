type MobilePasswordSignInResult = {
  status: string | null;
  createdSessionId: string | null;
};

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
}): Promise<void> {
  const identification = await createSignIn({ identifier: identifier.trim() });
  const result = identification.status === "complete"
    ? identification
    : await attemptFirstFactor({ strategy: "password", password });

  if (result.status === "complete" && result.createdSessionId) {
    await setActive({ session: result.createdSessionId });
    return;
  }

  throw new Error(`Password sign-in needs another step: ${result.status}.`);
}
