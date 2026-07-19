"use client";

import Image from "next/image";
import { useEffect } from "react";
import type { SoloCompletion } from "@/lib/solo-check-result";

export function SoloCompletionCelebration({
  completion,
  mode = "solo",
  extraCompletedCount = 0,
  onClose,
}: {
  completion: SoloCompletion;
  mode?: "solo" | "multiplayer";
  extraCompletedCount?: number;
  onClose: () => void;
}) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose]);

  return (
    <div className="sqc-celebration-backdrop">
      <section
        className="sqc-celebration-card"
        role="dialog"
        aria-modal="true"
        aria-label={`${mode === "multiplayer" ? "Quest completed in Multiplayer" : "Quest completed"}. ${completion.challengeTitle}. ${mode === "multiplayer" ? "Solo Side Quest completion recorded too." : "Coat of Arms unlocked."}`}
        style={{ "--sqc-celebration-accent": completion.accentColor } as React.CSSProperties}
      >
        <p className="sqc-celebration-kicker">{mode === "multiplayer" ? "Multiplayer proof accepted" : "Proof accepted"}</p>
        <h2>{mode === "multiplayer" ? "Quest completed in Multiplayer" : "Quest completed"}</h2>
        <p className="sqc-celebration-subline">{mode === "multiplayer" ? "Solo Side Quest completion recorded too." : "Coat of Arms unlocked."}</p>
        <div className="sqc-celebration-coat-frame" aria-hidden="true">
          <span className="sqc-celebration-particles">✦　✧　✦　✧　✦　✧</span>
          <Image className="sqc-celebration-coat" src={completion.badgeImage} alt="" width={230} height={230} />
          <Image className="sqc-celebration-seal" src="/mobile-source/stamps/quest-complete-red-wax-sqc-v3.png" alt="" width={92} height={92} />
        </div>
        <h3>{completion.challengeTitle}</h3>
        <p className="sqc-celebration-badge">Coat of Arms: {completion.badgeName}</p>
        <p className="sqc-celebration-flavor">{completion.unlockCopy}</p>
        {extraCompletedCount ? <p className="sqc-celebration-meta">+{extraCompletedCount} more Side Quest{extraCompletedCount === 1 ? "" : "s"} completed in this refresh.</p> : null}
        <button type="button" className="sqc-celebration-close" aria-label="Close celebration" onClick={onClose} autoFocus>×</button>
      </section>
    </div>
  );
}
