import { FlaskConical } from "lucide-react";

import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import type { AboutDict } from "@/i18n/resources/fr/about";

import { JasmineFlower } from "../decor";

/**
 * "Notre histoire": the idea born in a Design Thinking project of the Master BioMIS.
 * On the side, a green doorway shows the 5 Design Thinking steps.
 * `id` lets the hero's "on this page" links jump here.
 */
export function AboutStory({ about, id }: { about: AboutDict; id?: string }) {
  const { story } = about;

  return (
    <section id={id} className="relative isolate scroll-mt-24 overflow-hidden bg-canvas py-16 sm:py-24">
      {/* large jasmine watermark */}
      <JasmineFlower
        className="absolute -start-28 top-10 -z-10 size-[26rem] opacity-[0.04]"
        petalClassName="fill-brand-800"
        heartClassName="fill-brand-800"
      />
      <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div>
          <SectionHeading eyebrow={story.eyebrow} title={story.title} />
          <div className="mt-5 space-y-4 text-base leading-relaxed text-ink-muted sm:text-lg">
            {story.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>

        {/* the 5 Design Thinking steps, inside a doorway */}
        <div className="relative mx-auto w-full max-w-sm">
          <div className="arch relative isolate overflow-hidden bg-gradient-to-b from-brand-600 to-brand-800 px-7 pt-20 pb-8 text-white shadow-lift ring-8 ring-white sm:px-9">
            <div aria-hidden="true" className="absolute inset-0 -z-10 bg-khatam-light" />
            <span aria-hidden="true" className="mx-auto grid size-14 place-items-center rounded-full bg-white/10 ring-1 ring-white/20">
              <FlaskConical className="size-7 text-brand-100" />
            </span>
            <p className="mt-4 text-center text-2xl font-extrabold">{story.badge}</p>
            <p className="mt-1 text-center text-sm text-brand-100">{story.badgeText}</p>
            <ol aria-label={story.stepsLabel} className="mt-7 space-y-2">
              {story.steps.map((step, index) => (
                <li key={step} className="flex items-center gap-3 rounded-full bg-white/10 py-1.5 ps-1.5 pe-4 text-sm font-semibold ring-1 ring-white/10">
                  <span
                    aria-hidden="true"
                    className="tabular grid size-7 shrink-0 place-items-center rounded-full bg-white text-xs font-bold text-brand-800"
                  >
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Container>
    </section>
  );
}
