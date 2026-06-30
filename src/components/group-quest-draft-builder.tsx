"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import RatingPill from "@/components/rating-pill";

type BuilderQuest = {
  id: string;
  title: string;
  objective: string;
  reward: number;
  difficulty: string;
  source?: "official" | "custom" | "community" | "snapshot";
};

const defaultInviteCopy = "A friend invited you to a chess side quest. Try to win real games while completing weird objectives, then Side Quest Chess checks the public proof and updates the competition leaderboard.";
const storagePrefix = "sqc-groupquest-draft:";
const successCriteria = "First to complete all quests wins. If nobody finishes, best verified progress at the deadline wins.";

const providerModes = [
  { id: "both", label: "Lichess or Chess.com", copy: "Players can submit public proof from either supported provider." },
  { id: "lichess", label: "Lichess only", copy: "Only public Lichess games count for this Multiplayer Side Quest." },
  { id: "chesscom", label: "Chess.com only", copy: "Only public Chess.com games count for this Multiplayer Side Quest." },
];

const inviteModes = [
  {
    id: "public",
    label: "Public listing",
    copy: "Anyone can find it on the public Multiplayer Side Quest list and join.",
  },
  {
    id: "unlisted-link",
    label: "Unlisted link",
    copy: "Anyone with the Multiplayer Side Quest link can join while sharing is open.",
  },
  {
    id: "private-key",
    label: "Private host code",
    copy: "Only players with the host code can join. The table stays out of public discovery.",
  },
];

const hostPrepCards = [
  {
    step: "1",
    title: "Name the table",
    copy: "Give friends a clear hook and invite message before sharing.",
  },
  {
    step: "2",
    title: "Pick the run",
    copy: "Stack official quests or launch-ready Custom Solo Side Quests.",
  },
  {
    step: "3",
    title: "Set the window",
    copy: "Choose when proof opens, closes, and how public the invite should be.",
  },
];

function toDateTimeLocal(date: Date) {
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return offsetDate.toISOString().slice(0, 16);
}

function defaultStartAt() {
  const date = new Date();
  date.setSeconds(0, 0);
  return toDateTimeLocal(date);
}

function defaultEndAt() {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  date.setHours(23, 59, 0, 0);
  return toDateTimeLocal(date);
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
  return toDateTimeLocal(date);
}


function toIsoFromDateTimeLocal(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString();
}

function formatDateTimeLabel(value: string) {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

const gameRuleGroups = [
  {
    id: "timeControl",
    label: "Time control",
    options: [
      "Any time control",
      "Bullet 1+0",
      "Bullet 1+1",
      "Bullet 2+1",
      "Blitz 3+0",
      "Blitz 3+2",
      "Blitz 5+0",
      "Blitz 5+3",
      "Rapid 10+0",
      "Rapid 10+5",
      "Rapid 15+10",
      "Classical 30+0",
      "Classical 30+20",
    ],
  },
  {
    id: "rated",
    label: "Rated setting",
    options: ["Any rated state", "Rated only", "Casual only"],
  },
  {
    id: "color",
    label: "Player color",
    options: ["Any color", "White only", "Black only"],
  },
];

function publicIdFromName(name: string) {
  const source = name.trim() || "new multiplayer side quest";
  const hash = Array.from(source).reduce((total, char) => (total * 31 + char.charCodeAt(0)) % 90000, 0);
  return String(10000 + hash).slice(0, 5);
}

function makeInviteKey(name: string) {
  const safe = name.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 8) || "sqc";
  return `${safe}-${Math.random().toString(36).slice(2, 8)}`;
}

function cleanInviteKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 40);
}

function getQuestSourceLabel(source: BuilderQuest["source"]) {
  if (source === "custom") return "Your Custom Solo Side Quest";
  if (source === "community") return "Community Solo Side Quest";
  if (source === "snapshot") return "Saved Custom Solo Side Quest snapshot";
  return "Official Solo Side Quest";
}

export default function GroupQuestDraftBuilder({ quests, initialQuestId }: { quests: BuilderQuest[]; initialQuestId?: string }) {
  const [name, setName] = useState("No Castle Night");
  const defaultQuestId = quests.find((quest) => quest.id === "knights-before-coffee")?.id ?? quests[0]?.id ?? "";
  const preselectedQuestId = initialQuestId && quests.some((quest) => quest.id === initialQuestId) ? initialQuestId : defaultQuestId;
  const [selectedQuestIds, setSelectedQuestIds] = useState<string[]>(preselectedQuestId ? [preselectedQuestId] : []);
  const [questPickerOpen, setQuestPickerOpen] = useState(false);
  const [inviteMode, setInviteMode] = useState(inviteModes[0].id);
  const [inviteKey, setInviteKey] = useState(() => makeInviteKey("No Castle Night"));
  const [inviteCopy, setInviteCopy] = useState(defaultInviteCopy);
  const [providerMode, setProviderMode] = useState(providerModes[0].id);
  const [startAt, setStartAt] = useState(defaultStartAt);
  const [startAtEdited, setStartAtEdited] = useState(false);
  const [endAt, setEndAt] = useState(defaultEndAt);
  const [rules, setRules] = useState<Record<string, string>>({
    timeControl: "Any time control",
    rated: "Any rated state",
    color: "Any color",
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const hasSavedRef = useRef(false);

  const selectedQuests = useMemo(
    () => quests.filter((quest) => selectedQuestIds.includes(quest.id)),
    [quests, selectedQuestIds],
  );
  const selectedInviteMode = inviteModes.find((mode) => mode.id === inviteMode) ?? inviteModes[0];
  const selectedProviderMode = providerModes.find((mode) => mode.id === providerMode) ?? providerModes[0];
  const publicId = publicIdFromName(name);
  const previewRules = [
    { label: "Games allowed", value: selectedProviderMode.label },
    { label: "Time control", value: rules.timeControl ?? "Any time control" },
    { label: "Rated", value: rules.rated ?? "Any rated state" },
    { label: "Color", value: rules.color ?? "Any color" },
    { label: "Variant", value: "Standard chess only" },
    { label: "Winner", value: successCriteria },
  ];
  const scheduleLabel = `${formatDateTimeLabel(startAt)} → ${formatDateTimeLabel(endAt)}`;

  useEffect(() => {
    function warnBeforeLeaving(event: BeforeUnloadEvent) {
      if (hasSavedRef.current) return;
      event.preventDefault();
      event.returnValue = "";
    }

    function warnBeforeInternalNavigation(event: MouseEvent) {
      if (hasSavedRef.current || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(target instanceof HTMLAnchorElement) || target.target === "_blank" || target.hasAttribute("download")) return;
      const destination = new URL(target.href, window.location.href);
      const current = new URL(window.location.href);
      if (destination.origin !== current.origin || destination.pathname === current.pathname && destination.search === current.search && destination.hash) return;
      const shouldLeave = window.confirm("Leave without saving this Multiplayer Side Quest?");
      if (!shouldLeave) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      hasSavedRef.current = true;
    }

    window.addEventListener("beforeunload", warnBeforeLeaving);
    document.addEventListener("click", warnBeforeInternalNavigation, true);
    return () => {
      window.removeEventListener("beforeunload", warnBeforeLeaving);
      document.removeEventListener("click", warnBeforeInternalNavigation, true);
    };
  }, []);

  function applyQuickDuration(days: number) {
    setEndAt(endAtFromStart(startAt, days));
  }

  async function saveMultiplayerSideQuest() {
    setSaving(true);
    setSaveError("");

    try {
      window.localStorage.setItem(
        `${storagePrefix}${publicId}`,
        JSON.stringify({
          name: name.trim() || "Untitled Multiplayer Side Quest",
          inviteCopy: inviteCopy.trim() || defaultInviteCopy,
          providerMode,
          providerLabel: selectedProviderMode.label,
        }),
      );
    } catch {
      // The generated route still works with the default invite copy if local storage is unavailable.
    }

    try {
      const response = await fetch("/api/groupquests", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          inviteCopy,
          inviteMode,
          inviteKey: inviteMode === "private-key" ? inviteKey : undefined,
          questIds: selectedQuestIds,
          providerMode,
          providerLabel: selectedProviderMode.label,
          startAt: toIsoFromDateTimeLocal(startAt),
          endAt: toIsoFromDateTimeLocal(endAt),
          openImmediately: !startAtEdited,
          rules,
        }),
      });
      const result = await response.json().catch(() => null) as { href?: string; error?: string } | null;

      if (!response.ok || !result?.href) {
        throw new Error(result?.error ?? "Could not save Multiplayer Side Quest.");
      }

      hasSavedRef.current = true;
      window.location.href = result.href;
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Could not save Multiplayer Side Quest.");
      setSaving(false);
    }
  }

  function toggleQuest(questId: string) {
    setSelectedQuestIds((current) => {
      if (current.includes(questId)) {
        return current.length > 1 ? current.filter((id) => id !== questId) : current;
      }
      return [...current, questId];
    });
  }


  return (
    <div className="groupquests-builder-shell">
      <div className="groupquests-builder" aria-label="Create Multiplayer Side Quest builder">
        <div className="groupquests-builder-form">
          <div className="groupquests-quickstart-note" role="note">
            <strong>Host setup</strong>
            <span>Defaults are launch-safe: one Side Quest, public listing, one-week window, and Lichess or Chess.com proof. Published Custom Solo Side Quests can join the stack too.</span>
          </div>

          <div className="groupquests-builder-guide" aria-label="Multiplayer Side Quest setup guide">
            {hostPrepCards.map((card) => (
              <article key={card.step}>
                <strong>{card.step}</strong>
                <span>{card.title}</span>
                <small>{card.copy}</small>
              </article>
            ))}
          </div>

          <label>
            <span>1 · Multiplayer Side Quest name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Friday Night Chaos"
              maxLength={54}
            />
          </label>

          <label className="groupquests-invite-copy-editor">
            <span>2 · Invite message</span>
            <textarea
              value={inviteCopy}
              onChange={(event) => setInviteCopy(event.target.value)}
              maxLength={260}
              rows={4}
            />
            <small>Default text for the invite page. Hosts can keep it or personalize the tone before sharing.</small>
          </label>

          <section className="groupquests-quest-picker" aria-label="Choose side quests">
            <div className="groupquests-picker-head">
              <div>
                <span>3 · Quest stack</span>
                <strong>{selectedQuests.length} selected</strong>
                <small>Choose at least one objective. Players race the same stack from top to bottom.</small>
              </div>
              {!questPickerOpen ? (
                <button className="button primary" type="button" onClick={() => setQuestPickerOpen(true)}>
                  Add / edit side quests
                </button>
              ) : null}
            </div>
            <div className="groupquests-selected-quests" aria-label="Selected side quests">
              {selectedQuests.map((quest) => (
                <span key={quest.id}>{quest.title}</span>
              ))}
            </div>
            {questPickerOpen ? (
              <div className="groupquests-picker-panel-wrap">
                <div className="groupquests-picker-panel">
                  {quests.map((quest) => {
                    const checked = selectedQuestIds.includes(quest.id);
                    const sourceLabel = getQuestSourceLabel(quest.source);
                    return (
                      <label className={checked ? "active" : undefined} key={quest.id}>
                        <input
                          checked={checked}
                          onChange={() => toggleQuest(quest.id)}
                          type="checkbox"
                        />
                        <span>
                          <em>{sourceLabel}</em>
                          <strong>{quest.title}</strong>
                          <small className="inline-rating-copy">{quest.source === "official" ? quest.difficulty : sourceLabel} <RatingPill value={quest.reward} plus={false} /> {quest.objective}</small>
                        </span>
                      </label>
                    );
                  })}
                </div>
                <div className="groupquests-picker-footer">
                  <button className="button primary" type="button" onClick={() => setQuestPickerOpen(false)}>
                    Done
                  </button>
                </div>
              </div>
            ) : null}
          </section>

          <div className="groupquests-builder-choice-set" role="group" aria-label="Visibility">
            <span>4 · Visibility</span>
            <div>
              {inviteModes.map((mode) => (
                <button
                  className={mode.id === inviteMode ? "active" : undefined}
                  key={mode.id}
                  onClick={() => setInviteMode(mode.id)}
                  type="button"
                >
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

          <div className="groupquests-rule-builder compact" aria-label="Multiplayer Side Quest schedule">
            <div>
              <span className="groupquests-rule-title">5 · Schedule</span>
              <p>Set the exact window. For now, qualifying games must be played between open and close.</p>
            </div>
            <div className="groupquests-rule-grid schedule-grid two-up">
              <label>
                <span>Opens</span>
                <input type="datetime-local" value={startAt} onChange={(event) => { setStartAtEdited(true); setStartAt(event.target.value); }} />
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
              <small>Choose a common proof window without typing a closing date.</small>
            </div>
          </div>

          <details className="groupquests-advanced-settings">
            <summary>Advanced rules <span>optional</span></summary>

            <div className="groupquests-builder-choice-set" role="group" aria-label="Allowed game providers">
              <span>6 · Games allowed</span>
              <div>
                {providerModes.map((mode) => (
                  <button
                    className={mode.id === providerMode ? "active" : undefined}
                    key={mode.id}
                    onClick={() => setProviderMode(mode.id)}
                    type="button"
                  >
                    <strong>{mode.label}</strong>
                    <small>{mode.copy}</small>
                  </button>
                ))}
              </div>
            </div>

            <div className="groupquests-rule-builder" aria-label="Host game settings">
              <div>
                <span className="groupquests-rule-title">7 · Host game settings</span>
                <p>Automatic checks currently enforce the Side Quest objective, public provider, and event window. These extra settings describe the intended run while verifier coverage expands.</p>
              </div>
              <div className="groupquests-rule-grid">
                {gameRuleGroups.map((group) => (
                  <label key={group.id}>
                    <span>{group.label}</span>
                    <select
                      value={rules[group.id]}
                      onChange={(event) => setRules((current) => ({ ...current, [group.id]: event.target.value }))}
                    >
                      {group.options.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
            </div>
          </details>
        </div>

        <aside className="groupquests-draft-preview" aria-label="Multiplayer Side Quest preview">
          <span className="eyebrow">Multiplayer Side Quest Preview</span>
          <h3>{name.trim() || "Untitled Multiplayer Side Quest"}</h3>
          <p>{inviteCopy.trim() || defaultInviteCopy}</p>

          <div className="groupquests-preview-quest-stack">
            <div className="groupquests-preview-stack-head">
              <strong>Quest stack</strong>
              <span>{selectedQuests.length} selected</span>
            </div>
            <ol>
              {selectedQuests.map((quest, index) => (
                <li key={quest.id}>
                  <em>{index + 1}</em>
                  <span>
                    <strong>{quest.title}</strong>
                    <small className="inline-rating-copy">{quest.difficulty} <RatingPill value={quest.reward} plus={false} /></small>
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="groupquests-preview-stat-grid">
            <div>
              <strong>Visibility</strong>
              <span>{selectedInviteMode.label}</span>
            </div>
            <div>
              <strong>Schedule</strong>
              <span>{scheduleLabel}</span>
            </div>
          </div>
          <div className="groupquests-preview-rule-grid" aria-label="Participant rule summary">
            {previewRules.map((rule) => (
              <div key={rule.label}>
                <strong>{rule.label}</strong>
                <span>{rule.value}</span>
              </div>
            ))}
          </div>
          <div className="groupquests-rules-preview compact" aria-label="Winner rule preview">
            <strong>Winner rule</strong>
            <p>{successCriteria}</p>
          </div>
          <div className="groupquests-preview-link">
            <strong>Share URL</strong>
            <span>Created after saving.</span>
          </div>
        </aside>
      </div>

      <div className="groupquests-create-actions" aria-label="Create Multiplayer Side Quest actions">
        <div>
          <strong>Ready to host?</strong>
          <span>Save the table, review the invite page, then share the link or private host code.</span>
        </div>
        {saveError ? <p className="groupquest-join-error" role="alert">{saveError}</p> : null}
        <button className="button primary" disabled={saving} onClick={saveMultiplayerSideQuest} type="button">
          {saving ? "Saving…" : "Save Multiplayer Side Quest"}
        </button>
      </div>
    </div>
  );
}
