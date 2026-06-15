import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import {
  cleanCommunityLikeTargetId,
  normalizeCommunityLikeTargetType,
  removeCommunityLike,
  upsertCommunityLike,
  COMMUNITY_LIKES_METADATA_KEY,
} from "@/lib/community-likes";
import type { UserMetadataRecord } from "@/lib/user-metadata";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await request.json().catch(() => ({})) as Record<string, unknown>
    : Object.fromEntries(await request.formData()) as Record<string, unknown>;

  const targetType = normalizeCommunityLikeTargetType(payload.targetType);
  const targetId = cleanCommunityLikeTargetId(payload.targetId);
  const intent = payload.intent === "unlike" ? "unlike" : "like";
  const returnTo = cleanReturnTo(payload.returnTo, targetType, targetId);

  if (!targetType || !targetId) {
    return contentType.includes("application/json")
      ? NextResponse.json({ ok: false, error: "invalid_like_target" }, { status: 400 })
      : NextResponse.redirect(new URL(returnTo, request.url), { status: 303 });
  }

  const { userId } = await auth();

  if (!userId) {
    return contentType.includes("application/json")
      ? NextResponse.json({ ok: false, error: "sign_in_required" }, { status: 401 })
      : NextResponse.redirect(new URL(`/sign-in?redirect_url=${encodeURIComponent(returnTo)}`, request.url), { status: 303 });
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const privateMetadata = (user.privateMetadata && typeof user.privateMetadata === "object" ? user.privateMetadata : {}) as UserMetadataRecord;
  const nextLikes = intent === "unlike"
    ? removeCommunityLike(privateMetadata, targetType, targetId)
    : upsertCommunityLike(privateMetadata, targetType, targetId);

  await client.users.updateUserMetadata(userId, {
    privateMetadata: {
      ...privateMetadata,
      [COMMUNITY_LIKES_METADATA_KEY]: nextLikes,
    },
  });

  revalidatePath("/challenges/community");
  revalidatePath(`/challenges/community/${encodeURIComponent(targetId)}`);
  revalidatePath("/groupquests/public");
  revalidatePath(`/groupquests/${encodeURIComponent(targetId)}`);
  revalidatePath(returnTo);

  if (contentType.includes("application/json")) {
    return NextResponse.json({ ok: true, targetType, targetId, liked: intent === "like", countUnknownUntilRefresh: true });
  }

  return NextResponse.redirect(new URL(returnTo, request.url), { status: 303 });
}

function cleanReturnTo(value: unknown, targetType: ReturnType<typeof normalizeCommunityLikeTargetType>, targetId: string) {
  const fallback = targetType === "multiplayer" && targetId ? `/groupquests/${encodeURIComponent(targetId)}` : targetId ? `/challenges/community/${encodeURIComponent(targetId)}` : "/challenges/community";
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  return value.slice(0, 400);
}
