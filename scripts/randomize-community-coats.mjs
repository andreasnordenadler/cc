#!/usr/bin/env node
import { createHash, randomInt } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const APPLY = process.argv.includes("--apply");
const REROLL_ALL = process.argv.includes("--reroll-all");
const ROOT = process.cwd();
const ENV_PATH = path.join(ROOT, ".env.local");
const QUALITY_APPROVED_COAT_POOL = [
  "/badges/v6/bishop-field-trip-badge.png",
  "/badges/v6/early-king-walk-badge.png",
  "/badges/v6/knights-before-coffee-badge.png",
  "/badges/v6/proof-loop-test-badge.png",
  "/badges/v5/no-castle-club-badge.png",
  "/badges/v5/one-bishop-to-rule-them-all-badge.png",
  "/badges/v5/rookless-rampage-badge.png",
  "/badges/v5/the-blunder-gambit-badge.png",
];

await loadDotEnv(ENV_PATH);
const clerkSecret = process.env.CLERK_SECRET_KEY;
if (!clerkSecret) throw new Error("CLERK_SECRET_KEY is required in .env.local or environment");

const users = await fetchAllUsers();
const backup = [];
const updates = [];
for (const user of users) {
  const metadataPairs = [
    { targetMetadataKey: "private_metadata", metadata: asObject(user.private_metadata) },
    { targetMetadataKey: "public_metadata", metadata: asObject(user.public_metadata) },
  ];

  for (const { targetMetadataKey, metadata } of metadataPairs) {
    const quests = getQuestArray(metadata);
    if (!quests.length) continue;

    const nextQuests = quests.map((quest, index) => {
      if (!isPublicPublishedQuest(quest)) return quest;
      if (!REROLL_ALL && QUALITY_APPROVED_COAT_POOL.includes(quest.badgeImageUrl)) return quest;
      return {
        ...quest,
        badgeImageUrl: pickDifferentCoat(quest.badgeImageUrl, `${user.id}:${targetMetadataKey}:${quest.id}:${index}`),
      };
    });
    const changedQuests = nextQuests.filter((quest, index) => quest !== quests[index]);
    if (!changedQuests.length) continue;

    const nextMetadata = { ...metadata, customSideQuests: nextQuests };
    backup.push({ userId: user.id, targetMetadataKey, customSideQuests: quests });
    updates.push({ userId: user.id, targetMetadataKey, nextMetadata, changedQuests });
  }
}

const backupDir = path.join(ROOT, "artifacts", "metadata-backups");
await mkdir(backupDir, { recursive: true });
const backupFile = path.join(backupDir, `community-coats-before-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
await writeFile(backupFile, JSON.stringify({ createdAt: new Date().toISOString(), apply: APPLY, updates: backup }, null, 2));

console.log(JSON.stringify({ mode: APPLY ? "apply" : "dry-run", rerollAll: REROLL_ALL, usersScanned: users.length, usersToUpdate: updates.length, questsToUpdate: updates.reduce((sum, update) => sum + update.changedQuests.length, 0), backupFile, poolSize: QUALITY_APPROVED_COAT_POOL.length }, null, 2));

if (APPLY) {
  for (const update of updates) {
    await patchUserMetadata(update.userId, { [update.targetMetadataKey]: update.nextMetadata });
    console.log(`updated ${update.userId}: ${update.changedQuests.length} public community quest coat(s)`);
  }
}

async function loadDotEnv(file) {
  try {
    const text = await (await import("node:fs/promises")).readFile(file, "utf8");
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
      const [key, ...rest] = trimmed.split("=");
      if (!process.env[key]) process.env[key] = rest.join("=").replace(/^['\"]|['\"]$/g, "");
    }
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
}

async function fetchAllUsers() {
  const out = [];
  for (let offset = 0; ; ) {
    const params = new URLSearchParams({ limit: "100", offset: String(offset), order_by: "-created_at" });
    const response = await clerkFetch(`/v1/users?${params}`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error(`Unexpected Clerk user list response: ${JSON.stringify(data).slice(0, 200)}`);
    out.push(...data);
    if (data.length < 100) return out;
    offset += data.length;
  }
}

async function patchUserMetadata(userId, body) {
  const response = await clerkFetch(`/v1/users/${encodeURIComponent(userId)}/metadata`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`Clerk metadata update failed for ${userId}: ${response.status} ${await response.text()}`);
}

async function clerkFetch(pathname, init = {}) {
  const response = await fetch(`https://api.clerk.com${pathname}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${clerkSecret}`,
      ...(init.headers ?? {}),
    },
  });
  if (!response.ok && init.method !== "PATCH") throw new Error(`Clerk API failed: ${response.status} ${await response.text()}`);
  return response;
}

function asObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function getQuestArray(metadata) {
  return Array.isArray(metadata.customSideQuests) ? metadata.customSideQuests : [];
}

function isPublicPublishedQuest(quest) {
  return quest && typeof quest === "object" && quest.visibility === "public" && (quest.lifecycle ?? "published") === "published" && typeof quest.id === "string";
}

function pickDifferentCoat(current, seed) {
  if (QUALITY_APPROVED_COAT_POOL.length === 1) return QUALITY_APPROVED_COAT_POOL[0];
  const offset = randomInt(QUALITY_APPROVED_COAT_POOL.length);
  const seedIndex = parseInt(createHash("sha256").update(seed).digest("hex").slice(0, 8), 16);
  for (let i = 0; i < QUALITY_APPROVED_COAT_POOL.length; i += 1) {
    const candidate = QUALITY_APPROVED_COAT_POOL[(seedIndex + offset + i) % QUALITY_APPROVED_COAT_POOL.length];
    if (candidate !== current) return candidate;
  }
  return QUALITY_APPROVED_COAT_POOL[0];
}
