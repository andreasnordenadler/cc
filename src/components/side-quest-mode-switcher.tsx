import Link from "next/link";

type SideQuestMode = "official" | "community" | "custom" | "create";

type SideQuestModeSwitcherProps = {
  active: SideQuestMode;
};

const sideQuestModes: Array<{
  id: SideQuestMode;
  label: string;
  title: string;
  copy: string;
  href: string;
}> = [
  {
    id: "official",
    label: "Official",
    title: "Solo Side Quests",
    copy: "Curated SQC rules with proof checks and coat rewards.",
    href: "/solo",
  },
  {
    id: "community",
    label: "Community",
    title: "Player-made rules",
    copy: "Public Custom Solo Side Quests from other players.",
    href: "/community",
  },
  {
    id: "custom",
    label: "My Custom",
    title: "Saved customs",
    copy: "Private drafts, published quests, and archived ideas.",
    href: "/custom",
  },
  {
    id: "create",
    label: "Create",
    title: "Rule builder",
    copy: "Start the same Custom Side Quest creation path.",
    href: "/custom#custom-side-quest-builder",
  },
];

export default function SideQuestModeSwitcher({ active }: SideQuestModeSwitcherProps) {
  return (
    <nav className="side-quest-mode-switcher" aria-label="Side Quest modes">
      {sideQuestModes.map((mode) => (
        <Link
          aria-current={active === mode.id ? "page" : undefined}
          className={active === mode.id ? "side-quest-mode-switch active" : "side-quest-mode-switch"}
          href={mode.href}
          key={mode.id}
        >
          <span>{mode.label}</span>
          <strong>{mode.title}</strong>
          <small>{mode.copy}</small>
        </Link>
      ))}
    </nav>
  );
}
