import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import ResetQuestControl from "../src/components/reset-quest-control";
import CompletedOfficialSoloControls from "../src/components/completed-official-solo-controls";
import { getChallengeById } from "../src/lib/challenges";
import { buildCompletedOfficialPublicProofPath, decodePublicProof } from "../src/lib/proof-share";

test("completed Official Solo detail keeps the Android reset capability reachable", async () => {
  const challenge = getChallengeById("finish-any-game");
  assert.ok(challenge);

  const html = renderToStaticMarkup(React.createElement(ResetQuestControl, { challenge }));
  assert.match(html, /<button[^>]*>Reset quest<\/button>/);

  const source = await import("node:fs/promises").then((fs) =>
    fs.readFile(new URL("../src/app/challenges/[id]/page.tsx", import.meta.url), "utf8"),
  );
  assert.match(source, /import CompletedOfficialSoloControls from "@\/components\/completed-official-solo-controls"/);
  assert.match(source, /\{completed && user \? \([\s\S]*?<CompletedOfficialSoloControls challenge=\{challenge\} proofPath=\{completedProofPath\} \/>[\s\S]*?\) : null\}/);
});

test("completed Official Solo detail opens the latest accepted proof without inventing a legacy receipt", async () => {
  const challenge = getChallengeById("finish-any-game");
  assert.ok(challenge);

  const passedAttempt = {
    challengeId: challenge.id,
    status: "passed" as const,
    summary: "Finished a public game.",
    checkedAt: "2026-07-22T01:00:00.000Z",
    gameId: "accepted-game",
    provider: "lichess" as const,
  };
  const proofPath = await buildCompletedOfficialPublicProofPath({
    completed: true,
    attempt: passedAttempt,
    challenge,
    runnerName: "SQC player",
  });

  assert.ok(proofPath);
  assert.ok(proofPath.startsWith("/proof/"));
  const decoded = await decodePublicProof(proofPath.slice("/proof/".length));
  assert.equal(decoded?.payload.gameId, "accepted-game");
  assert.equal(await buildCompletedOfficialPublicProofPath({ completed: true, attempt: null, challenge }), null);
  assert.equal(await buildCompletedOfficialPublicProofPath({ completed: false, attempt: passedAttempt, challenge }), null);

  const source = await import("node:fs/promises").then((fs) =>
    fs.readFile(new URL("../src/app/challenges/[id]/page.tsx", import.meta.url), "utf8"),
  );
  assert.match(source, /getLatestPassedChallengeAttempt\(metadata, challenge\.id\)/);
  assert.match(source, /completedProofPath[\s\S]*<CompletedOfficialSoloControls/);
});

test("authenticated completed detail renders a real receipt action and an honest legacy fallback", () => {
  const challenge = getChallengeById("finish-any-game");
  assert.ok(challenge);

  const withReceipt = renderToStaticMarkup(React.createElement(CompletedOfficialSoloControls, {
    challenge,
    proofPath: "/proof/signed-receipt",
  }));
  assert.match(withReceipt, /href="\/proof\/signed-receipt"[^>]*>View proof details<\/a>/);
  assert.match(withReceipt, /Open the same verified proof receipt available from Android v338/);
  assert.match(withReceipt, /<button[^>]*>Reset quest<\/button>/);

  const legacy = renderToStaticMarkup(React.createElement(CompletedOfficialSoloControls, {
    challenge,
    proofPath: null,
  }));
  assert.match(legacy, /legacy completion has no accepted receipt attached/);
  assert.doesNotMatch(legacy, /View proof details/);
  assert.match(legacy, /<button[^>]*>Reset quest<\/button>/);
});
