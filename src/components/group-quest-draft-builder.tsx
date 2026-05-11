"use client";

import { useMemo, useState } from "react";

type BuilderQuest = {
  id: string;
  title: string;
  objective: string;
  reward: number;
  difficulty: string;
};

type DraftRoom = {
  id: string;
  name: string;
  questTitles: string[];
  inviteMode: string;
  schedule: string;
  mandatoryRules: string[];
  slug: string;
};

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
    id: "invite-only",
    label: "Invite-only",
    copy: "Only named friends or approved invitees can join.",
  },
];

function toDateTimeLocal(date: Date) {
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return offsetDate.toISOString().slice(0, 16);
}

function defaultStartAt() {
  const date = new Date();
  date.setHours(date.getHours() + 1, 0, 0, 0);
  return toDateTimeLocal(date);
}

function defaultEndAt() {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  date.setHours(23, 59, 0, 0);
  return toDateTimeLocal(date);
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
      "Bullet 0+1",
      "Bullet 1+0",
      "Bullet 1+1",
      "Bullet 2+1",
      "Blitz 3+0",
      "Blitz 3+2",
      "Blitz 5+0",
      "Blitz 5+3",
      "Rapid 10+0",
      "Rapid 10+5",
      "Rapid 15+0",
      "Rapid 15+10",
      "Classical 25+0",
      "Classical 30+0",
      "Classical 30+20",
      "Classical 60+0",
      "Custom time control",
    ],
  },
  {
    id: "rated",
    label: "Rated setting",
    options: ["Any rated state", "Rated only", "Casual only"],
  },
  {
    id: "variant",
    label: "Variant",
    options: ["Standard only", "Any variant", "Chess960", "King of the Hill", "Three-check", "Antichess", "Atomic", "Horde", "Racing Kings"],
  },
  {
    id: "color",
    label: "Player color",
    options: ["Any color", "White only", "Black only"],
  },
];

function slugFromName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "new-group-quest";
}

export default function GroupQuestDraftBuilder({ quests }: { quests: BuilderQuest[] }) {
  const [name, setName] = useState("No Castle Night");
  const initialQuestId = quests.find((quest) => quest.id === "knights-before-coffee")?.id ?? quests[0]?.id ?? "";
  const [selectedQuestIds, setSelectedQuestIds] = useState<string[]>(initialQuestId ? [initialQuestId] : []);
  const [questPickerOpen, setQuestPickerOpen] = useState(false);
  const [inviteMode, setInviteMode] = useState(inviteModes[0].id);
  const [startAt, setStartAt] = useState(defaultStartAt);
  const [endAt, setEndAt] = useState(defaultEndAt);
  const [rules, setRules] = useState<Record<string, string>>({
    timeControl: "Any time control",
    rated: "Any rated state",
    variant: "Any variant",
    color: "Any color",
  });
  const [draftRooms, setDraftRooms] = useState<DraftRoom[]>([]);
  const [inviteCopied, setInviteCopied] = useState(false);

  const selectedQuests = useMemo(
    () => quests.filter((quest) => selectedQuestIds.includes(quest.id)),
    [quests, selectedQuestIds],
  );
  const selectedQuestTitles = selectedQuests.map((quest) => quest.title);
  const selectedInviteMode = inviteModes.find((mode) => mode.id === inviteMode) ?? inviteModes[0];
  const draftSlug = slugFromName(name);
  const mandatoryRules = gameRuleGroups
    .map((group) => rules[group.id])
    .filter((rule) => rule && !rule.startsWith("Any"));
  const scheduleLabel = `${formatDateTimeLabel(startAt)} → ${formatDateTimeLabel(endAt)}`;

  function createLocalDraftRoom() {
    const roomName = name.trim() || "Untitled Multiplayer Side Quest";
    setDraftRooms((rooms) => [
      {
        id: `${draftSlug}-${rooms.length + 1}`,
        name: roomName,
        questTitles: selectedQuestTitles.length > 0 ? selectedQuestTitles : ["No side quest selected"],
        inviteMode: selectedInviteMode.label,
        schedule: scheduleLabel,
        mandatoryRules,
        slug: draftSlug,
      },
      ...rooms,
    ]);
    setInviteCopied(false);
  }


  function toggleQuest(questId: string) {
    setSelectedQuestIds((current) => {
      if (current.includes(questId)) {
        return current.length > 1 ? current.filter((id) => id !== questId) : current;
      }
      return [...current, questId];
    });
  }

  function copyInviteText() {
    const inviteText = `Join my Side Quest Chess Multiplayer Side Quest: ${name.trim() || "Untitled Multiplayer Side Quest"} — /groupquests/${draftSlug}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(inviteText).catch(() => undefined);
    }
    setInviteCopied(true);
  }

  return (
    <div className="groupquests-builder-shell">
      <div className="groupquests-builder" aria-label="Create Multiplayer Side Quest builder">
        <div className="groupquests-builder-form">
          <label>
            <span>1 · Multiplayer Side Quest name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Friday Night Chaos"
              maxLength={54}
            />
          </label>

          <section className="groupquests-quest-picker" aria-label="Choose side quests">
            <div className="groupquests-picker-head">
              <div>
                <span>2 · Side quests</span>
                <strong>{selectedQuests.length} selected</strong>
              </div>
              {!questPickerOpen ? (
                <button className="button secondary" type="button" onClick={() => setQuestPickerOpen(true)}>
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
                    return (
                      <label className={checked ? "active" : undefined} key={quest.id}>
                        <input
                          checked={checked}
                          onChange={() => toggleQuest(quest.id)}
                          type="checkbox"
                        />
                        <span>
                          <strong>{quest.title}</strong>
                          <small>{quest.difficulty} · {quest.reward} pts · {quest.objective}</small>
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
            <span>3 · Visibility</span>
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

          <div className="groupquests-rule-builder compact" aria-label="Multiplayer Side Quest schedule">
            <div>
              <span className="groupquests-rule-title">4 · Schedule</span>
              <p>Set the exact window. For now, qualifying games must be played between open and close.</p>
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
          </div>

          <div className="groupquests-rule-builder" aria-label="Mandatory game settings">
            <div>
              <span className="groupquests-rule-title">5 · Mandatory game rules</span>
              <p>Hosts can make provider settings mandatory so every participant understands exactly which games can produce Multiplayer Side Quest proof.</p>
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
        </div>

        <aside className="groupquests-draft-preview" aria-label="Multiplayer Side Quest preview">
          <span className="eyebrow">Participant preview</span>
          <h3>{name.trim() || "Untitled Multiplayer Side Quest"}</h3>
          <p>{selectedQuests.length > 1 ? `Players must complete ${selectedQuests.length} side quests inside the window.` : selectedQuests[0]?.objective ?? "Choose at least one side quest to preview the participant view."}</p>
          <div className="groupquests-preview-stat-grid">
            <div>
              <strong>Side quests</strong>
              <span>{selectedQuestTitles.length > 0 ? selectedQuestTitles.join(" + ") : "No side quest selected"}</span>
            </div>
            <div>
              <strong>Visibility</strong>
              <span>{selectedInviteMode.label}</span>
            </div>
            <div>
              <strong>Schedule</strong>
              <span>{scheduleLabel}</span>
            </div>
          </div>
          <div className="groupquests-preview-link">
            <strong>Share link</strong>
            <span>/groupquests/{draftSlug}</span>
          </div>
          <div className="groupquests-rules-preview">
            <strong>Locked rules</strong>
            {mandatoryRules.length > 0 ? (
              <div>{mandatoryRules.map((rule) => <span key={rule}>{rule}</span>)}</div>
            ) : (
              <p>No provider settings are mandatory yet.</p>
            )}
          </div>
          <div className="groupquests-maintenance-preview">
            <strong>Host maintenance preview</strong>
            <ul>
              <li>Copy invite and pause new joins.</li>
              <li>Review rejected proof with plain-language reasons.</li>
              <li>Close the proof window and publish final standings.</li>
            </ul>
          </div>
          <div className="button-row">
            <button className="button primary" onClick={createLocalDraftRoom} type="button">Create local preview</button>
            <button className="button secondary" onClick={copyInviteText} type="button">
              {inviteCopied ? "Invite text copied" : "Copy invite text"}
            </button>
          </div>
          <p className="proof-line">Preview only — saved Multiplayer Side Quests will use the same rules summary and maintenance states.</p>
        </aside>
      </div>

      {draftRooms.length > 0 ? (
        <section className="groupquests-local-drafts" aria-label="Local Multiplayer Side Quest previews">
          <div className="section-head">
            <div>
              <span className="eyebrow">Local previews</span>
              <h3>Created in this browser session.</h3>
            </div>
            <span className="badge green">{draftRooms.length}</span>
          </div>
          <div className="groupquests-card-stack">
            {draftRooms.map((room) => (
              <article className="mission-card groupquests-group-card" key={room.id}>
                <div className="card-meta">
                  <span>You host</span>
                  <span className="badge gold">Preview</span>
                </div>
                <h3>{room.name}</h3>
                <div className="groupquests-mini-stats">
                  <span>{room.questTitles.join(" + ")}</span>
                  <span>{room.inviteMode}</span>
                  <span>{room.schedule}</span>
                </div>
                {room.mandatoryRules.length > 0 ? (
                  <div className="groupquests-rules-preview compact">
                    <strong>Locked</strong>
                    <div>{room.mandatoryRules.map((rule) => <span key={rule}>{rule}</span>)}</div>
                  </div>
                ) : null}
                <p className="proof-line">Share link preview: /groupquests/{room.slug}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
