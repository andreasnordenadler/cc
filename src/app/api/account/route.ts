import { auth, clerkClient } from "@clerk/nextjs/server";
import { handleAccountDeletionRequest } from "@/lib/account-deletion-route";
import { purgeReplicatedAccountData } from "@/lib/account-deletion-cleanup";

export async function DELETE(request: Request) {
  const client = await clerkClient();
  return handleAccountDeletionRequest(request, {
    getAuthenticatedUserId: async () => (await auth()).userId,
    purgeReplicatedUserData: (userId) => purgeReplicatedAccountData(client, userId),
    deleteUser: (userId) => client.users.deleteUser(userId),
  });
}
