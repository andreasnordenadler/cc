"use client";

import Image from "next/image";
import { useRef, type RefObject } from "react";
import AccessibleModalDialog from "@/components/accessible-modal-dialog";
import type { SoloCompletion } from "@/lib/solo-check-result";

export function SoloCompletionCelebration({
  completion,
  mode = "solo",
  extraCompletedCount = 0,
  onClose,
  returnFocusRef,
}: {
  completion: SoloCompletion;
  mode?: "solo" | "multiplayer";
  extraCompletedCount?: number;
  onClose: () => void;
  returnFocusRef?: RefObject<HTMLElement | null>;
}) {
  const capturedReturnFocusRef = useRef<HTMLElement | null>(
    typeof document !== "undefined" && document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null,
  );

  return (
    <AccessibleModalDialog
      backdropClassName="sqc-celebration-backdrop"
      className="sqc-celebration-card"
      labelledBy="sqc-celebration-title sqc-celebration-challenge"
      describedBy="sqc-celebration-description"
      dismissOnBackdrop={false}
      onDismiss={onClose}
      returnFocusRef={returnFocusRef ?? capturedReturnFocusRef}
      style={{ "--sqc-celebration-accent": completion.accentColor } as React.CSSProperties}
    >
      <p className="sqc-celebration-kicker">{mode === "multiplayer" ? "Multiplayer proof accepted" : "Proof accepted"}</p>
      <h2 id="sqc-celebration-title">{mode === "multiplayer" ? "Quest completed in Multiplayer" : "Quest completed"}</h2>
      <p id="sqc-celebration-description" className="sqc-celebration-subline">{mode === "multiplayer" ? "Solo Side Quest completion recorded too." : "Coat of Arms unlocked."}</p>
      <div className="sqc-celebration-coat-frame" aria-hidden="true">
        <span className="sqc-celebration-particles">✦　✧　✦　✧　✦　✧</span>
        <Image className="sqc-celebration-coat" src={completion.badgeImage} alt="" width={230} height={230} />
        <Image className="sqc-celebration-seal" src="/mobile-source/stamps/quest-complete-red-wax-sqc-v3.png" alt="" width={92} height={92} />
      </div>
      <h3 id="sqc-celebration-challenge">{completion.challengeTitle}</h3>
      <p className="sqc-celebration-badge">Coat of Arms: {completion.badgeName}</p>
      <p className="sqc-celebration-flavor">{completion.unlockCopy}</p>
      {extraCompletedCount ? <p className="sqc-celebration-meta">+{extraCompletedCount} more Side Quest{extraCompletedCount === 1 ? "" : "s"} completed in this refresh.</p> : null}
      <button data-dialog-initial-focus type="button" className="sqc-celebration-close" aria-label="Close celebration" onClick={onClose}>×</button>
    </AccessibleModalDialog>
  );
}
