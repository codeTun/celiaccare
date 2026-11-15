"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { logAdminAction } from "@/lib/audit";
import { afterLoginPath, loginPageUrl, MAX_PASSWORD_LENGTH } from "@/lib/auth/guard";
import { emailForLog, LOGIN_REASONS, recordLoginAttempt } from "@/lib/auth/login-throttle";
import { endCurrentSession, getCurrentAdmin, getPendingLogin, startAdminSession } from "@/lib/auth/session";
import { normalizeTotpCode } from "@/lib/auth/totp";
import { LIMITS, rateLimit } from "@/lib/rate-limit";
import { getIpHash } from "@/lib/request";
import { formDataToObject } from "@/lib/validators";

import { checkCode, checkPassword } from "./authenticate";

/* ==========================================================================
   Server Actions of the admin login (and logout).
   Anyone can call a Server Action (it is a public POST endpoint), so every
   input is checked here, and the answers never say WHICH part was wrong.
   ========================================================================== */

/** What the login forms show after a submission. Never contains the password. */
export type LoginFormState = {
  status: "idle" | "error";
  message?: string;
  hint?: string;
  /** The e-mail typed, to fill the field again after an error. */
  email?: string;
};

const INVALID_CREDENTIALS = "Identifiants invalides.";
const INVALID_CREDENTIALS_HINT =
  "Vérifiez votre adresse e-mail et votre mot de passe. Après 5 essais incorrects, l'accès est suspendu pendant 15 minutes.";
const TOO_MANY_TRIES = "Trop de tentatives depuis votre connexion.";
const TOO_MANY_TRIES_HINT = "Patientez 15 minutes avant de réessayer.";

const passwordStepSchema = z.object({
  email: z.string().trim().toLowerCase().max(254).pipe(z.email()),
  password: z.string().min(1).max(MAX_PASSWORD_LENGTH),
});

/**
 * Send an error back to the form.
 * refresh() asks Next.js to re-render the page normally after the action. Without it, a form
 * sent before the page's JavaScript has loaded (plain HTML submission) hits a Next.js 16.4
 * development-mode bug when the page reads the session cookie again.
 */
function formError(state: LoginFormState): LoginFormState {
  refresh();
  return state;
}

/** Every login submission (password or code) counts against the per-IP limit. */
async function isIpAllowed(ipHash: string) {
  const { ok } = await rateLimit(`login:${ipHash}`, LIMITS.login);
  return ok;
}

/** Step 1: e-mail + password. Logs in, or opens the 2FA step, or answers "Identifiants invalides". */
export async function loginAction(_prev: LoginFormState, formData: FormData): Promise<LoginFormState> {
  const ipHash = await getIpHash();
  const raw = formDataToObject(formData);
  const typedEmail = typeof raw.email === "string" ? raw.email.trim().slice(0, 254) : "";
  const refused: LoginFormState = {
    status: "error",
    message: INVALID_CREDENTIALS,
    hint: INVALID_CREDENTIALS_HINT,
    email: typedEmail,
  };

  if (!(await isIpAllowed(ipHash))) {
    return formError({ status: "error", message: TOO_MANY_TRIES, hint: TOO_MANY_TRIES_HINT, email: typedEmail });
  }

  // Hidden field that people never see: when it is filled, a robot sent the form.
  if (raw.website) {
    await recordLoginAttempt({ email: emailForLog(typedEmail), ipHash, success: false, reason: LOGIN_REASONS.honeypot });
    return formError(refused);
  }

  const parsed = passwordStepSchema.safeParse(raw);
  if (!parsed.success) {
    await recordLoginAttempt({ email: emailForLog(typedEmail), ipHash, success: false, reason: LOGIN_REASONS.invalidInput });
    return formError(refused);
  }

  const now = new Date();
  const result = await checkPassword({ email: parsed.data.email, password: parsed.data.password, ipHash, now });
  if (result.status === "refused") return formError(refused);

  if (result.status === "code_required") {
    // Half-logged-in session (5 minutes), only good for typing the code.
    await startAdminSession(result.admin.id, { pending2fa: true });
    redirect(loginPageUrl(raw.next));
  }

  await startAdminSession(result.admin.id, { pending2fa: false });
  await logAdminAction(result.admin, "login", "session", null, null, ipHash);
  redirect(afterLoginPath(raw.next));
}

/** Step 2: the 6-digit code of the authenticator app. */
export async function verifyCodeAction(_prev: LoginFormState, formData: FormData): Promise<LoginFormState> {
  const ipHash = await getIpHash();
  const raw = formDataToObject(formData);

  if (!(await isIpAllowed(ipHash))) {
    return formError({ status: "error", message: TOO_MANY_TRIES, hint: TOO_MANY_TRIES_HINT });
  }

  const pending = await getPendingLogin();
  if (!pending) {
    // The 5 minutes are over (or the cookie is gone): start again from the password.
    await endCurrentSession();
    redirect(loginPageUrl(raw.next, "expire"));
  }

  const code = normalizeTotpCode(raw.code);
  if (!code) {
    return formError({ status: "error", message: "Saisissez les 6 chiffres affichés par votre application." });
  }

  const now = new Date();
  const result = await checkCode({ pending, code, ipHash, now });

  if (result.status === "wrong_code") {
    return formError({
      status: "error",
      message: "Code incorrect.",
      hint:
        result.attemptsLeft > 1
          ? `Encore ${result.attemptsLeft} essais. Vérifiez que l'heure de votre téléphone est exacte.`
          : "Dernier essai avant de devoir vous reconnecter.",
    });
  }

  if (result.status === "restart") {
    await endCurrentSession();
    redirect(loginPageUrl(raw.next, result.suspended ? "code-suspendu" : "code"));
  }

  // Replace the half-logged-in session by a real one (new token).
  await startAdminSession(result.admin.id, { pending2fa: false });
  await logAdminAction(result.admin, "login", "session", null, "avec double authentification", ipHash);
  redirect(afterLoginPath(raw.next));
}

/** "Utiliser un autre compte" during the 2FA step: forget the half-logged-in session. */
export async function cancelLoginAction(formData: FormData): Promise<void> {
  await endCurrentSession();
  redirect(loginPageUrl(formData.get("next")));
}

/** Logout button of the admin top bar. */
export async function logoutAction(): Promise<void> {
  const admin = await getCurrentAdmin();
  await endCurrentSession();
  if (admin) await logAdminAction(admin, "logout", "session", null, null, await getIpHash());
  redirect(loginPageUrl(null, "deconnexion"));
}
