import { clerkClient } from "@clerk/nextjs/server";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { AsyncLocalStorage } from "node:async_hooks";
import { getSupportMessages } from "@/lib/analytics";

const MAX_SUPPORT_MESSAGES = 30;
const MAX_MESSAGE_LENGTH = 2400;

type SupportMessage = {
  id: string;
  at: string;
  message: string;
  source: "website" | "mobile" | "admin";
  accountEmail?: string | null;
  displayName?: string | null;
};

type SupportRouteDependencies = {
  authenticate: () => Promise<string | null>;
  getClient: () => ReturnType<typeof clerkClient>;
};

const testDependencies = new AsyncLocalStorage<SupportRouteDependencies>();

export function withSupportRouteTestDependencies<Result>(dependencies: SupportRouteDependencies, callback: () => Result): Result {
  if (process.env.NODE_ENV !== "test") throw new Error("Support route dependency overrides are test-only.");
  return testDependencies.run(dependencies, callback);
}

function createSupportRouteDependencies(): SupportRouteDependencies {
  return {
    authenticate: async () => (await auth()).userId,
    getClient: clerkClient,
  };
}

export async function POST(request: Request) {
  const dependencies = process.env.NODE_ENV === "test"
    ? testDependencies.getStore() ?? createSupportRouteDependencies()
    : createSupportRouteDependencies();
  const userId = await dependencies.authenticate();

  if (!userId) {
    return NextResponse.json({ ok: false, message: "Sign in before sending a support message." }, { status: 401 });
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Send a short support message." }, { status: 400 });
  }

  const rawMessage = payload && typeof payload === "object" ? (payload as Record<string, unknown>).message : undefined;
  const message = typeof rawMessage === "string" ? rawMessage.trim().slice(0, MAX_MESSAGE_LENGTH) : "";

  if (message.length < 3) {
    return NextResponse.json({ ok: false, message: "Write a little more so the support note is useful." }, { status: 400 });
  }

  const client = await dependencies.getClient();
  const user = await client.users.getUser(userId);
  const existing = getSupportMessages(user.privateMetadata);
  const submittedAt = new Date().toISOString();
  const supportMessage: SupportMessage = {
    id: `web-support-${submittedAt}-${Math.random().toString(36).slice(2, 8)}`,
    at: submittedAt,
    message,
    source: "website",
    accountEmail: user.primaryEmailAddress?.emailAddress ?? null,
    displayName: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username || null,
  };

  await client.users.updateUserMetadata(userId, {
    privateMetadata: {
      ...(user.privateMetadata ?? {}),
      sqcSupportMessages: [...existing, supportMessage].slice(-MAX_SUPPORT_MESSAGES),
    },
  });

  return NextResponse.json({
    ok: true,
    submittedAt,
    supportMessage,
    message: "Message sent. We’ll reply here in Support if we need more details.",
  });
}
