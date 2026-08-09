import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("privacy launch draft describes the implemented web and Android account deletion controls", async () => {
  const source = await readFile(new URL("../src/app/privacy/page.tsx", import.meta.url), "utf8");

  assert.doesNotMatch(source, /does not yet expose self-service account deletion/i);
  assert.match(source, /permanently delete their Side Quest Chess account from My Account on the website or mobile app/i);
  assert.match(source, /removes the Clerk sign-in and account-attached profile and progress data/i);
  assert.match(source, /cleans hosted and participant references from replicated Multiplayer records/i);
  assert.match(source, /If that cleanup cannot finish, Side Quest Chess reports an error instead of deleting the sign-in identity/i);
  assert.match(source, /while keeping the account, account settings require at least one public chess username to remain/i);
  assert.match(source, /Deleting the account removes the account profile instead/i);
});

test("account deletion copy distinguishes deleted account data from persistent public proofs", async () => {
  const privacySource = await readFile(new URL("../src/app/privacy/page.tsx", import.meta.url), "utf8");
  const mobileSource = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const webSource = await readFile(new URL("../src/components/delete-account-control.tsx", import.meta.url), "utf8");

  assert.doesNotMatch(mobileSource, /delete your (?:SQC|Side Quest Chess) account, profile, progress, proofs, and Clerk sign-in/i);
  assert.doesNotMatch(mobileSource, /account and saved data were permanently deleted/i);
  assert.match(mobileSource, /account and account-attached data were permanently deleted/i);
  assert.match(mobileSource, /Previously shared public proof links are not revoked/i);
  assert.doesNotMatch(webSource, /deletes your (?:SQC|Side Quest Chess) profile, progress, proofs, custom Side Quests/i);
  assert.match(webSource, /Previously shared public proof links are not revoked/i);
  assert.match(privacySource, /const LAST_UPDATED = "July 30, 2026"/i);
  assert.match(privacySource, /Public proof links already shared can remain readable independently of the deleted account/i);
  assert.match(privacySource, /Deleting an account does not revoke those links or remove the underlying public game from Lichess or Chess\.com/i);
});

test("privacy hero keeps the back link and brand kicker on separate readable rows", async () => {
  const css = await readFile(new URL("../src/app/globals.css", import.meta.url), "utf8");

  assert.match(css, /\.privacy-kicker\s*\{[^}]*display:\s*block/);
});
