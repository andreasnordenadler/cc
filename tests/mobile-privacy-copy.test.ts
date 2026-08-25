import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const appSource = readFileSync(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
const mobileWebShellSource = readFileSync(new URL("../src/components/mobile-app-web-shell.tsx", import.meta.url), "utf8");

test("mobile privacy copy does not imply that chess usernames are the only data Side Quest Chess requests or stores", () => {
  assert.doesNotMatch(appSource, /only asks for public chess usernames/i);
  assert.doesNotMatch(appSource, /stores the minimum needed to remember your quests, proof, and Coat of Arms progress/i);
  assert.match(appSource, /never asks for your Lichess or Chess\.com password/i);
  assert.match(appSource, /account and app data described in the Privacy Policy/i);
});

test("the mobile-linked support page does not imply that chess usernames are the only requested data", () => {
  assert.doesNotMatch(mobileWebShellSource, /only asks for public chess usernames/i);
  assert.match(mobileWebShellSource, /never asks for your Lichess or Chess\.com password/i);
  assert.match(mobileWebShellSource, /Privacy Policy explains the account and app data/i);
});
