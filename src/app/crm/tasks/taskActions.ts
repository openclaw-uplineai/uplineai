"use server";

import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/user";

const schema = z.object({ taskId: z.string().uuid() });

export async function completeTask(input: z.infer<typeof schema>) {
  const userId = await requireUserId();
  const data = schema.parse(input);

  const task = await prisma.task.findFirst({
    where: { id: data.taskId, ownerUserId: userId },
    select: { id: true },
  });
  if (!task) throw new Error("Task not found");

  await prisma.task.update({
    where: { id: data.taskId },
    data: { status: "done", completedAt: new Date() },
  });

  await prisma.auditEvent.create({
    data: { userId, eventType: "task.completed", payload: JSON.stringify({ taskId: data.taskId }) },
  });
}
