export type MobileAccountLoadOptions<Account> = {
  isLoaded: boolean;
  isSignedIn: boolean;
  getSessionToken: () => Promise<string | null>;
  fetchAccount: (sessionToken: string | null) => Promise<Account>;
  applyAccount: (account: Account) => void;
  applyFallback?: () => void;
  fallbackAccount: Account;
};

export async function loadMobileAccount<Account>({
  isLoaded,
  isSignedIn,
  getSessionToken,
  fetchAccount,
  applyAccount,
  applyFallback,
  fallbackAccount,
}: MobileAccountLoadOptions<Account>): Promise<Account> {
  if (!isLoaded) {
    applyFallback?.();
    return fallbackAccount;
  }

  try {
    const sessionToken = isSignedIn ? await getSessionToken() : null;
    const account = await fetchAccount(sessionToken);
    applyAccount(account);
    return account;
  } catch {
    applyFallback?.();
    return fallbackAccount;
  }
}
