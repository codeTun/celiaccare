import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/server";
import { siteConfig } from "@/lib/site-config";

/**
 * Picture shown when a page of the site is shared (WhatsApp, Facebook, X...).
 * A white and green brand card with the logo. Pages that have their own photo
 * (a product, a restaurant) replace it with openGraph.images in their metadata.
 *
 * The text stays in French (Latin letters) for both languages: drawing Arabic in
 * these images needs an extra font file and word-order tricks (see .cl/research).
 */

const { common } = getDictionary("fr");

export const alt = `${siteConfig.name} · ${common.brand.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Pre-render the image for /fr and /ar at build time (route files ignore the layout's list).
export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

// The logo emblem (door + jasmine) from public/brand, embedded as an image.
const emblemFile = await readFile(join(process.cwd(), "public/brand/logo-emblem.svg"));
const emblemSrc = `data:image/svg+xml;base64,${emblemFile.toString("base64")}`;

const colors = {
  ink: "#0f1f17",
  muted: "#4a5d53",
  brand: "#128552",
  brandSoft: "#effaf4",
  stud: "#82d0a8",
  saffron: "#f2b93b",
};

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ffffff",
          backgroundImage: `radial-gradient(circle at 50% 38%, ${colors.brandSoft} 0%, #ffffff 62%)`,
          borderBottom: `14px solid ${colors.brand}`,
          color: colors.ink,
          padding: "0 80px",
        }}
      >
        {/* logo: emblem + wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          {/* ImageResponse draws plain <img> elements (next/image does not work here) */}
          <img src={emblemSrc} width={168} height={168} alt="" />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 100, letterSpacing: -4, lineHeight: 1 }}>{siteConfig.name}</div>
            <div
              style={{
                marginTop: 14,
                fontSize: 26,
                letterSpacing: 12,
                textTransform: "uppercase",
                color: colors.brand,
              }}
            >
              {common.brand.suffix}
            </div>
          </div>
        </div>

        {/* a row of door studs */}
        <div style={{ display: "flex", gap: 16, marginTop: 44 }}>
          {[0, 1, 2, 3, 4, 5, 6].map((stud) => (
            <div
              key={stud}
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                backgroundColor: stud === 3 ? colors.saffron : colors.stud,
              }}
            />
          ))}
        </div>

        <div style={{ marginTop: 40, fontSize: 52, letterSpacing: -1, textAlign: "center" }}>{common.brand.tagline}</div>
        <div
          style={{
            marginTop: 18,
            maxWidth: 940,
            fontSize: 28,
            lineHeight: 1.4,
            textAlign: "center",
            color: colors.muted,
          }}
        >
          {common.brand.description}
        </div>
      </div>
    ),
    { ...size },
  );
}
