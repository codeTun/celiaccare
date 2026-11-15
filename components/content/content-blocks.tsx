import {
  CircleCheck,
  CircleX,
  Eye,
  House,
  MessageCircle,
  PencilLine,
  Store,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { GuaranteeBadge } from "@/components/ui/guarantee-badge";
import { getDirection, htmlLang, localeNames } from "@/i18n/config";
import { getDictionary } from "@/i18n/server";
import { cn } from "@/lib/utils";
import { GUARANTEE_LEVELS, type Locale } from "@/types";

import { InfoBox } from "./info-box";
import { RichText } from "./rich-text";
import type { CardIcon, ContentBlock, Verdict } from "./types";

/**
 * Draws the blocks of a section written in data/*.ts (see components/content/types.ts).
 * Server Component: the few labels it needs come from the "content" dictionary.
 */
export function ContentBlocks({ blocks, lang }: { blocks: ContentBlock[]; lang: Locale }) {
  return (
    <div className="space-y-6">
      {blocks.map((block, index) => (
        <Block key={index} block={block} lang={lang} />
      ))}
    </div>
  );
}

/* Paragraphs and lists keep a comfortable reading width; boxes and cards use the full column. */
const readable = "max-w-prose";

function Block({ block, lang }: { block: ContentBlock; lang: Locale }) {
  const { common, content } = getDictionary(lang);

  switch (block.type) {
    case "paragraph":
      return (
        <p className={readable}>
          <RichText text={block.text} lang={lang} />
        </p>
      );

    case "subheading":
      return <h3 className={cn(readable, "pt-2 text-lg font-bold text-ink sm:text-xl")}>{block.text}</h3>;

    case "list":
      return <List items={block.items} style={block.style ?? "bullets"} lang={lang} />;

    case "callout":
      return (
        <InfoBox tone={block.tone} title={block.title ?? (block.tone === "takeaway" ? content.shared.takeaway : undefined)}>
          {block.text ? (
            <p>
              <RichText text={block.text} lang={lang} />
            </p>
          ) : null}
          {block.items ? (
            <List items={block.items} style={block.tone === "takeaway" ? "checks" : "bullets"} lang={lang} compact />
          ) : null}
        </InfoBox>
      );

    case "facts":
      return (
        <dl className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
          {block.items.map((item) => (
            <div key={item.label} className="grid gap-1 px-4 py-3.5 sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-6 sm:px-5">
              <dt className="text-sm font-semibold text-ink">{item.label}</dt>
              <dd className="text-[15px] leading-relaxed">
                {item.todo ? (
                  <Badge tone="saffron" className="me-2 align-middle">
                    <PencilLine aria-hidden="true" />
                    {content.shared.todo}
                    <span className="sr-only">:</span>
                  </Badge>
                ) : null}
                <RichText text={item.value} lang={lang} />
              </dd>
            </div>
          ))}
        </dl>
      );

    case "foods":
      return <FoodGroup tone={block.tone} title={block.title} items={block.items} />;

    case "dishes":
      return (
        <ul className="grid gap-3 sm:grid-cols-2">
          {block.items.map((dish) => (
            <li key={dish.name} className="flex flex-col gap-2 rounded-2xl border border-line bg-white p-4 shadow-soft">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-bold text-ink">{dish.name}</p>
                <VerdictBadge verdict={dish.verdict} label={content.guide.verdicts[dish.verdict]} />
              </div>
              <p className="text-sm leading-relaxed">{dish.note}</p>
            </li>
          ))}
        </ul>
      );

    case "labelExample":
      return (
        <figure className="grid gap-6 rounded-[var(--radius-card)] border border-line bg-canvas p-5 sm:p-6 md:grid-cols-2 md:items-start">
          {/* The fake label, drawn like the back of a packet */}
          <div className="rounded-xl border-2 border-ink/80 bg-white p-4 text-sm leading-relaxed text-ink shadow-soft">
            <p className="text-xs font-bold tracking-[0.12em] text-ink-subtle uppercase rtl:tracking-normal">
              {block.product}
            </p>
            <p className="mt-2 border-t border-ink/15 pt-2">
              <RichText text={block.ingredients} lang={lang} />
            </p>
            <p className="mt-3 text-[13px] italic">
              <RichText text={block.traces} lang={lang} />
            </p>
          </div>
          <figcaption>
            <p className="font-bold text-ink">{block.title}</p>
            <ol className="mt-3 space-y-2.5 text-[15px] leading-relaxed">
              {block.notes.map((note, index) => (
                <li key={note} className="flex gap-3">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white tabular">
                    {index + 1}
                  </span>
                  <span>
                    <RichText text={note} lang={lang} />
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-semibold text-red-800 ring-1 ring-red-100">
              <CircleX className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              {block.verdict}
            </p>
          </figcaption>
        </figure>
      );

    case "guarantees":
      return (
        <ul className="divide-y divide-line overflow-hidden rounded-[var(--radius-card)] border border-line bg-white shadow-soft">
          {GUARANTEE_LEVELS.map((level) => (
            <li key={level} className="flex flex-col gap-2.5 p-5 sm:p-6">
              <GuaranteeBadge level={level} label={common.guarantee[level].label} size="md" className="self-start" />
              <p className="text-[15px] leading-relaxed">{common.guarantee[level].description}</p>
              <p className="text-[15px] leading-relaxed font-semibold text-ink">{block.advice[level]}</p>
            </li>
          ))}
        </ul>
      );

    case "cards":
      return (
        <div className="grid gap-4 md:grid-cols-2">
          {block.items.map((card) => {
            const Icon = cardIcons[card.icon];
            return (
              <div key={card.title} className="rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-soft sm:p-6">
                <p className="flex items-center gap-3 font-bold text-ink">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-brand-100">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  {card.title}
                </p>
                <div className="mt-4">
                  <List items={card.items} style="checks" lang={lang} compact />
                </div>
              </div>
            );
          })}
        </div>
      );

    case "phrasebook":
      return (
        <div className="rounded-[var(--radius-card)] border border-brand-200 bg-white p-5 shadow-soft sm:p-6">
          <p className="flex items-center gap-2.5 font-bold text-ink">
            <MessageCircle className="size-5 text-brand-600" aria-hidden="true" />
            {block.title}
          </p>
          {block.note ? <p className="mt-1.5 text-sm">{block.note}</p> : null}
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {block.phrases.map((phrase) => (
              <blockquote
                key={phrase.lang}
                lang={htmlLang[phrase.lang]}
                dir={getDirection(phrase.lang)}
                className="rounded-2xl bg-brand-50/70 p-4 text-start ring-1 ring-brand-100"
              >
                <p className="text-xs font-bold text-brand-700">{localeNames[phrase.lang]}</p>
                <p className="mt-1.5 text-[15px] leading-relaxed font-medium text-ink">{phrase.text}</p>
              </blockquote>
            ))}
          </div>
        </div>
      );
  }
}

/* -------------------------------------------------------------------------- */

const cardIcons: Record<CardIcon, LucideIcon> = { home: House, restaurant: UtensilsCrossed, shop: Store };

function List({
  items,
  style,
  lang,
  compact = false,
}: {
  items: string[];
  style: "bullets" | "steps" | "checks" | "questions";
  lang: Locale;
  /** Smaller spacing, for lists inside boxes and cards */
  compact?: boolean;
}) {
  if (style === "questions") {
    return (
      <ul className="grid gap-2.5">
        {items.map((item) => (
          <li key={item} className="flex gap-3 rounded-2xl border border-line bg-white px-4 py-3 shadow-soft">
            <MessageCircle className="mt-1 size-4 shrink-0 text-brand-600" aria-hidden="true" />
            <span className="font-medium text-ink">
              <RichText text={item} lang={lang} />
            </span>
          </li>
        ))}
      </ul>
    );
  }

  const Tag = style === "steps" ? "ol" : "ul";
  return (
    <Tag className={cn(!compact && readable, compact ? "space-y-2" : "space-y-3")}>
      {items.map((item, index) => (
        <li key={item} className="flex gap-3">
          {style === "steps" ? (
            <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white tabular">
              {index + 1}
            </span>
          ) : style === "checks" ? (
            <CircleCheck className="mt-[0.2em] size-[18px] shrink-0 text-brand-600" aria-hidden="true" />
          ) : (
            <span className="mt-[0.65em] size-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden="true" />
          )}
          <span className="min-w-0">
            <RichText text={item} lang={lang} />
          </span>
        </li>
      ))}
    </Tag>
  );
}

const verdictStyles: Record<Verdict, { chip: string; badge: "red" | "brand" | "saffron"; icon: LucideIcon; title: string }> = {
  avoid: { chip: "bg-red-50 text-red-900 ring-red-100", badge: "red", icon: CircleX, title: "bg-red-50 text-red-600" },
  ok: { chip: "bg-brand-50 text-brand-900 ring-brand-100", badge: "brand", icon: CircleCheck, title: "bg-brand-50 text-brand-600" },
  check: { chip: "bg-saffron-50 text-saffron-700 ring-saffron-100", badge: "saffron", icon: Eye, title: "bg-saffron-50 text-saffron-700" },
};

function VerdictBadge({ verdict, label }: { verdict: Verdict; label: string }) {
  const { badge, icon: Icon } = verdictStyles[verdict];
  return (
    <Badge tone={badge}>
      <Icon aria-hidden="true" />
      {label}
    </Badge>
  );
}

function FoodGroup({ tone, title, items }: { tone: Verdict; title: string; items: { name: string; note?: string }[] }) {
  const style = verdictStyles[tone];
  const Icon = style.icon;
  const withNotes = items.some((item) => item.note);

  return (
    <div className="rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-soft sm:p-6">
      <p className="flex items-center gap-2.5 font-bold text-ink">
        <span className={cn("grid size-8 shrink-0 place-items-center rounded-full", style.title)}>
          <Icon className="size-[18px]" aria-hidden="true" />
        </span>
        {title}
      </p>
      {withNotes ? (
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {items.map((item) => (
            <li key={item.name} className={cn("rounded-xl px-3.5 py-2.5 ring-1", style.chip)}>
              <span className="block font-semibold">{item.name}</span>
              {item.note ? <span className="mt-0.5 block text-sm opacity-80">{item.note}</span> : null}
            </li>
          ))}
        </ul>
      ) : (
        <ul className="mt-4 flex flex-wrap gap-2">
          {items.map((item) => (
            <li key={item.name} className={cn("rounded-full px-3.5 py-1.5 text-sm font-semibold ring-1", style.chip)}>
              {item.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
