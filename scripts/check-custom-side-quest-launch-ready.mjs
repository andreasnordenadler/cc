import fs from 'node:fs';

const requiredFiles = [
  'src/app/api/mobile/custom-quests/route.ts',
  'src/lib/custom-side-quests.ts',
  'src/app/api/mobile/quest/route.ts',
  'src/app/api/mobile/account/route.ts',
  'apps/mobile/src/api/sqc.ts',
  'apps/mobile/src/types/sqc.ts',
  'apps/mobile/App.tsx',
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) throw new Error(`Missing custom Side Quest launch file: ${file}`);
}

const customLib = fs.readFileSync('src/lib/custom-side-quests.ts', 'utf8');
const customApi = fs.readFileSync('src/app/api/mobile/custom-quests/route.ts', 'utf8');
const questApi = fs.readFileSync('src/app/api/mobile/quest/route.ts', 'utf8');
const mobileApi = fs.readFileSync('apps/mobile/src/api/sqc.ts', 'utf8');
const mobileApp = fs.readFileSync('apps/mobile/App.tsx', 'utf8');

const expectations = [
  [customLib, 'checkLatestCustomSideQuestForProvider', 'generic custom verifier export'],
  [customLib, 'type: "pieceState"', 'piece-state rules'],
  [customLib, 'type: "moveSequence"', 'move-sequence rules'],
  [customLib, 'type: "openingSequence"', 'opening-sequence rules'],
  [customLib, 'failureDiagnostic', 'custom failure diagnostics'],
  [customApi, 'export async function POST', 'custom quest save API'],
  [customApi, 'export async function DELETE', 'custom quest delete API'],
  [questApi, 'checkLatestCustomSideQuestForProvider', 'mobile quest check integration'],
  [questApi, 'getCustomSideQuestById', 'custom active quest lookup'],
  [mobileApi, 'saveMobileCustomSideQuest', 'mobile save client'],
  [mobileApp, 'saveMobileCustomSideQuest', 'mobile builder persistence wiring'],
  [mobileApp, 'startCustomSideQuest', 'mobile custom start wiring'],
];

for (const [text, needle, label] of expectations) {
  if (!text.includes(needle)) throw new Error(`Custom Side Quest launch gate failed: missing ${label}.`);
}

if (/draft UX|prototype\/draft|not yet backend-published\/scored/.test(mobileApp)) {
  throw new Error('Custom Side Quest launch gate failed: prototype/draft wording still appears in mobile app.');
}

console.log('✅ Custom Side Quest launch gate passed: persistence API, mobile wiring, generic verifier, diagnostics, and launch copy are present.');
