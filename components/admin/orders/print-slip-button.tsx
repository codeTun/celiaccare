"use client";

import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Prints the delivery slip (<DeliverySlip>) of the page, alone on the sheet.
 * It marks <html data-printing="slip"> during the print: the print CSS of DeliverySlip
 * then hides everything else. A normal Ctrl+P still prints the whole page.
 */
export function PrintSlipButton({ label = "Bon de livraison" }: { label?: string }) {
  function printSlip() {
    const root = document.documentElement;
    const cleanup = () => {
      delete root.dataset.printing;
      window.removeEventListener("afterprint", cleanup);
    };
    root.dataset.printing = "slip";
    window.addEventListener("afterprint", cleanup);
    window.print();
  }

  return (
    <Button variant="outline" size="sm" onClick={printSlip}>
      <Printer aria-hidden="true" />
      {label}
    </Button>
  );
}
