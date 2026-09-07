import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { compactAnalyticsStore, getAnalyticsStore, normalizeAnalyticsEvent, sanitizeAnalyticsPath } from "../src/lib/analytics";

test("historical analytics stores sanitize proof paths when read", () => {
  const token = "PRIVATE_TOKEN";
  const store = getAnalyticsStore({
    sqcAnalytics: {
      totalEvents: 1,
      recentEvents: [{ type: "page_view", at: "2026-09-06T00:00:00.000Z", path: `/proof/${token}` }],
    },
  });

  assert.equal(store.recentEvents?.[0]?.path, "/proof/[token]");
  assert.equal(JSON.stringify(store).includes(token), false);
});

test("historical analytics reads redact backslash-authority proof routes", () => {
  const token = "PRIVATE_TOKEN";
  const path = `%5C%5Cx.test%5Cproof%5C${token}%5C..%5C..%5Cside-quests`;
  const store = getAnalyticsStore({
    sqcAnalytics: {
      recentEvents: [{ type: "page_view", at: "2026-09-07T00:00:00.000Z", path }],
    },
  });

  assert.equal(store.recentEvents?.[0]?.path, "/proof/[token]");
  assert.equal(JSON.stringify(store).includes(token), false);
});

test("historical analytics reads drop URL-control proof routes", () => {
  const token = "PRIVATE_TOKEN";
  const path = `\u0000/proof/${token}/../../side-quests`;
  const store = getAnalyticsStore({
    sqcAnalytics: {
      recentEvents: [{ type: "page_view", at: "2026-09-07T00:00:00.000Z", path }],
    },
  });

  assert.equal(store.recentEvents?.[0]?.path, undefined);
  assert.equal(JSON.stringify(store).includes(token), false);
});

test("analytics compaction sanitizes historical proof paths before rewrite", () => {
  const token = "PRIVATE_TOKEN";
  const store = compactAnalyticsStore({
    recentEvents: [{ type: "page_view", at: "2026-09-06T00:00:00.000Z", path: `/proof/${token}` }],
  });

  assert.equal(store.recentEvents?.[0]?.path, "/proof/[token]");
  assert.equal(JSON.stringify(store).includes(token), false);
});

test("analytics compaction redacts backslash-authority proof routes", () => {
  const token = "PRIVATE_TOKEN";
  const path = `\\\\x.test\\proof\\${token}\\..\\..\\side-quests`;
  const store = compactAnalyticsStore({
    recentEvents: [{ type: "page_view", at: "2026-09-07T00:00:00.000Z", path }],
  });

  assert.equal(store.recentEvents?.[0]?.path, "/proof/[token]");
  assert.equal(JSON.stringify(store).includes(token), false);
});

test("analytics compaction drops URL-control proof routes", () => {
  const token = "PRIVATE_TOKEN";
  const path = `\u0000/proof/${token}/../../side-quests`;
  const store = compactAnalyticsStore({
    recentEvents: [{ type: "page_view", at: "2026-09-07T00:00:00.000Z", path }],
  });

  assert.equal(store.recentEvents?.[0]?.path, undefined);
  assert.equal(JSON.stringify(store).includes(token), false);
});

test("analytics never transmits or records public proof tokens", () => {
  const token = "signed-token-containing-private-identity";
  const proofPath = `/proof/${token}?shared=1`;
  assert.equal(sanitizeAnalyticsPath(proofPath), "/proof/[token]");

  const event = normalizeAnalyticsEvent({
    type: "page_view",
    path: proofPath,
  });

  assert.equal(event?.path, "/proof/[token]");
  assert.equal(JSON.stringify(event).includes(token), false);
});

test("repeated proof separators never expose tokens to analytics entry points", () => {
  const token = "PRIVATE_TOKEN";
  const path = `/proof//${token}`;
  const nested = `/sign-in?redirect_url=${encodeURIComponent(path)}`;
  const event = normalizeAnalyticsEvent({ type: "page_view", path });
  const historical = getAnalyticsStore({
    sqcAnalytics: { recentEvents: [{ type: "page_view", at: "2026-09-07T00:00:00.000Z", path }] },
  });
  const compacted = compactAnalyticsStore({
    recentEvents: [{ type: "page_view", at: "2026-09-07T00:00:00.000Z", path }],
  });

  assert.deepEqual(
    [
      sanitizeAnalyticsPath(path),
      sanitizeAnalyticsPath(nested),
      event?.path,
      historical.recentEvents?.[0]?.path,
      compacted.recentEvents?.[0]?.path,
    ],
    [
      "/proof/[token]",
      "/sign-in?redirect_url=%2Fproof%2F%5Btoken%5D",
      "/proof/[token]",
      "/proof/[token]",
      "/proof/[token]",
    ],
  );
  assert.equal(JSON.stringify({ event, historical, compacted }).includes(token), false);
});

test("analytics removes a proof token from a direct sign-in return path", () => {
  const token = "signed-token-containing-private-identity";
  const path = `/sign-in?redirect_url=/proof/${token}`;

  const sanitized = sanitizeAnalyticsPath(path);

  assert.equal(sanitized, "/sign-in?redirect_url=%2Fproof%2F%5Btoken%5D");
  assert.equal(sanitized?.includes(token), false);
});

test("analytics removes a proof token from an encoded sign-up return path", () => {
  const token = "signed-token-containing-private-identity";
  const returnPath = encodeURIComponent(`/proof/${token}?shared=1`);
  const path = `/sign-up?redirect_url=${returnPath}`;

  const sanitized = sanitizeAnalyticsPath(path);

  assert.equal(sanitized, "/sign-up?redirect_url=%2Fproof%2F%5Btoken%5D");
  assert.equal(sanitized?.includes(token), false);
});

test("analytics sanitizes proof-bearing auth returns before truncation", () => {
  const token = `private-${"x".repeat(240)}`;
  const path = `/sign-in?redirect_url=${encodeURIComponent(`/proof/${token}`)}`;

  const sanitized = sanitizeAnalyticsPath(path);

  assert.equal(sanitized, "/sign-in?redirect_url=%2Fproof%2F%5Btoken%5D");
  assert.equal(sanitized?.includes(token.slice(0, 80)), false);
});

test("analytics removes a proof token from an absolute auth return URL", () => {
  const token = "PRIVATE_TOKEN";
  const path = `/sign-in?redirect_url=${encodeURIComponent(`https://sidequestchess.com/proof/${token}`)}`;
  const sanitized = sanitizeAnalyticsPath(path);
  const event = normalizeAnalyticsEvent({ type: "page_view", path });
  const expected = "/sign-in?redirect_url=%2Fproof%2F%5Btoken%5D";

  assert.deepEqual([sanitized, event?.path], [expected, expected]);
  assert.equal(JSON.stringify(event).includes(token), false);
});

test("analytics redacts a malformed proof return with a path suffix", () => {
  const token = "PRIVATE_TOKEN";
  const path = `/sign-in?redirect_url=${encodeURIComponent(`/proof/${token}/extra`)}`;

  const sanitized = sanitizeAnalyticsPath(path);
  const event = normalizeAnalyticsEvent({ type: "page_view", path });
  const expected = "/sign-in?redirect_url=%2Fproof%2F%5Btoken%5D";

  assert.deepEqual([sanitized, event?.path], [expected, expected]);
  assert.equal(JSON.stringify(event).includes(token), false);
});

test("analytics redacts a malformed encoded proof return", () => {
  const token = "PRIVATE_TOKEN";
  const path = `/sign-in?redirect_url=%252Fproof%252F${token}%ZZ`;

  const sanitized = sanitizeAnalyticsPath(path);
  const event = normalizeAnalyticsEvent({ type: "page_view", path });
  const expected = "/sign-in?redirect_url=%2Fproof%2F%5Btoken%5D";

  assert.deepEqual([sanitized, event?.path], [expected, expected]);
  assert.equal(JSON.stringify(event).includes(token), false);
});

test("analytics redacts an encoded proof route with a malformed token escape", () => {
  const token = "PRIVATE_TOKEN";
  const path = `/%70roof/${token}%ZZ`;

  const sanitized = sanitizeAnalyticsPath(path);
  const event = normalizeAnalyticsEvent({ type: "page_view", path });

  assert.deepEqual([sanitized, event?.path], ["/proof/[token]", "/proof/[token]"]);
  assert.equal(JSON.stringify(event).includes(token), false);
});

test("encoded pathname delimiters cannot hide proof tokens from analytics entry points", () => {
  const token = "PRIVATE_TOKEN";

  for (const delimiter of ["%3F", "%23", "%253F", "%2523"]) {
    const path = `/proof/${delimiter}${token}`;
    const nested = `/sign-in?redirect_url=${encodeURIComponent(path)}`;
    const event = normalizeAnalyticsEvent({ type: "page_view", path });
    const historical = getAnalyticsStore({
      sqcAnalytics: { recentEvents: [{ type: "page_view", at: "2026-09-07T00:00:00.000Z", path }] },
    });
    const compacted = compactAnalyticsStore({
      recentEvents: [{ type: "page_view", at: "2026-09-07T00:00:00.000Z", path }],
    });

    assert.deepEqual(
      [
        sanitizeAnalyticsPath(path),
        sanitizeAnalyticsPath(nested),
        event?.path,
        historical.recentEvents?.[0]?.path,
        compacted.recentEvents?.[0]?.path,
      ],
      [
        "/proof/[token]",
        "/sign-in?redirect_url=%2Fproof%2F%5Btoken%5D",
        "/proof/[token]",
        "/proof/[token]",
        "/proof/[token]",
      ],
    );
    assert.equal(JSON.stringify({ event, historical, compacted }).includes(token), false);
  }
});

test("analytics redacts an encoded absolute proof URL with a malformed token escape", () => {
  const token = "PRIVATE_TOKEN";
  const path = `https%3A%2F%2Fx.test%2F%70roof%2F${token}%ZZ`;

  const sanitized = sanitizeAnalyticsPath(path);
  const event = normalizeAnalyticsEvent({ type: "page_view", path });

  assert.deepEqual([sanitized, event?.path], ["/proof/[token]", "/proof/[token]"]);
  assert.equal(JSON.stringify(event).includes(token), false);
});

test("analytics decodes path components without reinterpreting encoded userinfo delimiters", () => {
  const token = "PRIVATE_TOKEN";
  const email = "private.login@example.test";
  const cases = [
    [`https://u%23v@x.test/%70roof/${token}%ZZ`, "/proof/[token]"],
    [`//u%3Fv@x.test/%70roof/${token}%ZZ`, "/proof/[token]"],
    [`https://u%23v@x.test/%73ign-up?email_address=${email}&bad=%ZZ`, "/sign-up"],
    [`//u%3Fv@x.test/%73ign-in?email_address=${email}&bad=%ZZ`, "/sign-in"],
  ] as const;

  for (const [path, expected] of cases) {
    const sanitized = sanitizeAnalyticsPath(path);
    const event = normalizeAnalyticsEvent({ type: "page_view", path });

    assert.deepEqual([sanitized, event?.path], [expected, expected]);
    assert.equal(JSON.stringify(event).includes(token), false);
    assert.equal(JSON.stringify(event).includes(email), false);
  }
});

test("analytics unwraps whole URL encoding before decoding path components", () => {
  const token = "PRIVATE_TOKEN";
  const wholeEncoded = `https%3A%2F%2Fu%2523v%40x.test%2F%70roof%2F${token}%ZZ`;
  const nestedPath = `/sign-in?redirect_url=${encodeURIComponent(wholeEncoded)}`;
  const expectedNested = "/sign-in?redirect_url=%2Fproof%2F%5Btoken%5D";

  assert.equal(sanitizeAnalyticsPath(wholeEncoded), "/proof/[token]");
  assert.equal(sanitizeAnalyticsPath(nestedPath), expectedNested);
});

test("analytics redacts proof URLs with encoded scheme characters", () => {
  const token = "PRIVATE_TOKEN";
  const encodedProofUrls = [
    `%68ttps%3A%2F%2Fx.test%2Fproof%2F${token}`,
    `%68%74%74%70%73%3A%2F%2Fx.test%2Fproof%2F${token}`,
    `%2568ttps%253A%252F%252Fx.test%252Fproof%252F${token}`,
  ];

  for (const proofUrl of encodedProofUrls) {
    const nestedPath = `/sign-in?redirect_url=${encodeURIComponent(proofUrl)}`;
    assert.equal(sanitizeAnalyticsPath(proofUrl), "/proof/[token]");
    assert.equal(sanitizeAnalyticsPath(nestedPath), "/sign-in?redirect_url=%2Fproof%2F%5Btoken%5D");
  }
});

test("analytics rejects ambiguous authority prefixes that can erase proof routes", () => {
  const token = "PRIVATE_TOKEN";
  const paths = [
    `/%5Cx.test/proof/${token}/../../side-quests`,
    `///x.test/proof/${token}/../../side-quests`,
  ];

  for (const path of paths) {
    assert.equal(sanitizeAnalyticsPath(path), undefined);
  }
});

test("ambiguous auth authorities never reach analytics entry points", () => {
  const email = "private.login@example.test";
  const path = `///x.test/sign-up/../side-quests?email_address=${encodeURIComponent(email)}`;
  const nested = `/sign-in?redirect_url=${encodeURIComponent(path)}`;
  const event = normalizeAnalyticsEvent({ type: "page_view", path });
  const historical = getAnalyticsStore({
    sqcAnalytics: { recentEvents: [{ type: "page_view", at: "2026-09-07T00:00:00.000Z", path }] },
  });
  const compacted = compactAnalyticsStore({
    recentEvents: [{ type: "page_view", at: "2026-09-07T00:00:00.000Z", path }],
  });

  assert.deepEqual(
    [
      sanitizeAnalyticsPath(path),
      sanitizeAnalyticsPath(nested),
      event?.path,
      historical.recentEvents?.[0]?.path,
      compacted.recentEvents?.[0]?.path,
    ],
    [undefined, "/sign-in", undefined, undefined, undefined],
  );
  assert.equal(JSON.stringify({ event, historical, compacted }).includes(email), false);
});

test("analytics redacts proof routes behind backslash authorities", () => {
  const token = "PRIVATE_TOKEN";
  const paths = [
    `\\\\x.test\\proof\\${token}\\..\\..\\side-quests`,
    `%5C%5Cx.test%5Cproof%5C${token}%5C..%5C..%5Cside-quests`,
    `//x.test\\proof\\${token}\\..\\..\\side-quests`,
    `\\\\x.test/proof/${token}/../../side-quests`,
  ];

  for (const path of paths) {
    assert.equal(sanitizeAnalyticsPath(path), "/proof/[token]");
  }
});

test("analytics redacts backslash-authority proof routes nested behind authentication", () => {
  const token = "PRIVATE_TOKEN";
  const returnPath = `%5C%5Cx.test%5Cproof%5C${token}%5C..%5C..%5Cside-quests`;
  const path = `/sign-in?redirect_url=${encodeURIComponent(returnPath)}`;

  const sanitized = sanitizeAnalyticsPath(path);

  assert.equal(sanitized, "/sign-in?redirect_url=%2Fproof%2F%5Btoken%5D");
  assert.equal(sanitized?.includes(token), false);
});

test("analytics redacts proof routes before backslash normalization", () => {
  const token = "PRIVATE_TOKEN";
  const path = `/proof\\${token}\\..\\../side-quests`;

  assert.equal(sanitizeAnalyticsPath(path), "/proof/[token]");
});

test("analytics redacts proof routes before encoded backslash normalization", () => {
  const token = "PRIVATE_TOKEN";
  const path = `/proof%5C${token}%5C..%5C..%5Cside-quests`;

  assert.equal(sanitizeAnalyticsPath(path), "/proof/[token]");
});

test("analytics drops malformed special-scheme authority paths", () => {
  const token = "PRIVATE_TOKEN";
  const malformedUrls = [
    `https:////x.test/proof/${token}/../../side-quests`,
    `https:\\\\x.test\\proof\\${token}\\..\\..\\side-quests`,
    "https:////proof/Rook?tab=community",
  ];

  for (const path of malformedUrls) {
    assert.equal(sanitizeAnalyticsPath(path), undefined);
    assert.equal(
      sanitizeAnalyticsPath(`/sign-in?redirect_url=${encodeURIComponent(path)}`),
      "/sign-in",
    );
  }
});

test("analytics drops controls introduced while decoding path components", () => {
  const token = "PRIVATE_TOKEN";
  const paths = [
    `/proo%09f/${token}/../../side-quests`,
    `%20%00%2Fproof%2F${token}%2F..%2F..%2Fside-quests`,
  ];

  for (const path of paths) {
    assert.equal(sanitizeAnalyticsPath(path), undefined);
  }
});

test("component-decoded controls never reach analytics entry points", () => {
  const email = "private.login@example.test";
  const path = `%20%00%2Fsign-up%3Femail_address=${encodeURIComponent(email)}`;
  const nested = `/sign-in?redirect_url=${encodeURIComponent(path)}`;
  const event = normalizeAnalyticsEvent({ type: "page_view", path });
  const historical = getAnalyticsStore({
    sqcAnalytics: { recentEvents: [{ type: "page_view", at: "2026-09-07T00:00:00.000Z", path }] },
  });
  const compacted = compactAnalyticsStore({
    recentEvents: [{ type: "page_view", at: "2026-09-07T00:00:00.000Z", path }],
  });

  assert.deepEqual(
    [
      sanitizeAnalyticsPath(path),
      sanitizeAnalyticsPath(nested),
      event?.path,
      historical.recentEvents?.[0]?.path,
      compacted.recentEvents?.[0]?.path,
    ],
    [undefined, "/sign-in", undefined, undefined, undefined],
  );
  assert.equal(JSON.stringify({ event, historical, compacted }).includes(email), false);
});

test("analytics drops proof routes obscured by leading URL preprocessing controls", () => {
  const token = "PRIVATE_TOKEN";
  const paths = [
    `\u0000/proof/${token}/../../side-quests`,
    `%00%2Fproof%2F${token}%2F..%2F..%2Fside-quests`,
  ];

  for (const path of paths) {
    assert.equal(sanitizeAnalyticsPath(path), undefined);
  }
});

test("analytics drops URL-control proof routes nested behind authentication", () => {
  const token = "PRIVATE_TOKEN";
  const returnPath = `%00%2Fproof%2F${token}%2F..%2F..%2Fside-quests`;
  const path = `/sign-up?redirect_url=${encodeURIComponent(returnPath)}`;

  const sanitized = sanitizeAnalyticsPath(path);

  assert.equal(sanitized, "/sign-up");
  assert.equal(sanitized?.includes(token), false);
});

test("analytics drops proof routes obscured by URL control preprocessing", () => {
  const token = "PRIVATE_TOKEN";
  const path = `/proo\tf/${token}/../../side-quests`;

  assert.equal(sanitizeAnalyticsPath(path), undefined);
});

test("analytics drops encoded URL preprocessing controls after wrapper decoding", () => {
  const token = "PRIVATE_TOKEN";
  const controls = ["%09", "%0A", "%0D"];

  for (const control of controls) {
    const path = `%2Fproo${control}f%2F${token}%2F..%2F..%2Fside-quests`;
    assert.equal(sanitizeAnalyticsPath(path), undefined);
    assert.equal(
      sanitizeAnalyticsPath(`/sign-in?redirect_url=${encodeURIComponent(path)}`),
      "/sign-in",
    );
  }
});

test("analytics redacts proof routes before dot-segment normalization", () => {
  const token = "PRIVATE_TOKEN";
  const proofPaths = [
    `/proof/${token}/../../side-quests`,
    `/proof/${token}/%2E%2E/%2E%2E/side-quests`,
    `/./proof/${token}/../../side-quests`,
    `/%2E/proof/${token}/%2E%2E/%2E%2E/side-quests`,
    `/landing/../proof/${token}/../../side-quests`,
  ];

  for (const proofPath of proofPaths) {
    const nestedPath = `/sign-in?redirect_url=${encodeURIComponent(proofPath)}`;
    assert.equal(sanitizeAnalyticsPath(proofPath), "/proof/[token]");
    assert.equal(sanitizeAnalyticsPath(nestedPath), "/sign-in?redirect_url=%2Fproof%2F%5Btoken%5D");
  }
});

test("analytics drops paths that exceed the structural decoding budget", () => {
  const encodedRoute = `%${"25".repeat(8)}70roof`;
  const path = `/${encodedRoute}/PRIVATE_TOKEN`;

  assert.equal(sanitizeAnalyticsPath(path), undefined);
});

test("analytics drops oversized path input before structural parsing", () => {
  assert.equal(sanitizeAnalyticsPath(`/side-quests?value=${"x".repeat(2_048)}`), undefined);
});

test("analytics redacts a nested encoded proof route with a malformed token escape", () => {
  const token = "PRIVATE_TOKEN";
  const nestedReturn = `/%70roof/${token}%ZZ`;
  const path = `/sign-in?redirect_url=${encodeURIComponent(nestedReturn)}`;

  const sanitized = sanitizeAnalyticsPath(path);
  const event = normalizeAnalyticsEvent({ type: "page_view", path });
  const expected = "/sign-in?redirect_url=%2Fproof%2F%5Btoken%5D";

  assert.deepEqual([sanitized, event?.path], [expected, expected]);
  assert.equal(JSON.stringify(event).includes(token), false);
});

test("analytics redacts an encoded absolute proof URL nested behind auth", () => {
  const token = "PRIVATE_TOKEN";
  const nestedReturn = `https%3A%2F%2Fx.test%2F%70roof%2F${token}%ZZ`;
  const path = `/sign-in?redirect_url=${encodeURIComponent(nestedReturn)}`;

  const sanitized = sanitizeAnalyticsPath(path);
  const event = normalizeAnalyticsEvent({ type: "page_view", path });
  const expected = "/sign-in?redirect_url=%2Fproof%2F%5Btoken%5D";

  assert.deepEqual([sanitized, event?.path], [expected, expected]);
  assert.equal(JSON.stringify(event).includes(token), false);
});

test("analytics removes proof tokens from an absolute outer auth URL", () => {
  const token = "PRIVATE_TOKEN";
  const path = `https://sidequestchess.com/sign-in?redirect_url=${encodeURIComponent(`/proof/${token}`)}`;

  const sanitized = sanitizeAnalyticsPath(path);
  const event = normalizeAnalyticsEvent({ type: "page_view", path });
  const expected = "/sign-in?redirect_url=%2Fproof%2F%5Btoken%5D";

  assert.deepEqual([sanitized, event?.path], [expected, expected]);
  assert.equal(JSON.stringify(event).includes(token), false);
});

test("analytics removes proof tokens from a protocol-relative outer auth URL", () => {
  const token = "PRIVATE_TOKEN";
  const path = `//sidequestchess.com/sign-up?redirect_url=${encodeURIComponent(`/proof/${token}`)}`;

  const sanitized = sanitizeAnalyticsPath(path);
  const event = normalizeAnalyticsEvent({ type: "page_view", path });
  const expected = "/sign-up?redirect_url=%2Fproof%2F%5Btoken%5D";

  assert.deepEqual([sanitized, event?.path], [expected, expected]);
  assert.equal(JSON.stringify(event).includes(token), false);
});

test("analytics redacts proof tokens nested behind another auth return", () => {
  const token = "PRIVATE_TOKEN";
  const nestedReturn = `/sign-up?redirect_url=${encodeURIComponent(`/proof/${token}`)}`;
  const path = `/sign-in?redirect_url=${encodeURIComponent(nestedReturn)}`;

  const sanitized = sanitizeAnalyticsPath(path);
  const event = normalizeAnalyticsEvent({ type: "page_view", path });
  const expected = "/sign-in?redirect_url=%2Fproof%2F%5Btoken%5D";

  assert.deepEqual([sanitized, event?.path], [expected, expected]);
  assert.equal(JSON.stringify(event).includes(token), false);
});

test("analytics removes an authentication email from a nested auth return", () => {
  const email = "private.login@example.test";
  const nestedReturn = `/sign-up?email_address=${encodeURIComponent(email)}`;
  const path = `/sign-in?redirect_url=${encodeURIComponent(nestedReturn)}`;

  const sanitized = sanitizeAnalyticsPath(path);
  const event = normalizeAnalyticsEvent({ type: "page_view", path });
  const expected = "/sign-in?redirect_url=%2Fsign-up";

  assert.deepEqual([sanitized, event?.path], [expected, expected]);
  assert.equal(JSON.stringify(event).includes(email), false);
});

test("analytics removes an authentication email from a doubly encoded nested auth return", () => {
  const email = "private.login@example.test";
  const nestedReturn = encodeURIComponent(`/sign-up?email_address=${encodeURIComponent(email)}`);
  const path = `/sign-in?redirect_url=${encodeURIComponent(nestedReturn)}`;

  const sanitized = sanitizeAnalyticsPath(path);
  const event = normalizeAnalyticsEvent({ type: "page_view", path });
  const expected = "/sign-in?redirect_url=%2Fsign-up";

  assert.deepEqual([sanitized, event?.path], [expected, expected]);
  assert.equal(decodeURIComponent(JSON.stringify(event)).includes(email), false);
});

test("analytics removes an encoded authentication query from a nested auth pathname", () => {
  const email = "private.login@example.test";
  const nestedReturn = `/sign-up/${encodeURIComponent(`?email_address=${email}`)}`;
  const path = `/sign-in?redirect_url=${encodeURIComponent(nestedReturn)}`;

  const sanitized = sanitizeAnalyticsPath(path);
  const event = normalizeAnalyticsEvent({ type: "page_view", path });
  const expected = "/sign-in?redirect_url=%2Fsign-up";

  assert.deepEqual([sanitized, event?.path], [expected, expected]);
  assert.equal(decodeURIComponent(JSON.stringify(event)).includes(email), false);
});

test("analytics removes a mixed-encoded query from an auth pathname", () => {
  const email = "private.login@example.test";
  const path = `/sign-up/%25%33%46email_address=${email}`;

  const sanitized = sanitizeAnalyticsPath(path);
  const event = normalizeAnalyticsEvent({ type: "page_view", path });

  assert.deepEqual([sanitized, event?.path], ["/sign-up", "/sign-up"]);
  assert.equal(JSON.stringify(event).includes(email), false);
});

test("analytics removes email from an encoded absolute auth URL with a malformed escape", () => {
  const email = "private.login@example.test";
  const path = `https%3A%2F%2Fx.test%2F%73ign-up%3Femail_address=${encodeURIComponent(email)}%26bad=%ZZ`;

  const sanitized = sanitizeAnalyticsPath(path);
  const event = normalizeAnalyticsEvent({ type: "page_view", path });

  assert.deepEqual([sanitized, event?.path], ["/sign-up", "/sign-up"]);
  assert.equal(JSON.stringify(event).includes(email), false);
});

test("analytics removes a mixed-encoded query from a nested auth pathname", () => {
  const email = "private.login@example.test";
  const nestedReturn = `/sign-up/%25%33%46email_address=${email}`;
  const path = `/sign-in?redirect_url=${encodeURIComponent(nestedReturn)}`;

  const sanitized = sanitizeAnalyticsPath(path);
  const event = normalizeAnalyticsEvent({ type: "page_view", path });
  const expected = "/sign-in?redirect_url=%2Fsign-up";

  assert.deepEqual([sanitized, event?.path], [expected, expected]);
  assert.equal(JSON.stringify(event).includes(email), false);
});

test("analytics removes a malformed encoded authentication return", () => {
  const email = "private.login@example.test";
  const nestedReturn = `/%73ign-up?email_address=${encodeURIComponent(email)}&bad=%ZZ`;
  const path = `/sign-in?redirect_url=${encodeURIComponent(nestedReturn)}`;

  const sanitized = sanitizeAnalyticsPath(path);
  const event = normalizeAnalyticsEvent({ type: "page_view", path });
  const expected = "/sign-in?redirect_url=%2Fsign-up";

  assert.deepEqual([sanitized, event?.path], [expected, expected]);
  assert.equal(decodeURIComponent(JSON.stringify(event)).includes(email), false);
});

test("analytics drops an unsafe malformed absolute nested return", () => {
  const email = "private.login@example.test";
  const nestedReturn = `https://%ZZ/sign-up?email_address=${encodeURIComponent(email)}`;
  const path = `/sign-in?redirect_url=${encodeURIComponent(nestedReturn)}`;

  const sanitized = sanitizeAnalyticsPath(path);
  const event = normalizeAnalyticsEvent({ type: "page_view", path });

  assert.deepEqual([sanitized, event?.path], ["/sign-in", "/sign-in"]);
  assert.equal(decodeURIComponent(JSON.stringify(event)).includes(email), false);
});

test("analytics redacts authentication routes before dot-segment normalization", () => {
  const email = "private.login@example.test";
  const authenticationPaths = [
    `/sign-up/../side-quests?email_address=${encodeURIComponent(email)}`,
    `/sign-up/%2E%2E/side-quests?email_address=${encodeURIComponent(email)}`,
    `/./sign-up/../side-quests?email_address=${encodeURIComponent(email)}`,
    `/%2E/sign-up/%2E%2E/side-quests?email_address=${encodeURIComponent(email)}`,
    `/landing/../sign-up/../side-quests?email_address=${encodeURIComponent(email)}`,
  ];

  for (const authenticationPath of authenticationPaths) {
    const nestedPath = `/sign-in?redirect_url=${encodeURIComponent(authenticationPath)}`;
    assert.equal(sanitizeAnalyticsPath(authenticationPath), "/sign-up");
    assert.equal(sanitizeAnalyticsPath(nestedPath), "/sign-in?redirect_url=%2Fsign-up");
  }
});

test("analytics trims nested sensitive returns before structural classification", () => {
  const token = "PRIVATE_TOKEN";
  const email = "private.login@example.test";
  const proofReturn = ` /proof/${token}/../../side-quests`;
  const authenticationReturn = ` /sign-up/../side-quests?email_address=${encodeURIComponent(email)}`;
  const proofPath = `/sign-in?redirect_url=${encodeURIComponent(proofReturn)}`;
  const authenticationPath = `/sign-in?redirect_url=${encodeURIComponent(authenticationReturn)}`;

  for (const path of [proofPath, authenticationPath]) {
    const event = normalizeAnalyticsEvent({ type: "page_view", path });
    const historical = getAnalyticsStore({
      sqcAnalytics: { recentEvents: [{ type: "page_view", at: "2026-09-07T00:00:00.000Z", path }] },
    });
    const compacted = compactAnalyticsStore({
      recentEvents: [{ type: "page_view", at: "2026-09-07T00:00:00.000Z", path }],
    });
    const serialized = JSON.stringify({ sanitized: sanitizeAnalyticsPath(path), event, historical, compacted });

    assert.equal(serialized.includes(token), false);
    assert.equal(serialized.includes(email), false);
  }

  assert.equal(sanitizeAnalyticsPath(proofPath), "/sign-in?redirect_url=%2Fproof%2F%5Btoken%5D");
  assert.equal(sanitizeAnalyticsPath(authenticationPath), "/sign-in?redirect_url=%2Fsign-up");
});

test("analytics rejects encoded leading whitespace before sensitive nested returns", () => {
  const token = "PRIVATE_TOKEN";
  const email = "private.login@example.test";
  const proofPath = "/sign-in?redirect_url=%2520%252Fproof%252FPRIVATE_TOKEN";
  const authenticationPath = "/sign-in?redirect_url=%2520%252Fsign-up%253Femail_address%253Dprivate.login%2540example.test";

  assert.equal(sanitizeAnalyticsPath(proofPath), "/sign-in");
  assert.equal(sanitizeAnalyticsPath(authenticationPath), "/sign-in");
  assert.equal(decodeURIComponent(sanitizeAnalyticsPath(proofPath) ?? "").includes(token), false);
  assert.equal(decodeURIComponent(sanitizeAnalyticsPath(authenticationPath) ?? "").includes(email), false);
});

test("analytics rejects encoded Unicode whitespace before sensitive nested returns", () => {
  const token = "PRIVATE_TOKEN";
  const email = "private.login@example.test";
  const sensitiveReturns = [
    [`%C2%A0/proof/${token}`, token],
    [`%C2%A0/sign-up?email_address=${email}`, email],
  ] as const;

  for (const [sensitiveReturn, secret] of sensitiveReturns) {
    const path = `/sign-in?redirect_url=${encodeURIComponent(sensitiveReturn)}`;
    const sanitized = sanitizeAnalyticsPath(path);

    assert.equal(sanitized, "/sign-in");
    assert.equal(decodeURIComponent(sanitized ?? "").includes(secret), false);
  }
});

test("analytics preserves an internal UTF-8 BOM as ordinary route data", () => {
  const ordinaryPaths = [
    "/pr%EF%BB%BFoof/Rook",
    "/sign%EF%BB%BF-in?tab=community",
  ];

  for (const path of ordinaryPaths) {
    assert.equal(sanitizeAnalyticsPath(path), path);
  }
});

test("analytics preserves ordinary double-slash paths during dot-segment resolution", () => {
  const ordinaryPaths = [
    "/landing//../sign-up?tab=community",
    "/landing//../proof/Rook",
  ];

  for (const path of ordinaryPaths) {
    assert.equal(sanitizeAnalyticsPath(path), path);
  }
});

test("analytics removes authentication email query parameters", () => {
  const email = "private.login@example.test";
  const path = `/sign-in?email_address=${encodeURIComponent(email)}`;

  const sanitized = sanitizeAnalyticsPath(path);
  const event = normalizeAnalyticsEvent({ type: "page_view", path });

  assert.deepEqual([sanitized, event?.path], ["/sign-in", "/sign-in"]);
  assert.equal(JSON.stringify(event).includes(email), false);
});

test("analytics preserves an ordinary catalog return containing an auth-like alias", () => {
  const path = "/sign-in?redirect_url=%2Fmultiplayer-side-quests%3Fhost%3D%2Fsign-up";

  assert.equal(sanitizeAnalyticsPath(path), path);
});

test("analytics preserves an ordinary catalog return containing a proof-like alias", () => {
  const path = "/sign-in?redirect_url=%2Fmultiplayer-side-quests%3Fhost%3D%2Fproof%2FRook";

  assert.equal(sanitizeAnalyticsPath(path), path);
});

test("analytics preserves proof-like encoded userinfo on ordinary routes", () => {
  const ordinaryUrl = "https://u%2Fproof%2FRook@x.test/side-quests?tab=community";
  const nestedPath = `/sign-in?redirect_url=${encodeURIComponent(ordinaryUrl)}`;

  assert.equal(sanitizeAnalyticsPath(ordinaryUrl), ordinaryUrl);
  assert.equal(sanitizeAnalyticsPath(nestedPath), nestedPath);
});

test("analytics preserves auth-like encoded userinfo on ordinary routes", () => {
  const ordinaryUrls = [
    "https://u%2Fsign-up%3Fx@x.test/side-quests?tab=community",
    "//u%2Fsign-in%3Fx@x.test/side-quests?tab=community",
  ];

  for (const ordinaryUrl of ordinaryUrls) {
    const nestedPath = `/sign-in?redirect_url=${encodeURIComponent(ordinaryUrl)}`;
    assert.equal(sanitizeAnalyticsPath(ordinaryUrl), ordinaryUrl);
    assert.equal(sanitizeAnalyticsPath(nestedPath), nestedPath);
  }
});

test("analytics preserves an ordinary sign-in return path", () => {
  const path = "/sign-in?redirect_url=%2Fside-quests%3Ftab%3Dcommunity";

  assert.equal(sanitizeAnalyticsPath(path), path);
});

test("analytics requests suppress the document referrer", () => {
  const source = readFileSync(new URL("../src/components/analytics/analytics-tracker.tsx", import.meta.url), "utf8");
  const requestInit = source.match(/fetch\("\/api\/analytics",\s*\{([\s\S]*?)\}\)\.catch/)?.[1] ?? "";

  assert.match(requestInit, /referrerPolicy:\s*"no-referrer"/);
});
