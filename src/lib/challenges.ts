export type BadgeIdentity = {
  name: string;
  motif: string;
  rarity: string;
  unlockCopy: string;
  image?: string;
  heraldry: {
    shield: string;
    charge: string;
    crest: string;
    motto: string;
    meaning: string;
    weirdness: string;
  };
  colors: {
    primary: string;
    secondary: string;
    glow: string;
  };
};

export type Challenge = {
  id: string;
  title: string;
  objective: string;
  instruction: string;
  openingHint: string;
  reward: number;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Brutal" | "Absurd";
  completionRate: string;
  flavor: string;
  badge: string;
  badgeIdentity: BadgeIdentity;
  proofCallout: string;
  rules: string[];
  requirement: {
    side: "white" | "black" | "either";
    result: "win" | "finish" | "draw" | "lose";
  };
};

export const CHALLENGES: Challenge[] = [
  {
    id: "knights-before-coffee",
    title: "Knights Before Coffee",
    objective: "For your first four moves, only move knights — then finish the game.",
    instruction:
      "Start this beginner side quest, play a real game, and make your first four player moves with knights only before allowing yourself to touch anything sensible.",
    openingHint: "Horses first. Plans later.",
    reward: 40,
    category: "Beginner Quest",
    difficulty: "Easy",
    completionRate: "Beginner-friendly",
    flavor: "A tiny opening ritual that is clearly wrong, but not catastrophic enough to ruin your afternoon.",
    badge: "Horse First Initiate",
    badgeIdentity: {
      name: "Coffee Horse",
      motif: "♞",
      rarity: "Beginner token",
      unlockCopy: "Start the game by letting only the knights make decisions for a while.",
      heraldry: {
        shield: "Warm gold field with two restless knight heads over an untouched pawn line.",
        charge: "Twin opening knights",
        crest: "Tiny coffee steam",
        motto: "Horses Before Sense",
        meaning: "The two knights mark the first beginner ritual; the untouched line shows every other piece politely waiting.",
        weirdness: "A chess opening chosen by stable management.",
      },
      colors: { primary: "#f5c86a", secondary: "#76a9ff", glow: "rgba(245,200,106,.38)" },
    },
    proofCallout: "First four player moves were knight moves",
    rules: [
      "Your first four moves must all be knight moves.",
      "Do not move pawns, bishops, rooks, queen, or king before your fifth move.",
      "You only need to finish the game; winning is optional.",
      "Standard chess only.",
    ],
    requirement: {
      side: "either",
      result: "finish",
    },
  },
  {
    id: "bishop-field-trip",
    title: "Bishop Field Trip",
    objective: "Move both bishops before you move your queen, then finish the game.",
    instruction:
      "Give both bishops an early field trip before the queen gets any attention. It is still beginner-friendly, but it asks for a slightly more deliberate opening plan.",
    openingHint: "The diagonals demanded enrichment.",
    reward: 65,
    category: "Beginner Quest",
    difficulty: "Easy",
    completionRate: "Beginner-friendly",
    flavor: "A development principle wearing a fake mustache and pretending to be chaos.",
    badge: "Diagonal Daycare Pass",
    badgeIdentity: {
      name: "Field Trip Bishops",
      motif: "♝",
      rarity: "Beginner token",
      unlockCopy: "Let both bishops leave home before the queen gets involved.",
      heraldry: {
        shield: "Teal field with crossing diagonals and a queen still asleep in the corner.",
        charge: "Two wandering bishops",
        crest: "Permission slip",
        motto: "Diagonals First",
        meaning: "The crossed diagonals show both bishops developed; the sleeping queen proves restraint.",
        weirdness: "A school trip for pieces that only walk sideways diagonally.",
      },
      colors: { primary: "#2dd4bf", secondary: "#f5c86a", glow: "rgba(45,212,191,.36)" },
    },
    proofCallout: "Both bishops moved before queen moved",
    rules: [
      "Move both bishops at least once before moving your queen.",
      "If your queen moves before both bishops have moved, the quest fails.",
      "You only need to finish the game; winning is optional.",
      "Standard chess only.",
    ],
    requirement: {
      side: "either",
      result: "finish",
    },
  },
  {
    id: "early-king-walk",
    title: "Early King Walk",
    objective: "Move your king before move 12, survive the awkwardness, and finish the game.",
    instruction:
      "Take the king for one tiny early walk. It is more dangerous than the first two beginner quests, but still approachable because you only need to finish the game.",
    openingHint: "The monarch wanted fresh air.",
    reward: 90,
    category: "Beginner Quest",
    difficulty: "Medium",
    completionRate: "Beginner stretch",
    flavor: "Not illegal. Not wise. Perfectly Side Quest Chess.",
    badge: "Tiny Royal Walk",
    badgeIdentity: {
      name: "Pocket Monarch",
      motif: "♔",
      rarity: "Beginner stretch",
      unlockCopy: "Move the king early and live with your choices until the game ends.",
      heraldry: {
        shield: "Blue-purple dusk field with a small crown stepping outside its gate.",
        charge: "Walking king",
        crest: "Open door",
        motto: "Majesty Has Legs",
        meaning: "The walking crown records the early king move; the open door marks leaving safety on purpose.",
        weirdness: "A royal constitutional crisis in one square.",
      },
      colors: { primary: "#76a9ff", secondary: "#a78bfa", glow: "rgba(118,169,255,.4)" },
    },
    proofCallout: "King moved before move 12",
    rules: [
      "Move your king at least once before your move 12.",
      "Castling does not count as the king walk for this quest.",
      "You only need to finish the game; winning is optional.",
      "Standard chess only.",
    ],
    requirement: {
      side: "either",
      result: "finish",
    },
  },
  {
    id: "queen-never-heard-of-her",
    title: "Queen? Never Heard of Her",
    objective: "Win after losing your queen before move 15.",
    instruction:
      "Start this side quest, play normal games on Lichess or Chess.com, and let Side Quest Chess look for a win where you were queenless before move 15 while your opponent still had their queen.",
    openingHint: "The queen is overrated. Probably.",
    reward: 500,
    category: "Blunder Quest",
    difficulty: "Brutal",
    completionRate: "4.2% complete",
    flavor: "You are voluntarily entering a game state chess coaches warn children about.",
    badge: "Certified Queenless Maniac",
    badgeIdentity: {
      name: "Queenless Gremlin",
      motif: "♛",
      rarity: "Brutal relic",
      unlockCopy: "Win after donating the most important piece like it was pocket lint.",
      image: "/badges/v4/queen-never-heard-of-her.png",
      heraldry: {
        shield: "Split blue-gold field with a cracked crown over an empty queen square.",
        charge: "Broken queen crown",
        crest: "Resilient wing",
        motto: "Glory Without Her",
        meaning: "The broken crown marks the sacrificed queen; the wing means the player still rose and won.",
        weirdness: "A noble house founded by confidently throwing away the queen.",
      },
      colors: { primary: "#ff5f9f", secondary: "#f5c86a", glow: "rgba(255,95,159,.45)" },
    },
    proofCallout: "Lost queen before move 15 · still won",
    rules: [
      "You must lose your queen before move 15.",
      "Your opponent must still have their queen after that moment.",
      "You must win the game.",
      "Game must be at least 10 moves.",
      "Rapid, blitz, or bullet allowed.",
      "Rated or casual allowed.",
      "Variants not allowed.",
    ],
    requirement: {
      side: "either",
      result: "win",
    },
  },
  {
    id: "no-castle-club",
    title: "No Castle Club",
    objective: "Win without castling.",
    instruction:
      "Play a normal game and win while your king refuses the sensible adult option of castling.",
    openingHint: "Your king wanted cardio anyway.",
    reward: 150,
    category: "Restriction",
    difficulty: "Medium",
    completionRate: "31% complete",
    flavor: "No castling. No excuses. Just king anxiety.",
    badge: "Uncastled Menace",
    badgeIdentity: {
      name: "King Walk Club",
      motif: "♔",
      rarity: "Restriction token",
      unlockCopy: "Refuse castling, survive the awkwardness, and still win.",
      image: "/badges/v4/no-castle-club-badge.png",
      heraldry: {
        shield: "Blue-green field crossed by two barred rook towers.",
        charge: "Walking king",
        crest: "Unlatched gate",
        motto: "No Walls, Still Standing",
        meaning: "The walking king represents refusing shelter; crossed rooks show castles deliberately unused.",
        weirdness: "Royal cardio, performed under extremely poor advice.",
      },
      colors: { primary: "#76a9ff", secondary: "#60f0af", glow: "rgba(118,169,255,.42)" },
    },
    proofCallout: "King stayed stressed the whole game",
    rules: [
      "Do not castle kingside or queenside.",
      "Win the game.",
      "Game must be at least 10 moves.",
      "Rated or casual allowed.",
    ],
    requirement: {
      side: "either",
      result: "win",
    },
  },
  {
    id: "the-blunder-gambit",
    title: "The Blunder Gambit",
    objective: "Hang a piece in the first 10 moves and still win.",
    instruction:
      "Give away real material early, then pretend it was all theory when you somehow win later.",
    openingHint: "It was not a mistake. It was branding.",
    reward: 300,
    category: "Blunder Quest",
    difficulty: "Hard",
    completionRate: "12% complete",
    flavor: "A terrible opening novelty with a surprisingly good PR team.",
    badge: "I Meant That",
    badgeIdentity: {
      name: "Theory Accident",
      motif: "!?",
      rarity: "Blunder foil",
      unlockCopy: "Hang material early and retroactively call it preparation.",
      image: "/badges/v4/the-blunder-gambit-badge.png",
      heraldry: {
        shield: "Red-gold field split by a cracked diagonal blade.",
        charge: "Broken piece with phoenix spark",
        crest: "Tiny flame",
        motto: "I Meant That",
        meaning: "The broken piece admits the early blunder; the phoenix spark turns disaster into victory.",
        weirdness: "A formal apology issued as an opening novelty.",
      },
      colors: { primary: "#ff7a66", secondary: "#f5c86a", glow: "rgba(255,122,102,.42)" },
    },
    proofCallout: "Piece hung early · opponent still lost",
    rules: [
      "Lose a minor piece or rook in the first 10 moves without equal material back immediately.",
      "Win the game.",
      "Game must be at least 15 moves.",
      "Variants not allowed.",
    ],
    requirement: {
      side: "either",
      result: "win",
    },
  },
  {
    id: "pawn-storm-maniac",
    title: "Pawn Storm Maniac",
    objective: "Move at least six pawns before move 15 and win.",
    instruction:
      "Launch pawns like you forgot pieces exist, then convert the chaos into a win.",
    openingHint: "Development is optional. Vibes are mandatory.",
    reward: 350,
    category: "Chaos",
    difficulty: "Hard",
    completionRate: "9.8% complete",
    flavor: "A strategy best described as weather.",
    badge: "Pawn Weather Warning",
    badgeIdentity: {
      name: "Pawn Monsoon",
      motif: "♟",
      rarity: "Chaos badge",
      unlockCopy: "Send six pawns into the storm before move 15 and make it work.",
      image: "/badges/v4/pawn-storm-maniac-badge.png",
      heraldry: {
        shield: "Green-gold storm field with six pawn drops like rain.",
        charge: "Six-pawn squall",
        crest: "Lightning cloud",
        motto: "Forward, Unfortunately",
        meaning: "The six pawns mark the reckless early storm; lightning shows chaos converted into attack.",
        weirdness: "Weather report: tiny soldiers, zero restraint.",
      },
      colors: { primary: "#60f0af", secondary: "#f5c86a", glow: "rgba(96,240,175,.38)" },
    },
    proofCallout: "Six pawns launched before move 15",
    rules: [
      "Move at least six different pawns before move 15.",
      "Win the game.",
      "Game must be at least 20 moves.",
      "Rated or casual allowed.",
    ],
    requirement: {
      side: "either",
      result: "win",
    },
  },
  {
    id: "knightmare-mode",
    title: "Knightmare Mode",
    objective: "Deliver checkmate with a knight.",
    instruction:
      "Win with the horse getting the final word. Elegant? Maybe. Annoying? Definitely.",
    openingHint: "The horse gets the final word.",
    reward: 600,
    category: "Style Kill",
    difficulty: "Brutal",
    completionRate: "3.7% complete",
    flavor: "Checkmate by horse violence.",
    badge: "Horse Criminal",
    badgeIdentity: {
      name: "Horse Felony",
      motif: "♞",
      rarity: "Style kill",
      unlockCopy: "Let the knight deliver the last insult.",
      image: "/badges/v4/knightmare-mode-badge.png",
      heraldry: {
        shield: "Purple-pink night field under a checkmate star.",
        charge: "Knight head",
        crest: "Crescent star",
        motto: "The Horse Decides",
        meaning: "The knight charge owns the final blow; the star marks a stylish mate rather than a normal win.",
        weirdness: "The horse submitted the final paperwork.",
      },
      colors: { primary: "#a78bfa", secondary: "#ff5f9f", glow: "rgba(167,139,250,.44)" },
    },
    proofCallout: "Final move was knight mate",
    rules: [
      "Your final move must be a knight move that gives checkmate.",
      "You must win the game.",
      "Game must be at least 10 moves.",
      "Variants not allowed.",
    ],
    requirement: {
      side: "either",
      result: "win",
    },
  },
  {
    id: "rookless-rampage",
    title: "Rookless Rampage",
    objective: "Win after losing both rooks.",
    instruction:
      "Lose both castles, keep walking forward emotionally, and win anyway.",
    openingHint: "Castles are temporary. Glory is forever.",
    reward: 900,
    category: "Absurdity",
    difficulty: "Absurd",
    completionRate: "0.9% complete",
    flavor: "Structural damage, but make it inspirational.",
    badge: "No Towers, No Problem",
    badgeIdentity: {
      name: "Demolition Permit",
      motif: "♜",
      rarity: "Absurd artifact",
      unlockCopy: "Lose both rooks, keep the vibes standing, and win anyway.",
      image: "/badges/v4/rookless-rampage-badge.png",
      heraldry: {
        shield: "Gold-red field with two fallen tower silhouettes below a laurel.",
        charge: "Fallen twin rooks",
        crest: "Victory laurel",
        motto: "No Towers, No Trouble",
        meaning: "The fallen towers record both lost rooks; the laurel proves the wreckage still ended in victory.",
        weirdness: "Urban planning disaster, somehow celebrated.",
      },
      colors: { primary: "#f5c86a", secondary: "#ff7a66", glow: "rgba(245,200,106,.46)" },
    },
    proofCallout: "Both rooks gone · dignity survived",
    rules: [
      "Both of your rooks must be captured or traded away.",
      "You must win the game after both rooks are gone.",
      "Game must be at least 20 moves.",
      "Variants not allowed.",
    ],
    requirement: {
      side: "either",
      result: "win",
    },
  },
  {
    id: "one-bishop-to-rule-them-all",
    title: "One Bishop to Rule Them All",
    objective: "Win with only one bishop remaining as your minor piece.",
    instruction:
      "End the game with one bishop carrying the entire minor-piece department.",
    openingHint: "Middle management, but diagonal.",
    reward: 400,
    category: "Style Kill",
    difficulty: "Hard",
    completionRate: "7.1% complete",
    flavor: "One bishop. Too much responsibility.",
    badge: "Diagonal Manager",
    badgeIdentity: {
      name: "Bishop HR",
      motif: "♝",
      rarity: "Style relic",
      unlockCopy: "Leave one bishop holding the entire department together.",
      image: "/badges/v4/one-bishop-to-rule-them-all-badge.png",
      heraldry: {
        shield: "Teal-blue field with one bright diagonal crossing an empty board.",
        charge: "Solitary bishop",
        crest: "Single candle",
        motto: "One Diagonal Remains",
        meaning: "The lone bishop stands for the only remaining minor piece; the candle signals lonely competence.",
        weirdness: "One diagonal employee surviving the entire department meeting.",
      },
      colors: { primary: "#2dd4bf", secondary: "#76a9ff", glow: "rgba(45,212,191,.4)" },
    },
    proofCallout: "One bishop remained · job somehow done",
    rules: [
      "At the winning moment, your only remaining minor piece must be one bishop.",
      "You must win the game.",
      "Game must be at least 15 moves.",
      "Variants not allowed.",
    ],
    requirement: {
      side: "either",
      result: "win",
    },
  },
];

export function getChallengeById(id: string): Challenge | undefined {
  return CHALLENGES.find((challenge) => challenge.id === id);
}

export function getDailyChallenge(date = new Date()): Challenge {
  const dayKey = date.toISOString().slice(0, 10);
  const seed = [...dayKey].reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 7), 0);

  return CHALLENGES[seed % CHALLENGES.length];
}
