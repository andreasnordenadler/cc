#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const repoRoot = process.cwd();
const envPath = path.join(repoRoot, ".env.local");
const stateDir = path.join(repoRoot, "state");
const statePath = path.join(stateDir, "signup-monitor.json");
const args = new Set(process.argv.slice(2));
const source = process.env.SIGNUP_MONITOR_SOURCE || "local-clerk";
const jsonMode = args.has("--json");
const bootstrapOnly = args.has("--bootstrap");

function parseEnv(text) {
  const env = {};
  for (const line of text.split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#") || !line.includes("=")) continue;
    const index = line.indexOf("=");
    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

async function loadLocalEnv() {
  try {
    const text = await fs.readFile(envPath, "utf8");
    return parseEnv(text);
  } catch {
    return {};
  }
}

async function loadSecretKey() {
  const env = await loadLocalEnv();
  return env.CLERK_SECRET_KEY || "";
}

async function fetchAllUsers(secretKey) {
  const users = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const response = await fetch(`https://api.clerk.com/v1/users?limit=${limit}&offset=${offset}&order_by=-created_at`, {
      headers: { Authorization: `Bearer ${secretKey}` },
    });

    if (!response.ok) {
      throw new Error(`Clerk API ${response.status}: ${await response.text()}`);
    }

    const batch = await response.json();
    users.push(...batch);

    if (batch.length < limit) break;
    offset += limit;
  }

  return users;
}


async function fetchUsersFromEndpoint() {
  const env = await loadLocalEnv();
  const token = env.SQC_SIGNUP_MONITOR_TOKEN || process.env.SQC_SIGNUP_MONITOR_TOKEN || "";
  if (!token) {
    throw new Error("Missing SQC_SIGNUP_MONITOR_TOKEN in cc/.env.local");
  }

  const response = await fetch("https://sidequestchess.com/api/internal/signups", {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Signup endpoint ${response.status}: ${await response.text()}`);
  }

  const payload = await response.json();
  return payload.users ?? [];
}
async function readState() {
  try {
    return JSON.parse(await fs.readFile(statePath, "utf8"));
  } catch {
    return null;
  }
}

async function writeState(state) {
  await fs.mkdir(stateDir, { recursive: true });
  await fs.writeFile(statePath, JSON.stringify(state, null, 2) + "\n", "utf8");
}

function buildState(users) {
  return {
    updatedAt: new Date().toISOString(),
    knownUserIds: users.map((user) => user.id),
    totalUsers: users.length,
  };
}

function summarizeUser(user) {
  return {
    id: user.id,
    createdAt: user.created_at ? new Date(user.created_at).toISOString() : null,
    firstName: user.first_name || null,
    username: user.username || null,
    hasEmail: Array.isArray(user.email_addresses) && user.email_addresses.length > 0,
  };
}

async function main() {
  const users = source === "production-endpoint"
    ? await fetchUsersFromEndpoint()
    : await (async () => {
        const secretKey = await loadSecretKey();
        if (!secretKey) {
          throw new Error("Missing CLERK_SECRET_KEY in cc/.env.local");
        }
        return fetchAllUsers(secretKey);
      })();
  const state = await readState();

  if (!state || bootstrapOnly) {
    const nextState = buildState(users);
    await writeState(nextState);
    const payload = {
      status: "bootstrapped",
      totalUsers: users.length,
      newUsers: [],
      checkedAt: new Date().toISOString(),
    };
    if (jsonMode) {
      console.log(JSON.stringify(payload));
    } else {
      console.log(`Bootstrapped signup monitor at ${payload.checkedAt} with ${payload.totalUsers} known users.`);
    }
    return;
  }

  const knownIds = new Set(Array.isArray(state.knownUserIds) ? state.knownUserIds : []);
  const newUsers = users.filter((user) => !knownIds.has(user.id));

  await writeState(buildState(users));

  const payload = {
    status: newUsers.length ? "new_users" : "no_change",
    totalUsers: users.length,
    newUsers: newUsers.map(summarizeUser).sort((a, b) => (a.createdAt || "").localeCompare(b.createdAt || "")),
    checkedAt: new Date().toISOString(),
  };

  if (jsonMode) {
    console.log(JSON.stringify(payload));
    return;
  }

  if (!newUsers.length) {
    console.log(`No new users. Total users: ${users.length}.`);
    return;
  }

  console.log(`New users: ${newUsers.length} (total ${users.length}).`);
  for (const user of payload.newUsers) {
    console.log(`- ${user.createdAt} | id=${user.id} | firstName=${user.firstName || "-"} | username=${user.username || "-"}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
