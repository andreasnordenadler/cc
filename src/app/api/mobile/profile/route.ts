import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getMobileRequestUserId } from "@/lib/mobile-auth";
import {
  getChessComUsername,
  getLichessUsername,
  type UserMetadataRecord,
} from "@/lib/user-metadata";
import {
  sanitizeChessUsername,
  validateChessComUsername,
  validateLichessUsername,
} from "@/lib/chess-username-validation";

export async function PATCH(request: Request) {
  const userId = await getMobileRequestUserId(request);

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
  const lichessUsername = sanitizeChessUsername(record.lichessUsername);
  const chessComUsername = sanitizeChessUsername(record.chessComUsername);

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

  const [lichessValidation, chessComValidation] = await Promise.all([
    validateLichessUsername(lichessUsername),
    validateChessComUsername(chessComUsername),
  ]);

  if (!lichessValidation.ok || !chessComValidation.ok) {
    return NextResponse.json(
      {
        apiVersion: 1,
        authenticated: true,
        ok: false,
        message: [lichessValidation.message, chessComValidation.message].filter(Boolean).join(" "),
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
      lichessUsername: lichessValidation.username,
      chessComUsername: chessComValidation.username,
    },
  });

  return NextResponse.json({
    apiVersion: 1,
    authenticated: true,
    ok: true,
    message: "Chess usernames saved for mobile and website sync.",
    chessAccounts: {
      lichessUsername: lichessValidation.username || null,
      chessComUsername: chessComValidation.username || null,
      previousLichessUsername: getLichessUsername(metadata) || null,
      previousChessComUsername: getChessComUsername(metadata) || null,
      hasAny: Boolean(lichessValidation.username || chessComValidation.username),
    },
  });
}
