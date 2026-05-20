#!/usr/bin/env node
import { SideQuestChessTestClient } from "./index.mjs";

const client = new SideQuestChessTestClient({
  baseUrl: process.env.SQC_BASE_URL,
  authCookie: process.env.SQC_TEST_COOKIE,
});

const checks = [];

checks.push(["mobile bootstrap contract", await client.checkMobileBootstrapContract()]);
checks.push(["completed quest red seal", await client.checkCompletedQuestSeal()]);
checks.push(["public page smoke", await client.smokePublicPages()]);

if (process.env.SQC_TEST_COOKIE) {
  const account = await client.getAccount();
  checks.push(["authenticated account API", {
    status: account.response.status,
    authenticated: account.data?.authenticated,
    activeQuestId: account.data?.activeQuest?.id ?? null,
    completedCount: account.data?.progress?.totalCompletedChallenges ?? null,
  }]);
}

console.log(JSON.stringify({
  ok: true,
  baseUrl: client.baseUrl,
  generatedAt: new Date().toISOString(),
  checks: Object.fromEntries(checks),
}, null, 2));
