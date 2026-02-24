"use server";

import { z } from "zod";
import { compare } from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function login(fd: FormData): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const data = schema.parse({
      email: fd.get("email"),
      password: fd.get("password"),
    });

    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) return { ok: false, error: "Invalid email or password" };

    const ok = await compare(data.password, user.passwordHash);
    if (!ok) return { ok: false, error: "Invalid email or password" };

    const session = await getSession();
    session.userId = user.id;
    await session.save();

    await prisma.auditEvent.create({
      data: { userId: user.id, eventType: "user.login", payload: null },
    });

    return { ok: true };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Login failed";
    return { ok: false, error: msg };
  }
}
