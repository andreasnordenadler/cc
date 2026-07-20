"use client";

import Image from "next/image";
import { useEffect, useId, useRef } from "react";

type CoatDialogHistory = Pick<History, "state" | "pushState" | "back">;
type CoatDialogPopStateTarget = {
  addEventListener(type: "popstate", listener: () => void): void;
  removeEventListener(type: "popstate", listener: () => void): void;
};

export function installSoloCoatDialogHistory(
  history: CoatDialogHistory,
  events: CoatDialogPopStateTarget,
  entryId: string,
  onBack: () => void,
  onForward: () => void = () => undefined,
) {
  let open = true;
  let traversalPending = false;
  let disposed = false;
  const syncFromHistory = () => {
    const entryIsCurrent = history.state?.sqcCoat === entryId;
    if (entryIsCurrent && !open) {
      open = true;
      traversalPending = false;
      onForward();
      return;
    }
    if (!entryIsCurrent && open) {
      open = false;
      traversalPending = false;
      onBack();
    }
  };
  events.addEventListener("popstate", syncFromHistory);
  const currentState = history.state && typeof history.state === "object" ? history.state : {};
  history.pushState({ ...currentState, sqcCoat: entryId }, "");

  return {
    close(beforeBack?: () => void) {
      if (!open || traversalPending || disposed) return false;
      beforeBack?.();
      if (history.state?.sqcCoat === entryId) {
        traversalPending = true;
        history.back();
      }
      else {
        open = false;
        onBack();
      }
      return true;
    },
    readyForNewEntry() {
      return !open && !traversalPending && !disposed;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      events.removeEventListener("popstate", syncFromHistory);
      if (open && !traversalPending && history.state?.sqcCoat === entryId) history.back();
    },
  };
}

export function openSoloCoatDialog(dialog: Pick<HTMLDialogElement, "showModal"> | null) {
  dialog?.showModal();
}

export function closeSoloCoatDialog(dialog: Pick<HTMLDialogElement, "close"> | null) {
  dialog?.close();
}

export default function SoloCoatLightbox({
  challengeId,
  badgeName,
  badgePath,
  glowPath,
}: {
  challengeId: string;
  badgeName: string;
  badgePath: string;
  glowPath: string | null;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const historyRef = useRef<ReturnType<typeof installSoloCoatDialogHistory> | null>(null);
  const historyEntryId = useId();
  const dialogId = `solo-coat-${challengeId}`;

  useEffect(() => () => {
    historyRef.current?.dispose();
    historyRef.current = null;
  }, []);

  function dismissDialog() {
    const dialog = dialogRef.current;
    const installedHistory = historyRef.current;
    if (!installedHistory) {
      closeSoloCoatDialog(dialog);
      return;
    }
    installedHistory.close(() => closeSoloCoatDialog(dialog));
  }

  function showDialog() {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    if (historyRef.current && !historyRef.current.readyForNewEntry()) return;
    historyRef.current?.dispose();
    historyRef.current = null;
    openSoloCoatDialog(dialog);
    const installedHistory = installSoloCoatDialogHistory(
      window.history,
      window,
      historyEntryId,
      () => closeSoloCoatDialog(dialog),
      () => openSoloCoatDialog(dialog),
    );
    historyRef.current = installedHistory;
  }

  return (
    <>
      <button
        type="button"
        className="sqc-detail-coat-frame"
        aria-label="Enlarge Coat of Arms"
        aria-controls={dialogId}
        aria-haspopup="dialog"
        onClick={showDialog}
      >
        {glowPath ? <Image className="sqc-detail-coat-glow" alt="" src={glowPath} width={152} height={164} priority /> : null}
        <Image className="sqc-detail-coat-image" alt="" src={badgePath} width={108} height={118} priority />
      </button>
      <dialog
        ref={dialogRef}
        id={dialogId}
        aria-label={`Enlarged Coat of Arms: ${badgeName}`}
        className="sqc-coat-lightbox"
        onCancel={(event) => {
          event.preventDefault();
          dismissDialog();
        }}
      >
        <button
          type="button"
          className="sqc-coat-lightbox-close"
          aria-label="Close enlarged Coat of Arms"
          onClick={dismissDialog}
        >
          <span className="sqc-coat-lightbox-card">
            {glowPath ? <Image className="sqc-coat-lightbox-glow" alt="" src={glowPath} width={330} height={360} /> : null}
            <Image className="sqc-coat-lightbox-image" alt="" src={badgePath} width={238} height={268} />
            <strong>{badgeName}</strong>
          </span>
        </button>
      </dialog>
    </>
  );
}
