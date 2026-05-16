import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(request: Request) {
  const token = process.env.SQC_SIGNUP_MONITOR_TOKEN;
  if (!token) return false;
  const auth = request.headers.get("authorization") || "";
  return auth === `Bearer ${token}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const client = await clerkClient();
  const users: Array<{ id: string; createdAt: string | null; firstName: string | null; username: string | null }> = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const response = await client.users.getUserList({ limit, offset, orderBy: "-created_at" });
    users.push(
      ...response.data.map((user) => ({
        id: user.id,
        createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : null,
        firstName: user.firstName ?? null,
        username: user.username ?? null,
      })),
    );

    if (response.data.length < limit) break;
    offset += limit;
  }

  return NextResponse.json({
    ok: true,
    totalUsers: users.length,
    users,
    checkedAt: new Date().toISOString(),
  });
}
