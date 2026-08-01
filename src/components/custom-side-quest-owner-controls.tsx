"use client";

import Link from "next/link";
import { useState } from "react";
import { deleteCustomOwnerQuest, duplicateCustomOwnerQuest, getCustomOwnerDeleteConfirmation, getCustomOwnerDuplicateSuccessMessage, getCustomOwnerMultiplayerHref, getCustomOwnerStateReloadDestination, getCustomOwnerStateSavedMessage, saveCustomOwnerState, type CustomOwnerSaveInput } from "@/lib/custom-owner-controls";

export default function CustomSideQuestOwnerControls({ quest, active = false }: { quest: CustomOwnerSaveInput; active?: boolean }) {
  const [persistedVisibility, setPersistedVisibility] = useState(quest.visibility);
  const [persistedLifecycle, setPersistedLifecycle] = useState(quest.lifecycle);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [messageIsError, setMessageIsError] = useState(true);
  const multiplayerHref = getCustomOwnerMultiplayerHref({ ...quest, lifecycle: persistedLifecycle });


  async function runStateMutation(next: Pick<CustomOwnerSaveInput, "lifecycle" | "visibility">) {
    setBusy("state"); setMessage(""); setMessageIsError(true);
    try {
      const destination = await saveCustomOwnerState(quest, next);
      if (!destination) { setMessage("Could not save this Side Quest right now. Please try again."); return; }
      setPersistedLifecycle(next.lifecycle);
      setPersistedVisibility(next.visibility);
      setMessageIsError(false);
      setMessage(getCustomOwnerStateSavedMessage(quest.title, next));
      const reloadDestination = getCustomOwnerStateReloadDestination(destination, next);
      if (reloadDestination) window.location.assign(reloadDestination);
    } catch { setMessage("Could not save this Side Quest right now. Please try again."); }
    finally { setBusy(""); }
  }

  async function duplicate() {
    setBusy("duplicate"); setMessage(""); setMessageIsError(true);
    try {
      const destination = await duplicateCustomOwnerQuest(quest);
      if (!destination) { setMessage("Could not duplicate this Side Quest right now."); return; }
      setMessageIsError(false);
      setMessage(getCustomOwnerDuplicateSuccessMessage(quest.title));
    } catch { setMessage("Could not duplicate this Side Quest right now."); }
    finally { setBusy(""); }
  }

  async function remove() {
    if (!window.confirm(getCustomOwnerDeleteConfirmation(active))) return;
    setBusy("delete"); setMessage(""); setMessageIsError(true);
    try {
      const destination = await deleteCustomOwnerQuest(quest.id);
      if (!destination) { setMessage("Could not delete this Side Quest right now."); return; }
      window.location.assign(destination);
    } catch { setMessage("Could not delete this Side Quest right now."); }
    finally { setBusy(""); }
  }

  return <section className="sqc-native-card sqc-custom-builder-card sqc-custom-owner-management" aria-label="Manage Custom Side Quest">
    <span className="sqc-card-eyebrow">Owner controls</span>
    <Link className="sqc-detail-secondary-button" href={`/create-custom-side-quest?edit=${encodeURIComponent(quest.id)}`}>Edit name &amp; rules</Link>
    {multiplayerHref ? <Link className="sqc-detail-secondary-button" href={multiplayerHref}>Use in Multiplayer</Link> : null}
    {message ? <p className={messageIsError ? "groupquest-join-error" : "sqc-action-success"} role={messageIsError ? "alert" : "status"}>{message}</p> : null}
    <div className="sqc-community-detail-actions" aria-label="Custom Side Quest lifecycle actions">
      <button className="sqc-detail-secondary-button" disabled={Boolean(busy)} onClick={duplicate} type="button">{busy === "duplicate" ? "Duplicating…" : "Duplicate"}</button>
      {persistedLifecycle !== "published" ? <button className="sqc-detail-secondary-button" disabled={Boolean(busy)} onClick={() => { void runStateMutation({ lifecycle: "published", visibility: persistedVisibility }); }} type="button">{busy === "state" ? "Saving…" : "Publish"}</button> : null}
      {persistedLifecycle === "published" ? <button className="sqc-detail-secondary-button" disabled={Boolean(busy)} onClick={() => { void runStateMutation({ lifecycle: "published", visibility: persistedVisibility === "public" ? "private" : "public" }); }} type="button">{busy === "state" ? "Saving…" : persistedVisibility === "public" ? "Make private again" : "Make public / shareable"}</button> : null}
      {persistedLifecycle !== "archived" ? <button className="sqc-detail-secondary-button" disabled={Boolean(busy)} onClick={() => { void runStateMutation({ lifecycle: "archived", visibility: persistedVisibility }); }} type="button">{busy === "state" ? "Saving…" : "Archive"}</button> : null}
      <button className="sqc-detail-quiet-button" disabled={Boolean(busy)} onClick={remove} type="button">{busy === "delete" ? "Deleting…" : "Delete from library"}</button>
    </div>
  </section>;
}
