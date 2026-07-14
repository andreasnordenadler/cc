"use client";

import { FormEvent, useState } from "react";
import type { CustomSideQuestRuleBlock } from "@/lib/custom-side-quests";
import {
  buildCustomCreatePayload,
  describeCustomRuleBlock,
  getCreateErrorMessage,
  getCustomCreateDestination,
  getCustomTemplateBlocks,
  type CustomTemplate,
} from "@/lib/mobile-create-forms";

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
  { id: "queen-gone", label: "Queens are gone", helper: "No queen remains at game end.", block: { type: "pieceState", piece: "queen", owner: "either", selector: { quantifier: "all", count: 2, maxAvailable: 2, identity: "any" }, condition: "gone", timing: { atGameEnd: true } } },
  { id: "king-still", label: "Do not move your king", helper: "Your king stays on its starting square.", block: { type: "pieceState", piece: "king", owner: "my", condition: "not moved", timing: { atGameEnd: true } } },
  { id: "knights-first", label: "Knight-only opening", helper: "Play Nf3, ...Nf6, Nc3, ...Nc6 from move 1.", block: { type: "openingSequence", raw: "Nf3 Nf6 Nc3 Nc6", moves: ["Nf3", "Nf6", "Nc3", "Nc6"], anchor: "gameStart" } },
];

function cloneBlock(block: CustomSideQuestRuleBlock) {
  return structuredClone(block);
}

function choiceIdForBlock(block: CustomSideQuestRuleBlock) {
  const encoded = JSON.stringify(block);
  return conditionChoices.find((choice) => JSON.stringify(choice.block) === encoded)?.id ?? "win";
}

export default function MobileCustomCreateForm({ signedIn }: { signedIn: boolean }) {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [logic, setLogic] = useState<"all" | "any">("all");
  const [blocks, setBlocks] = useState<CustomSideQuestRuleBlock[]>(() => getCustomTemplateBlocks("no-castle"));
  const [visibility, setVisibility] = useState<"private" | "public">("private");
  const [lifecycle, setLifecycle] = useState<"draft" | "published">("published");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
    if (!signedIn) { setError("Sign in to create a Side Quest."); return; }
    setError("");
    let body;
    try {
      body = buildCustomCreatePayload({ title, summary, logic, blocks, visibility, lifecycle });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Check the form and try again.");
      return;
    }
    setSaving(true);
    try {
      const response = await fetch("/api/mobile/custom-quests", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const result = await response.json().catch(() => null);
      const destination = response.ok ? getCustomCreateDestination(result) : null;
      if (!destination) { setError(getCreateErrorMessage(response.status, result)); setSaving(false); return; }
      window.location.assign(destination);
    } catch {
      setError("Could not create this Side Quest right now. Please try again.");
      setSaving(false);
    }
  }

  return <form className="sqc-native-card sqc-custom-builder-card" aria-label="Custom Side Quest builder" onSubmit={submit}>
    <span className="sqc-card-eyebrow">Start from a template</span>
    <div className="sqc-option-grid">
      {templates.map((item) => <button className="sqc-option-card" key={item.id} onClick={() => applyTemplate(item.id)} type="button"><strong>{item.title}</strong><span>{item.helper}</span></button>)}
    </div>

    <span className="sqc-card-eyebrow">How conditions count</span>
    <div className="sqc-filter-row" aria-label="Condition logic">
      <button aria-pressed={logic === "all"} className={logic === "all" ? "active" : ""} onClick={() => setLogic("all")} type="button">Complete every condition</button>
      <button aria-pressed={logic === "any"} className={logic === "any" ? "active" : ""} onClick={() => setLogic("any")} type="button">Complete any one condition</button>
    </div>

    <span className="sqc-form-label">Your conditions · {blocks.length}/6</span>
    <div className="sqc-condition-list" aria-label="Saved conditions">
      {blocks.map((block, index) => <div className="sqc-condition-compact-row sqc-custom-condition-row" key={`${index}-${JSON.stringify(block)}`}>
        <span>{index + 1}</span>
        <div>
          <label className="sqc-form-row"><span>Condition {index + 1}</span><select aria-label={`Condition ${index + 1}`} onChange={(event) => updateCondition(index, event.target.value)} value={choiceIdForBlock(block)}>{conditionChoices.map((choice) => <option key={choice.id} value={choice.id}>{choice.label}</option>)}</select></label>
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
    <span className="sqc-form-label">Visibility</span>
    <div className="sqc-filter-row"><button className={visibility === "private" ? "active" : ""} onClick={() => setVisibility("private")} type="button">Private</button><button className={visibility === "public" ? "active" : ""} onClick={() => setVisibility("public")} type="button">Public</button></div>
    <label className="sqc-form-row"><span>Save state</span><select aria-label="Save state" onChange={(event) => setLifecycle(event.target.value as "draft" | "published")} value={lifecycle}><option value="published">Ready to play</option><option value="draft">Draft</option></select></label>
    <p>Identity and ownership come from your signed-in SQC session. Published quests require at least one supported condition.</p>
    {error ? <p className="groupquest-join-error" role="alert">{error}</p> : null}
    <button className="sqc-create-footer-button" disabled={saving} type="submit">{saving ? "Saving…" : signedIn ? "Save Custom Side Quest" : "Sign in to save"}</button>
  </form>;
}
