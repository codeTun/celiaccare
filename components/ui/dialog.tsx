"use client";

import { X } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Accessible modal built on the native <dialog> element.
 * Controlled: pass `open` and `onClose`. It closes itself when its page is hidden or unmounted.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  closeLabel,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  closeLabel: string;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Visited pages stay mounted but hidden (Activity), which runs this cleanup; so does unmounting.
  // Never leave the modal open there: its scroll lock (<html> :has(dialog:modal)) would block
  // the page the visitor is looking at. Closing fires onClose, so the parent's state follows.
  useLayoutEffect(() => {
    const dialog = ref.current;
    return () => {
      if (dialog?.open) dialog.close();
    };
  }, []);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      aria-labelledby="dialog-title"
      className={cn(
        "m-auto w-[calc(100%-2rem)] max-w-lg rounded-3xl border border-line bg-white p-0 text-ink shadow-lift backdrop:bg-brand-950/40 backdrop:backdrop-blur-[2px]",
        className,
      )}
    >
      {open ? (
        <div className="p-6 sm:p-7">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h2 id="dialog-title" className="text-lg font-bold">
                {title}
              </h2>
              {description ? <p className="mt-1 text-sm text-ink-muted">{description}</p> : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid size-9 shrink-0 place-items-center rounded-full text-ink-muted hover:bg-canvas"
            >
              <X className="size-5" aria-hidden="true" />
              <span className="sr-only">{closeLabel}</span>
            </button>
          </div>
          {children}
        </div>
      ) : null}
    </dialog>
  );
}
