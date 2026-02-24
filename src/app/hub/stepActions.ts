"use server";

import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/user";
import { CA_LIFE_STEPS } from "@/lib/licensingSteps";

const schema = z.object({
  stepKey: z.string().min(1),
  status: z.enum(["not_started", "in_progress", "done", "blocked"]),
});

export async function updateStepStatus(input: z.infer<typeof schema>) {
  const userId = await requireUserId();
  const data = schema.parse(input);

  const now = new Date();

  await prisma.licensingStepStatus.upsert({
    where: { userId_stepKey: { userId, stepKey: data.stepKey } },
    create: {
      userId,
      stepKey: data.stepKey,
      status: data.status,
      completedAt: data.status === "done" ? now : null,
    },
    update: {
      status: data.status,
      completedAt: data.status === "done" ? now : null,
    },
  });

  // Recompute next step + percent
  const statuses = await prisma.licensingStepStatus.findMany({ where: { userId } });
  const statusByKey = new Map(statuses.map((s) => [s.stepKey, s.status] as const));

  const next = CA_LIFE_STEPS.find((s) => statusByKey.get(s.key) !== "done")?.key ?? null;
  const doneCount = statuses.filter((s) => s.status === "done").length;
  const percent = CA_LIFE_STEPS.length ? Math.round((doneCount / CA_LIFE_STEPS.length) * 100) : 0;

  await prisma.licensingProgress.upsert({
    where: { userId },
    create: {
      userId,
      currentStepKey: next,
      nextStepKey: next,
      percentComplete: percent,
    },
    update: {
      currentStepKey: next,
      nextStepKey: next,
      percentComplete: percent,
    },
  });

  await prisma.auditEvent.create({
    data: {
      userId,
      eventType: "licensing.step_status_updated",
      payload: JSON.stringify({ stepKey: data.stepKey, status: data.status }),
    },
  });
}
