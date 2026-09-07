type AppleSignInCompletion = {
  createdSessionId?: string | null;
  setActive?: (params: { session: string }) => Promise<unknown>;
};

export async function completeAppleSignIn(result: AppleSignInCompletion): Promise<"complete" | "fallback"> {
  if (!result.createdSessionId) return "fallback";

  if (!result.setActive) {
    throw new Error("Apple sign-in could not finish setting up your account. Try another sign-in method or contact support.");
  }

  await result.setActive({ session: result.createdSessionId });
  return "complete";
}
