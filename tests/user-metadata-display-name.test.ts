import assert from "node:assert/strict";
import test from "node:test";

import {
  getClerkHumanName,
  getPreferredRunnerIdentity,
  getPreferredRunnerName,
  getRunnerDisplayName,
  withPublishedRunnerIdentity,
} from "../src/lib/user-metadata";

test("legacy fallback display names never expose the retired public acronym", () => {
  assert.equal(getRunnerDisplayName({ runnerDisplayName: "SQC player" }), "Quest runner");
  assert.equal(getRunnerDisplayName({ runnerDisplayName: "SQC host" }), "Quest host");
  assert.equal(getRunnerDisplayName({ runnerDisplayName: "SQC" }), "Side Quest Chess");
  assert.equal(getRunnerDisplayName({ runnerDisplayName: "Ada" }), "Ada");
});

test("stored authentication email is never selected as a preferred public name", () => {
  assert.equal(
    getPreferredRunnerName(
      { runnerDisplayName: "private.login@example.test" },
      { firstName: "Ada" },
    ),
    "Ada",
  );
});

test("historically truncated authentication email is never selected as a preferred public name", () => {
  const emailPrefix = "p".repeat(60);
  assert.equal(
    getPreferredRunnerName(
      { runnerDisplayName: emailPrefix },
      { firstName: "Ada", emailAddress: `${emailPrefix}@example.test` },
    ),
    "Ada",
  );
});

test("authentication email is never selected as a public human name", () => {
  assert.equal(getClerkHumanName({ emailAddress: "private.login@example.test" }), "");
});

test("authentication-shaped Clerk name components are excluded before names are combined", () => {
  assert.equal(
    getClerkHumanName({
      firstName: "private.login@example.test",
      lastName: "Smith",
      username: "PublicKnight",
      emailAddress: "private.login@example.test",
    }),
    "Smith",
  );
  assert.equal(
    getPreferredRunnerName({}, {
      firstName: "private.login@example.test",
      lastName: null,
      username: null,
      emailAddress: "private.login@example.test",
    }),
    "",
  );
});

test("historical composite names containing an authentication email are not public identities", () => {
  const historicalName = "private.login@example.test Smith";

  assert.equal(getPreferredRunnerIdentity({ runnerDisplayName: historicalName }, {}), null);
  assert.equal(
    getPreferredRunnerName(
      { runnerDisplayName: historicalName },
      { firstName: "Ada", emailAddress: "private.login@example.test" },
    ),
    "Ada",
  );
});

test("profile publication creates trusted provenance for a maximum-length alias", () => {
  const alias = "a".repeat(60);
  const metadata = withPublishedRunnerIdentity({ runnerBio: "Endgame fan" }, alias);

  assert.deepEqual(metadata.sqcPublicIdentity, {
    v: 1,
    displayName: alias,
    source: "profile-save",
  });
  assert.equal(metadata.runnerDisplayName, alias);
  assert.deepEqual(getPreferredRunnerIdentity(metadata, {}), {
    name: alias,
    provenance: "profile-save",
  });
});

test("unproven legacy maximum-length identity stays neutral after authentication email changes", () => {
  const historicalPrefix = "p".repeat(60);

  assert.deepEqual(
    getPreferredRunnerIdentity(
      { runnerDisplayName: historicalPrefix },
      { firstName: "Ada", emailAddress: "new.login@example.test" },
    ),
    { name: "Ada", provenance: "clerk" },
  );
  assert.equal(
    getPreferredRunnerIdentity({ runnerDisplayName: historicalPrefix }, {}),
    null,
  );
});
