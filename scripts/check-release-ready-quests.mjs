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

function extractChallengeBlocks(text) {
  const blocks = [];
  const marker = /\n  \{\n    id:\s*"([a-z0-9-]+)"/g;
  const matches = [...text.matchAll(marker)];
  for (let index = 0; index < matches.length; index += 1) {
    const start = matches[index].index + 1;
    const end = index + 1 < matches.length ? matches[index + 1].index + 1 : text.indexOf("\n];", start);
    blocks.push({ id: matches[index][1], text: text.slice(start, end) });
  }
  return blocks;
}

function extractStringField(block, fieldName) {
  const direct = block.match(new RegExp(`${fieldName}:\\s*"([^"]*)"`));
  if (direct) return direct[1];
  const wrapped = block.match(new RegExp(`${fieldName}:\\s*\\n\\s*"([^"]*)"`));
  return wrapped?.[1] ?? "";
}

function extractRules(block) {
  const rulesBlock = block.match(/rules:\s*\[([\s\S]*?)\n\s*\]/)?.[1] ?? "";
  return [...rulesBlock.matchAll(/"([^"]+)"/g)].map((match) => match[1]);
}

function moveNumberTokens(text) {
  return new Set([...text.matchAll(/\b(?:move|moves)\s*(\d+)\b|\b(\d+)\+\s*move\b/gi)].map((match) => match[1] ?? match[2]));
}

const copyMoveThresholdIssues = [];
for (const challenge of extractChallengeBlocks(challengesText)) {
  const objective = extractStringField(challenge.text, "objective");
  const instruction = extractStringField(challenge.text, "instruction");
  const primaryCopy = `${objective} ${instruction}`;
  const primaryTokens = moveNumberTokens(primaryCopy);
  const rules = extractRules(challenge.text);
  const minimumMoveRules = rules.filter((rule) => /Game must be at least \d+ moves/i.test(rule));

  for (const rule of minimumMoveRules) {
    for (const token of moveNumberTokens(rule)) {
      if (!primaryTokens.has(token)) {
        copyMoveThresholdIssues.push(`${challenge.id}: primary public copy omits minimum game length from rule "${rule}"`);
      }
    }
  }
}

if (copyMoveThresholdIssues.length > 0) {
  fail(`public quest move-threshold copy mismatch:\n- ${copyMoveThresholdIssues.join("\n- ")}`);
}

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

console.log(`✅ Quest release gate passed: ${uniqueChallengeIds.length} released quests have provider map entries/action branches, no placeholder verifier text, and public move-threshold copy is aligned.`);
