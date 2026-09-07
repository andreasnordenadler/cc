"use client";

import { useState } from "react";
import type { MobileWebMultiplayerLeaderboardRow } from "@/lib/mobile-web-multiplayer";
import GroupQuestRemoveParticipantAction from "./group-quest-remove-participant-action";

const INITIAL_VISIBLE_ROWS = 8;

function MultiplayerLeaderboardProgress({ progress }: { progress: string }) {
  const match = progress.match(/(\d+)\s*\/\s*(\d+)/);
  const completed = Number(match?.[1] ?? 0);
  const total = Number(match?.[2] ?? 0);
  const ratio = total > 0 ? Math.max(0, Math.min(100, Math.round((completed / total) * 100))) : 0;
  return (
    <span className="sqc-multiplayer-progress-track">
      <span
        className="sqc-multiplayer-progress-fill"
        role="progressbar"
        aria-label={`${progress} Side Quests verified`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={ratio}
        style={{ width: `${ratio}%` }}
      />
    </span>
  );
}

export default function MultiplayerLeaderboardRows({
  id,
  rows,
  showRemoveControls = false,
  emptyMessage = "No players have joined yet.",
}: {
  id: string;
  rows: MobileWebMultiplayerLeaderboardRow[];
  showRemoveControls?: boolean;
  emptyMessage?: string;
}) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_ROWS);
  const visibleRows = rows.slice(0, visibleCount);
  const remainingCount = rows.length - visibleRows.length;
  const nextBatchCount = Math.min(remainingCount, INITIAL_VISIBLE_ROWS);

  return (
    <>
      {rows.length ? <p className="sqc-multiplayer-leaderboard-count">{rows.length} {rows.length === 1 ? "player" : "players"} ranked.</p> : null}
      <div className="sqc-condition-list">
        {visibleRows.map((row) => (
          <div key={`${row.rank}-${row.name}`} className="sqc-condition-compact-row">
            <span>#{row.rank}</span>
            <div>
              <strong>{row.name}{row.viewer ? " · You" : ""}</strong>
              <p>{[row.placement, row.progress, row.provider].filter(Boolean).join(" · ")}</p>
              <MultiplayerLeaderboardProgress progress={row.progress} />
              {row.note ? <p className="sqc-multiplayer-proof-note">{row.note}</p> : null}
              {showRemoveControls && row.participantUserId ? (
                <GroupQuestRemoveParticipantAction
                  id={id}
                  participantUserId={row.participantUserId}
                  participantName={row.name}
                />
              ) : null}
            </div>
          </div>
        ))}
        {!rows.length ? <p>{emptyMessage}</p> : null}
      </div>
      {remainingCount > 0 ? (
        <button
          type="button"
          className="sqc-quiet-button"
          aria-label={`Show ${nextBatchCount} more ${nextBatchCount === 1 ? "player" : "players"}`}
          onClick={() => setVisibleCount((current) => Math.min(rows.length, current + INITIAL_VISIBLE_ROWS))}
        >
          Show {nextBatchCount} more {nextBatchCount === 1 ? "player" : "players"}
        </button>
      ) : null}
    </>
  );
}
