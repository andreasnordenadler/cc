import { NextResponse } from "next/server";
import { checkActiveChallenge, deactivateActiveChallenge, resetCompletedChallenge, startChallenge, submitChallengeAttempt } from "@/app/actions";

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      {
        apiVersion: 1,
        authenticated: true,
        ok: false,
        message: "Send JSON with action=start, check, submit, deactivate, or reset.",
      },
      { status: 400 },
    );
  }

  const record = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
  const action = typeof record.action === "string" ? record.action : "";

  try {
    if (action === "start") {
      const challengeId = typeof record.challengeId === "string" ? record.challengeId : "";
      const formData = new FormData();
      formData.set("challengeId", challengeId);
      await startChallenge(formData);

      return NextResponse.json({
        apiVersion: 1,
        authenticated: true,
        ok: true,
        action,
        challengeId,
        message: "Quest started. Account state is ready to refresh.",
      });
    }

    if (action === "check") {
      await checkActiveChallenge();

      return NextResponse.json({
        apiVersion: 1,
        authenticated: true,
        ok: true,
        action,
        message: "Latest-game check saved. Account state is ready to refresh.",
      });
    }

    if (action === "submit") {
      const challengeId = typeof record.challengeId === "string" ? record.challengeId : "";
      const gameId = typeof record.gameId === "string" ? record.gameId : typeof record.gameUrl === "string" ? record.gameUrl : "";
      const formData = new FormData();
      formData.set("challengeId", challengeId);
      formData.set("gameId", gameId);
      await submitChallengeAttempt(formData);

      return NextResponse.json({
        apiVersion: 1,
        authenticated: true,
        ok: true,
        action,
        challengeId,
        message: "Game proof submitted. Account state is ready to refresh.",
      });
    }

    if (action === "deactivate") {
      const challengeId = typeof record.challengeId === "string" ? record.challengeId : "";
      const formData = new FormData();
      formData.set("challengeId", challengeId);
      await deactivateActiveChallenge(formData);

      return NextResponse.json({
        apiVersion: 1,
        authenticated: true,
        ok: true,
        action,
        challengeId,
        message: "Quest deactivated. Pick a fresh quest when ready.",
      });
    }

    if (action === "reset") {
      const challengeId = typeof record.challengeId === "string" ? record.challengeId : "";
      const formData = new FormData();
      formData.set("challengeId", challengeId);
      await resetCompletedChallenge(formData);

      return NextResponse.json({
        apiVersion: 1,
        authenticated: true,
        ok: true,
        action,
        challengeId,
        message: "Completed quest reset. You can run it again.",
      });
    }

    return NextResponse.json(
      {
        apiVersion: 1,
        authenticated: true,
        ok: false,
        message: "Unsupported mobile quest action.",
      },
      { status: 400 },
    );
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : "Mobile quest action failed.";
    const status = message.toLowerCase().includes("signed in") ? 401 : 400;

    return NextResponse.json(
      {
        apiVersion: 1,
        authenticated: status !== 401,
        ok: false,
        action,
        message,
      },
      { status },
    );
  }
}
