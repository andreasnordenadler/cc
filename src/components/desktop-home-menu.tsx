"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

type DesktopMenuItem = {
  id: string;
  label: string;
  href: string;
  icon: string;
};

export default function DesktopHomeMenu({ items }: { items: readonly DesktopMenuItem[] }) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const summaryRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const closeMenu = (restoreFocus: boolean) => {
      const details = detailsRef.current;
      if (!details?.open) return;
      details.open = false;
      if (restoreFocus) summaryRef.current?.focus();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || !detailsRef.current?.open) return;
      event.preventDefault();
      closeMenu(true);
    };

    const onPointerDown = (event: PointerEvent) => {
      const details = detailsRef.current;
      if (!details?.open || details.contains(event.target as Node)) return;
      closeMenu(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);

  return (
    <details className="sqc-desktop-menu" ref={detailsRef}>
      <summary ref={summaryRef}>Menu</summary>
      <nav aria-label="Desktop main menu">
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            aria-current={item.id === "home" ? "page" : undefined}
            onClick={() => {
              if (detailsRef.current) detailsRef.current.open = false;
            }}
          >
            <span className={`sqc-menu-icon ${item.icon}`} aria-hidden="true" />
            {item.label}
          </Link>
        ))}
      </nav>
    </details>
  );
}
