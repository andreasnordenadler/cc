import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("privacy policy describes implemented web and mobile account deletion controls", async () => {
  const source = await readFile(new URL("../src/app/privacy/page.tsx", import.meta.url), "utf8");

  assert.doesNotMatch(source, /does not yet expose self-service account deletion/i);
  assert.match(source, /permanently delete their Side Quest Chess account from My Account on the website or mobile app/i);
  assert.match(source, /removes the Clerk sign-in and account-attached profile, progress, report, and block data/i);
  assert.match(source, /report and block records are not retained in an independent moderation system/i);
  assert.match(source, /Deleting a reported or blocked account does not currently remove references to that account from report and block records held by other users/i);
  assert.match(source, /cleans hosted and participant references from replicated Multiplayer records/i);
  assert.match(source, /If that cleanup cannot finish, Side Quest Chess reports an error instead of deleting the sign-in identity/i);
  assert.match(source, /while keeping the account, account settings require at least one public chess username to remain/i);
  assert.match(source, /Deleting the account removes the account profile instead/i);
});

test("privacy hero keeps the back link and brand kicker on separate readable rows", async () => {
  const css = await readFile(new URL("../src/app/globals.css", import.meta.url), "utf8");

  assert.match(css, /\.privacy-kicker\s*\{[^}]*display:\s*block/);
});
