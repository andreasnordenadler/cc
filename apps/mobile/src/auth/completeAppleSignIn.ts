type AppleSignInCompletion = {
  createdSessionId?: unknown;
  setActive?: (params: { session: string }) => Promise<unknown>;
};

export async function completeAppleSignIn(result: AppleSignInCompletion): Promise<"complete" | "fallback"> {
  if (result.createdSessionId === null) return "fallback";
  if (typeof result.createdSessionId !== "string" || result.createdSessionId.trim().length === 0) {
    throw new Error("Apple sign-in returned an invalid session result.");
  }

  if (!result.setActive) {
    throw new Error("Apple sign-in could not finish setting up your account. Try another sign-in method or contact support.");
  }

  await result.setActive({ session: result.createdSessionId });
  return "complete";
}
