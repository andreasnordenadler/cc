import { auth, clerkClient } from "@clerk/nextjs/server";
import { AsyncLocalStorage } from "node:async_hooks";
import { compactAnalyticsStore, getAnalyticsStore } from "@/lib/analytics";
import {
  OFFICIAL_GROUP_QUEST_METADATA_KEY,
  findGroupQuestById,
  isBuiltInOfficialGroupQuestHost,
  upsertHostGroupQuest,
  upsertOfficialGroupQuestParticipation,
} from "@/lib/groupquests";
import { handleGroupQuestJoinRequest, type GroupQuestJoinDependencies } from "@/lib/groupquest-join-route";
import type { ServerGroupQuest } from "@/lib/groupquests";

type MetadataClient = {
  users: {
    getUser: (userId: string) => Promise<{ publicMetadata?: unknown; privateMetadata?: unknown }>;
    updateUserMetadata: (userId: string, metadata: Record<string, unknown>) => Promise<unknown>;
  };
};

export async function saveWebJoinedQuest(client: MetadataClient, input: {
  authenticatedUserId: string;
  hostUserId: string;
  joinedQuest: ServerGroupQuest;
}) {
  const storeOnParticipant = isBuiltInOfficialGroupQuestHost(input.hostUserId);
  const storageUserId = storeOnParticipant ? input.authenticatedUserId : input.hostUserId;
  const storageUser = await client.users.getUser(storageUserId);
  if (storeOnParticipant) {
    const publicMetadata = storageUser.publicMetadata && typeof storageUser.publicMetadata === "object"
      ? storageUser.publicMetadata as Record<string, unknown>
      : {};
    const participationPatch = upsertOfficialGroupQuestParticipation(publicMetadata, input.joinedQuest, input.authenticatedUserId);
    if (!(input.joinedQuest.id in participationPatch)) {
      throw new Error("official_participation_metadata_capacity");
    }
    await client.users.updateUserMetadata(storageUserId, {
      publicMetadata: {
        [OFFICIAL_GROUP_QUEST_METADATA_KEY]: participationPatch,
      },
    });
    return;
  }
  await client.users.updateUserMetadata(storageUserId, {
    privateMetadata: {
      ...(storageUser.privateMetadata && typeof storageUser.privateMetadata === "object" ? storageUser.privateMetadata : {}),
      sqcAnalytics: compactAnalyticsStore(getAnalyticsStore(storageUser.privateMetadata)),
      sqcGroupQuests: upsertHostGroupQuest(storageUser.privateMetadata, input.joinedQuest),
    },
  });
}

const testJoinDependencies = new AsyncLocalStorage<GroupQuestJoinDependencies>();

export function withWebJoinRouteTestDependencies<Result>(dependencies: GroupQuestJoinDependencies, callback: () => Result): Result {
  if (process.env.NODE_ENV !== "test") throw new Error("Join route dependency overrides are test-only.");
  return testJoinDependencies.run(dependencies, callback);
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const testDependencies = process.env.NODE_ENV === "test" ? testJoinDependencies.getStore() : undefined;
  if (testDependencies) return handleGroupQuestJoinRequest(request, id, testDependencies);
  const client = await clerkClient();
  return handleGroupQuestJoinRequest(request, id, {
    getAuthenticatedUserId: async () => (await auth()).userId,
    findQuestById: (questId) => findGroupQuestById(client, questId),
    getUser: (userId) => client.users.getUser(userId),
    saveJoinedQuest: (input) => saveWebJoinedQuest(client, input),
  });
}
