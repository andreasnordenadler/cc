"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { buildMultiplayerCreatePayload, getCreateErrorMessage, getMultiplayerCreateDestination, getMultiplayerLocalDateTimeDefaults } from "@/lib/mobile-create-forms";
import type { MultiplayerCreateQuestChoice } from "@/lib/multiplayer-create-quest-choices";

export type MultiplayerCreateQuest = MultiplayerCreateQuestChoice;

function localDateTime(date: Date) { const shifted = new Date(date.getTime() - date.getTimezoneOffset() * 60_000); return shifted.toISOString().slice(0, 16); }

export default function MobileMultiplayerCreateForm({ signedIn, quests, stableNow, communityUnavailable = false }: { signedIn: boolean; quests: MultiplayerCreateQuest[]; stableNow: string; communityUnavailable?: boolean }) {
  const [name, setName] = useState(""); const [inviteCopy, setInviteCopy] = useState("");
  const [inviteMode, setInviteMode] = useState("public"); const [inviteKey, setInviteKey] = useState("");
  const [providerMode, setProviderMode] = useState("both"); const [startAt, setStartAt] = useState(""); const [endAt, setEndAt] = useState("");
  const [selected, setSelected] = useState<string[]>([]); const [search, setSearch] = useState("");
  const [timeControl, setTimeControl] = useState("Any time control"); const [rated, setRated] = useState("Any rated state"); const [color, setColor] = useState("Any color");
  const [saving, setSaving] = useState(false); const [error, setError] = useState("");
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
  const visible = useMemo(() => quests.filter((quest) => `${quest.title} ${quest.summary}`.toLowerCase().includes(search.trim().toLowerCase())), [quests, search]);
  function toggle(id: string) { setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length < 4 ? [...current, id] : current); }
  function duration(days: number) { const start = new Date(startAt); start.setDate(start.getDate() + days); setEndAt(localDateTime(start)); }
  async function submit(event: FormEvent) {
    event.preventDefault(); if (!signedIn) { setError("Sign in to create a Side Quest."); return; } setError("");
    let body; try { body = buildMultiplayerCreatePayload({ name, inviteCopy, inviteMode, inviteKey, questIds: selected, providerMode, startAt, endAt, rules: { timeControl, rated, color } }); } catch (caught) { setError(caught instanceof Error ? caught.message : "Check the form and try again."); return; }
    setSaving(true);
    try { const response = await fetch("/api/groupquests", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }); const result = await response.json().catch(() => null); const destination = response.ok ? getMultiplayerCreateDestination(result) : null; if (!destination) { setError(getCreateErrorMessage(response.status, result)); setSaving(false); return; } window.location.assign(destination); }
    catch { setError("Could not create this Side Quest right now. Please try again."); setSaving(false); }
  }
  return <form className="sqc-stack" aria-label="Create Multiplayer Side Quest form" onSubmit={submit}>
    {communityUnavailable ? <p className="sqc-native-card sqc-create-community-notice" role="status"><strong>Community Side Quests could not load.</strong> Official and your own published Side Quests are still available.</p> : null}
    <section className="sqc-native-card"><div className="sqc-form-list">
      <label className="sqc-form-row"><span>Quest name</span><input aria-label="Quest name" maxLength={54} onChange={(e) => setName(e.target.value)} required value={name} /></label>
      <label className="sqc-form-row"><span>Intro text</span><textarea aria-label="Intro text" maxLength={260} onChange={(e) => setInviteCopy(e.target.value)} value={inviteCopy} /></label>
      <label className="sqc-form-row"><span>Access</span><select onChange={(e) => setInviteMode(e.target.value)} value={inviteMode}><option value="public">Public</option><option value="unlisted-link">Unlisted link</option><option value="private-key">Invite code</option></select></label>
      {inviteMode === "private-key" ? <label className="sqc-form-row"><span>Invite code</span><input maxLength={40} onChange={(e) => setInviteKey(e.target.value)} value={inviteKey} /></label> : null}
      <label className="sqc-form-row"><span>Games allowed</span><select onChange={(e) => setProviderMode(e.target.value)} value={providerMode}><option value="both">Lichess or Chess.com</option><option value="lichess">Lichess</option><option value="chesscom">Chess.com</option></select></label>
      <label className="sqc-form-row"><span>Start</span><input required type="datetime-local" onChange={(e) => setStartAt(e.target.value)} value={startAt} /></label><label className="sqc-form-row"><span>End</span><input required type="datetime-local" onChange={(e) => setEndAt(e.target.value)} value={endAt} /></label>
      <div className="sqc-filter-row">{[[1,"24h"],[3,"3 days"],[7,"1 week"],[14,"2 weeks"]].map(([days,label]) => <button key={label} onClick={() => duration(Number(days))} type="button">{label}</button>)}</div>
      <details><summary>Advanced: time, rated, color</summary><label className="sqc-form-row"><span>Time control</span><select onChange={(e) => setTimeControl(e.target.value)} value={timeControl}><option>Any time control</option><option>Rapid 10+0</option><option>Blitz 5+0</option></select></label><label className="sqc-form-row"><span>Rated</span><select onChange={(e) => setRated(e.target.value)} value={rated}><option>Any rated state</option><option>Rated only</option><option>Casual only</option></select></label><label className="sqc-form-row"><span>Color</span><select onChange={(e) => setColor(e.target.value)} value={color}><option>Any color</option><option>White only</option><option>Black only</option></select></label></details>
    </div></section>
    <section className="sqc-native-card"><span className="sqc-card-eyebrow">Included Side Quests</span><h2>{selected.length}/4 selected</h2><label className="sqc-search-shell"><input aria-label="Search Side Quests" onChange={(e) => setSearch(e.target.value)} placeholder="Search Side Quests" value={search} /></label><div className="sqc-catalog">{visible.map((quest) => <button className={selected.includes(quest.id) ? "sqc-option-card selected" : "sqc-option-card"} key={quest.id} onClick={() => toggle(quest.id)} type="button"><span className="sqc-card-eyebrow">{quest.sourceLabel}</span><strong>{quest.title}</strong><span>{quest.summary}</span><b>{selected.includes(quest.id) ? "Remove" : "Add"}</b></button>)}</div></section>
    {error ? <p className="groupquest-join-error" role="alert">{error}</p> : null}<button className="sqc-create-footer-button" disabled={saving} type="submit">{saving ? "Creating…" : signedIn ? "Create Multiplayer Side Quest" : "Sign in to create"}</button>
  </form>;
}
