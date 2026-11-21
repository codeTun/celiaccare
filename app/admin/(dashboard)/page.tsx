import {
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  Flag,
  HandCoins,
  Hourglass,
  Inbox,
  ShieldX,
  ShoppingBag,
  ShoppingBasket,
  Star,
  Wallet,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { after } from "next/server";
import { cache, Suspense } from "react";
import { z } from "zod";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CategoryBarChart } from "@/components/admin/charts/category-bar-chart";
import {
  ChartCardSkeleton,
  ChartDataTable,
  ChartLegend,
  KpiGridSkeleton,
  PeriodToggle,
  RankedBars,
  type DashboardPeriod,
} from "@/components/admin/charts/chart-parts";
import { formatCount, formatShare, ORDER_STATUS_COLORS, ORDER_TYPE_COLORS } from "@/components/admin/charts/chart-theme";
import { DonutChart } from "@/components/admin/charts/donut-chart";
import { RevenueAreaChart } from "@/components/admin/charts/revenue-area-chart";
import { DataTable, EmptyTableRow, Tbody, Td, Th, Thead, Tr } from "@/components/admin/data-table";
import { FormSection } from "@/components/admin/form-section";
import { ORDER_TYPE_STYLES } from "@/components/admin/orders/order-labels";
import { firstParam, type AdminQuery } from "@/components/admin/query-string";
import { StatCard, type StatTone } from "@/components/admin/stat-card";
import { ORDER_STATUS_LABELS, StatusBadge } from "@/components/admin/status-badge";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { logAdminAction } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth/session";
import { formatDate, formatDinars, formatPrice, formatRelative } from "@/lib/format";
import { rateLimit } from "@/lib/rate-limit";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";
import { purgeOldMessages } from "@/models/deleters/messages";
import { purgeOldAntiAbuseData } from "@/models/deleters/order-attempts";
import {
  getDashboardStats,
  getMonthToDateComparison,
  getOrdersByStatus,
  getRecentOrders,
  getRevenueByCategory,
  getRevenueByType,
  getRevenueSeries,
  getSheetFreshness,
  getSheetsToReview,
  getTopDishes,
  getTopProducts,
} from "@/models/fetchers/admin/stats";
import { anonymizeOldOrders } from "@/models/puters/orders";
import type { ReportTarget } from "@/types";

export const metadata: Metadata = { title: "Tableau de bord" };

/** ?periode=30j (default) | 12m — anything else falls back to 30 days. */
const periodSchema = z.enum(["30j", "12m"]).catch("30j");

/** The card numbers are used by two blocks of the page: loaded once per request. */
const loadDashboardStats = cache(() => getDashboardStats());

/**
 * /admin — the dashboard ("stats, charts, revenues"): key figures, revenue over time,
 * orders by status, revenue by type and category, best sellers, latest orders and
 * what needs attention. Each block loads on its own (Suspense) and checks the session.
 * Every amount leaves cancelled orders out. Opening it also starts the daily personal-data
 * clean-up (scheduleDailyRetention, after the response).
 */
export default function AdminDashboardPage({ searchParams }: PageProps<"/admin">) {
  return (
    <>
      <AdminPageHeader
        title="Tableau de bord"
        description="L'activité de CeliacCare en un coup d'œil : ventes, commandes et points à traiter."
        actions={
          <Link href="/admin/commandes" className={buttonStyles({ variant: "outline", size: "sm" })}>
            <ShoppingBag aria-hidden="true" />
            Toutes les commandes
          </Link>
        }
      />

      <Suspense fallback={<KpiGridSkeleton />}>
        <KeyFigures />
      </Suspense>

      <div className="mt-6 grid items-start gap-6 xl:grid-cols-3">
        <Suspense fallback={<ChartCardSkeleton className="xl:col-span-2" chartClassName="h-[22rem]" />}>
          <RevenueCard searchParams={searchParams} />
        </Suspense>
        <Suspense fallback={<ChartCardSkeleton chartClassName="h-[22rem]" />}>
          <OrdersByStatusCard />
        </Suspense>
      </div>

      <div className="mt-6 grid items-start gap-6 xl:grid-cols-3">
        <Suspense fallback={<ChartCardSkeleton chartClassName="h-80" />}>
          <RevenueByTypeCard />
        </Suspense>
        <Suspense fallback={<ChartCardSkeleton className="xl:col-span-2" chartClassName="h-80" />}>
          <RevenueByCategoryCard />
        </Suspense>
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-2">
        <Suspense fallback={<ChartCardSkeleton chartClassName="h-60" />}>
          <TopProductsCard />
        </Suspense>
        <Suspense fallback={<ChartCardSkeleton chartClassName="h-60" />}>
          <TopDishesCard />
        </Suspense>
      </div>

      <div className="mt-6 grid items-start gap-6 xl:grid-cols-3">
        <Suspense fallback={<ChartCardSkeleton className="xl:col-span-2" chartClassName="h-80" />}>
          <RecentOrdersCard />
        </Suspense>
        <Suspense fallback={<ChartCardSkeleton chartClassName="h-80" />}>
          <AttentionCard />
        </Suspense>
      </div>
    </>
  );
}

/* --------------------------------------------------------------------------
   Key figures
   -------------------------------------------------------------------------- */

/** Evolution in % (null when there is nothing to compare with). */
function percentChange(current: number, previous: number) {
  return previous > 0 ? ((current - previous) / previous) * 100 : null;
}

/** Spec §2 success criterion: 90 % of the published sheets verified less than 6 months ago. */
const FRESH_SHEETS_TARGET = 90;

/** "15 %": CeliacCare's share of the sales (siteConfig.commissionRate), paid by the merchants. */
const COMMISSION_PERCENT = `${Math.round(siteConfig.commissionRate * 100)}\u00a0%`;

async function KeyFigures() {
  await requireAdmin();
  scheduleDailyRetention();
  const [stats, month, freshness] = await Promise.all([loadDashboardStats(), getMonthToDateComparison(), getSheetFreshness()]);
  const freshPercent = freshness.published > 0 ? (freshness.fresh / freshness.published) * 100 : null;
  let freshTone: StatTone = "neutral";
  if (freshPercent !== null) freshTone = freshPercent >= FRESH_SHEETS_TARGET ? "brand" : "amber";

  // 10 cards: 5 rows of 2 (sm), or 4 rows of 3 (xl) with the commission and the sheets cards 2 columns wide.
  return (
    <section aria-label="Chiffres clés" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <StatCard
        label="Chiffre d'affaires du mois"
        value={formatDinars(stats.revenueThisMonth)}
        icon={<Wallet />}
        tone="saffron"
        delta={percentChange(month.revenue, month.previousRevenue)}
        deltaLabel="vs même période du mois dernier"
        hint={month.previousRevenue > 0 ? undefined : "Pas encore de comparaison"}
        href="/admin/commandes"
      />
      <StatCard
        label="Commission CeliacCare du mois"
        value={formatDinars(month.commission)}
        icon={<HandCoins />}
        tone="brand"
        delta={percentChange(month.commission, month.previousCommission)}
        deltaLabel="vs même période du mois dernier"
        hint={`${COMMISSION_PERCENT} des ventes, payés par les commerçants · livraison offerte aux clients`}
        href="/admin/commandes"
        className="xl:col-span-2"
      />
      <StatCard
        label="Commandes aujourd'hui"
        value={formatCount(stats.ordersToday)}
        icon={<ShoppingBag />}
        tone="brand"
        hint={`${formatCount(stats.ordersThisMonth)} ce mois-ci`}
        href="/admin/commandes"
      />
      <StatCard
        label="Panier moyen"
        value={formatDinars(stats.averageBasket)}
        icon={<ShoppingBasket />}
        tone="brand"
        hint="Commandes du mois, montant payé par le client"
        href="/admin/commandes"
      />
      <StatCard
        label="Commandes en attente"
        value={formatCount(stats.pendingOrders)}
        icon={<Hourglass />}
        tone={stats.pendingOrders > 0 ? "amber" : "neutral"}
        hint={stats.pendingOrders > 0 ? "À confirmer rapidement" : "Rien à confirmer"}
        href="/admin/commandes?status=PENDING"
      />
      <StatCard
        label="Messages non lus"
        value={formatCount(stats.newMessages)}
        icon={<Inbox />}
        tone={stats.newMessages > 0 ? "sky" : "neutral"}
        hint="Formulaire de contact"
        href="/admin/messages?status=NEW"
      />
      <StatCard
        label="Signalements ouverts"
        value={formatCount(stats.openReports)}
        icon={<Flag />}
        tone={stats.openReports > 0 ? "red" : "neutral"}
        hint="Erreurs signalées sur les fiches"
        href="/admin/signalements"
      />
      <StatCard
        label="Avis à modérer"
        value={formatCount(stats.pendingReviews)}
        icon={<Star />}
        tone={stats.pendingReviews > 0 ? "violet" : "neutral"}
        hint="Publiés après validation"
        href="/admin/avis?status=PENDING"
      />
      <StatCard
        label="Tentatives refusées aujourd'hui"
        value={formatCount(stats.refusedAttemptsToday)}
        icon={<ShieldX />}
        tone={stats.refusedAttemptsToday > 0 ? "red" : "neutral"}
        hint="Limite de 3 commandes / jour, numéros bloqués"
        href="/admin/clients/tentatives"
      />
      <StatCard
        label="Fiches vérifiées depuis moins de 6 mois"
        value={freshPercent === null ? "—" : formatShare(freshness.fresh, freshness.published)}
        icon={<BadgeCheck />}
        tone={freshTone}
        hint={`${formatCount(freshness.fresh)} sur ${formatCount(freshness.published)} fiches publiées · objectif ${FRESH_SHEETS_TARGET} %`}
        href="#points-attention"
        className="xl:col-span-2"
      />
    </section>
  );
}

/**
 * Personal data retention (spec 6.4, privacy policy): at most once a day, when an admin opens
 * the dashboard, anonymise the orders closed more than 90 days ago and delete the old refused
 * attempts and daily counters. Runs AFTER the response (next/server after()): never slows the page.
 */
function scheduleDailyRetention() {
  after(async () => {
    try {
      // One run per 24 hours, whoever opens the dashboard (the hit is the "last run" marker).
      if (!(await rateLimit("retention:daily", { limit: 1, windowMs: 24 * 60 * 60 * 1000 })).ok) return;
      const days = siteConfig.deliveryDataRetentionDays;
      const orders = await anonymizeOldOrders(days);
      const purged = await purgeOldAntiAbuseData(days);
      const messages = await purgeOldMessages(365);
      if (orders + purged.attempts + purged.counters + messages > 0) {
        await logAdminAction(
          null,
          "anonymize",
          "order",
          null,
          `Automatique, plus de ${days} jours : ${orders} commande(s) anonymisée(s), ${purged.attempts} tentative(s), ${purged.counters} compteur(s) et ${messages} message(s) de plus de 12 mois supprimés`,
        );
      }
    } catch (error) {
      console.error("[retention] the daily clean-up failed", error);
    }
  });
}

/* --------------------------------------------------------------------------
   Revenue over time
   -------------------------------------------------------------------------- */

async function RevenueCard({ searchParams }: { searchParams: Promise<AdminQuery> }) {
  await requireAdmin();
  const period: DashboardPeriod = periodSchema.parse(firstParam((await searchParams).periode));
  const series = await getRevenueSeries(period === "12m" ? "12m" : "30d");

  const revenue = series.reduce((sum, point) => sum + point.revenue, 0);
  const orders = series.reduce((sum, point) => sum + point.orders, 0);
  const pointLabel = period === "12m" ? "Mois" : "Jour";

  return (
    <FormSection
      id="chiffre-affaires"
      className="xl:col-span-2"
      title="Chiffre d'affaires"
      description={period === "12m" ? "Les 12 derniers mois, mois par mois." : "Les 30 derniers jours, jour par jour."}
      actions={<PeriodToggle current={period} />}
    >
      <dl className="mb-5 grid grid-cols-3 gap-4">
        <div>
          <dt className="text-xs font-medium text-ink-subtle">Total de la période</dt>
          <dd className="mt-0.5 text-lg font-extrabold text-ink tabular sm:text-xl">{formatDinars(revenue)}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-ink-subtle">Commandes</dt>
          <dd className="mt-0.5 text-lg font-extrabold text-ink tabular sm:text-xl">{formatCount(orders)}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-ink-subtle">Panier moyen</dt>
          <dd className="mt-0.5 text-lg font-extrabold text-ink tabular sm:text-xl">
            {formatDinars(orders > 0 ? Math.round(revenue / orders) : 0)}
          </dd>
        </div>
      </dl>
      <RevenueAreaChart data={series} />
      <ChartDataTable
        caption={`Chiffre d'affaires et commandes par ${pointLabel.toLowerCase()}`}
        headers={[pointLabel, "Chiffre d'affaires", "Commandes"]}
        rows={series.map((point) => [point.label, formatDinars(point.revenue), point.orders])}
      />
      <p className="mt-3 text-xs text-ink-subtle">Commandes non annulées, montants payés par les clients.</p>
    </FormSection>
  );
}

/* --------------------------------------------------------------------------
   Breakdowns: by status, by type, by category
   -------------------------------------------------------------------------- */

async function OrdersByStatusCard() {
  await requireAdmin();
  const counts = await getOrdersByStatus();
  const total = counts.reduce((sum, row) => sum + row.count, 0);

  return (
    <FormSection id="commandes-par-statut" title="Commandes par statut" description="Toutes les commandes depuis l'ouverture.">
      <DonutChart
        slices={counts.map((row) => ({ label: ORDER_STATUS_LABELS[row.status], value: row.count, color: ORDER_STATUS_COLORS[row.status] }))}
        centerValue={formatCount(total)}
        centerLabel={total > 1 ? "commandes" : "commande"}
      />
      <ChartLegend
        className="mt-4"
        items={counts.map((row) => ({
          label: ORDER_STATUS_LABELS[row.status],
          color: ORDER_STATUS_COLORS[row.status],
          value: formatCount(row.count),
          detail: formatShare(row.count, total),
          href: `/admin/commandes?status=${row.status}`,
        }))}
      />
    </FormSection>
  );
}

async function RevenueByTypeCard() {
  await requireAdmin();
  const types = await getRevenueByType();
  const total = types.reduce((sum, row) => sum + row.revenue, 0);

  return (
    <FormSection id="ca-par-type" title="Épicerie ou restaurants" description="Répartition du chiffre d'affaires depuis l'ouverture.">
      <DonutChart
        slices={types.map((row) => ({ label: ORDER_TYPE_STYLES[row.type].label, value: row.revenue, color: ORDER_TYPE_COLORS[row.type] }))}
        centerValue={formatDinars(total)}
        centerLabel="au total"
        valueFormat="dinars"
      />
      <ChartLegend
        className="mt-4"
        items={types.map((row) => ({
          label: row.type === "SHOP" ? "Épicerie (produits)" : "Restaurants partenaires",
          color: ORDER_TYPE_COLORS[row.type],
          value: formatDinars(row.revenue),
          detail: `${formatShare(row.revenue, total)} · ${formatCount(row.orders)} commande${row.orders > 1 ? "s" : ""}`,
          href: `/admin/commandes?type=${row.type}`,
        }))}
      />
    </FormSection>
  );
}

async function RevenueByCategoryCard() {
  await requireAdmin();
  const categories = await getRevenueByCategory();

  return (
    <FormSection
      id="ca-par-categorie"
      className="xl:col-span-2"
      title="Ventes par catégorie"
      description="Chiffre d'affaires des produits de l'épicerie (montant des articles)."
    >
      {categories.length === 0 ? (
        <p className="py-10 text-center text-sm text-ink-muted">Aucun produit vendu pour l&apos;instant.</p>
      ) : (
        <>
          <CategoryBarChart data={categories} />
          <ChartDataTable
            caption="Chiffre d'affaires par catégorie"
            headers={["Catégorie", "Chiffre d'affaires"]}
            rows={categories.map((category) => [category.name, formatDinars(category.revenue)])}
          />
        </>
      )}
    </FormSection>
  );
}

/* --------------------------------------------------------------------------
   Best sellers
   -------------------------------------------------------------------------- */

async function TopProductsCard() {
  await requireAdmin();
  const products = await getTopProducts(5);
  return (
    <FormSection id="meilleurs-produits" title="Produits les plus vendus" description="Les 5 produits de l'épicerie les plus commandés.">
      <RankedBars items={products} emptyText="Aucun produit vendu pour l'instant." />
    </FormSection>
  );
}

async function TopDishesCard() {
  await requireAdmin();
  const dishes = await getTopDishes(5);
  return (
    <FormSection id="meilleurs-plats" title="Plats les plus commandés" description="Les 5 plats des restaurants partenaires les plus commandés.">
      <RankedBars items={dishes} tone="saffron" emptyText="Aucun plat commandé pour l'instant." />
    </FormSection>
  );
}

/* --------------------------------------------------------------------------
   Latest orders and points of attention
   -------------------------------------------------------------------------- */

async function RecentOrdersCard() {
  await requireAdmin();
  const orders = await getRecentOrders(8);
  const now = new Date(); // request time (after the session check)

  return (
    <section aria-labelledby="dernieres-commandes" className="min-w-0 xl:col-span-2">
      <div className="mb-3 flex items-end justify-between gap-3">
        <h2 id="dernieres-commandes" className="text-lg font-bold text-ink">
          Dernières commandes
        </h2>
        <Link href="/admin/commandes" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline">
          Toutes les commandes
          <ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" />
        </Link>
      </div>
      <DataTable caption="Les 8 dernières commandes" stickyHeader={false} tableClassName="min-w-[40rem]">
        <Thead>
          <Th>Référence</Th>
          <Th>Client</Th>
          <Th>Type</Th>
          <Th align="end">Total</Th>
          <Th>Statut</Th>
          <Th>Passée</Th>
        </Thead>
        <Tbody>
          {orders.length === 0 ? (
            <EmptyTableRow colSpan={6} icon={<ShoppingBag />} title="Aucune commande pour l'instant" />
          ) : (
            orders.map((order) => (
              <Tr key={order.id}>
                <Td>
                  <Link
                    href={`/admin/commandes/${order.id}`}
                    className="font-mono text-[13px] font-semibold whitespace-nowrap text-brand-700 hover:underline"
                  >
                    {order.reference}
                  </Link>
                </Td>
                <Td className="max-w-[12rem] truncate font-medium text-ink" title={order.customerName}>
                  {order.customerName}
                </Td>
                <Td className="whitespace-nowrap">{ORDER_TYPE_STYLES[order.type].label}</Td>
                <Td align="end" className="font-semibold whitespace-nowrap text-ink tabular">
                  {formatPrice(order.total)}
                </Td>
                <Td>
                  <StatusBadge kind="order" status={order.status} />
                </Td>
                <Td className="whitespace-nowrap" title={formatDate(order.createdAt)}>
                  {formatRelative(order.createdAt, "fr", now)}
                </Td>
              </Tr>
            ))
          )}
        </Tbody>
      </DataTable>
    </section>
  );
}

const SHEET_TYPES: Record<ReportTarget, { label: string; tone: BadgeTone; href: (id: number) => string }> = {
  PRODUCT: { label: "Produit", tone: "brand", href: (id) => `/admin/produits/${id}` },
  PRODUCER: { label: "Artisan", tone: "saffron", href: (id) => `/admin/artisans/${id}` },
  RESTAURANT: { label: "Restaurant", tone: "violet", href: (id) => `/admin/restaurants/${id}` },
};

async function AttentionCard() {
  await requireAdmin();
  const [stats, sheets] = await Promise.all([loadDashboardStats(), getSheetsToReview(6)]);
  const moderation = [
    { label: "Messages non lus", count: stats.newMessages, href: "/admin/messages?status=NEW", icon: Inbox },
    { label: "Signalements ouverts", count: stats.openReports, href: "/admin/signalements", icon: Flag },
    { label: "Avis à modérer", count: stats.pendingReviews, href: "/admin/avis?status=PENDING", icon: Star },
  ];
  const hiddenSheets = Math.max(0, stats.sheetsToReview - sheets.length);

  return (
    <FormSection id="points-attention" title="Points d'attention" description="Ce qui attend une action de l'équipe.">
      <h3 className="text-xs font-bold tracking-[0.08em] text-ink-subtle uppercase">Modération</h3>
      <ul className="mt-2 grid grid-cols-3 gap-2">
        {moderation.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.label}>
              <Link
                href={item.href}
                className={cn(
                  "flex h-full flex-col rounded-2xl p-3 ring-1 transition-colors",
                  item.count > 0 ? "bg-amber-50 ring-amber-200 hover:bg-amber-100/70" : "bg-canvas ring-line hover:bg-brand-50",
                )}
              >
                <Icon className={cn("size-4", item.count > 0 ? "text-amber-700" : "text-ink-subtle")} aria-hidden="true" />
                <span className="mt-1.5 text-xl font-extrabold text-ink tabular">{formatCount(item.count)}</span>
                <span className="text-xs leading-tight text-ink-muted">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 flex items-center justify-between gap-2">
        <h3 className="text-xs font-bold tracking-[0.08em] text-ink-subtle uppercase">Fiches à revérifier (&gt; 12 mois)</h3>
        <Badge tone={stats.sheetsToReview > 0 ? "amber" : "brand"}>{formatCount(stats.sheetsToReview)}</Badge>
      </div>
      {sheets.length === 0 ? (
        <p className="mt-3 flex items-start gap-2 text-sm text-ink-muted">
          <BadgeCheck className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden="true" />
          Toutes les fiches publiées ont été vérifiées il y a moins de 12 mois.
        </p>
      ) : (
        <ul className="mt-2 divide-y divide-line">
          {sheets.map((sheet) => {
            const type = SHEET_TYPES[sheet.type];
            return (
              <li key={`${sheet.type}-${sheet.id}`}>
                <Link
                  href={type.href(sheet.id)}
                  className="-mx-2 flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-brand-50/60"
                >
                  <Badge tone={type.tone} className="shrink-0">
                    {type.label}
                  </Badge>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink">{sheet.name}</span>
                    <span className="block text-xs text-ink-subtle">
                      Vérifiée le {formatDate(sheet.verifiedAt)} · il y a {sheet.monthsSinceVerified} mois
                    </span>
                  </span>
                  <ArrowRight className="size-4 shrink-0 text-ink-subtle rtl:rotate-180" aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      {hiddenSheets > 0 ? (
        <p className="mt-2 text-xs text-ink-subtle">
          … et {formatCount(hiddenSheets)} autre{hiddenSheets > 1 ? "s" : ""} fiche{hiddenSheets > 1 ? "s" : ""} à revoir.
        </p>
      ) : null}
      <p className="mt-4 flex items-start gap-2 rounded-2xl bg-canvas/70 p-3 text-xs leading-relaxed text-ink-muted ring-1 ring-line">
        <CalendarClock className="mt-0.5 size-4 shrink-0 text-saffron-700" aria-hidden="true" />
        Règle de fiabilité (6.1) : chaque fiche affiche sa source et sa date de vérification. Revérifiez-les au moins une fois par an.
      </p>
    </FormSection>
  );
}
