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

function scrollBestedLine(players: string[]) {
  if (!players.length) return "The hall was empty. The verifier applauded politely.";
  return `Bested on the road: ${players.join(" · ")}`;
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
              <svg className="groupquest-scroll-artifact" viewBox="0 0 900 1180" role="img" aria-labelledby="podium-scroll-title podium-scroll-desc">
                <title id="podium-scroll-title">{selectedSeal.label} scroll for {selectedScroll.name}</title>
                <desc id="podium-scroll-desc">A realistic aged parchment Side Quest Chess victory scroll with completed quest coats of arms and the final completion time.</desc>
                <defs>
                  <linearGradient id="parchmentBody" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0%" stopColor="#f1d8a0" />
                    <stop offset="42%" stopColor="#d7aa62" />
                    <stop offset="100%" stopColor="#b67a38" />
                  </linearGradient>
                  <linearGradient id="parchmentRoll" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#8a5926" />
                    <stop offset="18%" stopColor="#e8c27a" />
                    <stop offset="55%" stopColor="#c28a43" />
                    <stop offset="100%" stopColor="#6d401a" />
                  </linearGradient>
                  <radialGradient id="parchmentLight" cx="45%" cy="35%" r="74%">
                    <stop offset="0%" stopColor="#ffe8ad" stopOpacity="0.65" />
                    <stop offset="72%" stopColor="#c58a42" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#4b260d" stopOpacity="0.14" />
                  </radialGradient>
                  <filter id="paperShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="24" stdDeviation="20" floodColor="#000" floodOpacity="0.44" />
                  </filter>
                  <filter id="paperTexture">
                    <feTurbulence type="fractalNoise" baseFrequency="0.018 0.06" numOctaves="4" seed="8" result="noise" />
                    <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0.47 0 0 0 0 0.29 0 0 0 0 0.12 0 0 0 .16 0" result="tint" />
                    <feBlend in="SourceGraphic" in2="tint" mode="multiply" />
                  </filter>
                </defs>
                <path className="scroll-paper-shape" d="M154 94 C213 74 286 93 343 72 C389 55 434 78 485 67 C561 51 630 80 708 66 C759 57 800 83 779 132 C756 186 783 249 766 315 C748 384 779 446 762 518 C744 594 774 658 759 735 C744 813 770 878 747 944 C728 998 744 1044 699 1074 C638 1114 557 1088 493 1110 C427 1131 369 1095 298 1110 C232 1124 174 1094 151 1043 C127 989 154 930 134 859 C111 779 139 713 124 633 C109 552 136 489 121 414 C105 337 136 272 119 204 C104 145 111 112 154 94Z" fill="url(#parchmentBody)" filter="url(#paperShadow)" />
                <path d="M154 94 C213 74 286 93 343 72 C389 55 434 78 485 67 C561 51 630 80 708 66 C759 57 800 83 779 132 C756 186 783 249 766 315 C748 384 779 446 762 518 C744 594 774 658 759 735 C744 813 770 878 747 944 C728 998 744 1044 699 1074 C638 1114 557 1088 493 1110 C427 1131 369 1095 298 1110 C232 1124 174 1094 151 1043 C127 989 154 930 134 859 C111 779 139 713 124 633 C109 552 136 489 121 414 C105 337 136 272 119 204 C104 145 111 112 154 94Z" fill="url(#parchmentLight)" filter="url(#paperTexture)" />
                <path d="M152 98 C246 139 648 34 781 92 C721 132 239 174 124 127 C111 112 123 101 152 98Z" fill="url(#parchmentRoll)" opacity="0.95" />
                <path d="M145 1047 C266 1087 617 1019 745 1062 C658 1115 274 1140 151 1077 C135 1066 134 1054 145 1047Z" fill="url(#parchmentRoll)" opacity="0.95" />
                <path d="M134 147 C251 174 642 109 760 126" fill="none" stroke="#6b3d18" strokeWidth="5" opacity="0.32" />
                <path d="M150 1026 C277 1055 615 994 744 1046" fill="none" stroke="#6b3d18" strokeWidth="5" opacity="0.28" />
                <circle cx="222" cy="270" r="48" fill="#7b4319" opacity="0.1" />
                <circle cx="668" cy="371" r="74" fill="#7b4319" opacity="0.08" />
                <circle cx="266" cy="786" r="66" fill="#7b4319" opacity="0.08" />
                <circle cx="619" cy="927" r="44" fill="#7b4319" opacity="0.08" />
                <image href={selectedSeal.src} x="390" y="134" width="120" height="120" preserveAspectRatio="xMidYMid meet" />
                <text x="450" y="298" textAnchor="middle" className="scroll-kicker">OFFICIAL SIDE QUEST CHESS SCROLL</text>
                <text x="450" y="358" textAnchor="middle" className="scroll-title">{selectedSeal.label.toUpperCase()} AWARDED</text>
                <text x="450" y="414" textAnchor="middle" className="scroll-name">{shortenScrollText(selectedScroll.name, 30)}</text>
                <text x="450" y="464" textAnchor="middle" className="scroll-body">completed every Side Quest in No Castle Night</text>
                <text x="450" y="500" textAnchor="middle" className="scroll-body">and claimed {selectedSeal.label.toLowerCase()} by public-game proof.</text>
                <text x="450" y="558" textAnchor="middle" className="scroll-meta">Completed: {selectedFinishedAt}</text>
                <text x="450" y="594" textAnchor="middle" className="scroll-meta">Placement: #{selectedScroll.rank} · Proof: {selectedScroll.proof}</text>
                <path d="M250 632 C350 648 550 648 650 632" fill="none" stroke="#5f3515" strokeWidth="3" opacity="0.38" />
                <text x="450" y="670" textAnchor="middle" className="scroll-section-title">COATS OF ARMS STAMPED COMPLETE</text>
                {selectedCompletedQuests.slice(0, 3).map((quest, index) => {
                  const x = 214 + index * 236;
                  return (
                    <g key={quest.id}>
                      <path d={`M${x - 74} 706 C${x - 50} 690 ${x + 50} 690 ${x + 74} 706 L${x + 58} 878 C${x + 22} 898 ${x - 22} 898 ${x - 58} 878Z`} fill="rgba(255,245,214,.25)" stroke="rgba(55,31,10,.28)" strokeWidth="3" />
                      {quest.badgeImage ? <image href={quest.badgeImage} x={x - 42} y="720" width="84" height="84" preserveAspectRatio="xMidYMid meet" /> : null}
                      <text x={x} y="836" textAnchor="middle" className="scroll-quest-title">{shortenScrollText(quest.title, 20)}</text>
                      <text x={x} y="866" textAnchor="middle" className="scroll-quest-time">{selectedScroll.questFinishedAt[quest.id]}</text>
                    </g>
                  );
                })}
                <text x="450" y="956" textAnchor="middle" className="scroll-section-title">PLAYERS BESTED ON THE ROAD</text>
                <text x="450" y="1002" textAnchor="middle" className="scroll-body">{shortenScrollText(scrollBestedLine(bestedPlayers), 72)}</text>
                <text x="450" y="1060" textAnchor="middle" className="scroll-footer">Stamped by the verifier. Witnessed by the leaderboard goblin.</text>
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
