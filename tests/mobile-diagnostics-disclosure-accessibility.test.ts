import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("native diagnostics disclosure exposes its expanded state", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const modalStart = source.indexOf("function HelpSupportModal");
  const modalEnd = source.indexOf("function CommunityMultiplayerReportModal", modalStart);
  const modal = source.slice(modalStart, modalEnd);

  assert.notEqual(modalStart, -1);
  assert.notEqual(modalEnd, -1);
  assert.match(
    modal,
    /accessibilityLabel=\{diagnosticsOpen \? "Hide app diagnostics" : "Show app diagnostics"\}\s+accessibilityState=\{\{ expanded: diagnosticsOpen \}\}/,
  );
});
