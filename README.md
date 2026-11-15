# CeliacCare — le marché sans gluten de Tunisie

CeliacCare is a bilingual (French / Arabic) web platform that helps people with celiac disease or gluten
sensitivity in Tunisia find **verified gluten-free products made by small local businesses** and **order from
partner restaurants**, with home delivery. It comes with a secure **admin panel** (stats, revenue charts,
orders, deliveries, catalogue, restaurants, messages, moderation).

Project of the Master BioMIS (Design Thinking) — requirements in [`specbook.pdf`](./specbook.pdf).

## Features

**Public website** (`/fr/...` and `/ar/...`, Arabic in right-to-left)
- Home page, "Notre démarche" (about) page, contact page, FAQ, gluten-free guide, legal pages.
- Product catalogue with filters: search, category, ingredients it contains, allergens to exclude, guarantee
  level, price, artisan, sort, pagination. Product sheets with photo, price, description, ingredients,
  allergens, certification, verification date and source.
- Small-business directory ("Artisans") and partner restaurants with menus and online ordering.
- Cart (no account needed), checkout with mandatory delivery details, order summary before confirmation,
  **max 3 orders per day per phone number**, cash/card on delivery, order tracking.
- Reviews (published after moderation) and "Signaler une erreur" on every sheet.
- Three gluten-free guarantee levels and verification dates on every sheet; medical disclaimer everywhere.

**Admin panel** (`/admin`, French) — not linked anywhere on the public site
- Secure login: argon2id passwords, DB sessions with hashed tokens, HttpOnly/SameSite cookies, lock after
  5 failures per account + connection (whole account at 30), sessions closed after 2 h of inactivity,
  optional 2FA (TOTP / Google Authenticator, 10 wrong codes per hour max), audit log, session management.
- Dashboard: revenue and orders charts, KPIs, top products, alerts (sheets to re-verify, refused orders...).
- Orders (status workflow, deliverer assignment), deliveries (zones, deliverers), clients (phone rules,
  refused attempts), catalogue CRUD (categories, ingredients, artisans, products with Cloudinary photos),
  restaurants and menus, contact messages, error reports, reviews moderation.

## Tech stack

Next.js 16.4 (App Router, Cache Components) · React 19 · TypeScript · Tailwind CSS 4 · PostgreSQL + Prisma
ORM 8 · Cloudinary · zod · recharts · lucide-react.

## Architecture (in one picture)

```
Page (Server Component) ──▶ models/fetchers/*  ──▶ data (DTO) ──props──▶ components/*
<form> ──▶ Server Action (app/**/actions.ts) ──▶ zod validation ──▶ models/posters|puters|deleters ──▶ database
```
- **`models/`** is the only place that talks to the database (and Cloudinary): `fetchers` (read), `posters`
  (create), `puters` (update), `deleters` (delete). Pages call them on the server and pass the data to
  components as **props**. There is no data fetching in the browser.
- `app/api/*` exposes a small read-only REST API (products, restaurants, producers, categories, zones, health)
  built on the same fetchers.
- Details for developers (and AI assistants): [`.cl/ARCHITECTURE.md`](./.cl/ARCHITECTURE.md),
  [`.cl/DESIGN-SYSTEM.md`](./.cl/DESIGN-SYSTEM.md), [`.cl/KNOWN-ISSUES-AND-GOTCHAS.md`](./.cl/KNOWN-ISSUES-AND-GOTCHAS.md).

```
app/            pages: [lang]/ (public site), admin/ (admin panel), api/ (REST)
components/     ui/ (design system), cards/, cart/, admin/, sections/, products/, restaurants/...
models/         fetchers/ posters/ puters/ deleters/   (server-only data layer)
lib/            prisma client, auth, validation, formatting, SEO, Cloudinary, rate limiting
i18n/           French & Arabic texts (resources/fr, resources/ar)
prisma/         contract.prisma (database schema), seed.ts + seed-data/ (demo data)
types/          shared data types
public/brand/   logo files
```

## Getting started

Requirements: **Node.js 20.9+**, **pnpm**, **PostgreSQL 15+**.

```bash
pnpm install
cp .env.example .env           # then fill it in (see below)
createdb celiaccare            # or any PostgreSQL database
pnpm db:init                   # create the tables from prisma/contract.prisma
pnpm db:seed                   # demo data + the first admin account (ADMIN_EMAIL / ADMIN_PASSWORD)
pnpm dev                       # http://localhost:3000  (admin: http://localhost:3000/admin)
```

`.env` values:

| Variable | What it is |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | long random secret (`openssl rand -base64 32`), used for IP hashing and 2FA encryption |
| `NEXT_PUBLIC_SITE_URL` | public URL of the site (`https://...` in production enables secure cookies & HSTS) |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Cloudinary account (photos uploaded from the admin) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | first admin account created by `pnpm db:seed` (password ≥ 12 characters) |
| `DATABASE_POOL_MAX` (optional) | database connections per server process (default 5; hosted plans allow few in total) |
| `TRUSTED_IP_HEADER` (optional) | header set by your reverse proxy with the client IP (e.g. `x-real-ip`) |

### Useful commands

| Command | Purpose |
|---|---|
| `pnpm dev` | development server |
| `pnpm build && pnpm start` | production build and server (the database must be reachable during the build) |
| `pnpm typecheck` / `pnpm lint` | TypeScript and ESLint checks |
| `pnpm db:emit` | after editing `prisma/contract.prisma`: regenerate the contract files |
| `pnpm db:push` | apply contract changes to a development database |
| `pnpm db:migrate:plan` + `pnpm db:migrate` | production migrations (reviewed, versioned) |
| `pnpm db:seed` | add the demo data (safe to re-run; never deletes anything) |
| `pnpm admin:create` | create or update an admin account (`--reset-2fa` to reset 2FA) |

## Cloudinary (photos)

1. Create a free account at https://cloudinary.com and copy the *cloud name*, *API key* and *API secret* into `.env`.
2. Restart `pnpm dev`. Photos uploaded from the admin (products, categories, artisans, restaurants, dishes) are
   stored in Cloudinary (`celiaccare/...` folders) and served resized in WebP/AVIF automatically.
3. Until then, the site shows branded placeholders instead of photos.

## Deployment (e.g. Vercel + a hosted PostgreSQL such as Neon, Supabase or Prisma Postgres)

1. Create the production database and run `pnpm db:init` (first time) against it, then `pnpm db:seed` if you
   want the demo data (or only `pnpm admin:create`).
2. Set the environment variables above on the host (`NEXT_PUBLIC_SITE_URL=https://your-domain`).
3. Build with `pnpm build` (the database must be reachable at build time: pages are pre-rendered).

## Before going live

- Replace the placeholders in `lib/site-config.ts` (phone, e-mail, WhatsApp, address, social links) and the
  "À compléter" items of the legal pages (`data/legal.ts`).
- Replace the demo data with real, verified addresses and products (each sheet needs a source and a date).
- Add the Cloudinary keys and real photos; enable 2FA on every admin account (Admin → Sécurité).

The demo data (businesses, people, phone numbers, orders) is fictional.
