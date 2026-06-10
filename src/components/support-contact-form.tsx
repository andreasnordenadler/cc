"use client";

import { FormEvent, useMemo, useState } from "react";
import type { SQCSupportMessage } from "@/lib/analytics";

const SUPPORT_EMAIL = "andreas.nordenadler@gmail.com";

type SupportContactFormProps = {
  isSignedIn?: boolean;
  initialMessages?: SQCSupportMessage[];
  initialContext?: string;
  supportDiagnostics?: string;
};

export default function SupportContactForm({ isSignedIn = false, initialMessages = [], initialContext = "", supportDiagnostics = "" }: SupportContactFormProps) {
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState(initialMessages);
  const [message, setMessage] = useState(initialContext);
  const [busy, setBusy] = useState(false);
  const visibleMessages = useMemo(() => [...messages].sort((a, b) => Date.parse(b.at) - Date.parse(a.at)).slice(0, 8), [messages]);

  async function copySupportDetails() {
    const supportPacket = [
      "Side Quest Chess support details",
      supportDiagnostics.trim() || "No signed-in account diagnostics available.",
      `Page: ${window.location.pathname}${window.location.search}`,
      `Browser: ${navigator.userAgent}`,
      `Captured: ${new Date().toISOString()}`,
    ].filter(Boolean).join("\n");

    try {
      await navigator.clipboard.writeText(supportPacket);
      setStatus("Support details copied. Paste them into the message and add what went wrong.");
      setError(null);
    } catch {
      setError("Could not copy support details. You can still send the message without them.");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const issueType = String(form.get("issueType") || "General").trim();
    const gameLink = String(form.get("gameLink") || "").trim();
    const bodyMessage = message.trim();

    const supportBody = [
      "Side Quest Chess support request",
      "",
      `Name: ${name || "Not provided"}`,
      `Email: ${email || "Not provided"}`,
      `Issue type: ${issueType}`,
      `Game / proof link: ${gameLink || "Not provided"}`,
      "",
      "Message:",
      bodyMessage || "Not provided",
    ].join("\n");

    setStatus(null);
    setError(null);

    if (isSignedIn) {
      setBusy(true);
      try {
        const response = await fetch("/api/support", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ message: supportBody }),
        });
        const result = await response.json().catch(() => null) as { ok?: boolean; message?: string; supportMessage?: SQCSupportMessage } | null;
        if (!response.ok || !result?.ok) throw new Error(result?.message || "Could not send the support note.");
        if (result.supportMessage) setMessages((current) => [...current, result.supportMessage as SQCSupportMessage]);
        setStatus(result.message || "Message sent. We’ll reply here if we need more details.");
        setMessage("");
        event.currentTarget.reset();
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Could not send the support note.");
      } finally {
        setBusy(false);
      }
      return;
    }

    const subject = `Side Quest Chess support: ${issueType}`;
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(supportBody)}`;
    setStatus("Opening your email app with the support request.");
  }

  return (
    <div className="support-contact-stack">
      <div className="support-thread-card">
        <span className="eyebrow">Support details</span>
        <h3>{isSignedIn ? "Messages stay with your SQC account." : "Copy a safe troubleshooting packet."}</h3>
        <p>{isSignedIn ? "Support uses your account-attached thread. Reports can include quest context without exposing private player data." : "Copy safe page and browser details for support without exposing chess-site passwords, private invite codes, or raw custom quest configs."}</p>
        <div className="button-row">
          <button className="button secondary" type="button" onClick={() => void copySupportDetails()}>Copy support details</button>
        </div>
      </div>

      {isSignedIn ? (
        <div className="support-thread-card">
          <span className="eyebrow">Signed-in support thread</span>
          {visibleMessages.length ? (
            <div className="support-thread-list" aria-label="Recent support messages">
              {visibleMessages.map((entry) => (
                <article key={entry.id} className="support-thread-message">
                  <strong>{entry.source === "admin" ? "SQC support" : "You"}</strong>
                  <time dateTime={entry.at}>{formatSupportDate(entry.at)}</time>
                  <p>{entry.message}</p>
                </article>
              ))}
            </div>
          ) : (
            <p className="support-contact-status">No support messages yet. Send the first note below.</p>
          )}
        </div>
      ) : null}

      <form className="support-contact-form" onSubmit={handleSubmit}>
        <div className="support-contact-grid">
          <label className="input-card">
            <span>Name</span>
            <input name="name" type="text" autoComplete="name" placeholder="Your name" />
          </label>
          <label className="input-card">
            <span>Email</span>
            <input name="email" type="email" autoComplete="email" placeholder="you@example.com" />
          </label>
        </div>

        <label className="input-card">
          <span>Issue type</span>
          <select name="issueType" defaultValue={getInitialIssueType(initialContext)}>
            <option>Proof receipt</option>
            <option>Account setup</option>
            <option>Quest rules</option>
            <option>Community Solo report</option>
            <option>Community Multiplayer report</option>
            <option>Privacy</option>
            <option>Other</option>
          </select>
        </label>

        <label className="input-card">
          <span>Game or proof link, if relevant</span>
          <input name="gameLink" type="url" placeholder="https://lichess.org/... or https://www.chess.com/game/..." />
        </label>

        <label className="input-card">
          <span>Message</span>
          <textarea name="message" rows={6} required placeholder="Tell us what happened, what you expected, and which quest was involved." value={message} onChange={(event) => setMessage(event.target.value)} />
        </label>

        <div className="button-row">
          <button className="button primary" type="submit" disabled={busy}>{busy ? "Sending..." : isSignedIn ? "Send support message" : "Send support email"}</button>
        </div>
        {status ? <p className="support-contact-status" role="status">{status}</p> : null}
        {error ? <p className="support-contact-error" role="alert">{error}</p> : null}
      </form>
    </div>
  );
}

function getInitialIssueType(initialContext: string) {
  if (initialContext.includes("Community Multiplayer")) return "Community Multiplayer report";
  if (initialContext.includes("Community Solo")) return "Community Solo report";
  return "Proof receipt";
}

function formatSupportDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(date);
}
