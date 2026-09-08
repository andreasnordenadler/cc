"use client";

import { useLayoutEffect, useRef, type CSSProperties, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not(:disabled)",
  "input:not(:disabled)",
  "select:not(:disabled)",
  "textarea:not(:disabled)",
  "[tabindex]:not([tabindex='-1'])",
  "[contenteditable='true']",
].join(",");

export function wrapAccessibleDialogFocus(activeIndex: number, itemCount: number, shiftKey: boolean) {
  if (itemCount < 1) return null;
  if (activeIndex < 0) return 0;
  if (shiftKey && activeIndex === 0) return itemCount - 1;
  if (!shiftKey && activeIndex === itemCount - 1) return 0;
  return null;
}

function getFocusableElements(dialog: HTMLElement) {
  return Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter((element) => (
    !element.hasAttribute("hidden")
    && element.getAttribute("aria-hidden") !== "true"
    && element.getClientRects().length > 0
  ));
}

type AccessibleModalDialogProps = {
  backdropClassName?: string;
  children: ReactNode;
  className: string;
  labelledBy: string;
  describedBy?: string;
  dismissOnBackdrop?: boolean;
  onDismiss: () => void;
  returnFocusRef: RefObject<HTMLElement | null>;
  role?: "dialog" | "alertdialog";
  style?: CSSProperties;
};

export default function AccessibleModalDialog({
  backdropClassName = "quest-switch-dialog-backdrop",
  children,
  className,
  labelledBy,
  describedBy,
  dismissOnBackdrop = true,
  onDismiss,
  returnFocusRef,
  role = "dialog",
  style,
}: AccessibleModalDialogProps) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const dismissRef = useRef(onDismiss);

  useLayoutEffect(() => {
    dismissRef.current = onDismiss;
  }, [onDismiss]);

  useLayoutEffect(() => {
    const backdrop = backdropRef.current;
    const dialog = dialogRef.current;
    if (!backdrop || !dialog) return;

    const activeBackdrop = backdrop;
    const activeDialog = dialog;
    const trigger = returnFocusRef.current;
    const previousOverflow = document.body.style.overflow;
    const background = Array.from(document.body.children)
      .filter((element): element is HTMLElement => element instanceof HTMLElement && element !== activeBackdrop)
      .map((element) => ({ element, inert: element.inert }));

    const focusInitial = () => {
      const focusable = getFocusableElements(activeDialog);
      const preferred = activeDialog.querySelector<HTMLElement>("[data-dialog-initial-focus]");
      const target = preferred && focusable.includes(preferred)
        ? preferred
        : focusable[0] ?? activeDialog;
      target.focus();
    };

    document.body.style.overflow = "hidden";
    for (const { element } of background) element.inert = true;
    focusInitial();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        dismissRef.current();
        return;
      }
      if (event.key !== "Tab") return;

      const controls = getFocusableElements(activeDialog);
      const activeIndex = controls.indexOf(document.activeElement as HTMLElement);
      const nextIndex = wrapAccessibleDialogFocus(activeIndex, controls.length, event.shiftKey);
      if (nextIndex === null) return;
      event.preventDefault();
      controls[nextIndex]?.focus();
    }

    function handleFocusIn(event: FocusEvent) {
      if (event.target instanceof Node && activeDialog.contains(event.target)) return;
      focusInitial();
    }

    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("focusin", handleFocusIn, true);
    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("focusin", handleFocusIn, true);
      document.body.style.overflow = previousOverflow;
      for (const { element, inert } of background) element.inert = inert;
      if (trigger?.isConnected) trigger.focus();
    };
  }, [returnFocusRef]);

  const dialog = (
    <section
      aria-describedby={describedBy}
      aria-labelledby={labelledBy}
      aria-modal="true"
      className={className}
      ref={dialogRef}
      role={role}
      style={style}
      tabIndex={-1}
    >
      {children}
    </section>
  );

  if (typeof document === "undefined") return dialog;

  return createPortal(
    <div
      className={backdropClassName}
      ref={backdropRef}
      role="presentation"
      onClick={(event) => {
        if (dismissOnBackdrop && event.target === event.currentTarget) dismissRef.current();
      }}
    >
      {dialog}
    </div>,
    document.body,
  );
}
