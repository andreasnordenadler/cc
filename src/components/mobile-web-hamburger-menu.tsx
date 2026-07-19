"use client";

import Link from "next/link";
import { useId, useLayoutEffect, useReducer, useRef } from "react";

export type MobileWebMenuItem = {
  id: string;
  label: string;
  href: string;
  icon: string;
  active: boolean;
};

type MobileWebMenuAction = "toggle" | "close";

export function reduceMobileWebMenu(open: boolean, action: MobileWebMenuAction) {
  return action === "toggle" ? !open : false;
}

export function wrapMobileWebMenuFocus(activeIndex: number, itemCount: number, shiftKey: boolean) {
  if (itemCount < 1) return null;
  if (!shiftKey && activeIndex < 0) return 0;
  if (shiftKey && activeIndex <= 0) return itemCount - 1;
  if (!shiftKey && activeIndex >= itemCount - 1) return 0;
  return null;
}

export function shouldHandleMobileWebMenuNavigation(event: Pick<MouseEvent, "button" | "metaKey" | "ctrlKey" | "shiftKey" | "altKey">) {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

type MenuHistory = Pick<History, "state" | "pushState" | "back">;
type MenuPopStateTarget = {
  addEventListener(type: "popstate", listener: (event: PopStateEvent) => void): void;
  removeEventListener(type: "popstate", listener: (event: PopStateEvent) => void): void;
};

export function installMobileWebMenuHistory(history: MenuHistory, events: MenuPopStateTarget, entryId: string, onBack: () => void) {
  let closeRequested = false;
  let popped = false;
  let disposed = false;
  const closeOnBack = () => {
    if (history.state?.sqcMenu === entryId) return;
    if (popped) return;
    popped = true;
    onBack();
  };
  events.addEventListener("popstate", closeOnBack);
  const currentState = history.state && typeof history.state === "object" ? history.state : {};
  history.pushState({ ...currentState, sqcMenu: entryId }, "");

  const ownsCurrentEntry = () => history.state?.sqcMenu === entryId;

  return {
    close(beforeBack?: () => void) {
      if (closeRequested || popped || disposed) return false;
      closeRequested = true;
      beforeBack?.();
      if (ownsCurrentEntry()) history.back();
      else closeOnBack();
      return true;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      events.removeEventListener("popstate", closeOnBack);
      if (!closeRequested && !popped && ownsCurrentEntry()) history.back();
    },
  };
}

export default function MobileWebHamburgerMenu({ items }: { items: MobileWebMenuItem[] }) {
  const [open, dispatch] = useReducer(reduceMobileWebMenu, false);
  const historyEntryId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const historyRef = useRef<ReturnType<typeof installMobileWebMenuHistory> | null>(null);
  const pendingHrefRef = useRef<string | null>(null);

  useLayoutEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const trigger = triggerRef.current;
    const menuHistory = installMobileWebMenuHistory(window.history, window, historyEntryId, () => {
      dispatch("close");
      const pendingHref = pendingHrefRef.current;
      pendingHrefRef.current = null;
      if (pendingHref) window.location.assign(pendingHref);
    });
    historyRef.current = menuHistory;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    function handleModalKeyboard(event: KeyboardEvent) {
      if (event.key === "Escape") menuHistory.close();
      if (event.key !== "Tab") return;
      const links = Array.from(panelRef.current?.querySelectorAll<HTMLAnchorElement>("a[href]") ?? []);
      const activeIndex = links.indexOf(document.activeElement as HTMLAnchorElement);
      const nextIndex = wrapMobileWebMenuFocus(activeIndex, links.length, event.shiftKey);
      if (nextIndex === null) return;
      event.preventDefault();
      links[nextIndex]?.focus();
    }

    document.addEventListener("keydown", handleModalKeyboard);
    return () => {
      document.removeEventListener("keydown", handleModalKeyboard);
      menuHistory.dispose();
      historyRef.current = null;
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [historyEntryId, open]);

  function closeMenu() {
    if (!historyRef.current) dispatch("close");
    else historyRef.current.close();
  }

  return (
    <div className={open ? "sqc-menu open" : "sqc-menu"}>
      <button
        className="sqc-menu-button"
        type="button"
        aria-label={open ? "Close main menu" : "Open main menu"}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => open ? closeMenu() : dispatch("toggle")}
        ref={triggerRef}
        tabIndex={open ? -1 : 0}
      >
        <span aria-hidden="true" />
      </button>
      {open ? (
        <div className="sqc-menu-overlay">
          <button className="sqc-menu-backdrop" type="button" aria-label="Close main menu" onClick={closeMenu} />
          <div className="sqc-menu-panel" role="dialog" aria-modal="true" aria-label="Main menu" tabIndex={-1} ref={panelRef}>
            <nav aria-label="Main menu">
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={item.active ? "sqc-menu-row active" : "sqc-menu-row"}
                  aria-current={item.active ? "page" : undefined}
                  onClick={(event) => {
                    if (!shouldHandleMobileWebMenuNavigation(event)) return;
                    event.preventDefault();
                    if (!historyRef.current) {
                      window.location.assign(item.href);
                      return;
                    }
                    historyRef.current.close(() => {
                      pendingHrefRef.current = item.href;
                    });
                  }}
                >
                  <span className={`sqc-menu-icon ${item.icon}`} aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      ) : null}
    </div>
  );
}
