import { auth, clerkClient } from "@clerk/nextjs/server";
import { compactAnalyticsStore, getAnalyticsStore } from "@/lib/analytics";
import {
  findGroupQuestById,
  isBuiltInOfficialGroupQuestHost,
  upsertHostGroupQuest,
  upsertParticipantGroupQuest,
} from "@/lib/groupquests";
import { handleGroupQuestJoinRequest } from "@/lib/groupquest-join-route";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await clerkClient();
  return handleGroupQuestJoinRequest(request, id, {
    getAuthenticatedUserId: async () => (await auth()).userId,
    findQuestById: (questId) => findGroupQuestById(client, questId),
    getUser: (userId) => client.users.getUser(userId),
    saveJoinedQuest: async ({ authenticatedUserId, hostUserId, joinedQuest }) => {
      const storeOnParticipant = isBuiltInOfficialGroupQuestHost(hostUserId);
      const storageUserId = storeOnParticipant ? authenticatedUserId : hostUserId;
      const storageUser = await client.users.getUser(storageUserId);
      await client.users.updateUserMetadata(storageUserId, {
        privateMetadata: {
          ...(storageUser.privateMetadata ?? {}),
          sqcAnalytics: compactAnalyticsStore(getAnalyticsStore(storageUser.privateMetadata)),
          sqcGroupQuests: storeOnParticipant
            ? upsertParticipantGroupQuest(storageUser.privateMetadata, joinedQuest, authenticatedUserId)
            : upsertHostGroupQuest(storageUser.privateMetadata, joinedQuest),
        },
      });
    },
  });
}
