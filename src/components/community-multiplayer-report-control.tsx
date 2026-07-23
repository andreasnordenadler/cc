"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { createCommunityMultiplayerReportSubmitter } from "@/lib/community-multiplayer-report";
import { buildCommunityMultiplayerReportHref } from "@/lib/web-support-diagnostics";

export default function CommunityMultiplayerReportControl({ questId, title, hostName, status: questStatus, signedIn }: { questId: string; title: string; hostName?: string | null; status: string; signedIn: boolean }) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const submitReport = useRef(createCommunityMultiplayerReportSubmitter()).current;

  if (!signedIn) {
    return <Link className="sqc-detail-secondary-button" href={buildCommunityMultiplayerReportHref({ questId, title, hostName, status: questStatus })}>Report this Side Quest</Link>;
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
