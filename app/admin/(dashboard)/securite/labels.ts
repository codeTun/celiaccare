import type { BadgeTone } from "@/components/ui/badge";

/* French texts of the codes stored by the auth (LoginAttempt.reason) and by lib/audit.ts (AuditLog). */

/** LoginAttempt.reason → label + color (see LOGIN_REASONS in lib/auth/login-throttle.ts). */
export const LOGIN_REASON_LABELS: Record<string, { label: string; tone: BadgeTone }> = {
  ok: { label: "Connexion réussie", tone: "brand" },
  "2fa_pending": { label: "Mot de passe correct, code 2FA demandé", tone: "blue" },
  bad_password: { label: "Mot de passe incorrect", tone: "red" },
  bad_totp: { label: "Code 2FA incorrect", tone: "red" },
  unknown_email: { label: "Adresse inconnue", tone: "amber" },
  locked: { label: "Accès suspendu (trop d'essais)", tone: "red" },
  honeypot: { label: "Robot détecté", tone: "neutral" },
  invalid_input: { label: "Saisie invalide", tone: "neutral" },
};

export function loginReasonLabel(reason: string | null, success: boolean) {
  if (reason && Object.hasOwn(LOGIN_REASON_LABELS, reason)) return LOGIN_REASON_LABELS[reason];
  return success ? LOGIN_REASON_LABELS.ok : { label: reason ?? "Échec", tone: "neutral" as const };
}

/** AuditLog.action → label. Unknown actions are shown as they are stored. */
const AUDIT_ACTION_LABELS: Record<string, string> = {
  login: "Connexion",
  logout: "Déconnexion",
  create: "Création",
  update: "Modification",
  delete: "Suppression",
  status: "Changement de statut",
  password_change: "Mot de passe modifié",
  totp_enable: "Double authentification activée",
  totp_disable: "Double authentification désactivée",
  session_revoke: "Session fermée",
  sessions_revoke_others: "Autres sessions fermées",
  anonymize: "Anonymisation (conservation des données)",
};

/** AuditLog.entity → label. */
const AUDIT_ENTITY_LABELS: Record<string, string> = {
  session: "Session",
  admin: "Compte admin",
  product: "Produit",
  category: "Catégorie",
  ingredient: "Ingrédient",
  producer: "Artisan",
  restaurant: "Restaurant",
  dish: "Plat",
  order: "Commande",
  deliverer: "Livreur",
  zone: "Zone de livraison",
  message: "Message",
  report: "Signalement",
  review: "Avis",
  phoneRule: "Règle téléphone",
};

export function auditActionLabel(action: string) {
  return Object.hasOwn(AUDIT_ACTION_LABELS, action) ? AUDIT_ACTION_LABELS[action] : action;
}

export function auditEntityLabel(entity: string) {
  return Object.hasOwn(AUDIT_ENTITY_LABELS, entity) ? AUDIT_ENTITY_LABELS[entity] : entity;
}
