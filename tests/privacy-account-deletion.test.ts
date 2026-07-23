import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("privacy launch draft describes the implemented web and Android account deletion controls", async () => {
  const source = await readFile(new URL("../src/app/privacy/page.tsx", import.meta.url), "utf8");

  assert.doesNotMatch(source, /does not yet expose self-service account deletion/i);
  assert.match(source, /permanently delete their SQC account from My Account on the website or mobile app/i);
  assert.match(source, /removes the Clerk sign-in and account-attached profile and progress data/i);
  assert.match(source, /cleans hosted and participant references from replicated Multiplayer records/i);
  assert.match(source, /If that cleanup cannot finish, SQC reports an error instead of deleting the sign-in identity/i);
  assert.match(source, /while keeping the account, account settings require at least one public chess username to remain/i);
  assert.match(source, /Deleting the account removes the account profile instead/i);
});

test("privacy hero keeps the back link and brand kicker on separate readable rows", async () => {
  const css = await readFile(new URL("../src/app/globals.css", import.meta.url), "utf8");

  assert.match(css, /\.privacy-kicker\s*\{[^}]*display:\s*block/);
});
