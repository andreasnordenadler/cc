"use client";

import { FormEvent, useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
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
  getCustomBuilderSnapshot,
  hasUnsavedCustomBuilderChanges,
  getCustomPieceIdentityChoices,
  getCustomRuleBlockChoiceId,
  getCustomTemplateState,
  setCustomRuleBlockNegated,
  updateCustomMoveSequenceEditor,
  updateCustomOpeningSequenceBlock,
  updateCustomPieceIdentityChoice,
  updateCustomPieceStateEditor,
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
  { id: "win", title: "Win the game", helper: "Default friendly template: complete the Side Quest by winning your next public game." },
  { id: "draw", title: "Draw the game", helper: "For stubborn escape artists: hold the game to a draw." },
  { id: "queen-adventure", title: "Queen adventure", helper: "Build a piece-story challenge around your queen moving, vanishing, or landing somewhere weird." },
  { id: "knight-dare", title: "Knight dare", helper: "Start from a horse-crime idea and tune the exact condition after selecting it." },
];

const conditionChoices: Array<{ id: string; label: string; helper: string; block: CustomSideQuestRuleBlock }> = [
  { id: "win", label: "Win the game", helper: "The linked player must win.", block: { type: "gameResult", result: "win" } },
  { id: "draw", label: "Draw the game", helper: "The linked player must draw.", block: { type: "gameResult", result: "draw" } },
  { id: "lose", label: "Finish with a loss", helper: "The linked player must lose.", block: { type: "gameResult", result: "lose" } },
  { id: "queen-gone", label: "Your queen is gone", helper: "Your queen is captured by game end.", block: { type: "pieceState", piece: "queen", owner: "my", condition: "gone", timing: { atGameEnd: true } } },
  { id: "king-still", label: "Do not move your king", helper: "Your king stays on its starting square.", block: { type: "pieceState", piece: "king", owner: "my", condition: "not moved", timing: { atGameEnd: true } } },
  { id: "piece-state", label: "Piece state", helper: "Choose a piece, owner, board state, and timing.", block: { type: "pieceState", piece: "queen", owner: "my", selector: { quantifier: "any one", count: 1, maxAvailable: 1, identity: "original" }, condition: "moved", targetSquare: null, timing: { atGameEnd: true } } },
  { id: "move-sequence", label: "Move sequence", helper: "Require algebraic moves in order by a chosen time.", block: { type: "moveSequence", sequence: "e4 e5 Nf3", timing: { byMove: 15 } } },
  { id: "knights-first", label: "Knight-only opening", helper: "Play Nf3, ...Nf6, Nc3, ...Nc6 from move 1.", block: { type: "openingSequence", raw: "Nf3 Nf6 Nc3 Nc6", moves: ["Nf3", "Nf6", "Nc3", "Nc6"], anchor: "gameStart" } },
];

const subscribeToHydration = () => () => undefined;

export default function MobileCustomCreateForm({ signedIn, initialQuest = null }: { signedIn: boolean; initialQuest?: CustomEditQuestInput | null }) {
  const initialState = initialQuest ? getCustomEditFormState(initialQuest) : null;
  const initialBlocks = initialState?.blocks ?? [];
  const initialRows = initialBlocks.map((block, index) => getCustomConditionEditorRow(block, `initial-condition-${index}`));
  const rowIdCounter = useRef(initialRows.length);
  const [title, setTitle] = useState(initialState?.title ?? "");
  const [summary, setSummary] = useState(initialState?.summary ?? "");
  const [logic, setLogic] = useState<"all" | "any">(initialState?.logic ?? "all");
  const [conditionRows, setConditionRows] = useState(initialRows);
  const blocks = conditionRows.map((row) => row.block);
  const [visibility, setVisibility] = useState<"private" | "public">(initialState?.visibility ?? "private");
  const [lifecycle, setLifecycle] = useState<"draft" | "published" | "archived">(initialState?.lifecycle ?? "published");
  const baselineSnapshot = useRef(getCustomBuilderSnapshot({
    title: initialState?.title ?? "",
    summary: initialState?.summary ?? "",
    logic: initialState?.logic ?? "all",
    blocks: initialBlocks,
    visibility: initialState?.visibility ?? "private",
    lifecycle: initialState?.lifecycle ?? "published",
  }));
  const allowNavigation = useRef(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const hydrated = useSyncExternalStore(subscribeToHydration, () => true, () => false);
  const [editingLocalDraftId, setEditingLocalDraftId] = useState<string | null>(initialQuest?.id.startsWith("local-custom-") ? initialQuest.id : null);

  const nextConditionRowId = useCallback(() => {
    const id = `condition-row-${rowIdCounter.current}`;
    rowIdCounter.current += 1;
    return id;
  }, [rowIdCounter]);

  const createConditionRows = useCallback((nextBlocks: CustomSideQuestRuleBlock[]) => {
    return nextBlocks.map((block) => getCustomConditionEditorRow(block, nextConditionRowId()));
  }, [nextConditionRowId]);

  useEffect(() => {
    if (initialQuest) return;
    const draftId = getLocalCustomDraftIdFromSearch(window.location.search);
    if (!draftId) return;
    const draft = getLocalCustomDraftFormState(window.localStorage, draftId);
    if (!draft) return;
    baselineSnapshot.current = getCustomBuilderSnapshot({
      title: draft.title,
      summary: draft.summary,
      logic: draft.logic,
      blocks: draft.blocks,
      visibility: "private",
      lifecycle: "published",
    });
    queueMicrotask(() => {
      setEditingLocalDraftId(draft.id);
      setTitle(draft.title);
      setSummary(draft.summary);
      setLogic(draft.logic);
      setConditionRows(createConditionRows(draft.blocks));
    });
  }, [createConditionRows, initialQuest]);

  useEffect(() => {
    const input = { title, summary, logic, blocks, visibility, lifecycle };
    if (!hasUnsavedCustomBuilderChanges(baselineSnapshot.current, input)) return;

    const message = "Discard custom Side Quest? You have unsaved custom Side Quest changes.";
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (allowNavigation.current) return;
      event.preventDefault();
    };
    const handleDocumentClick = (event: MouseEvent) => {
      if (allowNavigation.current || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!target || target.target === "_blank" || target.hasAttribute("download")) return;
      event.preventDefault();
      if (!window.confirm(message)) return;
      allowNavigation.current = true;
      window.location.assign(target.href);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("click", handleDocumentClick, true);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("click", handleDocumentClick, true);
    };
  }, [blocks, lifecycle, logic, summary, title, visibility]);

  if (initialQuest && !initialState) {
    return <div className="sqc-native-card groupquest-join-error" role="alert">This saved Side Quest could not be opened safely. Return to your library and try again.</div>;
  }

  function applyTemplate(template: CustomTemplate) {
    const next = getCustomTemplateState(template);
    setTitle(next.title);
    setConditionRows(createConditionRows(next.blocks));
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

  function updatePieceStateCondition(index: number, input: Parameters<typeof updateCustomPieceStateEditor>[1]) {
    setConditionRows((current) => current.map((row, rowIndex) => {
      if (rowIndex !== index || row.block.type !== "pieceState") return row;
      return { ...row, ...updateCustomPieceStateEditor({ block: row.block, moveNumberInput: row.moveNumberInput }, input) };
    }));
  }

  function updatePieceIdentityChoice(index: number, choice: Parameters<typeof updateCustomPieceIdentityChoice>[1]) {
    setConditionRows((current) => current.map((row, rowIndex) => rowIndex === index && row.block.type === "pieceState"
      ? { ...row, block: updateCustomPieceIdentityChoice(row.block, choice) }
      : row));
  }

  function updatePieceTargetSquareInput(index: number, targetSquare: string) {
    const cleaned = targetSquare.toLowerCase().replace(/[^a-h1-8]/g, "").slice(0, 2);
    setConditionRows((current) => current.map((row, rowIndex) => rowIndex === index && row.block.type === "pieceState"
      ? { ...row, block: { ...row.block, targetSquare: cleaned } }
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
        allowNavigation.current = true;
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
      allowNavigation.current = true;
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
          </div> : block.type === "pieceState" && block.owner !== "either" ? <div className="sqc-condition-editor-fields">
            <span className="sqc-card-eyebrow">Piece</span>
            <div className="sqc-option-grid" role="group" aria-label={`Condition ${index + 1} piece`}>
              {(["king", "queen", "rook", "bishop", "knight", "pawn"] as const).map((piece) => <button aria-pressed={block.piece === piece} className={`sqc-option-card${block.piece === piece ? " selected" : ""}`} key={piece} onClick={() => updatePieceStateCondition(index, { piece })} type="button"><span aria-hidden="true" /><div className="sqc-option-card-copy"><strong>{piece.slice(0, 1).toUpperCase() + piece.slice(1)}</strong>{piece === "king" || piece === "queen" ? <small>Only one exists, so there is no “which one” choice.</small> : null}</div></button>)}
            </div>
            {getCustomPieceIdentityChoices(block.piece).length ? <>
              <span className="sqc-card-eyebrow">Which {block.piece}</span>
              <div className="sqc-option-grid" role="group" aria-label={`Condition ${index + 1} piece identity`}>
                {getCustomPieceIdentityChoices(block.piece).map((choice) => {
                  const identity = block.selector?.identity ?? "any";
                  const selected = choice.id === "all"
                    ? identity === "any" && block.selector?.quantifier === "all"
                    : choice.id === "any"
                      ? identity === "any" && block.selector?.quantifier !== "all"
                      : identity === choice.id;
                  return <button aria-pressed={selected} className={`sqc-option-card${selected ? " selected" : ""}`} key={choice.id} onClick={() => updatePieceIdentityChoice(index, choice.id)} type="button"><span aria-hidden="true" /><div className="sqc-option-card-copy"><strong>{choice.label}</strong><small>{choice.helper}</small></div></button>;
                })}
              </div>
            </> : null}
            <span className="sqc-card-eyebrow">Whose piece</span>
            <div className="sqc-option-grid" role="group" aria-label={`Condition ${index + 1} owner`}>
              {([{"id":"my","label":"Mine"},{"id":"opponent","label":"Opponent's"}] as const).map((owner) => <button aria-pressed={(block.owner === "either" ? "my" : block.owner) === owner.id} className={`sqc-option-card${(block.owner === "either" ? "my" : block.owner) === owner.id ? " selected" : ""}`} key={owner.id} onClick={() => updatePieceStateCondition(index, { owner: owner.id })} type="button"><span aria-hidden="true" /><div className="sqc-option-card-copy"><strong>{owner.label}</strong></div></button>)}
            </div>
            <span className="sqc-card-eyebrow">State</span>
            <div className="sqc-option-grid" role="group" aria-label={`Condition ${index + 1} piece condition`}>
              {([{"id":"gone","label":"Gone"},{"id":"still on board","label":"Still on board"},{"id":"moved","label":"Moved"},{"id":"not moved","label":"Not moved"},{"id":"on square","label":"On square"}] as const).map((condition) => <button aria-pressed={block.condition === condition.id} className={`sqc-option-card${block.condition === condition.id ? " selected" : ""}`} key={condition.id} onClick={() => updatePieceStateCondition(index, { condition: condition.id })} type="button"><span aria-hidden="true" /><div className="sqc-option-card-copy"><strong>{condition.label}</strong><small>A piece-based condition.</small></div></button>)}
            </div>
            {block.condition === "on square" ? <label className="sqc-form-row"><span>Target square</span><input aria-label={`Condition ${index + 1} target square`} maxLength={2} onBlur={(event) => updatePieceStateCondition(index, { targetSquare: event.target.value })} onChange={(event) => updatePieceTargetSquareInput(index, event.target.value)} placeholder="e4" value={block.targetSquare ?? ""} /></label> : null}
            <span className="sqc-card-eyebrow">Timing</span>
            <div className="sqc-option-grid" role="group" aria-label={`Condition ${index + 1} timing`}>
              {([{"id":"byMove","label":"By move"},{"id":"atMove","label":"At move"},{"id":"atGameEnd","label":"At game end"}] as const).map((timing) => { const selected = timing.id === (block.timing?.atMove ? "atMove" : block.timing?.byMove ? "byMove" : "atGameEnd"); return <button aria-pressed={selected} className={`sqc-option-card${selected ? " selected" : ""}`} key={timing.id} onClick={() => updatePieceStateCondition(index, { timing: timing.id })} type="button"><span aria-hidden="true" /><div className="sqc-option-card-copy"><strong>{timing.label}</strong>{timing.id !== "atGameEnd" ? <small>Choose the move number for this timing.</small> : null}</div></button>; })}
            </div>
            {block.timing?.byMove || block.timing?.atMove ? <label className="sqc-form-row"><span>Move number</span><input aria-label={`Condition ${index + 1} move number`} inputMode="numeric" max={300} min={1} onChange={(event) => updatePieceStateCondition(index, { moveNumberInput: event.target.value })} type="number" value={moveNumberInput} /></label> : null}
          </div> : null}
          <p>{describeCustomRuleBlock(block)}</p>
          <div className="sqc-community-detail-actions">
            <button className="sqc-detail-quiet-button" disabled={blocks.length >= 6} onClick={() => duplicateCondition(index)} type="button">Duplicate</button>
            <button className="sqc-detail-quiet-button" onClick={() => deleteCondition(index)} type="button">Delete</button>
          </div>
        </div>
      </div>)}
      {!blocks.length ? <p>No conditions yet. Add the first thing players must do.</p> : null}
    </div>
    <button className="sqc-detail-secondary-button" disabled={!hydrated || blocks.length >= 6} onClick={addCondition} type="button">{blocks.length >= 6 ? "Six-condition limit reached" : blocks.length ? "Add Another Condition" : "Add Condition"}</button>
    <p>{logic === "all" ? "Every saved condition must pass." : "Any one saved condition can complete the Side Quest."} Conditions can happen in any order.</p>

    <label className="sqc-form-row"><span>Side Quest name</span><input aria-label="Side Quest name" maxLength={80} onChange={(event) => setTitle(event.target.value)} placeholder="Name this custom Side Quest" required value={title} /></label>
    <div className="sqc-custom-coat-preview">
      <Image alt="" aria-hidden="true" height={66} src="/badges/custom/community/community-coat-01.png" width={66} />
      <div>
        <strong>Side Quest Coat of Arms</strong>
        <small>This is the Coat of Arms players unlock when this Side Quest is completed.</small>
      </div>
    </div>
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
