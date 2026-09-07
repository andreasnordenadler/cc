import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { validatePublicProfileText } from "../src/lib/mobile-profile-publication";
import { getPreferredRunnerIdentity } from "../src/lib/user-metadata";
import * as mobileProfileRoute from "../src/app/api/mobile/profile/route";

Object.defineProperty(process.env, "NODE_ENV", {
  value: "test",
  writable: true,
  configurable: true,
  enumerable: true,
});

test("public mobile profiles reject objectionable display names or bios", () => {
  assert.equal(validatePublicProfileText("Friendly Knight", "Enjoying endgames"), null);
  assert.equal(validatePublicProfileText("f.u.c.k", "Enjoying endgames"), "Remove objectionable language before publishing your profile.");
  assert.equal(validatePublicProfileText("Friendly Knight", "s h i t"), "Remove objectionable language before publishing your profile.");
});

test("web profile saves enforce the same public-profile text policy", () => {
  const actionsSource = readFileSync(new URL("../src/app/actions.ts", import.meta.url), "utf8");
  const saveProfileSource = actionsSource.slice(
    actionsSource.indexOf("export async function saveRunnerProfile"),
    actionsSource.indexOf("export async function startChallenge"),
  );

  assert.match(saveProfileSource, /runnerDisplayNameInput = String\([\s\S]*?\.trim\(\)/);
  assert.match(saveProfileSource, /validatePublicProfileText\(runnerDisplayNameInput, runnerBio\)/);
  assert.match(saveProfileSource, /withPublishedRunnerIdentity\([\s\S]*?runnerDisplayNameInput\)/);
  assert.match(saveProfileSource, /throw new Error\(profileTextError\)/);
});

test("authenticated mobile profile save persists readable public identity provenance", async () => {
  const alias = "a".repeat(60);
  let writtenMetadata: Record<string, unknown> | undefined;
  const initialMetadata = { runnerBio: "Old bio", lichessUsername: "PublicPlayer" };
  const response = await mobileProfileRoute.withMobileProfileRouteTestDependencies({
    authenticate: async () => "profile-user",
    getClient: async () => ({ users: {
      getUser: async () => ({ id: "profile-user", publicMetadata: initialMetadata }),
      updateUserMetadata: async (_userId: string, value: { publicMetadata: Record<string, unknown> }) => {
        writtenMetadata = value.publicMetadata;
      },
    } }),
    validateLichess: async (username: string) => ({ ok: true, username }),
    validateChessCom: async (username: string) => ({ ok: true, username }),
    refreshRatings: async (metadata: Record<string, unknown>) => ({ metadata }),
  } as never, () => mobileProfileRoute.PATCH(new Request("https://sqc.test/api/mobile/profile", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      runnerDisplayName: alias,
      runnerBio: "Endgame fan",
      lichessUsername: "PublicPlayer",
      chessComUsername: "",
    }),
  })));

  assert.equal(response.status, 200);
  assert.ok(writtenMetadata);
  assert.deepEqual(getPreferredRunnerIdentity(writtenMetadata, {}), {
    name: alias,
    provenance: "profile-save",
  });
  assert.deepEqual(writtenMetadata.sqcPublicIdentity, {
    v: 1,
    displayName: alias,
    source: "profile-save",
  });
});

test("mobile profile rejects a long authentication email before truncating the public name", async () => {
  const loginEmail = `${"p".repeat(60)}@private.example.test`;
  let writes = 0;
  const response = await mobileProfileRoute.withMobileProfileRouteTestDependencies({
    authenticate: async () => "profile-user",
    getClient: async () => ({ users: {
      getUser: async () => ({ id: "profile-user", publicMetadata: {} }),
      updateUserMetadata: async () => { writes += 1; },
    } }),
    validateLichess: async (username: string) => ({ ok: true, username }),
    validateChessCom: async (username: string) => ({ ok: true, username }),
    refreshRatings: async (metadata: Record<string, unknown>) => ({ metadata }),
  } as never, () => mobileProfileRoute.PATCH(new Request("https://sqc.test/api/mobile/profile", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      runnerDisplayName: loginEmail,
      lichessUsername: "PublicPlayer",
      chessComUsername: "",
    }),
  })));

  assert.equal(response.status, 422);
  assert.equal(writes, 0);
  assert.equal(JSON.stringify(await response.json()).includes(loginEmail), false);
});

test("clearing a mobile profile alias removes deep-merged publication provenance", async () => {
  const publicMetadata: Record<string, unknown> = {
    runnerDisplayName: "Old Alias",
    sqcPublicIdentity: { v: 1, displayName: "Old Alias", source: "profile-save" },
    lichessUsername: "PublicPlayer",
  };
  const response = await mobileProfileRoute.withMobileProfileRouteTestDependencies({
    authenticate: async () => "profile-user",
    getClient: async () => ({ users: {
      getUser: async () => ({ id: "profile-user", publicMetadata }),
      updateUserMetadata: async (_userId: string, value: { publicMetadata: Record<string, unknown> }) => {
        for (const [key, entry] of Object.entries(value.publicMetadata)) {
          if (entry === null) delete publicMetadata[key];
          else publicMetadata[key] = entry;
        }
      },
    } }),
    validateLichess: async (username: string) => ({ ok: true, username }),
    validateChessCom: async (username: string) => ({ ok: true, username }),
    refreshRatings: async (metadata: Record<string, unknown>) => ({ metadata }),
  } as never, () => mobileProfileRoute.PATCH(new Request("https://sqc.test/api/mobile/profile", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ runnerDisplayName: "", lichessUsername: "PublicPlayer", chessComUsername: "" }),
  })));

  assert.equal(response.status, 200);
  assert.equal(publicMetadata.runnerDisplayName, "");
  assert.equal(publicMetadata.sqcPublicIdentity, undefined);
  assert.equal(getPreferredRunnerIdentity(publicMetadata, {}), null);
});
