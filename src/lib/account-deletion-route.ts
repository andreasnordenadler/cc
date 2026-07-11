import { deleteAuthenticatedAccount } from "./account-deletion";

type AccountDeletionRouteDependencies = {
  getAuthenticatedUserId: (request: Request) => Promise<string | null>;
  purgeReplicatedUserData: (userId: string) => Promise<unknown>;
  deleteUser: (userId: string) => Promise<unknown>;
};

export async function handleAccountDeletionRequest(request: Request, dependencies: AccountDeletionRouteDependencies) {
  let payload: { confirmation?: unknown };
  try {
    payload = await request.json() as { confirmation?: unknown };
  } catch {
    return Response.json(
      { ok: false, code: "invalid_request", message: "Send a JSON deletion confirmation." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const authenticatedUserId = await dependencies.getAuthenticatedUserId(request);
  const result = await deleteAuthenticatedAccount(
    { authenticatedUserId, confirmation: payload.confirmation },
    { purgeReplicatedUserData: dependencies.purgeReplicatedUserData, deleteUser: dependencies.deleteUser },
  );

  return Response.json(result, { status: result.status, headers: { "Cache-Control": "no-store" } });
}
