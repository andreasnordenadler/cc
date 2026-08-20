import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const appPath = new URL("../apps/mobile/App.tsx", import.meta.url);

test("enumerated compact native controls retain at least 44-point source-defined sizes", async () => {
  const source = await readFile(appPath, "utf8");

  for (const styleName of [
    "celebrationCloseButton",
    "homeMenuButton",
    "homeMenuItem",
    "headerIconButton",
    "communitySubTab",
    "communityChip",
    "communitySortCompact",
    "fixedScreenCloseLayer",
    "detailCloseButton",
    "createClearSelectionButton",
    "createSelectedRemoveIcon",
    "createFilterChip",
    "conditionCompactAction",
    "screenCloseButton",
    "floatingScreenCloseButton",
    "multiplayerLobbyTab",
    "browseFilterChip",
    "passwordAuthModeButton",
    "dateTimeChip",
  ]) {
    const style = source.match(new RegExp(`\\n  ${styleName}: \\{([^\\n]+)\\}`))?.[1];
    assert.ok(style, `Expected ${styleName} style to exist`);

    const width = style.match(/\bwidth: (\d+)/)?.[1];
    const height = style.match(/\bheight: (\d+)/)?.[1];
    const minHeight = style.match(/\bminHeight: (\d+)/)?.[1];

    if (width) assert.ok(Number(width) >= 44, `${styleName} width must be at least 44`);
    assert.ok(Number(height ?? minHeight ?? 0) >= 44, `${styleName} height must be at least 44`);
  }
});