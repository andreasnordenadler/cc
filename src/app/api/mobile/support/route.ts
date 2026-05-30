import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getMobileRequestUserId } from "@/lib/mobile-auth";

type SupportMessage = {
  id: string;
  at: string;
  message: string;
  source: "mobile";
  accountEmail?: string | null;
  displayName?: string | null;
};

const MAX_SUPPORT_MESSAGES = 30;
const MAX_MESSAGE_LENGTH = 1200;

export async function POST(request: Request) {
  const userId = await getMobileRequestUserId(request);

  if (!userId) {
    return NextResponse.json(
      {
        apiVersion: 1,
        authenticated: false,
        ok: false,
        message: "Sign in before sending a support message.",
      },
      { status: 401 },
    );
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      {
        apiVersion: 1,
        authenticated: true,
        ok: false,
        message: "Send a short support message.",
      },
      { status: 400 },
    );
  }

  const rawMessage = payload && typeof payload === "object" ? (payload as Record<string, unknown>).message : undefined;
  const message = typeof rawMessage === "string" ? rawMessage.trim().slice(0, MAX_MESSAGE_LENGTH) : "";

  if (message.length < 3) {
    return NextResponse.json(
      {
        apiVersion: 1,
        authenticated: true,
        ok: false,
        message: "Write a little more so the support note is useful.",
      },
      { status: 400 },
    );
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const existing = getSupportMessages(user.privateMetadata);
  const submittedAt = new Date().toISOString();
  const supportMessage: SupportMessage = {
    id: `mobile-support-${submittedAt}-${Math.random().toString(36).slice(2, 8)}`,
    at: submittedAt,
    message,
    source: "mobile",
    accountEmail: user.primaryEmailAddress?.emailAddress ?? null,
    displayName: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username || null,
  };

  await client.users.updateUserMetadata(userId, {
    privateMetadata: {
      ...user.privateMetadata,
      sqcSupportMessages: [...existing, supportMessage].slice(-MAX_SUPPORT_MESSAGES),
    },
  });

  return NextResponse.json({
    apiVersion: 1,
    authenticated: true,
    ok: true,
    submittedAt,
    message: "Support message sent. It is now visible in the private analytics dashboard.",
  });
}

function getSupportMessages(metadata: unknown): SupportMessage[] {
  if (!metadata || typeof metadata !== "object") return [];
  const value = (metadata as { sqcSupportMessages?: unknown }).sqcSupportMessages;
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is SupportMessage => {
    if (!entry || typeof entry !== "object") return false;
    const candidate = entry as Partial<SupportMessage>;
    return typeof candidate.id === "string" && typeof candidate.at === "string" && typeof candidate.message === "string";
  });
}
