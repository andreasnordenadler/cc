"use client";

import { FormEvent, useEffect, useState } from "react";
import type { CustomSideQuestRuleBlock } from "@/lib/custom-side-quests";
import {
  buildCustomCreatePayload,
  buildCustomEditConfig,
  describeCustomRuleBlock,
  getCreateErrorMessage,
  getCustomCreateDestination,
  getCustomEditFormState,
  getCustomTemplateBlocks,
  type CustomEditQuestInput,
  type CustomTemplate,
} from "@/lib/mobile-create-forms";
import { getCustomOwnerDestination } from "@/lib/custom-owner-controls";
import {
  getLocalCustomDraftFormState,
  getLocalCustomDraftIdFromSearch,
  saveLocalCustomDraft,
  tryRemoveLocalCustomDraft,
} from "@/lib/local-custom-drafts";

const templates: Array<{ id: CustomTemplate; title: string; helper: string }> = [
  { id: "knights-first", title: "Knight-only opening", helper: "Open Nf3, ...Nf6, Nc3, ...Nc6, then win." },
  { id: "no-castle", title: "No-castle game", helper: "Win without moving your king." },
  { id: "queen-trade", title: "Queen trade challenge", helper: "Remove the queens, then win." },
  { id: "win", title: "Win a game", helper: "Complete the quest by winning." },
];

const conditionChoices: Array<{ id: string; label: string; helper: string; block: CustomSideQuestRuleBlock }> = [
  { id: "win", label: "Win the game", helper: "The linked player must win.", block: { type: "gameResult", result: "win" } },
  { id: "draw", label: "Draw the game", helper: "The linked player must draw.", block: { type: "gameResult", result: "draw" } },
  { id: "lose", label: "Finish with a loss", helper: "The linked player must lose.", block: { type: "gameResult", result: "lose" } },
  { id: "queen-gone", label: "Your queen is gone", helper: "Your queen is captured by game end.", block: { type: "pieceState", piece: "queen", owner: "my", condition: "gone", timing: { atGameEnd: true } } },
  { id: "king-still", label: "Do not move your king", helper: "Your king stays on its starting square.", block: { type: "pieceState", piece: "king", owner: "my", condition: "not moved", timing: { atGameEnd: true } } },
  { id: "knights-first", label: "Knight-only opening", helper: "Play Nf3, ...Nf6, Nc3, ...Nc6 from move 1.", block: { type: "openingSequence", raw: "Nf3 Nf6 Nc3 Nc6", moves: ["Nf3", "Nf6", "Nc3", "Nc6"], anchor: "gameStart" } },
];

function cloneBlock(block: CustomSideQuestRuleBlock) {
  return structuredClone(block);
}

function choiceIdForBlock(block: CustomSideQuestRuleBlock) {
  const encoded = JSON.stringify(block);
  return conditionChoices.find((choice) => JSON.stringify(choice.block) === encoded)?.id ?? "advanced";
}

export default function MobileCustomCreateForm({ signedIn, initialQuest = null }: { signedIn: boolean; initialQuest?: CustomEditQuestInput | null }) {
  const initialState = initialQuest ? getCustomEditFormState(initialQuest) : null;
  const [title, setTitle] = useState(initialState?.title ?? "");
  const [summary, setSummary] = useState(initialState?.summary ?? "");
  const [logic, setLogic] = useState<"all" | "any">(initialState?.logic ?? "all");
  const [blocks, setBlocks] = useState<CustomSideQuestRuleBlock[]>(() => initialState?.blocks.map(cloneBlock) ?? getCustomTemplateBlocks("no-castle"));
  const [visibility, setVisibility] = useState<"private" | "public">(initialState?.visibility ?? "private");
  const [lifecycle, setLifecycle] = useState<"draft" | "published" | "archived">(initialState?.lifecycle ?? "published");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingLocalDraftId, setEditingLocalDraftId] = useState<string | null>(null);

  useEffect(() => {
    if (initialQuest) return;
    const draftId = getLocalCustomDraftIdFromSearch(window.location.search);
    if (!draftId) return;
    const draft = getLocalCustomDraftFormState(window.localStorage, draftId);
    if (!draft) return;
    queueMicrotask(() => {
      setEditingLocalDraftId(draft.id);
      setTitle(draft.title);
      setSummary(draft.summary);
      setLogic(draft.logic);
      setBlocks(draft.blocks);
    });
  }, [initialQuest]);

  if (initialQuest && !initialState) {
    return <div className="sqc-native-card groupquest-join-error" role="alert">This saved Side Quest could not be opened safely. Return to your library and try again.</div>;
  }

  function applyTemplate(template: CustomTemplate) {
    setBlocks(getCustomTemplateBlocks(template));
    setError("");
  }

  function updateCondition(index: number, choiceId: string) {
    const choice = conditionChoices.find((item) => item.id === choiceId);
    if (!choice) return;
    setBlocks((current) => current.map((block, blockIndex) => blockIndex === index ? cloneBlock(choice.block) : block));
  }

  function addCondition() {
    setBlocks((current) => current.length >= 6 ? current : [...current, cloneBlock(conditionChoices[0].block)]);
  }

  function duplicateCondition(index: number) {
    setBlocks((current) => current.length >= 6 || !current[index]
      ? current
      : [...current.slice(0, index + 1), cloneBlock(current[index]), ...current.slice(index + 1)]);
  }

  function deleteCondition(index: number) {
    setBlocks((current) => current.filter((_, blockIndex) => blockIndex !== index));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    let body;
    try {
      body = buildCustomCreatePayload({
        title,
        summary,
        logic,
        blocks,
        visibility: signedIn ? visibility : "private",
        lifecycle: signedIn ? lifecycle : "draft",
      });
      if (initialState && initialQuest) body = { ...body, id: initialState.id, config: buildCustomEditConfig(initialQuest.config, logic, blocks) };
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Check the form and try again.");
      return;
    }
    if (!signedIn) {
      try {
        const id = editingLocalDraftId ?? `local-custom-${crypto.randomUUID()}`;
        saveLocalCustomDraft(window.localStorage, {
          id,
          title: body.title,
          summary: body.summary,
          config: body.config,
          now: new Date().toISOString(),
        });
        window.location.assign(`/custom-side-quests?saved=${encodeURIComponent(id)}`);
      } catch {
        setError("Could not save this draft in your browser. Check browser storage and try again.");
      }
      return;
    }
    setSaving(true);
    try {
      const response = await fetch("/api/mobile/custom-quests", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const result = await response.json().catch(() => null);
      const destination = response.ok ? initialState ? getCustomOwnerDestination(result, initialState.id) : getCustomCreateDestination(result) : null;
      if (!destination) { setError(getCreateErrorMessage(response.status, result)); setSaving(false); return; }
      if (editingLocalDraftId) tryRemoveLocalCustomDraft(window.localStorage, editingLocalDraftId);
      window.location.assign(destination);
    } catch {
      setError("Could not create this Side Quest right now. Please try again.");
      setSaving(false);
    }
  }

  return <form className="sqc-native-card sqc-custom-builder-card" aria-label="Custom Side Quest builder" onSubmit={submit}>
    <span className="sqc-card-eyebrow">{initialState ? "Editing saved Side Quest" : "Start from a template"}</span>
    <div className="sqc-option-grid">
      {templates.map((item) => <button className="sqc-option-card sqc-template-card" key={item.id} onClick={() => applyTemplate(item.id)} type="button"><strong>{item.title}</strong><span>{item.helper}</span></button>)}
    </div>

    <span className="sqc-card-eyebrow">How conditions count</span>
    <div className="sqc-filter-row" aria-label="Condition logic">
      <button aria-pressed={logic === "all"} className={logic === "all" ? "active" : ""} onClick={() => setLogic("all")} type="button">Complete every condition</button>
      <button aria-pressed={logic === "any"} className={logic === "any" ? "active" : ""} onClick={() => setLogic("any")} type="button">Complete any one condition</button>
    </div>

    <span className="sqc-form-label">Your conditions · {blocks.length}/6</span>
    {blocks.length > 6 ? <p className="groupquest-join-error" role="alert">Android v338 supports up to 6 conditions. Delete at least {blocks.length - 6} condition{blocks.length - 6 === 1 ? "" : "s"} before saving rule changes.</p> : null}
    <div className="sqc-condition-list" aria-label="Saved conditions">
      {blocks.map((block, index) => <div className="sqc-condition-compact-row sqc-custom-condition-row" key={`${index}-${JSON.stringify(block)}`}>
        <span>{index + 1}</span>
        <div>
          <label className="sqc-form-row"><span>Condition {index + 1}</span><select aria-label={`Condition ${index + 1}`} onChange={(event) => updateCondition(index, event.target.value)} value={choiceIdForBlock(block)}>{choiceIdForBlock(block) === "advanced" ? <option value="advanced">Saved advanced condition</option> : null}{conditionChoices.map((choice) => <option key={choice.id} value={choice.id}>{choice.label}</option>)}</select></label>
          <p>{describeCustomRuleBlock(block)}</p>
          <div className="sqc-community-detail-actions">
            <button className="sqc-detail-quiet-button" disabled={blocks.length >= 6} onClick={() => duplicateCondition(index)} type="button">Duplicate</button>
            <button className="sqc-detail-quiet-button" onClick={() => deleteCondition(index)} type="button">Delete</button>
          </div>
        </div>
      </div>)}
      {!blocks.length ? <p>Add at least one condition before publishing.</p> : null}
    </div>
    <button className="sqc-detail-secondary-button" disabled={blocks.length >= 6} onClick={addCondition} type="button">{blocks.length >= 6 ? "Six-condition limit reached" : "Add Another Condition"}</button>
    <p>{logic === "all" ? "Every saved condition must pass." : "Any one saved condition can complete the Side Quest."} Conditions can happen in any order.</p>

    <label className="sqc-form-row"><span>Side Quest name</span><input aria-label="Side Quest name" maxLength={80} onChange={(event) => setTitle(event.target.value)} placeholder="Name this custom Side Quest" required value={title} /></label>
    <label className="sqc-form-row"><span>Description / goal</span><textarea aria-label="Description or goal" maxLength={500} onChange={(event) => setSummary(event.target.value)} placeholder="Tell players what to accomplish" value={summary} /></label>
    {signedIn ? <>
      <span className="sqc-form-label">Visibility</span>
      <div className="sqc-filter-row"><button className={visibility === "private" ? "active" : ""} onClick={() => setVisibility("private")} type="button">Private</button><button className={visibility === "public" ? "active" : ""} onClick={() => setVisibility("public")} type="button">Public</button></div>
      <label className="sqc-form-row"><span>Save state</span><select aria-label="Save state" onChange={(event) => setLifecycle(event.target.value as "draft" | "published" | "archived")} value={lifecycle}><option value="published">Ready to play</option><option value="draft">Draft</option>{initialState?.lifecycle === "archived" ? <option value="archived">Archived</option> : null}</select></label>
      <p>Identity and ownership come from your signed-in SQC session. Published quests require at least one supported condition.</p>
    </> : <p className="sqc-local-draft-notice">This private draft is saved only in this browser. Sign in later to publish it or use proof.</p>}
    {error ? <p className="groupquest-join-error" role="alert">{error}</p> : null}
    <button className="sqc-create-footer-button" disabled={saving} type="submit">{saving ? "Saving…" : initialState ? "Save Rule Changes" : signedIn ? "Save Custom Side Quest" : "Save Draft Locally"}</button>
  </form>;
}
