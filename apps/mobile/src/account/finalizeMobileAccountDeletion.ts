type FinalizeMobileAccountDeletionOptions = {
  deleteAccount: () => Promise<void>;
  signOut?: () => Promise<void>;
};

export async function finalizeMobileAccountDeletion({
  deleteAccount,
  signOut,
}: FinalizeMobileAccountDeletionOptions): Promise<{ signedOut: boolean }> {
  await deleteAccount();

  if (!signOut) return { signedOut: false };

  try {
    await signOut();
    return { signedOut: true };
  } catch {
    return { signedOut: false };
  }
}
