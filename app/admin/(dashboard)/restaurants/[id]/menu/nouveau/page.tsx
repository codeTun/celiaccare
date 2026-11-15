import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { z } from "zod";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminFormSkeleton } from "@/components/admin/community/skeletons";
import { firstParam } from "@/components/admin/query-string";
import { DishForm } from "@/components/admin/restaurants/dish-form";
import { RestaurantSummary } from "@/components/admin/restaurants/restaurant-summary";
import { buttonStyles } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/session";
import { isCloudinaryConfigured } from "@/lib/cloudinary";
import { idSchema } from "@/lib/validators";
import { listIngredientOptions } from "@/models/fetchers/admin/ingredients";
import { getRestaurant } from "@/models/fetchers/admin/restaurants";
import { DISH_COURSES } from "@/types";

import { createDishAction } from "../actions";

export const metadata: Metadata = { title: "Nouveau plat" };

/** ?course=DESSERT pre-selects the part of the menu (a wrong value is ignored). */
const courseParam = z.enum(DISH_COURSES).catch("MAIN");

/** /admin/restaurants/[id]/menu/nouveau — add a dish to the menu. */
export default function NewDishPage({ params, searchParams }: PageProps<"/admin/restaurants/[id]/menu/nouveau">) {
  return (
    <>
      <AdminPageHeader
        title="Nouveau plat"
        description="Ajoutez un plat au menu : il apparaît aussitôt sur la fiche du restaurant."
        breadcrumbs={[
          { label: "Tableau de bord", href: "/admin" },
          { label: "Restaurants", href: "/admin/restaurants" },
          { label: "Menu" },
          { label: "Nouveau plat" },
        ]}
      />
      <Suspense fallback={<AdminFormSkeleton sections={3} aside />}>
        <NewDish params={params} searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function NewDish({ params, searchParams }: Pick<PageProps<"/admin/restaurants/[id]/menu/nouveau">, "params" | "searchParams">) {
  await requireAdmin();
  const id = idSchema.safeParse((await params).id);
  if (!id.success) notFound();
  const [restaurant, ingredients, query] = await Promise.all([getRestaurant(id.data), listIngredientOptions(), searchParams]);
  if (!restaurant) notFound();

  const menuPath = `/admin/restaurants/${restaurant.id}/menu`;
  return (
    <>
      <RestaurantSummary
        restaurant={restaurant}
        actions={
          <Link href={menuPath} className={buttonStyles({ variant: "outline", size: "sm" })}>
            <ArrowLeft aria-hidden="true" />
            Retour au menu
          </Link>
        }
      />
      <DishForm
        action={createDishAction.bind(null, restaurant.id)}
        dish={null}
        defaultCourse={courseParam.parse(firstParam(query.course))}
        ingredients={ingredients}
        cloudinaryReady={isCloudinaryConfigured()}
        cancelHref={menuPath}
      />
    </>
  );
}
