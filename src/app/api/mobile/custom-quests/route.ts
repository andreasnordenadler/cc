import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getMobileRequestUserId } from "@/lib/mobile-auth";
import { handleCustomQuestCreateRequest } from "@/lib/custom-quest-create-route";
import { chooseCustomSideQuestBadge, getCustomSideQuests, parseCustomRuleConfig, type CustomSideQuest } from "@/lib/custom-side-quests";
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
  });
}

export async function DELETE(request: Request) {
  const userId = await getMobileRequestUserId(request);
  if (!userId) return NextResponse.json({ apiVersion: 1, authenticated: false, ok: false, message: "Sign in to delete custom Side Quests." }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id") ?? "";
  if (!id.startsWith("custom-")) return NextResponse.json({ apiVersion: 1, authenticated: true, ok: false, message: "Unknown custom Side Quest." }, { status: 400 });
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const publicMetadata = user.publicMetadata ? user.publicMetadata as UserMetadataRecord : {};
  const privateMetadata = user.privateMetadata && typeof user.privateMetadata === "object" ? user.privateMetadata as UserMetadataRecord : {};
  const next = getCustomSideQuestStore(privateMetadata, publicMetadata).filter((item) => item.id !== id).map(compactCustomSideQuest).slice(0, 8);
  const active = publicMetadata.activeChallenge && typeof publicMetadata.activeChallenge === "object" && (publicMetadata.activeChallenge as { id?: string }).id === id ? null : publicMetadata.activeChallenge;
  if (active !== publicMetadata.activeChallenge) {
    await client.users.updateUserMetadata(userId, { publicMetadata: { ...publicMetadata, activeChallenge: active }, privateMetadata: { customSideQuests: next } });
  } else {
    await saveCustomQuestStoreWithFallback(client, userId, next, privateMetadata);
  }
  return NextResponse.json({ apiVersion: 1, authenticated: true, ok: true, action: "delete", customSideQuests: next, message: "Custom Side Quest deleted." });
}

function getCustomSideQuestStore(privateMetadata: UserMetadataRecord, publicMetadata: UserMetadataRecord) {
  const privateQuests = getCustomSideQuests(privateMetadata);
  return privateQuests.length ? privateQuests : getCustomSideQuests(publicMetadata);
}


function getMetadataSaveLogReason(caught: unknown) {
  const details = caught && typeof caught === "object" ? caught as { message?: unknown; status?: unknown; clerkError?: unknown; errors?: unknown } : null;
  return JSON.stringify({
    message: details?.message ?? String(caught ?? ""),
    status: details?.status,
    clerkError: details?.clerkError,
    errors: details?.errors,
  }).slice(0, 1000);
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
      console.error("mobile custom Side Quest compact save retry", { count: attempt.length, bytes: JSON.stringify({ customSideQuests: attempt }).length, reason: getMetadataSaveLogReason(caught) });
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
      console.error("mobile custom Side Quest cleaned save retry", { count: attempt.length, reason: getMetadataSaveLogReason(caught) });
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
