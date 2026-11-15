import { ArrowLeft, Mail, MessageCircle, Phone, Reply } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { MESSAGE_TOPIC_LABELS } from "@/components/admin/community/labels";
import { MarkMessageOpened } from "@/components/admin/community/mark-message-opened";
import { MessageFollowUpForm } from "@/components/admin/community/message-follow-up-form";
import { AdminDetailSkeleton } from "@/components/admin/community/skeletons";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { FlashMessage } from "@/components/admin/flash-message";
import { FormSection } from "@/components/admin/form-section";
import { StatusBadge } from "@/components/admin/status-badge";
import { displayPhone, telHref, whatsappHref } from "@/components/directory/links";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/session";
import { formatDateTime, formatRelative } from "@/lib/format";
import { siteConfig } from "@/lib/site-config";
import { idSchema } from "@/lib/validators";
import { getMessage } from "@/models/fetchers/admin/messages";
import type { AdminMessageDetail } from "@/types/admin-data";

import { deleteMessageAction, markMessageOpenedAction, updateMessageAction } from "../actions";

export const metadata: Metadata = { title: "Message" };

/** A plain address only: nothing that could add other "mailto:" fields (?cc=, &bcc=...). */
const SAFE_EMAIL = /^[^\s@?&#/\\]+@[^\s@?&#/\\]+\.[^\s@?&#/\\]+$/;

/** /admin/messages/[id] — read a message, answer the sender, follow it up. */
export default function MessagePage({ params }: PageProps<"/admin/messages/[id]">) {
  return (
    <>
      <AdminPageHeader
        title="Message"
        description="Lisez le message, répondez par e-mail, téléphone ou WhatsApp, puis indiquez où vous en êtes."
        breadcrumbs={[
          { label: "Tableau de bord", href: "/admin" },
          { label: "Messages", href: "/admin/messages" },
          { label: "Message" },
        ]}
        actions={
          <Link href="/admin/messages" className={buttonStyles({ variant: "outline", size: "sm" })}>
            <ArrowLeft className="rtl:rotate-180" aria-hidden="true" />
            Tous les messages
          </Link>
        }
      />
      <FlashMessage messages={{ updated: "Le suivi du message a été enregistré." }} />
      <Suspense fallback={<AdminDetailSkeleton />}>
        <MessageDetail params={params} />
      </Suspense>
    </>
  );
}

async function MessageDetail({ params }: Pick<PageProps<"/admin/messages/[id]">, "params">) {
  await requireAdmin();
  const id = idSchema.safeParse((await params).id);
  if (!id.success) notFound();
  const message = await getMessage(id.data);
  if (!message) notFound();
  const now = new Date(); // request time (after the session check)

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
      {/* A NEW message becomes "En cours" as soon as it is read here. */}
      {message.status === "NEW" ? <MarkMessageOpened action={markMessageOpenedAction.bind(null, message.id)} /> : null}

      <article className="min-w-0 rounded-[var(--radius-card)] border border-line bg-white shadow-soft">
        <header className="border-b border-line px-5 py-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={message.topic === "PARTNERSHIP" ? "saffron" : "neutral"}>{MESSAGE_TOPIC_LABELS[message.topic]}</Badge>
            <StatusBadge kind="message" status={message.status} />
          </div>
          <h2 className="mt-2 text-xl font-bold break-words text-ink">{message.subject}</h2>
          <p className="mt-1 text-sm text-ink-muted">
            De <span className="font-semibold text-ink">{message.name}</span> · reçu {formatRelative(message.createdAt, "fr", now)}
            <span className="text-ink-subtle tabular"> ({formatDateTime(message.createdAt)})</span>
          </p>
        </header>
        <div className="px-5 py-5 sm:px-6">
          {/* The visitor's text, shown as plain text (React escapes it). */}
          <p className="text-[15px] leading-relaxed break-words whitespace-pre-wrap text-ink">{message.message}</p>
        </div>
        {message.handledAt || message.adminNote ? (
          <footer className="space-y-2 border-t border-line bg-canvas/50 px-5 py-4 text-sm sm:px-6">
            {message.handledAt ? (
              <p className="text-ink-muted">
                Traité le <span className="font-semibold text-ink tabular">{formatDateTime(message.handledAt)}</span>
              </p>
            ) : null}
            {message.adminNote ? (
              <div>
                <p className="text-xs font-bold tracking-[0.08em] text-ink-subtle uppercase">Note interne</p>
                <p className="mt-1 break-words whitespace-pre-wrap text-ink-muted">{message.adminNote}</p>
              </div>
            ) : null}
          </footer>
        ) : null}
      </article>

      <aside className="min-w-0 space-y-6" aria-label="Expéditeur et suivi">
        <SenderCard message={message} />

        <FormSection id="suivi" title="Suivi" description="Où en est la demande. La note n'est jamais visible par l'expéditeur.">
          <MessageFollowUpForm
            // A new status from the server (e.g. "En cours" after opening) resets the form.
            key={`${message.status}-${message.updatedAt}`}
            action={updateMessageAction.bind(null, message.id)}
            status={message.status}
            adminNote={message.adminNote}
          />
        </FormSection>

        <div className="flex flex-col gap-2 rounded-[var(--radius-card)] border border-dashed border-line-strong bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-ink-muted">Spam ou doublon ?</p>
          <ConfirmDeleteButton
            action={deleteMessageAction.bind(null, message.id)}
            label="Supprimer le message"
            title="Supprimer ce message ?"
            description={`« ${message.subject} », envoyé par ${message.name}. Cette action est définitive : pour le garder, archivez-le plutôt.`}
          />
        </div>
      </aside>
    </div>
  );
}

/** Who wrote, and one-click ways to answer (e-mail with "Re: <subject>", call, WhatsApp). */
function SenderCard({ message }: { message: AdminMessageDetail }) {
  const greeting = `Bonjour ${message.name},`;
  const emailHref =
    message.email && SAFE_EMAIL.test(message.email)
      ? `mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject}`)}&body=${encodeURIComponent(
          `${greeting}\n\n\n\nCordialement,\nL'équipe ${siteConfig.name}`,
        )}`
      : null;
  const whatsappText = encodeURIComponent(`${greeting} nous avons bien reçu votre message « ${message.subject} ». `);

  return (
    <FormSection id="expediteur" title="Expéditeur" description="Répondez avec le moyen de contact laissé par la personne.">
      <div className="space-y-4">
        <p className="text-base font-semibold break-words text-ink">{message.name}</p>

        {message.email ? (
          <div className="space-y-2">
            <p className="flex items-center gap-2 text-sm break-all text-ink-muted">
              <Mail className="size-4 shrink-0 text-ink-subtle" aria-hidden="true" />
              {message.email}
            </p>
            {emailHref ? (
              <a href={emailHref} className={buttonStyles({ size: "sm", className: "w-full" })}>
                <Reply aria-hidden="true" />
                Répondre par e-mail
              </a>
            ) : null}
          </div>
        ) : null}

        {message.phone ? (
          <div className="space-y-2">
            <p className="flex items-center gap-2 text-sm text-ink-muted">
              <Phone className="size-4 shrink-0 text-ink-subtle" aria-hidden="true" />
              <span dir="ltr" className="tabular">
                {displayPhone(message.phone)}
              </span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              <a href={telHref(message.phone)} className={buttonStyles({ variant: "outline", size: "sm" })}>
                <Phone aria-hidden="true" />
                Appeler
              </a>
              <a
                href={`${whatsappHref(message.phone)}?text=${whatsappText}`}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonStyles({ variant: "outline", size: "sm" })}
              >
                <MessageCircle aria-hidden="true" />
                WhatsApp
              </a>
            </div>
          </div>
        ) : null}

        {!message.email && !message.phone ? (
          <p className="text-sm text-ink-subtle">Aucun moyen de contact n&apos;a été laissé.</p>
        ) : null}
      </div>
    </FormSection>
  );
}
