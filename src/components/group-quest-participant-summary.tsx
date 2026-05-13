"use client";

import { useState } from "react";

const storagePrefix = "sqc-groupquest-participant:";

type StoredParticipant = {
  provider?: unknown;
  username?: unknown;
  leaderboardName?: unknown;
  wantsEmailUpdates?: unknown;
  email?: unknown;
  location?: unknown;
};

type ParticipantSummary = {
  provider: string;
  username: string;
  leaderboardName: string;
  emailUpdates: string;
  location: string;
};

function formatProvider(value: unknown) {
  if (value === "chesscom") return "Chess.com";
  if (value === "lichess") return "Lichess";
  return "Public chess";
}

function readParticipant(id: string, fallback?: ParticipantSummary): ParticipantSummary {
  if (fallback) return fallback;

  if (typeof window === "undefined") {
    return {
      provider: "Public chess",
      username: "Connected after joining",
      leaderboardName: "You",
      emailUpdates: "Off",
      location: "Optional",
    };
  }

  try {
    const stored = window.localStorage.getItem(`${storagePrefix}${id}`);
    if (!stored) throw new Error("No participant setup stored");
    const participant = JSON.parse(stored) as StoredParticipant;
    const username = typeof participant.username === "string" && participant.username.trim() ? participant.username.trim() : "Connected after joining";
    const leaderboardName = typeof participant.leaderboardName === "string" && participant.leaderboardName.trim() ? participant.leaderboardName.trim() : "You";
    const wantsEmail = participant.wantsEmailUpdates === true;
    const email = typeof participant.email === "string" && participant.email.trim() ? participant.email.trim() : "";
    const location = typeof participant.location === "string" && participant.location.trim() ? participant.location.trim() : "Optional";

    return {
      provider: formatProvider(participant.provider),
      username,
      leaderboardName,
      emailUpdates: wantsEmail ? email || "On" : "Off",
      location,
    };
  } catch {
    return {
      provider: "Public chess",
      username: "Connected after joining",
      leaderboardName: "You",
      emailUpdates: "Off",
      location: "Optional",
    };
  }
}

export default function GroupQuestParticipantSummary({ id, initialParticipant }: { id: string; initialParticipant?: ParticipantSummary }) {
  const [participant] = useState(() => readParticipant(id, initialParticipant));

  return (
    <section className="mission-card groupquest-participant-summary" aria-label="Your participant setup">
      <div className="groupquest-participant-summary-head">
        <span className="eyebrow">You’re in</span>
        <strong>{participant.leaderboardName}</strong>
      </div>
      <dl>
        <div>
          <dt>Provider</dt>
          <dd>{participant.provider}</dd>
        </div>
        <div>
          <dt>Username</dt>
          <dd>{participant.username}</dd>
        </div>
        <div>
          <dt>Leaderboard</dt>
          <dd>{participant.leaderboardName}</dd>
        </div>
        <div>
          <dt>Email</dt>
          <dd>{participant.emailUpdates}</dd>
        </div>
        <div>
          <dt>Location</dt>
          <dd>{participant.location}</dd>
        </div>
      </dl>
    </section>
  );
}
