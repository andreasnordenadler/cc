"use client";

import { FormEvent, useState } from "react";
import { buildCustomCreatePayload, getCreateErrorMessage, getCustomCreateDestination } from "@/lib/mobile-create-forms";

const templates = [
  { id: "knights-first", title: "Knight-only opening", helper: "Open Nf3, ...Nf6, Nc3, ...Nc6, then win." },
  { id: "no-castle", title: "No-castle game", helper: "Win without moving your king." },
  { id: "queen-trade", title: "Queen trade challenge", helper: "Remove the queens, then win." },
  { id: "win", title: "Win a game", helper: "Complete the quest by winning." },
] as const;

export default function MobileCustomCreateForm({ signedIn }: { signedIn: boolean }) {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [template, setTemplate] = useState<string>("no-castle");
  const [visibility, setVisibility] = useState<"private" | "public">("private");
  const [lifecycle, setLifecycle] = useState<"draft" | "published">("published");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!signedIn) { setError("Sign in to create a Side Quest."); return; }
    setError("");
    let body;
    try {
      body = buildCustomCreatePayload({ title, summary, template: template as "no-castle", visibility, lifecycle });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Check the form and try again.");
      return;
    }
    setSaving(true);
    try {
      const response = await fetch("/api/mobile/custom-quests", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const result = await response.json().catch(() => null);
      const destination = response.ok ? getCustomCreateDestination(result) : null;
      if (!destination) { setError(getCreateErrorMessage(response.status, result)); setSaving(false); return; }
      window.location.assign(destination);
    } catch {
      setError("Could not create this Side Quest right now. Please try again.");
      setSaving(false);
    }
  }

  return <form className="sqc-native-card sqc-custom-builder-card" aria-label="Custom Side Quest builder" onSubmit={submit}>
    <span className="sqc-card-eyebrow">Start from a supported rule</span>
    <div className="sqc-option-grid">
      {templates.map((item) => <button className={template === item.id ? "sqc-option-card selected" : "sqc-option-card"} key={item.id} onClick={() => setTemplate(item.id)} type="button"><strong>{item.title}</strong><span>{item.helper}</span></button>)}
    </div>
    <label className="sqc-form-row"><span>Side Quest name</span><input aria-label="Side Quest name" maxLength={80} onChange={(event) => setTitle(event.target.value)} placeholder="Name this custom Side Quest" required value={title} /></label>
    <label className="sqc-form-row"><span>Description / goal</span><textarea aria-label="Description or goal" maxLength={500} onChange={(event) => setSummary(event.target.value)} placeholder="Tell players what to accomplish" value={summary} /></label>
    <span className="sqc-form-label">Visibility</span>
    <div className="sqc-filter-row"><button className={visibility === "private" ? "active" : ""} onClick={() => setVisibility("private")} type="button">Private</button><button className={visibility === "public" ? "active" : ""} onClick={() => setVisibility("public")} type="button">Public</button></div>
    <label className="sqc-form-row"><span>Save state</span><select aria-label="Save state" onChange={(event) => setLifecycle(event.target.value as "draft" | "published")} value={lifecycle}><option value="published">Ready to play</option><option value="draft">Draft</option></select></label>
    <p>Identity and ownership come from your signed-in SQC session. Published quests require a supported condition.</p>
    {error ? <p className="groupquest-join-error" role="alert">{error}</p> : null}
    <button className="sqc-create-footer-button" disabled={saving} type="submit">{saving ? "Saving…" : signedIn ? "Save Custom Side Quest" : "Sign in to save"}</button>
  </form>;
}
