import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const TOKEN = "sqc-normalize-demo-public-groupquests-2026-05-28";
const REMOVE_IDS = new Set([
  "demo-active-diagonal-dash",
  "demo-history-w4-easy",
  "demo-history-w4-medium",
  "demo-history-w4-hard",
]);

export async function POST(request: Request) {
  if (request.headers.get("x-seed-token") !== TOKEN) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  const client = await clerkClient();
  const removed: Array<{ userId: string; id: string; email: string | null }> = [];
  let offset = 0;

  while (true) {
    const users = await client.users.getUserList({ limit: 100, offset, orderBy: "-created_at" });
    for (const user of users.data) {
      const quests = Array.isArray(user.privateMetadata?.sqcGroupQuests) ? user.privateMetadata.sqcGroupQuests : [];
      const matchingQuest = quests.find((quest) => quest && typeof quest === "object" && REMOVE_IDS.has(String((quest as { id?: unknown }).id ?? "")));
      const email = user.emailAddresses?.[0]?.emailAddress ?? null;
      if (matchingQuest || (email && [...REMOVE_IDS].some((id) => email === `sqc.demo.${id}@example.com`))) {
        removed.push({ userId: user.id, id: String((matchingQuest as { id?: unknown } | undefined)?.id ?? email ?? "unknown"), email });
        await client.users.deleteUser(user.id);
      }
    }
    if (users.data.length < 100) break;
    offset += users.data.length;
  }

  return NextResponse.json({ ok: true, removed: removed.length, removedRows: removed });
}
