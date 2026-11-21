import type { ListedGuaranteeLevel, Locale } from "@/types";

/* ==========================================================================
   Shapes of the long-form content (guide, legal pages) stored in data/*.ts
   and drawn by <ContentBlocks> (components/content/content-blocks.tsx).

   Texts can use two tiny inline markers (see <RichText>):
     **important words**          -> bold
     [link text](/produits)       -> link (internal paths get the language added)
   ========================================================================== */

/** "avoid" = contains gluten, "ok" = gluten-free, "check" = depends on the recipe or the label. */
export type Verdict = "avoid" | "ok" | "check";

/** Colour and icon of a highlighted box. */
export type CalloutTone = "takeaway" | "tip" | "info" | "warning";

/** Icons available for the "cards" block. */
export type CardIcon = "home" | "restaurant" | "shop";

export type ContentBlock =
  /** A normal paragraph. */
  | { type: "paragraph"; text: string }
  /** A small title inside a section (<h3>). */
  | { type: "subheading"; text: string }
  /** A list. "steps" = numbered, "checks" = green ticks, "questions" = speech bubbles. */
  | { type: "list"; style?: "bullets" | "steps" | "checks" | "questions"; items: string[] }
  /** A highlighted box ("À retenir", tip, warning...). Without a title, "takeaway" boxes are titled "À retenir". */
  | { type: "callout"; tone: CalloutTone; title?: string; text?: string; items?: string[] }
  /** Label / value rows (legal information). `todo: true` shows a "To be completed" badge. */
  | { type: "facts"; items: { label: string; value: string; todo?: boolean }[] }
  /** A group of foods shown as chips (or rows when they have a note). */
  | { type: "foods"; tone: Verdict; title: string; items: { name: string; note?: string }[] }
  /** Dishes with a verdict badge and a short explanation. */
  | { type: "dishes"; items: { name: string; verdict: Verdict; note: string }[] }
  /** A fake food label with numbered explanations, to learn how to read one. */
  | {
      type: "labelExample";
      title: string;
      product: string;
      ingredients: string;
      traces: string;
      notes: string[];
      verdict: string;
    }
  /**
   * The guarantee levels a listed business can have (CERTIFIED, DEDICATED: policy "100 % sans gluten only"),
   * names from the dictionary, with one piece of advice each.
   */
  | { type: "guarantees"; advice: Record<ListedGuaranteeLevel, string> }
  /** Side-by-side cards with an icon, a title and a list ("At home" / "At the restaurant"). */
  | { type: "cards"; items: { icon: CardIcon; title: string; items: string[] }[] }
  /** Sentences to show to a waiter, in French and in Arabic. */
  | { type: "phrasebook"; title: string; note?: string; phrases: { lang: Locale; text: string }[] };

/** One section of a long page: an <h2> (also listed in the table of contents) and its blocks. */
export type ContentSection = {
  /** Anchor of the section, the same in both languages, e.g. "contamination-croisee" */
  id: string;
  title: string;
  blocks: ContentBlock[];
};
