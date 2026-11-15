// Server Component only: it binds the Server Action for the form (see review-form.tsx).
import "server-only";

import { MessageSquareText, PenLine, ShieldCheck } from "lucide-react";

import { submitReview } from "@/app/[lang]/actions";
import { buttonStyles } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { RatingStars } from "@/components/ui/rating-stars";
import { interpolate } from "@/i18n/interpolate";
import type { CommonDict } from "@/i18n/resources/fr/common";
import type { CommunityDict } from "@/i18n/resources/fr/community";
import { formatDate, formatRating } from "@/lib/format";
import { pluralize } from "@/lib/utils";
import type { Locale, ReviewDTO } from "@/types";

import { ReviewForm } from "./review-form";

export type ReviewsSectionProps = {
  locale: Locale;
  /** What the reviews are about (the name is used in the texts) */
  target: { type: "PRODUCT" | "RESTAURANT"; id: number; name: string };
  /** Approved reviews, newest first (the fetchers return the 20 latest) */
  reviews: ReviewDTO[];
  /** Average of ALL approved reviews (null when there is none) */
  ratingAvg: number | null;
  /** Number of ALL approved reviews */
  ratingCount: number;
  dict: CommunityDict;
  common: CommonDict;
};

/**
 * "Avis" block of a product or restaurant sheet (EF-22): average rating, the approved
 * reviews and the "Donner mon avis" form (new reviews are moderated before publication).
 * Server Component. It has no outer margin: put it inside the page <Container>.
 * Anchor: link to "#avis" to scroll to it.
 *
 * @example
 * <ReviewsSection
 *   locale={lang}
 *   target={{ type: "PRODUCT", id: product.id, name: product.name }}
 *   reviews={product.reviews}
 *   ratingAvg={product.ratingAvg}
 *   ratingCount={product.ratingCount}
 *   dict={dict.community}
 *   common={dict.common}
 * />
 */
export function ReviewsSection({ locale, target, reviews, ratingAvg, ratingCount, dict, common }: ReviewsSectionProps) {
  const t = dict.reviews;
  const hasRating = ratingAvg !== null && ratingCount > 0;

  return (
    <section id="avis" aria-labelledby="avis-title" className="scroll-mt-24">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,25rem)] lg:gap-12 xl:gap-16">
        {/* Left: title, average and the published reviews */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <p className="mb-2 flex items-center gap-2.5 text-xs font-bold tracking-[0.14em] text-brand-700 uppercase rtl:tracking-normal">
                {/* two door studs, as on the page headers */}
                <span aria-hidden="true" className="studs h-1.5 w-6 shrink-0" />
                {t.eyebrow}
              </p>
              <h2 id="avis-title" className="text-2xl font-extrabold text-ink sm:text-3xl">
                {t.title}
              </h2>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">{t.description}</p>
            </div>
            {/* On small screens the form is below the list: a shortcut to it */}
            <a href="#avis-form" className={buttonStyles({ variant: "secondary", size: "sm", className: "lg:hidden" })}>
              <PenLine aria-hidden="true" />
              {t.writeReview}
            </a>
          </div>

          {hasRating ? (
            <RatingSummary
              average={ratingAvg}
              count={ratingCount}
              locale={locale}
              dict={dict}
              common={common}
            />
          ) : null}

          {reviews.length > 0 ? (
            <>
              <ul
                aria-label={interpolate(t.listLabel, { name: target.name })}
                className="mt-6 divide-y divide-line border-y border-line"
              >
                {reviews.map((review) => (
                  <li key={review.id}>
                    <ReviewItem review={review} locale={locale} common={common} />
                  </li>
                ))}
              </ul>
              {ratingCount > reviews.length ? (
                <p className="mt-3 text-xs text-ink-subtle">{interpolate(t.latestShown, { shown: reviews.length })}</p>
              ) : null}
            </>
          ) : (
            <EmptyState
              className="mt-6"
              icon={<MessageSquareText />}
              title={common.labels.noReviews}
              description={interpolate(t.noReviewsText, { name: target.name })}
            />
          )}
        </div>

        {/* Right (below on mobile): the form */}
        <div id="avis-form" className="scroll-mt-24">
          <div className="rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-soft sm:p-6 lg:sticky lg:top-24">
            <h3 className="text-lg font-bold text-ink">{dict.reviewForm.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-ink-muted">
              {interpolate(dict.reviewForm.description, { name: target.name })}
            </p>
            <ReviewForm
              className="mt-5"
              action={submitReview.bind(null, locale, { type: target.type, id: target.id })}
              labels={dict.reviewForm}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/** Big average ("4,6 sur 5"), stars, number of reviews and the moderation promise. */
function RatingSummary({
  average,
  count,
  locale,
  dict,
  common,
}: {
  average: number;
  count: number;
  locale: Locale;
  dict: CommunityDict;
  common: CommonDict;
}) {
  const averageText = formatRating(average, locale);
  return (
    <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-4 rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-soft sm:p-6">
      <div className="flex items-center gap-4">
        {/* Hidden from screen readers: the stars next to it already say "4,6 sur 5". */}
        <p aria-hidden="true" className="flex items-baseline gap-1.5">
          <span className="text-5xl leading-none font-extrabold tracking-tight text-ink tabular">{averageText}</span>
          <span className="text-sm font-semibold text-ink-subtle">{dict.reviews.outOf}</span>
        </p>
        <div className="flex flex-col gap-1">
          <RatingStars value={average} size="md" label={interpolate(common.labels.rating, { rating: averageText })} />
          <p className="text-sm text-ink-muted tabular">{pluralize(locale, count, dict.reviews.count)}</p>
        </div>
      </div>
      <p className="flex items-center gap-2 text-sm text-ink-muted sm:ms-auto">
        <ShieldCheck className="size-4 shrink-0 text-brand-600" aria-hidden="true" />
        {dict.reviews.moderated}
      </p>
    </div>
  );
}

/** One published review: initial, name, stars, date and comment. */
function ReviewItem({ review, locale, common }: { review: ReviewDTO; locale: Locale; common: CommonDict }) {
  const name = publicName(review.authorName);
  return (
    <article className="flex gap-3.5 py-5">
      <span
        aria-hidden="true"
        className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-50 text-sm font-bold text-brand-700 ring-1 ring-brand-100"
      >
        {Array.from(name)[0] ?? "?"}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <p dir="auto" className="font-semibold text-ink">
            {name}
          </p>
          <RatingStars value={review.rating} label={interpolate(common.labels.rating, { rating: review.rating })} />
        </div>
        <time dateTime={review.createdAt} className="text-xs text-ink-subtle">
          {formatDate(review.createdAt, locale)}
        </time>
        {/* dir="auto": a review written in Arabic reads right-to-left even on the French page */}
        <p dir="auto" className="mt-2 text-[15px] leading-relaxed whitespace-pre-line text-ink-muted wrap-break-word">
          {review.comment}
        </p>
      </div>
    </article>
  );
}

/** "Sana Ben Salah" -> "Sana B.": we only show the first name and an initial (privacy). */
function publicName(authorName: string) {
  const words = authorName.trim().split(/\s+/);
  if (words.length < 2) return words[0] ?? "";
  const lastNameInitial = Array.from(words[1])[0] ?? "";
  return `${words[0]} ${lastNameInitial.toLocaleUpperCase()}.`;
}
