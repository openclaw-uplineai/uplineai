"use server";

import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/user";

const schema = z.object({
  contactId: z.string().uuid(),
  title: z.string().min(1),
});

export async function addContactTask(
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

    await prisma.task.create({
      data: {
        ownerUserId: userId,
        relatedContactId: data.contactId,
        title: data.title,
      },
    });

    await prisma.auditEvent.create({
      data: { userId, eventType: "crm.task_added", payload: JSON.stringify({ contactId: data.contactId }) },
    });

    return { ok: true };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to add task";
    return { ok: false, error: msg };
  }
}
