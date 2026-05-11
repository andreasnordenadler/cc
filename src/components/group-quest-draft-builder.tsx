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
  questTitle: string;
  inviteMode: string;
  proofWindow: string;
  duration: string;
  mandatoryRules: string[];
  slug: string;
};

const inviteModes = [
  {
    id: "invite-only",
    label: "Invite-only",
    copy: "Only named friends or approved invitees can join.",
  },
  {
    id: "unlisted-link",
    label: "Unlisted link",
    copy: "Anyone with the Multiplayer Side Quest link can join while sharing is open.",
  },
  {
    id: "approval-required",
    label: "Approval-required",
    copy: "Players request access and the host approves them.",
  },
];

const proofWindows = [
  "Fresh games after start",
  "Fresh games after join + start",
  "Manual retroactive proof later",
];

const createStages = [
  { label: "Basics", copy: "Name + first side quest" },
  { label: "Invites", copy: "Access + proof window" },
  { label: "Rules", copy: "Provider constraints" },
  { label: "Preview", copy: "Share + maintain" },
];

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
  const [selectedQuestId, setSelectedQuestId] = useState(quests.find((quest) => quest.id === "knights-before-coffee")?.id ?? quests[0]?.id ?? "");
  const [inviteMode, setInviteMode] = useState(inviteModes[0].id);
  const [proofWindow, setProofWindow] = useState(proofWindows[0]);
  const [duration, setDuration] = useState("7 days");
  const [rules, setRules] = useState<Record<string, string>>({
    timeControl: "Any time control",
    rated: "Any rated state",
    variant: "Any variant",
    color: "Any color",
  });
  const [draftRooms, setDraftRooms] = useState<DraftRoom[]>([]);
  const [inviteCopied, setInviteCopied] = useState(false);

  const selectedQuest = useMemo(
    () => quests.find((quest) => quest.id === selectedQuestId) ?? quests[0],
    [quests, selectedQuestId],
  );
  const selectedInviteMode = inviteModes.find((mode) => mode.id === inviteMode) ?? inviteModes[0];
  const draftSlug = slugFromName(name);
  const mandatoryRules = gameRuleGroups
    .map((group) => rules[group.id])
    .filter((rule) => rule && !rule.startsWith("Any"));

  function createLocalDraftRoom() {
    const roomName = name.trim() || "Untitled Multiplayer Side Quest";
    setDraftRooms((rooms) => [
      {
        id: `${draftSlug}-${rooms.length + 1}`,
        name: roomName,
        questTitle: selectedQuest?.title ?? "No side quest selected",
        inviteMode: selectedInviteMode.label,
        proofWindow,
        duration,
        mandatoryRules,
        slug: draftSlug,
      },
      ...rooms,
    ]);
    setInviteCopied(false);
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
      <div className="groupquests-stage-rail" aria-label="Create Multiplayer Side Quest stages">
        {createStages.map((stage, index) => (
          <div className="groupquests-stage-pill" key={stage.label}>
            <strong>{index + 1}</strong>
            <span>{stage.label}</span>
            <small>{stage.copy}</small>
          </div>
        ))}
      </div>

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

          <label>
            <span>2 · First side quest</span>
            <select value={selectedQuestId} onChange={(event) => setSelectedQuestId(event.target.value)}>
              {quests.map((quest) => (
                <option key={quest.id} value={quest.id}>
                  {quest.title} · {quest.difficulty} · {quest.reward} pts
                </option>
              ))}
            </select>
          </label>

          <div className="groupquests-builder-choice-set" role="group" aria-label="Invite mode">
            <span>3 · Invite mode</span>
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

          <div className="groupquests-builder-row">
            <label>
              <span>4 · Proof window</span>
              <select value={proofWindow} onChange={(event) => setProofWindow(event.target.value)}>
                {proofWindows.map((window) => (
                  <option key={window} value={window}>{window}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Duration</span>
              <select value={duration} onChange={(event) => setDuration(event.target.value)}>
                <option>24 hours</option>
                <option>48 hours</option>
                <option>7 days</option>
                <option>Manual end</option>
              </select>
            </label>
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
          <p>{selectedQuest?.objective ?? "Choose a side quest to preview the participant view."}</p>
          <div className="groupquests-preview-stat-grid">
            <div>
              <strong>Side quest</strong>
              <span>{selectedQuest?.title ?? "No side quest selected"}</span>
            </div>
            <div>
              <strong>Invite</strong>
              <span>{selectedInviteMode.label}</span>
            </div>
            <div>
              <strong>Proof</strong>
              <span>{proofWindow}</span>
            </div>
            <div>
              <strong>Window</strong>
              <span>{duration}</span>
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
                  <span>{room.questTitle}</span>
                  <span>{room.inviteMode}</span>
                  <span>{room.duration}</span>
                </div>
                <p>{room.proofWindow}</p>
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
