import { clerkClient } from "@clerk/nextjs/server";
import { AsyncLocalStorage } from "node:async_hooks";
import { getMobileRequestUserId } from "@/lib/mobile-auth";
import { handleCustomQuestDeleteRequest } from "@/lib/custom-quest-delete-route";
import { handleCustomQuestCreateRequest } from "@/lib/custom-quest-create-route";
import { chooseCustomSideQuestBadge, type CustomSideQuest } from "@/lib/custom-side-quests";
import type { UserMetadataRecord } from "@/lib/user-metadata";

export async function POST(request: Request) {
  const override = process.env.NODE_ENV === "test" ? routeTestDependencies.getStore() : undefined;
  let clientPromise: ReturnType<typeof clerkClient> | undefined;
  const getClient = () => clientPromise ??= override?.getClient() ?? clerkClient();
  return handleCustomQuestCreateRequest(request, {
    getAuthenticatedUserId: override?.authenticate ?? getMobileRequestUserId,
    getMetadata: async (userId) => {
      const client = await getClient();
      const user = await client.users.getUser(userId);
      return {
        publicMetadata: user.publicMetadata ? user.publicMetadata as UserMetadataRecord : {},
        privateMetadata: user.privateMetadata && typeof user.privateMetadata === "object" ? user.privateMetadata as UserMetadataRecord : {},
      };
    },
    saveCustomQuests: async (userId, quests) => saveCustomQuestStore(await getClient(), userId, quests),
    chooseBadge: chooseCustomSideQuestBadge,
    logPersistenceError: console.error,
  });
}

type CustomQuestRouteDependencies = {
  authenticate: (request: Request) => Promise<string | null>;
  getClient: () => ReturnType<typeof clerkClient>;
};

const routeTestDependencies = new AsyncLocalStorage<CustomQuestRouteDependencies>();

export function withCustomQuestRouteTestDependencies<Result>(
  dependencies: CustomQuestRouteDependencies,
  callback: () => Result,
): Result {
  if (process.env.NODE_ENV !== "test") throw new Error("Custom quest route dependency overrides are test-only.");
  return routeTestDependencies.run(dependencies, callback);
}

export async function DELETE(request: Request) {
  const override = process.env.NODE_ENV === "test" ? routeTestDependencies.getStore() : undefined;
  let clientPromise: ReturnType<typeof clerkClient> | undefined;
  const getClient = () => clientPromise ??= override?.getClient() ?? clerkClient();
  return handleCustomQuestDeleteRequest(request, {
    getAuthenticatedUserId: override?.authenticate ?? getMobileRequestUserId,
    getMetadata: async (userId) => {
      const client = await getClient();
      const user = await client.users.getUser(userId);
      return {
        publicMetadata: user.publicMetadata ? user.publicMetadata as UserMetadataRecord : {},
        privateMetadata: user.privateMetadata && typeof user.privateMetadata === "object" ? user.privateMetadata as UserMetadataRecord : {},
      };
    },
    persistDeletion: async (userId, input) => {
      const client = await getClient();
      const next = input.customSideQuests;
      if (input.clearActiveChallenge) {
        await client.users.updateUserMetadata(userId, {
          publicMetadata: { activeChallenge: null },
          privateMetadata: { customSideQuests: next },
        });
        return next;
      }
      return saveCustomQuestStore(client, userId, next);
    },
    logPersistenceError: console.error,
  });
}

async function saveCustomQuestStore(client: Awaited<ReturnType<typeof clerkClient>>, userId: string, quests: CustomSideQuest[]) {
  // Clerk merges metadata patches. Never evict quests or clear unrelated keys to
  // recover from a rejected write; propagate the failure to the route handler.
  await client.users.updateUserMetadata(userId, { privateMetadata: { customSideQuests: quests } });
  return quests;
}
