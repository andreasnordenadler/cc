import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  cleanCommunityLikeTargetId,
  COMMUNITY_LIKES_METADATA_KEY,
  getCommunityLikeSummaries,
  normalizeCommunityLikeTargetType,
  removeCommunityLike,
  upsertCommunityLike,
} from "@/lib/community-likes";
import { getMobileRequestUserId } from "@/lib/mobile-auth";
import type { UserMetadataRecord } from "@/lib/user-metadata";

export async function POST(request: Request) {
  const userId = await getMobileRequestUserId(request);
  if (!userId) {
    return NextResponse.json({ apiVersion: 1, authenticated: false, ok: false, message: "Sign in to like Community Side Quests." }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = await request.json() as Record<string, unknown>;
  } catch {
    return NextResponse.json({ apiVersion: 1, authenticated: true, ok: false, message: "Send JSON for the like action." }, { status: 400 });
  }

  const targetType = normalizeCommunityLikeTargetType(payload.targetType);
  const targetId = cleanCommunityLikeTargetId(payload.targetId);
  const intent = payload.intent === "unlike" ? "unlike" : "like";

  if (!targetType || !targetId) {
    return NextResponse.json({ apiVersion: 1, authenticated: true, ok: false, message: "Choose a Community Side Quest to like." }, { status: 400 });
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

  const summaries = await getCommunityLikeSummaries(client, userId);

  return NextResponse.json({
    apiVersion: 1,
    authenticated: true,
    ok: true,
    targetType,
    targetId,
    liked: intent === "like",
    likeSummary: summaries.get(targetType, targetId),
    message: intent === "like" ? "Side Quest liked." : "Side Quest unliked.",
  });
}
