"use client";

import { useFormStatus } from "react-dom";
import { checkActiveChallenge } from "@/app/actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button className="sqc-refresh" type="submit" disabled={pending} aria-label="Refresh active Solo Side Quest">
      <span aria-hidden="true" />
    </button>
  );
}

export default function ActiveSoloActions() {
  return <form className="sqc-refresh-form" action={checkActiveChallenge}><Submit /></form>;
}
