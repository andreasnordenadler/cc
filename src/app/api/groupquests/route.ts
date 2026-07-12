import { auth, clerkClient } from "@clerk/nextjs/server";
import { findPublicCommunityCustomSideQuestById } from "@/lib/community-side-quests";
import { handleGroupQuestCreateRequest } from "@/lib/groupquest-create-route";

export async function POST(request: Request) {
  const client = await clerkClient();
  return handleGroupQuestCreateRequest(request, {
    getAuthenticatedUserId: async () => (await auth()).userId,
    getUser: (userId) => client.users.getUser(userId),
    findPublicCustomQuestById: (id) => findPublicCommunityCustomSideQuestById(client, id),
    savePrivateMetadata: async (userId, privateMetadata) => {
      await client.users.updateUserMetadata(userId, { privateMetadata });
    },
  });
}
