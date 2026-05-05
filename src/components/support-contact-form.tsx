"use client";

import { FormEvent, useState } from "react";

const SUPPORT_EMAIL = "andreas.nordenadler@gmail.com";

export default function SupportContactForm() {
  const [status, setStatus] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const issueType = String(form.get("issueType") || "General").trim();
    const gameLink = String(form.get("gameLink") || "").trim();
    const message = String(form.get("message") || "").trim();

    const subject = `Side Quest Chess support: ${issueType}`;
    const body = [
      "Side Quest Chess support request",
      "",
      `Name: ${name || "Not provided"}`,
      `Email: ${email || "Not provided"}`,
      `Issue type: ${issueType}`,
      `Game / proof link: ${gameLink || "Not provided"}`,
      "",
      "Message:",
      message || "Not provided",
    ].join("\n");

    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setStatus("opening");
  }

  return (
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
        <select name="issueType" defaultValue="Proof receipt">
          <option>Proof receipt</option>
          <option>Account setup</option>
          <option>Quest rules</option>
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
        <textarea name="message" rows={6} required placeholder="Tell us what happened, what you expected, and which quest was involved." />
      </label>

      <div className="button-row">
        <button className="button primary" type="submit">Send support email</button>
      </div>
      {status ? <p className="support-contact-status" role="status">Opening your email app with the support request.</p> : null}
    </form>
  );
}
