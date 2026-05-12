"use client";

import Image from "next/image";
import { useState } from "react";

type QuestSummary = {
  id: string;
  title: string;
  badgeImage?: string;
  badgeName?: string;
};

type Player = {
  rank: number;
  name: string;
  handle: string;
  score: number;
  completed: number;
  proof: string;
  last: string;
  tone: string;
  questFinishedAt: Record<string, string>;
  isCurrentParticipant?: boolean;
};

type StoredParticipant = {
  provider?: unknown;
  username?: unknown;
  leaderboardName?: unknown;
};

const storagePrefix = "sqc-groupquest-participant:";


const rankSealByPlacement: Record<number, { src: string; alt: string; label: string }> = {
  1: { src: "/stamps/side_quest_chess_seal_gold_transparent.png", alt: "Gold placement seal", label: "Gold" },
  2: { src: "/stamps/side_quest_chess_seal_silver_transparent.png", alt: "Silver placement seal", label: "Silver" },
  3: { src: "/stamps/side_quest_chess_seal_bronze_transparent.png", alt: "Bronze placement seal", label: "Bronze" },
};

function leaderboardAnchorFor(player: Pick<Player, "rank">) {
  return `leaderboard-rank-${player.rank}`;
}

const baseLeaderboard: Player[] = [
  {
    rank: 1,
    name: "CoffeeKnight",
    handle: "lichess: coffeeknight",
    score: 1590,
    completed: 3,
    proof: "3/3 verified",
    last: "Rookless Rampage accepted 12m ago",
    tone: "gold",
    questFinishedAt: {
      "knights-before-coffee": "May 12, 10:37 CEST",
      "no-castle-club": "May 12, 11:08 CEST",
      "rookless-rampage": "May 12, 13:38 CEST",
    },
  },
  {
    rank: 2,
    name: "QueenlessHero",
    handle: "chess.com: queenlesshero",
    score: 340,
    completed: 2,
    proof: "2/3 verified",
    last: "No Castle Club accepted",
    tone: "blue",
    questFinishedAt: {
      "knights-before-coffee": "May 12, 10:52 CEST",
      "no-castle-club": "May 12, 12:21 CEST",
    },
  },
  {
    rank: 3,
    name: "You",
    handle: "participant",
    score: 40,
    completed: 1,
    proof: "1/3 verified",
    last: "Knights Before Coffee accepted",
    tone: "green",
    isCurrentParticipant: true,
    questFinishedAt: {
      "knights-before-coffee": "May 12, 12:44 CEST",
    },
  },
  {
    rank: 4,
    name: "BlunderBaron",
    handle: "lichess: blunderbaron",
    score: 0,
    completed: 0,
    proof: "checking latest games",
    last: "Joined · no valid proof yet",
    tone: "muted",
    questFinishedAt: {},
  },
];

function formatProvider(value: unknown) {
  if (value === "chesscom") return "chess.com";
  if (value === "lichess") return "lichess";
  return "public chess";
}



function shortenScrollText(value: string, max = 38) {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

function completedQuestsFor(player: Player, quests: QuestSummary[]) {
  return quests.filter((quest) => player.questFinishedAt[quest.id]);
}

function finalCompletionTimeFor(player: Player, quests: QuestSummary[]) {
  const completed = completedQuestsFor(player, quests);
  const finalQuest = completed[completed.length - 1];
  return finalQuest ? player.questFinishedAt[finalQuest.id] : "Not completed yet";
}

function readCurrentParticipant(id: string) {
  if (typeof window === "undefined") return null;

  try {
    const stored = window.localStorage.getItem(`${storagePrefix}${id}`);
    if (!stored) return null;
    const participant = JSON.parse(stored) as StoredParticipant;
    const username = typeof participant.username === "string" && participant.username.trim() ? participant.username.trim() : "participant";
    const leaderboardName = typeof participant.leaderboardName === "string" && participant.leaderboardName.trim() ? participant.leaderboardName.trim() : username;

    return {
      name: leaderboardName,
      handle: `${formatProvider(participant.provider)}: ${username}`,
    };
  } catch {
    return null;
  }
}

export default function GroupQuestLeaderboard({ id, quests }: { id: string; quests: QuestSummary[] }) {
  const [currentParticipant] = useState(() => readCurrentParticipant(id));
  const players = baseLeaderboard.map((player) => {
    if (!player.isCurrentParticipant || !currentParticipant) return player;
    return { ...player, name: currentParticipant.name, handle: currentParticipant.handle };
  });

  const podiumPlayer = players.find((player) => player.isCurrentParticipant && rankSealByPlacement[player.rank] && player.completed >= quests.length);
  const podiumSeal = podiumPlayer ? rankSealByPlacement[podiumPlayer.rank] : null;
  const [selectedScroll, setSelectedScroll] = useState<Player | null>(null);
  const selectedSeal = selectedScroll ? rankSealByPlacement[selectedScroll.rank] : null;
  const selectedCompletedQuests = selectedScroll ? completedQuestsFor(selectedScroll, quests) : [];
  const selectedFinishedAt = selectedScroll ? finalCompletionTimeFor(selectedScroll, quests) : "";
  const bestedPlayers = selectedScroll ? players.filter((player) => player.rank > selectedScroll.rank).map((player) => player.name) : [];

  return (
    <section className="mission-card groupquest-leaderboard-card" id="leaderboard" aria-label="Competition leaderboard">
      {podiumPlayer && podiumSeal ? (
        <div className="groupquest-podium-scroll" role="status" aria-live="polite">
          <Image src={podiumSeal.src} alt={podiumSeal.alt} width={72} height={72} />
          <div>
            <span className="eyebrow">{podiumSeal.label} claimed</span>
            <h3>{podiumSeal.label} scroll unlocked for {podiumPlayer.name}.</h3>
            <p>The verifier has stamped every Side Quest complete. The leaderboard goblin has updated the official scroll.</p>
          </div>
          <a className="button primary" href={`#${leaderboardAnchorFor(podiumPlayer)}`}>View on leaderboard</a>
        </div>
      ) : null}
      <div className="section-head groupquest-leaderboard-head">
        <div>
          <span className="eyebrow">Competition leaderboard</span>
          <h2>How you’re doing vs everyone else.</h2>
        </div>
        <button className="button secondary groupquest-refresh-button" type="button">Refresh checks</button>
      </div>
      <div className="groupquest-leaderboard-list">
        {players.map((player) => (
          <details id={leaderboardAnchorFor(player)} className={`groupquest-leaderboard-row ${player.tone}`} key={`${player.rank}-${player.name}`}>
            <summary>
              <div className="groupquest-rank-stack">
                <div className="groupquest-rank" aria-label={`Rank ${player.rank}`}>
                  {rankSealByPlacement[player.rank] && player.completed >= quests.length ? (
                    <Image src={rankSealByPlacement[player.rank].src} alt={rankSealByPlacement[player.rank].alt} width={42} height={42} />
                  ) : (
                    `#${player.rank}`
                  )}
                </div>
                {rankSealByPlacement[player.rank] && player.completed >= quests.length ? (
                  <button
                    className="groupquest-scroll-mini"
                    type="button"
                    aria-label={`View ${rankSealByPlacement[player.rank].label} scroll for ${player.name}`}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setSelectedScroll(player);
                    }}
                  >
                    Scroll
                  </button>
                ) : null}
              </div>
              <div>
                <strong>{player.name}</strong>
                <small>{player.handle}</small>
              </div>
              <div className="groupquest-progress-bar" aria-label={`${player.completed} of ${quests.length} Side Quests verified`}>
                <span style={{ width: `${Math.round((player.completed / quests.length) * 100)}%` }} />
              </div>
              <div>
                <strong>{player.score.toLocaleString()} pts</strong>
                <small>{player.proof} · {player.last}</small>
              </div>
            </summary>
            <div className="groupquest-finished-detail" aria-label={`${player.name} quest finish times`}>
              {quests.map((quest) => {
                const finishedAt = player.questFinishedAt[quest.id];
                return (
                  <div key={quest.id}>
                    <span>{quest.title}</span>
                    <strong>{finishedAt ?? "Not finished yet"}</strong>
                  </div>
                );
              })}
            </div>
          </details>
        ))}
      </div>
      {selectedScroll && selectedSeal ? (
        <div className="groupquest-scroll-modal" role="dialog" aria-modal="true" aria-label={`${selectedSeal.label} winner scroll`}>
          <div className="groupquest-scroll-backdrop" onClick={() => setSelectedScroll(null)} />
          <div className="groupquest-scroll-sheet">
            <button className="groupquest-scroll-close" type="button" onClick={() => setSelectedScroll(null)} aria-label="Close scroll">×</button>
            <div className="groupquest-scroll-artifact-wrap">
              <svg className="groupquest-scroll-artifact" viewBox="0 0 1024 1536" role="img" aria-labelledby="podium-scroll-title podium-scroll-desc">
                <title id="podium-scroll-title">{selectedSeal.label} scroll for {selectedScroll.name}</title>
                <desc id="podium-scroll-desc">A Side Quest Chess victory scroll written on generated parchment template, with placement seal, completed quest coats of arms, and the final completion time.</desc>
                <defs>
                  <filter id="scrollInkShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#7a481d" floodOpacity="0.2" />
                  </filter>
                  <filter id="scrollCoatShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#4b260d" floodOpacity="0.32" />
                  </filter>
                </defs>
                <image href="/scrolls/sqc-victory-scroll-template.png" x="0" y="0" width="1024" height="1536" preserveAspectRatio="xMidYMid meet" />
                <image href={selectedSeal.src} x="462" y="248" width="100" height="100" preserveAspectRatio="xMidYMid meet" filter="url(#scrollCoatShadow)" />
                <text x="512" y="398" textAnchor="middle" className="scroll-kicker">OFFICIAL SIDE QUEST CHESS SCROLL</text>
                <text x="512" y="454" textAnchor="middle" className="scroll-title">{selectedSeal.label.toUpperCase()} AWARDED</text>
                <text x="512" y="510" textAnchor="middle" className="scroll-name">{shortenScrollText(selectedScroll.name, 28)}</text>
                <text x="512" y="574" textAnchor="middle" className="scroll-body">completed every Side Quest in No Castle Night</text>
                <text x="512" y="608" textAnchor="middle" className="scroll-body">and claimed {selectedSeal.label.toLowerCase()} by public-game proof.</text>
                <text x="512" y="668" textAnchor="middle" className="scroll-meta">Completed: {selectedFinishedAt}</text>
                <text x="512" y="704" textAnchor="middle" className="scroll-meta">Placement: #{selectedScroll.rank} · Proof: {selectedScroll.proof}</text>
                <path d="M294 744 C380 760 644 760 730 744" fill="none" stroke="#5f3515" strokeWidth="3" opacity="0.34" />
                <text x="512" y="792" textAnchor="middle" className="scroll-section-title">COATS OF ARMS STAMPED COMPLETE</text>
                {selectedCompletedQuests.slice(0, 3).map((quest, index) => {
                  const x = 268 + index * 244;
                  return (
                    <g key={quest.id} filter="url(#scrollCoatShadow)">
                      {quest.badgeImage ? <image href={quest.badgeImage} x={x - 42} y="832" width="84" height="84" preserveAspectRatio="xMidYMid meet" /> : null}
                      <text x={x} y="958" textAnchor="middle" className="scroll-quest-title">{shortenScrollText(quest.title, 19)}</text>
                      <text x={x} y="986" textAnchor="middle" className="scroll-quest-time">{selectedScroll.questFinishedAt[quest.id]}</text>
                    </g>
                  );
                })}
                <text x="512" y="1068" textAnchor="middle" className="scroll-section-title">PLAYERS BESTED ON THE ROAD</text>
                <text x="512" y="1112" textAnchor="middle" className="scroll-body">Bested on the road: {shortenScrollText(bestedPlayers.join(" · "), 50)}</text>
                <text x="512" y="1186" textAnchor="middle" className="scroll-footer">Stamped by the verifier. Witnessed by the leaderboard goblin.</text>
              </svg>
              <a className="button primary" href={`#${leaderboardAnchorFor(selectedScroll)}`} onClick={() => setSelectedScroll(null)}>
                View on leaderboard
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
