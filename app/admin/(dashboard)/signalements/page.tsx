import { CircleCheck, ExternalLink, Flag, Hourglass, Pencil, Timer, TriangleExclamationPoint } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { z } from "zod";

import { AdminEmpty } from "@/components/admin/admin-empty";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPagination } from "@/components/admin/admin-pagination";
import {
  adminSheetPath,
  formatHours,
  publicSheetPath,
  REPORT_DELAY,
  REPORT_REASON_LABELS,
  SHEET_TYPE_LABELS,
} from "@/components/admin/community/labels";
import { QueryReset } from "@/components/admin/community/query-reset";
import { ReportDelayBadge } from "@/components/admin/community/report-delay-badge";
import { ReportProcessDialog } from "@/components/admin/community/report-process-dialog";
import { AdminListSkeleton } from "@/components/admin/community/skeletons";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { DataTable, EmptyTableRow, Tbody, Td, Th, Thead, Tr } from "@/components/admin/data-table";
import { FilterTabs } from "@/components/admin/filter-tabs";
import { FlashMessage } from "@/components/admin/flash-message";
import { firstParam, type AdminQuery } from "@/components/admin/query-string";
import { SearchForm } from "@/components/admin/search-form";
import { StatCard } from "@/components/admin/stat-card";
import { StatusBadge } from "@/components/admin/status-badge";
import { displayPhone, telHref } from "@/components/directory/links";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/auth/session";
import { formatDateTime } from "@/lib/format";
import { siteConfig } from "@/lib/site-config";
import { normalizeTunisianPhone } from "@/lib/tunisia";
import { getReportStats, listReportQueue, type AdminReportQueueRow } from "@/models/fetchers/admin/reports";
import { REPORT_STATUSES } from "@/types";

import { deleteReportAction, updateReportAction } from "./actions";

export const metadata: Metadata = { title: "Signalements" };

const BASE_PATH = "/admin/signalements";

/** A plain address only: nothing that could add other "mailto:" fields (?cc=, &bcc=...). */
const SAFE_EMAIL = /^[^\s@?&#/\\]+@[^\s@?&#/\\]+\.[^\s@?&#/\\]+$/;

/** ?status= : "" (waiting, default), one status or "all". A wrong value shows the default view. */
const listQuerySchema = z.object({
  status: z.enum([...REPORT_STATUSES, "all"]).optional().catch(undefined),
  q: z.string().trim().max(100).optional().catch(undefined),
  page: z.coerce.number().int().min(1).max(10_000).catch(1),
});

/**
 * /admin/signalements — the "Signaler une erreur" queue (spec EF-20 / EF-23): the oldest
 * waiting report first, its delay, the reported sheet, and the follow-up.
 */
export default function ReportsPage({ searchParams }: PageProps<"/admin/signalements">) {
  return (
    <>
      <AdminPageHeader
        title="Signalements"
        description={`Les erreurs signalées par les visiteurs sur les fiches. Traitez d'abord les plus anciennes : au-delà de ${REPORT_DELAY.overdueHours} h, le délai est dépassé.`}
        breadcrumbs={[{ label: "Tableau de bord", href: "/admin" }, { label: "Signalements" }]}
      />
      <FlashMessage messages={{ deleted: "Le signalement a été supprimé." }} />
      <Suspense fallback={<AdminListSkeleton stats={4} />}>
        <ReportsQueue searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function ReportsQueue({ searchParams }: Pick<PageProps<"/admin/signalements">, "searchParams">) {
  await requireAdmin();
  const query: AdminQuery = await searchParams;
  const filters = listQuerySchema.parse({
    status: firstParam(query.status),
    q: firstParam(query.q),
    page: firstParam(query.page),
  });
  const now = new Date(); // request time (after the session check)

  const [reports, stats] = await Promise.all([
    listReportQueue({ view: filters.status ?? "waiting", q: filters.q || undefined, page: filters.page }, now),
    getReportStats(now, REPORT_DELAY.overdueHours),
  ]);
  const total = stats.waiting + stats.byStatus.RESOLVED + stats.byStatus.REJECTED;
  const isFiltered = Boolean(filters.q);

  return (
    <>
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="En attente" value={stats.waiting} icon={<Hourglass />} tone="amber" hint="à traiter ou en vérification" />
        <StatCard
          label="Délai dépassé"
          value={stats.overdue}
          icon={<TriangleExclamationPoint />}
          tone={stats.overdue > 0 ? "red" : "neutral"}
          hint={`en attente depuis ${REPORT_DELAY.overdueHours} h ou plus`}
        />
        <StatCard
          label="Traités ce mois-ci"
          value={stats.handledThisMonth}
          icon={<CircleCheck />}
          tone="brand"
          hint="corrigés ou rejetés"
        />
        <StatCard
          label="Délai moyen de traitement"
          value={stats.averageHandlingHours === null ? "—" : formatHours(stats.averageHandlingHours)}
          icon={<Timer />}
          tone="sky"
          hint={
            stats.handledThisMonth > 0
              ? `ce mois-ci, sur ${stats.handledThisMonth} signalement${stats.handledThisMonth > 1 ? "s" : ""}`
              : "aucun signalement traité ce mois-ci"
          }
        />
      </div>

      {total === 0 ? (
        <AdminEmpty
          icon={<Flag />}
          title="Aucun signalement pour l'instant"
          description="Les erreurs signalées par les visiteurs (bouton « Signaler une erreur » des fiches) apparaîtront ici."
        />
      ) : (
        <>
          <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <FilterTabs
              basePath={BASE_PATH}
              query={query}
              label="Filtrer par statut"
              tabs={[
                { value: "", label: "En attente", count: stats.waiting },
                { value: "OPEN", label: "À traiter", count: stats.byStatus.OPEN },
                { value: "IN_REVIEW", label: "En vérification", count: stats.byStatus.IN_REVIEW },
                { value: "RESOLVED", label: "Corrigés", count: stats.byStatus.RESOLVED },
                { value: "REJECTED", label: "Rejetés", count: stats.byStatus.REJECTED },
                { value: "all", label: "Tous", count: total },
              ]}
            />
            <SearchForm basePath={BASE_PATH} query={query} placeholder="Fiche, message, contact…" className="sm:w-80" />
          </div>
          {isFiltered ? <QueryReset href={BASE_PATH} total={reports.total} /> : null}

          <DataTable caption="Signalements, du plus ancien en attente au plus récent" tableClassName="min-w-[70rem]">
            <Thead>
              <Th>Délai</Th>
              <Th>Fiche signalée</Th>
              <Th>Motif</Th>
              <Th>Message</Th>
              <Th>Reçu le</Th>
              <Th>Statut</Th>
              <Th align="end">
                <span className="sr-only">Actions</span>
              </Th>
            </Thead>
            <Tbody>
              {reports.items.length === 0 ? (
                <EmptyTableRow
                  colSpan={7}
                  icon={<Flag />}
                  title={
                    !filters.status && !filters.q ? "Aucun signalement en attente" : "Aucun signalement ne correspond"
                  }
                  description={
                    !filters.status && !filters.q ? "Tout est traité. Bravo !" : "Modifiez la recherche ou le filtre."
                  }
                />
              ) : (
                reports.items.map((report) => <ReportRow key={report.id} report={report} />)
              )}
            </Tbody>
          </DataTable>
          <AdminPagination basePath={BASE_PATH} query={query} {...reports} />
        </>
      )}
    </>
  );
}

function ReportRow({ report }: { report: AdminReportQueueRow }) {
  const sheetType = SHEET_TYPE_LABELS[report.targetType];
  const isGluten = report.reason === "GLUTEN_CONCERN";
  const links = <SheetLinks report={report} />;

  return (
    <Tr>
      <Td className="whitespace-nowrap">
        <ReportDelayBadge status={report.status} ageHours={report.ageHours} />
      </Td>
      <Td className="max-w-[16rem]">
        <Badge tone="outline" className="mb-1">
          {sheetType}
        </Badge>
        <p className="font-semibold break-words text-ink">{report.targetName}</p>
        {report.targetExists ? (
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs">{links}</div>
        ) : (
          <p className="mt-1 text-xs text-ink-subtle">Fiche supprimée depuis</p>
        )}
      </Td>
      <Td>
        <Badge tone={isGluten ? "red" : "neutral"}>{REPORT_REASON_LABELS[report.reason]}</Badge>
      </Td>
      <Td className="max-w-[24rem]">
        <p className="line-clamp-3 text-sm leading-relaxed break-words text-ink" title={report.message}>
          {report.message}
        </p>
        <div className="mt-1 text-xs">
          <ContactLink contact={report.contact} />
        </div>
        {report.adminNote ? (
          <p className="mt-1 line-clamp-2 text-xs text-ink-subtle italic" title={report.adminNote}>
            Note : {report.adminNote}
          </p>
        ) : null}
      </Td>
      <Td className="whitespace-nowrap tabular">{formatDateTime(report.createdAt)}</Td>
      <Td>
        <StatusBadge kind="report" status={report.status} />
      </Td>
      <Td align="end">
        <div className="flex items-center justify-end gap-1">
          <ReportProcessDialog
            action={updateReportAction.bind(null, report.id)}
            status={report.status}
            adminNote={report.adminNote}
            triggerVariant={report.status === "OPEN" || report.status === "IN_REVIEW" ? "primary" : "outline"}
            title={`${sheetType} · ${report.targetName}`}
            summary={
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={isGluten ? "red" : "neutral"}>{REPORT_REASON_LABELS[report.reason]}</Badge>
                  <StatusBadge kind="report" status={report.status} />
                  <ReportDelayBadge status={report.status} ageHours={report.ageHours} />
                </div>
                <p className="leading-relaxed break-words whitespace-pre-wrap text-ink">{report.message}</p>
                <p className="text-xs text-ink-muted">
                  Reçu le <span className="tabular">{formatDateTime(report.createdAt)}</span>
                  {report.resolvedAt ? (
                    <>
                      {" "}
                      · clôturé le <span className="tabular">{formatDateTime(report.resolvedAt)}</span>
                    </>
                  ) : null}
                  {" · "}
                  <ContactLink contact={report.contact} />
                </p>
                {isGluten ? (
                  <p className="text-xs font-medium text-red-700">
                    Problème lié au gluten : vérifiez la fiche en priorité et masquez-la si besoin.
                  </p>
                ) : null}
              </div>
            }
            links={report.targetExists ? links : null}
          />
          <ConfirmDeleteButton
            action={deleteReportAction.bind(null, report.id)}
            hiddenFields={{ stay: "1" }}
            label="Supprimer le signalement"
            title="Supprimer ce signalement ?"
            description="À réserver aux messages indésirables : pour garder une trace, choisissez plutôt le statut « Rejeté »."
            variant="ghost"
            iconOnly
          />
        </div>
      </Td>
    </Tr>
  );
}

/** "Voir sur le site" (only when the sheet is public) and "Modifier la fiche" (admin). */
function SheetLinks({ report }: { report: AdminReportQueueRow }): ReactNode {
  return (
    <>
      {report.currentSlug && report.targetIsActive ? (
        <a
          href={publicSheetPath(report.targetType, report.currentSlug)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-semibold text-brand-700 hover:underline"
        >
          <ExternalLink className="size-3.5" aria-hidden="true" />
          Voir sur le site
          <span className="sr-only">(nouvel onglet)</span>
        </a>
      ) : (
        <span className="text-ink-subtle">Masquée du site</span>
      )}
      <Link
        href={adminSheetPath(report.targetType, report.targetId)}
        className="inline-flex items-center gap-1 font-semibold text-brand-700 hover:underline"
      >
        <Pencil className="size-3.5" aria-hidden="true" />
        Modifier la fiche
      </Link>
    </>
  );
}

/** The e-mail or phone left by the visitor, as a link to answer. */
function ContactLink({ contact }: { contact: string | null }) {
  if (!contact) return <span className="text-ink-subtle">Pas de contact laissé</span>;
  if (SAFE_EMAIL.test(contact)) {
    const subject = encodeURIComponent(`Votre signalement sur ${siteConfig.name}`);
    return (
      <a href={`mailto:${contact}?subject=${subject}`} className="font-semibold break-all text-brand-700 hover:underline">
        {contact}
      </a>
    );
  }
  if (normalizeTunisianPhone(contact)) {
    return (
      <a href={telHref(contact)} className="font-semibold text-brand-700 hover:underline">
        <span dir="ltr" className="tabular">
          {displayPhone(contact)}
        </span>
      </a>
    );
  }
  return <span className="break-all">{contact}</span>;
}
