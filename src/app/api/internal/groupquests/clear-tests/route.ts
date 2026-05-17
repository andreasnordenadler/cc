import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const expected = process.env.SQC_SIGNUP_MONITOR_TOKEN;
  const authorization = request.headers.get("authorization") ?? "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice("Bearer ".length) : "";

  if (!expected || token !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = await clerkClient();
  let offset = 0;
  let scannedUsers = 0;
  let clearedUsers = 0;
  let clearedQuests = 0;

  while (true) {
    const page = await client.users.getUserList({ limit: 100, offset, orderBy: "-created_at" });
    if (!page.data.length) break;

    for (const user of page.data) {
      scannedUsers += 1;
      const quests = Array.isArray(user.privateMetadata?.sqcGroupQuests) ? user.privateMetadata.sqcGroupQuests : [];
      if (!quests.length) continue;

      await client.users.updateUserMetadata(user.id, {
        privateMetadata: {
          ...(user.privateMetadata ?? {}),
          sqcGroupQuests: [],
        },
      });
      clearedUsers += 1;
      clearedQuests += quests.length;
    }

    offset += page.data.length;
    if (page.data.length < 100) break;
  }

  return NextResponse.json({ scannedUsers, clearedUsers, clearedQuests });
}
