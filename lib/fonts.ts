import { Plus_Jakarta_Sans, Readex_Pro } from "next/font/google";

/**
 * Fonts are downloaded at build time and served from our own domain (no Google request
 * from the visitor). Latin text: Plus Jakarta Sans. Arabic text: Readex Pro.
 * The Arabic font is not preloaded, so French pages never download it.
 */
export const latinFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-latin",
  display: "swap",
});

export const arabicFont = Readex_Pro({
  subsets: ["arabic"],
  variable: "--font-arabic",
  display: "swap",
  preload: false,
});

/** Class names to put on <html> so the CSS variables exist everywhere. */
export const fontVariables = `${latinFont.variable} ${arabicFont.variable}`;
