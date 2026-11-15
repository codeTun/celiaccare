import "server-only";

import { db } from "@/lib/prisma";
import type { MessageTopic } from "@/types";

export type CreateContactMessageInput = {
  name: string;
  email: string | null;
  phone: string | null;
  topic: MessageTopic;
  subject: string;
  message: string;
  /** Hashed IP of the visitor (getIpHash()), never the IP itself. */
  ipHash: string | null;
};

/**
 * Saves a message of the contact form (also used for "Proposer une adresse", EF-21).
 * It appears as NEW in the admin panel. The Server Action validates the form first.
 */
export async function createContactMessage(input: CreateContactMessageInput): Promise<{ id: number }> {
  const row = await db.orm.public.ContactMessage.select("id").create({
    name: input.name,
    email: input.email,
    phone: input.phone,
    topic: input.topic,
    subject: input.subject,
    message: input.message,
    status: "NEW",
    ipHash: input.ipHash,
  });
  return { id: row.id };
}
