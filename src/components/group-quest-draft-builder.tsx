"use client";

import { useMemo, useState } from "react";

type BuilderQuest = {
  id: string;
  title: string;
  objective: string;
  reward: number;
  difficulty: string;
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
    copy: "Anyone with the room link can join while this is hidden.",
  },
  {
    id: "approval-required",
    label: "Approval-required",
    copy: "Players request access and the room owner approves them.",
  },
];

const proofWindows = [
  "Fresh games after start",
  "Fresh games after join + start",
  "Manual retroactive proof later",
];

export default function GroupQuestDraftBuilder({ quests }: { quests: BuilderQuest[] }) {
  const [name, setName] = useState("No Castle Night");
  const [selectedQuestId, setSelectedQuestId] = useState(quests[0]?.id ?? "");
  const [inviteMode, setInviteMode] = useState(inviteModes[1].id);
  const [proofWindow, setProofWindow] = useState(proofWindows[1]);
  const [duration, setDuration] = useState("48 hours");

  const selectedQuest = useMemo(
    () => quests.find((quest) => quest.id === selectedQuestId) ?? quests[0],
    [quests, selectedQuestId],
  );
  const selectedInviteMode = inviteModes.find((mode) => mode.id === inviteMode) ?? inviteModes[0];
  const draftSlug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "new-group-quest";

  return (
    <div className="groupquests-builder" aria-label="Create draft group quest builder">
      <div className="groupquests-builder-form">
        <label>
          <span>1 · Group name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Friday Night Chaos"
            maxLength={54}
          />
        </label>

        <label>
          <span>2 · Quest</span>
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
      </div>

      <aside className="groupquests-draft-preview" aria-label="Draft group quest preview">
        <span className="eyebrow">Draft preview</span>
        <h3>{name.trim() || "Untitled group quest"}</h3>
        <p>{selectedQuest?.objective ?? "Choose a quest to preview the room."}</p>
        <div className="groupquests-preview-stat-grid">
          <div>
            <strong>Quest</strong>
            <span>{selectedQuest?.title ?? "No quest selected"}</span>
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
          <strong>Future room</strong>
          <span>/groupquests/{draftSlug}</span>
        </div>
        <p className="proof-line">Draft only for now — no data is saved yet, and this stays hidden until persistence is ready.</p>
      </aside>
    </div>
  );
}
