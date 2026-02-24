"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/user";

const schema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  source: z.string().optional().or(z.literal("")),
});

export async function createContact(fd: FormData): Promise<{ ok: true; contactId: string } | { ok: false; error: string }> {
  try {
    const userId = await requireUserId();
    const data = schema.parse({
      firstName: fd.get("firstName"),
      lastName: fd.get("lastName"),
      email: fd.get("email"),
      phone: fd.get("phone"),
      source: fd.get("source"),
    });

    const c = await prisma.contact.create({
      data: {
        ownerUserId: userId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email || null,
        phone: data.phone || null,
        source: data.source || null,
      },
      select: { id: true },
    });

    await prisma.auditEvent.create({
      data: { userId, eventType: "crm.contact_created", payload: JSON.stringify({ contactId: c.id }) },
    });

    return { ok: true, contactId: c.id };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to create contact";
    return { ok: false, error: msg };
  }
}
