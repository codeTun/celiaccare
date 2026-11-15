import { Eye, ShoppingBag, Truck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { z } from "zod";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { DataTable, EmptyTableRow, Tbody, Td, Th, Thead, Tr } from "@/components/admin/data-table";
import { FilterTabs } from "@/components/admin/filter-tabs";
import { OrderTypeBadge, PhoneNumber } from "@/components/admin/orders/order-badges";
import { ORDER_STATUS_TAB_LABELS, ORDER_TYPE_STYLES } from "@/components/admin/orders/order-labels";
import { TableSkeleton } from "@/components/admin/orders/skeletons";
import { firstParam, type AdminQuery } from "@/components/admin/query-string";
import { SearchForm } from "@/components/admin/search-form";
import { StatusBadge } from "@/components/admin/status-badge";
import { buttonStyles } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/session";
import { formatDateTime, formatPrice, formatRelative } from "@/lib/format";
import { countOrdersByStatus, listOrders } from "@/models/fetchers/admin/orders";
import { ORDER_STATUSES, ORDER_TYPES } from "@/types";

export const metadata: Metadata = { title: "Commandes" };

const ORDERS_PATH = "/admin/commandes";

/** ?status=…&type=…&q=…&page=… — anything invalid is simply ignored. */
const filtersSchema = z.object({
  status: z.enum(ORDER_STATUSES).optional().catch(undefined),
  type: z.enum(ORDER_TYPES).optional().catch(undefined),
  q: z.string().trim().max(100).optional().catch(undefined),
  page: z.coerce.number().int().min(1).max(10_000).catch(1),
});

/**
 * /admin/commandes — every customer order, newest first: filters by status and type,
 * search by reference / phone / name, 20 per page. Personal data: admin only.
 */
export default function OrdersPage({ searchParams }: PageProps<"/admin/commandes">) {
  return (
    <>
      <AdminPageHeader
        title="Commandes"
        description="Toutes les commandes passées sur le site (épicerie et restaurants partenaires). Ouvrez une commande pour la confirmer, la suivre et assigner un livreur."
        breadcrumbs={[{ label: "Tableau de bord", href: "/admin" }, { label: "Commandes" }]}
        actions={
          <Link href="/admin/livraisons" className={buttonStyles({ variant: "outline", size: "sm" })}>
            <Truck aria-hidden="true" />
            Livraisons en cours
          </Link>
        }
      />
      <Suspense fallback={<TableSkeleton columns={8} />}>
        <OrdersList searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function OrdersList({ searchParams }: { searchParams: Promise<AdminQuery> }) {
  await requireAdmin();
  const query = await searchParams;
  const filters = filtersSchema.parse({
    status: firstParam(query.status),
    type: firstParam(query.type),
    q: firstParam(query.q),
    page: firstParam(query.page),
  });

  const [orders, counts] = await Promise.all([
    listOrders(filters),
    countOrdersByStatus({ type: filters.type, q: filters.q }),
  ]);
  const now = new Date(); // request time (after the session check)
  const isFiltered = Boolean(filters.status || filters.type || filters.q);

  return (
    <>
      <FilterTabs
        basePath={ORDERS_PATH}
        query={query}
        label="Filtrer par statut"
        tabs={[
          { value: "", label: "Toutes", count: counts.all },
          ...ORDER_STATUSES.map((status) => ({ value: status, label: ORDER_STATUS_TAB_LABELS[status], count: counts[status] })),
        ]}
      />
      <div className="mt-3 mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SearchForm basePath={ORDERS_PATH} query={query} placeholder="Référence, téléphone ou nom…" label="Rechercher une commande" />
        <FilterTabs
          basePath={ORDERS_PATH}
          query={query}
          param="type"
          label="Filtrer par type de commande"
          tabs={[
            { value: "", label: "Tous les types" },
            ...ORDER_TYPES.map((type) => ({ value: type, label: ORDER_TYPE_STYLES[type].label })),
          ]}
        />
      </div>

      <DataTable caption="Liste des commandes" tableClassName="min-w-[72rem]">
        <Thead>
          <Th>Référence</Th>
          <Th>Date</Th>
          <Th>Client</Th>
          <Th>Téléphone</Th>
          <Th>Gouvernorat</Th>
          <Th>Type</Th>
          <Th align="end">Articles</Th>
          <Th align="end">Total</Th>
          <Th>Livreur</Th>
          <Th>Statut</Th>
          <Th align="end">
            <span className="sr-only">Actions</span>
          </Th>
        </Thead>
        <Tbody>
          {orders.items.length === 0 ? (
            <EmptyTableRow
              colSpan={11}
              icon={<ShoppingBag />}
              title={isFiltered ? "Aucune commande ne correspond" : "Aucune commande pour l'instant"}
              description={
                isFiltered
                  ? "Modifiez la recherche ou les filtres."
                  : "Les commandes passées sur le site apparaîtront ici."
              }
              action={
                isFiltered ? (
                  <Link href={ORDERS_PATH} className={buttonStyles({ variant: "outline", size: "sm" })}>
                    Effacer les filtres
                  </Link>
                ) : null
              }
            />
          ) : (
            orders.items.map((order) => (
              <Tr key={order.id}>
                <Td>
                  <Link
                    href={`${ORDERS_PATH}/${order.id}`}
                    className="font-mono text-[13px] font-semibold whitespace-nowrap text-brand-700 hover:underline"
                  >
                    {order.reference}
                  </Link>
                </Td>
                <Td className="whitespace-nowrap">
                  <span className="block text-ink">{formatRelative(order.createdAt, "fr", now)}</span>
                  <span className="text-xs text-ink-subtle tabular">{formatDateTime(order.createdAt)}</span>
                </Td>
                <Td className="max-w-[12rem] truncate font-medium text-ink" title={order.customerName}>
                  {order.customerName}
                </Td>
                <Td>
                  <PhoneNumber phone={order.phone} />
                </Td>
                <Td className="whitespace-nowrap">
                  <span className="block text-ink">{order.governorate}</span>
                  <span className="text-xs text-ink-subtle">{order.city}</span>
                </Td>
                <Td>
                  <OrderTypeBadge type={order.type} />
                  {order.restaurantName ? (
                    <span className="mt-0.5 block max-w-[10rem] truncate text-xs text-ink-subtle" title={order.restaurantName}>
                      {order.restaurantName}
                    </span>
                  ) : null}
                </Td>
                <Td align="end" className="tabular">
                  {order.itemCount}
                </Td>
                <Td align="end" className="font-semibold whitespace-nowrap text-ink tabular">
                  {formatPrice(order.total)}
                </Td>
                <Td className="max-w-[9rem] truncate">
                  {order.delivererName ?? <span className="text-ink-subtle">—</span>}
                </Td>
                <Td>
                  <StatusBadge kind="order" status={order.status} />
                </Td>
                <Td align="end">
                  <Link
                    href={`${ORDERS_PATH}/${order.id}`}
                    className={buttonStyles({ variant: "ghost", size: "icon-sm" })}
                    title="Voir la commande"
                  >
                    <Eye aria-hidden="true" />
                    <span className="sr-only">Voir la commande {order.reference}</span>
                  </Link>
                </Td>
              </Tr>
            ))
          )}
        </Tbody>
      </DataTable>
      <AdminPagination basePath={ORDERS_PATH} query={query} {...orders} />
    </>
  );
}
