"use client";

import { useFormStatus } from "react-dom";
import { checkActiveChallenge } from "@/app/actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button className="sqc-refresh" type="submit" disabled={pending} aria-label="Refresh active Solo Side Quest">
      <svg className="sqc-refresh-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4a8 8 0 1 0 7.73 10h-2.08A6 6 0 1 1 12 6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35Z" />
      </svg>
    </button>
  );
}

export default function ActiveSoloActions() {
  return <form className="sqc-refresh-form" action={checkActiveChallenge}><Submit /></form>;
}
