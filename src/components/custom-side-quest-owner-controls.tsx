"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { buildCustomOwnerSavePayload, getCustomOwnerDestination, getCustomOwnerMultiplayerHref, type CustomOwnerSaveInput } from "@/lib/custom-owner-controls";

export default function CustomSideQuestOwnerControls({ quest }: { quest: CustomOwnerSaveInput }) {
  const multiplayerHref = getCustomOwnerMultiplayerHref(quest);
  const [title, setTitle] = useState(quest.title);
  const [summary, setSummary] = useState(quest.summary);
  const [visibility, setVisibility] = useState<"private" | "public">(quest.visibility);
  const [lifecycle, setLifecycle] = useState<"draft" | "published" | "archived">(quest.lifecycle);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");

  async function save(event?: FormEvent, overrides: Partial<CustomOwnerSaveInput> = {}) {
    event?.preventDefault();
    setMessage("");
    let body: ReturnType<typeof buildCustomOwnerSavePayload>;
    try {
      body = buildCustomOwnerSavePayload({ ...quest, title, summary, visibility, lifecycle, ...overrides });
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Check this Side Quest and try again.");
      return;
    }
    setBusy("save");
    try {
      const response = await fetch("/api/mobile/custom-quests", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const result = await response.json().catch(() => null);
      const destination = response.ok ? getCustomOwnerDestination(result, quest.id) : null;
      if (!destination) { setMessage("Could not save this Side Quest right now. Please try again."); return; }
      window.location.assign(destination);
    } catch { setMessage("Could not save this Side Quest right now. Please try again."); }
    finally { setBusy(""); }
  }

  async function duplicate() {
    setBusy("duplicate"); setMessage("");
    try {
      const body = buildCustomOwnerSavePayload({ ...quest, id: quest.id, title: `${title} Copy`, summary, visibility, lifecycle: "published" });
      const copy = {
        title: body.title,
        summary: body.summary,
        config: body.config,
        visibility: body.visibility,
        lifecycle: body.lifecycle,
      };
      const response = await fetch("/api/mobile/custom-quests", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(copy) });
      const result = await response.json().catch(() => null) as { ok?: boolean; customQuest?: { id?: string } } | null;
      if (!response.ok || result?.ok !== true || typeof result.customQuest?.id !== "string" || !/^custom-[a-z0-9-]+$/i.test(result.customQuest.id)) { setMessage("Could not duplicate this Side Quest right now."); return; }
      window.location.assign(`/custom-side-quests/${encodeURIComponent(result.customQuest.id)}`);
    } catch { setMessage("Could not duplicate this Side Quest right now."); }
    finally { setBusy(""); }
  }

  async function remove() {
    if (!window.confirm(`Delete “${title}” permanently? This cannot be undone.`)) return;
    setBusy("delete"); setMessage("");
    try {
      const response = await fetch(`/api/mobile/custom-quests?id=${encodeURIComponent(quest.id)}`, { method: "DELETE" });
      if (!response.ok) { setMessage("Could not delete this Side Quest right now."); return; }
      window.location.assign("/custom-side-quests");
    } catch { setMessage("Could not delete this Side Quest right now."); }
    finally { setBusy(""); }
  }

  return <form className="sqc-native-card sqc-custom-builder-card" aria-label="Manage Custom Side Quest" onSubmit={save}>
    <span className="sqc-card-eyebrow">Owner controls</span>
    <label className="sqc-form-row"><span>Side Quest name</span><input aria-label="Side Quest name" maxLength={80} onChange={(event) => setTitle(event.target.value)} required value={title} /></label>
    <label className="sqc-form-row"><span>Description / goal</span><textarea aria-label="Description or goal" maxLength={500} onChange={(event) => setSummary(event.target.value)} value={summary} /></label>
    <span className="sqc-form-label">Visibility</span>
    <div className="sqc-filter-row"><button className={visibility === "private" ? "active" : ""} onClick={() => setVisibility("private")} type="button">Private</button><button className={visibility === "public" ? "active" : ""} onClick={() => setVisibility("public")} type="button">Public</button></div>
    <label className="sqc-form-row"><span>Lifecycle</span><select aria-label="Lifecycle" onChange={(event) => setLifecycle(event.target.value as typeof lifecycle)} value={lifecycle}><option value="published">Ready to play</option><option value="draft">Draft</option><option value="archived">Archived</option></select></label>
    <p>Your saved rule conditions stay unchanged while you edit the name, description, visibility, or lifecycle.</p>
    <Link className="sqc-detail-secondary-button" href={`/create-custom-side-quest?edit=${encodeURIComponent(quest.id)}`}>Edit rule conditions</Link>
    {multiplayerHref ? <Link className="sqc-detail-secondary-button" href={multiplayerHref}>Use in Multiplayer</Link> : null}
    {message ? <p className="groupquest-join-error" role="alert">{message}</p> : null}
    <button className="sqc-create-footer-button" disabled={Boolean(busy)} type="submit">{busy === "save" ? "Saving…" : "Save changes"}</button>
    <div className="sqc-community-detail-actions" aria-label="Custom Side Quest lifecycle actions">
      <button className="sqc-detail-secondary-button" disabled={Boolean(busy)} onClick={duplicate} type="button">{busy === "duplicate" ? "Duplicating…" : "Duplicate"}</button>
      {lifecycle !== "archived" ? <button className="sqc-detail-secondary-button" disabled={Boolean(busy)} onClick={() => { setLifecycle("archived"); void save(undefined, { lifecycle: "archived", visibility: "private" }); }} type="button">Archive</button> : null}
      <button className="sqc-detail-quiet-button" disabled={Boolean(busy)} onClick={remove} type="button">{busy === "delete" ? "Deleting…" : "Delete"}</button>
    </div>
  </form>;
}
