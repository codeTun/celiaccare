import { ExternalLink, Package, Pencil, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { StatusBadge } from "@/components/admin/status-badge";
import { RatingStars } from "@/components/ui/rating-stars";
import { formatDateTime, formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AdminReviewListRow } from "@/models/fetchers/admin/reviews";

import { adminSheetPath, publicSheetPath, SHEET_TYPE_LABELS } from "./labels";

/**
 * One review to moderate: stars, author, comment, the product or restaurant it is about
 * (with links) and the moderation buttons given by the page (`actions`, bound on the server).
 */
export function ReviewCard({ review, now, actions }: { review: AdminReviewListRow; now: Date; actions: ReactNode }) {
  const target = review.target;
  const TargetIcon = target?.type === "RESTAURANT" ? UtensilsCrossed : Package;

  return (
    <article
      aria-label={`Avis de ${review.authorName}`}
      className={cn(
        "flex flex-col rounded-[var(--radius-card)] border bg-white shadow-soft",
        review.status === "PENDING" ? "border-amber-200" : "border-line",
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-3 px-5 pt-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <RatingStars value={review.rating} label={`${review.rating} sur 5`} size="md" />
            <span className="text-sm font-bold text-ink tabular">{review.rating}/5</span>
          </div>
          <p className="mt-1 text-sm">
            <span className="font-semibold break-words text-ink">{review.authorName}</span>
            <span className="text-ink-subtle">
              {" · "}
              <time dateTime={review.createdAt} title={formatDateTime(review.createdAt)}>
                {formatRelative(review.createdAt, "fr", now)}
              </time>
            </span>
          </p>
        </div>
        <StatusBadge kind="review" status={review.status} />
      </header>

      {/* The visitor's text, shown as plain text (React escapes it). */}
      <p className="flex-1 px-5 py-3 text-[15px] leading-relaxed break-words whitespace-pre-line text-ink">{review.comment}</p>

      <div className="mx-5 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl bg-canvas px-3 py-2 text-xs">
        {target ? (
          <>
            <span className="inline-flex min-w-0 items-center gap-1.5 text-ink-muted">
              <TargetIcon className="size-3.5 shrink-0" aria-hidden="true" />
              {SHEET_TYPE_LABELS[target.type]} :<span className="truncate font-semibold text-ink">{target.name}</span>
            </span>
            {target.isActive ? (
              <a
                href={publicSheetPath(target.type, target.slug)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-brand-700 hover:underline"
              >
                <ExternalLink className="size-3.5" aria-hidden="true" />
                Voir la fiche
                <span className="sr-only">(nouvel onglet)</span>
              </a>
            ) : (
              <span className="text-ink-subtle">Fiche masquée du site</span>
            )}
            <Link
              href={adminSheetPath(target.type, target.id)}
              className="inline-flex items-center gap-1 font-semibold text-brand-700 hover:underline"
            >
              <Pencil className="size-3.5" aria-hidden="true" />
              Modifier
            </Link>
          </>
        ) : (
          <span className="text-ink-subtle">Fiche supprimée</span>
        )}
      </div>

      <footer className="flex flex-wrap items-start gap-2 px-5 py-4">
        {actions}
        {review.moderatedAt ? (
          <p className="ms-auto self-center text-xs text-ink-subtle">Modéré le {formatDateTime(review.moderatedAt)}</p>
        ) : null}
      </footer>
    </article>
  );
}
