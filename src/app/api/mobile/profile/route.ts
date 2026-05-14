import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  getChessComUsername,
  getLichessUsername,
  type UserMetadataRecord,
} from "@/lib/user-metadata";

const USERNAME_MAX_LENGTH = 40;
const CHESS_USERNAME_PATTERN = /^[a-zA-Z0-9_-]{0,40}$/;

export async function PATCH(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      {
        apiVersion: 1,
        authenticated: false,
        message: "Sign in before updating mobile chess usernames.",
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
        message: "Send JSON with lichessUsername and/or chessComUsername.",
      },
      { status: 400 },
    );
  }

  const record = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
  const lichessUsername = sanitizeUsername(record.lichessUsername);
  const chessComUsername = sanitizeUsername(record.chessComUsername);

  if (lichessUsername === null || chessComUsername === null) {
    return NextResponse.json(
      {
        apiVersion: 1,
        authenticated: true,
        ok: false,
        message: "Chess usernames may only use letters, numbers, underscores, or hyphens.",
      },
      { status: 400 },
    );
  }

  if (!lichessUsername && !chessComUsername) {
    return NextResponse.json(
      {
        apiVersion: 1,
        authenticated: true,
        ok: false,
        message: "Add at least one public chess username.",
      },
      { status: 400 },
    );
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const metadata = user.publicMetadata ? (user.publicMetadata as UserMetadataRecord) : {};

  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      ...metadata,
      lichessUsername,
      chessComUsername,
    },
  });

  return NextResponse.json({
    apiVersion: 1,
    authenticated: true,
    ok: true,
    message: "Chess usernames saved for mobile and website sync.",
    chessAccounts: {
      lichessUsername: lichessUsername || null,
      chessComUsername: chessComUsername || null,
      previousLichessUsername: getLichessUsername(metadata) || null,
      previousChessComUsername: getChessComUsername(metadata) || null,
      hasAny: Boolean(lichessUsername || chessComUsername),
    },
  });
}

function sanitizeUsername(value: unknown): string | null {
  const username = typeof value === "string" ? value.trim().slice(0, USERNAME_MAX_LENGTH) : "";

  if (!CHESS_USERNAME_PATTERN.test(username)) {
    return null;
  }

  return username;
}
