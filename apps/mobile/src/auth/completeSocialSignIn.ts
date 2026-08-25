type SocialSignInCompletion = {
  createdSessionId?: string | null;
  setActive?: (params: { session: string }) => Promise<unknown>;
  authSessionResult?: { type?: string } | null;
};

export async function completeSocialSignIn(
  result: SocialSignInCompletion,
): Promise<"complete" | "canceled"> {
  if (["cancel", "dismiss"].includes(result.authSessionResult?.type ?? "")) return "canceled";

  if (result.createdSessionId && result.setActive) {
    await result.setActive({ session: result.createdSessionId });
    return "complete";
  }

  throw new Error("Social sign-in could not finish setting up your account. Try again.");
}
