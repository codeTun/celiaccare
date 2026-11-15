"use client";

import { Cookie } from "lucide-react";
import Link from "next/link";
import { useSyncExternalStore } from "react";

import { buttonStyles } from "@/components/ui/button";

/**
 * Small notice about cookies (spec 6.4), at the bottom of every public page until the visitor
 * closes it. The site only uses essential storage (cart, language, admin session), which needs
 * no consent: the notice informs and links to the cookies section of the privacy policy.
 * The dismissal is remembered in localStorage; the server never renders the notice.
 */

const STORAGE_KEY = "celiaccare.cookie-notice.v1";
const listeners = new Set<() => void>();
let dismissedThisVisit = false; // storage blocked (private browsing...): hide it until the next visit

function isDismissed() {
  if (dismissedThisVisit) return true;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "dismissed";
  } catch {
    return false;
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Closed in another tab: hide it here too.
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function dismiss() {
  dismissedThisVisit = true;
  try {
    window.localStorage.setItem(STORAGE_KEY, "dismissed");
  } catch {
    // storage full or disabled: hidden for this visit only
  }
  listeners.forEach((listener) => listener());
}

/** What the server renders (it cannot read localStorage): nothing. */
const hiddenOnServer = () => true;

export function CookieNotice({
  label,
  text,
  moreLabel,
  moreHref,
  dismissLabel,
}: {
  /** Name of the region for screen readers, e.g. "Cookies" */
  label: string;
  text: string;
  moreLabel: string;
  /** Cookies section of the privacy policy, e.g. "/fr/confidentialite#cookies" */
  moreHref: string;
  dismissLabel: string;
}) {
  const dismissed = useSyncExternalStore(subscribe, isDismissed, hiddenOnServer);
  if (dismissed) return null;

  return (
    <section
      aria-label={label}
      className="fixed inset-x-3 bottom-3 z-40 flex items-center gap-3 rounded-2xl border border-line bg-white p-3 ps-4 text-sm text-ink-muted shadow-lift sm:inset-x-auto sm:start-4 sm:bottom-4 sm:max-w-md print:hidden"
    >
      <Cookie className="size-5 shrink-0 text-brand-700" aria-hidden="true" />
      <p className="min-w-0 flex-1 leading-snug">
        {text}{" "}
        <Link href={moreHref} className="font-semibold whitespace-nowrap text-brand-700 underline underline-offset-2 hover:text-brand-800">
          {moreLabel}
        </Link>
      </p>
      <button type="button" onClick={dismiss} className={buttonStyles({ variant: "secondary", size: "sm", className: "shrink-0" })}>
        {dismissLabel}
      </button>
    </section>
  );
}
