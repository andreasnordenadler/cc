import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("../src/app/admin/analytics/page.tsx", import.meta.url), "utf8");

test("admin analytics remains a private dashboard instead of redirecting away", () => {
  assert.doesNotMatch(source, /redirect\(["']\/account["']\)/);
  assert.match(source, /currentUser\(\)/);
  assert.match(source, /isAdminAnalyticsViewer\(viewer\)/);
  assert.match(source, /isAllowedAdminEmail\(claimEmail\)/);
  assert.match(source, /Admin access needed\./);
});

test("admin analytics loads every Clerk user page", () => {
  assert.match(source, /getUserList\(\{ limit: 100, offset: 0/);
  assert.match(source, /for \(let offset = users\.length; ; offset \+= 100\)/);
  assert.match(source, /if \(page\.data\.length < 100\) break/);
});

test("admin analytics presents an honest three-month usage summary", () => {
  assert.match(source, /setUTCMonth\(windowStart\.getUTCMonth\(\) - 3\)/);
  assert.match(source, /New accounts/);
  assert.match(source, /Tracked active users/);
  assert.match(source, /Quest starts \(min\.\)/);
  assert.match(source, /latest 12 detailed events/);
});
