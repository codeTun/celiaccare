"use client";

import { ArrowLeft, LogIn, Smartphone } from "lucide-react";
import { useActionState } from "react";

import { PasswordField } from "@/components/admin/password-field";
import { Alert } from "@/components/ui/alert";
import { Field, HoneypotField, Input, TextField } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { siteConfig } from "@/lib/site-config";

import { cancelLoginAction, loginAction, verifyCodeAction, type LoginFormState } from "./actions";

const idle: LoginFormState = { status: "idle" };

/**
 * The login card content. The server decides the step from the session cookie:
 *   "password" → e-mail + password,
 *   "code"     → 6-digit code of the authenticator app (2FA).
 */
export function LoginForm({
  step,
  next,
  notice,
}: {
  step: "password" | "code";
  /** Safe admin page to open after the login ("" = dashboard). */
  next: string;
  /** Information message from the URL (?info=...), e.g. after a logout. */
  notice: string | null;
}) {
  return step === "code" ? <CodeStep next={next} /> : <PasswordStep next={next} notice={notice} />;
}

function PasswordStep({ next, notice }: { next: string; notice: string | null }) {
  const [state, formAction] = useActionState(loginAction, idle);
  const hasError = state.status === "error";

  return (
    <form action={formAction} className="space-y-5">
      {hasError ? (
        <Alert tone="error" title={state.message}>
          {state.hint}
        </Alert>
      ) : null}
      {!hasError && notice ? <Alert tone="info">{notice}</Alert> : null}

      <input type="hidden" name="next" value={next} />
      <HoneypotField name="website" />

      <TextField
        name="email"
        type="email"
        label="Adresse e-mail"
        autoComplete="username"
        inputMode="email"
        autoCapitalize="none"
        spellCheck={false}
        maxLength={254}
        required
        defaultValue={state.email}
      />
      <PasswordField name="password" label="Mot de passe" autoComplete="current-password" required />

      <SubmitButton size="lg" className="w-full" pendingLabel="Connexion…">
        <LogIn aria-hidden="true" />
        Se connecter
      </SubmitButton>
    </form>
  );
}

function CodeStep({ next }: { next: string }) {
  const [state, formAction] = useActionState(verifyCodeAction, idle);
  const error = state.status === "error" ? state.message : null;

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700 ring-1 ring-brand-100">
          <Smartphone className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-base font-bold text-ink">Vérification en deux étapes</h2>
          <p className="mt-0.5 text-sm leading-relaxed text-ink-muted">
            Ouvrez votre application d&apos;authentification (Google Authenticator, Microsoft Authenticator…) et
            saisissez le code à 6 chiffres de {siteConfig.name}.
          </p>
        </div>
      </div>

      <form action={formAction} className="space-y-5">
        {error ? (
          <Alert tone="error" title={error}>
            {state.hint}
          </Alert>
        ) : null}

        <input type="hidden" name="next" value={next} />
        <Field id="login-code" label="Code de vérification" required>
          <Input
            id="login-code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={7}
            required
            autoFocus
            placeholder="000 000"
            aria-invalid={error ? true : undefined}
            className="h-14 text-center text-2xl font-bold tracking-[0.4em] tabular placeholder:tracking-[0.4em]"
          />
        </Field>

        <SubmitButton size="lg" className="w-full" pendingLabel="Vérification…">
          Vérifier le code
        </SubmitButton>
      </form>

      <form action={cancelLoginAction} className="text-center">
        <input type="hidden" name="next" value={next} />
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-muted underline-offset-4 hover:text-brand-700 hover:underline"
        >
          <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden="true" />
          Utiliser un autre compte
        </button>
      </form>
    </div>
  );
}
