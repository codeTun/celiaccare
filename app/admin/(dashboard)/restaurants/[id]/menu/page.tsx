import { Ban, CircleCheck, Pencil, Plus, UtensilsCrossed } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { QuickActionButton } from "@/components/admin/community/quick-action-button";
import { AdminListSkeleton } from "@/components/admin/community/skeletons";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { DataTable, EmptyTableRow, Tbody, Td, Th, Thead, Tr } from "@/components/admin/data-table";
import { FlashMessage } from "@/components/admin/flash-message";
import { COURSE_ICONS, COURSE_LABELS } from "@/components/admin/restaurants/labels";
import { RestaurantSummary } from "@/components/admin/restaurants/restaurant-summary";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { CloudImage } from "@/components/ui/cloud-image";
import { requireAdmin } from "@/lib/auth/session";
import { formatPrice } from "@/lib/format";
import { idSchema } from "@/lib/validators";
import { listDishes, type AdminMenuDishRow } from "@/models/fetchers/admin/dishes";
import { getRestaurant } from "@/models/fetchers/admin/restaurants";
import { DISH_COURSES, type DishCourse } from "@/types";

import { deleteDishAction, setDishAvailableAction } from "./actions";

export const metadata: Metadata = { title: "Menu du restaurant" };

const FLASH_MESSAGES = {
  created: "Le plat a été ajouté au menu.",
  "created-without-photo": "Le plat a été ajouté, sans la photo : Cloudinary n'est pas configuré.",
  updated: "Le plat a été modifié.",
  "updated-without-photo": "Le plat a été modifié, sans la nouvelle photo : Cloudinary n'est pas configuré.",
  deleted: "Le plat a été retiré du menu.",
};

/** /admin/restaurants/[id]/menu — the dishes of a restaurant, by part of the menu. */
export default function RestaurantMenuPage({ params }: PageProps<"/admin/restaurants/[id]/menu">) {
  return (
    <>
      <AdminPageHeader
        title="Menu du restaurant"
        description="Les plats affichés sur la fiche, par partie du menu. Un plat indisponible reste visible mais ne peut pas être commandé."
        breadcrumbs={[
          { label: "Tableau de bord", href: "/admin" },
          { label: "Restaurants", href: "/admin/restaurants" },
          { label: "Menu" },
        ]}
      />
      <FlashMessage messages={FLASH_MESSAGES} />
      <Suspense fallback={<AdminListSkeleton rows={6} />}>
        <RestaurantMenu params={params} />
      </Suspense>
    </>
  );
}

async function RestaurantMenu({ params }: Pick<PageProps<"/admin/restaurants/[id]/menu">, "params">) {
  await requireAdmin();
  const id = idSchema.safeParse((await params).id);
  if (!id.success) notFound();
  const [restaurant, dishes] = await Promise.all([getRestaurant(id.data), listDishes(id.data)]);
  if (!restaurant) notFound();

  const menuPath = `/admin/restaurants/${restaurant.id}/menu`;
  const available = dishes.filter((dish) => dish.isAvailable).length;

  return (
    <>
      <RestaurantSummary
        restaurant={restaurant}
        actions={
          <>
            <Link href={`${menuPath}/nouveau`} className={buttonStyles({ size: "sm" })}>
              <Plus aria-hidden="true" />
              Ajouter un plat
            </Link>
            <Link href={`/admin/restaurants/${restaurant.id}`} className={buttonStyles({ variant: "outline", size: "sm" })}>
              <Pencil aria-hidden="true" />
              Modifier la fiche
            </Link>
          </>
        }
      />

      {restaurant.isPartner ? null : (
        <Alert tone="info" className="mb-6">
          Restaurant de l&apos;annuaire : son menu est affiché sur sa fiche, mais il ne peut pas être commandé en ligne. Cochez
          « Restaurant conventionné » dans sa fiche pour ouvrir la commande.
        </Alert>
      )}

      <p className="mb-4 text-sm text-ink-muted" role="status">
        <span className="font-semibold text-ink tabular">{dishes.length}</span> plat{dishes.length > 1 ? "s" : ""} au menu
        {dishes.length > 0 ? (
          <>
            {" "}
            · <span className="tabular">{available}</span> disponible{available > 1 ? "s" : ""}
            {dishes.length - available > 0 ? (
              <span className="text-amber-800">
                {" "}
                · <span className="tabular">{dishes.length - available}</span> indisponible{dishes.length - available > 1 ? "s" : ""}
              </span>
            ) : null}
          </>
        ) : null}
      </p>

      <div className="space-y-8">
        {DISH_COURSES.map((course) => (
          <CourseTable
            key={course}
            course={course}
            dishes={dishes.filter((dish) => dish.course === course)}
            menuPath={menuPath}
          />
        ))}
      </div>
    </>
  );
}

function CourseTable({ course, dishes, menuPath }: { course: DishCourse; dishes: AdminMenuDishRow[]; menuPath: string }) {
  const labels = COURSE_LABELS[course];
  const headingId = `course-${course.toLowerCase()}`;
  return (
    <section aria-labelledby={headingId}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 id={headingId} className="flex items-center gap-2 text-lg font-bold text-ink">
          {labels.plural}
          <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-ink-subtle ring-1 ring-line tabular">
            {dishes.length}
          </span>
        </h2>
        <Link href={`${menuPath}/nouveau?course=${course}`} className={buttonStyles({ variant: "ghost", size: "sm" })}>
          <Plus aria-hidden="true" />
          {labels.add}
        </Link>
      </div>
      <DataTable caption={`${labels.plural} du menu`} tableClassName="min-w-[52rem]" stickyHeader={false}>
        <Thead>
          <Th>Plat</Th>
          <Th>Ingrédients</Th>
          <Th align="end">Prix</Th>
          <Th align="center">Ordre</Th>
          <Th>Disponibilité</Th>
          <Th align="end">
            <span className="sr-only">Actions</span>
          </Th>
        </Thead>
        <Tbody>
          {dishes.length === 0 ? (
            <EmptyTableRow colSpan={6} icon={<UtensilsCrossed />} title={labels.empty} />
          ) : (
            dishes.map((dish) => <DishRow key={dish.id} dish={dish} menuPath={menuPath} />)
          )}
        </Tbody>
      </DataTable>
    </section>
  );
}

function DishRow({ dish, menuPath }: { dish: AdminMenuDishRow; menuPath: string }) {
  const editHref = `${menuPath}/${dish.id}`;
  return (
    <Tr className={dish.isAvailable ? undefined : "bg-canvas/60"}>
      <Td>
        <div className="flex min-w-[14rem] items-center gap-3">
          <CloudImage
            src={dish.imageUrl}
            alt=""
            sizes="44px"
            fallbackIcon={COURSE_ICONS[dish.course]}
            className="size-11 shrink-0"
            rounded="rounded-xl"
          />
          <div className="min-w-0">
            <Link href={editHref} className="font-semibold text-ink hover:text-brand-700 hover:underline">
              {dish.name}
            </Link>
            {dish.nameAr ? (
              <p dir="rtl" lang="ar" className="truncate text-start text-xs text-ink-subtle">
                {dish.nameAr}
              </p>
            ) : null}
          </div>
        </div>
      </Td>
      <Td className="max-w-[20rem]">
        {dish.ingredientNames.length === 0 ? (
          <span className="text-xs text-amber-800">Ingrédients non renseignés</span>
        ) : (
          <p className="line-clamp-2 text-xs leading-relaxed" title={dish.ingredientNames.join(", ")}>
            {dish.ingredientNames.join(", ")}
          </p>
        )}
        {dish.allergenNames.length > 0 ? (
          <div className="mt-1 flex flex-wrap gap-1">
            {dish.allergenNames.map((allergen) => (
              <Badge key={allergen} tone="amber" className="px-2 py-0 text-[0.7rem]">
                {allergen}
              </Badge>
            ))}
          </div>
        ) : null}
      </Td>
      <Td align="end" className="font-semibold whitespace-nowrap text-ink tabular">
        {formatPrice(dish.price)}
      </Td>
      <Td align="center" className="tabular">
        {dish.sortOrder}
      </Td>
      <Td className="whitespace-nowrap">
        {dish.isAvailable ? <Badge tone="brand">Disponible</Badge> : <Badge tone="amber">Indisponible</Badge>}
      </Td>
      <Td align="end">
        <div className="flex items-start justify-end gap-1">
          <QuickActionButton
            action={setDishAvailableAction.bind(null, dish.id, !dish.isAvailable)}
            label={dish.isAvailable ? "Marquer épuisé" : "Remettre en vente"}
            pendingLabel="Mise à jour…"
            icon={dish.isAvailable ? <Ban aria-hidden="true" /> : <CircleCheck aria-hidden="true" />}
            variant={dish.isAvailable ? "ghost" : "secondary"}
          />
          <Link href={editHref} title="Modifier" className={buttonStyles({ variant: "ghost", size: "icon-sm" })}>
            <Pencil aria-hidden="true" />
            <span className="sr-only">Modifier {dish.name}</span>
          </Link>
          <ConfirmDeleteButton
            action={deleteDishAction.bind(null, dish.id)}
            hiddenFields={{ stay: "1" }}
            label={`Supprimer ${dish.name}`}
            title={`Retirer « ${dish.name} » du menu ?`}
            description="Le plat est supprimé définitivement. Les commandes passées gardent leur historique. Pour le retirer temporairement, utilisez plutôt « Marquer épuisé »."
            variant="ghost"
            iconOnly
          />
        </div>
      </Td>
    </Tr>
  );
}
