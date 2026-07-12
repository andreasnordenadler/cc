import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  buildCustomCreatePayload,
  buildMultiplayerCreatePayload,
  getCreateErrorMessage,
  getCustomCreateDestination,
  getMultiplayerCreateDestination,
  getMultiplayerLocalDateTimeDefaults,
} from "../src/lib/mobile-create-forms";

const root = new URL("../", import.meta.url);
const source = (path: string) => readFile(new URL(path, root), "utf8");

test("custom creator builds a launch-ready rule without accepting owner identity", () => {
  const payload = buildCustomCreatePayload({
    title: "  No Castle Night  ",
    summary: "  Win without castling. ",
    template: "no-castle",
    visibility: "public",
    lifecycle: "published",
  });
  assert.equal(payload.title, "No Castle Night");
  assert.equal(payload.summary, "Win without castling.");
  assert.equal(payload.visibility, "public");
  assert.deepEqual(JSON.parse(payload.config), {
    version: 2,
    logic: "all",
    blocks: [
      { type: "gameResult", result: "win" },
      { type: "pieceState", piece: "king", owner: "my", condition: "not moved" },
    ],
  });
  assert.equal("userId" in payload, false);
  assert.equal("ownerId" in payload, false);
});

test("custom creator rejects missing title and condition", () => {
  assert.throws(() => buildCustomCreatePayload({ title: "", summary: "", template: "", visibility: "private", lifecycle: "published" }), /name/i);
  assert.throws(() => buildCustomCreatePayload({ title: "Named", summary: "", template: "", visibility: "private", lifecycle: "published" }), /condition/i);
});

test("custom success navigates to the owned custom catalog", () => {
  assert.equal(getCustomCreateDestination({ ok: true, customQuest: { id: "custom-safe" } }), "/custom-side-quests?saved=custom-safe");
  assert.equal(getCustomCreateDestination({ ok: true, customQuest: { id: "../escape" } }), null);
});

test("multiplayer creator validates and sends supported fields without client identity", () => {
  const payload = buildMultiplayerCreatePayload({
    name: "Friday Knights",
    inviteCopy: "Play together",
    inviteMode: "private-key",
    inviteKey: "friday-123",
    questIds: ["finish-any-game"],
    providerMode: "lichess",
    startAt: "2026-07-12T12:00:00.000Z",
    endAt: "2026-07-19T12:00:00.000Z",
    rules: { timeControl: "Rapid 10+0", rated: "Rated only", color: "Any color" },
  });
  assert.equal(payload.name, "Friday Knights");
  assert.deepEqual(payload.questIds, ["finish-any-game"]);
  assert.equal(payload.inviteKey, "friday-123");
  assert.equal("hostUserId" in payload, false);
  assert.equal("userId" in payload, false);
  assert.equal("username" in payload, false);
});

test("multiplayer creator rejects malformed fields", () => {
  const base = { name: "Quest", inviteCopy: "", inviteMode: "public", questIds: ["finish-any-game"], providerMode: "both", startAt: "2026-07-12T12:00:00.000Z", endAt: "2026-07-19T12:00:00.000Z", rules: {} };
  assert.throws(() => buildMultiplayerCreatePayload({ ...base, questIds: [] }), /at least one/i);
  assert.throws(() => buildMultiplayerCreatePayload({ ...base, endAt: "2026-07-01T12:00:00.000Z" }), /after/i);
  assert.throws(() => buildMultiplayerCreatePayload({ ...base, inviteMode: "private-key", inviteKey: "" }), /invite code/i);
});

test("multiplayer datetime defaults derive from one stable server timestamp", () => {
  const defaults = getMultiplayerLocalDateTimeDefaults("2026-07-12T23:58:42.000Z");
  assert.equal(defaults.startAt.length, 16);
  assert.equal(defaults.endAt.length, 16);
  assert.equal(new Date(defaults.endAt).getTime() - new Date(defaults.startAt).getTime(), 7 * 24 * 60 * 60 * 1000);
  assert.equal(defaults.startAt.endsWith(":58"), true);
});

test("multiplayer success accepts only exact created-detail navigation", () => {
  assert.equal(getMultiplayerCreateDestination({ ok: true, id: "gq-safe", href: "/groupquests/gq-safe?accepted=1" }), "/groupquests/gq-safe?accepted=1");
  assert.equal(getMultiplayerCreateDestination({ ok: true, id: "gq-safe", href: "/groupquests/other" }), null);
  assert.equal(getMultiplayerCreateDestination({ ok: true, id: "gq-safe", href: "https://evil.test/groupquests/gq-safe" }), null);
});

test("server failures expose safe messages and signed-out guidance", () => {
  assert.equal(getCreateErrorMessage(401, { error: "sign_in_required" }), "Sign in to create a Side Quest.");
  assert.equal(getCreateErrorMessage(500, { error: "database password leaked" }), "Could not create this Side Quest right now. Please try again.");
  assert.equal(getCreateErrorMessage(400, { message: "Add at least one saved condition before saving." }), "Add at least one saved condition before saving.");
});

test("mobile create screens use executable forms and never submit identity fields", async () => {
  const [shell, customForm, multiplayerForm] = await Promise.all([
    source("src/components/mobile-app-web-shell.tsx"),
    source("src/components/mobile-custom-create-form.tsx"),
    source("src/components/mobile-multiplayer-create-form.tsx"),
  ]);
  assert.match(shell, /MobileCustomCreateForm/);
  assert.match(shell, /MobileMultiplayerCreateForm/);
  assert.match(customForm, /fetch\("\/api\/mobile\/custom-quests"/);
  assert.match(multiplayerForm, /fetch\("\/api\/groupquests"/);
  assert.doesNotMatch(`${customForm}\n${multiplayerForm}`, /hostUserId|ownerId|userId\s*:/);
  assert.doesNotMatch(shell, /<input readOnly value="" placeholder="Name this custom Side Quest"/);
  assert.doesNotMatch(shell, /<Link href="\/multiplayer" className="sqc-create-footer-button">Create<\/Link>/);
});
