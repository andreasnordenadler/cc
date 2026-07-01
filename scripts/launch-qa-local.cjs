#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const crypto = require("node:crypto");
const { createClerkClient } = require("@clerk/nextjs/server");
const { chromium } = require("playwright");

function readEnv(path) {
  const env = {};
  for (const line of fs.readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match) env[match[1]] = match[2].trim().replace(/^["']|["']$/g, "");
  }
  return env;
}

async function ensureRedirectUrl(client, url) {
  try {
    await client.redirectUrls.createRedirectUrl({ url });
  } catch (error) {
    const message = error?.errors?.[0]?.message ?? error?.message ?? "";
    if (!/already|taken|exists/i.test(message)) {
      // Non-fatal: localhost redirect may already be allowed by Clerk config.
      console.warn(`launch-qa: redirect URL ${url} not added (${message})`);
    }
  }
}

async function createQaUser(client) {
  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
  const email = `sqc.qa.${stamp}.${crypto.randomBytes(2).toString("hex")}@example.com`;
  const password = `SQC-Qa-${crypto.randomBytes(8).toString("hex")}!1a`;
  const user = await client.users.createUser({
    emailAddress: [email],
    password,
    firstName: "SQC",
    lastName: "QA",
    publicMetadata: {
      runnerDisplayName: "SQC Launch QA",
      lichessUsername: "and72nor",
      chessComUsername: "and72nor",
    },
    skipPasswordChecks: true,
    skipPasswordRequirement: true,
  });

  fs.mkdirSync("tmp", { recursive: true });
  fs.writeFileSync(
    "tmp/sqc-qa-user.json",
    JSON.stringify({ userId: user.id, email, password }, null, 2),
  );

  return { userId: user.id, email };
}

async function main() {
  const baseURL = process.env.SQC_BASE_URL || "http://localhost:3000";
  const envPath = process.env.SQC_ENV_FILE || ".env.local";
  const env = readEnv(envPath);
  if (!env.CLERK_SECRET_KEY) throw new Error(`Missing CLERK_SECRET_KEY in ${envPath}`);
  if (/^https:\/\/(?:www\.)?sidequestchess\.com\b/.test(baseURL) && env.CLERK_SECRET_KEY.startsWith("sk_test_")) {
    throw new Error(
      `Refusing authenticated production QA for ${baseURL} with a Clerk test secret from ${envPath}. ` +
      "Use a local/preview base URL or provide an env file with the matching production Clerk secret.",
    );
  }

  const client = createClerkClient({ secretKey: env.CLERK_SECRET_KEY });
  await ensureRedirectUrl(client, `${baseURL}/`);
  await ensureRedirectUrl(client, `${baseURL}/account`);
  const qa = await createQaUser(client);
  const signInToken = await client.signInTokens.createSignInToken({
    userId: qa.userId,
    expiresInSeconds: 3600,
  });

  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  const results = [];

  async function check(name, fn) {
    try {
      await fn();
      results.push({ name, status: "pass", url: page.url() });
    } catch (error) {
      results.push({ name, status: "fail", error: String(error?.message ?? error), url: page.url() });
    }
  }

  await check("signed-out homepage loads", async () => {
    await page.goto(`${baseURL}/`, { waitUntil: "domcontentloaded" });
    await page.getByRole("heading", { name: /Chess, but with stupidly hard side quests/i }).waitFor();
  });

  await check("sign in QA user with Clerk sign-in token", async () => {
    const ticket = new URL(signInToken.url).search;
    await page.goto(`${baseURL}/sign-in${ticket}`, { waitUntil: "domcontentloaded" });
    await page.waitForURL(/account/, { timeout: 20000 });
    await page.getByText(/SQC Launch QA|and72nor|My Side Quest|Current mission/i).first().waitFor({ timeout: 20000 });
  });

  await check("profile saves public chess usernames", async () => {
    await page.goto(`${baseURL}/profile`, { waitUntil: "domcontentloaded" });
    await page.getByLabel(/display name/i).fill("SQC Launch QA");
    await page.getByLabel(/lichess username/i).fill("and72nor");
    await page.getByLabel(/chess\.com username/i).fill("and72nor");
    await page.getByRole("button", { name: /save profile/i }).click();
    await page.waitForURL(/account/, { timeout: 15000 });
    await page.getByText(/and72nor/i).first().waitFor({ timeout: 15000 });
  });

  await check("Any Game Counts activates and completes from real public username data", async () => {
    await page.goto(`${baseURL}/challenges/finish-any-game`, { waitUntil: "domcontentloaded" });
    const start = page.getByRole("button", { name: /start|activate|check latest|refresh/i }).first();
    await start.waitFor({ timeout: 15000 });
    await start.click();
    await page.waitForTimeout(4500);
    await page.goto(`${baseURL}/result?challenge=finish-any-game`, { waitUntil: "domcontentloaded" });
    await page.getByText(/Quest completed|Coat of arms unlocked|Any Game Counts/i).first().waitFor({ timeout: 20000 });
  });

  await check("multiplayer pages click through while signed in", async () => {
    await page.goto(`${baseURL}/groupquests`, { waitUntil: "domcontentloaded" });
    await page.getByRole("heading", { name: /multiplayer/i }).first().waitFor();
    await page.goto(`${baseURL}/groupquests/public`, { waitUntil: "domcontentloaded" });
    await page.getByText(/Public Multiplayer Side Quests|Open listings/i).first().waitFor();
    await page.goto(`${baseURL}/groupquests/gq_demo_no_castle_01`, { waitUntil: "domcontentloaded" });
    await page.getByText(/No Castle Night/i).first().waitFor();
  });

  await page.screenshot({ path: "tmp/sqc-launch-clickthrough-final.png", fullPage: true });
  await browser.close();

  const report = {
    checkedAt: new Date().toISOString(),
    baseURL,
    qaUserId: qa.userId,
    qaEmail: qa.email,
    results,
    screenshot: "tmp/sqc-launch-clickthrough-final.png",
  };
  console.log(JSON.stringify(report, null, 2));
  if (results.some((result) => result.status === "fail")) process.exit(1);
}

main().catch((error) => {
  console.error(error?.errors ?? error);
  process.exit(1);
});
