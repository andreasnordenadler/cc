export type Challenge = {
  id: string;
  title: string;
  objective: string;
  instruction: string;
  openingHint: string;
  reward: number;
  requirement: {
    side: "white" | "black" | "either";
    result: "win" | "finish";
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
];

export function getChallengeById(id: string): Challenge | undefined {
  return CHALLENGES.find((challenge) => challenge.id === id);
}
