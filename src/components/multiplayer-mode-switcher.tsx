import Link from "next/link";

type MultiplayerMode = "overview" | "community" | "create" | "official";

type MultiplayerModeSwitcherProps = {
  active: MultiplayerMode;
};

const multiplayerModes: Array<{
  id: MultiplayerMode;
  label: string;
  title: string;
  copy: string;
  href: string;
  group: "catalog" | "actions";
}> = [
  {
    id: "official",
    label: "Official Side Quests",
    title: "Official Multiplayer",
    copy: "Default mobile entry: join official runs and inspect results.",
    href: "/multiplayer",
    group: "catalog",
  },
  {
    id: "community",
    label: "Community Side Quests",
    title: "Community Multiplayer",
    copy: "Browse open, joined, hosted, and finished public runs.",
    href: "/groupquests/public",
    group: "catalog",
  },
  {
    id: "overview",
    label: "My active / join",
    title: "My Multiplayer Side Quests",
    copy: "Resume joined Multiplayer Side Quests or enter a private host code.",
    href: "/multiplayer#my-multiplayer-side-quests",
    group: "actions",
  },
  {
    id: "create",
    label: "Create Multiplayer Side Quest",
    title: "Create Multiplayer",
    copy: "Pick Side Quests, proof window, access, and rules.",
    href: "/groupquests/create",
    group: "actions",
  },
];

export default function MultiplayerModeSwitcher({ active }: MultiplayerModeSwitcherProps) {
  const catalogModes = multiplayerModes.filter((mode) => mode.group === "catalog");
  const actionModes = multiplayerModes.filter((mode) => mode.group === "actions");

  return (
    <nav className="side-quest-mode-switcher multiplayer-mode-switcher" aria-label="Multiplayer Side Quest modes">
      <div className="multiplayer-brand-switch" aria-label="Official and Community Multiplayer Side Quest tabs">
        {catalogModes.map((mode) => (
          <Link
            aria-current={active === mode.id ? "page" : undefined}
            className={[
              "multiplayer-brand-tab",
              mode.id === "official" ? "official" : "community",
              active === mode.id ? "active" : "",
            ].filter(Boolean).join(" ")}
            href={mode.href}
            key={`brand-${mode.id}`}
          >
            <span>{mode.label}</span>
          </Link>
        ))}
      </div>
      <div className="side-quest-catalog-tabs" aria-label="Multiplayer catalog">
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
      <div className="side-quest-library-actions" aria-label="Multiplayer actions">
        {actionModes.map((mode) => (
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
      </div>
    </nav>
  );
}
