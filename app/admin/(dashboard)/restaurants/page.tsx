import { ExternalLink, Eye, EyeOff, Pencil, Plus, UtensilsCrossed } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { z } from "zod";

import { AdminEmpty } from "@/components/admin/admin-empty";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { QueryReset } from "@/components/admin/community/query-reset";
import { QuerySelect } from "@/components/admin/community/query-select";
import { QuickActionButton } from "@/components/admin/community/quick-action-button";
import { AdminListSkeleton } from "@/components/admin/community/skeletons";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { DataTable, EmptyTableRow, Tbody, Td, Th, Thead, Tr } from "@/components/admin/data-table";
import { FilterTabs } from "@/components/admin/filter-tabs";
import { FlashMessage } from "@/components/admin/flash-message";
import { firstParam, type AdminQuery } from "@/components/admin/query-string";
import { GUARANTEE_LABELS, RESTAURANT_ICON } from "@/components/admin/restaurants/labels";
import { SearchForm } from "@/components/admin/search-form";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { CloudImage } from "@/components/ui/cloud-image";
import { GuaranteeBadge } from "@/components/ui/guarantee-badge";
import { requireAdmin } from "@/lib/auth/session";
import { formatDate } from "@/lib/format";
import { GOVERNORATES } from "@/lib/tunisia";
import { governorate } from "@/lib/validators";
import { countRestaurants, listRestaurantsPage, type AdminRestaurantListRow } from "@/models/fetchers/admin/restaurants";

import { deleteRestaurantAction, setRestaurantActiveAction } from "./actions";

export const metadata: Metadata = { title: "Restaurants" };

const BASE_PATH = "/admin/restaurants";

const FLASH_MESSAGES = {
  created: "Le restaurant a été créé.",
  "created-without-photo": "Le restaurant a été créé, sans la photo : Cloudinary n'est pas configuré.",
  updated: "Les modifications du restaurant ont été enregistrées.",
  "updated-without-photo": "Les modifications ont été enregistrées, sans la nouvelle photo : Cloudinary n'est pas configuré.",
  deleted: "Le restaurant et son menu ont été supprimés.",
};

const GOVERNORATE_OPTIONS = GOVERNORATES.map((g) => ({ value: g.value, label: g.value }));
const VISIBILITY_OPTIONS = { "1": "Visibles sur le site", "0": "Masqués" };

/** The filters of the URL, checked: a wrong value is simply ignored (never an error page). */
const listQuerySchema = z.object({
  q: z.string().trim().max(100).optional().catch(undefined),
  governorate: governorate.optional().catch(undefined),
  partner: z.enum(["1", "0"]).optional().catch(undefined),
  active: z.enum(["1", "0"]).optional().catch(undefined),
  page: z.coerce.number().int().min(1).max(10_000).catch(1),
});

/**
 * /admin/restaurants — the partner restaurants ("conventionnés") and the restaurants of
 * the directory: search, filters, quick show / hide, edit, menu and delete.
 */
export default function RestaurantsPage({ searchParams }: PageProps<"/admin/restaurants">) {
  return (
    <>
      <AdminPageHeader
        title="Restaurants"
        description="Les restaurants sans gluten de l'annuaire. Les restaurants conventionnés reçoivent des commandes en ligne."
        breadcrumbs={[{ label: "Tableau de bord", href: "/admin" }, { label: "Restaurants" }]}
        actions={
          <Link href={`${BASE_PATH}/nouveau`} className={buttonStyles()}>
            <Plus aria-hidden="true" />
            Ajouter un restaurant
          </Link>
        }
      />
      <FlashMessage messages={FLASH_MESSAGES} />
      <Suspense fallback={<AdminListSkeleton />}>
        <RestaurantsList searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function RestaurantsList({ searchParams }: Pick<PageProps<"/admin/restaurants">, "searchParams">) {
  await requireAdmin();
  const query: AdminQuery = await searchParams;
  const filters = listQuerySchema.parse({
    q: firstParam(query.q),
    governorate: firstParam(query.governorate),
    partner: firstParam(query.partner),
    active: firstParam(query.active),
    page: firstParam(query.page),
  });

  const [restaurants, counts] = await Promise.all([
    listRestaurantsPage({
      q: filters.q || undefined,
      governorate: filters.governorate,
      partner: filters.partner === undefined ? undefined : filters.partner === "1",
      active: filters.active === undefined ? undefined : filters.active === "1",
      page: filters.page,
    }),
    countRestaurants(),
  ]);

  if (counts.total === 0) {
    return (
      <AdminEmpty
        icon={<UtensilsCrossed />}
        title="Aucun restaurant pour l'instant"
        description="Ajoutez le premier restaurant sans gluten : sa fiche, ses contacts, puis son menu."
        action={
          <Link href={`${BASE_PATH}/nouveau`} className={buttonStyles()}>
            <Plus aria-hidden="true" />
            Ajouter un restaurant
          </Link>
        }
      />
    );
  }

  const isFiltered = Boolean(filters.q || filters.governorate || filters.partner || filters.active);

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <FilterTabs
          basePath={BASE_PATH}
          query={query}
          param="partner"
          label="Filtrer par convention"
          tabs={[
            { value: "", label: "Tous", count: counts.total },
            { value: "1", label: "Conventionnés", count: counts.partners },
            { value: "0", label: "Annuaire seulement", count: counts.directoryOnly },
          ]}
        />
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <QuerySelect
            basePath={BASE_PATH}
            query={query}
            name="governorate"
            label="Gouvernorat"
            options={GOVERNORATE_OPTIONS}
            placeholder="Tous les gouvernorats"
          />
          <QuerySelect
            basePath={BASE_PATH}
            query={query}
            name="active"
            label="Visibilité sur le site"
            options={VISIBILITY_OPTIONS}
            placeholder="Visibles et masqués"
          />
          <SearchForm basePath={BASE_PATH} query={query} placeholder="Nom, ville, cuisine…" className="sm:w-72" />
        </div>
      </div>
      {isFiltered ? <QueryReset href={BASE_PATH} total={restaurants.total} /> : null}

      <DataTable caption="Liste des restaurants" tableClassName="min-w-[68rem]">
        <Thead>
          <Th>Restaurant</Th>
          <Th>Localisation</Th>
          <Th>Convention</Th>
          <Th>Menu</Th>
          <Th>Garantie</Th>
          <Th>Vérifiée le</Th>
          <Th>Site</Th>
          <Th align="end">
            <span className="sr-only">Actions</span>
          </Th>
        </Thead>
        <Tbody>
          {restaurants.items.length === 0 ? (
            <EmptyTableRow
              colSpan={8}
              icon={<UtensilsCrossed />}
              title="Aucun restaurant ne correspond"
              description="Modifiez la recherche ou les filtres."
              action={
                <Link href={BASE_PATH} className={buttonStyles({ variant: "outline", size: "sm" })}>
                  Voir tous les restaurants
                </Link>
              }
            />
          ) : (
            restaurants.items.map((restaurant) => <RestaurantRow key={restaurant.id} restaurant={restaurant} />)
          )}
        </Tbody>
      </DataTable>
      <AdminPagination basePath={BASE_PATH} query={query} {...restaurants} />
    </>
  );
}

function RestaurantRow({ restaurant }: { restaurant: AdminRestaurantListRow }) {
  const editHref = `${BASE_PATH}/${restaurant.id}`;
  const menuHref = `${BASE_PATH}/${restaurant.id}/menu`;

  return (
    <Tr>
      <Td>
        <div className="flex min-w-[15rem] items-center gap-3">
          <CloudImage
            src={restaurant.imageUrl}
            alt=""
            sizes="44px"
            fallbackIcon={RESTAURANT_ICON}
            className="size-11 shrink-0"
            rounded="rounded-xl"
          />
          <div className="min-w-0">
            <Link href={editHref} className="font-semibold text-ink hover:text-brand-700 hover:underline">
              {restaurant.name}
            </Link>
            <p className="truncate text-xs text-ink-subtle">
              {restaurant.cuisine ? `${restaurant.cuisine} · ` : null}
              {restaurant.slug}
            </p>
          </div>
        </div>
      </Td>
      <Td className="whitespace-nowrap">
        <span className="text-ink">{restaurant.city}</span>
        <span className="block text-xs text-ink-subtle">{restaurant.governorate}</span>
      </Td>
      <Td className="whitespace-nowrap">
        {restaurant.isPartner ? (
          <>
            <Badge tone="saffron">Conventionné</Badge>
            {restaurant.partnerSince ? (
              <span className="mt-1 block text-xs text-ink-subtle">depuis le {formatDate(restaurant.partnerSince)}</span>
            ) : null}
          </>
        ) : (
          <Badge tone="neutral">Annuaire</Badge>
        )}
      </Td>
      <Td className="whitespace-nowrap">
        <Link href={menuHref} className="font-semibold text-ink tabular hover:text-brand-700 hover:underline">
          {restaurant.dishCount} plat{restaurant.dishCount > 1 ? "s" : ""}
        </Link>
        {restaurant.dishCount === 0 ? (
          restaurant.isPartner ? (
            <Badge tone="amber" className="mt-1 flex w-fit">
              Menu vide
            </Badge>
          ) : null
        ) : (
          <span className="block text-xs text-ink-subtle tabular">
            {restaurant.availableDishCount} disponible{restaurant.availableDishCount > 1 ? "s" : ""}
          </span>
        )}
      </Td>
      <Td>
        <GuaranteeBadge level={restaurant.guaranteeLevel} label={GUARANTEE_LABELS[restaurant.guaranteeLevel].short} />
      </Td>
      <Td className="whitespace-nowrap">
        <span className="tabular" title={restaurant.verificationSource}>
          {formatDate(restaurant.verifiedAt)}
        </span>
        {restaurant.needsReview ? (
          <Badge tone="amber" className="mt-1 flex w-fit">
            À revérifier
          </Badge>
        ) : null}
      </Td>
      <Td>
        {restaurant.isActive ? <Badge tone="brand">Visible</Badge> : <Badge tone="neutral">Masqué</Badge>}
      </Td>
      <Td align="end">
        <div className="flex items-start justify-end gap-1">
          <Link href={editHref} title="Modifier" className={buttonStyles({ variant: "ghost", size: "icon-sm" })}>
            <Pencil aria-hidden="true" />
            <span className="sr-only">Modifier {restaurant.name}</span>
          </Link>
          <Link href={menuHref} title="Gérer le menu" className={buttonStyles({ variant: "ghost", size: "icon-sm" })}>
            <UtensilsCrossed aria-hidden="true" />
            <span className="sr-only">Gérer le menu de {restaurant.name}</span>
          </Link>
          {restaurant.isActive ? (
            <a
              href={`/fr/restaurants/${encodeURIComponent(restaurant.slug)}`}
              target="_blank"
              rel="noopener noreferrer"
              title="Voir sur le site"
              className={buttonStyles({ variant: "ghost", size: "icon-sm" })}
            >
              <ExternalLink aria-hidden="true" />
              <span className="sr-only">Voir {restaurant.name} sur le site (nouvel onglet)</span>
            </a>
          ) : null}
          <QuickActionButton
            action={setRestaurantActiveAction.bind(null, restaurant.id, !restaurant.isActive)}
            label={restaurant.isActive ? `Masquer ${restaurant.name} du site` : `Afficher ${restaurant.name} sur le site`}
            pendingLabel={restaurant.isActive ? "Masquage…" : "Affichage…"}
            icon={restaurant.isActive ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
            variant="ghost"
            iconOnly
          />
          <ConfirmDeleteButton
            action={deleteRestaurantAction.bind(null, restaurant.id)}
            hiddenFields={{ stay: "1" }}
            label={`Supprimer ${restaurant.name}`}
            title={`Supprimer « ${restaurant.name} » ?`}
            description={
              <>
                La fiche, le menu ({restaurant.dishCount} plat{restaurant.dishCount > 1 ? "s" : ""}) et les avis du restaurant
                sont supprimés définitivement. Les commandes passées gardent leur historique.
                <br />
                Pour le retirer du site sans rien perdre, masquez-le plutôt.
              </>
            }
            variant="ghost"
            iconOnly
          />
        </div>
      </Td>
    </Tr>
  );
}
