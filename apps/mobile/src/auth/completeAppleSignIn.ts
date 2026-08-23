type AppleSignInCompletion = {
  createdSessionId?: string | null;
  setActive?: (params: { session: string }) => Promise<unknown>;
};

type SocialSignInCompletion = {
  createdSessionId?: string | null;
  setActive?: (params: { session: string }) => Promise<unknown>;
  authSessionResult?: { type?: string | null } | null;
};

export function socialSignInErrorMessage(providerLabel: "Google" | "Facebook"): string {
  return `${providerLabel} sign-in could not finish. Try again or use another sign-in method.`;
}

export async function completeSocialSignIn(
  result: SocialSignInCompletion,
  providerLabel: "Google" | "Facebook",
): Promise<"complete" | "canceled"> {
  if (result.createdSessionId) {
    if (!result.setActive) {
      throw new Error(`${providerLabel} sign-in could not finish setting up your account. Try again or use another sign-in method.`);
    }
    await result.setActive({ session: result.createdSessionId });
    return "complete";
  }

  const resultType = result.authSessionResult?.type?.toLowerCase();
  if (resultType === "cancel" || resultType === "dismiss") return "canceled";

  throw new Error(`${providerLabel} sign-in did not create a mobile session. Try again or use another sign-in method.`);
}

export async function completeAppleSignIn(result: AppleSignInCompletion): Promise<"complete" | "canceled"> {
  if (!result.createdSessionId) return "canceled";

  if (!result.setActive) {
    throw new Error("Apple sign-in could not finish setting up your account. Try another sign-in method or contact support.");
  }

  await result.setActive({ session: result.createdSessionId });
  return "complete";
}
