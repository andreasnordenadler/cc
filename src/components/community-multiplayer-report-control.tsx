"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { createCommunityMultiplayerReportSubmitter } from "@/lib/community-multiplayer-report";

export default function CommunityMultiplayerReportControl({ questId, title, signedIn }: { questId: string; title: string; signedIn: boolean }) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const submitReport = useRef(createCommunityMultiplayerReportSubmitter()).current;
  const returnTo = `/groupquests/${encodeURIComponent(questId)}`;

  if (!signedIn) {
    return <Link className="sqc-detail-secondary-button" href={`/sign-in?redirect_url=${encodeURIComponent(returnTo)}`}>Sign in to report</Link>;
  }

  async function report() {
    setBusy(true);
    setStatus("");
    const result = await submitReport(questId, reason);
    if (result.kind === "busy") return;
    if (result.kind === "success") setReason("");
    setStatus(result.message);
    setBusy(false);
  }

  return <section className="sqc-multiplayer-report-control" aria-label="Report this Community Multiplayer Side Quest">
    <label className="sqc-form-row">
      <span>Why are you reporting {title}?</span>
      <textarea value={reason} maxLength={500} onChange={(event) => setReason(event.target.value)} placeholder="Describe the unsafe, misleading, or inappropriate content." />
    </label>
    <button type="button" className="sqc-detail-secondary-button" disabled={busy} onClick={report}>{busy ? "Sending…" : "Report this Side Quest"}</button>
    {status ? <p role="status" aria-live="polite">{status}</p> : null}
  </section>;
}
