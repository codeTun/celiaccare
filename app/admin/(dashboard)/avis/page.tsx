import { Check, Star, Undo2, X } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { z } from "zod";

import { AdminEmpty } from "@/components/admin/admin-empty";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { QueryReset } from "@/components/admin/community/query-reset";
import { QuickActionButton } from "@/components/admin/community/quick-action-button";
import { ReviewCard } from "@/components/admin/community/review-card";
import { AdminListSkeleton } from "@/components/admin/community/skeletons";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { FilterTabs } from "@/components/admin/filter-tabs";
import { FlashMessage } from "@/components/admin/flash-message";
import { firstParam, type AdminQuery } from "@/components/admin/query-string";
import { SearchForm } from "@/components/admin/search-form";
import { requireAdmin } from "@/lib/auth/session";
import { countReviewsByStatus, listReviews, type AdminReviewListRow } from "@/models/fetchers/admin/reviews";
import { REVIEW_STATUSES } from "@/types";

import { deleteReviewAction, moderateReviewAction } from "./actions";

export const metadata: Metadata = { title: "Avis" };

const BASE_PATH = "/admin/avis";

/** ?status= : "" (to moderate, default), APPROVED, REJECTED or "all". A wrong value shows the default view. */
const listQuerySchema = z.object({
  status: z.enum([...REVIEW_STATUSES, "all"]).optional().catch(undefined),
  q: z.string().trim().max(100).optional().catch(undefined),
  page: z.coerce.number().int().min(1).max(10_000).catch(1),
});

/** /admin/avis — ratings & comments of the visitors, published only after moderation (spec EF-22). */
export default function ReviewsPage({ searchParams }: PageProps<"/admin/avis">) {
  return (
    <>
      <AdminPageHeader
        title="Avis"
        description="Les notes et commentaires laissés par les visiteurs sur les produits et les restaurants. Rien n'est publié avant votre validation."
        breadcrumbs={[{ label: "Tableau de bord", href: "/admin" }, { label: "Avis" }]}
      />
      <FlashMessage messages={{ deleted: "L'avis a été supprimé." }} />
      <Suspense fallback={<AdminListSkeleton />}>
        <ReviewsModeration searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function ReviewsModeration({ searchParams }: Pick<PageProps<"/admin/avis">, "searchParams">) {
  await requireAdmin();
  const query: AdminQuery = await searchParams;
  const filters = listQuerySchema.parse({
    status: firstParam(query.status),
    q: firstParam(query.q),
    page: firstParam(query.page),
  });
  const view = filters.status ?? "PENDING";
  // "À modérer" is the default tab: ?status=PENDING (dashboard link) shows it as selected too.
  const tabsQuery: AdminQuery = view === "PENDING" ? { ...query, status: undefined } : query;

  const [reviews, counts] = await Promise.all([
    listReviews({ status: view === "all" ? undefined : view, q: filters.q || undefined, page: filters.page }),
    countReviewsByStatus(),
  ]);
  const now = new Date(); // request time (after the session check)

  if (counts.total === 0) {
    return (
      <AdminEmpty
        icon={<Star />}
        title="Aucun avis pour l'instant"
        description="Les avis laissés sur les fiches des produits et des restaurants apparaîtront ici, en attente de votre validation."
      />
    );
  }

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <FilterTabs
          basePath={BASE_PATH}
          query={tabsQuery}
          label="Filtrer les avis"
          tabs={[
            { value: "", label: "À modérer", count: counts.PENDING },
            { value: "APPROVED", label: "Approuvés", count: counts.APPROVED },
            { value: "REJECTED", label: "Rejetés", count: counts.REJECTED },
            { value: "all", label: "Tous", count: counts.total },
          ]}
        />
        <SearchForm basePath={BASE_PATH} query={query} placeholder="Auteur ou commentaire…" className="sm:w-80" />
      </div>
      {filters.q ? <QueryReset href={BASE_PATH} total={reviews.total} /> : null}

      {reviews.items.length === 0 ? (
        <AdminEmpty
          icon={<Star />}
          title={view === "PENDING" && !filters.q ? "Aucun avis à modérer" : "Aucun avis ne correspond"}
          description={
            view === "PENDING" && !filters.q
              ? "Tous les avis ont été traités. Les nouveaux apparaîtront ici."
              : "Modifiez la recherche ou le filtre."
          }
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {reviews.items.map((review) => (
            <ReviewCard key={review.id} review={review} now={now} actions={<ModerationButtons review={review} />} />
          ))}
        </div>
      )}
      <AdminPagination basePath={BASE_PATH} query={query} {...reviews} />
    </>
  );
}

/** Publish / refuse / delete, depending on where the review stands (actions bound here, on the server). */
function ModerationButtons({ review }: { review: AdminReviewListRow }) {
  return (
    <>
      {review.status === "APPROVED" ? null : (
        <QuickActionButton
          action={moderateReviewAction.bind(null, review.id, "APPROVED")}
          label={review.status === "REJECTED" ? "Publier finalement" : "Approuver"}
          pendingLabel="Publication…"
          icon={<Check aria-hidden="true" />}
          variant="primary"
        />
      )}
      {review.status === "REJECTED" ? null : (
        <QuickActionButton
          action={moderateReviewAction.bind(null, review.id, "REJECTED")}
          label={review.status === "APPROVED" ? "Retirer du site" : "Rejeter"}
          pendingLabel="Refus…"
          icon={review.status === "APPROVED" ? <Undo2 aria-hidden="true" /> : <X aria-hidden="true" />}
          variant="outline"
        />
      )}
      <ConfirmDeleteButton
        action={deleteReviewAction.bind(null, review.id)}
        hiddenFields={{ stay: "1" }}
        label={`Supprimer l'avis de ${review.authorName}`}
        title="Supprimer cet avis ?"
        description={`L'avis de ${review.authorName} est supprimé définitivement${review.status === "APPROVED" ? " et disparaît du site" : ""}. Pour simplement le cacher, rejetez-le plutôt.`}
        variant="ghost"
        iconOnly
      />
    </>
  );
}
