import { MapPinned, Pencil, Plus, Power, PowerOff } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { z } from "zod";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { DataTable, EmptyTableRow, Tbody, Td, Th, Thead, Tr } from "@/components/admin/data-table";
import { DELIVERY_TABS, ZONE_FLASH_MESSAGES, ZONES_PATH } from "@/components/admin/delivery/delivery-routes";
import { FilterTabs } from "@/components/admin/filter-tabs";
import { FlashMessage } from "@/components/admin/flash-message";
import { QuickActionButton } from "@/components/admin/orders/quick-action-button";
import { SectionTabs } from "@/components/admin/orders/section-tabs";
import { TableSkeleton } from "@/components/admin/orders/skeletons";
import { firstParam, type AdminQuery } from "@/components/admin/query-string";
import { SearchForm } from "@/components/admin/search-form";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/session";
import { GOVERNORATES } from "@/lib/tunisia";
import { normalizeSearch } from "@/lib/utils";
import { listDeliveryZones } from "@/models/fetchers/admin/delivery-zones";
import { ADMIN_PAGE_SIZE } from "@/types/admin-data";

import { deleteDeliveryZoneAction, toggleDeliveryZoneAction } from "./actions";

export const metadata: Metadata = { title: "Zones de livraison" };

const filtersSchema = z.object({
  statut: z.enum(["actives", "inactives"]).optional().catch(undefined),
  q: z.string().trim().max(100).optional().catch(undefined),
  page: z.coerce.number().int().min(1).max(1000).catch(1),
});

/**
 * /admin/livraisons/zones — the governorates we deliver to and their delay (one zone per
 * governorate). Delivery is free for the customer everywhere. Customers of a governorate
 * without an open zone cannot order.
 */
export default function DeliveryZonesPage({ searchParams }: PageProps<"/admin/livraisons/zones">) {
  return (
    <>
      <AdminPageHeader
        title="Zones de livraison"
        description="Gouvernorats desservis et délais annoncés au client avant sa commande. La livraison est gratuite pour le client, partout."
        breadcrumbs={[
          { label: "Tableau de bord", href: "/admin" },
          { label: "Livraisons", href: "/admin/livraisons" },
          { label: "Zones" },
        ]}
        actions={
          <Link href={`${ZONES_PATH}/nouvelle`} className={buttonStyles({ size: "sm" })}>
            <Plus aria-hidden="true" />
            Ajouter une zone
          </Link>
        }
      />
      <SectionTabs label="Rubriques des livraisons" current={ZONES_PATH} tabs={DELIVERY_TABS} />
      <FlashMessage messages={ZONE_FLASH_MESSAGES} />
      <Suspense fallback={<TableSkeleton columns={6} />}>
        <ZonesList searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function ZonesList({ searchParams }: { searchParams: Promise<AdminQuery> }) {
  await requireAdmin();
  const query = await searchParams;
  const filters = filtersSchema.parse({
    statut: firstParam(query.statut),
    q: firstParam(query.q),
    page: firstParam(query.page),
  });

  const zones = await listDeliveryZones();
  const covered = new Set(zones.map((zone) => zone.governorate));
  const uncovered = GOVERNORATES.map((g) => g.value).filter((governorate) => !covered.has(governorate));
  const activeCount = zones.filter((zone) => zone.isActive).length;

  // 24 rows at most: filtered and paginated here.
  const search = filters.q ? normalizeSearch(filters.q) : "";
  const filtered = zones.filter((zone) => {
    if (filters.statut === "actives" && !zone.isActive) return false;
    if (filters.statut === "inactives" && zone.isActive) return false;
    return !search || normalizeSearch(zone.governorate).includes(search);
  });
  const pageCount = Math.max(1, Math.ceil(filtered.length / ADMIN_PAGE_SIZE));
  const page = Math.min(filters.page, pageCount);
  const rows = filtered.slice((page - 1) * ADMIN_PAGE_SIZE, page * ADMIN_PAGE_SIZE);
  const isFiltered = Boolean(filters.statut || filters.q);

  return (
    <>
      {uncovered.length > 0 ? (
        <Alert tone="warning" title={`${uncovered.length} gouvernorat(s) sans zone de livraison`} className="mb-4">
          Les clients de ces gouvernorats ne peuvent pas commander : {uncovered.join(", ")}.
        </Alert>
      ) : null}

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <FilterTabs
          basePath={ZONES_PATH}
          query={query}
          param="statut"
          label="Filtrer les zones"
          tabs={[
            { value: "", label: "Toutes", count: zones.length },
            { value: "actives", label: "Ouvertes", count: activeCount },
            { value: "inactives", label: "Fermées", count: zones.length - activeCount },
          ]}
        />
        <SearchForm basePath={ZONES_PATH} query={query} placeholder="Gouvernorat…" label="Rechercher une zone" />
      </div>

      <DataTable caption="Zones de livraison par gouvernorat" tableClassName="min-w-[44rem]">
        <Thead>
          <Th>Gouvernorat</Th>
          <Th>Livraison</Th>
          <Th>Délai annoncé</Th>
          <Th align="end">Commandes</Th>
          <Th>Statut</Th>
          <Th align="end">
            <span className="sr-only">Actions</span>
          </Th>
        </Thead>
        <Tbody>
          {rows.length === 0 ? (
            <EmptyTableRow
              colSpan={6}
              icon={<MapPinned />}
              title={isFiltered ? "Aucune zone ne correspond" : "Aucune zone de livraison"}
              description={
                isFiltered ? "Modifiez la recherche ou le filtre." : "Ajoutez une zone pour ouvrir la livraison dans un gouvernorat."
              }
              action={
                isFiltered ? null : (
                  <Link href={`${ZONES_PATH}/nouvelle`} className={buttonStyles({ size: "sm" })}>
                    <Plus aria-hidden="true" />
                    Ajouter une zone
                  </Link>
                )
              }
            />
          ) : (
            rows.map((zone) => (
              <Tr key={zone.id}>
                <Td className="font-semibold text-ink">
                  <Link href={`${ZONES_PATH}/${zone.id}`} className="hover:text-brand-700 hover:underline">
                    {zone.governorate}
                  </Link>
                </Td>
                <Td>
                  <Badge tone="brand">Gratuite</Badge>
                </Td>
                <Td className="whitespace-nowrap">{zone.delay}</Td>
                <Td align="end" className="tabular">
                  {zone.orderCount}
                </Td>
                <Td>{zone.isActive ? <Badge tone="brand">Ouverte</Badge> : <Badge tone="neutral">Fermée</Badge>}</Td>
                <Td align="end">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`${ZONES_PATH}/${zone.id}`}
                      className={buttonStyles({ variant: "ghost", size: "icon-sm" })}
                      title="Modifier"
                    >
                      <Pencil aria-hidden="true" />
                      <span className="sr-only">Modifier la zone {zone.governorate}</span>
                    </Link>
                    <QuickActionButton
                      action={toggleDeliveryZoneAction.bind(null, zone.id, !zone.isActive)}
                      variant="ghost"
                      size="icon-sm"
                      title={zone.isActive ? "Fermer la livraison" : "Ouvrir la livraison"}
                      pendingLabel={<span className="sr-only">Mise à jour…</span>}
                      buttonClassName={zone.isActive ? "text-ink-muted" : "text-brand-700"}
                    >
                      {zone.isActive ? <PowerOff aria-hidden="true" /> : <Power aria-hidden="true" />}
                      <span className="sr-only">
                        {zone.isActive ? "Fermer" : "Ouvrir"} la livraison à {zone.governorate}
                      </span>
                    </QuickActionButton>
                    <ConfirmDeleteButton
                      action={deleteDeliveryZoneAction.bind(null, zone.id)}
                      label={`Supprimer la zone ${zone.governorate}`}
                      title={`Supprimer la zone « ${zone.governorate} » ?`}
                      description={
                        zone.orderCount > 0
                          ? `Les ${zone.orderCount} commande(s) livrées dans cette zone gardent leurs montants. Pour suspendre la livraison sans perdre les réglages, fermez plutôt la zone.`
                          : "Les clients de ce gouvernorat ne pourront plus commander. Cette action est définitive."
                      }
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
        basePath={ZONES_PATH}
        query={query}
        page={page}
        pageCount={pageCount}
        total={filtered.length}
        pageSize={ADMIN_PAGE_SIZE}
      />
    </>
  );
}
