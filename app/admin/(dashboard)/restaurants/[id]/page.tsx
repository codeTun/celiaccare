import { ExternalLink, UtensilsCrossed } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminFormSkeleton } from "@/components/admin/community/skeletons";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { toDateInputValue } from "@/components/admin/date-field";
import { RestaurantForm } from "@/components/admin/restaurants/restaurant-form";
import { RestaurantSummary } from "@/components/admin/restaurants/restaurant-summary";
import { buttonStyles } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/session";
import { isCloudinaryConfigured } from "@/lib/cloudinary";
import { idSchema } from "@/lib/validators";
import { getRestaurant } from "@/models/fetchers/admin/restaurants";

import { deleteRestaurantAction, updateRestaurantAction } from "../actions";

export const metadata: Metadata = { title: "Modifier un restaurant" };

/** /admin/restaurants/[id] — edit a restaurant sheet (or delete it). */
export default function EditRestaurantPage({ params }: PageProps<"/admin/restaurants/[id]">) {
  return (
    <>
      <AdminPageHeader
        title="Modifier le restaurant"
        description="Les changements sont visibles sur le site dès l'enregistrement."
        breadcrumbs={[
          { label: "Tableau de bord", href: "/admin" },
          { label: "Restaurants", href: "/admin/restaurants" },
          { label: "Modifier" },
        ]}
      />
      <Suspense fallback={<AdminFormSkeleton sections={4} aside />}>
        <EditRestaurant params={params} />
      </Suspense>
    </>
  );
}

async function EditRestaurant({ params }: Pick<PageProps<"/admin/restaurants/[id]">, "params">) {
  await requireAdmin();
  const id = idSchema.safeParse((await params).id);
  if (!id.success) notFound();
  const restaurant = await getRestaurant(id.data);
  if (!restaurant) notFound();

  return (
    <>
      <RestaurantSummary
        restaurant={restaurant}
        actions={
          <>
            <Link href={`/admin/restaurants/${restaurant.id}/menu`} className={buttonStyles({ variant: "secondary", size: "sm" })}>
              <UtensilsCrossed aria-hidden="true" />
              Gérer le menu
            </Link>
            {restaurant.isActive ? (
              <a
                href={`/fr/restaurants/${encodeURIComponent(restaurant.slug)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonStyles({ variant: "outline", size: "sm" })}
              >
                <ExternalLink aria-hidden="true" />
                Voir sur le site
              </a>
            ) : null}
            <ConfirmDeleteButton
              action={deleteRestaurantAction.bind(null, restaurant.id)}
              label="Supprimer"
              title={`Supprimer « ${restaurant.name} » ?`}
              description="La fiche, le menu et les avis du restaurant sont supprimés définitivement. Les commandes passées gardent leur historique. Pour le retirer du site sans rien perdre, décochez plutôt « Visible sur le site »."
            />
          </>
        }
      />
      <RestaurantForm
        action={updateRestaurantAction.bind(null, restaurant.id)}
        restaurant={restaurant}
        cloudinaryReady={isCloudinaryConfigured()}
        today={toDateInputValue(new Date())}
      />
    </>
  );
}
