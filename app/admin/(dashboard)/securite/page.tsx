import { LogOut, MonitorSmartphone, RotateCcw, ShieldCheck, Smartphone, X } from "lucide-react";
import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { DataTable, EmptyTableRow, Tbody, Td, Th, Thead, Tr } from "@/components/admin/data-table";
import { FlashMessage } from "@/components/admin/flash-message";
import { FormSection } from "@/components/admin/form-section";
import { Badge } from "@/components/ui/badge";
import { SubmitButton } from "@/components/ui/submit-button";
import { requireAdmin } from "@/lib/auth/session";
import { formatDateTime, formatRelative } from "@/lib/format";
import {
  getMyActiveSessions,
  getMySecurityOverview,
  getMyTotpEnrollment,
  getRecentAuditLogs,
  getRecentLoginAttempts,
  type AdminSessionDTO,
  type AuditLogDTO,
  type LoginAttemptDTO,
  type SecurityOverviewDTO,
  type TotpEnrollmentDTO,
} from "@/models/fetchers/admin/security";

import { cancelTotpSetupAction, revokeOtherSessionsAction, revokeSessionAction, startTotpSetupAction } from "./actions";
import { auditActionLabel, auditEntityLabel, loginReasonLabel } from "./labels";
import { ChangePasswordForm, ConfirmTotpForm, DisableTotpForm } from "./security-forms";

export const metadata: Metadata = { title: "Sécurité" };

const FLASH_MESSAGES = {
  "2fa-on": "La double authentification est activée : le code de votre téléphone sera demandé à chaque connexion.",
  "2fa-off": "La double authentification est désactivée.",
};

/**
 * /admin/securite — the logged-in admin's security center: password, 2FA, open
 * sessions (devices), recent login attempts and the journal of admin actions.
 * Never cached: it shows live data (and the 2FA secret during the setup).
 */
export default async function SecurityPage() {
  await requireAdmin();
  const [overview, enrollment, sessions, attempts, logs] = await Promise.all([
    getMySecurityOverview(),
    getMyTotpEnrollment(),
    getMyActiveSessions(),
    getRecentLoginAttempts(20),
    getRecentAuditLogs(50),
  ]);
  const now = new Date(); // request time (after the session check)

  return (
    <>
      <AdminPageHeader
        title="Sécurité"
        description="Votre mot de passe, la double authentification, les appareils connectés et l'historique des connexions et des actions."
        breadcrumbs={[{ label: "Tableau de bord", href: "/admin" }, { label: "Sécurité" }]}
      />
      <FlashMessage messages={FLASH_MESSAGES} />

      <div className="grid items-start gap-6 xl:grid-cols-2">
        <FormSection
          id="mot-de-passe"
          title="Mot de passe"
          description={
            overview.passwordChangedAt
              ? `Dernière modification ${formatRelative(overview.passwordChangedAt, "fr", now)} (${formatDateTime(overview.passwordChangedAt)}).`
              : "Choisissez un mot de passe long et unique, que vous n'utilisez nulle part ailleurs."
          }
        >
          <ChangePasswordForm email={overview.email} />
        </FormSection>

        <FormSection
          id="double-authentification"
          title="Double authentification (2FA)"
          description="Un code à 6 chiffres, donné par une application sur votre téléphone, est demandé en plus du mot de passe."
          actions={
            overview.totpEnabled ? (
              <Badge tone="brand">
                <ShieldCheck aria-hidden="true" />
                Activée
              </Badge>
            ) : (
              <Badge tone="amber">Désactivée</Badge>
            )
          }
        >
          <TwoFactorPanel overview={overview} enrollment={enrollment} />
        </FormSection>
      </div>

      <SessionsSection sessions={sessions} now={now} />
      <LoginAttemptsSection attempts={attempts} />
      <AuditLogSection logs={logs} />
    </>
  );
}

/* --------------------------------------------------------------------------
   2FA
   -------------------------------------------------------------------------- */

function TwoFactorPanel({
  overview,
  enrollment,
}: {
  overview: SecurityOverviewDTO;
  enrollment: TotpEnrollmentDTO | null;
}) {
  if (overview.totpEnabled) {
    return (
      <div className="space-y-4">
        <p className="text-sm leading-relaxed text-ink-muted">
          Votre compte est protégé : même si quelqu&apos;un découvre votre mot de passe, il ne pourra pas se connecter sans
          votre téléphone. Gardez l&apos;application installée lorsque vous changez de téléphone.
        </p>
        <details className="group rounded-2xl border border-line bg-canvas/60 px-4 py-3">
          <summary className="cursor-pointer text-sm font-semibold text-ink-muted marker:text-ink-subtle hover:text-ink">
            Désactiver la double authentification
          </summary>
          <div className="mt-4">
            <DisableTotpForm />
          </div>
        </details>
      </div>
    );
  }

  if (overview.totpSetupPending && enrollment) {
    return (
      <div className="space-y-5">
        <ol className="space-y-5 text-sm text-ink-muted">
          <SetupStep number={1} title="Installez une application d'authentification">
            Google Authenticator, Microsoft Authenticator, Authy ou 1Password, sur votre téléphone.
          </SetupStep>
          <SetupStep number={2} title="Scannez ce QR code avec l'application">
            <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center">
              <div
                className="size-[13rem] shrink-0 overflow-hidden rounded-2xl border border-line bg-white p-1 [&_svg]:size-full"
                role="img"
                aria-label="QR code à scanner avec l'application d'authentification"
                // SVG generated on our server by lib/auth/totp.ts (no user content): safe to insert.
                dangerouslySetInnerHTML={{ __html: enrollment.qrCodeSvg }}
              />
              <div className="min-w-0 text-xs leading-relaxed">
                <p>Impossible de scanner ? Saisissez cette clé dans l&apos;application :</p>
                <p className="mt-2 rounded-xl bg-canvas px-3 py-2 font-mono text-sm font-semibold break-all text-ink select-all ring-1 ring-line">
                  {enrollment.manualKey}
                </p>
                <p className="mt-2 text-ink-subtle">Type : basé sur l&apos;heure · 6 chiffres · 30 secondes.</p>
              </div>
            </div>
          </SetupStep>
          <SetupStep number={3} title="Saisissez le code affiché pour terminer">
            <div className="mt-3">
              <ConfirmTotpForm />
            </div>
          </SetupStep>
        </ol>
        <div className="flex flex-wrap gap-2 border-t border-line pt-4">
          <form action={startTotpSetupAction}>
            <SubmitButton variant="ghost" size="sm" pendingLabel="Nouveau QR code…">
              <RotateCcw aria-hidden="true" />
              Nouveau QR code
            </SubmitButton>
          </form>
          <form action={cancelTotpSetupAction}>
            <SubmitButton variant="ghost" size="sm" pendingLabel="Annulation…">
              <X aria-hidden="true" />
              Annuler la configuration
            </SubmitButton>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-ink-muted">
        Fortement recommandé : sans votre téléphone, un mot de passe volé ne suffit plus pour entrer dans
        l&apos;administration. La configuration prend 2 minutes.
      </p>
      {overview.totpSetupPending ? (
        <p className="text-sm text-amber-800">
          La configuration précédente ne peut plus être lue : recommencez-la.
        </p>
      ) : null}
      <form action={startTotpSetupAction}>
        <SubmitButton pendingLabel="Préparation…">
          <Smartphone aria-hidden="true" />
          Configurer la double authentification
        </SubmitButton>
      </form>
    </div>
  );
}

function SetupStep({ number, title, children }: { number: number; title: string; children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span
        className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white"
        aria-hidden="true"
      >
        {number}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-ink">
          <span className="sr-only">Étape {number} : </span>
          {title}
        </p>
        <div className="mt-0.5">{children}</div>
      </div>
    </li>
  );
}

/* --------------------------------------------------------------------------
   Tables
   -------------------------------------------------------------------------- */

function SectionHeading({
  id,
  title,
  description,
  actions,
}: {
  id: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 id={id} className="text-lg font-bold text-ink">
          {title}
        </h2>
        <p className="mt-0.5 text-sm text-ink-muted">{description}</p>
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}

function SessionsSection({ sessions, now }: { sessions: AdminSessionDTO[]; now: Date }) {
  const others = sessions.filter((session) => !session.isCurrent).length;
  return (
    <section className="mt-8" aria-labelledby="sessions-title">
      <SectionHeading
        id="sessions-title"
        title="Appareils connectés"
        description="Chaque connexion ouverte à votre compte. Fermez celles que vous ne reconnaissez pas. Une session inutilisée pendant 2 heures se ferme d'elle-même."
        actions={
          others > 0 ? (
            <ConfirmDeleteButton
              action={revokeOtherSessionsAction}
              label="Déconnecter les autres appareils"
              title="Déconnecter les autres appareils ?"
              description={`${others} autre(s) session(s) seront fermées immédiatement. Cet appareil reste connecté.`}
              confirmLabel="Déconnecter"
              pendingLabel="Déconnexion…"
              icon={<LogOut aria-hidden="true" />}
            />
          ) : null
        }
      />
      <DataTable caption="Sessions ouvertes sur votre compte" tableClassName="min-w-[44rem]">
        <Thead>
          <Th>Appareil</Th>
          <Th>Ouverte le</Th>
          <Th>Dernière activité</Th>
          <Th>Expire le</Th>
          <Th align="end">
            <span className="sr-only">Actions</span>
          </Th>
        </Thead>
        <Tbody>
          {sessions.length === 0 ? (
            <EmptyTableRow colSpan={5} title="Aucune session ouverte" icon={<MonitorSmartphone />} />
          ) : (
            sessions.map((session) => (
              <Tr key={session.id}>
                <Td>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-ink" title={session.userAgent ?? undefined}>
                      {session.device}
                    </span>
                    {session.isCurrent ? <Badge tone="brand">Cet appareil</Badge> : null}
                    {session.isPending2fa ? <Badge tone="amber">Code 2FA en attente</Badge> : null}
                  </div>
                </Td>
                <Td className="whitespace-nowrap tabular">{formatDateTime(session.createdAt)}</Td>
                <Td className="whitespace-nowrap">{formatRelative(session.lastSeenAt, "fr", now)}</Td>
                <Td className="whitespace-nowrap tabular">{formatDateTime(session.expiresAt)}</Td>
                <Td align="end">
                  {session.isCurrent ? null : (
                    <ConfirmDeleteButton
                      action={revokeSessionAction.bind(null, session.id)}
                      label="Fermer cette session"
                      title="Fermer cette session ?"
                      description={`${session.device} sera déconnecté immédiatement.`}
                      confirmLabel="Fermer la session"
                      pendingLabel="Fermeture…"
                      icon={<LogOut aria-hidden="true" />}
                      variant="ghost"
                      iconOnly
                    />
                  )}
                </Td>
              </Tr>
            ))
          )}
        </Tbody>
      </DataTable>
    </section>
  );
}

function LoginAttemptsSection({ attempts }: { attempts: LoginAttemptDTO[] }) {
  return (
    <section className="mt-8" aria-labelledby="attempts-title">
      <SectionHeading
        id="attempts-title"
        title="Dernières tentatives de connexion"
        description="Les 20 derniers essais sur la page de connexion, réussis ou non (toutes adresses confondues)."
      />
      <DataTable caption="Dernières tentatives de connexion">
        <Thead>
          <Th>Date</Th>
          <Th>Adresse e-mail saisie</Th>
          <Th>Résultat</Th>
        </Thead>
        <Tbody>
          {attempts.length === 0 ? (
            <EmptyTableRow colSpan={3} title="Aucune tentative enregistrée" />
          ) : (
            attempts.map((attempt) => {
              const result = loginReasonLabel(attempt.reason, attempt.success);
              return (
                <Tr key={attempt.id}>
                  <Td className="whitespace-nowrap tabular">{formatDateTime(attempt.createdAt)}</Td>
                  <Td className="max-w-[18rem] truncate font-medium text-ink">{attempt.email}</Td>
                  <Td>
                    <Badge tone={result.tone}>{result.label}</Badge>
                  </Td>
                </Tr>
              );
            })
          )}
        </Tbody>
      </DataTable>
    </section>
  );
}

function AuditLogSection({ logs }: { logs: AuditLogDTO[] }) {
  return (
    <section className="mt-8" aria-labelledby="audit-title">
      <SectionHeading
        id="audit-title"
        title="Journal d'activité"
        description="Les 50 dernières actions des administrateurs (connexions, créations, modifications, suppressions)."
      />
      <DataTable caption="Journal des actions des administrateurs" tableClassName="min-w-[48rem]">
        <Thead>
          <Th>Date</Th>
          <Th>Administrateur</Th>
          <Th>Action</Th>
          <Th>Élément</Th>
          <Th>Détails</Th>
        </Thead>
        <Tbody>
          {logs.length === 0 ? (
            <EmptyTableRow colSpan={5} title="Aucune action enregistrée pour l'instant" />
          ) : (
            logs.map((log) => (
              <Tr key={log.id}>
                <Td className="whitespace-nowrap tabular">{formatDateTime(log.createdAt)}</Td>
                <Td className="max-w-[14rem] truncate">{log.adminEmail}</Td>
                <Td className="font-medium text-ink">{auditActionLabel(log.action)}</Td>
                <Td className="whitespace-nowrap">
                  {auditEntityLabel(log.entity)}
                  {log.entityId ? <span className="text-ink-subtle"> #{log.entityId}</span> : null}
                </Td>
                <Td className="max-w-[20rem] truncate" title={log.details ?? undefined}>
                  {log.details ?? "—"}
                </Td>
              </Tr>
            ))
          )}
        </Tbody>
      </DataTable>
    </section>
  );
}
