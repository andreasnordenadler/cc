export function createMobileSessionGuard(dependencies: {
  getSessionToken: () => Promise<string | null>;
  signOut: () => Promise<void>;
  onInvalidate: () => void;
}) {
  let current = true;
  return {
    isCurrent: () => current,
    getSessionToken: async () => {
      if (!current) throw new Error("session_changed");
      const token = await dependencies.getSessionToken();
      if (!current) throw new Error("session_changed");
      return token;
    },
    signOut: async () => {
      current = false;
      dependencies.onInvalidate();
      await dependencies.signOut();
    },
  };
}

export type MobileAccountLoadOptions<Account> = {
  isLoaded: boolean;
  isSignedIn: boolean;
  isCurrent?: () => boolean;
  getSessionToken: () => Promise<string | null>;
  fetchAccount: (sessionToken: string | null) => Promise<Account>;
  applyAccount: (account: Account) => void;
  applyFallback?: () => void;
  applySignedInFallback?: () => void;
  fallbackAccount: Account;
};

export async function loadMobileAccount<Account>({
  isLoaded,
  isSignedIn,
  isCurrent = () => true,
  getSessionToken,
  fetchAccount,
  applyAccount,
  applyFallback,
  applySignedInFallback,
  fallbackAccount,
}: MobileAccountLoadOptions<Account>): Promise<Account> {
  if (!isLoaded) {
    applyFallback?.();
    return fallbackAccount;
  }

  try {
    const sessionToken = isSignedIn ? await getSessionToken() : null;
    const account = await fetchAccount(sessionToken);
    if (!isCurrent()) return fallbackAccount;
    applyAccount(account);
    return account;
  } catch {
    if (!isCurrent()) return fallbackAccount;
    if (isSignedIn) {
      applySignedInFallback?.();
    } else {
      applyFallback?.();
    }
    return fallbackAccount;
  }
}
