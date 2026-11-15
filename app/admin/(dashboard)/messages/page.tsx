import { ChevronRight, Inbox } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { z } from "zod";

import { AdminEmpty } from "@/components/admin/admin-empty";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { MESSAGE_TOPIC_LABELS } from "@/components/admin/community/labels";
import { QueryReset } from "@/components/admin/community/query-reset";
import { QuerySelect } from "@/components/admin/community/query-select";
import { AdminListSkeleton } from "@/components/admin/community/skeletons";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { DataTable, EmptyTableRow, Tbody, Td, Th, Thead, Tr } from "@/components/admin/data-table";
import { FilterTabs } from "@/components/admin/filter-tabs";
import { FlashMessage } from "@/components/admin/flash-message";
import { firstParam, type AdminQuery } from "@/components/admin/query-string";
import { SearchForm } from "@/components/admin/search-form";
import { StatusBadge } from "@/components/admin/status-badge";
import { displayPhone } from "@/components/directory/links";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/session";
import { formatDateTime, formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import { countMessagesByStatus, listMessages } from "@/models/fetchers/admin/messages";
import { MESSAGE_STATUSES, MESSAGE_TOPICS } from "@/types";
import type { AdminMessageRow } from "@/types/admin-data";

import { deleteMessageAction } from "./actions";

export const metadata: Metadata = { title: "Messages" };

const BASE_PATH = "/admin/messages";

/** The filters of the URL, checked: a wrong value is simply ignored. */
const listQuerySchema = z.object({
  status: z.enum(MESSAGE_STATUSES).optional().catch(undefined),
  topic: z.enum(MESSAGE_TOPICS).optional().catch(undefined),
  q: z.string().trim().max(100).optional().catch(undefined),
  page: z.coerce.number().int().min(1).max(10_000).catch(1),
});

/** /admin/messages — the inbox of the contact form ("clients that contact us"). */
export default function MessagesPage({ searchParams }: PageProps<"/admin/messages">) {
  return (
    <>
      <AdminPageHeader
        title="Messages"
        description="Les messages envoyés depuis le formulaire de contact : questions, partenariats, commandes, adresses proposées… Les nouveaux sont en gras."
        breadcrumbs={[{ label: "Tableau de bord", href: "/admin" }, { label: "Messages" }]}
      />
      <FlashMessage messages={{ deleted: "Le message a été supprimé." }} />
      <Suspense fallback={<AdminListSkeleton />}>
        <MessagesInbox searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function MessagesInbox({ searchParams }: Pick<PageProps<"/admin/messages">, "searchParams">) {
  await requireAdmin();
  const query: AdminQuery = await searchParams;
  const filters = listQuerySchema.parse({
    status: firstParam(query.status),
    topic: firstParam(query.topic),
    q: firstParam(query.q),
    page: firstParam(query.page),
  });

  const [messages, counts] = await Promise.all([
    listMessages({ status: filters.status, topic: filters.topic, q: filters.q || undefined, page: filters.page }),
    countMessagesByStatus(),
  ]);
  const now = new Date(); // request time (after the session check)

  if (counts.total === 0) {
    return (
      <AdminEmpty
        icon={<Inbox />}
        title="Aucun message pour l'instant"
        description="Les messages envoyés depuis la page Contact du site apparaîtront ici."
      />
    );
  }

  const isFiltered = Boolean(filters.status || filters.topic || filters.q);

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <FilterTabs
          basePath={BASE_PATH}
          query={query}
          label="Filtrer par statut"
          tabs={[
            { value: "", label: "Tous", count: counts.total },
            { value: "NEW", label: "Nouveaux", count: counts.NEW },
            { value: "IN_PROGRESS", label: "En cours", count: counts.IN_PROGRESS },
            { value: "RESOLVED", label: "Traités", count: counts.RESOLVED },
            { value: "ARCHIVED", label: "Archivés", count: counts.ARCHIVED },
          ]}
        />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <QuerySelect
            basePath={BASE_PATH}
            query={query}
            name="topic"
            label="Sujet"
            options={MESSAGE_TOPIC_LABELS}
            placeholder="Tous les sujets"
          />
          <SearchForm basePath={BASE_PATH} query={query} placeholder="Nom, e-mail, téléphone, objet…" className="sm:w-80" />
        </div>
      </div>
      {isFiltered ? <QueryReset href={BASE_PATH} total={messages.total} /> : null}

      <DataTable caption="Messages reçus" tableClassName="min-w-[60rem]">
        <Thead>
          <Th>Expéditeur</Th>
          <Th>Message</Th>
          <Th>Reçu</Th>
          <Th>Statut</Th>
          <Th align="end">
            <span className="sr-only">Actions</span>
          </Th>
        </Thead>
        <Tbody>
          {messages.items.length === 0 ? (
            <EmptyTableRow
              colSpan={5}
              icon={<Inbox />}
              title="Aucun message ne correspond"
              description={
                filters.status === "NEW" && !filters.topic && !filters.q
                  ? "Tous les messages ont été lus. Bravo !"
                  : "Modifiez la recherche ou les filtres."
              }
            />
          ) : (
            messages.items.map((message) => <MessageRow key={message.id} message={message} now={now} />)
          )}
        </Tbody>
      </DataTable>
      <AdminPagination basePath={BASE_PATH} query={query} {...messages} />
    </>
  );
}

function MessageRow({ message, now }: { message: AdminMessageRow; now: Date }) {
  const isNew = message.status === "NEW";
  const href = `${BASE_PATH}/${message.id}`;
  return (
    <Tr className={cn(isNew && "bg-amber-50/40")}>
      <Td className="w-64 max-w-64">
        <div className="flex items-start gap-2.5">
          <span
            className={cn("mt-1.5 size-2 shrink-0 rounded-full", isNew ? "bg-brand-600" : "bg-transparent")}
            aria-hidden="true"
          />
          <div className="min-w-0">
            <p className={cn("truncate text-ink", isNew ? "font-bold" : "font-medium")}>
              {isNew ? <span className="sr-only">Nouveau : </span> : null}
              {message.name}
            </p>
            {message.email ? <p className="truncate text-xs text-ink-subtle">{message.email}</p> : null}
            {message.phone ? (
              <p className="text-xs text-ink-subtle tabular">
                <span dir="ltr">{displayPhone(message.phone)}</span>
              </p>
            ) : null}
          </div>
        </div>
      </Td>
      <Td className="max-w-[34rem]">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={message.topic === "PARTNERSHIP" ? "saffron" : "neutral"}>{MESSAGE_TOPIC_LABELS[message.topic]}</Badge>
          <Link href={href} className={cn("text-ink hover:text-brand-700 hover:underline", isNew ? "font-bold" : "font-semibold")}>
            {message.subject}
          </Link>
        </div>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed">{message.excerpt}</p>
      </Td>
      <Td className="whitespace-nowrap">
        <span className={cn(isNew && "font-semibold text-ink")}>{formatRelative(message.createdAt, "fr", now)}</span>
        <span className="block text-xs text-ink-subtle tabular">{formatDateTime(message.createdAt)}</span>
      </Td>
      <Td>
        <StatusBadge kind="message" status={message.status} />
      </Td>
      <Td align="end">
        <div className="flex items-center justify-end gap-1">
          <Link href={href} className={buttonStyles({ variant: "ghost", size: "sm" })}>
            Ouvrir
            <ChevronRight className="rtl:rotate-180" aria-hidden="true" />
            <span className="sr-only">le message de {message.name}</span>
          </Link>
          <ConfirmDeleteButton
            action={deleteMessageAction.bind(null, message.id)}
            hiddenFields={{ stay: "1" }}
            label={`Supprimer le message de ${message.name}`}
            title="Supprimer ce message ?"
            description={`« ${message.subject} », envoyé par ${message.name}. Pour le garder sans l'avoir sous les yeux, archivez-le plutôt.`}
            variant="ghost"
            iconOnly
          />
        </div>
      </Td>
    </Tr>
  );
}
