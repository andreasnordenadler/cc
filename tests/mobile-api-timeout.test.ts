import assert from "node:assert/strict";
import test from "node:test";

import * as mobileApi from "../apps/mobile/src/api/sqc";

test("mobile request deadline settles an unabortable native body read", async () => {
  const fetchWithTimeout = (mobileApi as Record<string, unknown>).fetchMobileResponseWithTimeout;
  const readMobileJson = (mobileApi as Record<string, unknown>).readMobileJson;
  assert.equal(typeof fetchWithTimeout, "function");
  assert.equal(typeof readMobileJson, "function");

  const request: { signal: AbortSignal | null } = { signal: null };
  const nativeResponse = {
    body: null,
    headers: new Headers({ "content-type": "application/json" }),
    json: () => new Promise<never>(() => undefined),
    ok: true,
    status: 200,
    text: () => new Promise<never>(() => undefined),
  } as unknown as Response;
  const fetcher = async (_url: string, init: RequestInit = {}) => {
    request.signal = init.signal ?? null;
    return nativeResponse;
  };

  const response = await (fetchWithTimeout as (
    url: string,
    init: RequestInit,
    timeoutMs: number,
    fetcher: typeof fetch,
  ) => Promise<Response>)("https://sidequestchess.test/api/mobile/bootstrap", {}, 5, fetcher as typeof fetch);

  let watchdog: ReturnType<typeof setTimeout> | undefined;
  try {
    await assert.rejects(
      () => Promise.race([
        (readMobileJson as <T>(response: Response, label: string) => Promise<T>)(response, "bootstrap"),
        new Promise<never>((_resolve, reject) => {
          watchdog = setTimeout(() => reject(new Error("response body deadline missing")), 100);
        }),
      ]),
      /mobile request timed out/i,
    );
  } finally {
    if (watchdog) clearTimeout(watchdog);
  }
  assert.equal(request.signal?.aborted, true);
});

test("mobile request deadline rejects a body read that settles after the absolute deadline", async () => {
  const fetchWithTimeout = (mobileApi as Record<string, unknown>).fetchMobileResponseWithTimeout as (
    url: string,
    init: RequestInit,
    timeoutMs: number,
    fetcher: typeof fetch,
  ) => Promise<Response>;
  const readMobileJson = (mobileApi as Record<string, unknown>).readMobileJson as <T>(
    response: Response,
    label: string,
  ) => Promise<T>;
  const request: { signal: AbortSignal | null } = { signal: null };
  const nativeResponse = {
    body: null,
    headers: new Headers({ "content-type": "application/json" }),
    json: () => {
      const settledAfter = Date.now() + 30;
      while (Date.now() < settledAfter) {
        // Simulate a native response conversion that blocks past the deadline.
      }
      return Promise.resolve({ ok: true });
    },
    ok: true,
    status: 200,
    text: () => Promise.resolve(""),
  } as unknown as Response;
  const fetcher = async (_url: string, init: RequestInit = {}) => {
    request.signal = init.signal ?? null;
    return nativeResponse;
  };

  const response = await fetchWithTimeout(
    "https://sidequestchess.test/api/mobile/bootstrap",
    {},
    5,
    fetcher as typeof fetch,
  );

  await assert.rejects(() => readMobileJson(response, "bootstrap"), /mobile request timed out/i);
  assert.equal(request.signal?.aborted, true);
});

test("mobile request deadline settles when a native fetch ignores abort", async () => {
  const fetchWithTimeout = (mobileApi as Record<string, unknown>).fetchMobileResponseWithTimeout as (
    url: string,
    init: RequestInit,
    timeoutMs: number,
    fetcher: typeof fetch,
  ) => Promise<Response>;
  const request: { signal: AbortSignal | null } = { signal: null };
  const fetcher = async (_url: string, init: RequestInit = {}) => {
    request.signal = init.signal ?? null;
    return new Promise<Response>(() => undefined);
  };
  let watchdog: ReturnType<typeof setTimeout> | undefined;

  try {
    await assert.rejects(
      () => Promise.race([
        fetchWithTimeout("https://sidequestchess.test/api/mobile/bootstrap", {}, 5, fetcher as typeof fetch),
        new Promise<never>((_resolve, reject) => {
          watchdog = setTimeout(() => reject(new Error("fetch deadline missing")), 100);
        }),
      ]),
      /mobile request timed out/i,
    );
  } finally {
    if (watchdog) clearTimeout(watchdog);
  }
  assert.equal(request.signal?.aborted, true);
});
