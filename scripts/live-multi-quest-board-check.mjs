import { checkLatestChallengeForProvider } from '../src/lib/challenge-latest-verifiers.ts';
import { checkLatestCustomSideQuestForProvider } from '../src/lib/custom-side-quests.ts';

const username = process.argv[2] || 'and72nor';
const provider = 'lichess';
const checks = [
  { challengeId: 'no-castle-club', provider, username },
  { challengeId: 'back-rank-goblin', provider, username },
  { challengeId: 'queen-never-heard-of-her', provider, username },
];

for (const input of checks) {
  const verdict = await checkLatestChallengeForProvider(input);
  console.log(JSON.stringify({
    quest: input.challengeId,
    provider: input.provider,
    username,
    status: verdict.status,
    gameId: verdict.gameId,
    hasFinalFen: Boolean(verdict.finalPositionFen),
    hasFailureDiagnostic: Boolean(verdict.failureDiagnostic),
    hasFenAtBreak: Boolean(verdict.failureDiagnostic?.fenAtBreak),
    boardRenderable: Boolean(verdict.failureDiagnostic?.fenAtBreak ?? verdict.finalPositionFen),
    summary: verdict.summary,
  }));
}

const customQuest = {
  id: 'custom-qa-opening',
  title: 'QA opening line mismatch',
  summary: 'Opening mismatch should produce diagnostic board',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  config: JSON.stringify({
    version: 2,
    logic: 'all',
    blocks: [{ type: 'openingSequence', raw: '1. h4 h5 2. Rh3', moves: ['h4', 'h5', 'Rh3'], anchor: 'gameStart' }],
  }),
};
const custom = await checkLatestCustomSideQuestForProvider({ quest: customQuest, provider, username });
console.log(JSON.stringify({
  quest: customQuest.id,
  provider,
  username,
  status: custom.status,
  gameId: custom.gameId,
  hasFinalFen: Boolean(custom.finalPositionFen),
  hasFailureDiagnostic: Boolean(custom.failureDiagnostic),
  hasFenAtBreak: Boolean(custom.failureDiagnostic?.fenAtBreak),
  boardRenderable: Boolean(custom.failureDiagnostic?.fenAtBreak ?? custom.finalPositionFen),
  summary: custom.summary,
}));
