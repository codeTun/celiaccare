import { Pencil, Plus, ShieldBan } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { z } from "zod";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { CLIENTS_TABS, RULES_FLASH_MESSAGES, RULES_PATH } from "@/components/admin/clients/clients-routes";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { DataTable, EmptyTableRow, Tbody, Td, Th, Thead, Tr } from "@/components/admin/data-table";
import { FilterTabs } from "@/components/admin/filter-tabs";
import { FlashMessage } from "@/components/admin/flash-message";
import { PhoneNumber } from "@/components/admin/orders/order-badges";
import { SectionTabs } from "@/components/admin/orders/section-tabs";
import { TableSkeleton } from "@/components/admin/orders/skeletons";
import { firstParam, type AdminQuery } from "@/components/admin/query-string";
import { SearchForm } from "@/components/admin/search-form";
import { StatusBadge } from "@/components/admin/status-badge";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/session";
import { formatDate, formatPhone } from "@/lib/format";
import { normalizeSearch } from "@/lib/utils";
import { listPhoneRules } from "@/models/fetchers/admin/phone-rules";
import { ADMIN_PAGE_SIZE } from "@/types/admin-data";

import { deletePhoneRuleAction } from "./actions";

export const metadata: Metadata = { title: "Règles téléphone" };

const filtersSchema = z.object({
  type: z.enum(["bloques", "exceptions", "expirees"]).optional().catch(undefined),
  q: z.string().trim().max(100).optional().catch(undefined),
  page: z.coerce.number().int().min(1).max(1000).catch(1),
});

/**
 * /admin/clients/regles — spec EF-39: numbers blocked by the team and justified exceptions
 * to the limit of 3 orders per day. Create, edit, delete.
 */
export default function PhoneRulesPage({ searchParams }: PageProps<"/admin/clients/regles">) {
  return (
    <>
      <AdminPageHeader
        title="Règles téléphone"
        description="Bloquez un numéro abusif ou autorisez plus de 3 commandes par jour à un client qui le justifie (EF-39)."
        breadcrumbs={[
          { label: "Tableau de bord", href: "/admin" },
          { label: "Clients", href: "/admin/clients" },
          { label: "Règles téléphone" },
        ]}
        actions={
          <Link href={`${RULES_PATH}/nouvelle`} className={buttonStyles({ size: "sm" })}>
            <Plus aria-hidden="true" />
            Nouvelle règle
          </Link>
        }
      />
      <SectionTabs label="Rubriques des clients" current={RULES_PATH} tabs={CLIENTS_TABS} />
      <FlashMessage messages={RULES_FLASH_MESSAGES} />
      <Suspense fallback={<TableSkeleton columns={6} />}>
        <RulesList searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function RulesList({ searchParams }: { searchParams: Promise<AdminQuery> }) {
  await requireAdmin();
  const query = await searchParams;
  const filters = filtersSchema.parse({ type: firstParam(query.type), q: firstParam(query.q), page: firstParam(query.page) });

  const rules = await listPhoneRules();
  const current = rules.filter((rule) => !rule.isExpired);
  const counts = {
    blocked: current.filter((rule) => rule.type === "BLOCKED").length,
    exceptions: current.filter((rule) => rule.type === "EXCEPTION").length,
    expired: rules.length - current.length,
  };

  // A short list: filtered and paginated here.
  const search = filters.q ? normalizeSearch(filters.q) : "";
  const digits = filters.q?.replace(/\D/g, "") ?? "";
  const filtered = rules.filter((rule) => {
    if (filters.type === "bloques" && (rule.type !== "BLOCKED" || rule.isExpired)) return false;
    if (filters.type === "exceptions" && (rule.type !== "EXCEPTION" || rule.isExpired)) return false;
    if (filters.type === "expirees" && !rule.isExpired) return false;
    if (!search) return true;
    return (digits.length >= 2 && rule.phone.includes(digits)) || normalizeSearch(rule.reason ?? "").includes(search);
  });
  const pageCount = Math.max(1, Math.ceil(filtered.length / ADMIN_PAGE_SIZE));
  const page = Math.min(filters.page, pageCount);
  const rows = filtered.slice((page - 1) * ADMIN_PAGE_SIZE, page * ADMIN_PAGE_SIZE);
  const isFiltered = Boolean(filters.type || filters.q);

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <FilterTabs
          basePath={RULES_PATH}
          query={query}
          param="type"
          label="Filtrer les règles"
          tabs={[
            { value: "", label: "Toutes", count: rules.length },
            { value: "bloques", label: "Numéros bloqués", count: counts.blocked },
            { value: "exceptions", label: "Exceptions", count: counts.exceptions },
            { value: "expirees", label: "Expirées", count: counts.expired },
          ]}
        />
        <SearchForm basePath={RULES_PATH} query={query} placeholder="Numéro ou motif…" label="Rechercher une règle" />
      </div>

      <DataTable caption="Règles par numéro de téléphone" tableClassName="min-w-[58rem]">
        <Thead>
          <Th>Numéro</Th>
          <Th>Règle</Th>
          <Th align="end">Commandes / jour</Th>
          <Th>Motif</Th>
          <Th>Valable jusqu&apos;au</Th>
          <Th>Créée le</Th>
          <Th align="end">
            <span className="sr-only">Actions</span>
          </Th>
        </Thead>
        <Tbody>
          {rows.length === 0 ? (
            <EmptyTableRow
              colSpan={7}
              icon={<ShieldBan />}
              title={isFiltered ? "Aucune règle ne correspond" : "Aucune règle pour l'instant"}
              description={
                isFiltered
                  ? "Modifiez la recherche ou le filtre."
                  : "Tous les numéros suivent la limite normale de 3 commandes par jour."
              }
            />
          ) : (
            rows.map((rule) => (
              <Tr key={rule.id} className={rule.isExpired ? "opacity-70" : undefined}>
                <Td>
                  <PhoneNumber phone={rule.phone} className="font-semibold text-ink" />
                </Td>
                <Td>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <StatusBadge kind="phoneRule" status={rule.type} />
                    {rule.isExpired ? <Badge tone="neutral">Expirée</Badge> : null}
                  </div>
                </Td>
                <Td align="end" className="tabular">
                  {rule.type === "EXCEPTION" ? rule.maxPerDay : rule.type === "BLOCKED" ? "0" : "—"}
                </Td>
                <Td className="max-w-[18rem] truncate" title={rule.reason ?? undefined}>
                  {rule.reason ?? <span className="text-ink-subtle">—</span>}
                </Td>
                <Td className="whitespace-nowrap">{rule.expiresAt ? formatDate(rule.expiresAt) : "Sans fin"}</Td>
                <Td className="whitespace-nowrap tabular">{formatDate(rule.createdAt)}</Td>
                <Td align="end">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`${RULES_PATH}/${rule.id}`}
                      className={buttonStyles({ variant: "ghost", size: "icon-sm" })}
                      title="Modifier"
                    >
                      <Pencil aria-hidden="true" />
                      <span className="sr-only">Modifier la règle du {formatPhone(rule.phone)}</span>
                    </Link>
                    <ConfirmDeleteButton
                      action={deletePhoneRuleAction.bind(null, rule.id)}
                      label={`Supprimer la règle du ${formatPhone(rule.phone)}`}
                      title={`Supprimer la règle du ${formatPhone(rule.phone)} ?`}
                      description="Le numéro revient à la limite normale de 3 commandes par jour."
                      iconOnly
                      variant="ghost"
                    />
                  </div>
                </Td>
              </Tr>
            ))
          )}
        </Tbody>
      </DataTable>
      <AdminPagination
        basePath={RULES_PATH}
        query={query}
        page={page}
        pageCount={pageCount}
        total={filtered.length}
        pageSize={ADMIN_PAGE_SIZE}
      />
    </>
  );
}
