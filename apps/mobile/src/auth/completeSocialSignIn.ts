type SocialSignInCompletion = {
  authSessionResult?: {
    type?: string | null;
  } | null;
  createdSessionId?: string | null;
  setActive?: (params: { session: string }) => Promise<unknown>;
  signIn?: { status?: string | null } | null;
  signUp?: { status?: string | null } | null;
};

type SocialSignInOutcome =
  | { status: "canceled" | "complete" }
  | {
      status: "incomplete";
      authResultType: string;
      signInStatus: string;
      signUpStatus: string;
    };

export async function completeSocialSignIn(result: SocialSignInCompletion): Promise<SocialSignInOutcome> {
  if (["cancel", "dismiss"].includes(result.authSessionResult?.type ?? "")) {
    return { status: "canceled" };
  }

  if (result.createdSessionId && result.setActive) {
    await result.setActive({ session: result.createdSessionId });
    return { status: "complete" };
  }

  return {
    status: "incomplete",
    authResultType: result.authSessionResult?.type ?? "unknown",
    signInStatus: result.signIn?.status ?? "unknown",
    signUpStatus: result.signUp?.status ?? "unknown",
  };
}
