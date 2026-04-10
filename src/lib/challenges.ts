export type Challenge = {
  id: string;
  title: string;
  objective: string;
  instruction: string;
  openingHint: string;
  reward: number;
  requirement: {
    side: "white" | "black" | "either";
    result: "win" | "finish" | "draw" | "lose";
  };
};

export const CHALLENGES: Challenge[] = [
  {
    id: "finish-any-game",
    title: "Finish Any Game",
    objective: "Complete and submit any finished game where your public Lichess account appears.",
    instruction:
      "Play any game and submit the finished game ID. This proves the loop end-to-end.",
    reward: 80,
    openingHint: "This is the fastest loop sanity check with your saved identity.",
    requirement: {
      side: "either",
      result: "finish",
    },
  },
  {
    id: "finish-as-white",
    title: "Finish as White",
    objective: "Complete and submit one finished game where you played as White.",
    instruction:
      "Start a real Lichess game as White, finish it, and return with the game ID.",
    reward: 90,
    openingHint:
      "This is the smallest step up from any finished game, keeping the focus on side awareness instead of winning.",
    requirement: {
      side: "white",
      result: "finish",
    },
  },
  {
    id: "finish-as-black",
    title: "Finish as Black",
    objective: "Complete and submit one finished game where you played as Black.",
    instruction:
      "Start a real Lichess game as Black, finish it, and return with the game ID.",
    reward: 95,
    openingHint:
      "This closes the side-pair for finished-game verification without adding any new game outcome requirement.",
    requirement: {
      side: "black",
      result: "finish",
    },
  },
  {
    id: "win-as-white",
    title: "Win as White",
    objective: "Win one complete game as White.",
    instruction:
      "Start a real Lichess game and play as White. Return with a finished game ID.",
    reward: 100,
    openingHint:
      "Use this as a starter check: a simple tactical win with your first real game.",
    requirement: {
      side: "white",
      result: "win",
    },
  },
  {
    id: "win-as-black",
    title: "Win as Black",
    objective: "Win one complete game as Black.",
    instruction:
      "Play a real Lichess game as Black and finish it with a win. Return the game ID.",
    reward: 120,
    openingHint:
      "Aim for clean king safety and trading down into endgame clarity.",
    requirement: {
      side: "black",
      result: "win",
    },
  },
  {
    id: "draw-any-game",
    title: "Draw Any Game",
    objective: "Finish and submit one drawn game where your public Lichess account appears.",
    instruction:
      "Play a real Lichess game, finish it as a draw, and return with the game ID.",
    reward: 110,
    openingHint:
      "This is the smallest outcome expansion after the existing finish and win checks, without adding side-specific logic.",
    requirement: {
      side: "either",
      result: "draw",
    },
  },
  {
    id: "draw-as-white",
    title: "Draw as White",
    objective: "Finish and submit one drawn game where you played as White.",
    instruction:
      "Play a real Lichess game as White, finish it as a draw, and return with the game ID.",
    reward: 115,
    openingHint:
      "This adds one side-specific draw check without widening the loop beyond the current single-game verifier path.",
    requirement: {
      side: "white",
      result: "draw",
    },
  },
  {
    id: "draw-as-black",
    title: "Draw as Black",
    objective: "Finish and submit one drawn game where you played as Black.",
    instruction:
      "Play a real Lichess game as Black, finish it as a draw, and return with the game ID.",
    reward: 120,
    openingHint:
      "This closes the side-pair for draw verification using the same single-game Lichess evidence already in production.",
    requirement: {
      side: "black",
      result: "draw",
    },
  },
  {
    id: "lose-any-game",
    title: "Lose Any Game",
    objective: "Finish and submit one lost game where your public Lichess account appears.",
    instruction:
      "Play a real Lichess game, finish it with a loss, and return with the game ID.",
    reward: 125,
    openingHint:
      "This adds one narrow loss check using the same finished-game, identity, and winner evidence already in the verifier path.",
    requirement: {
      side: "either",
      result: "lose",
    },
  },
  {
    id: "lose-as-white",
    title: "Lose as White",
    objective: "Finish and submit one lost game where you played as White.",
    instruction:
      "Play a real Lichess game as White, finish it with a loss, and return with the game ID.",
    reward: 130,
    openingHint:
      "This adds one side-specific loss check on top of the existing loss verifier without widening the single-game review loop.",
    requirement: {
      side: "white",
      result: "lose",
    },
  },
];

export function getChallengeById(id: string): Challenge | undefined {
  return CHALLENGES.find((challenge) => challenge.id === id);
}
