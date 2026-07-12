import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { handleCommunityLikeRequest } from "@/lib/community-like-route";
import type { UserMetadataRecord } from "@/lib/user-metadata";

export async function POST(request: Request) {
  const client = await clerkClient();
  return handleCommunityLikeRequest(request, {
    getAuthenticatedUserId: async () => (await auth()).userId,
    getPrivateMetadata: async (userId) => {
      const user = await client.users.getUser(userId);
      return (user.privateMetadata && typeof user.privateMetadata === "object" ? user.privateMetadata : {}) as UserMetadataRecord;
    },
    savePrivateMetadata: async (userId, privateMetadata) => {
      await client.users.updateUserMetadata(userId, { privateMetadata });
    },
    revalidatePath,
  });
}
