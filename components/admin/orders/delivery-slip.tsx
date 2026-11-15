import { ORDER_STATUS_LABELS } from "@/components/admin/status-badge";
import { formatDateTime, formatPhone, formatPrice } from "@/lib/format";
import { siteConfig } from "@/lib/site-config";
import type { AdminOrderDetail } from "@/types/admin-data";

import { ORDER_TYPE_STYLES, PAYMENT_METHOD_LABELS } from "./order-labels";

/**
 * Print rules of the slip (static text, no user data). The slip is hidden on screen; when
 * PrintSlipButton sets <html data-printing="slip">, every element that is not the slip,
 * inside it or one of its parents is hidden, so the slip prints alone on a clean page.
 */
const PRINT_CSS = `
[data-print-slip] { display: none; }
@media print {
  @page { margin: 12mm; }
  html[data-printing="slip"] [data-print-slip] { display: block; }
  html[data-printing="slip"] body *:not(:has([data-print-slip])):not([data-print-slip]):not([data-print-slip] *) { display: none !important; }
  html[data-printing="slip"] body,
  html[data-printing="slip"] body *:has([data-print-slip]) { background: #fff !important; box-shadow: none !important; margin: 0 !important; padding: 0 !important; min-height: 0 !important; }
}
`;

/**
 * Printable delivery slip ("bon de livraison") of an order: customer, address, items, amount to
 * collect, payment method and a signature box. Rendered (hidden) on the order page and printed
 * with <PrintSlipButton />. Black on white, no colors: it must read well on any printer.
 */
export function DeliverySlip({ order }: { order: AdminOrderDetail }) {
  const address = [order.street, order.addressDetails, `${order.city} (${order.governorate})`].filter(Boolean).join(", ");

  return (
    <div data-print-slip="" className="bg-white text-[12px] leading-snug text-black">
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />

      <header className="flex items-start justify-between gap-6 border-b-2 border-black pb-3">
        <div>
          <p className="text-lg font-extrabold">{siteConfig.name}</p>
          <p>
            {siteConfig.phone} · {siteConfig.email}
          </p>
        </div>
        <div className="text-end">
          <p className="text-lg font-extrabold uppercase">Bon de livraison</p>
          <p className="font-mono text-base font-bold">{order.reference}</p>
          <p>Commande du {formatDateTime(order.createdAt)}</p>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-6 border-b border-black py-3">
        <div>
          <p className="font-bold uppercase">Client</p>
          <p className="text-[14px] font-bold">{order.customerName}</p>
          <p dir="ltr" className="text-start">
            Tél. {formatPhone(order.phone)}
          </p>
          <p>{address}</p>
        </div>
        <div>
          <p className="font-bold uppercase">Livraison</p>
          <p>
            {ORDER_TYPE_STYLES[order.type]?.label ?? order.type}
            {order.restaurant ? ` · ${order.restaurant.name} (${formatPhone(order.restaurant.phone)})` : ""}
          </p>
          <p>Livreur : {order.deliverer ? `${order.deliverer.name} (${formatPhone(order.deliverer.phone)})` : "—"}</p>
          <p>Délai annoncé : {order.zone?.delay ?? "—"}</p>
          <p>Statut : {ORDER_STATUS_LABELS[order.status] ?? order.status}</p>
        </div>
      </section>

      <table className="mt-3 w-full border-collapse">
        <thead>
          <tr className="border-b border-black text-start">
            <th className="py-1 text-start">Article</th>
            <th className="py-1 text-start">Commerçant</th>
            <th className="py-1 text-end">Prix unit.</th>
            <th className="py-1 text-end">Qté</th>
            <th className="py-1 text-end">Total</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={item.id} className="border-b border-black/30">
              <td className="py-1 pe-2">{item.name}</td>
              <td className="py-1 pe-2">{item.merchantName}</td>
              <td className="py-1 text-end tabular">{formatPrice(item.unitPrice)}</td>
              <td className="py-1 text-end tabular">{item.quantity}</td>
              <td className="py-1 text-end tabular">{formatPrice(item.lineTotal)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={4} className="pt-2 text-end">
              Sous-total
            </td>
            <td className="pt-2 text-end tabular">{formatPrice(order.subtotal)}</td>
          </tr>
          <tr>
            <td colSpan={4} className="text-end">
              Livraison
            </td>
            <td className="text-end tabular">{formatPrice(order.deliveryFee)}</td>
          </tr>
          <tr className="text-[14px] font-extrabold">
            <td colSpan={4} className="pt-1 text-end">
              À encaisser
            </td>
            <td className="pt-1 text-end tabular">{formatPrice(order.total)}</td>
          </tr>
        </tfoot>
      </table>

      <p className="mt-3">
        <span className="font-bold">Paiement :</span> {PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod}
      </p>
      {order.note ? (
        <p className="mt-1">
          <span className="font-bold">Note du client :</span> {order.note}
        </p>
      ) : null}

      <div className="mt-8 grid grid-cols-2 gap-6">
        <div className="h-20 border border-black p-2">Remis le : ____ / ____ à ____ h ____</div>
        <div className="h-20 border border-black p-2">Signature du client :</div>
      </div>
      <p className="mt-4 text-[10px]">
        Données personnelles utilisées uniquement pour cette livraison (loi n° 2004-63). Merci de détruire ce bon après la
        livraison.
      </p>
    </div>
  );
}
