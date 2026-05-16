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
      console.warn(`multiplayer-qa: redirect URL ${url} not added (${message})`);
    }
  }
}

async function createQaUser(client, prefix) {
  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
  const email = `sqc.${prefix}.${stamp}.${crypto.randomBytes(2).toString("hex")}@example.com`;
  const user = await client.users.createUser({
    emailAddress: [email],
    password: `SQC-Qa-${crypto.randomBytes(8).toString("hex")}!1a`,
    firstName: prefix === "host" ? "Host" : "Guest",
    lastName: "QA",
    publicMetadata: {
      runnerDisplayName: prefix === "host" ? "Host QA" : "Guest QA",
      lichessUsername: "and72nor",
      chessComUsername: "and72nor",
    },
    skipPasswordChecks: true,
    skipPasswordRequirement: true,
  });
  return { userId: user.id, email };
}

async function signInPage(browser, baseURL, tokenUrl) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const ticket = new URL(tokenUrl).search;
  await page.goto(`${baseURL}/sign-in${ticket}`, { waitUntil: "domcontentloaded" });
  await page.waitForURL(/account/, { timeout: 20000 });
  return page;
}

async function main() {
  const baseURL = process.env.SQC_BASE_URL || "http://localhost:3000";
  const envPath = process.env.SQC_ENV_FILE || ".env.local";
  const env = readEnv(envPath);
  if (!env.CLERK_SECRET_KEY) throw new Error(`Missing CLERK_SECRET_KEY in ${envPath}`);

  const client = createClerkClient({ secretKey: env.CLERK_SECRET_KEY });
  await ensureRedirectUrl(client, `${baseURL}/`);
  await ensureRedirectUrl(client, `${baseURL}/account`);

  const host = await createQaUser(client, "host");
  const guest = await createQaUser(client, "guest");
  const hostToken = await client.signInTokens.createSignInToken({ userId: host.userId, expiresInSeconds: 3600 });
  const guestToken = await client.signInTokens.createSignInToken({ userId: guest.userId, expiresInSeconds: 3600 });

  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  });
  const hostPage = await signInPage(browser, baseURL, hostToken.url);
  const guestPage = await signInPage(browser, baseURL, guestToken.url);
  const results = [];

  async function check(name, fn) {
    try {
      await fn();
      results.push({ name, status: "pass" });
    } catch (error) {
      results.push({ name, status: "fail", error: String(error?.message ?? error) });
    }
  }

  let questId = null;
  let acceptedHref = null;

  await check("host creates multiplayer quest via authenticated API", async () => {
    const payload = {
      name: `Server Invite QA ${Date.now()}`,
      inviteMode: "public",
      questIds: ["finish-any-game", "knights-before-coffee"],
      providerMode: "lichess",
      providerLabel: "Lichess only",
      startAt: new Date(Date.now() - 60_000).toISOString(),
      endAt: new Date(Date.now() + 86_400_000).toISOString(),
      rules: { timeControl: "Any time control", rated: "Any rated state", color: "Any color" },
    };
    const response = await hostPage.evaluate(async ({ payload }) => {
      const res = await fetch("/api/groupquests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return { status: res.status, body: await res.json() };
    }, { payload });
    if (response.status !== 200 || !response.body?.id) throw new Error(JSON.stringify(response));
    questId = response.body.id;
  });

  await check("host sees quest on /groupquests /account and home", async () => {
    for (const path of ["/groupquests", "/account", "/"]) {
      await hostPage.goto(`${baseURL}${path}`, { waitUntil: "domcontentloaded" });
      await hostPage.getByText(questId, { exact: false }).first().waitFor({ timeout: 15000 }).catch(() => null);
      await hostPage.getByText(/Server Invite QA/i).first().waitFor({ timeout: 15000 });
    }
  });

  await check("guest sees public quest with share actions", async () => {
    await guestPage.goto(`${baseURL}/groupquests/${questId}`, { waitUntil: "domcontentloaded" });
    await guestPage.getByRole("button", { name: /share quest/i }).waitFor({ timeout: 15000 });
    await guestPage.getByRole("button", { name: /copy link/i }).waitFor({ timeout: 15000 });
  });

  await check("guest joins quest via authenticated API", async () => {
    const response = await guestPage.evaluate(async ({ questId }) => {
      const res = await fetch(`/api/groupquests/${questId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: "lichess", username: "and72nor", leaderboardName: "Guest QA" }),
      });
      return { status: res.status, body: await res.json() };
    }, { questId });
    if (response.status !== 200 || !response.body?.href) throw new Error(JSON.stringify(response));
    acceptedHref = response.body.href;
  });

  await check("guest accepted page and refresh checks work", async () => {
    await guestPage.goto(`${baseURL}${acceptedHref}`, { waitUntil: "domcontentloaded" });
    await guestPage.getByText(/Guest QA/i).first().waitFor({ timeout: 15000 });
    const refresh = guestPage.getByRole("button", { name: /refresh checks/i }).first();
    await refresh.click();
    await guestPage.getByText(/Side Quests verified|Join this Multiplayer Side Quest before refreshing checks|Sign in to refresh/i).first().waitFor({ timeout: 15000 });
  });

  await check("guest sees joined quest on /groupquests /account and home", async () => {
    for (const path of ["/groupquests", "/account", "/"]) {
      await guestPage.goto(`${baseURL}${path}`, { waitUntil: "domcontentloaded" });
      await guestPage.getByText(/Server Invite QA/i).first().waitFor({ timeout: 15000 });
    }
  });

  await check("guest can leave quest server-side", async () => {
    await guestPage.goto(`${baseURL}${acceptedHref}`, { waitUntil: "domcontentloaded" });
    guestPage.once("dialog", (dialog) => dialog.accept());
    await guestPage.getByRole("button", { name: /leave quest/i }).click();
    await guestPage.waitForURL(new RegExp(`/groupquests/${questId}$`), { timeout: 15000 });
    await guestPage.goto(`${baseURL}/account`, { waitUntil: "domcontentloaded" });
    await guestPage.getByText(/Server Invite QA/i).first().waitFor({ timeout: 4000 }).then(
      () => { throw new Error("quest still visible after leave on account page"); },
      () => {},
    );
  });

  fs.mkdirSync("tmp", { recursive: true });
  await hostPage.screenshot({ path: "tmp/sqc-multiplayer-host.png", fullPage: true });
  await guestPage.screenshot({ path: "tmp/sqc-multiplayer-guest.png", fullPage: true });
  await browser.close();

  const report = { checkedAt: new Date().toISOString(), baseURL, questId, results };
  console.log(JSON.stringify(report, null, 2));
  if (results.some((result) => result.status === "fail")) process.exit(1);
}

main().catch((error) => {
  console.error(error?.errors ?? error);
  process.exit(1);
});
