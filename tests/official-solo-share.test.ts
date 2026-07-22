import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import OfficialSoloShareControls from "../src/components/official-solo-share-controls";
import {
  buildOfficialSoloSharePayload,
  shareOfficialSoloQuest,
} from "../src/lib/official-solo-share";

test("Official Solo sharing targets the exact public detail and opens native sharing", async () => {
  const shared: unknown[] = [];
  const payload = buildOfficialSoloSharePayload({
    id: "quest/42",
    title: "Ada's Fork",
    origin: "https://sidequestchess.com/ignored/path",
  });

  const result = await shareOfficialSoloQuest(payload, {
    share: async (value) => { shared.push(value); },
  });

  assert.deepEqual(payload, {
    title: "Side Quest Chess: Ada's Fork",
    text: "Try “Ada's Fork” in Side Quest Chess.",
    url: "https://sidequestchess.com/challenges/quest%2F42",
  });
  assert.deepEqual(shared, [payload]);
  assert.deepEqual(result, { kind: "shared", message: "Side Quest share sheet opened." });
});

test("Official Solo sharing copies the exact public link when native sharing is unavailable", async () => {
  const copied: string[] = [];
  const payload = buildOfficialSoloSharePayload({
    id: "finish-any-game",
    title: "Finish Any Game",
    origin: "https://sidequestchess.com",
  });

  const result = await shareOfficialSoloQuest(payload, {
    clipboard: { writeText: async (value) => { copied.push(value); } },
  });

  assert.deepEqual(copied, ["https://sidequestchess.com/challenges/finish-any-game"]);
  assert.deepEqual(result, { kind: "copied", message: "Public link copied." });
});

test("Official Solo sharing reports cancellation and browser failures without leaking details", async () => {
  const payload = buildOfficialSoloSharePayload({ id: "finish-any-game", title: "Finish Any Game", origin: "https://sidequestchess.com" });
  const cancellation = new Error("private browser detail");
  cancellation.name = "AbortError";

  assert.deepEqual(
    await shareOfficialSoloQuest(payload, { share: async () => { throw cancellation; } }),
    { kind: "cancelled", message: "Sharing cancelled." },
  );
  assert.deepEqual(
    await shareOfficialSoloQuest(payload, { share: async () => { throw new Error("private browser detail"); } }),
    { kind: "error", message: "Could not open sharing here. Copy the public link instead." },
  );
  assert.deepEqual(
    await shareOfficialSoloQuest(payload, { clipboard: { writeText: async () => { throw new Error("permission detail"); } } }),
    { kind: "error", message: "Could not copy the public link. Try again." },
  );
});

test("Official Solo detail renders real share and copy controls instead of a current-page link", () => {
  const html = renderToStaticMarkup(React.createElement(OfficialSoloShareControls, {
    id: "quest/42",
    title: "Ada's Fork",
  }));

  assert.match(html, /<button[^>]*aria-label="Share Solo Side Quest public link"[^>]*>Share public link<\/button>/);
  assert.match(html, /<button[^>]*aria-label="Copy Solo Side Quest public link"[^>]*>Copy public link<\/button>/);
  assert.doesNotMatch(html, /<a[^>]*>Share public link<\/a>/);
});

test("Official Solo detail route uses the share controls instead of linking to itself", async () => {
  const source = await import("node:fs/promises").then((fs) => fs.readFile(new URL("../src/app/challenges/[id]/page.tsx", import.meta.url), "utf8"));

  assert.match(source, /import OfficialSoloShareControls from "@\/components\/official-solo-share-controls"/);
  assert.match(source, /<OfficialSoloShareControls id=\{challenge\.id\} title=\{challenge\.title\} \/>/);
  assert.doesNotMatch(source, /<Link href=\{`\/challenges\/\$\{challenge\.id\}`\}[^>]*>Share public link<\/Link>/);
});
