import { Carrot, Plus, TriangleExclamationPoint } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { choiceParam, listQuery, matchesSearch, pageParam, paginateRows, plural, textParam } from "@/components/admin/catalog/list-query";
import { EditRowLink } from "@/components/admin/catalog/record-parts";
import { CatalogListSkeleton } from "@/components/admin/catalog/skeletons";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { DataTable, EmptyTableRow, Tbody, Td, Th, Thead, Tr } from "@/components/admin/data-table";
import { FilterTabs } from "@/components/admin/filter-tabs";
import { FlashMessage } from "@/components/admin/flash-message";
import { FormSection } from "@/components/admin/form-section";
import { SearchForm } from "@/components/admin/search-form";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/session";
import { listIngredients } from "@/models/fetchers/admin/ingredients";
import type { AdminIngredientRow } from "@/types/admin-data";

import { createIngredientAction, deleteIngredientAction } from "./actions";
import { IngredientForm } from "./ingredient-form";

export const metadata: Metadata = { title: "Ingrédients" };

const BASE_PATH = "/admin/ingredients";

const FLASH_MESSAGES = {
  created: "L'ingrédient a été ajouté.",
  updated: "L'ingrédient a été mis à jour.",
  deleted: "L'ingrédient a été supprimé.",
};

const FILTERS = ["allergens", "unused"] as const;

/**
 * /admin/ingredients — ingredients and allergens used in the composition of products
 * and dishes: compact table + quick-add card.
 */
export default function IngredientsPage({ searchParams }: PageProps<"/admin/ingredients">) {
  return (
    <>
      <AdminPageHeader
        title="Ingrédients"
        description="La liste commune des ingrédients et des allergènes, cochés dans la composition des produits et des plats."
        breadcrumbs={[{ label: "Tableau de bord", href: "/admin" }, { label: "Ingrédients" }]}
        actions={
          <Link href="/admin/ingredients/nouveau" className={buttonStyles()}>
            <Plus aria-hidden="true" />
            Nouvel ingrédient
          </Link>
        }
      />
      <FlashMessage messages={FLASH_MESSAGES} />
      <Suspense fallback={<CatalogListSkeleton columns={5} rows={10} />}>
        <IngredientsList searchParams={searchParams} />
      </Suspense>
    </>
  );
}

function usage(ingredient: AdminIngredientRow) {
  return ingredient.productCount + ingredient.dishCount;
}

async function IngredientsList({ searchParams }: Pick<PageProps<"/admin/ingredients">, "searchParams">) {
  await requireAdmin();
  const query = listQuery(await searchParams);
  const search = textParam(query, "q");
  const filter = choiceParam(query, "status", FILTERS);

  const ingredients = await listIngredients();
  const matching = ingredients.filter((ingredient) =>
    matchesSearch(search, ingredient.name, ingredient.nameAr, ingredient.slug),
  );
  const filtered = matching.filter((ingredient) => {
    if (filter === "allergens") return ingredient.isAllergen;
    if (filter === "unused") return usage(ingredient) === 0;
    return true;
  });
  const page = paginateRows(filtered, pageParam(query));

  return (
    <>
      <FormSection
        id="ajouter"
        title="Ajouter un ingrédient"
        description="Il pourra ensuite être coché dans la composition des produits et des plats. L'identifiant (slug) est créé à partir du nom."
        className="mb-6"
      >
        {/* A new key after each addition (the list grows): the card starts empty again. */}
        <IngredientForm key={ingredients.length} action={createIngredientAction} submitLabel="Ajouter" variant="card" />
      </FormSection>

      <div className="min-w-0">
        <div className="mb-3">
          <SearchForm basePath={BASE_PATH} query={query} placeholder="Nom, nom arabe ou slug…" />
        </div>
        <FilterTabs
          basePath={BASE_PATH}
          query={query}
          className="mb-4"
          label="Filtrer les ingrédients"
          tabs={[
            { value: "", label: "Tous", count: matching.length },
            { value: "allergens", label: "Allergènes", count: matching.filter((i) => i.isAllergen).length },
            { value: "unused", label: "Non utilisés", count: matching.filter((i) => usage(i) === 0).length },
          ]}
        />

        <DataTable caption="Ingrédients et allergènes" tableClassName="min-w-[40rem]">
          <Thead>
            <Th>Ingrédient</Th>
            <Th>Slug</Th>
            <Th>Allergène</Th>
            <Th>Utilisé dans</Th>
            <Th align="end">
              <span className="sr-only">Actions</span>
            </Th>
          </Thead>
          <Tbody>
            {page.items.length === 0 ? (
              <EmptyTableRow
                colSpan={5}
                icon={<Carrot />}
                title={ingredients.length === 0 ? "Aucun ingrédient pour l'instant" : "Aucun ingrédient ne correspond"}
                description={
                  ingredients.length === 0
                    ? "Ajoutez les ingrédients avec le formulaire « Ajouter un ingrédient »."
                    : "Modifiez la recherche ou le filtre."
                }
              />
            ) : (
              page.items.map((ingredient) => (
                <Tr key={ingredient.id}>
                  <Td className="py-2.5">
                    <Link href={`${BASE_PATH}/${ingredient.id}`} className="font-semibold text-ink hover:text-brand-700 hover:underline">
                      {ingredient.name}
                    </Link>
                    {ingredient.nameAr ? (
                      <p className="text-xs text-ink-subtle">
                        <span dir="rtl" lang="ar">
                          {ingredient.nameAr}
                        </span>
                      </p>
                    ) : null}
                  </Td>
                  <Td className="py-2.5 font-mono text-xs">{ingredient.slug}</Td>
                  <Td className="py-2.5">
                    {ingredient.isAllergen ? (
                      <Badge tone="red">
                        <TriangleExclamationPoint aria-hidden="true" />
                        Allergène
                      </Badge>
                    ) : (
                      <>
                        <span className="text-ink-subtle" aria-hidden="true">
                          —
                        </span>
                        <span className="sr-only">Non</span>
                      </>
                    )}
                  </Td>
                  <Td className="py-2.5 whitespace-nowrap">
                    {usage(ingredient) === 0 ? (
                      <span className="text-ink-subtle">Non utilisé</span>
                    ) : (
                      <>
                        {ingredient.productCount > 0 ? (
                          <Link
                            href={`/admin/produits?q=${encodeURIComponent(ingredient.name)}`}
                            className="font-medium text-ink hover:text-brand-700 hover:underline"
                          >
                            {plural(ingredient.productCount, "produit")}
                          </Link>
                        ) : null}
                        {ingredient.productCount > 0 && ingredient.dishCount > 0 ? <span className="text-ink-subtle"> · </span> : null}
                        {ingredient.dishCount > 0 ? <span>{plural(ingredient.dishCount, "plat")}</span> : null}
                      </>
                    )}
                  </Td>
                  <Td align="end" className="py-2.5">
                    <div className="flex items-center justify-end gap-1">
                      <EditRowLink href={`${BASE_PATH}/${ingredient.id}`} label={`Modifier « ${ingredient.name} »`} />
                      <ConfirmDeleteButton
                        action={deleteIngredientAction.bind(null, ingredient.id)}
                        label={`Supprimer « ${ingredient.name} »`}
                        title={`Supprimer l'ingrédient « ${ingredient.name} » ?`}
                        description={
                          usage(ingredient) > 0
                            ? `Il sera retiré de la composition de ${plural(ingredient.productCount, "produit")} et ${plural(ingredient.dishCount, "plat")}. Cette action est définitive.`
                            : "Il n'est utilisé dans aucun produit ni plat. Cette action est définitive."
                        }
                        variant="ghost"
                        iconOnly
                      />
                    </div>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </DataTable>
        <AdminPagination basePath={BASE_PATH} query={query} {...page} />
      </div>
    </>
  );
}
