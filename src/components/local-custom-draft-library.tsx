"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getLocalCustomDraftEditHref, readLocalCustomDrafts, type LocalCustomDraft } from "@/lib/local-custom-drafts";

export function LocalCustomDraftList({ drafts, hasAccountQuests = false }: { drafts: LocalCustomDraft[]; hasAccountQuests?: boolean }) {
  if (!drafts.length && hasAccountQuests) {
    return (
      <div className="sqc-local-custom-empty">
        <div className="sqc-local-custom-empty-copy">
          <strong>No local drafts yet.</strong>
          <small>Build a Side Quest and save it in this browser.</small>
        </div>
      </div>
    );
  }

  if (!drafts.length) {
    return (
      <div className="sqc-local-custom-empty">
        <div className="sqc-local-custom-empty-copy">
          <span>Empty workshop</span>
          <strong>No custom Side Quests yet.</strong>
          <small>Create your own chess challenge and give it a Coat of Arms.</small>
        </div>
        <ol className="sqc-local-custom-workflow" aria-label="Custom Side Quest workflow">
          <li><b>01</b><strong>Shape the rule</strong><small>Start with the chess idea you want proof to check.</small></li>
          <li><b>02</b><strong>Choose visibility later</strong><small>Keep it private while you refine it, then publish when ready.</small></li>
          <li><b>03</b><strong>Play Solo or host</strong><small>Saved Side Quests work alone or in Multiplayer Side Quests.</small></li>
        </ol>
        <Link className="sqc-local-custom-start" href="/create-custom-side-quest">Create a private Side Quest</Link>
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

export default function LocalCustomDraftLibrary({ hasAccountQuests = false }: { hasAccountQuests?: boolean }) {
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

  return <LocalCustomDraftList drafts={drafts} hasAccountQuests={hasAccountQuests} />;
}
