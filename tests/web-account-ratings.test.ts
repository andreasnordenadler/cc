import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { loadWebAccountRatings, mergeWebAccountRatingSnapshots } from "../src/lib/web-account-ratings";
import type { UserMetadataRecord } from "../src/lib/user-metadata";

const currentSnapshot = {
  lichess: {
    provider: "lichess" as const,
    username: "samnordbot",
    updatedAt: "2026-07-30T00:45:00.000Z",
    ratings: [{ category: "blitz", label: "Blitz", rating: 1612 }],
  },
};

test("web Account refreshes stale chess ratings for the current render", async () => {
  const metadata: UserMetadataRecord = {
    lichessUsername: "samnordbot",
    chessRatingSnapshots: {
      lichess: { ...currentSnapshot.lichess, updatedAt: "2026-07-29T23:00:00.000Z" },
    },
  };
  const refreshedMetadata: UserMetadataRecord = { ...metadata, chessRatingSnapshots: currentSnapshot };
  let refreshCalls = 0;

  const result = await loadWebAccountRatings(metadata, {
    now: () => new Date("2026-07-30T01:00:00.000Z"),
    refresh: async () => {
      refreshCalls += 1;
      return { metadata: refreshedMetadata, snapshots: currentSnapshot, changed: true };
    },
  });

  assert.equal(refreshCalls, 1);
  assert.deepEqual(result.metadata, refreshedMetadata);
  assert.deepEqual(result.snapshots, currentSnapshot);
});

test("web Account reuses current matching chess ratings without a provider call", async () => {
  const metadata: UserMetadataRecord = {
    lichessUsername: "samnordbot",
    chessRatingSnapshots: currentSnapshot,
  };
  let refreshCalls = 0;

  const result = await loadWebAccountRatings(metadata, {
    now: () => new Date("2026-07-30T01:00:00.000Z"),
    refresh: async () => {
      refreshCalls += 1;
      throw new Error("current ratings must not refresh");
    },
  });

  assert.equal(refreshCalls, 0);
  assert.equal(result.metadata, metadata);
  assert.equal(result.snapshots.lichess?.username, "samnordbot");
  assert.equal(result.snapshots.lichess?.ratings[0]?.rating, 1612);
});

test("web Account returns provider failure snapshots so the existing error state is available", async () => {
  const metadata: UserMetadataRecord = { chessComUsername: "samnordbot" };
  const failedSnapshot = {
    chessCom: {
      provider: "chess.com" as const,
      username: "samnordbot",
      updatedAt: "2026-07-30T01:00:00.000Z",
      ratings: [],
      error: "Ratings unavailable right now.",
    },
  };
  const refreshedMetadata: UserMetadataRecord = { ...metadata, chessRatingSnapshots: failedSnapshot };

  const result = await loadWebAccountRatings(metadata, {
    now: () => new Date("2026-07-30T01:00:00.000Z"),
    refresh: async () => ({ metadata: refreshedMetadata, snapshots: failedSnapshot, changed: true }),
  });

  assert.deepEqual(result.snapshots, failedSnapshot);
});

test("web Account keeps a newer rating snapshot when merging provider results", () => {
  const newer = {
    ...currentSnapshot,
    lichess: { ...currentSnapshot.lichess, updatedAt: "2026-07-30T01:05:00.000Z", ratings: [{ category: "blitz", label: "Blitz", rating: 1625 }] },
  };
  const currentMetadata: UserMetadataRecord = { lichessUsername: "samnordbot", chessRatingSnapshots: newer };

  const merged = mergeWebAccountRatingSnapshots(currentMetadata, currentSnapshot);

  assert.equal(merged.changed, false);
  assert.equal(merged.snapshots.lichess?.ratings[0]?.rating, 1625);
});

test("web Account hides obsolete ratings after the connected username changes or disconnects", async () => {
  const changedMetadata: UserMetadataRecord = {
    lichessUsername: "different-user",
    chessRatingSnapshots: currentSnapshot,
  };
  const disconnectedMetadata: UserMetadataRecord = { chessRatingSnapshots: currentSnapshot };
  const empty = { metadata: changedMetadata, snapshots: {}, changed: false };

  const changed = await loadWebAccountRatings(changedMetadata, {
    now: () => new Date("2026-07-30T01:00:00.000Z"),
    refresh: async () => empty,
  });
  const disconnected = await loadWebAccountRatings(disconnectedMetadata, {
    now: () => new Date("2026-07-30T01:00:00.000Z"),
  });

  assert.equal(changed.snapshots.lichess, undefined);
  assert.equal(disconnected.snapshots.lichess, undefined);
});

test("authenticated web Account loads fresh ratings without writing stale account metadata", async () => {
  const source = await readFile(new URL("../src/app/account/page.tsx", import.meta.url), "utf8");

  assert.match(source, /import \{ loadWebAccountRatings \} from "@\/lib\/web-account-ratings"/);
  assert.match(source, /await loadWebAccountRatings\(metadata\)/);
  assert.match(source, /<RatingColumn title="Lichess"[\s\S]*error=\{ratings\.lichess\?\.error\}/);
  assert.match(source, /<RatingColumn title="Chess\.com"[\s\S]*error=\{ratings\.chessCom\?\.error\}/);
  assert.match(source, /error \? <em>\{error\}<\/em> : !ratings\.length \? <em>No public ratings loaded yet\.<\/em> : null/);
  assert.match(source, /<SignedInAccountScreen[\s\S]*metadata=\{accountRatings\.metadata\}/);
  assert.doesNotMatch(source, /updateUserMetadata/);
});
