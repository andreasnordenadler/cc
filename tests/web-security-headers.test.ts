import assert from "node:assert/strict";
import test from "node:test";
import nextConfig from "../next.config";

test("every web response carries the baseline anti-sniffing clickjacking and referrer headers", async () => {
  assert.equal(typeof nextConfig.headers, "function");

  const routes = await nextConfig.headers!();
  const globalHeaders = routes.find((route) => route.source === "/:path*");
  assert.ok(globalHeaders, "expected a global header rule");

  const headers = Object.fromEntries(globalHeaders.headers.map(({ key, value }) => [key.toLowerCase(), value]));
  assert.deepEqual(
    {
      "referrer-policy": headers["referrer-policy"],
      "x-content-type-options": headers["x-content-type-options"],
      "x-frame-options": headers["x-frame-options"],
    },
    {
      "referrer-policy": "strict-origin-when-cross-origin",
      "x-content-type-options": "nosniff",
      "x-frame-options": "DENY",
    },
  );
});
