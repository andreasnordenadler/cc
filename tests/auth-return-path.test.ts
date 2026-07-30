import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { buildSignInHref, safeAuthReturnPath } from "../src/lib/auth-return-path";

test("direct sign-in falls back to home instead of the account screen", () => {
  assert.equal(safeAuthReturnPath(undefined), "/");
  assert.equal(safeAuthReturnPath("https://example.com/steal"), "/");
  assert.equal(safeAuthReturnPath("//example.com/steal"), "/");
});

test("sign-in links preserve the page and query the user came from", () => {
  assert.equal(buildSignInHref("/side-quests?tab=community"), "/sign-in?redirect_url=%2Fside-quests%3Ftab%3Dcommunity");
  assert.equal(buildSignInHref("/groupquests/community%2Ftable"), "/sign-in?redirect_url=%2Fgroupquests%2Fcommunity%252Ftable");
});

test("auth pages never redirect back into the auth flow", () => {
  assert.equal(buildSignInHref("/sign-in"), "/sign-in?redirect_url=%2F");
  assert.equal(buildSignInHref("/sign-up?redirect_url=%2Faccount"), "/sign-in?redirect_url=%2F");
});

test("shared sign-in controls capture the current page before entering Clerk", () => {
  const linkSource = readFileSync(new URL("../src/components/current-page-sign-in-link.tsx", import.meta.url), "utf8");
  const shellSource = readFileSync(new URL("../src/components/mobile-app-web-shell.tsx", import.meta.url), "utf8");
  const signInPage = readFileSync(new URL("../src/app/sign-in/[[...sign-in]]/page.tsx", import.meta.url), "utf8");
  const signUpPage = readFileSync(new URL("../src/app/sign-up/[[...sign-up]]/page.tsx", import.meta.url), "utf8");

  assert.match(linkSource, /usePathname\(\)/);
  assert.match(linkSource, /window\.location\.search/);
  assert.ok((shellSource.match(/<CurrentPageSignInLink/g) ?? []).length >= 3);
  assert.doesNotMatch(shellSource, /href=\{signedIn \? "\/account" : "\/sign-in"\}/);
  assert.match(signInPage, /safeAuthReturnPath/);
  assert.match(signUpPage, /safeAuthReturnPath/);
  assert.doesNotMatch(signInPage + signUpPage, /return "\/account"/);
});
