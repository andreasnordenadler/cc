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
    id: "official",
    label: "Official Side Quests",
    title: "Official Multiplayer",
    copy: "Join SQC official runs and inspect final weekly results.",
    href: "/leaderboards",
  },
  {
    id: "community",
    label: "Community Side Quests",
    title: "Community Multiplayer",
    copy: "Browse open, joined, hosted, and finished public runs.",
    href: "/groupquests/public",
  },
  {
    id: "create",
    label: "Create Multiplayer Side Quest",
    title: "Create Multiplayer",
    copy: "Pick Side Quests, proof window, access, and rules.",
    href: "/groupquests/create",
  },
  {
    id: "overview",
    label: "My active",
    title: "My Multiplayer Side Quests",
    copy: "Resume active, joined, hosted, and invite-code tables.",
    href: "/multiplayer",
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
