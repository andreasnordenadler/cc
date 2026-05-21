import { auth, verifyToken } from "@clerk/nextjs/server";

export async function getMobileRequestUserId(request: Request): Promise<string | null> {
  const { userId } = await auth();

  if (userId) {
    return userId;
  }

  const token = getBearerToken(request);

  if (!token) {
    return null;
  }

  try {
    const verifiedToken = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    return typeof verifiedToken.sub === "string" ? verifiedToken.sub : null;
  } catch {
    return null;
  }
}

function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization") || request.headers.get("Authorization");
  const match = authorization?.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}
