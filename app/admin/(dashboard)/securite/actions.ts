"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";

import { logAdminAction } from "@/lib/audit";
import { MAX_PASSWORD_LENGTH } from "@/lib/auth/guard";
import { checkPasswordStrength, hashPassword, verifyPassword } from "@/lib/auth/password";
import { getCurrentSessionId, requireAdmin } from "@/lib/auth/session";
import { decryptTotpSecret, encryptTotpSecret, generateTotpSecret, normalizeTotpCode, verifyTotpCode } from "@/lib/auth/totp";
import { rateLimit } from "@/lib/rate-limit";
import { getIpHash } from "@/lib/request";
import type { ActionState } from "@/lib/validators";
import { deleteAdminSession, deleteOtherAdminSessions, isSessionId } from "@/models/deleters/sessions";
import { getAdminAuthById } from "@/models/fetchers/admin/security";
import { disableAdminTotp, enableAdminTotp, saveTotpSetupSecret, updateAdminPassword } from "@/models/puters/admins";

/* ==========================================================================
   Server Actions of the Sécurité page. Each one starts with requireAdmin()
   and only ever touches the account of the logged-in admin.
   Password fields are never sent back to the browser.
   ========================================================================== */

const SECURITY_PATH = "/admin/securite";

/** Checks that need the current password: at most 10 tries per 15 minutes per admin. */
function passwordCheckLimit(adminId: number) {
  return rateLimit(`admin-password:${adminId}`, { limit: 10, windowMs: 15 * 60 * 1000 });
}

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

const TOO_MANY = "Trop d'essais. Patientez 15 minutes puis réessayez.";

/**
 * Answer the form AND refresh the page data (sessions list, 2FA state...).
 * refresh() also avoids a Next.js 16.4 development-mode bug with forms sent before the
 * page's JavaScript has loaded (see app/admin/login/actions.ts).
 */
function answer(state: ActionState): ActionState {
  refresh();
  return state;
}

/* --------------------------------------------------------------------------
   Password
   -------------------------------------------------------------------------- */

export async function changePasswordAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const ipHash = await getIpHash();

  if (!(await passwordCheckLimit(admin.id)).ok) return answer({ status: "error", message: TOO_MANY });

  const currentPassword = text(formData, "currentPassword");
  const newPassword = text(formData, "newPassword");
  const confirmPassword = text(formData, "confirmPassword");

  const fieldErrors: Record<string, string[]> = {};
  if (!currentPassword) fieldErrors.currentPassword = ["Saisissez votre mot de passe actuel."];
  const weakness =
    newPassword.length > MAX_PASSWORD_LENGTH ? `Maximum ${MAX_PASSWORD_LENGTH} caractères.` : checkPasswordStrength(newPassword);
  if (weakness) fieldErrors.newPassword = [weakness];
  else if (newPassword === currentPassword) fieldErrors.newPassword = ["Choisissez un mot de passe différent de l'actuel."];
  if (confirmPassword !== newPassword) fieldErrors.confirmPassword = ["Les deux mots de passe ne sont pas identiques."];
  if (Object.keys(fieldErrors).length > 0) return answer({ status: "error", message: "invalid", fieldErrors });

  const account = await getAdminAuthById(admin.id);
  if (!account || !(await verifyPassword(account.passwordHash, currentPassword))) {
    return answer({ status: "error", message: "invalid", fieldErrors: { currentPassword: ["Mot de passe actuel incorrect."] } });
  }

  await updateAdminPassword(admin.id, await hashPassword(newPassword), new Date());
  // Anyone who knew the old password and opened a session elsewhere is now logged out.
  const closed = await deleteOtherAdminSessions(admin.id, await getCurrentSessionId());
  await logAdminAction(admin, "password_change", "admin", admin.id, closed ? `${closed} autre(s) session(s) fermée(s)` : null, ipHash);

  return answer({
    status: "success",
    message:
      closed > 0
        ? `Mot de passe modifié. ${closed} autre(s) appareil(s) ont été déconnectés.`
        : "Mot de passe modifié.",
  });
}

/* --------------------------------------------------------------------------
   Two-factor authentication (2FA)
   -------------------------------------------------------------------------- */

/** Step 1: create a new secret (stored encrypted, not active yet) → the page shows the QR code. */
export async function startTotpSetupAction(): Promise<void> {
  const admin = await requireAdmin();
  const account = await getAdminAuthById(admin.id);
  if (account && !account.totpEnabled) {
    await saveTotpSetupSecret(admin.id, encryptTotpSecret(generateTotpSecret()));
  }
  refresh();
}

/** Step 2: the admin types a first code from the app → 2FA becomes mandatory at login. */
export async function confirmTotpSetupAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const ipHash = await getIpHash();

  if (!(await rateLimit(`admin-totp-setup:${admin.id}`, { limit: 10, windowMs: 15 * 60 * 1000 })).ok) {
    return answer({ status: "error", message: TOO_MANY });
  }

  const code = normalizeTotpCode(formData.get("code"));
  if (!code) return answer({ status: "error", message: "invalid", fieldErrors: { code: ["Saisissez les 6 chiffres affichés par l'application."] } });

  const account = await getAdminAuthById(admin.id);
  if (!account || account.totpEnabled) redirect(SECURITY_PATH);
  const secret = account.totpSecret ? decryptTotpSecret(account.totpSecret) : null;
  if (!secret) {
    return answer({ status: "error", message: "La configuration a expiré : cliquez sur « Nouveau QR code »." });
  }
  if (verifyTotpCode(secret, code) === null) {
    return answer({
      status: "error",
      message: "invalid",
      fieldErrors: { code: ["Code incorrect. Vérifiez que l'heure de votre téléphone est à jour, puis réessayez."] },
    });
  }

  await enableAdminTotp(admin.id);
  await logAdminAction(admin, "totp_enable", "admin", admin.id, null, ipHash);
  redirect(`${SECURITY_PATH}?ok=2fa-on`);
}

/** Abandon an unfinished setup (forget the secret that was never confirmed). */
export async function cancelTotpSetupAction(): Promise<void> {
  const admin = await requireAdmin();
  const account = await getAdminAuthById(admin.id);
  if (account && !account.totpEnabled) await disableAdminTotp(admin.id);
  refresh();
}

/** Turn 2FA off: needs the current password (a stolen open session is not enough). */
export async function disableTotpAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const ipHash = await getIpHash();

  if (!(await passwordCheckLimit(admin.id)).ok) return answer({ status: "error", message: TOO_MANY });

  const password = text(formData, "password");
  if (!password) return answer({ status: "error", message: "invalid", fieldErrors: { password: ["Saisissez votre mot de passe."] } });

  const account = await getAdminAuthById(admin.id);
  if (!account || !(await verifyPassword(account.passwordHash, password))) {
    return answer({ status: "error", message: "invalid", fieldErrors: { password: ["Mot de passe incorrect."] } });
  }

  await disableAdminTotp(admin.id);
  await logAdminAction(admin, "totp_disable", "admin", admin.id, null, ipHash);
  redirect(`${SECURITY_PATH}?ok=2fa-off`);
}

/* --------------------------------------------------------------------------
   Sessions (devices)
   -------------------------------------------------------------------------- */

/**
 * Close one session of the logged-in admin. Used with ConfirmDeleteButton:
 * `revokeSessionAction.bind(null, session.id)` (the form values are not needed).
 */
export async function revokeSessionAction(sessionId: string): Promise<ActionState> {
  const admin = await requireAdmin();
  if (!isSessionId(sessionId)) return answer({ status: "error", message: "Session inconnue." });
  if (sessionId === (await getCurrentSessionId())) {
    return answer({ status: "error", message: "C'est l'appareil que vous utilisez : utilisez plutôt le bouton de déconnexion." });
  }

  const closed = await deleteAdminSession(admin.id, sessionId);
  if (!closed) return answer({ status: "error", message: "Cette session était déjà fermée." });
  await logAdminAction(admin, "session_revoke", "session", sessionId.slice(0, 12), null, await getIpHash());
  return answer({ status: "success", message: "Session fermée." });
}

/** Close every session of the logged-in admin except this browser (ConfirmDeleteButton). */
export async function revokeOtherSessionsAction(): Promise<ActionState> {
  const admin = await requireAdmin();
  const closed = await deleteOtherAdminSessions(admin.id, await getCurrentSessionId());
  if (closed > 0) {
    await logAdminAction(admin, "sessions_revoke_others", "session", null, `${closed} session(s) fermée(s)`, await getIpHash());
  }
  return answer({ status: "success", message: closed > 0 ? `${closed} session(s) fermée(s).` : "Aucune autre session ouverte." });
}
