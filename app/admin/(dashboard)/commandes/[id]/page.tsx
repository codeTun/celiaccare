import { Ban, ExternalLink, ShieldCheck, UserRound } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, type ReactNode } from "react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { DataTable, Tbody, Td, Th, Thead, Tr } from "@/components/admin/data-table";
import { VEHICLE_LABELS } from "@/components/admin/delivery/delivery-labels";
import { FlashMessage } from "@/components/admin/flash-message";
import { FormSection } from "@/components/admin/form-section";
import { AssignDelivererForm } from "@/components/admin/orders/assign-deliverer-form";
import { delivererOptions } from "@/components/admin/orders/deliverer-options";
import { DeliverySlip } from "@/components/admin/orders/delivery-slip";
import { OrderTypeBadge, PhoneActions, PhoneNumber } from "@/components/admin/orders/order-badges";
import { ORDER_FLASH_MESSAGES, PAYMENT_METHOD_LABELS } from "@/components/admin/orders/order-labels";
import { OrderStatusActions, type ForwardStatus } from "@/components/admin/orders/order-status-actions";
import { OrderTimeline } from "@/components/admin/orders/order-timeline";
import { PrintSlipButton } from "@/components/admin/orders/print-slip-button";
import { OrderDetailSkeleton } from "@/components/admin/orders/skeletons";
import { StatusBadge } from "@/components/admin/status-badge";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/auth/session";
import { formatDateTime, formatPrice, formatRelative } from "@/lib/format";
import { siteConfig } from "@/lib/site-config";
import { idSchema } from "@/lib/validators";
import { listDeliverers } from "@/models/fetchers/admin/deliverers";
import { getOrderDetail } from "@/models/fetchers/admin/orders";
import type { AdminDelivererRow, AdminOrderDetail } from "@/types/admin-data";

import { assignDelivererAction, updateOrderStatusAction } from "../actions";

export const metadata: Metadata = { title: "Détail de la commande" };

/**
 * /admin/commandes/[id] — one order: items, amounts, customer and delivery address
 * (personal data, admin only), status timeline, next-status buttons, deliverer and
 * a printable delivery slip.
 */
export default function OrderDetailPage({ params }: PageProps<"/admin/commandes/[id]">) {
  return (
    <>
      <AdminPageHeader
        title="Détail de la commande"
        description="Suivez la commande étape par étape, assignez un livreur et imprimez le bon de livraison."
        breadcrumbs={[
          { label: "Tableau de bord", href: "/admin" },
          { label: "Commandes", href: "/admin/commandes" },
          { label: "Détail" },
        ]}
      />
      <FlashMessage messages={ORDER_FLASH_MESSAGES} />
      <Suspense fallback={<OrderDetailSkeleton />}>
        <OrderDetail params={params} />
      </Suspense>
    </>
  );
}

async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const parsedId = idSchema.safeParse((await params).id);
  if (!parsedId.success) notFound();

  const [order, deliverers] = await Promise.all([getOrderDetail(parsedId.data), listDeliverers()]);
  if (!order) notFound();
  const now = new Date(); // request time (after the session check)

  return (
    <>
      <OrderSummary order={order} now={now} />

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-3">
        <div className="min-w-0 space-y-6 lg:col-span-2">
          <OrderItems order={order} />
          <FormSection title="Suivi de la commande" description="Les étapes de la commande et leurs dates.">
            <OrderTimeline order={order} />
          </FormSection>
        </div>

        <div className="min-w-0 space-y-6">
          <CustomerCard order={order} />
          <DelivererCard order={order} deliverers={deliverers} />
          {order.restaurant ? (
            <FormSection title="Restaurant partenaire" description="Le restaurant qui prépare cette commande.">
              <p className="font-semibold text-ink">{order.restaurant.name}</p>
              <p className="mt-1 text-sm text-ink-muted">
                <PhoneNumber phone={order.restaurant.phone} />
              </p>
              <Link
                href={`/admin/restaurants/${order.restaurant.id}`}
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline"
              >
                Fiche du restaurant
                <ExternalLink className="size-3.5" aria-hidden="true" />
              </Link>
            </FormSection>
          ) : null}
        </div>
      </div>

      {canPrintSlip(order) ? <DeliverySlip order={order} /> : null}
    </>
  );
}

/* --------------------------------------------------------------------------
   Summary bar: reference, status, next-status buttons
   -------------------------------------------------------------------------- */

/** No delivery slip for a cancelled order, nor once its address was erased (retention rule). */
function canPrintSlip(order: AdminOrderDetail) {
  return order.status !== "CANCELLED" && !order.isAnonymized;
}

function OrderSummary({ order, now }: { order: AdminOrderDetail; now: Date }) {
  const forward = order.nextStatuses.filter(
    (status): status is ForwardStatus => status !== "CANCELLED" && status !== "PENDING",
  );
  const canCancel = order.nextStatuses.includes("CANCELLED");

  return (
    <section
      aria-label={`Commande ${order.reference}`}
      className="rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-soft sm:p-6"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="font-mono text-2xl font-extrabold text-ink">{order.reference}</h2>
            <StatusBadge kind="order" status={order.status} />
            <OrderTypeBadge type={order.type} />
          </div>
          <p className="mt-1.5 text-sm text-ink-muted">
            Passée {formatRelative(order.createdAt, "fr", now)} · <span className="tabular">{formatDateTime(order.createdAt)}</span>
            {" · "}
            <span className="font-semibold text-ink tabular">{formatPrice(order.total)}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-start gap-2 lg:max-w-xl lg:justify-end">
          <OrderStatusActions action={updateOrderStatusAction.bind(null, order.id, "detail")} statuses={forward} />
          {canCancel ? (
            <ConfirmDeleteButton
              action={updateOrderStatusAction.bind(null, order.id, "detail")}
              hiddenFields={{ status: "CANCELLED" }}
              label="Annuler la commande"
              title={`Annuler la commande ${order.reference} ?`}
              description="La commande passe au statut « Annulée » et ne peut plus être reprise. Prévenez le client et le commerçant."
              confirmLabel="Annuler la commande"
              cancelLabel="Retour"
              pendingLabel="Annulation…"
              icon={<Ban aria-hidden="true" />}
            />
          ) : null}
          {canPrintSlip(order) ? <PrintSlipButton /> : null}
        </div>
      </div>
      {forward.length === 0 && !canCancel ? (
        <p className="mt-4 text-sm text-ink-muted">
          Commande terminée : son statut ne peut plus changer.
        </p>
      ) : null}
    </section>
  );
}

/* --------------------------------------------------------------------------
   Items and amounts
   -------------------------------------------------------------------------- */

function OrderItems({ order }: { order: AdminOrderDetail }) {
  const articleCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  return (
    <section aria-labelledby="order-items-title">
      <h2 id="order-items-title" className="mb-3 text-lg font-bold text-ink">
        Articles <span className="text-sm font-semibold text-ink-subtle">({articleCount})</span>
      </h2>
      <DataTable caption="Articles de la commande (noms et prix au moment de la commande)" stickyHeader={false} tableClassName="min-w-[36rem]">
        <Thead>
          <Th>Article</Th>
          <Th align="end">Prix unitaire</Th>
          <Th align="end">Quantité</Th>
          <Th align="end">Total</Th>
        </Thead>
        <Tbody>
          {order.items.map((item) => (
            <Tr key={item.id}>
              <Td>
                <span className="block font-semibold text-ink">
                  {item.productSlug && item.productId ? (
                    <Link href={`/admin/produits/${item.productId}`} className="hover:text-brand-700 hover:underline">
                      {item.name}
                    </Link>
                  ) : (
                    item.name
                  )}
                </span>
                <span className="text-xs text-ink-subtle">
                  {item.kind === "DISH" ? "Plat" : "Produit"} · {item.merchantName}
                  {item.productId === null && item.dishId === null ? " · retiré du catalogue depuis" : ""}
                </span>
              </Td>
              <Td align="end" className="whitespace-nowrap tabular">
                {formatPrice(item.unitPrice)}
              </Td>
              <Td align="end" className="tabular">
                × {item.quantity}
              </Td>
              <Td align="end" className="font-semibold whitespace-nowrap text-ink tabular">
                {formatPrice(item.lineTotal)}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </DataTable>

      <dl className="mt-3 ms-auto w-full max-w-xs space-y-1.5 rounded-2xl border border-line bg-white p-4 text-sm shadow-soft">
        <div className="flex justify-between gap-4">
          <dt className="text-ink-muted">Sous-total</dt>
          <dd className="tabular">{formatPrice(order.subtotal)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-ink-muted">Livraison{order.zone ? ` (${order.zone.governorate})` : ""}</dt>
          {/* Free since the free-delivery decision; an older order keeps the fee it was charged. */}
          <dd className="tabular">
            {order.deliveryFee === 0 ? (
              <span className="font-semibold text-brand-700">Gratuite</span>
            ) : (
              <span title="Commande passée avant la livraison gratuite">{formatPrice(order.deliveryFee)}</span>
            )}
          </dd>
        </div>
        <div className="flex justify-between gap-4 border-t border-line pt-2 text-base font-extrabold text-ink">
          <dt>Total</dt>
          <dd className="tabular">{formatPrice(order.total)}</dd>
        </div>
      </dl>
    </section>
  );
}

/* --------------------------------------------------------------------------
   Customer (personal data) and deliverer
   -------------------------------------------------------------------------- */

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-bold tracking-[0.08em] text-ink-subtle uppercase">{label}</dt>
      <dd className="mt-0.5 text-sm text-ink">{children}</dd>
    </div>
  );
}

function CustomerCard({ order }: { order: AdminOrderDetail }) {
  return (
    <FormSection
      title="Client et livraison"
      description="Données personnelles : elles servent uniquement à livrer cette commande."
      actions={
        <Badge tone="neutral">
          <ShieldCheck aria-hidden="true" />
          Confidentiel
        </Badge>
      }
    >
      {order.isAnonymized ? (
        <Alert tone="info">
          Les données personnelles de cette commande ont été effacées ({siteConfig.deliveryDataRetentionDays} jours après
          la livraison, loi n° 2004-63). Les montants restent pour les statistiques.
        </Alert>
      ) : (
        <div className="space-y-4">
          <dl className="space-y-3">
            <InfoRow label="Client">
              <span className="inline-flex items-center gap-1.5 font-semibold">
                <UserRound className="size-4 text-ink-subtle" aria-hidden="true" />
                {order.customerName}
              </span>
            </InfoRow>
            <InfoRow label="Téléphone">
              <PhoneNumber phone={order.phone} className="font-semibold" />
            </InfoRow>
            <InfoRow label="Adresse">
              <span className="block">{order.street}</span>
              {order.addressDetails ? <span className="block text-ink-muted">{order.addressDetails}</span> : null}
              <span className="block">
                {order.city}, {order.governorate}
              </span>
            </InfoRow>
            {order.zone ? (
              <InfoRow label="Zone de livraison">
                {order.zone.governorate} · délai annoncé {order.zone.delay}
              </InfoRow>
            ) : null}
            <InfoRow label="Paiement">{PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod}</InfoRow>
            {order.note ? (
              <InfoRow label="Note du client">
                <span className="block rounded-xl bg-saffron-50 px-3 py-2 whitespace-pre-line text-ink ring-1 ring-saffron-100">
                  {order.note}
                </span>
              </InfoRow>
            ) : null}
          </dl>
          <PhoneActions phone={order.phone} />
          <Link
            href={`/admin/commandes?q=${order.phone}`}
            className="inline-flex text-sm font-semibold text-brand-700 hover:underline"
          >
            Autres commandes de ce numéro
          </Link>
        </div>
      )}
    </FormSection>
  );
}

function DelivererCard({ order, deliverers }: { order: AdminOrderDetail; deliverers: AdminDelivererRow[] }) {
  const isClosed = order.status === "DELIVERED" || order.status === "CANCELLED";
  const current = order.deliverer;
  return (
    <FormSection title="Livreur" description={isClosed ? "Commande terminée." : "La personne qui apporte la commande au client."}>
      {current ? (
        <div className="mb-4 rounded-2xl border border-line bg-canvas/60 p-3">
          <p className="font-semibold text-ink">
            {current.name}
            {current.isActive ? null : <span className="ms-2 text-xs font-medium text-amber-700">(désactivé)</span>}
          </p>
          <p className="text-sm text-ink-muted">
            {VEHICLE_LABELS[current.vehicle] ?? current.vehicle} · <PhoneNumber phone={current.phone} />
          </p>
          <PhoneActions phone={current.phone} className="mt-3" />
        </div>
      ) : (
        <p className="mb-4 text-sm text-ink-muted">
          {isClosed ? "Aucun livreur n'était assigné." : "Aucun livreur assigné pour l'instant."}
        </p>
      )}
      {isClosed ? null : deliverers.some((deliverer) => deliverer.isActive) ? (
        <AssignDelivererForm
          key={current?.id ?? "none"}
          action={assignDelivererAction.bind(null, order.id, "detail")}
          options={delivererOptions(deliverers, current?.id ?? null)}
          currentId={current?.id ?? null}
        />
      ) : (
        <p className="text-sm text-ink-muted">
          Aucun livreur actif.{" "}
          <Link href="/admin/livraisons/livreurs/nouveau" className="font-semibold text-brand-700 hover:underline">
            Ajouter un livreur
          </Link>
        </p>
      )}
    </FormSection>
  );
}
