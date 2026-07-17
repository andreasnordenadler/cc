import assert from "node:assert/strict";
import test from "node:test";

import {
  buildCommunitySoloSharePayload,
  shareCommunitySoloQuest,
} from "../src/lib/community-solo-share";

test("Community Solo sharing targets the exact public detail and uses native sharing", async () => {
  const shared: unknown[] = [];
  const payload = buildCommunitySoloSharePayload({
    id: "quest/42",
    title: "Ada's Fork",
    origin: "https://sidequestchess.com/ignored/path",
  });

  const result = await shareCommunitySoloQuest(payload, {
    share: async (value) => { shared.push(value); },
  });

  assert.deepEqual(payload, {
    title: "Ada's Fork",
    text: "Try “Ada's Fork” on Side Quest Chess.",
    url: "https://sidequestchess.com/challenges/community/quest%2F42",
  });
  assert.deepEqual(shared, [payload]);
  assert.deepEqual(result, { kind: "shared", message: "Side Quest shared." });
});

test("Community Solo sharing copies the exact public link when native sharing is unavailable", async () => {
  const copied: string[] = [];
  const payload = buildCommunitySoloSharePayload({
    id: "community-quest",
    title: "Knight Tour",
    origin: "https://sidequestchess.com",
  });

  const result = await shareCommunitySoloQuest(payload, {
    clipboard: { writeText: async (value) => { copied.push(value); } },
  });

  assert.deepEqual(copied, ["https://sidequestchess.com/challenges/community/community-quest"]);
  assert.deepEqual(result, { kind: "copied", message: "Public link copied." });
});

test("Community Solo sharing reports cancellation separately from safe failures", async () => {
  const payload = buildCommunitySoloSharePayload({ id: "community-quest", title: "Knight Tour", origin: "https://sidequestchess.com" });
  const cancellation = new Error("browser detail");
  cancellation.name = "AbortError";

  assert.deepEqual(
    await shareCommunitySoloQuest(payload, { share: async () => { throw cancellation; } }),
    { kind: "cancelled", message: "Sharing cancelled." },
  );
  assert.deepEqual(
    await shareCommunitySoloQuest(payload, { share: async () => { throw new Error("private browser detail"); } }),
    { kind: "error", message: "Could not open sharing. Copy the public link instead." },
  );
  assert.deepEqual(
    await shareCommunitySoloQuest(payload, { clipboard: { writeText: async () => { throw new Error("permission detail"); } } }),
    { kind: "error", message: "Could not copy the public link. Try again." },
  );
});
