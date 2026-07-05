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
}> = [
  {
    id: "overview",
    label: "My Tables",
    title: "Multiplayer Side Quests",
    copy: "Resume active, joined, hosted, and private-code tables.",
    href: "/multiplayer",
  },
  {
    id: "community",
    label: "Community",
    title: "Public tables",
    copy: "Browse open, joined, hosted, and finished community runs.",
    href: "/groupquests/public",
  },
  {
    id: "create",
    label: "Create",
    title: "Create Multiplayer",
    copy: "Pick Side Quests, proof window, access, and rules.",
    href: "/groupquests/create",
  },
  {
    id: "official",
    label: "Official",
    title: "Official Leaderboards",
    copy: "Track weekly official runs, final results, and archives.",
    href: "/leaderboards",
  },
];

export default function MultiplayerModeSwitcher({ active }: MultiplayerModeSwitcherProps) {
  return (
    <nav className="side-quest-mode-switcher multiplayer-mode-switcher" aria-label="Multiplayer Side Quest modes">
      {multiplayerModes.map((mode) => (
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
