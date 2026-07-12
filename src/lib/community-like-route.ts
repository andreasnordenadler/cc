import {
  cleanCommunityLikeTargetId,
  normalizeCommunityLikeTargetType,
  removeCommunityLike,
  upsertCommunityLike,
  COMMUNITY_LIKES_METADATA_KEY,
} from "./community-likes";
import type { UserMetadataRecord } from "./user-metadata";

export type CommunityLikeDependencies = {
  getAuthenticatedUserId: () => Promise<string | null>;
  getPrivateMetadata: (userId: string) => Promise<UserMetadataRecord>;
  savePrivateMetadata: (userId: string, metadata: UserMetadataRecord) => Promise<void>;
  revalidatePath: (path: string) => void;
  now?: () => Date;
};

export async function handleCommunityLikeRequest(request: Request, dependencies: CommunityLikeDependencies): Promise<Response> {
  const isJson = (request.headers.get("content-type") ?? "").includes("application/json");
  const payload = isJson
    ? await request.json().catch(() => ({})) as Record<string, unknown>
    : Object.fromEntries(await request.formData()) as Record<string, unknown>;
  const targetType = normalizeCommunityLikeTargetType(payload.targetType);
  const targetId = cleanCommunityLikeTargetId(payload.targetId);
  const intent = payload.intent === "unlike" ? "unlike" : "like";
  const returnTo = cleanReturnTo(payload.returnTo, targetType, targetId);

  if (!targetType || !targetId) return isJson
    ? Response.json({ ok: false, error: "invalid_like_target" }, { status: 400 })
    : Response.redirect(new URL(returnTo, request.url), 303);

  let userId: string | null = null;
  try { userId = await dependencies.getAuthenticatedUserId(); } catch { userId = null; }
  if (!userId) return isJson
    ? Response.json({ ok: false, error: "sign_in_required" }, { status: 401 })
    : Response.redirect(new URL(`/sign-in?redirect_url=${encodeURIComponent(returnTo)}`, request.url), 303);

  try {
    const privateMetadata = await dependencies.getPrivateMetadata(userId);
    const nextLikes = intent === "unlike"
      ? removeCommunityLike(privateMetadata, targetType, targetId)
      : upsertCommunityLike(privateMetadata, targetType, targetId, dependencies.now?.());
    await dependencies.savePrivateMetadata(userId, { ...privateMetadata, [COMMUNITY_LIKES_METADATA_KEY]: nextLikes });
  } catch {
    return isJson
      ? Response.json({ ok: false, error: "like_update_failed" }, { status: 503 })
      : Response.redirect(new URL(returnTo, request.url), 303);
  }

  for (const path of [
    "/challenges/community", `/challenges/community/${encodeURIComponent(targetId)}`,
    "/challenges", `/challenges/${encodeURIComponent(targetId)}`,
    "/groupquests/public", `/groupquests/${encodeURIComponent(targetId)}`,
  ]) dependencies.revalidatePath(path);
  if (returnTo !== cleanReturnTo(undefined, targetType, targetId)) dependencies.revalidatePath(returnTo);

  return isJson
    ? Response.json({ ok: true, targetType, targetId, liked: intent === "like", countUnknownUntilRefresh: true })
    : Response.redirect(new URL(returnTo, request.url), 303);
}

function cleanReturnTo(value: unknown, targetType: ReturnType<typeof normalizeCommunityLikeTargetType>, targetId: string) {
  const fallback = targetType === "multiplayer" && targetId ? `/groupquests/${encodeURIComponent(targetId)}` : targetId ? `/challenges/community/${encodeURIComponent(targetId)}` : "/challenges/community";
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") ? value.slice(0, 400) : fallback;
}
