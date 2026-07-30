import {
  getChessRatingSnapshots,
  refreshChessRatingSnapshots,
  shouldRefreshChessRatingSnapshots,
  type ChessRatingSnapshot,
  type ChessRatingSnapshots,
} from "@/lib/chess-ratings";
import { getChessComUsername, getLichessUsername, type UserMetadataRecord } from "@/lib/user-metadata";

type RatingRefreshResult = {
  metadata: UserMetadataRecord;
  snapshots: ChessRatingSnapshots;
  changed: boolean;
};

type WebAccountRatingsDependencies = {
  now?: () => Date;
  refresh?: (metadata: UserMetadataRecord, options: { now: Date }) => Promise<RatingRefreshResult>;
};

export async function loadWebAccountRatings(
  metadata: UserMetadataRecord,
  dependencies: WebAccountRatingsDependencies = {},
): Promise<{ metadata: UserMetadataRecord; snapshots: ChessRatingSnapshots }> {
  const now = dependencies.now?.() ?? new Date();
  if (!shouldRefreshChessRatingSnapshots(metadata, now.getTime())) {
    const sanitized = mergeWebAccountRatingSnapshots(metadata, getChessRatingSnapshots(metadata));
    return sanitized.changed
      ? { metadata: { ...metadata, chessRatingSnapshots: sanitized.snapshots }, snapshots: sanitized.snapshots }
      : { metadata, snapshots: sanitized.snapshots };
  }

  const refreshed = await (dependencies.refresh ?? refreshChessRatingSnapshots)(metadata, { now });
  const sanitized = mergeWebAccountRatingSnapshots(refreshed.metadata, refreshed.snapshots);
  return {
    metadata: { ...refreshed.metadata, chessRatingSnapshots: sanitized.snapshots },
    snapshots: sanitized.snapshots,
  };
}

export function mergeWebAccountRatingSnapshots(
  currentMetadata: UserMetadataRecord,
  incoming: ChessRatingSnapshots,
): { snapshots: ChessRatingSnapshots; changed: boolean } {
  const current = getChessRatingSnapshots(currentMetadata);
  const snapshots: ChessRatingSnapshots = {};
  const lichess = chooseSnapshot(current.lichess, incoming.lichess, getLichessUsername(currentMetadata));
  const chessCom = chooseSnapshot(current.chessCom, incoming.chessCom, getChessComUsername(currentMetadata));
  if (lichess) snapshots.lichess = lichess;
  if (chessCom) snapshots.chessCom = chessCom;
  return {
    snapshots,
    changed: JSON.stringify(current) !== JSON.stringify(snapshots),
  };
}

function chooseSnapshot(
  current: ChessRatingSnapshot | undefined,
  incoming: ChessRatingSnapshot | undefined,
  connectedUsername: string,
) {
  if (!connectedUsername) return undefined;
  const matches = (snapshot: ChessRatingSnapshot | undefined) => snapshot?.username.toLowerCase() === connectedUsername.toLowerCase();
  const matchingCurrent = matches(current) ? current : undefined;
  const matchingIncoming = matches(incoming) ? incoming : undefined;
  if (!matchingIncoming) return matchingCurrent;
  if (!matchingCurrent) return matchingIncoming;
  const currentTime = Date.parse(matchingCurrent.updatedAt);
  const incomingTime = Date.parse(matchingIncoming.updatedAt);
  return Number.isFinite(currentTime) && (!Number.isFinite(incomingTime) || currentTime > incomingTime)
    ? matchingCurrent
    : matchingIncoming;
}
