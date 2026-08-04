type DesktopOfficialQuestBriefingProps = {
  active: boolean;
  completed: boolean;
  difficulty: string;
  conditionCount: number;
};

export default function DesktopOfficialQuestBriefing({
  active,
  completed,
  difficulty,
  conditionCount,
}: DesktopOfficialQuestBriefingProps) {
  if (active || completed) return null;

  return (
    <dl className="sqc-desktop-quest-briefing" aria-label="Quest briefing">
      <div>
        <dt>Difficulty</dt>
        <dd>{difficulty}</dd>
      </div>
      <div>
        <dt>Conditions</dt>
        <dd>{conditionCount}</dd>
      </div>
      <div>
        <dt>Proof</dt>
        <dd>Automatic</dd>
      </div>
    </dl>
  );
}
