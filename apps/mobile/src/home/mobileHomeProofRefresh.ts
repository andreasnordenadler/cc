export type MobileHomeProofRefreshSnapshot = {
  activeQuestId: string | null;
  activeQuestCompleted: boolean;
  latestReceipt: {
    id: string | null;
    challengeId: string | null;
    checkedAt: string | null;
  } | null;
  feedback: string;
};

export type MobileHomeProofRefreshFeedback = {
  kind: "success" | "error";
  message: string;
};

type RefreshDependencies = {
  challengeId: string;
  syncAccount: () => Promise<MobileHomeProofRefreshSnapshot>;
  checkProof: (challengeId: string) => Promise<void>;
};

export function createMobileHomeProofRefreshCoordinator() {
  let homeVisit = 0;
  let inFlight: Promise<MobileHomeProofRefreshFeedback | null> | null = null;
  let pendingAttempt: { challengeId: string; receiptIdentity: string | null } | null = null;

  const performRefresh = async ({ challengeId, syncAccount, checkProof }: RefreshDependencies): Promise<MobileHomeProofRefreshFeedback> => {
    let accountBeforeCheck: MobileHomeProofRefreshSnapshot;
    try {
      accountBeforeCheck = await syncAccount();
    } catch {
      return {
        kind: "error",
        message: "Couldn’t sync your proof. Check your connection, then pull down to try again.",
      };
    }
    const receiptIdentity = accountBeforeCheck.latestReceipt
      ? `${accountBeforeCheck.latestReceipt.id ?? ""}\u0000${accountBeforeCheck.latestReceipt.challengeId ?? ""}\u0000${accountBeforeCheck.latestReceipt.checkedAt ?? ""}`
      : null;
    const pendingAttemptToReconcile = pendingAttempt;
    const syncedPendingAttempt = Boolean(
      pendingAttemptToReconcile
      && accountBeforeCheck.latestReceipt?.challengeId === pendingAttemptToReconcile.challengeId
      && receiptIdentity !== pendingAttemptToReconcile.receiptIdentity,
    );

    if (pendingAttemptToReconcile) {
      pendingAttempt = null;
      if (
        accountBeforeCheck.activeQuestId !== pendingAttemptToReconcile.challengeId
        || accountBeforeCheck.activeQuestCompleted
        || syncedPendingAttempt
      ) {
        return { kind: "success", message: accountBeforeCheck.feedback };
      }
      return {
        kind: "error",
        message: "No new proof result arrived. Pull down once more to retry the check.",
      };
    }

    if (accountBeforeCheck.activeQuestId !== challengeId) {
      pendingAttempt = null;
      return { kind: "success", message: accountBeforeCheck.feedback };
    }

    if (accountBeforeCheck.activeQuestCompleted) {
      pendingAttempt = null;
      return { kind: "success", message: accountBeforeCheck.feedback };
    }

    try {
      await checkProof(challengeId);
      pendingAttempt = null;
      const account = await syncAccount();
      return { kind: "success", message: account.feedback };
    } catch {
      pendingAttempt = { challengeId, receiptIdentity };
      return {
        kind: "error",
        message: "Proof refresh didn’t finish. It may have reached the referee. Pull down again to sync before retrying.",
      };
    }
  };

  return {
    refresh(dependencies: RefreshDependencies): Promise<MobileHomeProofRefreshFeedback | null> {
      if (inFlight) return inFlight;
      const refreshVisit = homeVisit;
      inFlight = performRefresh(dependencies)
        .then((feedback) => refreshVisit === homeVisit ? feedback : null)
        .finally(() => {
          inFlight = null;
        });
      return inFlight;
    },
    leaveHome() {
      homeVisit += 1;
    },
  };
}
