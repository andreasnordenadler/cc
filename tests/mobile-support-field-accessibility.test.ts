import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("native support message field exposes an explicit screen-reader label", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const modalStart = source.indexOf("function HelpSupportModal");
  const modalEnd = source.indexOf("function CommunityMultiplayerReportModal", modalStart);
  const modal = source.slice(modalStart, modalEnd);

  assert.notEqual(modalStart, -1);
  assert.notEqual(modalEnd, -1);
  assert.match(modal, /<TextInput\s+accessibilityLabel="Support message"[^>]*?value=\{supportMessage\}[^>]*?>/);
});
