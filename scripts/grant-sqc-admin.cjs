#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const { createClerkClient } = require("@clerk/nextjs/server");

function readEnv(path) {
  const env = {};
  for (const line of fs.readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match) env[match[1]] = match[2].trim().replace(/^["']|["']$/g, "");
  }
  return env;
}

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) {
    console.error("Usage: SQC_ENV_FILE=.env.local node scripts/grant-sqc-admin.cjs admin@example.com");
    process.exit(1);
  }

  const envPath = process.env.SQC_ENV_FILE || ".env.local";
  const env = readEnv(envPath);
  if (!env.CLERK_SECRET_KEY) throw new Error(`Missing CLERK_SECRET_KEY in ${envPath}`);

  const client = createClerkClient({ secretKey: env.CLERK_SECRET_KEY });
  const users = await client.users.getUserList({ emailAddress: [email], limit: 10 });
  const user = users.data.find((candidate) => candidate.primaryEmailAddress?.emailAddress?.toLowerCase() === email)
    ?? users.data[0];

  if (!user) {
    throw new Error(`No Clerk user found for ${email}`);
  }

  await client.users.updateUserMetadata(user.id, {
    privateMetadata: {
      ...(user.privateMetadata ?? {}),
      sqcAdmin: true,
    },
  });

  console.log(`Granted SQC analytics admin to ${email} (${user.id})`);
}

main().catch((error) => {
  console.error(error?.errors ?? error);
  process.exit(1);
});
