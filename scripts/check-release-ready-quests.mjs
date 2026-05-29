#!/usr/bin/env node
import fs from 'node:fs';

function fail(message) {
  console.error(`\n🚫 Quest release gate blocked: ${message}\n`);
  process.exit(1);
}

const challengesText = fs.readFileSync('src/lib/challenges.ts', 'utf8');
const verifiersText = fs.readFileSync('src/lib/challenge-latest-verifiers.ts', 'utf8');
const actionsText = fs.readFileSync('src/app/actions.ts', 'utf8');

const challengeIds = [...challengesText.matchAll(/\bid:\s*"([a-z0-9-]+)"/g)].map((match) => match[1]);
const uniqueChallengeIds = [...new Set(challengeIds)];

const bannedVerifierPhrases = [
  'verifier-pending',
  'Full automatic',
  'being prepared',
  'Activation',
  'checkLatestBackRankGoblinActivation',
];

for (const phrase of bannedVerifierPhrases) {
  if (verifiersText.includes(phrase)) {
    fail(`placeholder verifier text remains in src/lib/challenge-latest-verifiers.ts (${phrase}).`);
  }
}

const missingProviderEntries = uniqueChallengeIds.filter((id) => !verifiersText.includes(`"${id}": {`));
if (missingProviderEntries.length > 0) {
  fail(`missing latest-game provider map entries for: ${missingProviderEntries.join(', ')}`);
}

const missingActionBranches = uniqueChallengeIds.filter((id) => !actionsText.includes(`challengeId === "${id}"`));
if (missingActionBranches.length > 0) {
  fail(`missing start/check action latest-game branches for: ${missingActionBranches.join(', ')}`);
}

console.log(`✅ Quest release gate passed: ${uniqueChallengeIds.length} released quests have provider map entries and action branches; no placeholder verifier text found.`);
