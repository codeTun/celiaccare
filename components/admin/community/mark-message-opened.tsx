"use client";

import { startTransition, useEffect } from "react";

/**
 * Invisible: when the detail page of a NEW message is displayed, it calls the Server Action
 * once so the message becomes "En cours" (it was read). A write never happens while a page
 * is merely prefetched: only a real visit in the browser runs this effect.
 * `action` is bound on the server: markMessageOpenedAction.bind(null, message.id).
 */
export function MarkMessageOpened({ action }: { action: () => Promise<void> }) {
  useEffect(() => {
    startTransition(async () => {
      try {
        await action();
      } catch (error) {
        // Not important enough to bother the admin: the status can be changed by hand.
        console.error(error);
      }
    });
  }, [action]);
  return null;
}
