"use server";

import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/user";
import { CA_LIFE_STEPS } from "@/lib/licensingSteps";

const saveSchema = z.object({
  tier: z.enum(["DIY_FREE", "CONCIERGE_200_PLUS_FEES", "INNER_CIRCLE_1500_INCL_FEES"]),
  partnerCodeEntered: z.string().optional(),
  partnerSiteAck: z.boolean(),
});

export async function saveOnboarding(input: z.infer<typeof saveSchema>): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const userId = await requireUserId();
    const data = saveSchema.parse(input);

    const partnerCodeNormalized = (data.partnerCodeEntered ?? "").trim();
    const partnerGatePassed = data.partnerSiteAck && partnerCodeNormalized.toLowerCase() === "uplineai";

    await prisma.profile.update({
      where: { userId },
      data: {
        tier: data.tier,
        partnerSiteAck: data.partnerSiteAck,
        partnerCodeEntered: partnerCodeNormalized || null,
        partnerGatePassedAt: partnerGatePassed ? new Date() : null,
        onboardingStatus: "complete",
      },
    });

    // Ensure step statuses exist
    const existing = await prisma.licensingStepStatus.findMany({
      where: { userId },
      select: { stepKey: true },
    });
    const existingKeys = new Set(existing.map((s) => s.stepKey));
    const missing = CA_LIFE_STEPS.filter((s) => !existingKeys.has(s.key));

    if (missing.length) {
      await prisma.licensingStepStatus.createMany({
        data: missing.map((s) => ({ userId, stepKey: s.key })),
      });
    }

    // Initialize progress if empty
    const progress = await prisma.licensingProgress.findUnique({ where: { userId } });
    if (!progress?.nextStepKey) {
      await prisma.licensingProgress.upsert({
        where: { userId },
        create: {
          userId,
          currentStepKey: CA_LIFE_STEPS[0]?.key,
          nextStepKey: CA_LIFE_STEPS[0]?.key,
          percentComplete: 0,
        },
        update: {
          currentStepKey: progress?.currentStepKey ?? CA_LIFE_STEPS[0]?.key,
          nextStepKey: progress?.nextStepKey ?? CA_LIFE_STEPS[0]?.key,
        },
      });
    }

    await prisma.auditEvent.create({
      data: {
        userId,
        eventType: "onboarding.saved",
        payload: JSON.stringify({ tier: data.tier, partnerGatePassed }),
      },
    });

    return { ok: true };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to save onboarding";
    return { ok: false, error: msg };
  }
}

const tierReqSchema = z.object({
  requestedTier: z.enum(["CONCIERGE_200_PLUS_FEES", "INNER_CIRCLE_1500_INCL_FEES"]),
  phone: z.string().optional(),
  bestTime: z.string().optional(),
  notes: z.string().optional(),
});

export async function submitTierRequest(
  input: z.infer<typeof tierReqSchema>
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const userId = await requireUserId();
    const data = tierReqSchema.parse(input);

    await prisma.tierRequest.create({
      data: {
        userId,
        requestedTier: data.requestedTier,
        phone: data.phone?.trim() || null,
        bestTime: data.bestTime?.trim() || null,
        notes: data.notes?.trim() || null,
      },
    });

    // Internal follow-up task (owned by the user for Sprint 1)
    await prisma.task.create({
      data: {
        ownerUserId: userId,
        title:
          data.requestedTier === "CONCIERGE_200_PLUS_FEES"
            ? "Follow up: Concierge request"
            : "Follow up: Inner Circle request",
        description: [
          data.phone ? `Phone: ${data.phone}` : null,
          data.bestTime ? `Best time: ${data.bestTime}` : null,
          data.notes ? `Notes: ${data.notes}` : null,
        ]
          .filter(Boolean)
          .join("\n"),
        priority: "high",
      },
    });

    await prisma.auditEvent.create({
      data: {
        userId,
        eventType: "tier.requested",
        payload: JSON.stringify(data),
      },
    });

    return { ok: true };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to submit request";
    return { ok: false, error: msg };
  }
}
