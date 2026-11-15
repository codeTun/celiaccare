"use client";

import { useEffect } from "react";

/**
 * Opens the question named in the address (/faq#paiement). Browsers scroll to
 * a <details> element given in the URL but leave it closed. Runs when the page
 * loads and each time an in-page link changes the "#..." part of the address.
 */
export function OpenDetailsFromHash() {
  useEffect(() => {
    function openFromHash() {
      let id: string;
      try {
        id = decodeURIComponent(window.location.hash.slice(1));
      } catch {
        return; // malformed "#%..." typed by hand
      }
      const target = id ? document.getElementById(id) : null;
      if (target instanceof HTMLDetailsElement) target.open = true;
    }

    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, []);

  return null;
}
