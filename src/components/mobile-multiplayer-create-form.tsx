"use client";

import { FormEvent, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { buildMultiplayerCreatePayload, getCreateErrorMessage, getMultiplayerCreateDestination, getMultiplayerLocalDateTimeDefaults } from "@/lib/mobile-create-forms";
import { getMultiplayerCreateQuestPicker, toggleMultiplayerCreateQuest, type MultiplayerCreateQuestChoice, type MultiplayerCreateQuestSource } from "@/lib/multiplayer-create-quest-choices";

export type MultiplayerCreateQuest = MultiplayerCreateQuestChoice;

const accessChoices = [
  { id: "public", title: "Public", helper: "Visible in Browse" },
  { id: "unlisted-link", title: "Unlisted link", helper: "Only players with the link can join" },
  { id: "private-key", title: "Invite code", helper: "Only players with the invite code or link can join" },
] as const;

const providerChoices = [
  { id: "both", title: "Lichess or Chess.com", helper: "Players can use Lichess or Chess.com" },
  { id: "lichess", title: "Lichess", helper: "Only public Lichess games" },
  { id: "chesscom", title: "Chess.com", helper: "Only public Chess.com games" },
] as const;

const advancedRuleChoices = {
  timeControl: {
    label: "Time control",
    options: [
      { value: "Any time control", title: "Any", helper: "Bullet, blitz, rapid, or classical" },
      { value: "Bullet", title: "Bullet", helper: "Bullet games only" },
      { value: "Blitz", title: "Blitz", helper: "Blitz games only" },
      { value: "Rapid", title: "Rapid", helper: "Rapid games only" },
      { value: "Classical", title: "Classical", helper: "Classical games only" },
    ],
  },
  rated: {
    label: "Rated setting",
    options: [
      { value: "Any rated state", title: "Any", helper: "Rated or casual games count" },
      { value: "Rated only", title: "Rated", helper: "Only rated games count" },
      { value: "Casual only", title: "Casual", helper: "Only casual games count" },
    ],
  },
  color: {
    label: "Player color",
    options: [
      { value: "Any color", title: "Any side", helper: "Games as White or Black count" },
      { value: "White only", title: "Play as White", helper: "Only games where you have the white pieces count" },
      { value: "Black only", title: "Play as Black", helper: "Only games where you have the black pieces count" },
    ],
  },
} as const;

const multiplayerDefaultIntro = "A Multiplayer Side Quest where everyone tries the same Side Quests with fresh public games.";

const subscribeToHydration = () => () => undefined;

function localDateTime(date: Date) { const shifted = new Date(date.getTime() - date.getTimezoneOffset() * 60_000); return shifted.toISOString().slice(0, 16); }

export default function MobileMultiplayerCreateForm({ signedIn, quests, stableNow, communityUnavailable = false, initialQuestId }: { signedIn: boolean; quests: MultiplayerCreateQuest[]; stableNow: string; communityUnavailable?: boolean; initialQuestId?: string }) {
  const initialQuest = initialQuestId ? quests.find((quest) => quest.id === initialQuestId) : undefined;
  const defaultQuestIds = initialQuest
    ? [initialQuest.id]
    : quests.filter((quest) => quest.source === "official").slice(0, 3).map((quest) => quest.id);
  const [name, setName] = useState(""); const [inviteCopy, setInviteCopy] = useState(multiplayerDefaultIntro);
  const [inviteMode, setInviteMode] = useState("public"); const [inviteKey, setInviteKey] = useState("");
  const [providerMode, setProviderMode] = useState("both"); const [startAt, setStartAt] = useState(""); const [endAt, setEndAt] = useState("");
  const [selected, setSelected] = useState<string[]>(defaultQuestIds); const [search, setSearch] = useState("");
  const [source, setSource] = useState<MultiplayerCreateQuestSource>(initialQuest?.source === "official" ? "official" : initialQuest ? "community" : "official"); const [selectedOnly, setSelectedOnly] = useState(Boolean(initialQuest)); const [questLimit, setQuestLimit] = useState(8); const [selectionError, setSelectionError] = useState("");
  const [timeControl, setTimeControl] = useState("Any time control"); const [rated, setRated] = useState("Any rated state"); const [color, setColor] = useState("Any color"); const [advancedOpen, setAdvancedOpen] = useState(false);
  const [saving, setSaving] = useState(false); const [error, setError] = useState("");
  const hydrated = useSyncExternalStore(subscribeToHydration, () => true, () => false);
  useEffect(() => {
    let mounted = true;
    queueMicrotask(() => {
      if (!mounted) return;
      const initial = getMultiplayerLocalDateTimeDefaults(stableNow);
      setStartAt(initial.startAt);
      setEndAt(initial.endAt);
    });
    return () => { mounted = false; };
  }, [stableNow]);
  const picker = useMemo(() => getMultiplayerCreateQuestPicker({ choices: quests, source, selectedIds: selected, selectedOnly, search, limit: questLimit }), [quests, source, selected, selectedOnly, search, questLimit]);
  const selectedQuests = selected.flatMap((id) => { const quest = quests.find((choice) => choice.id === id); return quest ? [quest] : []; });
  function resetPickerPage() { setQuestLimit(8); }
  function toggle(id: string) { const result = toggleMultiplayerCreateQuest(selected, id); setSelected(result.selectedIds); setSelectionError(result.error ?? ""); }
  function duration(days: number) { const start = new Date(startAt); start.setDate(start.getDate() + days); setEndAt(localDateTime(start)); }
  async function submit(event: FormEvent) {
    event.preventDefault(); if (!signedIn) { setError("Sign in to create a Side Quest."); return; } setError("");
    let body; try { body = buildMultiplayerCreatePayload({ name, inviteCopy, inviteMode, inviteKey, questIds: selected, providerMode, startAt, endAt, rules: { timeControl, rated, color } }); } catch (caught) { setError(caught instanceof Error ? caught.message : "Check the form and try again."); return; }
    setSaving(true);
    try { const response = await fetch("/api/groupquests", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }); const result = await response.json().catch(() => null); const destination = response.ok ? getMultiplayerCreateDestination(result) : null; if (!destination) { setError(getCreateErrorMessage(response.status, result)); setSaving(false); return; } window.location.assign(destination); }
    catch { setError("Could not create this Side Quest right now. Please try again."); setSaving(false); }
  }
  return <form className="sqc-stack sqc-multiplayer-create-form" aria-label="Create Multiplayer Side Quest form" onSubmit={submit}>
    <fieldset className="sqc-hydration-gate" disabled={!hydrated}>
    {communityUnavailable ? <p className="sqc-native-card sqc-create-community-notice" role="status"><strong>Community Side Quests could not load.</strong> Official and your own published Side Quests are still available.</p> : null}
    <section className="sqc-native-card"><div className="sqc-form-list">
      <label className="sqc-form-row"><span>Quest name</span><input aria-label="Quest name" maxLength={54} onChange={(e) => setName(e.target.value)} required value={name} /></label>
      <label className="sqc-form-row"><span>Intro text</span><textarea aria-label="Intro text" maxLength={260} onChange={(e) => setInviteCopy(e.target.value)} value={inviteCopy} /></label>
      <span className="sqc-form-label">Access</span>
      <div className="sqc-option-grid" role="group" aria-label="Multiplayer access">{accessChoices.map((choice) => <button aria-pressed={inviteMode === choice.id} className={`sqc-option-card${inviteMode === choice.id ? " selected" : ""}`} key={choice.id} onClick={() => setInviteMode(choice.id)} type="button"><span aria-hidden="true" /><div className="sqc-option-card-copy"><strong>{choice.title}</strong><small>{choice.helper}</small></div></button>)}</div>
      {inviteMode === "private-key" ? <label className="sqc-form-row"><span>Invite code</span><input maxLength={40} onChange={(e) => setInviteKey(e.target.value)} value={inviteKey} /></label> : null}
      <span className="sqc-form-label">Games allowed</span>
      <div className="sqc-option-grid" role="group" aria-label="Games allowed">{providerChoices.map((choice) => <button aria-pressed={providerMode === choice.id} className={`sqc-option-card${providerMode === choice.id ? " selected" : ""}`} key={choice.id} onClick={() => setProviderMode(choice.id)} type="button"><span aria-hidden="true" /><div className="sqc-option-card-copy"><strong>{choice.title}</strong><small>{choice.helper}</small></div></button>)}</div>
      <label className="sqc-form-row"><span>Start</span><input required type="datetime-local" onChange={(e) => setStartAt(e.target.value)} value={startAt} /></label><label className="sqc-form-row"><span>End</span><input required type="datetime-local" onChange={(e) => setEndAt(e.target.value)} value={endAt} /></label>
      <span className="sqc-form-label">Quick duration</span>
      <div className="sqc-filter-row" role="group" aria-label="Quick duration">{[[1,"24h"],[3,"3 days"],[7,"1 week"],[14,"2 weeks"]].map(([days,label]) => <button key={label} onClick={() => duration(Number(days))} type="button">{label}</button>)}</div>
      <small>Dates save as your local time. Start defaults to shortly after creation; no typing needed.</small>
      <div className="sqc-advanced-settings" hidden={!advancedOpen} id="multiplayer-advanced-settings">{Object.entries(advancedRuleChoices).map(([id, rule]) => {
        const value = id === "timeControl" ? timeControl : id === "rated" ? rated : color;
        const select = id === "timeControl" ? setTimeControl : id === "rated" ? setRated : setColor;
        return <div className="sqc-advanced-rule" key={id}><span className="sqc-form-label">{rule.label}</span><div className="sqc-option-grid" role="group" aria-label={rule.label}>{rule.options.map((option) => <button aria-label={`${option.value}: ${option.helper}`} aria-pressed={value === option.value} className={`sqc-option-card${value === option.value ? " selected" : ""}`} key={option.value} onClick={() => select(option.value)} type="button"><span aria-hidden="true" /><div className="sqc-option-card-copy"><strong>{option.title}</strong><small>{option.helper}</small></div></button>)}</div></div>;
      })}</div>
      <button aria-controls="multiplayer-advanced-settings" aria-expanded={advancedOpen} aria-label="Toggle advanced Multiplayer game settings" className="sqc-detail-quiet-button sqc-advanced-toggle" onClick={() => setAdvancedOpen((current) => !current)} type="button">{advancedOpen ? "Hide advanced settings" : "Advanced: time, rated, color"}</button>
    </div></section>
    <section className="sqc-native-card sqc-create-selected-card">
      <span className="sqc-card-eyebrow">Included Side Quests</span>
      <div className="sqc-create-selection-head"><div><h2>Your Multiplayer draft</h2><small>{selected.length}/4 Side Quests selected</small></div>{selected.length ? <button aria-label="Clear selected Side Quests" className="sqc-detail-quiet-button" onClick={() => { setSelected([]); setSelectionError(""); }} type="button">Clear</button> : null}</div>
      <div className="sqc-create-selected-tray">
        {selectedQuests.length ? selectedQuests.map((quest, index) => <button aria-label={`Remove ${quest.title} from Multiplayer Side Quest`} className="sqc-create-selected-row" key={quest.id} onClick={() => toggle(quest.id)} type="button"><span className="sqc-create-selected-index">{index + 1}</span><span className="sqc-create-selected-copy"><strong>{quest.title}</strong><small>{quest.sourceLabel}</small></span><span className="sqc-create-selected-remove" aria-hidden="true">×</span></button>) : <div className="sqc-selection-empty"><strong>No Side Quests selected yet.</strong><span>Search or browse below, then choose rows to add them here.</span></div>}
      </div>
      {selectionError ? <p className="groupquest-join-error" role="alert">{selectionError}</p> : null}
    </section>
    <section className="sqc-native-card sqc-create-catalog-card"><span className="sqc-card-eyebrow">Add from catalog</span><h2>Browse like Community Side Quests.</h2>
      <div className="sqc-search-shell"><input aria-label="Search Side Quests" onChange={(e) => { setSearch(e.target.value); resetPickerPage(); }} placeholder="Search Side Quests" value={search} />{search ? <button aria-label="Clear Side Quest search" className="sqc-detail-quiet-button" onClick={() => { setSearch(""); resetPickerPage(); }} type="button">×</button> : null}</div>
      <div className="sqc-filter-row"><button aria-pressed={!selectedOnly} className={!selectedOnly ? "active" : ""} onClick={() => { setSelectedOnly(false); resetPickerPage(); }} type="button">Browse</button><button aria-pressed={selectedOnly} className={selectedOnly ? "active" : ""} onClick={() => { setSelectedOnly(true); resetPickerPage(); }} type="button">Selected ({selected.length})</button></div>
      <div className="sqc-brand-tabs" role="group" aria-label="Choose Side Quest source"><button aria-pressed={source === "official"} className={`sqc-brand-tab official${source === "official" ? " active" : ""}`} onClick={() => { setSource("official"); resetPickerPage(); }} type="button">Official ({picker.officialCount})</button><button aria-label={source === "official" ? "Switch to Community Side Quests" : "Switch to Official Side Quests"} className="sqc-brand-switch" data-icon="swap-horizontal" onClick={() => { setSource(source === "official" ? "community" : "official"); resetPickerPage(); }} type="button"><span aria-hidden="true" /></button><button aria-pressed={source === "community"} className={`sqc-brand-tab community${source === "community" ? " active" : ""}`} onClick={() => { setSource("community"); resetPickerPage(); }} type="button">Community ({picker.communityCount})</button></div>
      {picker.visible.length ? <div className="sqc-catalog">{picker.visible.map((quest) => { const included = selected.includes(quest.id); const maxed = !included && selected.length >= 4; return <button aria-label={included ? `Remove ${quest.title} from Multiplayer Side Quest` : maxed ? `Maximum of 4 Side Quests reached; remove one before adding ${quest.title}` : `Add ${quest.title} to Multiplayer Side Quest`} className={included ? "sqc-option-card selected" : "sqc-option-card"} key={quest.id} onClick={() => toggle(quest.id)} type="button"><span aria-hidden="true" /><div className="sqc-option-card-copy"><small className="sqc-option-source">{quest.sourceLabel}</small><strong>{quest.title}</strong><b>{included ? "Remove" : maxed ? "Max 4" : "Add"}</b><small className="sqc-option-summary">{quest.summary}</small></div></button>; })}</div> : <div className="sqc-selection-empty"><strong>No matching Side Quests</strong><span>Adjust search, switch source, or turn off Selected to browse the catalog.</span></div>}
      {picker.hiddenCount ? <button className="sqc-detail-secondary-button" onClick={() => setQuestLimit((current) => current + 8)} type="button">Show more ({picker.hiddenCount})</button> : null}
    </section>
    {error ? <p className="groupquest-join-error" role="alert">{error}</p> : null}<button className="sqc-create-footer-button" disabled={saving} type="submit">{saving ? "Creating…" : signedIn ? "Create Multiplayer Side Quest" : "Sign in to create"}</button>
    </fieldset>
  </form>;
}
