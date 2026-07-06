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
  group: "catalog" | "library";
}> = [
  {
    id: "official",
    label: "Official",
    title: "Curated Solo Side Quests",
    copy: "SQC's official Solo deck with proof checks and coat rewards.",
    href: "/solo",
    group: "catalog",
  },
  {
    id: "community",
    label: "Community",
    title: "Community Solo Side Quests",
    copy: "Player-made public Solo rules, likes, creator context, and report handoff.",
    href: "/community",
    group: "catalog",
  },
  {
    id: "custom",
    label: "My Custom Side Quests",
    title: "Saved customs",
    copy: "Private drafts, public releases, and archived ideas.",
    href: "/custom",
    group: "library",
  },
  {
    id: "create",
    label: "Create Custom Side Quest",
    title: "Rule builder",
    copy: "Start the app's Custom Side Quest creation path.",
    href: "/custom#custom-side-quest-builder",
    group: "library",
  },
];

export default function SideQuestModeSwitcher({ active }: SideQuestModeSwitcherProps) {
  const catalogModes = sideQuestModes.filter((mode) => mode.group === "catalog");
  const libraryModes = sideQuestModes.filter((mode) => mode.group === "library");

  return (
    <nav className="side-quest-mode-switcher" aria-label="Side Quest modes">
      <div className="side-quest-catalog-tabs" aria-label="Solo Side Quest catalog">
        {catalogModes.map((mode) => (
          <Link
            aria-current={active === mode.id ? "page" : undefined}
            className={[
              "side-quest-mode-switch",
              "app-primary",
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
      </div>
      <div className="side-quest-library-actions" aria-label="Custom Solo Side Quest actions">
        {libraryModes.map((mode) => (
          <Link
            aria-current={active === mode.id ? "page" : undefined}
            className={[
              "side-quest-mode-switch",
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
      </div>
    </nav>
  );
}
