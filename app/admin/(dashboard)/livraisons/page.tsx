import { Hourglass, PackageCheck, Truck, UserX } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ActiveDeliveryCard } from "@/components/admin/delivery/active-delivery-card";
import { VEHICLE_LABELS } from "@/components/admin/delivery/delivery-labels";
import { DELIVERERS_PATH, DELIVERIES_PATH, DELIVERY_TABS } from "@/components/admin/delivery/delivery-routes";
import { FlashMessage } from "@/components/admin/flash-message";
import { delivererOptions } from "@/components/admin/orders/deliverer-options";
import { PhoneNumber } from "@/components/admin/orders/order-badges";
import { nextForwardStatus, ORDER_FLASH_MESSAGES, ORDER_STATUS_TAB_LABELS } from "@/components/admin/orders/order-labels";
import { SectionTabs } from "@/components/admin/orders/section-tabs";
import { CardSkeleton } from "@/components/admin/orders/skeletons";
import { StatCard } from "@/components/admin/stat-card";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { requireAdmin } from "@/lib/auth/session";
import { cn } from "@/lib/utils";
import { listDeliverers } from "@/models/fetchers/admin/deliverers";
import { countOrdersByStatus, listActiveDeliveries } from "@/models/fetchers/admin/orders";
import { ACTIVE_ORDER_STATUSES, type AdminActiveDelivery, type AdminDelivererRow } from "@/types/admin-data";

import { assignDelivererAction, updateOrderStatusAction } from "../commandes/actions";

export const metadata: Metadata = { title: "Livraisons en cours" };

/** Column colors of the board (same family as the status badges). */
const COLUMN_ACCENTS: Record<(typeof ACTIVE_ORDER_STATUSES)[number], string> = {
  CONFIRMED: "bg-sky-500",
  PREPARING: "bg-sky-700",
  OUT_FOR_DELIVERY: "bg-violet-500",
};

/**
 * /admin/livraisons — the delivery board: accepted orders not delivered yet, in three
 * columns (Confirmées → En préparation → En livraison), with quick status changes and
 * deliverer assignment. Zones and deliverers have their own tabs.
 */
export default function DeliveriesBoardPage() {
  return (
    <>
      <AdminPageHeader
        title="Livraisons en cours"
        description="Les commandes acceptées qui ne sont pas encore livrées. Assignez un livreur et faites avancer chaque commande."
        breadcrumbs={[{ label: "Tableau de bord", href: "/admin" }, { label: "Livraisons" }]}
      />
      <SectionTabs label="Rubriques des livraisons" current={DELIVERIES_PATH} tabs={DELIVERY_TABS} />
      <FlashMessage messages={ORDER_FLASH_MESSAGES} />
      <Suspense fallback={<BoardSkeleton />}>
        <DeliveryBoard />
      </Suspense>
    </>
  );
}

async function DeliveryBoard() {
  await requireAdmin();
  const [deliveries, deliverers, counts] = await Promise.all([
    listActiveDeliveries(),
    listDeliverers(),
    countOrdersByStatus(),
  ]);
  const now = new Date(); // request time (after the session check)

  const unassigned = deliveries.filter((delivery) => !delivery.deliverer).length;
  const byStatus = (status: AdminActiveDelivery["status"]) => deliveries.filter((delivery) => delivery.status === status);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="À confirmer"
          value={counts.PENDING}
          icon={<Hourglass />}
          tone="amber"
          hint="Commandes en attente"
          href="/admin/commandes?status=PENDING"
        />
        <StatCard label="À préparer" value={counts.CONFIRMED + counts.PREPARING} icon={<PackageCheck />} tone="sky" hint="Confirmées ou en préparation" />
        <StatCard label="Sur la route" value={counts.OUT_FOR_DELIVERY} icon={<Truck />} tone="violet" hint="En cours de livraison" />
        <StatCard
          label="Sans livreur"
          value={unassigned}
          icon={<UserX />}
          tone={unassigned > 0 ? "red" : "neutral"}
          hint={unassigned > 0 ? "À assigner rapidement" : "Toutes les commandes ont un livreur"}
        />
      </div>

      {deliverers.every((deliverer) => !deliverer.isActive) ? (
        <Alert tone="warning" className="mt-6">
          Aucun livreur disponible.{" "}
          <Link href={`${DELIVERERS_PATH}/nouveau`} className="font-semibold underline">
            Ajoutez un livreur
          </Link>{" "}
          pour pouvoir lui confier des commandes.
        </Alert>
      ) : null}

      <div className="mt-6 grid items-start gap-5 lg:grid-cols-3">
        {ACTIVE_ORDER_STATUSES.map((status) => {
          const column = byStatus(status);
          return (
            <section
              key={status}
              aria-labelledby={`column-${status}`}
              className="rounded-[var(--radius-card)] border border-line bg-canvas/70 p-3"
            >
              <h2 id={`column-${status}`} className="mb-3 flex items-center justify-between gap-2 px-1 text-sm font-bold text-ink">
                <span className="inline-flex items-center gap-2">
                  <span className={cn("size-2.5 rounded-full", COLUMN_ACCENTS[status])} aria-hidden="true" />
                  {ORDER_STATUS_TAB_LABELS[status]}
                </span>
                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-ink-muted ring-1 ring-line tabular">
                  {column.length}
                </span>
              </h2>
              {column.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-line-strong px-4 py-8 text-center text-sm text-ink-subtle">
                  Aucune commande à cette étape.
                </p>
              ) : (
                <div className="space-y-3">
                  {column.map((delivery) => {
                    const next = nextForwardStatus(delivery.status);
                    return (
                      <ActiveDeliveryCard
                        key={delivery.id}
                        delivery={delivery}
                        now={now}
                        nextStatus={next}
                        statusAction={updateOrderStatusAction.bind(null, delivery.id, "board")}
                        assignAction={assignDelivererAction.bind(null, delivery.id, "board")}
                        delivererOptions={delivererOptions(deliverers, delivery.deliverer?.id ?? null)}
                      />
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>

      <DeliverersWorkload deliverers={deliverers} />
    </>
  );
}

/** Who is available and how many orders each one carries right now. */
function DeliverersWorkload({ deliverers }: { deliverers: AdminDelivererRow[] }) {
  const available = deliverers.filter((deliverer) => deliverer.isActive);
  return (
    <section aria-labelledby="workload-title" className="mt-8">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 id="workload-title" className="text-lg font-bold text-ink">
            Livreurs disponibles
          </h2>
          <p className="text-sm text-ink-muted">Leur nombre de commandes en cours, pour répartir le travail.</p>
        </div>
        <Link href={DELIVERERS_PATH} className="shrink-0 text-sm font-semibold text-brand-700 hover:underline">
          Gérer les livreurs
        </Link>
      </div>
      {available.length === 0 ? (
        <p className="text-sm text-ink-muted">Aucun livreur disponible.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {available.map((deliverer) => (
            <li key={deliverer.id} className="rounded-2xl border border-line bg-white p-3 shadow-soft">
              <div className="flex items-start justify-between gap-2">
                <p className="truncate font-semibold text-ink">{deliverer.name}</p>
                <Badge tone={deliverer.activeOrderCount > 0 ? "violet" : "brand"}>
                  {deliverer.activeOrderCount > 0 ? `${deliverer.activeOrderCount} en cours` : "Libre"}
                </Badge>
              </div>
              <p className="mt-0.5 truncate text-xs text-ink-muted" title={deliverer.zone ?? undefined}>
                {VEHICLE_LABELS[deliverer.vehicle] ?? deliverer.vehicle}
                {deliverer.zone ? ` · ${deliverer.zone}` : ""}
              </p>
              <p className="mt-1 text-xs">
                <PhoneNumber phone={deliverer.phone} />
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function BoardSkeleton() {
  return (
    <div aria-busy="true">
      <span className="sr-only" role="status">
        Chargement des livraisons…
      </span>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className="rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-soft">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-3 h-8 w-16" />
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        {[0, 1, 2].map((index) => (
          <div key={index} className="space-y-3 rounded-[var(--radius-card)] border border-line bg-canvas/70 p-3">
            <Skeleton className="h-4 w-32" />
            <CardSkeleton lines={3} />
            <CardSkeleton lines={3} />
          </div>
        ))}
      </div>
    </div>
  );
}
