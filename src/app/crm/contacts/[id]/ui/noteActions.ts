"use server";

import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/user";

const schema = z.object({
  contactId: z.string().uuid(),
  body: z.string().min(1),
});

export async function addContactNote(
  input: z.infer<typeof schema>
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const userId = await requireUserId();
    const data = schema.parse(input);

    const contact = await prisma.contact.findFirst({
      where: { id: data.contactId, ownerUserId: userId },
      select: { id: true },
    });
    if (!contact) return { ok: false, error: "Contact not found" };

    await prisma.contactNote.create({
      data: {
        contactId: data.contactId,
        ownerUserId: userId,
        body: data.body,
      },
    });

    await prisma.auditEvent.create({
      data: { userId, eventType: "crm.note_added", payload: JSON.stringify({ contactId: data.contactId }) },
    });

    return { ok: true };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to add note";
    return { ok: false, error: msg };
  }
}
