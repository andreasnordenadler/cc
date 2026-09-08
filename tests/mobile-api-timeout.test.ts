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

  await assert.rejects(
    () => Promise.race([
      (readMobileJson as <T>(response: Response, label: string) => Promise<T>)(response, "bootstrap"),
      new Promise<never>((_resolve, reject) => setTimeout(() => reject(new Error("response body deadline missing")), 100)),
    ]),
    /mobile request timed out/i,
  );
  assert.equal(request.signal?.aborted, true);
});
