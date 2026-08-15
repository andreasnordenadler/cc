import { deleteMobileAccount } from "../api/sqc";

export type DeleteMobileAccountAndEndSessionOptions = {
  confirmation: string;
  getSessionToken: () => Promise<string | null | undefined>;
  signOut?: () => Promise<void>;
  deleteAccount?: typeof deleteMobileAccount;
};

export type DeleteMobileAccountAndEndSessionResult = {
  sessionEnded: boolean;
};

/**
 * Deletes the server account first, then ends the now-invalid local session.
 * A local sign-out failure must not be reported as a failed deletion because
 * the destructive server operation has already completed.
 */
export async function deleteMobileAccountAndEndSession({
  confirmation,
  getSessionToken,
  signOut,
  deleteAccount = deleteMobileAccount,
}: DeleteMobileAccountAndEndSessionOptions): Promise<DeleteMobileAccountAndEndSessionResult> {
  const sessionToken = await getSessionToken();
  const deletion = await deleteAccount({ sessionToken, confirmation });
  if (!deletion.ok || deletion.code !== "account_deleted") {
    throw new Error(deletion.message || "Side Quest Chess account deletion did not complete.");
  }

  if (!signOut) return { sessionEnded: false };

  try {
    await signOut();
    return { sessionEnded: true };
  } catch {
    return { sessionEnded: false };
  }
}
