"use client";

import { useState } from "react";
import { buildWebSupportDiagnostics, type WebSupportAccountContext } from "@/lib/web-support-diagnostics";

export default function SupportDiagnosticsCopy({ accountContext }: { accountContext: WebSupportAccountContext | null }) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");

  async function copySupportDetails() {
    const diagnostics = buildWebSupportDiagnostics({
      url: window.location.href,
      userAgent: navigator.userAgent,
      platform: navigator.platform || "web",
      recordedAt: new Date().toISOString(),
      account: accountContext,
    });

    try {
      await navigator.clipboard.writeText(diagnostics);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
  }

  return (
    <div className="sqc-support-copy-action">
      <button className="sqc-primary-action" type="button" onClick={copySupportDetails}>Copy support details</button>
      {status === "copied" ? <p className="sqc-inline-success" role="status">Support details copied.</p> : null}
      {status === "failed" ? <p className="sqc-inline-error" role="alert">Could not copy support details in this browser.</p> : null}
    </div>
  );
}
