import assert from "node:assert/strict";
import test from "node:test";
import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server";

import { config } from "../src/proxy";

test("community like mutations run through the Clerk proxy", () => {
  assert.equal(unstable_doesMiddlewareMatch({
    config,
    nextConfig: {},
    url: "/api/community-likes",
  }), true);
});
