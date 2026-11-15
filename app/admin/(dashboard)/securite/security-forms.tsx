"use client";

import { KeyRound, ShieldCheck, ShieldOff } from "lucide-react";
import { useActionState } from "react";

import { FormMessage } from "@/components/admin/admin-form";
import { PasswordField } from "@/components/admin/password-field";
import { Field, fieldA11y, Input } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { idleState } from "@/lib/validators";

import { changePasswordAction, confirmTotpSetupAction, disableTotpAction } from "./actions";

/** Change the password (current + new + confirmation). */
export function ChangePasswordForm({ email }: { email: string }) {
  const [state, formAction] = useActionState(changePasswordAction, idleState);

  return (
    <form action={formAction} className="space-y-4">
      <FormMessage state={state} />
      {/* Not sent to the server: helps password managers save the new password for the right account. */}
      <input type="email" autoComplete="username" value={email} readOnly hidden />
      <PasswordField
        name="currentPassword"
        label="Mot de passe actuel"
        autoComplete="current-password"
        required
        error={state.fieldErrors?.currentPassword}
      />
      <PasswordField
        name="newPassword"
        label="Nouveau mot de passe"
        autoComplete="new-password"
        required
        minLength={12}
        hint="12 caractères minimum, avec des lettres et des chiffres. Une phrase facile à retenir est idéale."
        error={state.fieldErrors?.newPassword}
      />
      <PasswordField
        name="confirmPassword"
        label="Confirmer le nouveau mot de passe"
        autoComplete="new-password"
        required
        error={state.fieldErrors?.confirmPassword}
      />
      <SubmitButton pendingLabel="Enregistrement…">
        <KeyRound aria-hidden="true" />
        Changer le mot de passe
      </SubmitButton>
    </form>
  );
}

/** 2FA setup, step 2: type the first code shown by the app. */
export function ConfirmTotpForm() {
  const [state, formAction] = useActionState(confirmTotpSetupAction, idleState);
  const error = state.fieldErrors?.code?.[0];

  return (
    <form action={formAction} className="space-y-4">
      {state.status === "error" && !error ? <FormMessage state={state} /> : null}
      <Field id="totp-setup-code" label="Code affiché par l'application" error={error} required>
        <Input
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={7}
          required
          placeholder="000 000"
          className="max-w-48 text-center text-lg font-bold tracking-[0.3em] tabular"
          {...fieldA11y("totp-setup-code", error)}
        />
      </Field>
      <SubmitButton pendingLabel="Vérification…">
        <ShieldCheck aria-hidden="true" />
        Activer la double authentification
      </SubmitButton>
    </form>
  );
}

/** Turn 2FA off (asks for the password). */
export function DisableTotpForm() {
  const [state, formAction] = useActionState(disableTotpAction, idleState);

  return (
    <form action={formAction} className="space-y-4">
      {state.status === "error" && !state.fieldErrors ? <FormMessage state={state} /> : null}
      <PasswordField
        id="totp-disable-password"
        name="password"
        label="Votre mot de passe, pour confirmer"
        autoComplete="current-password"
        required
        error={state.fieldErrors?.password}
      />
      <SubmitButton variant="outline" pendingLabel="Désactivation…">
        <ShieldOff aria-hidden="true" />
        Désactiver la double authentification
      </SubmitButton>
    </form>
  );
}
