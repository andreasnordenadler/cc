"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import type { CustomSideQuestRuleBlock } from "@/lib/custom-side-quests";
import {
  buildCustomCreatePayload,
  buildCustomEditConfig,
  appendCustomConditionEditorRow,
  deleteCustomConditionEditorRow,
  describeCustomRuleBlock,
  duplicateCustomConditionEditorRow,
  getCreateErrorMessage,
  getCustomConditionEditorRow,
  getCustomCreateDestination,
  getCustomEditFormState,
  getCustomRuleBlockChoiceId,
  getCustomTemplateBlocks,
  setCustomRuleBlockNegated,
  updateCustomMoveSequenceEditor,
  updateCustomOpeningSequenceBlock,
  finalizeCustomOpeningSequenceInput,
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
  { id: "move-sequence", label: "Move sequence", helper: "Require algebraic moves in order by a chosen time.", block: { type: "moveSequence", sequence: "e4 e5 Nf3", timing: { byMove: 15 } } },
  { id: "knights-first", label: "Knight-only opening", helper: "Play Nf3, ...Nf6, Nc3, ...Nc6 from move 1.", block: { type: "openingSequence", raw: "Nf3 Nf6 Nc3 Nc6", moves: ["Nf3", "Nf6", "Nc3", "Nc6"], anchor: "gameStart" } },
];

export default function MobileCustomCreateForm({ signedIn, initialQuest = null }: { signedIn: boolean; initialQuest?: CustomEditQuestInput | null }) {
  const initialState = initialQuest ? getCustomEditFormState(initialQuest) : null;
  const initialBlocks = initialState?.blocks ?? getCustomTemplateBlocks("no-castle");
  const initialRows = initialBlocks.map((block, index) => getCustomConditionEditorRow(block, `initial-condition-${index}`));
  const rowIdCounter = useRef(initialRows.length);
  const [title, setTitle] = useState(initialState?.title ?? "");
  const [summary, setSummary] = useState(initialState?.summary ?? "");
  const [logic, setLogic] = useState<"all" | "any">(initialState?.logic ?? "all");
  const [conditionRows, setConditionRows] = useState(initialRows);
  const blocks = conditionRows.map((row) => row.block);
  const [visibility, setVisibility] = useState<"private" | "public">(initialState?.visibility ?? "private");
  const [lifecycle, setLifecycle] = useState<"draft" | "published" | "archived">(initialState?.lifecycle ?? "published");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingLocalDraftId, setEditingLocalDraftId] = useState<string | null>(initialQuest?.id.startsWith("local-custom-") ? initialQuest.id : null);

  const nextConditionRowId = useCallback(() => {
    const id = `condition-row-${rowIdCounter.current}`;
    rowIdCounter.current += 1;
    return id;
  }, []);

  const createConditionRows = useCallback((nextBlocks: CustomSideQuestRuleBlock[]) => {
    return nextBlocks.map((block) => getCustomConditionEditorRow(block, nextConditionRowId()));
  }, [nextConditionRowId]);

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
      setConditionRows(createConditionRows(draft.blocks));
    });
  }, [createConditionRows, initialQuest]);

  if (initialQuest && !initialState) {
    return <div className="sqc-native-card groupquest-join-error" role="alert">This saved Side Quest could not be opened safely. Return to your library and try again.</div>;
  }

  function applyTemplate(template: CustomTemplate) {
    setConditionRows(createConditionRows(getCustomTemplateBlocks(template)));
    setError("");
  }

  function updateCondition(index: number, choiceId: string) {
    const choice = conditionChoices.find((item) => item.id === choiceId);
    if (!choice) return;
    setConditionRows((current) => current.map((row, rowIndex) => rowIndex === index ? getCustomConditionEditorRow(choice.block, row.id) : row));
  }

  function updateConditionTruth(index: number, negated: boolean) {
    setConditionRows((current) => current.map((row, rowIndex) => rowIndex === index
      ? { ...row, block: setCustomRuleBlockNegated(row.block, negated) }
      : row));
  }

  function updateMoveSequenceCondition(index: number, input: { sequence?: string; timing?: "byMove" | "atMove" | "atGameEnd"; moveNumberInput?: string }) {
    setConditionRows((current) => current.map((row, rowIndex) => {
      if (rowIndex !== index || row.block.type !== "moveSequence") return row;
      return { ...updateCustomMoveSequenceEditor({ block: row.block, moveNumberInput: row.moveNumberInput }, input), id: row.id };
    }));
  }

  function updateOpeningSequenceCondition(index: number, raw: string) {
    setConditionRows((current) => current.map((row, rowIndex) => rowIndex === index && row.block.type === "openingSequence"
      ? { ...row, block: updateCustomOpeningSequenceBlock(row.block, raw) }
      : row));
  }

  function addCondition() {
    const id = nextConditionRowId();
    setConditionRows((current) => appendCustomConditionEditorRow(current, conditionChoices[0].block, id));
  }

  function duplicateCondition(index: number) {
    const id = nextConditionRowId();
    setConditionRows((current) => duplicateCustomConditionEditorRow(current, index, id));
  }

  function deleteCondition(index: number) {
    setConditionRows((current) => deleteCustomConditionEditorRow(current, index));
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
      {conditionRows.map(({ id, block, moveNumberInput }, index) => <div className="sqc-condition-compact-row sqc-custom-condition-row" key={id}>
        <span>{index + 1}</span>
        <div>
          <label className="sqc-form-row"><span>Condition {index + 1}</span><select aria-label={`Condition ${index + 1}`} onChange={(event) => updateCondition(index, event.target.value)} value={getCustomRuleBlockChoiceId(block)}>{getCustomRuleBlockChoiceId(block) === "advanced" ? <option value="advanced">Saved advanced condition</option> : null}{conditionChoices.map((choice) => <option key={choice.id} value={choice.id}>{choice.label}</option>)}</select></label>
          <div aria-label={`Condition ${index + 1} truth`} className="sqc-filter-row" role="group">
            <button aria-pressed={!block.negate} className={!block.negate ? "active" : ""} onClick={() => updateConditionTruth(index, false)} type="button">Must happen</button>
            <button aria-pressed={block.negate === true} className={block.negate ? "active" : ""} onClick={() => updateConditionTruth(index, true)} type="button">Must not happen</button>
          </div>
          {block.type === "moveSequence" ? <div className="sqc-condition-editor-fields">
            <label className="sqc-form-row"><span>Move sequence</span><textarea aria-label={`Condition ${index + 1} move sequence`} maxLength={180} onChange={(event) => updateMoveSequenceCondition(index, { sequence: event.target.value })} placeholder="e4 e5 Nf3 Nc6" value={block.sequence} /></label>
            <label className="sqc-form-row"><span>Timing</span><select aria-label={`Condition ${index + 1} timing`} onChange={(event) => updateMoveSequenceCondition(index, { timing: event.target.value as "byMove" | "atMove" | "atGameEnd" })} value={block.timing?.atMove ? "atMove" : block.timing?.byMove ? "byMove" : "atGameEnd"}><option value="byMove">By move</option><option value="atMove">At move</option><option value="atGameEnd">At game end</option></select></label>
            {block.timing?.byMove || block.timing?.atMove ? <label className="sqc-form-row"><span>Move number</span><input aria-label={`Condition ${index + 1} move number`} inputMode="numeric" max={300} min={1} onChange={(event) => updateMoveSequenceCondition(index, { moveNumberInput: event.target.value })} type="number" value={moveNumberInput} /></label> : null}
          </div> : block.type === "openingSequence" ? <div className="sqc-condition-editor-fields">
            <label className="sqc-form-row"><span>Opening notation</span><textarea aria-label={`Condition ${index + 1} opening sequence`} maxLength={260} onBlur={(event) => updateOpeningSequenceCondition(index, finalizeCustomOpeningSequenceInput(event.target.value))} onChange={(event) => updateOpeningSequenceCondition(index, event.target.value)} placeholder="1.e4 e5 2.f4" value={block.raw ?? block.moves.join(" ")} /></label>
            <p>Paste opening notation with move numbers. SQC cleans it into: {block.moves.length ? block.moves.join(" → ") : "No moves parsed yet."}</p>
            <p>Opening sequence is always checked from move 1, so no timing is needed.</p>
          </div> : null}
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
