"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import ChallengeBadge from "@/components/challenge-badge";
import type { Challenge } from "@/lib/challenges";

type SortMode = "recommended" | "easy-first" | "hard-first" | "points-high" | "points-low";
type DifficultyFilter = "All" | Challenge["difficulty"];
type StatusFilter = "All" | "Active" | "Completed" | "Open";

type ChallengeDeckBrowserProps = {
  challenges: Challenge[];
  activeChallengeId?: string;
  completedChallengeIds: string[];
};

const difficultyRank: Record<Challenge["difficulty"], number> = {
  Easy: 1,
  Medium: 2,
  Hard: 3,
  Brutal: 4,
  Absurd: 5,
};

const difficultyFilters: DifficultyFilter[] = ["All", "Easy", "Medium", "Hard", "Brutal", "Absurd"];

const COMING_SOON_CHALLENGES: Challenge[] = [
  {
    id: "pawn-only-picnic",
    title: "Pawn-Only Picnic",
    objective: "Win after making your first eight moves with pawns only.",
    instruction: "Coming soon: launch a very tiny army before any grown-up piece gets involved, then win anyway.",
    openingHint: "The pieces are observing from HR.",
    reward: 80,
    category: "Beginner Quest",
    difficulty: "Easy",
    completionRate: "Coming soon",
    flavor: "Development is delayed because the pawns booked the venue.",
    badge: "Picnic Formation",
    badgeIdentity: {
      name: "Pawn Picnic",
      motif: "♟",
      rarity: "Coming soon token",
      unlockCopy: "Move pawns only at the start, then somehow make it look intentional.",
      heraldry: {
        shield: "Grass-green field with eight tiny pawns marching under a lunch flag.",
        charge: "Eight-pawn blanket",
        crest: "Tiny picnic banner",
        motto: "Snacks Before Knights",
        meaning: "The eight pawns mark the pawn-only opening parade; the banner keeps the nonsense cheerful.",
        weirdness: "A picnic where every sandwich is a tempo loss.",
      },
      colors: { primary: "#60f0af", secondary: "#f5c86a", glow: "rgba(96,240,175,.36)" },
      image: "/badges/v6/coming-soon/pawn-only-picnic-badge.png",
    },
    proofCallout: "First eight player moves were pawn moves · won the game",
    rules: [],
    requirement: { side: "either", result: "win" },
  },
  {
    id: "back-rank-goblin",
    title: "Back Rank Goblin",
    objective: "Deliver a back-rank mate with maximum goblin energy.",
    instruction: "Coming soon: trap the king behind its own furniture and finish the game with a back-rank mate.",
    openingHint: "The escape square was a myth.",
    reward: 120,
    category: "Style Kill",
    difficulty: "Easy",
    completionRate: "Coming soon",
    flavor: "Classic chess punishment, but wearing a tiny goblin hat.",
    badge: "No Exit Permit",
    badgeIdentity: {
      name: "Rank Goblin",
      motif: "♜",
      rarity: "Coming soon token",
      unlockCopy: "Win by making the back rank feel like a locked broom closet.",
      heraldry: {
        shield: "Midnight blue field with a rook sealing three tiny escape doors.",
        charge: "Locked back rank",
        crest: "Goblin key",
        motto: "No Door, No Mercy",
        meaning: "The locked rank records a king trapped by its own pieces; the key belongs to the attacker.",
        weirdness: "A home-security badge for deeply unsafe kings.",
      },
      colors: { primary: "#76a9ff", secondary: "#60f0af", glow: "rgba(118,169,255,.38)" },
      image: "/badges/v6/coming-soon/back-rank-goblin-badge.png",
    },
    proofCallout: "Back-rank mate · won the game",
    rules: [],
    requirement: { side: "either", result: "win" },
  },
  {
    id: "late-castle-lifestyle",
    title: "Late Castle Lifestyle",
    objective: "Castle after move 15, then win like the delay was strategic.",
    instruction: "Coming soon: wait far too long to castle, finally do it, then claim the king was fashionably late.",
    openingHint: "Safety arrived after the afterparty started.",
    reward: 180,
    category: "Restriction",
    difficulty: "Medium",
    completionRate: "Coming soon",
    flavor: "Not refusing safety. Just ghosting it for fifteen moves.",
    badge: "Fashionably Fortified",
    badgeIdentity: {
      name: "Late Castle",
      motif: "♔",
      rarity: "Coming soon badge",
      unlockCopy: "Delay castling until it feels socially awkward, then win.",
      heraldry: {
        shield: "Purple dusk field with a crown arriving at a tower under a tiny moon.",
        charge: "Delayed castle gate",
        crest: "Pocket clock",
        motto: "Eventually Secure",
        meaning: "The clock marks the delayed castle; the tower proves the king finally accepted help.",
        weirdness: "Royal time management with tactical consequences.",
      },
      colors: { primary: "#a78bfa", secondary: "#f5c86a", glow: "rgba(167,139,250,.4)" },
      image: "/badges/v6/coming-soon/late-castle-lifestyle-badge.png",
    },
    proofCallout: "Castled after move 15 · won the game",
    rules: [],
    requirement: { side: "either", result: "win" },
  },
  {
    id: "rook-lift-internship",
    title: "Rook Lift Internship",
    objective: "Lift a rook before move 18 and make the internship pay off.",
    instruction: "Coming soon: send a rook up the board early, pretend it has a badge, and win.",
    openingHint: "The rook asked for field experience.",
    reward: 220,
    category: "Style Quest",
    difficulty: "Medium",
    completionRate: "Coming soon",
    flavor: "A career-development program for castles with ambition.",
    badge: "Junior Tower Energy",
    badgeIdentity: {
      name: "Rook Intern",
      motif: "♜",
      rarity: "Coming soon badge",
      unlockCopy: "Lift a rook early and convert the suspicious career move into a win.",
      heraldry: {
        shield: "Orange-gold field with a rook climbing a ladder over three files.",
        charge: "Rook on ladder",
        crest: "Intern badge",
        motto: "Promoted Too Soon",
        meaning: "The climbing rook marks the early lift; the badge means it was definitely not qualified.",
        weirdness: "Corporate mobility for a medieval tower.",
      },
      colors: { primary: "#e87922", secondary: "#f5c86a", glow: "rgba(232,121,34,.38)" },
      image: "/badges/v6/coming-soon/rook-lift-internship-badge.png",
    },
    proofCallout: "Early rook lift · won the game",
    rules: [],
    requirement: { side: "either", result: "win" },
  },
  {
    id: "double-check-drama",
    title: "Double Check Drama",
    objective: "Land a double check and win the game.",
    instruction: "Coming soon: make two pieces yell at the king at once, then finish the argument.",
    openingHint: "One check was apparently too calm.",
    reward: 360,
    category: "Chaos",
    difficulty: "Hard",
    completionRate: "Coming soon",
    flavor: "The chess equivalent of everyone talking in a meeting.",
    badge: "Two Alarms",
    badgeIdentity: {
      name: "Drama Fork",
      motif: "‼",
      rarity: "Coming soon relic",
      unlockCopy: "Trigger a double check and make the board regret inviting you.",
      heraldry: {
        shield: "Red-blue split field with twin lightning bolts crossing a crown.",
        charge: "Twin check bolts",
        crest: "Alarm bell",
        motto: "Both Of Us, Actually",
        meaning: "The twin bolts represent two simultaneous attackers; the bell marks panic at royal scale.",
        weirdness: "A procedural violation committed by geometry.",
      },
      colors: { primary: "#ff7a66", secondary: "#76a9ff", glow: "rgba(255,122,102,.42)" },
      image: "/badges/v6/coming-soon/double-check-drama-badge.png",
    },
    proofCallout: "Double check landed · won the game",
    rules: [],
    requirement: { side: "either", result: "win" },
  },
  {
    id: "en-passant-tax",
    title: "En Passant Tax",
    objective: "Play en passant and win before anyone can ask if that is legal.",
    instruction: "Coming soon: collect the weirdest pawn tax in chess, then win.",
    openingHint: "Yes, it counts. No, we are not explaining it again.",
    reward: 420,
    category: "Rules Goblin",
    difficulty: "Hard",
    completionRate: "Coming soon",
    flavor: "A move that sounds made up because chess is old and petty.",
    badge: "Ghost Pawn Collector",
    badgeIdentity: {
      name: "Passant Bailiff",
      motif: "♙",
      rarity: "Coming soon relic",
      unlockCopy: "Capture the pawn that thought it could just walk past consequences.",
      heraldry: {
        shield: "Mint-black field with a ghost pawn crossing a diagonal receipt stamp.",
        charge: "Ghost pawn receipt",
        crest: "Tax seal",
        motto: "You Still Owe Me",
        meaning: "The ghost pawn records en passant; the seal turns the rule into official nonsense.",
        weirdness: "A tax office staffed entirely by pawns.",
      },
      colors: { primary: "#2dd4bf", secondary: "#ff5f9f", glow: "rgba(45,212,191,.42)" },
      image: "/badges/v6/coming-soon/en-passant-tax-badge.png",
    },
    proofCallout: "En passant played · won the game",
    rules: [],
    requirement: { side: "either", result: "win" },
  },
  {
    id: "sacrifice-tax-bracket",
    title: "Sacrifice Tax Bracket",
    objective: "Sacrifice two pieces and still cash out the win.",
    instruction: "Coming soon: donate material like you are avoiding taxes, then somehow collect the full point.",
    openingHint: "Material balance is a social construct.",
    reward: 650,
    category: "Blunder Quest",
    difficulty: "Brutal",
    completionRate: "Coming soon",
    flavor: "At some point it stops being courage and starts being accounting fraud.",
    badge: "Material Accountant",
    badgeIdentity: {
      name: "Sacrifice Ledger",
      motif: "§",
      rarity: "Coming soon brutal relic",
      unlockCopy: "Give up two pieces with insufficient adult supervision and win anyway.",
      heraldry: {
        shield: "Crimson-gold field with two fallen pieces under a glowing ledger mark.",
        charge: "Sacrifice ledger",
        crest: "Broken abacus",
        motto: "Debits Become Glory",
        meaning: "The fallen pieces record the sacrifices; the ledger insists the math worked out.",
        weirdness: "A finance department for tactical violence.",
      },
      colors: { primary: "#ff5f9f", secondary: "#f5c86a", glow: "rgba(255,95,159,.45)" },
      image: "/badges/v6/coming-soon/sacrifice-tax-bracket-badge.png",
    },
    proofCallout: "Two sacrifices · won the game",
    rules: [],
    requirement: { side: "either", result: "win" },
  },
  {
    id: "queen-side-quest",
    title: "Queen Side Quest",
    objective: "Win with the queen never leaving your first rank.",
    instruction: "Coming soon: keep the queen at home like a dramatic advisor and win without her field trip.",
    openingHint: "The queen is managing from headquarters.",
    reward: 720,
    category: "Restriction",
    difficulty: "Brutal",
    completionRate: "Coming soon",
    flavor: "Maximum power, minimum commute.",
    badge: "Remote Royalty",
    badgeIdentity: {
      name: "Desk Queen",
      motif: "♛",
      rarity: "Coming soon brutal relic",
      unlockCopy: "Win while the queen refuses to leave the executive floor.",
      heraldry: {
        shield: "Deep pink field with a queen behind a gold desk and unopened battle map.",
        charge: "Stationary queen",
        crest: "Office crown",
        motto: "Lead From Home",
        meaning: "The desk queen marks royal restraint; the unopened map shows all ambition stayed local.",
        weirdness: "Remote work policy for the most powerful piece.",
      },
      colors: { primary: "#ff5f9f", secondary: "#a78bfa", glow: "rgba(255,95,159,.44)" },
      image: "/badges/v6/coming-soon/queen-side-quest-badge.png",
    },
    proofCallout: "Queen stayed on first rank · won the game",
    rules: [],
    requirement: { side: "either", result: "win" },
  },
  {
    id: "underpromotion-union",
    title: "Underpromotion Union",
    objective: "Underpromote a pawn and win the game.",
    instruction: "Coming soon: reach promotion and deliberately choose not-queen, because the union had demands.",
    openingHint: "The pawn negotiated benefits.",
    reward: 1000,
    category: "Absurdity",
    difficulty: "Absurd",
    completionRate: "Coming soon",
    flavor: "Rejecting queenhood is either genius, necessity, or performance art.",
    badge: "Not A Queen, Actually",
    badgeIdentity: {
      name: "Union Pawn",
      motif: "♘",
      rarity: "Coming soon absurd artifact",
      unlockCopy: "Promote into something weird and still win the paperwork battle.",
      heraldry: {
        shield: "Black-gold field with a pawn receiving a tiny non-queen crown.",
        charge: "Underpromotion crown",
        crest: "Union banner",
        motto: "Anything But Queen",
        meaning: "The pawn crown records underpromotion; the banner says this was organized labor.",
        weirdness: "Career advancement with a suspiciously specific contract.",
      },
      colors: { primary: "#08070a", secondary: "#f5c86a", glow: "rgba(245,200,106,.4)" },
      image: "/badges/v6/coming-soon/underpromotion-union-badge.png",
    },
    proofCallout: "Underpromotion played · won the game",
    rules: [],
    requirement: { side: "either", result: "win" },
  },
  {
    id: "lone-king-witness-protection",
    title: "Lone King Witness Protection",
    objective: "Win after your opponent has only their king left.",
    instruction: "Coming soon: reduce the enemy army to one nervous monarch and still finish cleanly.",
    openingHint: "Everyone else entered witness protection.",
    reward: 1200,
    category: "Near-impossible",
    difficulty: "Absurd",
    completionRate: "Coming soon",
    flavor: "A lonely king, a crowded board, and absolutely no dignity left.",
    badge: "Solo Monarch Department",
    badgeIdentity: {
      name: "Witness King",
      motif: "♚",
      rarity: "Coming soon absurd artifact",
      unlockCopy: "Leave the opposing king alone with its thoughts, then win.",
      heraldry: {
        shield: "Black-red field with a tiny king under one spotlight and many empty squares.",
        charge: "Isolated king",
        crest: "Witness lamp",
        motto: "Nobody Saw Anything",
        meaning: "The lone king marks total material evacuation; the spotlight makes the humiliation official.",
        weirdness: "Endgame noir starring one terrified monarch.",
      },
      colors: { primary: "#08070a", secondary: "#ff7a66", glow: "rgba(255,122,102,.42)" },
      image: "/badges/v6/coming-soon/lone-king-witness-protection-badge.png",
    },
    proofCallout: "Opponent had only king left · won the game",
    rules: [],
    requirement: { side: "either", result: "win" },
  },
];

export default function ChallengeDeckBrowser({ challenges, activeChallengeId, completedChallengeIds }: ChallengeDeckBrowserProps) {
  const [difficulty, setDifficulty] = useState<DifficultyFilter>("All");
  const [status, setStatus] = useState<StatusFilter>("All");
  const [sort, setSort] = useState<SortMode>("recommended");
  const completedSet = useMemo(() => new Set(completedChallengeIds), [completedChallengeIds]);

  const visibleChallenges = useMemo(() => {
    const filtered = challenges.filter((challenge) => {
      const isActive = activeChallengeId === challenge.id;
      const isCompleted = completedSet.has(challenge.id);

      if (difficulty !== "All" && challenge.difficulty !== difficulty) return false;
      if (status === "Active" && !isActive) return false;
      if (status === "Completed" && !isCompleted) return false;
      if (status === "Open" && (isActive || isCompleted)) return false;
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sort === "easy-first") return difficultyRank[a.difficulty] - difficultyRank[b.difficulty] || a.reward - b.reward;
      if (sort === "hard-first") return difficultyRank[b.difficulty] - difficultyRank[a.difficulty] || b.reward - a.reward;
      if (sort === "points-high") return b.reward - a.reward || difficultyRank[b.difficulty] - difficultyRank[a.difficulty];
      if (sort === "points-low") return a.reward - b.reward || difficultyRank[a.difficulty] - difficultyRank[b.difficulty];
      return challenges.indexOf(a) - challenges.indexOf(b);
    });
  }, [activeChallengeId, challenges, completedSet, difficulty, sort, status]);

  const visibleComingSoonChallenges = useMemo(() => {
    if (status !== "All") return [];

    const filtered = COMING_SOON_CHALLENGES.filter((challenge) => {
      if (difficulty !== "All" && challenge.difficulty !== difficulty) return false;
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sort === "easy-first") return difficultyRank[a.difficulty] - difficultyRank[b.difficulty] || a.reward - b.reward;
      if (sort === "hard-first") return difficultyRank[b.difficulty] - difficultyRank[a.difficulty] || b.reward - a.reward;
      if (sort === "points-high") return b.reward - a.reward || difficultyRank[b.difficulty] - difficultyRank[a.difficulty];
      if (sort === "points-low") return a.reward - b.reward || difficultyRank[a.difficulty] - difficultyRank[b.difficulty];
      return COMING_SOON_CHALLENGES.indexOf(a) - COMING_SOON_CHALLENGES.indexOf(b);
    });
  }, [difficulty, sort, status]);

  const visibleCardCount = visibleChallenges.length + visibleComingSoonChallenges.length;

  return (
    <>
      <section className="mission-card quest-filter-panel" aria-label="Quest filters and sorting">
        <div>
          <h2>Find your next quest.</h2>
        </div>
        <div className="quest-filter-grid">
          <label>
            <span>Difficulty</span>
            <select value={difficulty} onChange={(event) => setDifficulty(event.target.value as DifficultyFilter)}>
              {difficultyFilters.map((filter) => <option key={filter}>{filter}</option>)}
            </select>
          </label>
          <label>
            <span>Status</span>
            <select value={status} onChange={(event) => setStatus(event.target.value as StatusFilter)}>
              <option>All</option>
              <option>Active</option>
              <option>Completed</option>
              <option>Open</option>
            </select>
          </label>
          <label>
            <span>Sort</span>
            <select value={sort} onChange={(event) => setSort(event.target.value as SortMode)}>
              <option value="recommended">Recommended</option>
              <option value="easy-first">Easy first</option>
              <option value="hard-first">Hard first</option>
              <option value="points-high">Most points</option>
              <option value="points-low">Fewest points</option>
            </select>
          </label>
          <div className="quest-filter-count" aria-live="polite">
            <strong>{visibleCardCount}</strong>
            <span>{visibleCardCount === 1 ? "quest" : "quests"}</span>
          </div>
        </div>
      </section>

      <section className="big-grid" aria-label="Available quests">
        {visibleChallenges.map((challenge, index) => (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            featured={sort === "recommended" && index === 0}
            completed={completedSet.has(challenge.id)}
            active={activeChallengeId === challenge.id}
          />
        ))}
        {visibleComingSoonChallenges.map((challenge) => (
          <ComingSoonChallengeCard key={challenge.id} challenge={challenge} />
        ))}
      </section>
    </>
  );
}

export function ChallengeCard({ challenge, featured, completed, active }: { challenge: Challenge; featured?: boolean; completed?: boolean; active?: boolean }) {
  const difficultyTone = getDifficultyTone(challenge.difficulty);
  return (
    <Link
      href={`/challenges/${challenge.id}`}
      className={`challenge-card clickable-quest-card ${featured ? "featured" : ""} ${active ? "active-quest-card" : ""}`}
      aria-current={active ? "true" : undefined}
    >
      {active ? <span className="active-quest-stamp" aria-label="Active quest" /> : null}
      <div className="card-meta quest-card-meta">
        <strong className="quest-points">+{challenge.reward} pts</strong>
        <span className={`badge difficulty-badge ${difficultyTone}`}>{challenge.difficulty}</span>
      </div>
      <div className="challenge-card-title-row">
        <ChallengeBadge challenge={challenge} earned={completed} presentation="art" />
        <div>
          <h3>{challenge.title}</h3>
          <p>{challenge.objective}</p>
          <em>{challenge.openingHint}</em>
        </div>
      </div>
      {completed ? (
        <div className="card-footer quest-state-row">
          <span className="badge green">completed</span>
        </div>
      ) : null}
    </Link>
  );
}

function ComingSoonChallengeCard({ challenge }: { challenge: Challenge }) {
  const difficultyTone = getDifficultyTone(challenge.difficulty);

  return (
    <article className="challenge-card coming-soon-quest-card" aria-label={`${challenge.title} coming soon`}>
      <span className="coming-soon-stamp" aria-hidden="true">COMING SOON</span>
      <div className="coming-soon-card-content" aria-hidden="true">
        <div className="card-meta quest-card-meta">
          <strong className="quest-points">+{challenge.reward} pts</strong>
          <span className={`badge difficulty-badge ${difficultyTone}`}>{challenge.difficulty}</span>
        </div>
        <div className="challenge-card-title-row">
          <ChallengeBadge challenge={challenge} presentation="art" />
          <div>
            <h3>{challenge.title}</h3>
            <p>{challenge.objective}</p>
            <em>{challenge.openingHint}</em>
          </div>
        </div>
      </div>
    </article>
  );
}

function getDifficultyTone(difficulty: Challenge["difficulty"]) {
  if (difficulty === "Easy") return "green";
  if (difficulty === "Medium") return "gold";
  if (difficulty === "Hard") return "orange";
  if (difficulty === "Absurd") return "absurd";
  return "danger";
}
