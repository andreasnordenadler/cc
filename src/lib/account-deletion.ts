export const DELETE_ACCOUNT_CONFIRMATION = "DELETE MY ACCOUNT";

export type AccountDeletionResult = {
  ok: boolean;
  status: 200 | 400 | 401 | 503;
  code: "account_deleted" | "confirmation_required" | "unauthenticated" | "cleanup_temporarily_unavailable" | "deletion_temporarily_unavailable";
  message: string;
};

type AccountDeletionDependencies = {
  purgeReplicatedUserData: (userId: string) => Promise<unknown>;
  deleteUser: (userId: string) => Promise<unknown>;
};

export async function deleteAuthenticatedAccount(
  input: { authenticatedUserId: string | null; confirmation: unknown },
  dependencies: AccountDeletionDependencies,
): Promise<AccountDeletionResult> {
  if (!input.authenticatedUserId) {
    return { ok: false, status: 401, code: "unauthenticated", message: "Sign in to delete your account." };
  }

  if (input.confirmation !== DELETE_ACCOUNT_CONFIRMATION) {
    return {
      ok: false,
      status: 400,
      code: "confirmation_required",
      message: `Type ${DELETE_ACCOUNT_CONFIRMATION} to confirm permanent deletion.`,
    };
  }

  let rollbackReplicatedUserData: unknown;
  try {
    rollbackReplicatedUserData = await dependencies.purgeReplicatedUserData(input.authenticatedUserId);
  } catch {
    return {
      ok: false,
      status: 503,
      code: "cleanup_temporarily_unavailable",
      message: "We could not safely remove all account data right now. Your account was not reported as deleted; please try again.",
    };
  }

  try {
    await dependencies.deleteUser(input.authenticatedUserId);
    return {
      ok: true,
      status: 200,
      code: "account_deleted",
      message: "Your Side Quest Chess account and its Clerk data were deleted.",
    };
  } catch {
    if (typeof rollbackReplicatedUserData === "function") {
      try {
        await rollbackReplicatedUserData();
      } catch {
        // Keep the response generic; operators can reconcile this exceptional rollback failure.
      }
    }
    return {
      ok: false,
      status: 503,
      code: "deletion_temporarily_unavailable",
      message: "We could not delete your account right now. No deletion was reported as complete; please try again.",
    };
  }
}
