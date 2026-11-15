import { Eraser, ListOrdered, ShieldBan, ShieldCheck, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { z } from "zod";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { CLIENTS_FLASH_MESSAGES, CLIENTS_PATH, CLIENTS_TABS, RULES_PATH } from "@/components/admin/clients/clients-routes";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { DataTable, EmptyTableRow, Tbody, Td, Th, Thead, Tr } from "@/components/admin/data-table";
import { FlashMessage } from "@/components/admin/flash-message";
import { FormSection } from "@/components/admin/form-section";
import { PhoneNumber } from "@/components/admin/orders/order-badges";
import { SectionTabs } from "@/components/admin/orders/section-tabs";
import { CardSkeleton, TableSkeleton } from "@/components/admin/orders/skeletons";
import { firstParam, type AdminQuery } from "@/components/admin/query-string";
import { SearchForm } from "@/components/admin/search-form";
import { StatusBadge } from "@/components/admin/status-badge";
import { buttonStyles } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/session";
import { formatDateTime, formatPrice, formatRelative } from "@/lib/format";
import { siteConfig } from "@/lib/site-config";
import { listCustomers } from "@/models/fetchers/admin/customers";
import { countOrdersToAnonymize } from "@/models/fetchers/admin/orders";
import { listPhoneRules } from "@/models/fetchers/admin/phone-rules";

import { anonymizeOldDataAction, blockPhoneAction } from "./actions";

export const metadata: Metadata = { title: "Clients" };

const filtersSchema = z.object({
  q: z.string().trim().max(100).optional().catch(undefined),
  page: z.coerce.number().int().min(1).max(10_000).catch(1),
});

/**
 * /admin/clients — customers (one per phone number, there are no accounts): orders,
 * total spent, last order and the anti-abuse rule of the number (spec EF-36 / EF-39),
 * plus the personal data clean-up (spec 6.4).
 */
export default function ClientsPage({ searchParams }: PageProps<"/admin/clients">) {
  return (
    <>
      <AdminPageHeader
        title="Clients"
        description="Un client = un numéro de téléphone (les clients n'ont pas de compte). Données personnelles : réservées à l'équipe."
        breadcrumbs={[{ label: "Tableau de bord", href: "/admin" }, { label: "Clients" }]}
      />
      <SectionTabs label="Rubriques des clients" current={CLIENTS_PATH} tabs={CLIENTS_TABS} />
      <FlashMessage messages={CLIENTS_FLASH_MESSAGES} />
      <Suspense fallback={<TableSkeleton columns={7} />}>
        <CustomersList searchParams={searchParams} />
      </Suspense>
      <Suspense fallback={<CardSkeleton lines={3} className="mt-8" />}>
        <PersonalDataCard />
      </Suspense>
    </>
  );
}

async function CustomersList({ searchParams }: { searchParams: Promise<AdminQuery> }) {
  await requireAdmin();
  const query = await searchParams;
  const filters = filtersSchema.parse({ q: firstParam(query.q), page: firstParam(query.page) });

  const [customers, rules] = await Promise.all([listCustomers(filters), listPhoneRules()]);
  const ruleByPhone = new Map(rules.map((rule) => [rule.phone, rule]));
  const now = new Date(); // request time (after the session check)

  return (
    <>
      <div className="mb-4">
        <SearchForm basePath={CLIENTS_PATH} query={query} placeholder="Téléphone ou nom…" label="Rechercher un client" />
      </div>

      <DataTable caption="Clients regroupés par numéro de téléphone" tableClassName="min-w-[62rem]">
        <Thead>
          <Th>Client</Th>
          <Th>Téléphone</Th>
          <Th align="end">Commandes</Th>
          <Th align="end">Total dépensé</Th>
          <Th>Dernière commande</Th>
          <Th>Règle</Th>
          <Th align="end">
            <span className="sr-only">Actions</span>
          </Th>
        </Thead>
        <Tbody>
          {customers.items.length === 0 ? (
            <EmptyTableRow
              colSpan={7}
              icon={<Users />}
              title={filters.q ? "Aucun client ne correspond" : "Aucun client pour l'instant"}
              description={filters.q ? "Vérifiez le numéro ou le nom recherché." : "Les clients apparaissent ici après leur première commande."}
            />
          ) : (
            customers.items.map((customer) => {
              const rule = ruleByPhone.get(customer.phone);
              return (
                <Tr key={customer.phone}>
                  <Td className="max-w-[14rem] truncate font-semibold text-ink" title={customer.name}>
                    {customer.name}
                  </Td>
                  <Td>
                    <PhoneNumber phone={customer.phone} />
                  </Td>
                  <Td align="end" className="tabular">
                    {customer.orderCount}
                  </Td>
                  <Td align="end" className="font-semibold whitespace-nowrap text-ink tabular">
                    {formatPrice(customer.totalSpent)}
                  </Td>
                  <Td className="whitespace-nowrap">
                    <span className="block text-ink">{formatRelative(customer.lastOrderAt, "fr", now)}</span>
                    <span className="text-xs text-ink-subtle tabular">{formatDateTime(customer.lastOrderAt)}</span>
                  </Td>
                  <Td>
                    {customer.ruleType ? (
                      <StatusBadge kind="phoneRule" status={customer.ruleType} />
                    ) : rule?.isExpired ? (
                      <span className="text-xs text-ink-subtle">Règle expirée</span>
                    ) : (
                      <span className="text-ink-subtle">—</span>
                    )}
                  </Td>
                  <Td align="end">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/commandes?q=${customer.phone}`}
                        className={buttonStyles({ variant: "ghost", size: "icon-sm" })}
                        title="Voir ses commandes"
                      >
                        <ListOrdered aria-hidden="true" />
                        <span className="sr-only">Voir les commandes de {customer.name}</span>
                      </Link>
                      {rule ? (
                        <Link
                          href={`${RULES_PATH}/${rule.id}`}
                          className={buttonStyles({ variant: "ghost", size: "icon-sm" })}
                          title="Modifier la règle"
                        >
                          <ShieldCheck aria-hidden="true" />
                          <span className="sr-only">Modifier la règle du numéro de {customer.name}</span>
                        </Link>
                      ) : (
                        <ConfirmDeleteButton
                          action={blockPhoneAction.bind(null, customer.phone, "customers")}
                          label={`Bloquer le numéro de ${customer.name}`}
                          title="Bloquer ce numéro ?"
                          description={`Les prochaines commandes de ${customer.name} seront refusées jusqu'à ce que vous supprimiez le blocage (onglet « Règles téléphone »).`}
                          confirmLabel="Bloquer le numéro"
                          pendingLabel="Blocage…"
                          icon={<ShieldBan aria-hidden="true" />}
                          variant="ghost"
                          iconOnly
                        />
                      )}
                    </div>
                  </Td>
                </Tr>
              );
            })
          )}
        </Tbody>
      </DataTable>
      <AdminPagination basePath={CLIENTS_PATH} query={query} {...customers} />
    </>
  );
}

/** Retention of the delivery data (spec 6.4, law n° 2004-63) and the clean-up button. */
async function PersonalDataCard() {
  await requireAdmin();
  const days = siteConfig.deliveryDataRetentionDays;
  const pending = await countOrdersToAnonymize(days);

  return (
    <FormSection
      id="donnees-personnelles"
      className="mt-8"
      title="Données personnelles"
      description="Loi organique n° 2004-63 : les données de livraison ne sont gardées que le temps nécessaire."
      actions={
        <ConfirmDeleteButton
          action={anonymizeOldDataAction}
          label={`Anonymiser les commandes de plus de ${days} jours`}
          title="Anonymiser les anciennes commandes ?"
          description={`Le nom, le téléphone, l'adresse et la note des commandes livrées ou annulées depuis plus de ${days} jours seront effacés définitivement, ainsi que les tentatives refusées et compteurs de plus de ${days} jours. Les montants et les articles restent pour les statistiques.`}
          confirmLabel="Anonymiser"
          pendingLabel="Nettoyage…"
          icon={<Eraser aria-hidden="true" />}
        />
      }
    >
      <ul className="grid gap-3 text-sm leading-relaxed text-ink-muted sm:grid-cols-3">
        <li className="rounded-2xl bg-canvas/70 p-4 ring-1 ring-line">
          <p className="font-semibold text-ink">À quoi elles servent</p>
          Le nom, le téléphone et l&apos;adresse servent uniquement à livrer la commande et ne sont transmis qu&apos;au
          commerçant concerné.
        </li>
        <li className="rounded-2xl bg-canvas/70 p-4 ring-1 ring-line">
          <p className="font-semibold text-ink">Combien de temps</p>
          {days} jours après la livraison (ou l&apos;annulation). Ensuite, la commande devient « Client anonymisé » ; les
          montants restent pour les statistiques.
        </li>
        <li className="rounded-2xl bg-canvas/70 p-4 ring-1 ring-line">
          <p className="font-semibold text-ink">À faire maintenant</p>
          {pending > 0 ? (
            <span className="font-semibold text-amber-800">
              {pending} commande{pending > 1 ? "s" : ""} de plus de {days} jours contien{pending > 1 ? "nent" : "t"} encore
              des données personnelles.
            </span>
          ) : (
            <span className="font-semibold text-brand-700">Rien à anonymiser : tout est à jour.</span>
          )}
        </li>
      </ul>
    </FormSection>
  );
}
