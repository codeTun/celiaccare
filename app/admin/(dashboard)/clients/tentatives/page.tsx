import { ListOrdered, ShieldBan, ShieldCheck, ShieldX } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { z } from "zod";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { ATTEMPTS_PATH, CLIENTS_TABS, RULES_PATH } from "@/components/admin/clients/clients-routes";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { DataTable, EmptyTableRow, Tbody, Td, Th, Thead, Tr } from "@/components/admin/data-table";
import { FilterTabs } from "@/components/admin/filter-tabs";
import { PhoneNumber } from "@/components/admin/orders/order-badges";
import { SectionTabs } from "@/components/admin/orders/section-tabs";
import { TableSkeleton } from "@/components/admin/orders/skeletons";
import { firstParam, type AdminQuery } from "@/components/admin/query-string";
import { SearchForm } from "@/components/admin/search-form";
import { REFUSAL_REASON_LABELS, StatusBadge } from "@/components/admin/status-badge";
import { buttonStyles } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/session";
import { formatDateTime, formatPhone, formatRelative } from "@/lib/format";
import { MAX_ORDERS_PER_DAY } from "@/lib/tunisia";
import { cn } from "@/lib/utils";
import { getTodayCounters, listRefusedAttempts } from "@/models/fetchers/admin/order-attempts";
import { listPhoneRules } from "@/models/fetchers/admin/phone-rules";
import { REFUSAL_REASONS } from "@/types";
import type { AdminOrderCounterRow, AdminPhoneRuleRow } from "@/types/admin-data";

import { blockPhoneAction } from "../actions";

export const metadata: Metadata = { title: "Tentatives refusées" };

const filtersSchema = z.object({
  motif: z.enum(REFUSAL_REASONS).optional().catch(undefined),
  q: z.string().trim().max(100).optional().catch(undefined),
  page: z.coerce.number().int().min(1).max(10_000).catch(1),
});

/**
 * /admin/clients/tentatives — spec EF-36 / EF-38: today's order counters per phone number
 * and the journal of refused orders (daily limit reached, blocked number…), to spot
 * suspicious behaviour and block a number in one click.
 */
export default function RefusedAttemptsPage({ searchParams }: PageProps<"/admin/clients/tentatives">) {
  return (
    <>
      <AdminPageHeader
        title="Tentatives refusées"
        description={`Chaque commande refusée par la limite de ${MAX_ORDERS_PER_DAY} commandes par jour ou par un blocage est enregistrée ici (EF-38). Le compteur repart de zéro à minuit, heure de Tunis.`}
        breadcrumbs={[
          { label: "Tableau de bord", href: "/admin" },
          { label: "Clients", href: "/admin/clients" },
          { label: "Tentatives refusées" },
        ]}
      />
      <SectionTabs label="Rubriques des clients" current={ATTEMPTS_PATH} tabs={CLIENTS_TABS} />
      <Suspense fallback={<TableSkeleton rows={4} columns={5} toolbar={false} className="mb-8" />}>
        <TodayCounters />
      </Suspense>
      <Suspense fallback={<TableSkeleton columns={6} />}>
        <AttemptsJournal searchParams={searchParams} />
      </Suspense>
    </>
  );
}

/** The current (not expired) rule of each number. */
function activeRulesByPhone(rules: AdminPhoneRuleRow[]) {
  return new Map(rules.filter((rule) => !rule.isExpired).map((rule) => [rule.phone, rule]));
}

/** "Bloqué" / "Exception" badge with a link to the rule, or the one-click block button. */
function RuleOrBlockButton({ phone, rule, name }: { phone: string; rule: AdminPhoneRuleRow | undefined; name: string | null }) {
  if (rule) {
    return (
      <Link href={`${RULES_PATH}/${rule.id}`} className="inline-flex" title="Voir la règle">
        <StatusBadge kind="phoneRule" status={rule.type} />
      </Link>
    );
  }
  return (
    <ConfirmDeleteButton
      action={blockPhoneAction.bind(null, phone, "attempts")}
      label="Bloquer"
      title={`Bloquer le ${formatPhone(phone)} ?`}
      description={`${name ? `${name} ne pourra` : "Ce numéro ne pourra"} plus commander sur le site jusqu'à ce que vous supprimiez le blocage (onglet « Règles téléphone »).`}
      confirmLabel="Bloquer le numéro"
      pendingLabel="Blocage…"
      icon={<ShieldBan aria-hidden="true" />}
      variant="outline"
    />
  );
}

/* --------------------------------------------------------------------------
   EF-36: today's counters
   -------------------------------------------------------------------------- */

async function TodayCounters() {
  await requireAdmin();
  const [counters, rules] = await Promise.all([getTodayCounters(new Date()), listPhoneRules()]);
  const ruleByPhone = activeRulesByPhone(rules);

  return (
    <section aria-labelledby="counters-title" className="mb-8">
      <div className="mb-3">
        <h2 id="counters-title" className="text-lg font-bold text-ink">
          Compteurs du jour
        </h2>
        <p className="text-sm text-ink-muted">
          Les numéros qui ont commandé aujourd&apos;hui, les plus actifs d&apos;abord (limite : {MAX_ORDERS_PER_DAY} par jour,
          sauf exception).
        </p>
      </div>
      <DataTable caption="Commandes acceptées et refusées aujourd'hui par numéro" stickyHeader={false} tableClassName="min-w-[48rem]">
        <Thead>
          <Th>Téléphone</Th>
          <Th>Commandes du jour</Th>
          <Th align="end">Refusées</Th>
          <Th>Règle</Th>
          <Th align="end">
            <span className="sr-only">Actions</span>
          </Th>
        </Thead>
        <Tbody>
          {counters.length === 0 ? (
            <EmptyTableRow colSpan={5} icon={<ShieldCheck />} title="Aucune commande aujourd'hui pour l'instant" />
          ) : (
            counters.map((counter) => (
              <Tr key={counter.id}>
                <Td>
                  <PhoneNumber phone={counter.phone} className="font-semibold text-ink" />
                </Td>
                <Td>
                  <CounterGauge counter={counter} />
                </Td>
                <Td align="end" className={cn("tabular", counter.refused > 0 && "font-bold text-red-700")}>
                  {counter.refused}
                </Td>
                <Td>
                  <RuleOrBlockButton phone={counter.phone} rule={ruleByPhone.get(counter.phone)} name={null} />
                </Td>
                <Td align="end">
                  <Link
                    href={`/admin/commandes?q=${counter.phone}`}
                    className={buttonStyles({ variant: "ghost", size: "icon-sm" })}
                    title="Voir ses commandes"
                  >
                    <ListOrdered aria-hidden="true" />
                    <span className="sr-only">Voir les commandes du {formatPhone(counter.phone)}</span>
                  </Link>
                </Td>
              </Tr>
            ))
          )}
        </Tbody>
      </DataTable>
    </section>
  );
}

/** "2 / 3" with a small bar: amber at the limit, red when blocked. */
function CounterGauge({ counter }: { counter: AdminOrderCounterRow }) {
  const limit = counter.dailyLimit;
  const ratio = limit > 0 ? Math.min(1, counter.count / limit) : 1;
  const atLimit = limit === 0 || counter.count >= limit;
  return (
    <div className="flex items-center gap-3">
      <span className="w-12 text-sm font-semibold text-ink tabular">
        {counter.count} / {limit}
      </span>
      <span className="h-1.5 w-24 overflow-hidden rounded-full bg-line" aria-hidden="true">
        <span
          className={cn("block h-full rounded-full", limit === 0 ? "bg-red-500" : atLimit ? "bg-amber-500" : "bg-brand-500")}
          style={{ width: `${Math.round(ratio * 100)}%` }}
        />
      </span>
      {atLimit ? <span className="text-xs font-semibold text-amber-800">{limit === 0 ? "Bloqué" : "Limite atteinte"}</span> : null}
    </div>
  );
}

/* --------------------------------------------------------------------------
   EF-38: journal of refused attempts
   -------------------------------------------------------------------------- */

async function AttemptsJournal({ searchParams }: { searchParams: Promise<AdminQuery> }) {
  await requireAdmin();
  const query = await searchParams;
  const filters = filtersSchema.parse({ motif: firstParam(query.motif), q: firstParam(query.q), page: firstParam(query.page) });

  const [attempts, rules] = await Promise.all([
    listRefusedAttempts({ page: filters.page, reason: filters.motif, q: filters.q }),
    listPhoneRules(),
  ]);
  const ruleByPhone = activeRulesByPhone(rules);
  const now = new Date(); // request time (after the session check)
  const isFiltered = Boolean(filters.motif || filters.q);

  return (
    <section aria-labelledby="journal-title">
      <div className="mb-3">
        <h2 id="journal-title" className="text-lg font-bold text-ink">
          Journal des tentatives refusées
        </h2>
        <p className="text-sm text-ink-muted">
          La « connexion » est une empreinte anonyme de l&apos;adresse IP : la même empreinte sur plusieurs numéros signale
          souvent un robot. Les données de plus de 90 jours sont effacées lors du nettoyage (onglet Clients).
        </p>
      </div>
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <FilterTabs
          basePath={ATTEMPTS_PATH}
          query={query}
          param="motif"
          label="Filtrer par motif"
          tabs={[
            { value: "", label: "Tous les motifs" },
            ...REFUSAL_REASONS.map((reason) => ({ value: reason, label: REFUSAL_REASON_LABELS[reason] })),
          ]}
        />
        <SearchForm basePath={ATTEMPTS_PATH} query={query} placeholder="Numéro de téléphone…" label="Rechercher un numéro" />
      </div>

      <DataTable caption="Tentatives de commande refusées" tableClassName="min-w-[60rem]">
        <Thead>
          <Th>Date</Th>
          <Th>Téléphone</Th>
          <Th>Nom saisi</Th>
          <Th>Motif</Th>
          <Th>Connexion</Th>
          <Th>Règle</Th>
        </Thead>
        <Tbody>
          {attempts.items.length === 0 ? (
            <EmptyTableRow
              colSpan={6}
              icon={<ShieldX />}
              title={isFiltered ? "Aucune tentative ne correspond" : "Aucune tentative refusée"}
              description={isFiltered ? "Modifiez la recherche ou le filtre." : "Tout va bien : aucune commande n'a été refusée."}
            />
          ) : (
            attempts.items.map((attempt) => (
              <Tr key={attempt.id}>
                <Td className="whitespace-nowrap">
                  <span className="block text-ink">{formatRelative(attempt.createdAt, "fr", now)}</span>
                  <span className="text-xs text-ink-subtle tabular">{formatDateTime(attempt.createdAt)}</span>
                </Td>
                <Td>
                  <PhoneNumber phone={attempt.phone} className="font-semibold text-ink" />
                </Td>
                <Td className="max-w-[12rem] truncate" title={attempt.customerName ?? undefined}>
                  {attempt.customerName ?? <span className="text-ink-subtle">—</span>}
                </Td>
                <Td>
                  <StatusBadge kind="refusal" status={attempt.reason} />
                </Td>
                <Td>
                  {attempt.ipTag ? (
                    <span className="rounded-md bg-canvas px-1.5 py-0.5 font-mono text-xs text-ink-muted ring-1 ring-line">
                      {attempt.ipTag}
                    </span>
                  ) : (
                    <span className="text-ink-subtle">—</span>
                  )}
                </Td>
                <Td>
                  <RuleOrBlockButton phone={attempt.phone} rule={ruleByPhone.get(attempt.phone)} name={attempt.customerName} />
                </Td>
              </Tr>
            ))
          )}
        </Tbody>
      </DataTable>
      <AdminPagination basePath={ATTEMPTS_PATH} query={query} {...attempts} />
    </section>
  );
}
