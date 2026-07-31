import { clerkClient } from "@clerk/nextjs/server";
import { AsyncLocalStorage } from "node:async_hooks";
import { getMobileRequestUserId } from "@/lib/mobile-auth";
import { handleCustomQuestDeleteRequest } from "@/lib/custom-quest-delete-route";
import { classifyCustomQuestPersistenceError, handleCustomQuestCreateRequest } from "@/lib/custom-quest-create-route";
import { chooseCustomSideQuestBadge, parseCustomRuleConfig, type CustomSideQuest } from "@/lib/custom-side-quests";
import type { UserMetadataRecord } from "@/lib/user-metadata";

export async function POST(request: Request) {
  const client = await clerkClient();
  return handleCustomQuestCreateRequest(request, {
    getAuthenticatedUserId: getMobileRequestUserId,
    getMetadata: async (userId) => {
      const user = await client.users.getUser(userId);
      return {
        publicMetadata: user.publicMetadata ? user.publicMetadata as UserMetadataRecord : {},
        privateMetadata: user.privateMetadata && typeof user.privateMetadata === "object" ? user.privateMetadata as UserMetadataRecord : {},
      };
    },
    saveCustomQuests: (userId, quests, privateMetadata) => saveCustomQuestStoreWithFallback(client, userId, quests, privateMetadata),
    chooseBadge: chooseCustomSideQuestBadge,
    logPersistenceError: console.error,
  });
}

type CustomQuestRouteDependencies = {
  authenticate: (request: Request) => Promise<string | null>;
  getClient: () => ReturnType<typeof clerkClient>;
};

const deleteTestDependencies = new AsyncLocalStorage<CustomQuestRouteDependencies>();

export function withCustomQuestRouteTestDependencies<Result>(
  dependencies: CustomQuestRouteDependencies,
  callback: () => Result,
): Result {
  if (process.env.NODE_ENV !== "test") throw new Error("Custom quest route dependency overrides are test-only.");
  return deleteTestDependencies.run(dependencies, callback);
}

export async function DELETE(request: Request) {
  const override = deleteTestDependencies.getStore();
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
      const next = input.customSideQuests.map(compactCustomSideQuest).slice(0, 8);
      if (input.clearActiveChallenge) {
        await client.users.updateUserMetadata(userId, {
          publicMetadata: { ...input.publicMetadata, activeChallenge: null },
          privateMetadata: { customSideQuests: next },
        });
        return next;
      }
      return saveCustomQuestStoreWithFallback(client, userId, next, input.privateMetadata);
    },
    logPersistenceError: console.error,
  });
}

async function saveCustomQuestStoreWithFallback(client: Awaited<ReturnType<typeof clerkClient>>, userId: string, quests: CustomSideQuest[], privateMetadata: UserMetadataRecord) {
  const attempts = [quests.slice(0, 8), quests.slice(0, 5), quests.slice(0, 3), quests.slice(0, 1)];
  let lastError: unknown = null;

  for (const attempt of attempts) {
    try {
      await client.users.updateUserMetadata(userId, { privateMetadata: { customSideQuests: attempt } });
      return attempt;
    } catch (caught) {
      lastError = caught;
      console.error("mobile custom Side Quest compact save retry", { count: attempt.length, bytes: JSON.stringify({ customSideQuests: attempt }).length, reason: classifyCustomQuestPersistenceError(caught).reason });
    }
  }

  for (const attempt of attempts.slice(-2)) {
    try {
      const cleanedPrivateMetadata = buildCleanPrivateMetadataPatch(privateMetadata, attempt);
      await client.users.updateUserMetadata(userId, { privateMetadata: cleanedPrivateMetadata });
      console.error("mobile custom Side Quest save recovered by clearing oversized private metadata", { count: attempt.length, bytes: JSON.stringify(cleanedPrivateMetadata).length, clearedKeys: Object.keys(privateMetadata).filter((key) => key !== "sqcAdmin" && key !== "customSideQuests") });
      return attempt;
    } catch (caught) {
      lastError = caught;
      console.error("mobile custom Side Quest cleaned save retry", { count: attempt.length, reason: classifyCustomQuestPersistenceError(caught).reason });
    }
  }

  throw lastError;
}

function buildCleanPrivateMetadataPatch(privateMetadata: UserMetadataRecord, customSideQuests: CustomSideQuest[]) {
  const patch: UserMetadataRecord = {};
  for (const key of Object.keys(privateMetadata)) {
    patch[key] = null;
  }
  if (privateMetadata.sqcAdmin === true) patch.sqcAdmin = true;
  patch.customSideQuests = customSideQuests;
  return patch;
}

function compactCustomSideQuest(quest: CustomSideQuest): CustomSideQuest {
  const parsed = parseCustomRuleConfig(quest.config);
  const compactConfig = parsed ? JSON.stringify(parsed) : quest.config.slice(0, 1200);
  return {
    id: quest.id,
    title: cleanText(quest.title, 80) || "Custom Side Quest",
    summary: cleanText(quest.summary, 220) || (quest.lifecycle === "draft" ? "Draft Side Quest" : "Custom Side Quest"),
    config: compactConfig,
    visibility: quest.visibility === "public" ? "public" : "private",
    lifecycle: quest.lifecycle === "draft" || quest.lifecycle === "archived" ? quest.lifecycle : "published",
    createdAt: typeof quest.createdAt === "string" ? quest.createdAt : new Date().toISOString(),
    updatedAt: typeof quest.updatedAt === "string" ? quest.updatedAt : new Date().toISOString(),
    badgeImageUrl: typeof quest.badgeImageUrl === "string" ? quest.badgeImageUrl.slice(0, 160) : null,
  };
}

function cleanText(value: unknown, max: number) { return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, max) : ""; }
