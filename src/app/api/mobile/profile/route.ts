import { clerkClient } from "@clerk/nextjs/server";
import { AsyncLocalStorage } from "node:async_hooks";
import { NextResponse } from "next/server";
import { getMobileRequestUserId } from "@/lib/mobile-auth";
import { getChessRatingSnapshots, refreshChessRatingSnapshots } from "@/lib/chess-ratings";
import {
  getChessComUsername,
  getLichessUsername,
  withPublishedRunnerIdentity,
  type UserMetadataRecord,
} from "@/lib/user-metadata";
import {
  sanitizeChessUsername,
  validateChessComUsername,
  validateLichessUsername,
} from "@/lib/chess-username-validation";
import { validatePublicProfileText } from "@/lib/mobile-profile-publication";

type MobileProfileRouteDependencies = {
  authenticate: typeof getMobileRequestUserId;
  getClient: () => ReturnType<typeof clerkClient>;
  validateLichess: typeof validateLichessUsername;
  validateChessCom: typeof validateChessComUsername;
  refreshRatings: typeof refreshChessRatingSnapshots;
};

const mobileProfileTestDependencies = new AsyncLocalStorage<MobileProfileRouteDependencies>();

export function withMobileProfileRouteTestDependencies<Result>(
  dependencies: MobileProfileRouteDependencies,
  callback: () => Result,
): Result {
  if (process.env.NODE_ENV !== "test") throw new Error("Profile route dependency overrides are test-only.");
  return mobileProfileTestDependencies.run(dependencies, callback);
}

function createMobileProfileRouteDependencies(): MobileProfileRouteDependencies {
  return {
    authenticate: getMobileRequestUserId,
    getClient: clerkClient,
    validateLichess: validateLichessUsername,
    validateChessCom: validateChessComUsername,
    refreshRatings: refreshChessRatingSnapshots,
  };
}

export async function PATCH(request: Request) {
  const dependencies = process.env.NODE_ENV === "test"
    ? mobileProfileTestDependencies.getStore() ?? createMobileProfileRouteDependencies()
    : createMobileProfileRouteDependencies();
  const userId = await dependencies.authenticate(request);

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
  const runnerDisplayNameInput = typeof record.runnerDisplayName === "string" ? record.runnerDisplayName.trim() : undefined;
  const runnerBio = typeof record.runnerBio === "string" ? record.runnerBio.trim().slice(0, 180) : undefined;
  const profileValidationMessage = validatePublicProfileText(runnerDisplayNameInput, runnerBio);
  if (profileValidationMessage) {
    return NextResponse.json(
      {
        apiVersion: 1,
        authenticated: true,
        ok: false,
        message: profileValidationMessage,
      },
      { status: 422 },
    );
  }
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
    dependencies.validateLichess(lichessUsername),
    dependencies.validateChessCom(chessComUsername),
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

  const client = await dependencies.getClient();
  const user = await client.users.getUser(userId);
  const metadata = user.publicMetadata ? (user.publicMetadata as UserMetadataRecord) : {};
  const profileMetadata = {
    ...metadata,
    ...(runnerBio !== undefined ? { runnerBio } : {}),
    lichessUsername: lichessValidation.username,
    chessComUsername: chessComValidation.username,
  };
  const nextMetadata = runnerDisplayNameInput === undefined
    ? profileMetadata
    : withPublishedRunnerIdentity(profileMetadata, runnerDisplayNameInput ?? "");
  const refreshed = await dependencies.refreshRatings(nextMetadata, { force: true });

  await client.users.updateUserMetadata(userId, {
    publicMetadata: refreshed.metadata,
  });
  const chessRatingSnapshots = getChessRatingSnapshots(refreshed.metadata);

  return NextResponse.json({
    apiVersion: 1,
    authenticated: true,
    ok: true,
    message: "Profile saved to your Side Quest Chess account.",
    chessAccounts: {
      lichessUsername: lichessValidation.username || null,
      chessComUsername: chessComValidation.username || null,
      previousLichessUsername: getLichessUsername(metadata) || null,
      previousChessComUsername: getChessComUsername(metadata) || null,
      hasAny: Boolean(lichessValidation.username || chessComValidation.username),
      ratingSnapshots: {
        lichess: chessRatingSnapshots.lichess ?? null,
        chessCom: chessRatingSnapshots.chessCom ?? null,
      },
    },
  });
}
