"use client";

import { useState } from "react";
import type { GroupQuestInviteMode, GroupQuestProviderMode, ServerGroupQuest } from "@/lib/groupquests";

type EditableQuest = {
  id: string;
  title: string;
  objective: string;
  reward: number;
  difficulty: string;
  source?: "official" | "custom" | "snapshot";
};

const providerModes: Array<{ id: GroupQuestProviderMode; label: string }> = [
  { id: "both", label: "Lichess or Chess.com" },
  { id: "lichess", label: "Lichess only" },
  { id: "chesscom", label: "Chess.com only" },
];

const inviteModes: Array<{ id: GroupQuestInviteMode; label: string; copy: string }> = [
  { id: "public", label: "Public listing", copy: "Anyone can find it on the public Multiplayer Side Quest list and join." },
  { id: "unlisted-link", label: "Unlisted link", copy: "Anyone with the Multiplayer Side Quest link can join." },
  { id: "private-key", label: "Private host code", copy: "Only players with the host code can join. The table stays out of public discovery." },
];

const gameRuleGroups = [
  { id: "timeControl", label: "Time control", options: ["Any time control", "Bullet", "Blitz", "Rapid", "Classical"] },
  { id: "rated", label: "Rated setting", options: ["Any rated state", "Rated only", "Casual only"] },
  { id: "color", label: "Player color", options: ["Any color", "White only", "Black only"] },
];

function toDateTimeLocal(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return offsetDate.toISOString().slice(0, 16);
}

function toIsoFromDateTimeLocal(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString();
}

const quickDurationOptions = [
  { label: "24h", days: 1 },
  { label: "3 days", days: 3 },
  { label: "7 days", days: 7 },
  { label: "14 days", days: 14 },
];

function endAtFromStart(startValue: string, days: number) {
  const start = new Date(startValue);
  const date = Number.isNaN(start.getTime()) ? new Date() : start;
  date.setDate(date.getDate() + days);
  return toDateTimeLocal(date.toISOString());
}

function makeInviteKey(name: string) {
  const safe = name.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 8) || "sqc";
  return `${safe}-${Math.random().toString(36).slice(2, 8)}`;
}

function cleanInviteKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 40);
}

export default function GroupQuestEditForm({ canMarkOfficial = false, groupQuest, quests }: { canMarkOfficial?: boolean; groupQuest: ServerGroupQuest; quests: EditableQuest[] }) {
  const [name, setName] = useState(groupQuest.name);
  const [inviteCopy, setInviteCopy] = useState(groupQuest.inviteCopy);
  const [inviteMode, setInviteMode] = useState<GroupQuestInviteMode>(groupQuest.inviteMode);
  const [inviteKey, setInviteKey] = useState(groupQuest.inviteKey ?? makeInviteKey(groupQuest.name));
  const [providerMode, setProviderMode] = useState<GroupQuestProviderMode>(groupQuest.providerMode);
  const [official, setOfficial] = useState(Boolean(groupQuest.official));
  const [officialLabel, setOfficialLabel] = useState(groupQuest.officialLabel ?? "Official SQC Multiplayer Side Quest");
  const [selectedQuestIds, setSelectedQuestIds] = useState<string[]>(groupQuest.questIds.length ? groupQuest.questIds : [quests[0]?.id ?? ""]);
  const [startAt, setStartAt] = useState(toDateTimeLocal(groupQuest.startAt));
  const [endAt, setEndAt] = useState(toDateTimeLocal(groupQuest.endAt));
  const [rules, setRules] = useState<Record<string, string>>(groupQuest.rules);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const selectedProvider = providerModes.find((mode) => mode.id === providerMode) ?? providerModes[0];
  const selectedQuests = quests.filter((quest) => selectedQuestIds.includes(quest.id));

  function toggleQuest(questId: string) {
    setSelectedQuestIds((current) => {
      if (current.includes(questId)) return current.length > 1 ? current.filter((id) => id !== questId) : current;
      return [...current, questId];
    });
  }

  function applyQuickDuration(days: number) {
    setEndAt(endAtFromStart(startAt, days));
  }

  async function save() {
    setSaving(true);
    setError("");
    const response = await fetch(`/api/groupquests/${groupQuest.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name,
        inviteCopy,
        inviteMode,
        inviteKey: inviteMode === "private-key" ? inviteKey : undefined,
        questIds: selectedQuestIds,
        providerMode,
        providerLabel: selectedProvider.label,
        official,
        officialLabel,
        startAt: toIsoFromDateTimeLocal(startAt),
        endAt: toIsoFromDateTimeLocal(endAt),
        rules,
      }),
    });
    const result = await response.json().catch(() => null) as { href?: string; error?: string } | null;
    if (!response.ok || !result?.href) {
      setError(result?.error ?? "Could not update Multiplayer Side Quest.");
      setSaving(false);
      return;
    }
    window.location.href = result.href;
  }

  return (
    <div className="groupquests-builder-shell">
      <div className="groupquests-builder" aria-label="Edit Multiplayer Side Quest">
        <div className="groupquests-builder-form">
          <label>
            <span>Name</span>
            <input value={name} onChange={(event) => setName(event.target.value)} maxLength={54} />
          </label>

          <label className="groupquests-invite-copy-editor">
            <span>Invite message</span>
            <textarea value={inviteCopy} onChange={(event) => setInviteCopy(event.target.value)} maxLength={260} rows={4} />
          </label>

          <div className="groupquests-builder-choice-set" role="group" aria-label="Visibility">
            <span>Visibility</span>
            <div>
              {inviteModes.map((mode) => (
                <button className={mode.id === inviteMode ? "active" : undefined} key={mode.id} onClick={() => setInviteMode(mode.id)} type="button">
                  <strong>{mode.label}</strong>
                  <small>{mode.copy}</small>
                </button>
              ))}
            </div>
          </div>

          {inviteMode === "private-key" ? (
            <label>
              <span>Private host code</span>
              <input
                value={inviteKey}
                onChange={(event) => setInviteKey(cleanInviteKey(event.target.value))}
                onBlur={() => setInviteKey((current) => current || makeInviteKey(name))}
                maxLength={40}
              />
              <small>Share this code or the private invite link from the quest page. Players without it cannot join.</small>
            </label>
          ) : null}


          {canMarkOfficial ? (
            <label className="groupquests-official-toggle">
              <input checked={official} onChange={(event) => setOfficial(event.target.checked)} type="checkbox" />
              <span>
                <strong>Official SQC Multiplayer Side Quest</strong>
                <small>Highlight this as a curated SQC event in public listings.</small>
              </span>
            </label>
          ) : null}

          {canMarkOfficial && official ? (
            <label>
              <span>Official label</span>
              <input value={officialLabel} onChange={(event) => setOfficialLabel(event.target.value)} maxLength={72} />
            </label>
          ) : null}

          <div className="groupquests-rule-builder compact" aria-label="Schedule">
            <div>
              <span className="groupquests-rule-title">Schedule</span>
              <p>Changing the window affects which future proof checks count.</p>
            </div>
            <div className="groupquests-rule-grid schedule-grid two-up">
              <label>
                <span>Opens</span>
                <input type="datetime-local" value={startAt} onChange={(event) => setStartAt(event.target.value)} />
              </label>
              <label>
                <span>Closes</span>
                <input type="datetime-local" value={endAt} onChange={(event) => setEndAt(event.target.value)} />
              </label>
            </div>
            <div className="groupquests-duration-chips" aria-label="Quick duration">
              <span>Quick duration</span>
              <div>
                {quickDurationOptions.map((option) => (
                  <button key={option.label} type="button" onClick={() => applyQuickDuration(option.days)}>
                    {option.label}
                  </button>
                ))}
              </div>
              <small>Use the same common proof-window shortcuts as mobile while preserving exact date editing.</small>
            </div>
          </div>

          <details className="groupquests-advanced-settings" open>
            <summary>Quests and proof settings <span>host only</span></summary>

            <section className="groupquests-quest-picker" aria-label="Choose side quests">
              <div className="groupquests-picker-head">
                <div>
                  <span>Side quests</span>
                  <strong>{selectedQuests.length} selected</strong>
                </div>
              </div>
              <div className="groupquests-picker-panel-wrap">
                <div className="groupquests-picker-panel">
                  {quests.map((quest) => {
                    const checked = selectedQuestIds.includes(quest.id);
                    return (
                      <label className={checked ? "active" : undefined} key={quest.id}>
                        <input checked={checked} onChange={() => toggleQuest(quest.id)} type="checkbox" />
                        <span>
                          <strong>{quest.title}</strong>
                          <small>{quest.source === "custom" ? "Your Custom Solo" : quest.source === "snapshot" ? "Saved custom snapshot" : quest.difficulty} · {quest.reward} pts · {quest.objective}</small>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </section>

            <div className="groupquests-builder-choice-set" role="group" aria-label="Allowed game providers">
              <span>Games allowed</span>
              <div>
                {providerModes.map((mode) => (
                  <button className={mode.id === providerMode ? "active" : undefined} key={mode.id} onClick={() => setProviderMode(mode.id)} type="button">
                    <strong>{mode.label}</strong>
                  </button>
                ))}
              </div>
            </div>

            <div className="groupquests-rule-builder" aria-label="Host game settings">
              <div>
                <span className="groupquests-rule-title">Host game settings</span>
                <p>These describe the intended run. Automatic checks currently enforce quest, provider, and window.</p>
              </div>
              <div className="groupquests-rule-grid">
                {gameRuleGroups.map((group) => (
                  <label key={group.id}>
                    <span>{group.label}</span>
                    <select value={rules[group.id] ?? group.options[0]} onChange={(event) => setRules((current) => ({ ...current, [group.id]: event.target.value }))}>
                      {group.options.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                  </label>
                ))}
              </div>
            </div>
          </details>
        </div>

        <aside className="groupquests-draft-preview" aria-label="Edit preview">
          <span className="eyebrow">Editing</span>
          {official ? <span className="badge gold official-sqc-badge">{officialLabel || "Official SQC Multiplayer Side Quest"}</span> : null}
          <h3>{name.trim() || "Untitled Multiplayer Side Quest"}</h3>
          <p>{inviteCopy}</p>
          <div className="groupquests-preview-stat-grid">
            <div><strong>Players</strong><span>{groupQuest.participants.length} joined</span></div>
            <div><strong>Quests</strong><span>{selectedQuests.length} selected</span></div>
          </div>
          <div className="groupquests-preview-link">
            <strong>Share URL</strong>
            <span>{inviteMode === "private-key" ? `https://sidequestchess.com/groupquests/${groupQuest.id}?inviteKey=${inviteKey}` : `https://sidequestchess.com/groupquests/${groupQuest.id}`}</span>
          </div>
        </aside>
      </div>

      <div className="groupquests-create-actions" aria-label="Save Multiplayer Side Quest edits">
        {error ? <p className="groupquest-join-error" role="alert">{error}</p> : null}
        <button className="button primary" disabled={saving} onClick={save} type="button">{saving ? "Saving…" : "Save changes"}</button>
      </div>
    </div>
  );
}
