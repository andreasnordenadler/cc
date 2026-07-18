"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getLocalCustomDraftEditHref, readLocalCustomDrafts, type LocalCustomDraft } from "@/lib/local-custom-drafts";

export function LocalCustomDraftList({ drafts }: { drafts: LocalCustomDraft[] }) {
  if (!drafts.length) {
    return (
      <div className="sqc-local-custom-empty">
        <strong>No local drafts yet.</strong>
        <small>Build a Side Quest and save it in this browser.</small>
      </div>
    );
  }

  return (
    <div className="sqc-catalog sqc-local-custom-drafts" aria-label="Local Custom Side Quest drafts">
      {drafts.map((draft) => (
        <Link
          aria-label={`Continue draft ${draft.title}`}
          className="sqc-app-row text-only sqc-local-custom-draft-row"
          href={getLocalCustomDraftEditHref(draft.id)}
          key={draft.id}
        >
          <span className="sqc-row-copy">
            <span className="sqc-row-badge">Draft</span>
            <strong className="sqc-row-title-line"><span>{draft.title}</span></strong>
            <small>{draft.summary || "Add a description when you continue this draft."}</small>
            <small>Saved only in this browser</small>
          </span>
          <span className="sqc-row-status">Continue draft</span>
        </Link>
      ))}
    </div>
  );
}

export default function LocalCustomDraftLibrary() {
  const [drafts, setDrafts] = useState<LocalCustomDraft[] | null>(null);

  useEffect(() => {
    let mounted = true;
    queueMicrotask(() => {
      if (mounted) setDrafts(readLocalCustomDrafts(window.localStorage));
    });
    return () => { mounted = false; };
  }, []);

  if (drafts === null) {
    return <p className="sqc-local-draft-loading" role="status">Loading drafts saved in this browser…</p>;
  }

  return <LocalCustomDraftList drafts={drafts} />;
}
