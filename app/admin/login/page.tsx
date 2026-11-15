import { LockKeyhole, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { LogoEmblem } from "@/components/logo";
import { Skeleton } from "@/components/ui/skeleton";
import { afterLoginPath, safeAdminPath } from "@/lib/auth/guard";
import { getLoginStage } from "@/lib/auth/session";
import { siteConfig } from "@/lib/site-config";

import { LoginForm } from "./login-form";

// The title template of app/admin/layout.tsx gives "Connexion · Admin CeliacCare" (and noindex).
export const metadata: Metadata = { title: "Connexion" };

/** Messages shown above the form, chosen by ?info=... (set by the login / logout actions). */
const NOTICES: Record<string, string> = {
  deconnexion: "Vous êtes déconnecté. À bientôt !",
  expire: "Le délai pour saisir le code est dépassé. Reconnectez-vous.",
  code: "Trop de codes incorrects : pour votre sécurité, reconnectez-vous.",
  "code-suspendu":
    "Trop de codes incorrects pour ce compte : par sécurité, les codes sont refusés pendant une heure. Réessayez plus tard.",
};

export default function AdminLoginPage({ searchParams }: PageProps<"/admin/login">) {
  return (
    <main id="main" className="relative isolate flex min-h-dvh items-center justify-center overflow-hidden px-4 py-12">
      {/* Soft Tunisian zellige background + a green glow behind the card */}
      <div className="absolute inset-0 -z-10 bg-khatam" aria-hidden="true" />
      <div
        className="absolute start-1/2 top-1/3 -z-10 size-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-100/70 blur-3xl rtl:translate-x-1/2"
        aria-hidden="true"
      />

      <div className="w-full max-w-md">
        <div className="mb-7 flex flex-col items-center text-center">
          <LogoEmblem className="size-16 drop-shadow-sm" />
          <p className="mt-4 text-xs font-bold tracking-[0.14em] text-brand-700 uppercase">{siteConfig.name}</p>
          <h1 className="mt-1 text-2xl font-extrabold text-ink sm:text-3xl">Espace administration</h1>
          <p className="mt-1.5 text-sm text-ink-muted">Accès réservé à l&apos;équipe {siteConfig.name}.</p>
        </div>

        <div className="rounded-[var(--radius-card)] border border-line bg-white/95 p-6 shadow-lift backdrop-blur sm:p-8">
          {/* Reading the cookie and ?next= happens at request time: inside <Suspense>. */}
          <Suspense fallback={<LoginFormSkeleton />}>
            <LoginGate searchParams={searchParams} />
          </Suspense>
        </div>

        <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-ink-subtle">
          <ShieldCheck className="size-4 text-brand-600" aria-hidden="true" />
          Connexion protégée · session fermée après 2 heures d&apos;inactivité (8 heures au plus)
        </p>
      </div>
    </main>
  );
}

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

/** Chooses the step to show from the session cookie (or sends a logged-in admin to the panel). */
async function LoginGate({ searchParams }: Pick<PageProps<"/admin/login">, "searchParams">) {
  const params = await searchParams;
  const next = safeAdminPath(firstValue(params.next));
  const state = await getLoginStage();

  // Already logged in (valid session): no need to see this page.
  // Checked here and not in proxy.ts: proxy only sees that a cookie exists, maybe an expired one.
  if (state.stage === "authenticated") redirect(afterLoginPath(next));

  const info = firstValue(params.info);
  const notice = info && Object.hasOwn(NOTICES, info) ? NOTICES[info] : null;

  return <LoginForm step={state.stage === "pending2fa" ? "code" : "password"} next={next ?? ""} notice={notice} />;
}

function LoginFormSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true">
      <span className="sr-only">Chargement du formulaire…</span>
      <div className="space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-11 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-11 w-full" />
      </div>
      <div className="flex h-12 items-center justify-center gap-2 rounded-full bg-brand-600/80 text-sm font-semibold text-white">
        <LockKeyhole className="size-4" aria-hidden="true" />
        Se connecter
      </div>
    </div>
  );
}
