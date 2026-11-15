import type { ReactNode } from "react";

import { buttonStyles } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

import { JasmineFlower } from "./decor";

/**
 * Dark green call-to-action panel (white text, zellige pattern, jasmine watermark),
 * placed at the end of the home and about pages. The content is free: title, text, buttons.
 */
export function CtaPanel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section className={cn("py-16 sm:py-20", className)}>
      <Container>
        <div className="relative isolate overflow-hidden rounded-[2rem] bg-brand-900 px-6 py-12 text-white shadow-lift sm:px-12 sm:py-16 lg:px-16">
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-khatam-light" />
          <div aria-hidden="true" className="absolute -end-24 -top-32 -z-10 size-96 rounded-full bg-brand-600/50 blur-3xl" />
          <JasmineFlower
            className="absolute -end-12 -bottom-16 -z-10 size-72 opacity-[0.08] sm:size-96"
            heartClassName="fill-white"
          />
          {children}
        </div>
      </Container>
    </section>
  );
}

/** Class names of a secondary button on a dark green background (white outline). */
export function lightOutlineButton({ size = "lg", className }: { size?: "md" | "lg"; className?: string } = {}) {
  return buttonStyles({
    variant: "outline",
    size,
    className: cn("border-white/35 bg-transparent text-white hover:border-white/60 hover:bg-white/10", className),
  });
}
