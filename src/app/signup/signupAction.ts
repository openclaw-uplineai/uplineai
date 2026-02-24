"use server";

import { z } from "zod";
import { hash } from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const schema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function signup(fd: FormData): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const data = schema.parse({
      firstName: fd.get("firstName"),
      lastName: fd.get("lastName"),
      email: fd.get("email"),
      password: fd.get("password"),
    });

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) return { ok: false, error: "Email already in use" };

    const passwordHash = await hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        profile: { create: {} },
        licensingProgress: { create: {} },
      },
      select: { id: true },
    });

    // Auto-login
    const session = await getSession();
    session.userId = user.id;
    await session.save();

    await prisma.auditEvent.create({
      data: { userId: user.id, eventType: "user.signup", payload: null },
    });

    return { ok: true };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Signup failed";
    return { ok: false, error: msg };
  }
}
