import { CalendarClock, Eye, EyeOff, Plus, Store } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { AdminEmpty } from "@/components/admin/admin-empty";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { FilterBar } from "@/components/admin/catalog/filter-bar";
import { GuaranteeLevelBadge } from "@/components/admin/catalog/guarantee";
import { PHOTO_SKIPPED_CODE, PHOTO_SKIPPED_MESSAGE, PRODUCER_TYPE_ICON_KEYS, PRODUCER_TYPE_LABELS } from "@/components/admin/catalog/labels";
import { choiceParam, listQuery, pageParam, paginateRows, plural, textParam } from "@/components/admin/catalog/list-query";
import { QuickToggle } from "@/components/admin/catalog/quick-toggle";
import { DeleteLocked, EditRowLink } from "@/components/admin/catalog/record-parts";
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
import { formatDate } from "@/lib/format";
import { GOVERNORATES, isGovernorate } from "@/lib/tunisia";
import { listProducers } from "@/models/fetchers/admin/producers";
import { PRODUCER_TYPES } from "@/types";

import { deleteProducerAction, toggleProducerActiveAction } from "./actions";

export const metadata: Metadata = { title: "Artisans" };

const BASE_PATH = "/admin/artisans";

const FLASH_MESSAGES = {
  created: "L'artisan a été ajouté.",
  updated: "La fiche de l'artisan a été mise à jour.",
  deleted: "L'artisan a été supprimé.",
  [PHOTO_SKIPPED_CODE]: PHOTO_SKIPPED_MESSAGE,
};

const STATUSES = ["active", "inactive", "review"] as const;

/**
 * /admin/artisans — the small businesses whose products are sold (spec 5.2 "fiche adresse").
 * Static header; the list (session check + data) streams in below.
 */
export default function ProducersPage({ searchParams }: PageProps<"/admin/artisans">) {
  return (
    <>
      <AdminPageHeader
        title="Artisans"
        description="Boulangeries, boutiques, épiceries, cuisines à domicile et coopératives partenaires, avec leur niveau de garantie."
        breadcrumbs={[{ label: "Tableau de bord", href: "/admin" }, { label: "Artisans" }]}
        actions={
          <Link href="/admin/artisans/nouveau" className={buttonStyles()}>
            <Plus aria-hidden="true" />
            Nouvel artisan
          </Link>
        }
      />
      <FlashMessage messages={FLASH_MESSAGES} />
      <Suspense fallback={<CatalogListSkeleton columns={8} filters={2} />}>
        <ProducersList searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function ProducersList({ searchParams }: Pick<PageProps<"/admin/artisans">, "searchParams">) {
  await requireAdmin();
  const query = listQuery(await searchParams);
  const search = textParam(query, "q");
  const type = choiceParam(query, "type", PRODUCER_TYPES);
  const governorateParam = textParam(query, "governorate", 40);
  const governorate = governorateParam && isGovernorate(governorateParam) ? governorateParam : undefined;
  const status = choiceParam(query, "status", STATUSES);

  // Search, type and governorate are filtered by the database; the status tabs (with their counts) here.
  const matching = await listProducers({ q: search, type, governorate });
  const filtered = matching.filter((producer) => {
    if (status === "active") return producer.isActive;
    if (status === "inactive") return !producer.isActive;
    if (status === "review") return producer.needsReview;
    return true;
  });
  const page = paginateRows(filtered, pageParam(query));
  const hasFilters = Boolean(search || type || governorate || status);

  if (matching.length === 0 && !hasFilters) {
    return (
      <AdminEmpty
        icon={<Store />}
        title="Aucun artisan pour l'instant"
        description="Ajoutez les petits commerces partenaires : leurs produits pourront ensuite être mis en vente."
        action={
          <Link href="/admin/artisans/nouveau" className={buttonStyles()}>
            <Plus aria-hidden="true" />
            Ajouter le premier artisan
          </Link>
        }
      />
    );
  }

  return (
    <>
      <div className="mb-3 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <SearchForm basePath={BASE_PATH} query={query} placeholder="Nom, ville ou slug…" />
        <FilterBar
          basePath={BASE_PATH}
          query={query}
          selects={[
            {
              name: "type",
              label: "Type d'artisan",
              placeholder: "Tous les types",
              options: PRODUCER_TYPES.map((value) => ({ value, label: PRODUCER_TYPE_LABELS[value] })),
            },
            {
              name: "governorate",
              label: "Gouvernorat",
              placeholder: "Tous les gouvernorats",
              options: GOVERNORATES.map((item) => ({ value: item.value, label: item.value })),
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
          { value: "", label: "Tous", count: matching.length },
          { value: "active", label: "Actifs", count: matching.filter((p) => p.isActive).length },
          { value: "inactive", label: "Inactifs", count: matching.filter((p) => !p.isActive).length },
          { value: "review", label: "À revérifier", count: matching.filter((p) => p.needsReview).length },
        ]}
      />

      <DataTable caption="Artisans partenaires" tableClassName="min-w-[56rem]">
        <Thead>
          <Th>Artisan</Th>
          <Th>Ville</Th>
          <Th>Garantie</Th>
          <Th align="end">Produits</Th>
          <Th>Vérification</Th>
          <Th>Statut</Th>
          <Th align="end">
            <span className="sr-only">Actions</span>
          </Th>
        </Thead>
        <Tbody>
          {page.items.length === 0 ? (
            <EmptyTableRow
              colSpan={7}
              icon={<Store />}
              title="Aucun artisan ne correspond"
              description="Modifiez la recherche ou les filtres."
              action={
                <Link href={BASE_PATH} className={buttonStyles({ variant: "outline", size: "sm" })}>
                  Voir tous les artisans
                </Link>
              }
            />
          ) : (
            page.items.map((producer) => (
              <Tr key={producer.id}>
                <Td>
                  <div className="flex items-center gap-3">
                    <CloudImage
                      src={producer.imageUrl}
                      alt={`Photo de ${producer.name}`}
                      sizes="44px"
                      fallbackIcon={PRODUCER_TYPE_ICON_KEYS[producer.type]}
                      className="size-11 shrink-0"
                      rounded="rounded-xl"
                    />
                    <div className="min-w-0">
                      <Link
                        href={`${BASE_PATH}/${producer.id}`}
                        className="block max-w-[16rem] truncate font-semibold text-ink hover:text-brand-700 hover:underline"
                      >
                        {producer.name}
                      </Link>
                      <p className="text-xs text-ink-subtle">{PRODUCER_TYPE_LABELS[producer.type]}</p>
                    </div>
                  </div>
                </Td>
                <Td className="whitespace-nowrap">
                  <span className="text-ink">{producer.city}</span>
                  {producer.city !== producer.governorate ? (
                    <span className="block text-xs text-ink-subtle">{producer.governorate}</span>
                  ) : null}
                </Td>
                <Td>
                  <GuaranteeLevelBadge level={producer.guaranteeLevel} />
                </Td>
                <Td align="end" className="whitespace-nowrap">
                  {producer.productCount > 0 ? (
                    <Link
                      href={`/admin/produits?producer=${producer.id}`}
                      className="font-semibold text-ink tabular hover:text-brand-700 hover:underline"
                    >
                      {plural(producer.productCount, "produit")}
                    </Link>
                  ) : (
                    <span className="text-ink-subtle">Aucun</span>
                  )}
                </Td>
                <Td className="whitespace-nowrap">
                  <span className="tabular">{formatDate(producer.verifiedAt)}</span>
                  <span className="block max-w-[11rem] truncate text-xs text-ink-subtle" title={producer.verificationSource}>
                    {producer.verificationSource}
                  </span>
                  {producer.needsReview ? (
                    <Badge tone="amber" className="mt-1">
                      <CalendarClock aria-hidden="true" />À revérifier
                    </Badge>
                  ) : null}
                </Td>
                <Td>
                  <QuickToggle
                    action={toggleProducerActiveAction.bind(null, producer.id, !producer.isActive)}
                    tone={producer.isActive ? "on" : "off"}
                    icon={producer.isActive ? <Eye /> : <EyeOff />}
                    label={producer.isActive ? "Actif" : "Inactif"}
                    actionLabel={producer.isActive ? `Masquer « ${producer.name} » du site` : `Afficher « ${producer.name} » sur le site`}
                  />
                </Td>
                <Td align="end">
                  <div className="flex items-center justify-end gap-1">
                    <EditRowLink href={`${BASE_PATH}/${producer.id}`} label={`Modifier « ${producer.name} »`} />
                    {producer.productCount === 0 ? (
                      <ConfirmDeleteButton
                        action={deleteProducerAction.bind(null, producer.id)}
                        label={`Supprimer « ${producer.name} »`}
                        title={`Supprimer l'artisan « ${producer.name} » ?`}
                        description="Sa fiche disparaît du site. Cette action est définitive."
                        variant="ghost"
                        iconOnly
                      />
                    ) : (
                      <DeleteLocked
                        reason={`Suppression impossible : ${plural(producer.productCount, "produit")} rattaché(s). Masquez plutôt l'artisan.`}
                      />
                    )}
                  </div>
                </Td>
              </Tr>
            ))
          )}
        </Tbody>
      </DataTable>
      <AdminPagination basePath={BASE_PATH} query={query} {...page} />
    </>
  );
}
