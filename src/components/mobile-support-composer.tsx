"use client";

import { useMemo, useState, type FormEvent } from "react";

export type MobileWebSupportMessage = {
  id: string;
  at: string;
  message: string;
  source?: string | null;
};

const SUPPORT_NOTE_MAX_LENGTH = 900;

export function MobileSupportComposer({
  signedIn,
  initialMessages,
}: {
  signedIn: boolean;
  initialMessages: MobileWebSupportMessage[];
}) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(initialMessages);
  const [state, setState] = useState<{ busy: boolean; message: string | null; error: string | null }>({
    busy: false,
    message: null,
    error: null,
  });

  const supportThread = useMemo(
    () => [...messages].sort((a, b) => Date.parse(a.at) - Date.parse(b.at)),
    [messages],
  );

  async function submitSupport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!signedIn) {
      setState({ busy: false, message: null, error: "Sign in first so the support note can attach to your account." });
      return;
    }

    const trimmed = message.trim();
    if (trimmed.length < 3) {
      setState({ busy: false, message: null, error: "Write a little more so the note is useful." });
      return;
    }

    setState({ busy: true, message: null, error: null });

    try {
      const diagnostics = buildWebSupportDiagnostics();
      const response = await fetch("/api/support", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: `${trimmed}\n\n---\n${diagnostics}` }),
      });
      const result = await response.json().catch(() => null) as null | {
        message?: string;
        supportMessage?: MobileWebSupportMessage;
      };

      if (!response.ok) {
        throw new Error(result?.message ?? "Could not send the support note.");
      }

      if (result?.supportMessage) {
        setMessages((current) => [...current, result.supportMessage as MobileWebSupportMessage]);
      }
      setMessage("");
      setState({ busy: false, message: result?.message ?? "Message sent.", error: null });
    } catch (error) {
      setState({
        busy: false,
        message: null,
        error: error instanceof Error ? error.message : "Could not send the support note.",
      });
    }
  }

  async function copySupportDetails() {
    const diagnostics = buildWebSupportDiagnostics();
    try {
      await navigator.clipboard.writeText(diagnostics);
      setState({ busy: false, message: "Support details copied.", error: null });
    } catch {
      setState({ busy: false, message: null, error: "Could not copy support details in this browser." });
    }
  }

  return (
    <section className="sqc-support-card sqc-support-report" aria-label="Report a problem">
      <span className="sqc-card-eyebrow">Report a problem</span>
      <p>Something not working? Send a short note with what you tried and what happened. We can reply here if we need more details.</p>

      <div className="sqc-support-thread">
        <strong>Conversation</strong>
        {supportThread.length ? supportThread.map((entry) => (
          <article key={entry.id} className={entry.source === "admin" ? "sqc-support-message admin" : "sqc-support-message"}>
            <small>{entry.source === "admin" ? "Side Quest Chess support" : "You"} - {formatSupportDate(entry.at)}</small>
            <p>{entry.message}</p>
          </article>
        )) : (
          <p>Your messages and replies from Side Quest Chess support will appear here.</p>
        )}
      </div>

      <form className="sqc-support-form" onSubmit={submitSupport}>
        <label htmlFor="sqc-support-message">Message</label>
        <textarea
          id="sqc-support-message"
          maxLength={SUPPORT_NOTE_MAX_LENGTH}
          placeholder="What happened"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
        {state.message ? <p className="sqc-inline-success">{state.message}</p> : null}
        {state.error ? <p className="sqc-inline-error">{state.error}</p> : null}
        <button type="submit" disabled={state.busy}>{state.busy ? "Sending..." : "Send support message"}</button>
        <button type="button" onClick={copySupportDetails}>Copy support details</button>
      </form>
    </section>
  );
}

function buildWebSupportDiagnostics() {
  const lines = ["Side Quest Chess web diagnostics"];
  if (typeof window !== "undefined") {
    lines.push(`URL: ${window.location.href}`);
    lines.push(`User agent: ${navigator.userAgent}`);
  }
  return lines.join("\n");
}

function formatSupportDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "recently";
  return date.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });
}
