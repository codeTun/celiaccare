import type { ReactNode } from "react";

import { Breadcrumbs, type BreadcrumbItem } from "@/components/breadcrumbs";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";
import type { Locale } from "@/types";

export type PageHeroProps = {
  /** Language of the page (used by the breadcrumb trail) */
  lang: Locale;
  /**
   * Breadcrumb trail AFTER the home page; the last item is the current page.
   * Paths are written WITHOUT the language: [{ label: common.nav.faq, href: "/faq" }].
   * Leave it out on the home page.
   */
  breadcrumbs?: BreadcrumbItem[];
  /** Small green label above the title, e.g. "Catalogue" */
  eyebrow?: ReactNode;
  /** Page title. Rendered as the page's ONE <h1>: do not add another <h1> on the page. */
  title: ReactNode;
  /** One or two sentences under the title */
  description?: ReactNode;
  /** Buttons under the description, e.g. <Link className={buttonStyles()} href=...>...</Link> */
  actions?: ReactNode;
  /** Extra content under the text: a <SearchForm>, filter chips, key figures... */
  children?: ReactNode;
  /**
   * Picture shown beside the text on large screens (e.g. a photo in an `arch` frame).
   * When it is set, the decorative doorway is not drawn.
   */
  aside?: ReactNode;
  /** Text alignment (default "start"). Use "center" for short pages (contact, legal). */
  align?: "start" | "center";
  className?: string;
};

/**
 * Header band at the top of every inner page: breadcrumbs, eyebrow, <h1>,
 * description and optional actions, on a soft background with the Tunisian
 * zellige pattern and a Sidi Bou Saïd doorway drawing.
 *
 * @example
 * <PageHero
 *   lang={lang}
 *   breadcrumbs={[{ label: common.nav.faq, href: "/faq" }]}
 *   eyebrow={common.nav.helpTitle}
 *   title={content.faq.title}
 *   description={content.faq.intro}
 * />
 */
export function PageHero({
  lang,
  breadcrumbs,
  eyebrow,
  title,
  description,
  actions,
  children,
  aside,
  align = "start",
  className,
}: PageHeroProps) {
  const centered = align === "center";

  return (
    <section className={cn("relative isolate overflow-hidden border-b border-line bg-canvas", className)}>
      {/* zellige pattern, fading towards the bottom */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-khatam opacity-70 [mask-image:linear-gradient(to_bottom,#000,transparent_90%)]"
      />
      {/* soft green light in the corner */}
      <div
        aria-hidden="true"
        className="absolute -top-40 -end-24 -z-10 size-[30rem] rounded-full bg-brand-100/50 blur-3xl"
      />
      {aside || centered ? null : (
        <DoorwayDrawing className="absolute end-[4%] bottom-0 -z-10 hidden h-[86%] max-h-72 w-auto lg:block xl:end-[8%]" />
      )}

      <Container className="py-10 sm:py-14 lg:py-16">
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <Breadcrumbs lang={lang} items={breadcrumbs} className={cn("mb-7 sm:mb-9", centered && "flex justify-center")} />
        ) : null}

        <div className={cn("grid items-center gap-10", aside && "lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-16")}>
          <div className={cn("max-w-2xl", centered && "mx-auto text-center")}>
            {eyebrow ? (
              <p
                className={cn(
                  "mb-3 flex items-center gap-2.5 text-xs font-bold tracking-[0.14em] text-brand-700 uppercase rtl:tracking-normal",
                  centered && "justify-center",
                )}
              >
                {/* three door studs */}
                <span aria-hidden="true" className="studs h-1.5 w-8 shrink-0" />
                {eyebrow}
              </p>
            ) : null}
            <h1 className="text-4xl leading-[1.1] font-extrabold text-ink sm:text-5xl rtl:leading-tight">{title}</h1>
            {description ? (
              <div className="mt-4 text-base leading-relaxed text-ink-muted sm:text-lg">{description}</div>
            ) : null}
            {actions ? (
              <div className={cn("mt-7 flex flex-wrap gap-3", centered && "justify-center")}>{actions}</div>
            ) : null}
            {children ? <div className="mt-8">{children}</div> : null}
          </div>
          {aside ? <div className="hidden lg:block">{aside}</div> : null}
        </div>
      </Container>

      {/* a row of door studs along the bottom edge */}
      <div aria-hidden="true" className="studs absolute inset-x-0 bottom-0 h-1.5 opacity-60" />
    </section>
  );
}

/* Door studs: along the inner arch (a half circle) and down both sides of the door. */
const ARCH_CENTER = { x: 110, y: 124 };
const STUDS: [number, number][] = [
  ...Array.from({ length: 9 }, (_, i): [number, number] => {
    const angle = Math.PI - (i * Math.PI) / 8; // from the left side (180°) to the right side (0°)
    return [round(ARCH_CENTER.x + 56 * Math.cos(angle)), round(ARCH_CENTER.y - 56 * Math.sin(angle))];
  }),
  ...Array.from({ length: 9 }, (_, i): [number, number] => [54, 144 + i * 19]),
  ...Array.from({ length: 9 }, (_, i): [number, number] => [166, 144 + i * 19]),
];

function round(value: number) {
  return Math.round(value * 10) / 10;
}

/** Decorative Sidi Bou Saïd doorway (arch, studs and a jasmine flower), drawn in soft greens. */
function DoorwayDrawing({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 310" className={className} aria-hidden="true" focusable="false">
      {/* outer frame */}
      <path d="M12 310V124a98 98 0 0 1 196 0v186" className="fill-white/80 stroke-brand-200" strokeWidth="1.5" />
      {/* the door */}
      <path d="M36 310V126a74 74 0 0 1 148 0v184" className="fill-brand-50 stroke-brand-200" strokeWidth="1.5" />
      <path d="M110 310V200" className="stroke-brand-200" strokeWidth="1.5" />
      <g className="fill-brand-300">
        {STUDS.map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2.6" />
        ))}
      </g>
      {/* jasmine flower in the arch */}
      <g transform="translate(110 132)">
        <g className="fill-white stroke-brand-200" strokeWidth="0.8">
          {[0, 1, 2, 3, 4].map((petal) => (
            <path key={petal} d="M0 0C-5.4-2.4-6.6-10.6-.9-14 3.4-11.6 4.6-4.2 0 0Z" transform={`rotate(${petal * 72 - 8}) scale(1.35)`} />
          ))}
        </g>
        <circle r="3.4" className="fill-saffron-400" />
      </g>
    </svg>
  );
}
