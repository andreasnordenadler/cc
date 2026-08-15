"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

type DesktopMenuItem = {
  id: string;
  label: string;
  href: string;
  icon: string;
};

export default function DesktopHomeMenu({ items, activeItemId }: { items: readonly DesktopMenuItem[]; activeItemId: string }) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const summaryRef = useRef<HTMLElement>(null);
  const groups = [
    { label: "Create & manage", items: items.slice(0, 3) },
    { label: "Account & help", items: items.slice(3) },
  ].filter((group) => group.items.length > 0);

  useEffect(() => {
    const details = detailsRef.current;
    details?.removeAttribute("inert");

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

    const onFocusIn = (event: FocusEvent) => {
      const details = detailsRef.current;
      if (!details?.open || details.contains(event.target as Node)) return;
      closeMenu(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("focusin", onFocusIn);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("focusin", onFocusIn);
    };
  }, []);

  return (
    <details className="sqc-desktop-menu" ref={detailsRef} inert>
      <summary ref={summaryRef}>
        <span>Explore</span>
        <span className="sqc-desktop-menu-chevron" aria-hidden="true">⌄</span>
      </summary>
      <nav aria-label="Desktop main menu">
        {groups.map((group) => (
          <section key={group.label} className="sqc-desktop-menu-group" aria-label={group.label}>
            <span className="sqc-desktop-menu-group-title">{group.label}</span>
            {group.items.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                aria-current={item.id === activeItemId ? "page" : undefined}
                onClick={() => {
                  if (detailsRef.current) detailsRef.current.open = false;
                }}
              >
                <span className={`sqc-menu-icon ${item.icon}`} aria-hidden="true" />
                {item.label}
              </Link>
            ))}
          </section>
        ))}
      </nav>
    </details>
  );
}
