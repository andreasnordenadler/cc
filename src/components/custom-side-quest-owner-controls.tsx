"use client";

import Link from "next/link";
import { useRef, useState, type RefObject } from "react";
import { deleteCustomOwnerQuest, duplicateCustomOwnerQuest, getCustomOwnerDeleteConfirmation, getCustomOwnerDuplicateSuccessMessage, getCustomOwnerMultiplayerHref, getCustomOwnerStateReloadDestination, getCustomOwnerStateSavedMessage, saveCustomOwnerState, type CustomOwnerSaveInput } from "@/lib/custom-owner-controls";
import AccessibleModalDialog from "./accessible-modal-dialog";
import FullDocumentLink from "./full-document-link";

export function CustomOwnerDeleteControls({
  active,
  busy,
  isConfirmingDelete,
  message,
  messageIsError,
  onDelete,
  onDismissDelete,
  onOpenDelete,
  openDeleteDialogRef,
}: {
  active: boolean;
  busy: string;
  isConfirmingDelete: boolean;
  message: string;
  messageIsError: boolean;
  onDelete: () => void;
  onDismissDelete: () => void;
  onOpenDelete: () => void;
  openDeleteDialogRef: RefObject<HTMLButtonElement | null>;
}) {
  return <>
    <button ref={openDeleteDialogRef} className="sqc-detail-quiet-button" disabled={Boolean(busy)} onClick={onOpenDelete} type="button">{busy === "delete" ? "Deleting…" : "Delete from library"}</button>
    {isConfirmingDelete ? (
      <AccessibleModalDialog
        className="quest-switch-dialog quest-reset-dialog"
        labelledBy="custom-owner-delete-title"
        describedBy="custom-owner-delete-copy"
        onDismiss={() => {
          if (busy !== "delete") onDismissDelete();
        }}
        returnFocusRef={openDeleteDialogRef}
        role="alertdialog"
      >
        <span className="eyebrow">Delete custom Side Quest?</span>
        <h2 id="custom-owner-delete-title">Remove this Side Quest?</h2>
        <p id="custom-owner-delete-copy">{getCustomOwnerDeleteConfirmation(active)}</p>
        {message ? <p className={messageIsError ? "groupquest-join-error" : "sqc-action-success"} role={messageIsError ? "alert" : "status"}>{message}</p> : null}
        <div className="button-row quest-switch-actions">
          <button data-dialog-initial-focus type="button" className="button secondary" disabled={busy === "delete"} onClick={onDismissDelete}>Keep Side Quest</button>
          <button type="button" className="button danger" disabled={busy === "delete"} onClick={onDelete}>{busy === "delete" ? "Deleting…" : "Delete Side Quest"}</button>
        </div>
      </AccessibleModalDialog>
    ) : null}
  </>;
}

export default function CustomSideQuestOwnerControls({ quest, active = false }: { quest: CustomOwnerSaveInput; active?: boolean }) {
  const [persistedVisibility, setPersistedVisibility] = useState(quest.visibility);
  const [persistedLifecycle, setPersistedLifecycle] = useState(quest.lifecycle);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [messageIsError, setMessageIsError] = useState(true);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const openDeleteDialogRef = useRef<HTMLButtonElement>(null);
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
    } catch (caught) {
      if (caught instanceof Error && caught.message === "Remove objectionable language before publishing this Community Side Quest.") {
        setMessage(caught.message);
      } else {
        setMessage("Could not save this Side Quest right now. Please try again.");
      }
    }
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
    {multiplayerHref ? <FullDocumentLink className="sqc-detail-secondary-button" href={multiplayerHref}>Use in Multiplayer</FullDocumentLink> : null}
    {message && !isConfirmingDelete ? <p className={messageIsError ? "groupquest-join-error" : "sqc-action-success"} role={messageIsError ? "alert" : "status"}>{message}</p> : null}
    <div className="sqc-community-detail-actions" aria-label="Custom Side Quest lifecycle actions">
      <button className="sqc-detail-secondary-button" disabled={Boolean(busy)} onClick={duplicate} type="button">{busy === "duplicate" ? "Duplicating…" : "Duplicate"}</button>
      {persistedLifecycle !== "published" ? <button className="sqc-detail-secondary-button" disabled={Boolean(busy)} onClick={() => { void runStateMutation({ lifecycle: "published", visibility: persistedVisibility }); }} type="button">{busy === "state" ? "Saving…" : "Publish"}</button> : null}
      {persistedLifecycle === "published" ? <button className="sqc-detail-secondary-button" disabled={Boolean(busy)} onClick={() => { void runStateMutation({ lifecycle: "published", visibility: persistedVisibility === "public" ? "private" : "public" }); }} type="button">{busy === "state" ? "Saving…" : persistedVisibility === "public" ? "Make private again" : "Make public / shareable"}</button> : null}
      {persistedLifecycle !== "archived" ? <button className="sqc-detail-secondary-button" disabled={Boolean(busy)} onClick={() => { void runStateMutation({ lifecycle: "archived", visibility: persistedVisibility }); }} type="button">{busy === "state" ? "Saving…" : "Archive"}</button> : null}
      <CustomOwnerDeleteControls
        active={active}
        busy={busy}
        isConfirmingDelete={isConfirmingDelete}
        message={message}
        messageIsError={messageIsError}
        onDelete={() => { void remove(); }}
        onDismissDelete={() => setIsConfirmingDelete(false)}
        onOpenDelete={() => { setMessage(""); setMessageIsError(true); setIsConfirmingDelete(true); }}
        openDeleteDialogRef={openDeleteDialogRef}
      />
    </div>
  </section>;
}
