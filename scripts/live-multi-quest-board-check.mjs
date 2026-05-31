import { CHALLENGES } from '../src/lib/challenges.ts';
import { checkLatestChallengeForProvider } from '../src/lib/challenge-latest-verifiers.ts';
import { checkLatestCustomSideQuestForProvider } from '../src/lib/custom-side-quests.ts';

const username = process.argv[2] || 'and72nor';
const providers = ['lichess', 'chesscom'];
const rows = [];

for (const challenge of CHALLENGES) {
  for (const provider of providers) {
    try {
      const verdict = await checkLatestChallengeForProvider({ challengeId: challenge.id, provider, username });
      rows.push({
        quest: challenge.id,
        provider,
        username,
        status: verdict.status,
        gameId: verdict.gameId,
        hasFinalFen: Boolean(verdict.finalPositionFen),
        hasFailureDiagnostic: Boolean(verdict.failureDiagnostic),
        hasFenAtBreak: Boolean(verdict.failureDiagnostic?.fenAtBreak),
        boardRenderable: Boolean(verdict.failureDiagnostic?.fenAtBreak ?? verdict.finalPositionFen),
        summary: verdict.summary,
      });
    } catch (error) {
      rows.push({
        quest: challenge.id,
        provider,
        username,
        status: 'error',
        boardRenderable: false,
        summary: error?.message ?? String(error),
      });
    }
  }
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

for (const provider of providers) {
  try {
    const custom = await checkLatestCustomSideQuestForProvider({ quest: customQuest, provider, username });
    rows.push({
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
    });
  } catch (error) {
    rows.push({
      quest: customQuest.id,
      provider,
      username,
      status: 'error',
      boardRenderable: false,
      summary: error?.message ?? String(error),
    });
  }
}

for (const row of rows) console.log(JSON.stringify(row));

const failedWithoutBoard = rows.filter((row) => row.status === 'failed' && !row.boardRenderable);
console.error(`FAILED_WITHOUT_BOARD=${failedWithoutBoard.length}`);
for (const row of failedWithoutBoard) console.error(JSON.stringify(row));

if (failedWithoutBoard.length > 0) {
  process.exit(1);
}
