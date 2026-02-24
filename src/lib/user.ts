import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function requireUserId() {
  const session = await getSession();
  const userId = session.userId;
  if (!userId) redirect("/login");
  return userId;
}

export async function getUserAndProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true, licensingProgress: true },
  });
}
