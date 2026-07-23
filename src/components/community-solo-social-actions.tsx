"use client";

import Link from "next/link";
import { useState } from "react";
import { validateCommunitySoloReport } from "@/lib/mobile-web-parity-actions";

export default function CommunitySoloSocialActions({ questId, title, creatorName, signedIn }: { questId: string; title: string; creatorName: string; signedIn: boolean }) {
  const [reason, setReason] = useState("");
  const [reportBusy, setReportBusy] = useState(false);
  const [status, setStatus] = useState("");

  if (!signedIn) {
    const reportParams = new URLSearchParams({ report: "community-solo", questId, title, creator: creatorName });
    return <div className="sqc-community-detail-actions">
      <Link className="sqc-detail-secondary-button" href={`/support?${reportParams.toString()}`}>Report this Side Quest</Link>
    </div>;
  }

  async function report() {
    const validated = validateCommunitySoloReport(questId, reason);
    if (!validated.ok) { setStatus(validated.message); return; }
    setReportBusy(true); setStatus("");
    try {
      const response = await fetch("/api/support", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ message: validated.message }) });
      const payload = await response.json().catch(() => ({})) as { message?: string };
      if (!response.ok) throw new Error(payload.message);
      setReason(""); setStatus("Report sent. We’ll review this Side Quest.");
    } catch (caught) { setStatus(caught instanceof Error && caught.message ? caught.message : "Could not send the report. Try again."); }
    finally { setReportBusy(false); }
  }

  return <section className="sqc-native-card" aria-label="Report this Community Solo Side Quest">
    <label className="sqc-form-row"><span>Why are you reporting {title}?</span><textarea value={reason} maxLength={500} onChange={event => setReason(event.target.value)} placeholder="Describe the unsafe, misleading, or inappropriate content." /></label>
    <button type="button" className="sqc-detail-secondary-button" disabled={reportBusy} onClick={report}>{reportBusy ? "Sending…" : "Report this Side Quest"}</button>
    {status ? <p role="status" aria-live="polite">{status}</p> : null}
  </section>;
}
