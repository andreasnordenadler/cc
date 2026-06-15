import { unstable_noStore as noStore } from "next/cache";
import type { UserMetadataRecord } from "@/lib/user-metadata";

export type CommunityLikeTargetType = "solo" | "multiplayer";

export type CommunityLike = {
  targetType: CommunityLikeTargetType;
  targetId: string;
  likedAt: string;
};

export type CommunityLikeSummary = {
  count: number;
  likedByViewer: boolean;
};

export const COMMUNITY_LIKES_METADATA_KEY = "sqcCommunityLikes";

export function makeCommunityLikeKey(targetType: CommunityLikeTargetType, targetId: string) {
  return `${targetType}:${targetId}`;
}

export function getCommunityLikes(metadata: UserMetadataRecord | null | undefined): CommunityLike[] {
  const raw = metadata?.[COMMUNITY_LIKES_METADATA_KEY];
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: CommunityLike[] = [];

  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const record = entry as Record<string, unknown>;
    const targetType = record.targetType === "multiplayer" ? "multiplayer" : record.targetType === "solo" ? "solo" : null;
    const targetId = typeof record.targetId === "string" ? record.targetId.trim().slice(0, 120) : "";
    if (!targetType || !targetId) continue;
    const key = makeCommunityLikeKey(targetType, targetId);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      targetType,
      targetId,
      likedAt: typeof record.likedAt === "string" ? record.likedAt : new Date(0).toISOString(),
    });
  }

  return out.slice(0, 500);
}

export function hasCommunityLike(metadata: UserMetadataRecord | null | undefined, targetType: CommunityLikeTargetType, targetId: string) {
  const key = makeCommunityLikeKey(targetType, targetId);
  return getCommunityLikes(metadata).some((like) => makeCommunityLikeKey(like.targetType, like.targetId) === key);
}

export function upsertCommunityLike(metadata: UserMetadataRecord | null | undefined, targetType: CommunityLikeTargetType, targetId: string, now = new Date()) {
  const key = makeCommunityLikeKey(targetType, targetId);
  const existing = getCommunityLikes(metadata).filter((like) => makeCommunityLikeKey(like.targetType, like.targetId) !== key);
  return [{ targetType, targetId, likedAt: now.toISOString() }, ...existing].slice(0, 500);
}

export function removeCommunityLike(metadata: UserMetadataRecord | null | undefined, targetType: CommunityLikeTargetType, targetId: string) {
  const key = makeCommunityLikeKey(targetType, targetId);
  return getCommunityLikes(metadata).filter((like) => makeCommunityLikeKey(like.targetType, like.targetId) !== key);
}

export async function getCommunityLikeSummaries(
  client: { users: { getUserList: (params: { limit: number; offset?: number; orderBy?: "-created_at" }) => Promise<{ data: Array<{ id: string; privateMetadata: unknown }> }> } },
  viewerUserId: string | null,
) {
  noStore();
  const counts = new Map<string, number>();
  let viewerLikes = new Set<string>();
  let offset = 0;

  while (true) {
    const batch = await client.users.getUserList({ limit: 100, offset, orderBy: "-created_at" });
    for (const user of batch.data) {
      const likes = getCommunityLikes(user.privateMetadata as UserMetadataRecord | null | undefined);
      if (viewerUserId && user.id === viewerUserId) {
        viewerLikes = new Set(likes.map((like) => makeCommunityLikeKey(like.targetType, like.targetId)));
      }
      for (const like of likes) {
        const key = makeCommunityLikeKey(like.targetType, like.targetId);
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    }
    if (batch.data.length < 100) break;
    offset += batch.data.length;
  }

  return {
    get(targetType: CommunityLikeTargetType, targetId: string): CommunityLikeSummary {
      const key = makeCommunityLikeKey(targetType, targetId);
      return { count: counts.get(key) ?? 0, likedByViewer: viewerLikes.has(key) };
    },
  };
}

export function normalizeCommunityLikeTargetType(value: unknown): CommunityLikeTargetType | null {
  return value === "solo" || value === "multiplayer" ? value : null;
}

export function cleanCommunityLikeTargetId(value: unknown) {
  return typeof value === "string" ? value.trim().slice(0, 120) : "";
}
