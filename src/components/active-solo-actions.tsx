"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";
import { checkActiveChallenge, deactivateActiveChallenge } from "@/app/actions";

function Submit({ idle, busy }: { idle: string; busy: string }) {
  const { pending } = useFormStatus();
  return <button className="sqc-detail-secondary-button" type="submit" disabled={pending}>{pending ? busy : idle}</button>;
}

export default function ActiveSoloActions({ challengeId }: { challengeId: string }) {
  return <div className="sqc-action-pair" aria-label="Active Solo Side Quest actions">
    <form action={checkActiveChallenge}><Submit idle="Check latest game" busy="Checking…" /></form>
    <form action={deactivateActiveChallenge} onSubmit={event => { if (!window.confirm("Reset your active Solo Side Quest selection? Your completed quests and proof receipts will stay saved.")) event.preventDefault(); }}>
      <input type="hidden" name="challengeId" value={challengeId} />
      <Submit idle="Reset active selection" busy="Resetting…" />
    </form>
    <Link href="/side-quests" className="sqc-detail-secondary-button">Choose another Side Quest</Link>
  </div>;
}
