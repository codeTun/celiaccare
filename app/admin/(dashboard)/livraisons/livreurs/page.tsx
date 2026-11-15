import { Pencil, Plus, Power, PowerOff, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { z } from "zod";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { DataTable, EmptyTableRow, Tbody, Td, Th, Thead, Tr } from "@/components/admin/data-table";
import { VEHICLE_ICONS, VEHICLE_LABELS } from "@/components/admin/delivery/delivery-labels";
import { DELIVERER_FLASH_MESSAGES, DELIVERERS_PATH, DELIVERY_TABS } from "@/components/admin/delivery/delivery-routes";
import { FilterTabs } from "@/components/admin/filter-tabs";
import { FlashMessage } from "@/components/admin/flash-message";
import { PhoneNumber } from "@/components/admin/orders/order-badges";
import { QuickActionButton } from "@/components/admin/orders/quick-action-button";
import { SectionTabs } from "@/components/admin/orders/section-tabs";
import { TableSkeleton } from "@/components/admin/orders/skeletons";
import { firstParam, type AdminQuery } from "@/components/admin/query-string";
import { SearchForm } from "@/components/admin/search-form";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/session";
import { normalizeSearch } from "@/lib/utils";
import { listDeliverers } from "@/models/fetchers/admin/deliverers";
import { ADMIN_PAGE_SIZE } from "@/types/admin-data";

import { deleteDelivererAction, toggleDelivererAction } from "./actions";

export const metadata: Metadata = { title: "Livreurs" };

const filtersSchema = z.object({
  statut: z.enum(["disponibles", "desactives"]).optional().catch(undefined),
  q: z.string().trim().max(100).optional().catch(undefined),
  page: z.coerce.number().int().min(1).max(1000).catch(1),
});

/**
 * /admin/livraisons/livreurs — the delivery people: contact, vehicle, covered zone,
 * availability and current workload.
 */
export default function DeliverersPage({ searchParams }: PageProps<"/admin/livraisons/livreurs">) {
  return (
    <>
      <AdminPageHeader
        title="Livreurs"
        description="Les personnes qui livrent les commandes. Un livreur désactivé garde son historique mais ne reçoit plus de commandes."
        breadcrumbs={[
          { label: "Tableau de bord", href: "/admin" },
          { label: "Livraisons", href: "/admin/livraisons" },
          { label: "Livreurs" },
        ]}
        actions={
          <Link href={`${DELIVERERS_PATH}/nouveau`} className={buttonStyles({ size: "sm" })}>
            <Plus aria-hidden="true" />
            Ajouter un livreur
          </Link>
        }
      />
      <SectionTabs label="Rubriques des livraisons" current={DELIVERERS_PATH} tabs={DELIVERY_TABS} />
      <FlashMessage messages={DELIVERER_FLASH_MESSAGES} />
      <Suspense fallback={<TableSkeleton columns={7} />}>
        <DeliverersList searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function DeliverersList({ searchParams }: { searchParams: Promise<AdminQuery> }) {
  await requireAdmin();
  const query = await searchParams;
  const filters = filtersSchema.parse({
    statut: firstParam(query.statut),
    q: firstParam(query.q),
    page: firstParam(query.page),
  });

  const deliverers = await listDeliverers();
  const activeCount = deliverers.filter((deliverer) => deliverer.isActive).length;

  // A small team: filtered and paginated here.
  const search = filters.q ? normalizeSearch(filters.q) : "";
  const digits = filters.q?.replace(/\D/g, "") ?? "";
  const filtered = deliverers.filter((deliverer) => {
    if (filters.statut === "disponibles" && !deliverer.isActive) return false;
    if (filters.statut === "desactives" && deliverer.isActive) return false;
    if (!search) return true;
    return (
      normalizeSearch(`${deliverer.name} ${deliverer.zone ?? ""}`).includes(search) ||
      (digits.length >= 2 && deliverer.phone.includes(digits))
    );
  });
  const pageCount = Math.max(1, Math.ceil(filtered.length / ADMIN_PAGE_SIZE));
  const page = Math.min(filters.page, pageCount);
  const rows = filtered.slice((page - 1) * ADMIN_PAGE_SIZE, page * ADMIN_PAGE_SIZE);
  const isFiltered = Boolean(filters.statut || filters.q);

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <FilterTabs
          basePath={DELIVERERS_PATH}
          query={query}
          param="statut"
          label="Filtrer les livreurs"
          tabs={[
            { value: "", label: "Tous", count: deliverers.length },
            { value: "disponibles", label: "Disponibles", count: activeCount },
            { value: "desactives", label: "Désactivés", count: deliverers.length - activeCount },
          ]}
        />
        <SearchForm basePath={DELIVERERS_PATH} query={query} placeholder="Nom, téléphone ou zone…" label="Rechercher un livreur" />
      </div>

      <DataTable caption="Liste des livreurs" tableClassName="min-w-[60rem]">
        <Thead>
          <Th>Livreur</Th>
          <Th>Téléphone</Th>
          <Th>Véhicule</Th>
          <Th>Zone</Th>
          <Th align="end">En cours</Th>
          <Th align="end">Livrées</Th>
          <Th>Statut</Th>
          <Th align="end">
            <span className="sr-only">Actions</span>
          </Th>
        </Thead>
        <Tbody>
          {rows.length === 0 ? (
            <EmptyTableRow
              colSpan={8}
              icon={<Users />}
              title={isFiltered ? "Aucun livreur ne correspond" : "Aucun livreur pour l'instant"}
              description={isFiltered ? "Modifiez la recherche ou le filtre." : "Ajoutez les livreurs pour leur confier les commandes."}
              action={
                isFiltered ? null : (
                  <Link href={`${DELIVERERS_PATH}/nouveau`} className={buttonStyles({ size: "sm" })}>
                    <Plus aria-hidden="true" />
                    Ajouter un livreur
                  </Link>
                )
              }
            />
          ) : (
            rows.map((deliverer) => {
              const VehicleIcon = VEHICLE_ICONS[deliverer.vehicle];
              return (
                <Tr key={deliverer.id}>
                  <Td className="max-w-[16rem]">
                    <Link
                      href={`${DELIVERERS_PATH}/${deliverer.id}`}
                      className="block truncate font-semibold text-ink hover:text-brand-700 hover:underline"
                    >
                      {deliverer.name}
                    </Link>
                    {deliverer.notes ? (
                      <span className="block truncate text-xs text-ink-subtle" title={deliverer.notes}>
                        {deliverer.notes}
                      </span>
                    ) : null}
                  </Td>
                  <Td>
                    <PhoneNumber phone={deliverer.phone} />
                  </Td>
                  <Td className="whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5">
                      {VehicleIcon ? <VehicleIcon className="size-4 text-ink-subtle" aria-hidden="true" /> : null}
                      {VEHICLE_LABELS[deliverer.vehicle] ?? deliverer.vehicle}
                    </span>
                  </Td>
                  <Td className="max-w-[14rem] truncate" title={deliverer.zone ?? undefined}>
                    {deliverer.zone ?? <span className="text-ink-subtle">—</span>}
                  </Td>
                  <Td align="end" className="tabular">
                    {deliverer.activeOrderCount > 0 ? (
                      <Badge tone="violet">{deliverer.activeOrderCount}</Badge>
                    ) : (
                      <span className="text-ink-subtle">0</span>
                    )}
                  </Td>
                  <Td align="end" className="tabular">
                    {deliverer.deliveredCount}
                  </Td>
                  <Td>
                    {deliverer.isActive ? <Badge tone="brand">Disponible</Badge> : <Badge tone="neutral">Désactivé</Badge>}
                  </Td>
                  <Td align="end">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`${DELIVERERS_PATH}/${deliverer.id}`}
                        className={buttonStyles({ variant: "ghost", size: "icon-sm" })}
                        title="Modifier"
                      >
                        <Pencil aria-hidden="true" />
                        <span className="sr-only">Modifier {deliverer.name}</span>
                      </Link>
                      <QuickActionButton
                        action={toggleDelivererAction.bind(null, deliverer.id, !deliverer.isActive)}
                        variant="ghost"
                        size="icon-sm"
                        title={deliverer.isActive ? "Désactiver" : "Rendre disponible"}
                        pendingLabel={<span className="sr-only">Mise à jour…</span>}
                        buttonClassName={deliverer.isActive ? "text-ink-muted" : "text-brand-700"}
                      >
                        {deliverer.isActive ? <PowerOff aria-hidden="true" /> : <Power aria-hidden="true" />}
                        <span className="sr-only">
                          {deliverer.isActive ? "Désactiver" : "Rendre disponible"} {deliverer.name}
                        </span>
                      </QuickActionButton>
                      <ConfirmDeleteButton
                        action={deleteDelivererAction.bind(null, deliverer.id)}
                        label={`Supprimer ${deliverer.name}`}
                        title={`Supprimer ${deliverer.name} ?`}
                        description={
                          deliverer.deliveredCount + deliverer.activeOrderCount > 0
                            ? "Ses commandes restent dans l'historique, sans livreur. Impossible pendant une livraison en cours. Pour une pause, désactivez-le plutôt."
                            : "Cette action est définitive."
                        }
                        iconOnly
                        variant="ghost"
                      />
                    </div>
                  </Td>
                </Tr>
              );
            })
          )}
        </Tbody>
      </DataTable>
      <AdminPagination
        basePath={DELIVERERS_PATH}
        query={query}
        page={page}
        pageCount={pageCount}
        total={filtered.length}
        pageSize={ADMIN_PAGE_SIZE}
      />
    </>
  );
}
