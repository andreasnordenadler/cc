import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server";
import { proxy } from "../src/proxy";

test("Vercel sign-in aliases redirect to the canonical host without losing the safe return path", async () => {
  const response = await proxy(
    new NextRequest("https://cc-4vzqfncn5-andreas-nordenadlers-projects.vercel.app/sign-in?redirect_url=%2Fmultiplayer"),
    {} as never,
  );

  assert.equal(response?.status, 307);
  assert.equal(response?.headers.get("location"), "https://sidequestchess.com/sign-in?redirect_url=%2Fmultiplayer");
});

test("Vercel sign-up aliases redirect to the canonical host without losing the safe return path", async () => {
  const response = await proxy(
    new NextRequest("https://cc-4vzqfncn5-andreas-nordenadlers-projects.vercel.app/sign-up?redirect_url=%2Fside-quests"),
    {} as never,
  );

  assert.equal(response?.status, 307);
  assert.equal(response?.headers.get("location"), "https://sidequestchess.com/sign-up?redirect_url=%2Fside-quests");
});
