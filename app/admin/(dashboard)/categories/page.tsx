import { Plus, Tags } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { AdminEmpty } from "@/components/admin/admin-empty";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { PHOTO_SKIPPED_CODE, PHOTO_SKIPPED_MESSAGE } from "@/components/admin/catalog/labels";
import { choiceParam, listQuery, matchesSearch, pageParam, paginateRows, plural, textParam } from "@/components/admin/catalog/list-query";
import { DeleteLocked, EditRowLink } from "@/components/admin/catalog/record-parts";
import { CatalogListSkeleton } from "@/components/admin/catalog/skeletons";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { DataTable, EmptyTableRow, Tbody, Td, Th, Thead, Tr } from "@/components/admin/data-table";
import { FilterTabs } from "@/components/admin/filter-tabs";
import { FlashMessage } from "@/components/admin/flash-message";
import { SearchForm } from "@/components/admin/search-form";
import { buttonStyles } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/session";
import { isCategoryIconKey } from "@/lib/category-icons";
import { CATEGORY_ICONS, getCategoryIcon } from "@/lib/icons";
import { listCategories } from "@/models/fetchers/admin/categories";

import { deleteCategoryAction } from "./actions";

export const metadata: Metadata = { title: "Catégories" };

const BASE_PATH = "/admin/categories";

const FLASH_MESSAGES = {
  created: "La catégorie a été créée.",
  updated: "La catégorie a été mise à jour.",
  deleted: "La catégorie a été supprimée.",
  [PHOTO_SKIPPED_CODE]: PHOTO_SKIPPED_MESSAGE,
};

const FILTERS = ["with-products", "empty"] as const;

/**
 * /admin/categories — the shelves of the catalogue (spec 6.3: one distinct icon each).
 * Static header; the list (session check + data) streams in below.
 */
export default function CategoriesPage({ searchParams }: PageProps<"/admin/categories">) {
  return (
    <>
      <AdminPageHeader
        title="Catégories"
        description="Les rayons du catalogue : nom en français et en arabe, icône, ordre d'affichage."
        breadcrumbs={[{ label: "Tableau de bord", href: "/admin" }, { label: "Catégories" }]}
        actions={
          <Link href="/admin/categories/nouveau" className={buttonStyles()}>
            <Plus aria-hidden="true" />
            Nouvelle catégorie
          </Link>
        }
      />
      <FlashMessage messages={FLASH_MESSAGES} />
      <Suspense fallback={<CatalogListSkeleton columns={6} rows={6} />}>
        <CategoriesList searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function CategoriesList({ searchParams }: Pick<PageProps<"/admin/categories">, "searchParams">) {
  await requireAdmin();
  const query = listQuery(await searchParams);
  const search = textParam(query, "q");
  const filter = choiceParam(query, "status", FILTERS);

  const categories = await listCategories();
  if (categories.length === 0) {
    return (
      <AdminEmpty
        icon={<Tags />}
        title="Aucune catégorie pour l'instant"
        description="Créez les rayons du catalogue (pains, pâtisseries, épicerie…) avant d'ajouter des produits."
        action={
          <Link href="/admin/categories/nouveau" className={buttonStyles()}>
            <Plus aria-hidden="true" />
            Créer la première catégorie
          </Link>
        }
      />
    );
  }

  const matching = categories.filter((category) =>
    matchesSearch(search, category.name, category.nameAr, category.slug),
  );
  const filtered = matching.filter((category) => {
    if (filter === "with-products") return category.productCount > 0;
    if (filter === "empty") return category.productCount === 0;
    return true;
  });
  const page = paginateRows(filtered, pageParam(query));

  return (
    <>
      <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SearchForm basePath={BASE_PATH} query={query} placeholder="Nom, nom arabe ou slug…" />
      </div>
      <FilterTabs
        basePath={BASE_PATH}
        query={query}
        className="mb-4"
        label="Filtrer les catégories"
        tabs={[
          { value: "", label: "Toutes", count: matching.length },
          { value: "with-products", label: "Avec produits", count: matching.filter((c) => c.productCount > 0).length },
          { value: "empty", label: "Vides", count: matching.filter((c) => c.productCount === 0).length },
        ]}
      />

      <DataTable caption="Catégories du catalogue" tableClassName="min-w-[46rem]">
        <Thead>
          <Th className="w-16">Icône</Th>
          <Th>Catégorie</Th>
          <Th>Slug</Th>
          <Th align="end">Produits</Th>
          <Th align="end">Ordre</Th>
          <Th align="end">
            <span className="sr-only">Actions</span>
          </Th>
        </Thead>
        <Tbody>
          {page.items.length === 0 ? (
            <EmptyTableRow
              colSpan={6}
              icon={<Tags />}
              title="Aucune catégorie ne correspond"
              description="Modifiez la recherche ou le filtre."
              action={
                <Link href={BASE_PATH} className={buttonStyles({ variant: "outline", size: "sm" })}>
                  Voir toutes les catégories
                </Link>
              }
            />
          ) : (
            page.items.map((category) => {
              const Icon = getCategoryIcon(category.icon);
              const iconLabel = isCategoryIconKey(category.icon) ? CATEGORY_ICONS[category.icon].label : category.icon;
              return (
                <Tr key={category.id}>
                  <Td>
                    <span
                      title={`Icône : ${iconLabel}`}
                      className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-brand-100"
                    >
                      <Icon className="size-5" strokeWidth={1.8} aria-hidden="true" />
                      <span className="sr-only">Icône : {iconLabel}</span>
                    </span>
                  </Td>
                  <Td>
                    <Link href={`${BASE_PATH}/${category.id}`} className="font-semibold text-ink hover:text-brand-700 hover:underline">
                      {category.name}
                    </Link>
                    {category.nameAr ? (
                      <p className="mt-0.5 text-xs text-ink-subtle">
                        <span dir="rtl" lang="ar">
                          {category.nameAr}
                        </span>
                      </p>
                    ) : (
                      <p className="mt-0.5 text-xs text-amber-700">Nom arabe manquant</p>
                    )}
                  </Td>
                  <Td className="font-mono text-xs">{category.slug}</Td>
                  <Td align="end" className="whitespace-nowrap">
                    {category.productCount > 0 ? (
                      <Link
                        href={`/admin/produits?category=${category.id}`}
                        className="font-semibold text-ink tabular hover:text-brand-700 hover:underline"
                      >
                        {plural(category.productCount, "produit")}
                      </Link>
                    ) : (
                      <span className="text-ink-subtle">Aucun produit</span>
                    )}
                    {category.productCount > category.activeProductCount ? (
                      <p className="text-xs text-ink-subtle">dont {category.activeProductCount} en ligne</p>
                    ) : null}
                  </Td>
                  <Td align="end" className="tabular">
                    {category.sortOrder}
                  </Td>
                  <Td align="end">
                    <div className="flex items-center justify-end gap-1">
                      <EditRowLink href={`${BASE_PATH}/${category.id}`} label={`Modifier « ${category.name} »`} />
                      {category.productCount === 0 ? (
                        <ConfirmDeleteButton
                          action={deleteCategoryAction.bind(null, category.id)}
                          label={`Supprimer « ${category.name} »`}
                          title={`Supprimer la catégorie « ${category.name} » ?`}
                          description="Elle disparaît du menu et des filtres du site. Cette action est définitive."
                          variant="ghost"
                          iconOnly
                        />
                      ) : (
                        <DeleteLocked
                          reason={`Suppression impossible : ${plural(category.productCount, "produit")} dans cette catégorie. Déplacez-les d'abord.`}
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
      <AdminPagination basePath={BASE_PATH} query={query} {...page} />
    </>
  );
}
