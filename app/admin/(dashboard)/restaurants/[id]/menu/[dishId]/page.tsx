import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminFormSkeleton } from "@/components/admin/community/skeletons";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { DishForm } from "@/components/admin/restaurants/dish-form";
import { RestaurantSummary } from "@/components/admin/restaurants/restaurant-summary";
import { buttonStyles } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/session";
import { isCloudinaryConfigured } from "@/lib/cloudinary";
import { idSchema } from "@/lib/validators";
import { getDish } from "@/models/fetchers/admin/dishes";
import { listIngredientOptions } from "@/models/fetchers/admin/ingredients";
import { getRestaurant } from "@/models/fetchers/admin/restaurants";

import { deleteDishAction, updateDishAction } from "../actions";

export const metadata: Metadata = { title: "Modifier un plat" };

/** /admin/restaurants/[id]/menu/[dishId] — edit (or delete) a dish of the menu. */
export default function EditDishPage({ params }: PageProps<"/admin/restaurants/[id]/menu/[dishId]">) {
  return (
    <>
      <AdminPageHeader
        title="Modifier le plat"
        description="Les changements sont visibles sur la fiche du restaurant dès l'enregistrement."
        breadcrumbs={[
          { label: "Tableau de bord", href: "/admin" },
          { label: "Restaurants", href: "/admin/restaurants" },
          { label: "Menu" },
          { label: "Modifier le plat" },
        ]}
      />
      <Suspense fallback={<AdminFormSkeleton sections={3} aside />}>
        <EditDish params={params} />
      </Suspense>
    </>
  );
}

async function EditDish({ params }: Pick<PageProps<"/admin/restaurants/[id]/menu/[dishId]">, "params">) {
  await requireAdmin();
  const { id, dishId } = await params;
  const restaurantId = idSchema.safeParse(id);
  const parsedDishId = idSchema.safeParse(dishId);
  if (!restaurantId.success || !parsedDishId.success) notFound();

  const [restaurant, dish, ingredients] = await Promise.all([
    getRestaurant(restaurantId.data),
    getDish(parsedDishId.data),
    listIngredientOptions(),
  ]);
  // The dish must belong to the restaurant of the URL.
  if (!restaurant || !dish || dish.restaurantId !== restaurant.id) notFound();

  const menuPath = `/admin/restaurants/${restaurant.id}/menu`;
  return (
    <>
      <RestaurantSummary
        restaurant={restaurant}
        actions={
          <>
            <Link href={menuPath} className={buttonStyles({ variant: "outline", size: "sm" })}>
              <ArrowLeft aria-hidden="true" />
              Retour au menu
            </Link>
            <ConfirmDeleteButton
              action={deleteDishAction.bind(null, dish.id)}
              label="Supprimer le plat"
              title={`Retirer « ${dish.name} » du menu ?`}
              description="Le plat est supprimé définitivement. Les commandes passées gardent leur historique. Pour le retirer temporairement, décochez plutôt « Disponible à la commande »."
            />
          </>
        }
      />
      <DishForm
        action={updateDishAction.bind(null, dish.id)}
        dish={dish}
        defaultCourse={dish.course}
        ingredients={ingredients}
        cloudinaryReady={isCloudinaryConfigured()}
        cancelHref={menuPath}
      />
    </>
  );
}
