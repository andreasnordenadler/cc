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
  appPrimary?: boolean;
}> = [
  {
    id: "official",
    label: "Official Side Quests",
    title: "Curated Solo Side Quests",
    copy: "The app's official deck with proof checks and coat rewards.",
    href: "/solo",
    appPrimary: true,
  },
  {
    id: "community",
    label: "Community Side Quests",
    title: "Player-made Solo rules",
    copy: "Discover public Side Quests from the SQC community.",
    href: "/community",
    appPrimary: true,
  },
  {
    id: "custom",
    label: "My Custom Side Quests",
    title: "Saved customs",
    copy: "Private drafts, public releases, and archived ideas.",
    href: "/custom",
  },
  {
    id: "create",
    label: "Create Custom Side Quest",
    title: "Rule builder",
    copy: "Start the app's Custom Side Quest creation path.",
    href: "/custom#custom-side-quest-builder",
  },
];

export default function SideQuestModeSwitcher({ active }: SideQuestModeSwitcherProps) {
  return (
    <nav className="side-quest-mode-switcher" aria-label="Side Quest modes">
      {sideQuestModes.map((mode) => (
        <Link
          aria-current={active === mode.id ? "page" : undefined}
          className={[
            "side-quest-mode-switch",
            mode.appPrimary ? "app-primary" : "",
            active === mode.id ? "active" : "",
          ].filter(Boolean).join(" ")}
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
