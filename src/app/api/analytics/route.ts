import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  appendAnalyticsEvent,
  compactAnalyticsStore,
  detectDeviceType,
  getAnalyticsStore,
  normalizeAnalyticsEvent,
} from "@/lib/analytics";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const event = normalizeAnalyticsEvent({
    ...(payload ?? {}),
    deviceType: payload?.deviceType ?? detectDeviceType(request.headers.get("user-agent")),
  });

  if (!event) {
    return NextResponse.json({ ok: false, error: "invalid_event" }, { status: 400 });
  }

  const { userId } = await auth();

  if (!userId) {
    console.info("sqc_analytics_anonymous", JSON.stringify(event));
    return NextResponse.json({ ok: true, stored: false });
  }

  const user = await currentUser();
  const client = await clerkClient();
  const existing = getAnalyticsStore(user?.privateMetadata);
  const nextStore = appendAnalyticsEvent(existing, event);

  await client.users.updateUserMetadata(userId, {
    privateMetadata: {
      ...(user?.privateMetadata ?? {}),
      sqcAnalytics: compactAnalyticsStore(nextStore),
    },
  });

  return NextResponse.json({ ok: true, stored: true });
}
