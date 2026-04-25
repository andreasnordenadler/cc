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
  proofCallout: string;
  rules: string[];
  requirement: {
    side: "white" | "black" | "either";
    result: "win" | "finish" | "draw" | "lose";
  };
};

export const CHALLENGES: Challenge[] = [
  {
    id: "queen-never-heard-of-her",
    title: "Queen? Never Heard of Her",
    objective: "Win after losing your queen before move 15.",
    instruction:
      "Start this side quest, play normal games on Lichess or Chess.com, and let BlunderCheck look for a win where you were queenless before move 15 while your opponent still had their queen.",
    openingHint: "The queen is overrated. Probably.",
    reward: 500,
    category: "Blunder Quest",
    difficulty: "Brutal",
    completionRate: "4.2% complete",
    flavor: "You are voluntarily entering a game state chess coaches warn children about.",
    badge: "Certified Queenless Maniac",
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
