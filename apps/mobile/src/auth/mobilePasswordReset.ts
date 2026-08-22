type PasswordResetAttemptResult = {
  status: string | null;
  createdSessionId: string | null;
};

export async function prepareMobilePasswordReset({
  identifier,
  createSignIn,
}: {
  identifier: string;
  createSignIn: (params: { strategy: "reset_password_email_code"; identifier: string }) => Promise<{ status: string | null }>;
}): Promise<{ identifier: string }> {
  const cleanIdentifier = identifier.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanIdentifier)) {
    throw new Error("Enter the email address for your Side Quest Chess account.");
  }

  let result: { status: string | null };
  try {
    result = await createSignIn({ strategy: "reset_password_email_code", identifier: cleanIdentifier });
  } catch {
    // Keep account-existence responses indistinguishable; code verification remains fail-closed.
    return { identifier: cleanIdentifier };
  }
  if (result.status !== "needs_first_factor") {
    return { identifier: cleanIdentifier };
  }
  return { identifier: cleanIdentifier };
}

export async function verifyMobilePasswordResetCode({
  code,
  attemptFirstFactor,
}: {
  code: string;
  attemptFirstFactor: (params: {
    strategy: "reset_password_email_code";
    code: string;
  }) => Promise<PasswordResetAttemptResult>;
}): Promise<void> {
  const cleanCode = code.trim();
  if (!cleanCode) throw new Error("Enter the email code for your password reset.");

  const verification = await attemptFirstFactor({
    strategy: "reset_password_email_code",
    code: cleanCode,
  });

  if (verification.status === "needs_second_factor") {
    throw new Error("Password reset needs another verification step that this build cannot complete yet.");
  }
  if (verification.status !== "needs_new_password") {
    throw new Error(`Password reset code verification did not complete: ${verification.status}.`);
  }
}

export async function completeMobilePasswordReset({
  password,
  resetPassword,
  setActive,
}: {
  password: string;
  resetPassword: (params: {
    password: string;
    signOutOfOtherSessions: true;
  }) => Promise<PasswordResetAttemptResult>;
  setActive: (params: { session: string }) => Promise<unknown>;
}): Promise<void> {
  if (password.length < 8) throw new Error("Choose a new password of at least 8 characters.");

  const result = await resetPassword({ password, signOutOfOtherSessions: true });

  if (result.status === "complete" && result.createdSessionId) {
    await setActive({ session: result.createdSessionId });
    return;
  }

  if (result.status === "needs_second_factor") {
    throw new Error("Password reset needs another verification step that this build cannot complete yet.");
  }

  throw new Error(`Password reset did not complete: ${result.status}.`);
}
