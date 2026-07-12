import { auth, clerkClient } from "@clerk/nextjs/server";
import { findGroupQuestByInviteKey } from "@/lib/groupquests";
import { handleInviteLookupRequest } from "@/lib/groupquest-invite-route";

export async function POST(request: Request) {
  const client = await clerkClient();
  return handleInviteLookupRequest(request, {
    getAuthenticatedUserId: async () => (await auth()).userId,
    findQuestByInviteKey: (inviteKey) => findGroupQuestByInviteKey(client, inviteKey),
  });
}
