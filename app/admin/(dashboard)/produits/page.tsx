import { CalendarClock, ExternalLink, Eye, EyeOff, Package, PackageCheck, PackageX, Plus, Star } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { AdminEmpty } from "@/components/admin/admin-empty";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { FilterBar } from "@/components/admin/catalog/filter-bar";
import { GuaranteeLevelBadge } from "@/components/admin/catalog/guarantee";
import { PHOTO_SKIPPED_CODE, PHOTO_SKIPPED_MESSAGE, publicPath } from "@/components/admin/catalog/labels";
import { choiceParam, idParam, listQuery, pageParam, textParam } from "@/components/admin/catalog/list-query";
import { QuickToggle } from "@/components/admin/catalog/quick-toggle";
import { EditRowLink } from "@/components/admin/catalog/record-parts";
import { CatalogListSkeleton } from "@/components/admin/catalog/skeletons";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { DataTable, EmptyTableRow, Tbody, Td, Th, Thead, Tr } from "@/components/admin/data-table";
import { FilterTabs } from "@/components/admin/filter-tabs";
import { FlashMessage } from "@/components/admin/flash-message";
import { SearchForm } from "@/components/admin/search-form";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { CloudImage } from "@/components/ui/cloud-image";
import { requireAdmin } from "@/lib/auth/session";
import { formatDate, formatPrice } from "@/lib/format";
import { listCategories } from "@/models/fetchers/admin/categories";
import { listProducers } from "@/models/fetchers/admin/producers";
import { listProducts } from "@/models/fetchers/admin/products";
import type { AdminProductRow, AdminProductStatusFilter } from "@/types/admin-data";

import { deleteProductAction, toggleProductFlagAction } from "./actions";

export const metadata: Metadata = { title: "Produits" };

const BASE_PATH = "/admin/produits";

const FLASH_MESSAGES = {
  created: "Le produit a été créé.",
  updated: "Le produit a été mis à jour.",
  deleted: "Le produit a été supprimé.",
  [PHOTO_SKIPPED_CODE]: PHOTO_SKIPPED_MESSAGE,
};

const STATUSES: readonly AdminProductStatusFilter[] = ["active", "inactive", "featured", "unavailable"];

/**
 * /admin/produits — the products sold by the artisans: search, filters, quick toggles
 * (actif / vedette / disponible), edit and delete. Static header; the table streams in.
 */
export default function ProductsPage({ searchParams }: PageProps<"/admin/produits">) {
  return (
    <>
      <AdminPageHeader
        title="Produits"
        description="Les produits sans gluten des artisans partenaires : prix, garantie, ingrédients et mise en ligne."
        breadcrumbs={[{ label: "Tableau de bord", href: "/admin" }, { label: "Produits" }]}
        actions={
          <Link href="/admin/produits/nouveau" className={buttonStyles()}>
            <Plus aria-hidden="true" />
            Nouveau produit
          </Link>
        }
      />
      <FlashMessage messages={FLASH_MESSAGES} />
      <Suspense fallback={<CatalogListSkeleton columns={8} rows={10} filters={2} />}>
        <ProductsList searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function ProductsList({ searchParams }: Pick<PageProps<"/admin/produits">, "searchParams">) {
  await requireAdmin();
  const query = listQuery(await searchParams);
  const filters = {
    q: textParam(query, "q"),
    categoryId: idParam(query, "category"),
    producerId: idParam(query, "producer"),
    status: choiceParam(query, "status", STATUSES),
    page: pageParam(query),
  };

  const [products, categories, producers] = await Promise.all([listProducts(filters), listCategories(), listProducers()]);
  const categoryIcons = new Map(categories.map((category) => [category.id, category.icon]));
  const hasFilters = Boolean(filters.q || filters.categoryId || filters.producerId || filters.status);

  if (products.total === 0 && !hasFilters) {
    return (
      <AdminEmpty
        icon={<Package />}
        title="Aucun produit pour l'instant"
        description="Ajoutez le premier produit d'un artisan partenaire (il faut au moins une catégorie et un artisan)."
        action={
          <Link href="/admin/produits/nouveau" className={buttonStyles()}>
            <Plus aria-hidden="true" />
            Ajouter un produit
          </Link>
        }
      />
    );
  }

  return (
    <>
      <div className="mb-3 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <SearchForm basePath={BASE_PATH} query={query} placeholder="Nom, artisan, ingrédient, slug…" />
        <FilterBar
          basePath={BASE_PATH}
          query={query}
          selects={[
            {
              name: "category",
              label: "Catégorie",
              placeholder: "Toutes les catégories",
              options: categories.map((category) => ({
                value: String(category.id),
                label: `${category.name} (${category.productCount})`,
              })),
            },
            {
              name: "producer",
              label: "Artisan",
              placeholder: "Tous les artisans",
              options: producers.map((producer) => ({
                value: String(producer.id),
                label: `${producer.name} (${producer.productCount})`,
              })),
            },
          ]}
        />
      </div>
      <FilterTabs
        basePath={BASE_PATH}
        query={query}
        className="mb-4"
        label="Filtrer par statut"
        tabs={[
          { value: "", label: "Tous" },
          { value: "active", label: "Actifs" },
          { value: "inactive", label: "Inactifs" },
          { value: "featured", label: "En vedette" },
          { value: "unavailable", label: "Indisponibles" },
        ]}
      />

      <DataTable caption="Produits du catalogue" tableClassName="min-w-[60rem]">
        <Thead>
          <Th>Produit</Th>
          <Th>Catégorie · Artisan</Th>
          <Th align="end">Prix</Th>
          <Th>Garantie</Th>
          <Th>Publication</Th>
          <Th align="end">
            <span className="sr-only">Actions</span>
          </Th>
        </Thead>
        <Tbody>
          {products.items.length === 0 ? (
            <EmptyTableRow
              colSpan={6}
              icon={<Package />}
              title="Aucun produit ne correspond"
              description={
                products.total > 0 ? "Cette page n'existe plus : revenez à la première page." : "Modifiez la recherche ou les filtres."
              }
              action={
                <Link href={BASE_PATH} className={buttonStyles({ variant: "outline", size: "sm" })}>
                  Voir tous les produits
                </Link>
              }
            />
          ) : (
            products.items.map((product) => (
              <ProductRow key={product.id} product={product} categoryIcon={categoryIcons.get(product.categoryId)} />
            ))
          )}
        </Tbody>
      </DataTable>
      <AdminPagination basePath={BASE_PATH} query={query} {...products} />
    </>
  );
}

function ProductRow({ product, categoryIcon }: { product: AdminProductRow; categoryIcon?: string }) {
  return (
    <Tr>
      <Td>
        <div className="flex items-center gap-3">
          <CloudImage
            src={product.imageUrl}
            alt={`Photo de ${product.name}`}
            sizes="48px"
            fallbackIcon={categoryIcon}
            className="size-12 shrink-0"
            rounded="rounded-xl"
          />
          <div className="min-w-0">
            <Link
              href={`${BASE_PATH}/${product.id}`}
              className="block max-w-[18rem] truncate font-semibold text-ink hover:text-brand-700 hover:underline"
            >
              {product.name}
            </Link>
            <p className="max-w-[18rem] truncate font-mono text-[11px] text-ink-subtle">{product.slug}</p>
            {product.needsReview ? (
              <Badge tone="amber" className="mt-1" title={`Vérifié le ${formatDate(product.verifiedAt)}`}>
                <CalendarClock aria-hidden="true" />À revérifier
              </Badge>
            ) : null}
          </div>
        </div>
      </Td>
      <Td className="max-w-[13rem]">
        <Link
          href={`${BASE_PATH}?category=${product.categoryId}`}
          title="Voir les produits de cette catégorie"
          className="block truncate text-ink hover:text-brand-700 hover:underline"
        >
          {product.categoryName}
        </Link>
        <Link
          href={`${BASE_PATH}?producer=${product.producerId}`}
          title="Voir les produits de cet artisan"
          className="block truncate text-xs text-ink-subtle hover:text-brand-700 hover:underline"
        >
          {product.producerName}
        </Link>
      </Td>
      <Td align="end" className="whitespace-nowrap">
        <span className="font-semibold text-ink tabular">{formatPrice(product.price)}</span>
        {product.unit ? <span className="block text-xs text-ink-subtle">{product.unit}</span> : null}
      </Td>
      <Td>
        <GuaranteeLevelBadge level={product.guaranteeLevel} />
      </Td>
      <Td>
        <div className="flex max-w-[12.5rem] flex-wrap gap-1.5">
          <QuickToggle
            action={toggleProductFlagAction.bind(null, product.id, "isActive", !product.isActive)}
            tone={product.isActive ? "on" : "off"}
            icon={product.isActive ? <Eye /> : <EyeOff />}
            label={product.isActive ? "Actif" : "Inactif"}
            actionLabel={product.isActive ? "Masquer ce produit du site" : "Afficher ce produit sur le site"}
          />
          <QuickToggle
            action={toggleProductFlagAction.bind(null, product.id, "isFeatured", !product.isFeatured)}
            tone={product.isFeatured ? "featured" : "idle"}
            icon={<Star className={product.isFeatured ? "fill-current" : undefined} />}
            label="Vedette"
            actionLabel={product.isFeatured ? "Retirer de la vedette" : "Mettre en vedette sur l'accueil"}
          />
          <QuickToggle
            action={toggleProductFlagAction.bind(null, product.id, "isAvailable", !product.isAvailable)}
            tone={product.isAvailable ? "on" : "warning"}
            icon={product.isAvailable ? <PackageCheck /> : <PackageX />}
            label={product.isAvailable ? "Disponible" : "Indisponible"}
            actionLabel={product.isAvailable ? "Marquer comme indisponible (rupture)" : "Marquer comme disponible"}
          />
        </div>
      </Td>
      <Td align="end">
        <div className="flex items-center justify-end gap-1">
          <EditRowLink href={`${BASE_PATH}/${product.id}`} label={`Modifier « ${product.name} »`} />
          {product.isActive ? (
            <a
              href={publicPath("produits", product.slug)}
              target="_blank"
              rel="noopener noreferrer"
              title="Voir sur le site (nouvel onglet)"
              className={buttonStyles({ variant: "ghost", size: "icon-sm" })}
            >
              <ExternalLink aria-hidden="true" />
              <span className="sr-only">Voir « {product.name} » sur le site (nouvel onglet)</span>
            </a>
          ) : null}
          <ConfirmDeleteButton
            action={deleteProductAction.bind(null, product.id)}
            label={`Supprimer « ${product.name} »`}
            title={`Supprimer « ${product.name} » ?`}
            description="La fiche et ses avis disparaissent du site ; les commandes passées gardent leur ligne. Pour un retrait temporaire, rendez-le plutôt inactif."
            variant="ghost"
            iconOnly
          />
        </div>
      </Td>
    </Tr>
  );
}
